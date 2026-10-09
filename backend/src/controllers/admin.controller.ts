import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import User from '../models/user';
import Category from '../models/category'
import Order from '../models/order'
import Product from '../models/product'

export class AdminController {
    public async getPendingUsers(req: Request, res: Response): Promise<void> {
        try {
            const pendingUsers = await User.find({ status: 'pending' }).select('-password'); // exclude password from the response
            res.status(200).json(pendingUsers);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching pending users',
                error: error.message
            });
        }
    }

    public async updateUserStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['approved', 'rejected'].includes(status)) {
                res.status(400).json({
                    message: "Status must be 'approved' or 'rejected'."
                });
                return;
            }

            const user = await User.findByIdAndUpdate(id, { status: status }, { new: true }).select('-password');

            if (!user) {
                res.status(404).json({
                    message: 'User not found.'
                });
                return;
            }

            res.status(200).json({
                message: `User status successfully updated to '${status}'.`,
                user: user
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error updating user status.',
                error: error.message
            });
        }
    }

    public async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await User.find({}).select('-password'); // exclude password from the response
            res.status(200).json(users);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching users',
                error: error.message
            });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                res.status(404).json({ message: 'User not found!' });
                return;
            }

            if (user.profilePicture && user.profilePicture !== 'default_profile_image.jpg') {
                const oldImagePath = path.join(process.cwd(), 'uploads/profiles', user.profilePicture);
                    
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await user.deleteOne();
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error deleting user: ',
                error: error.message
            });
        }
    }

    public async updateUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { firstname, lastname, email, phone, removePicture } = req.body;
            
            const user = await User.findById(id);
            if (!user) {
                res.status(404).json({ message: 'User not found!' });
                return;
            }

            if (firstname) user.firstname = firstname;
            if (lastname) user.lastname = lastname;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (removePicture) {
                if (user.profilePicture && user.profilePicture !== 'default_profile_image.jpg') {
                    const oldImagePath = path.join(process.cwd(), 'uploads/profiles', user.profilePicture);
                    
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                
                user.profilePicture = 'default_profile_image.jpg'; 
            }

            await user.save();
            res.status(200).json({
                message: 'User updated successfully.',
                user: user
            });
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error updating user', 
                error: error.message 
            });
        }
    }

    public async addCategory(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            const existing = await Category.findOne({ name });

            if (existing) {
                res.status(400).json({ message: 'Category already exists!' });
                return;
            }

            const newCategory = new Category({ name: name, subcategories: [] });
            await newCategory.save();
            res.status(201).json({
                message: 'Category added successfully.',
                category: newCategory
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error adding category!',
                error: error.message
            });
        }
    }

    public async addSubcategory(req: Request, res: Response): Promise<void> {
        try {
            const { categoryName, subcategoryName } = req.body;
            const category = await Category.findOne({ name: categoryName });

            if (!category) {
                res.status(404).json({ message: 'Category not found!' });
                return;
            }

            if (category.subcategories.includes(subcategoryName)) {
                res.status(400).json({ message: 'Subcategory already exists in this category!' });
                return;
            }

            category.subcategories.push(subcategoryName);
            await category.save();
            res.status(200).json({
                message: 'Subcategory added successfully.',
                category: category
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error adding subcategory!',
                error: error.message
            });
        }
    }

    public async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await Category.find({});
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching categories',
                error: error.message
            });
        }
    }

    public async getTopPrinters(req: Request, res: Response): Promise<void> {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const stats = await Order.aggregate([
                { $match: { createdAt: { $gte: threeMonthsAgo }, status: { $ne: 'cancelled' } } },
                { $group: { _id: "$printerId", totalRevenue: { $sum: "$totalAmount" } } },
                { $sort: { totalRevenue: -1 } },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'printer' } },
                { $unwind: "$printer" },
                { $project: { 
                    printerName: { $cond: [ { $not: ["$printer.institutionName"] }, "$printer.username", "$printer.institutionName" ] }, 
                    totalRevenue: 1 
                }}
            ]);

            res.status(200).json(stats);
        } catch (error: any) {
            res.status(500).json({ message: 'Error loading stats.', error: error.message });
        }
    }

    public async getTopProducts(req: Request, res: Response): Promise<void> {
        try {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            const stats = await Order.aggregate([
                { $match: { createdAt: { $gte: oneMonthAgo }, status: { $ne: 'cancelled' } } },
                { $unwind: "$items" },
                { $group: { 
                    _id: "$items.productId", 
                    productName: { $first: "$items.productName" }, 
                    totalQuantity: { $sum: "$items.quantity" } 
                }},
                { $sort: { totalQuantity: -1 } },
                { $limit: 10 }
            ]);

            res.status(200).json(stats);
        } catch (error: any) {
            res.status(500).json({ message: 'Error loading stats.', error: error.message });
        }
    }

    /*
    public async getProductRatingHistory(req: Request, res: Response): Promise<void> {
        try {
            const products = await Product.find({}, 'name likes dislikes').limit(5); 
            const months = ['5 months ago', '4 months ago', '3 months ago', '2 months ago', 'Last month', 'This month'];
            
            const datasets = products.map(p => {
                const currentScore = (p.likes || 0) - (p.dislikes || 0);
                const history = months.map((_, i) => currentScore > 0 ? Math.max(0, currentScore - (5 - i) + Math.floor(Math.random() * 3)) : currentScore);
                
                return {
                    label: p.name,
                    data: history,
                    fill: false,
                    tension: 0.3
                };
            });

            res.status(200).json({ labels: months, datasets });
        } catch (error: any) {
            res.status(500).json({ message: 'Error loading stats.', error: error.message });
        }
    }
    */
}