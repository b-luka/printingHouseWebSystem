import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sizeOf from 'image-size';
import { UserController } from '../controllers/user.controller';
import user from '../models/user';
import { requireAuth } from '../middleware/auth.middleware';

const userRouter = express.Router();
const userController = new UserController();

// set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles';
        if (!fs.existsSync(dir)) {      // create the directory if it doesn't exist
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // generate a unique filename
    }
});

// filter for allowed formats
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and GIF formats are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// check image dimensions
const checkImageDimensions = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next();  // no file uploaded, skip dimension check and give default profile picture
    }

    try {
        const imageBuffer = fs.readFileSync(req.file.path);
        const dimensions = sizeOf(imageBuffer);
        if (
            dimensions.width < 100 || dimensions.height < 100 ||
            dimensions.width > 250 || dimensions.height > 250
        ) {
            fs.unlinkSync(req.file.path);
            res.status(400).json({
                message: "Profile picture must be between 100x100 and 250x250 pixels."
            });
            return;
        }
        next();
    } catch (error) {
        fs.unlinkSync(req.file.path);
        res.status(400).json({
            message: "Error while processing image."
        });
    }
};

// define the route for user registration
userRouter.post('/register', (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single('profilePicture');
    uploadSingle(req, res, (err: any) => {
        if (err) {
            res.status(400).json({
                message: err.message
            });
            return;
        }
        next();
    });
}, checkImageDimensions, (req: Request, res: Response) => {
    userController.register(req, res);
});

// define the route for user login
userRouter.post('/login', (req: Request, res: Response) => {
    userController.login(req, res);
});

// get route for number of printers
userRouter.get('/printers/count', (req: Request, res: Response) => {
    userController.getPrintersCount(req, res);
});

// put route for updating user profile
userRouter.put('/update', requireAuth, (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single('profilePicture');
    uploadSingle(req, res, (error: any) => {
        if (error) {
            res.status(400).json({
                message: error.message
            });
            return;
        }
        next();
    });
}, checkImageDimensions, (req: Request, res: Response) => {
    userController.updateProfile(req, res);
});

export default userRouter;