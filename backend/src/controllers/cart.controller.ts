import { Request, Response } from 'express';
import User from '../models/user';
import fs from 'fs';
import path from 'path';

export class CartController {
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).populate('cart.product');

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json(user.cart);
        } catch (error: any) {
            res.status(500).json({
                message: 'Error fetching cart!',
                error: error.message
            })
        }
    }
    
    public async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { productId, serviceId, quantity, selectedColor, customText } = req.body;
            
            const customImage = req.file ? req.file.filename : '';
            const qty = parseInt(quantity) || 1;

            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const itemIndex = user.cart.findIndex(item => 
                item.product.toString() === productId && 
                (item.selectedServiceId ? item.selectedServiceId.toString() : null) === (serviceId || null) &&
                item.selectedColor === (selectedColor || 'Bela') &&
                item.customText === (customText || '') &&
                item.customImage === customImage
            );

            if (itemIndex > -1) {
                user.cart[itemIndex].quantity += qty;
            } else {
                user.cart.push({ 
                    product: productId, 
                    quantity: qty,
                    selectedServiceId: serviceId || null,
                    selectedColor: selectedColor || 'Bela',
                    customText: customText || '',
                    customImage: customImage
                });
            }

            await user.save();
            await user.populate('cart.product');
            res.status(200).json(user.cart);
        } catch (error: any) {
            res.status(500).json({ message: 'Error adding to cart', error: error.message });
        }
    }

    public async updateQuantity(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { productId, serviceId, quantity, selectedColor, customText, customImage } = req.body; 

            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const item = user.cart.find((item: any) => 
                item.product.toString() === productId && 
                (item.selectedServiceId ? item.selectedServiceId.toString() : null) === (serviceId || null) &&
                item.selectedColor === (selectedColor || 'Bela') &&
                item.customText === (customText || '') &&
                item.customImage === (customImage || '')
            );

            if (item && quantity > 0) {
                item.quantity = quantity;
                await user.save();
            }
            
            await user.populate('cart.product');
            res.status(200).json(user.cart);
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating quantity', error: error.message });
        }
    }

    public async removeFromCart(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { productId, serviceId, selectedColor, customText, customImage } = req.body; 
            
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            if (customImage) {
                const imagePath = path.join(__dirname, '../../uploads/custom_images', customImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $pull: {
                        cart: {
                            product: productId,
                            selectedServiceId: serviceId || null,
                            selectedColor: selectedColor || 'Bela',
                            customText: customText || '',
                            customImage: customImage || ''
                        }
                    }
                },
                { new: true }
            ).populate('cart.product');
            
            if (updatedUser) {
                res.status(200).json(updatedUser.cart);
            }
        } catch (error: any) {
            res.status(500).json({ message: 'Error removing from cart', error: error.message });
        }
    }
}