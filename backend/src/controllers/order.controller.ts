import { Request, Response } from 'express';
import Order from '../models/order';
import User from '../models/user';
import Product from '../models/product';
import PDFDocument from 'pdfkit';
import { sendInvoiceEmail } from '../utils/mailer';

export class OrderController {
    public async checkout(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;

            const user = await User.findById(userId).populate('cart.product');
            if (!user || user.cart.length === 0) {
                res.status(400).json({ message: 'Cart is empty!' });
                return;
            }

            const ordersByPrinter = new Map<string, any[]>();

            for (const item of user.cart) {
                const product = item.product as any;

                if (product.stockQuantity < item.quantity) {
                    res.status(400).json({ message: `Not enough in stock: ${product.name}!` });
                    return;
                }

                const printerId = product.printerId.toString();
                if (!ordersByPrinter.has(printerId)) {
                    ordersByPrinter.set(printerId, []);
                }

                let printTypeName = 'None';
                let servicePrice = 0;
                
                if (item.selectedServiceId && product.printServices) {
                    const service = product.printServices.find((s: any) => s._id.toString() === item.selectedServiceId!.toString());
                    if (service) {
                        printTypeName = service.printType;
                        servicePrice = service.additionalPricePerPiece;
                    }
                }

                const itemUnitPrice = product.unitPrice + servicePrice;
                const itemTotalPrice = itemUnitPrice * item.quantity;

                ordersByPrinter.get(printerId)!.push({
                    productId: product._id,
                    productName: product.name,
                    quantity: item.quantity,
                    color: item.selectedColor || 'Bela',
                    printServiceId: item.selectedServiceId,
                    printTypeName: printTypeName,
                    artworkUrl: item.customImage || '',
                    artworkText: item.customText || '',
                    itemTotalPrice: itemTotalPrice
                });
            }

            const createdOrders = [];

            for (const [printerId, items] of ordersByPrinter.entries()) {
                let totalAmount = items.reduce((sum, currentItem) => sum + currentItem.itemTotalPrice, 0);
                
                for (const item of items) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: -item.quantity } });
                }

                const newOrder = new Order({
                    clientId: userId,
                    printerId: printerId,
                    items: items,
                    totalAmount: totalAmount,
                    status: 'ordered'
                });
                await newOrder.save();
                createdOrders.push(newOrder);
            }

            user.cart = [] as any;
            await user.save();

            res.status(200).json({ message: 'Order placed successfully! Invoice will be sent to your email.' });
            
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));

            doc.on('end', async () => {
                const pdfBuffer = Buffer.concat(buffers);
                await sendInvoiceEmail(user.email, user.firstname, pdfBuffer);
            });

            doc.fontSize(22).text('INVOICE', { align: 'center' });
            doc.moveDown(2);
            
            doc.fontSize(12).text(`Customer: ${user.firstname} ${user.lastname}`);
            doc.text(`Email: ${user.email}`);
            doc.text(`Date: ${new Date().toLocaleDateString()}`);
            doc.moveDown(2);

            let totalOverall = 0;
            doc.fontSize(14).text('Items in Order:', { underline: true });
            doc.moveDown(1);

            createdOrders.forEach((order, index) => {
                doc.fontSize(12).font('Helvetica-Bold').text(`Order #${index + 1}`);
                doc.font('Helvetica');
                
                order.items.forEach((item: any) => {
                    const lineItem = `- ${item.productName} (${item.printTypeName}) | ${item.quantity} kom. | ${item.itemTotalPrice} RSD`;
                    doc.fontSize(11).text(lineItem);
                });
                
                totalOverall += order.totalAmount;
                doc.moveDown(1);
            });

            doc.moveDown(2);
            doc.fontSize(16).font('Helvetica-Bold').text(`TOTAL FOR PAYMENT: ${totalOverall} RSD`, { align: 'right' });

            doc.end();
        } catch (error: any) {
            res.status(500).json({ message: 'Error creating order.', error: error.message });
        }
    }

    public async getClientOrders(req: Request, res: Response): Promise<void> {
        try {
            const { clientId } = req.params;
            const orders = await Order.find({ clientId })
                                      .sort({ createdAt: -1 })
                                      .populate('printerId', 'institutionName headquartersAddress city');
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching orders.', error: error.message });
        }
    }

    public async getPrinterOrders(req: Request, res: Response): Promise<void> {
        try {
            const { printerId } = req.params;
            const orders = await Order.find({ printerId })
                                      .sort({ createdAt: -1 })
                                      .populate('clientId', 'firstname lastname email phone')
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching printer orders.', error: error.message });
        }
    }

    public async updateOrderStatus(req: Request, res: Response): Promise<void> {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId, 
                { status: status }, 
                { new: true }
            );

            if (!updatedOrder) {
                res.status(404).json({ message: 'Order not found.' });
                return;
            }

            res.status(200).json({ message: 'Order status updated successfully.', order: updatedOrder });
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating order status.', error: error.message });
        }
    }

    public async cancelOrder(req: Request, res: Response): Promise<void> {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId);
            
            if (!order) {
                res.status(404).json({ message: 'Order not found.' });
                return;
            }

            if (order.status !== 'ordered') {
                res.status(400).json({ message: 'Can\'t cancel an order that is already in progress or completed.' });
                return;
            }

            order.status = 'canceled';
            await order.save();

            res.status(200).json({ message: 'Order canceled successfully.' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error canceling order.', error: error.message });
        }
    }
}