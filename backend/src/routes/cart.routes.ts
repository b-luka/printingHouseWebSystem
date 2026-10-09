import express, { Request, Response, NextFunction } from 'express';
import { CartController } from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth.middleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const cartRouter = express.Router();
const cartController = new CartController();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/custom_images';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

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

// get route for fetching entire user cart
cartRouter.get('/:userId', requireAuth, (req, res) => cartController.getCart(req, res));

// post route for adding item to cart
cartRouter.post('/:userId/add', requireAuth, (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single('customImage'); 
    
    uploadSingle(req, res, (err: any) => {
        if (err) {
            res.status(400).json({ message: err.message });
            return;
        }
        next();
    });
}, (req: Request, res: Response) => {
    cartController.addToCart(req, res);
});

// put route for updating quantity of item in cart
cartRouter.put('/:userId/update', requireAuth, (req, res) => cartController.updateQuantity(req, res));

// put route for removing item from cart
cartRouter.put('/:userId/remove', requireAuth, (req, res) => cartController.removeFromCart(req, res));

export default cartRouter;