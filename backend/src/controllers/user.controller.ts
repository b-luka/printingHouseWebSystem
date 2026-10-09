import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import 'multer';
import jwt from 'jsonwebtoken';

export class UserController {
    public async register(req: Request, res: Response): Promise<void> {
        try {
            const {
                userType,
                username,
                password,
                firstname,
                lastname,
                phone,
                email,
                institutionName,
                headquartersAddress,
                city,
                registrationNumber,
                taxId
            } = req.body;

            // check if user or mail already exists
            const existingUser = await User.findOne({username: username});
            if (existingUser) {
                res.status(400).json({
                    message: "Username is already taken."
                })
                return;
            }

            const existingMail = await User.findOne({email: email});
            if (existingMail) {
                res.status(400).json({
                    message: "Email is already in use."
                })
                return;
            }

            // check password
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-])[a-zA-Z].{7,11}$/;
            if (!passwordRegex.test(password)) {
                res.status(400).json({
                    message: "Password must begin with a capital letter, contain at least 1 capital letter, 1 number, 1 special character and be of length 8-12"
                });
                return;
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // profile picture
            let profilePicture = undefined;
            if (req.file) {
                profilePicture = req.file.filename;
            }

            // create new user
            const newUser = new User({
                userType,
                username,
                password: hashedPassword,
                firstname,
                lastname,
                phone,
                email,
                profilePicture,
                institutionName,
                headquartersAddress,
                city,
                registrationNumber,
                taxId
            });

            await newUser.save();
            res.status(201).json({
                message: "Registration request has been successfully created and is awaiting approval."
            })

        } catch (error: any) {
            res.status(500).json({
                message: "Error during registrations.",
                error: error.message
            })
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        
        if (!user) {
            res.status(401).json({
                message: "Incorrect username or password."
            });
            return;
        }

        if (user.userType !== 'admin' && user.status !== 'approved') {
            res.status(403).json({
                message: "Your registration hasn't been approved. Current status: " + user.status + "."
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Incorrect username or password."
            });
            return;
        }

        // generate jwt token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        const userData: any = {
            _id: user._id,
            username: user.username,
            userType: user.userType,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            profilePicture: user.profilePicture
        };

        if (user.userType === 'printer' || user.userType === 'client_legal') {
            userData.institutionName = user.institutionName;
            userData.headquartersAddress = user.headquartersAddress;
            userData.city = user.city;
            userData.registrationNumber = user.registrationNumber;
            userData.taxId = user.taxId;
        }

        res.status(200).json({
            message: "Login successful.",
            token: token,
            user: userData
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Error during login.",
            error: error.message
        });
    }
}

    public async getPrintersCount(req: Request, res: Response): Promise<void> {
        try {
            const count = await User.countDocuments({ 
                userType: 'printer', 
                status: 'approved' 
            });

            res.status(200).json({ count });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error counting printers.',
                error: error.message
            });
        }
    }

    public async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const { 
                username, 
                firstname, 
                lastname, 
                email, 
                phone, 
                institutionName, 
                headquartersAddress, 
                city, 
                registrationNumber, 
                taxId 
            } = req.body;
            const user = await User.findOne({ username });

            if (!user) {
                res.status(404).json({ message: 'User not found.' });
                return;
            }

            if (firstname) user.firstname = firstname;
            if (lastname) user.lastname = lastname;
            if (email) user.email = email;
            if (phone) user.phone = phone;

            if (institutionName !== undefined) user.institutionName = institutionName;
            if (headquartersAddress !== undefined) user.headquartersAddress = headquartersAddress;  
            if (city !== undefined) user.city = city;
            if (registrationNumber !== undefined) user.registrationNumber = registrationNumber;
            if (taxId !== undefined) user.taxId = taxId;

            if (req.file) user.profilePicture = req.file.filename;

            await user.save();

            res.status(200).json({
                message: 'Profile updated successfully',
                user: user
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error updating profile.',
                error: error.message
            });
        }
    }
}