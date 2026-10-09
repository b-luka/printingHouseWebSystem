import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ProductController } from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';

const productRouter = express.Router();
const productController = new ProductController();

// set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/products';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // generate a unique filename
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

// get route for searching products
productRouter.get('/search', (req: Request, res: Response) => productController.searchProducts(req, res));

// post route for adding a new product
productRouter.post('/add', (req: Request, res: Response, next: NextFunction) => {
    const uploadFields = upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'additionalImages', maxCount: 3 }
    ]);

    uploadFields(req, res, (err: any) => {
        if (err) {
            res.status(400).json({
                message: err.message
            });
            return;
        }
        next();
    });
}, (req: Request, res: Response) => productController.addProduct(req, res));

// get route for top 5 products
productRouter.get('/top', (req: Request, res: Response) => productController.getTopProducts(req, res));

// get route for fetching active categories
productRouter.get('/categories', (req: Request, res: Response) => productController.getActiveCategories(req, res));

// get route for fetching all categories
productRouter.get('/all-categories', (req, res) => productController.getAllCategories(req, res));

// post route for bulk importing products from JSON
productRouter.post('/bulk', requireAuth, (req: Request, res: Response) => productController.addBulkProducts(req, res));

// get route for fetching product and details by id
productRouter.get('/:id', (req: Request, res: Response) => productController.getProductById(req, res));

// put route for updating product quantity
productRouter.put('/:id/quantity', (req: Request, res: Response) => productController.updateQuantity(req, res));

// post route for creating comment
productRouter.post('/:id/comment', requireAuth, (req, res) => productController.addComment(req, res));

// post route for liking product
productRouter.post('/:id/like', requireAuth, (req, res) => productController.likeProduct(req, res));

// post route for disliking product
productRouter.post('/:id/dislike', requireAuth, (req, res) => productController.dislikeProduct(req, res));

// get route for fetching printer stock
productRouter.get('/printer/:printerId', (req, res) => productController.getProductsByPrinter(req, res));
        
export default productRouter;