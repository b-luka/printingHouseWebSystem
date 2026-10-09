import { Request, Response } from 'express';
import Product from '../models/product';
import Category from '../models/category';

export class ProductController {
    public async searchProducts(req: Request, res: Response): Promise<void> {
        try {
            const { name, category } = req.query;
            let filter: any = { stockQuantity: { $gt: 0 } };

            if (name) filter.name = { $regex: name as string, $options: 'i' };

            if (category && category !== 'All categories') filter.category = category;

            const products = await Product.find(filter)
                    .populate('printerId', 'institutionName headquartersAddress city');

            res.status(200).json(products);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error during search.'
            });
        }
    }

    public async addProduct(req: Request, res: Response): Promise<void> {
        try {
            const productData = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (files && files['image'] && files['image'].length > 0) {
                productData.imageUrl = files['image'][0].filename;
            }

            if (files && files['additionalImages'] && files['additionalImages'].length > 0) {
                productData.additionalImages = files['additionalImages'].map(file => file.filename);
            }

            if (productData.availableColors && typeof productData.availableColors === 'string') {
                productData.availableColors = JSON.parse(productData.availableColors);
            }

            if (productData.printServices && typeof productData.printServices === 'string') {
                productData.printServices = JSON.parse(productData.printServices);
            }

            const newProduct = new Product(productData);
            await newProduct.save();

            res.status(201).json({
                message: 'Product added successfully.',
                product: newProduct
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error while adding product.',
                error: error.message
            });
        }
    }

    public async updateQuantity(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { newQuantity } = req.body;

            if (typeof newQuantity !== 'number' || newQuantity < 0) {
                res.status(400).json({
                    message: 'New quantity must be >= 0.'
                });
                return;
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, { stockQuantity: newQuantity }, { new: true });

            if (!updatedProduct) {
                res.status(404).json({
                    message: 'Product not found.'
                });
                return;
            }

            res.status(200).json({
                message: 'Product quantity updated successfully.',
                product: updatedProduct
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error while updating product quantity.',
                error: error.message
            });
        }
    }

    public async getTopProducts(req: Request, res: Response): Promise<void> {
        try {
            const topProducts = await Product.find()
                .sort({ likes: -1 })
                .limit(5)
                .populate('printerId', 'institutionName');
            
            res.status(200).json(topProducts);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching top products.',
                error: error.message
            });
        }
    }

    public async getActiveCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await Product.distinct('category', { stockQuantity: { $gt: 0 } });
            
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching active categories.',
                error: error.message
            });
        }
    }

    public async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    }

    public async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findById(req.params.id)
                .populate('printerId', 'institutionName headquartersAddress city')
                .populate('comments.clientId', 'username');
                
            if (!product) {
                res.status(404).json({ message: 'Product not found.' });
                return;
            }
            res.status(200).json(product);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching product details.', error: error.message });
        }
    }

    public async addComment(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { userId, text } = req.body;

            const product = await Product.findById(id);
            if (!product) {
                res.status(404).json({ message: 'Product not found.' });
                return;
            }

            product.comments.push({ clientId: userId, text } as any);
            await product.save();

            await product.populate([
                { path: 'comments.clientId', select: 'username' },
                { path: 'printerId', select: 'institutionName headquartersAddress city' }
            ]);
            res.status(200).json(product);
        } catch (error: any) {
            res.status(500).json({ message: 'Error adding comment', error: error.message });
        }
    }

    public async likeProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            const product = await Product.findById(id).populate('comments.clientId', 'username');
            if (!product) { res.status(404).json({ message: 'Product not found' }); return; }

            product.dislikedBy = product.dislikedBy.filter(u => u.toString() !== userId) as any;

            const hasLiked = product.likedBy.some(u => u.toString() === userId);
            if (hasLiked) {
                product.likedBy = product.likedBy.filter(u => u.toString() !== userId) as any;
            } else {
                product.likedBy.push(userId as any);
            }

            product.likes = product.likedBy.length;
            product.dislikes = product.dislikedBy.length;

            await product.save();

            await product.populate([
                { path: 'comments.clientId', select: 'username' },
                { path: 'printerId', select: 'institutionName headquartersAddress city' }
            ]);
            res.status(200).json(product);
        } catch (error: any) {
            res.status(500).json({ message: 'Error liking product', error: error.message });
        }
    }

    public async dislikeProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            const product = await Product.findById(id).populate('comments.clientId', 'username');
            if (!product) { res.status(404).json({ message: 'Product not found' }); return; }

            product.likedBy = product.likedBy.filter(u => u.toString() !== userId) as any;

            const hasDisliked = product.dislikedBy.some(u => u.toString() === userId);
            if (hasDisliked) {
                product.dislikedBy = product.dislikedBy.filter(u => u.toString() !== userId) as any;
            } else {
                product.dislikedBy.push(userId as any);
            }

            product.likes = product.likedBy.length;
            product.dislikes = product.dislikedBy.length;

            await product.save();

            await product.populate([
                { path: 'comments.clientId', select: 'username' },
                { path: 'printerId', select: 'institutionName headquartersAddress city' }
            ]);

            res.status(200).json(product);
        } catch (error: any) {
            res.status(500).json({ message: 'Error disliking product', error: error.message });
        }
    }

    public async getProductsByPrinter(req: Request, res: Response): Promise<void> {
        try {
            const { printerId } = req.params;
            const products = await Product.find({ printerId }).sort({ createdAt: -1 });
            res.status(200).json(products);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching printer products.',
                error: error.message
            });
        }
    }

    public async addBulkProducts(req: Request, res: Response): Promise<void> {
        try {
            const { printerId, products } = req.body;

            if (!printerId || !Array.isArray(products) || products.length === 0) {
                res.status(400).json({ message: 'Invalid payload. Printer ID and products array are required.' });
                return;
            }

            const productsToInsert = products.map((p: any) => {
                
                // Проверавамо и сређујемо додатне услуге (printServices)
                if (p.printServices && Array.isArray(p.printServices)) {
                    p.printServices = p.printServices.map((service: any) => ({
                        ...service,
                        maxWidthMm: service.maxWidthMm,
                        maxHeightMm: service.maxHeightMm
                    }));
                }

                return {
                    ...p,
                    printerId: printerId,
                    imageUrl: p.imageUrl || 'default_product_image.jpg' 
                };
            });

            const insertedProducts = await Product.insertMany(productsToInsert);

            res.status(201).json({
                message: `Successfully imported ${insertedProducts.length} products.`,
                products: insertedProducts
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error during bulk import.',
                error: error.message
            });
        }
    }
}