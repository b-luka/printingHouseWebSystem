import express from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';

const orderRouter = express.Router();
const orderController = new OrderController();

// post route for checking out
orderRouter.post('/checkout', requireAuth, (req, res) => orderController.checkout(req, res));

// get route for fetching all client orders
orderRouter.get('/client/:clientId', requireAuth, (req, res) => orderController.getClientOrders(req, res));

// get route for fetching all printer orders
orderRouter.get('/printer/:printerId', requireAuth, (req, res) => orderController.getPrinterOrders(req, res));

// put route for updating order status
orderRouter.put('/:orderId/status', requireAuth, (req, res) => orderController.updateOrderStatus(req, res));

// put route for canceling order by client
orderRouter.put('/:orderId/cancel', requireAuth, (req, res) => orderController.cancelOrder(req, res));

export default orderRouter;