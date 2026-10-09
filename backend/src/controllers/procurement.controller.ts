import { Request, Response } from 'express';
import Procurement from '../models/procurement';
import User from '../models/user';
import Product from '../models/product';
import Order from '../models/order';
import { notifyPrintersAboutProcurement } from '../utils/mailer';
import PDFDocument from 'pdfkit';

export class ProcurementController {
    public async startProcurement(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;

            const client = await User.findById(userId).populate('cart.product');
            if (!client || client.userType !== 'client_legal') {
                res.status(403).json({ message: 'Only corporate clients can create procurements.' });
                return;
            }

            if (client.cart.length === 0) {
                res.status(400).json({ message: 'Cart is empty.' });
                return;
            }

            const items = client.cart.map((item: any) => ({
                category: item.product.category,
                name: item.product.name,
                quantity: item.quantity
            }));

            const procurement = new Procurement({
                clientLegalId: userId,
                items,
                isActive: true,
                offers: []
            });

            await procurement.save();

            client.cart = [] as any;
            await client.save();

            const printers = await User.find({ userType: 'printer', status: 'approved' });
            const printerEmails = printers.map(p => p.email);
            
            notifyPrintersAboutProcurement(printerEmails, procurement._id.toString(), items);

            // 10 minute timer
            /* 
            setTimeout(() => {
                this.finalizeProcurement(procurement._id.toString());
            }, 10 * 60 * 1000);
            */

            // 1 minute for testing purposes
            setTimeout(() => {
                this.finalizeProcurement(procurement._id.toString());
            }, 1 * 60 * 1000);

            res.status(200).json({ message: 'Procurement created! Auctions available for the next 10 minutes.' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error creating procurement', error: error.message });
        }
    }

    public async placeOffer(req: Request, res: Response): Promise<void> {
        try {
            const { procurementId, printerId, totalPrice } = req.body;

            const procurement = await Procurement.findById(procurementId);
            if (!procurement || !procurement.isActive) {
                res.status(400).json({ message: 'Procurement is no longer active.' });
                return;
            }

            for (const requestedItem of procurement.items) {
                const product = await Product.findOne({ 
                    printerId: printerId, 
                    name: requestedItem.name 
                });

                if (!product || product.stockQuantity < requestedItem.quantity) {
                    res.status(400).json({ message: `Not enough product in stock: ${requestedItem.name}` });
                    return;
                }
            }

            const existingOfferIndex = procurement.offers.findIndex(o => o.printerId?.toString() === printerId);
            if (existingOfferIndex > -1) {
                procurement.offers[existingOfferIndex].totalPrice = totalPrice;
                procurement.offers[existingOfferIndex].offerDate = new Date();
            } else {
                procurement.offers.push({
                    printerId,
                    totalPrice,
                    offerDate: new Date(),
                    isWinning: false
                } as any);
            }

            await procurement.save();
            console.log('Offer placed by: ', printerId, ', price: ', totalPrice);
            res.status(200).json({ message: 'Offer registered.' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error sending offer', error: error.message });
        }
    }

    public async finalizeProcurement(procurementId: string) {
        try {
            const procurement = await Procurement.findById(procurementId);
            if (!procurement || !procurement.isActive) return;

            procurement.isActive = false;

            if (procurement.offers.length === 0) {
                await procurement.save();
                return;
            }

            let winningOffer = procurement.offers[0];
            for (const offer of procurement.offers) {
                if (offer.totalPrice < winningOffer.totalPrice) {
                    winningOffer = offer;
                }
            }

            winningOffer.isWinning = true;
            const winningPrinterId = winningOffer.printerId;

            const orderItems = [];
            for (const item of procurement.items) {
                const product = await Product.findOne({ 
                    printerId: winningPrinterId, 
                    name: item.name 
                });

                if (product) {
                    await Product.findByIdAndUpdate(product._id, { $inc: { stockQuantity: -item.quantity } });

                    orderItems.push({
                        productId: product._id,
                        productName: product.name,
                        quantity: item.quantity,
                        color: product.availableColors?.[0] || 'Bela',
                        itemTotalPrice: product.unitPrice * item.quantity
                    });
                }
            }

            const newOrder = new Order({
                clientId: procurement.clientLegalId,
                printerId: winningPrinterId,
                items: orderItems,
                totalAmount: winningOffer.totalPrice,
                status: 'in_printing'
            });

            await newOrder.save();
            await procurement.save();
            console.log(`Winner: ${winningPrinterId}`);
        } catch (error) {
            console.error('Error finalizing procurement:', error);
        }
    }

    public async getClientProcurements(req: Request, res: Response): Promise<void> {
        try {
            const { clientId } = req.params;
            const procurements = await Procurement.find({ clientLegalId: clientId })
                .sort({ createdAt: -1 })
                .populate('offers.printerId', 'institutionName username');
            res.status(200).json(procurements);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching procurements', error: error.message });
        }
    }

    public async getActiveProcurements(req: Request, res: Response): Promise<void> {
        try {
            const procurements = await Procurement.find({ isActive: true })
                .sort({ createdAt: -1 })
                .populate('clientLegalId', 'institutionName city');
            res.status(200).json(procurements);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching procurements', error: error.message });
        }
    }

    public async generateReport(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const proc = await Procurement.findById(id)
                .populate('clientLegalId', 'institutionName username')
                .populate('offers.printerId', 'institutionName username');

            if (!proc) {
                res.status(404).json({ message: 'Procurement not found' });
                return;
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report_procurement_${id}.pdf`);

            const doc = new PDFDocument({ margin: 50 });
            doc.pipe(res);

            doc.fontSize(20).text('Public Procurement Report', { align: 'center' });
            doc.moveDown(2);

            const clientName = (proc.clientLegalId as any)?.institutionName || (proc.clientLegalId as any)?.username || 'Unknown Institution';
            doc.fontSize(12).text(`Institution: ${clientName}`);
            doc.text(`Procurement ID: ${proc._id}`);
            
            const statusText = proc.isActive ? 'ACTIVE' : 'COMPLETED';
            doc.text(`Status: ${statusText}`);
            doc.text(`Date: ${proc.createdAt.toDateString()}`);
            doc.moveDown(2);

            doc.fontSize(16).text('Received Offers:');
            doc.moveDown(0.5);

            if (proc.offers && proc.offers.length > 0) {
                const sortedOffers = [...proc.offers].sort((a: any, b: any) => a.totalPrice - b.totalPrice);
                
                const winningOffer = sortedOffers[0];

                sortedOffers.forEach((offer: any, index: number) => {
                    const printerName = offer.printerId?.institutionName || offer.printerId?.username || 'Unknown Printer';
                    const isWinner = offer._id.toString() === winningOffer._id.toString();
                    
                    let text = `${index + 1}. ${printerName}  -  ${offer.totalPrice} RSD`;
                    
                    if (isWinner && !proc.isActive) {
                        doc.fillColor('green').text(text + ' (WINNER - Lowest Price)');
                        doc.fillColor('black');
                    } else {
                        doc.text(text);
                    }
                    doc.moveDown(0.5);
                });
            } else {
                doc.fontSize(12).text('No offers received for this procurement.');
            }

            doc.end();

        } catch (error: any) {
            res.status(500).json({ message: 'Error generating PDF.', error: error.message });
        }
    }

    public async getPastProcurements(req: Request, res: Response): Promise<void> {
        try {
            const pastProcurements = await Procurement.find({ isActive: false })
                .sort({ createdAt: -1 })
                .populate('clientLegalId', 'institutionName username');
            
            res.status(200).json(pastProcurements);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching past procurements.', error: error.message });
        }
    }
}