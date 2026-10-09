import express, { Request, Response } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const adminRouter = express.Router();
const adminController = new AdminController();

// get route for all pending users
adminRouter.get('/users/pending', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.getPendingUsers(req, res));

// get route for all users
adminRouter.get('/users', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.getAllUsers(req, res));

// get route for all categories
adminRouter.get('/categories', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.getAllCategories(req, res));

// post route for adding a new category
adminRouter.post('/categories', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.addCategory(req, res));

// post route for adding a new category
adminRouter.post('/subcategories', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.addSubcategory(req, res));

// get routes for various stats
adminRouter.get('/stats/printers', requireAuth, requireAdmin, (req, res) => adminController.getTopPrinters(req, res));
adminRouter.get('/stats/products', requireAuth, requireAdmin, (req, res) => adminController.getTopProducts(req, res));

// delete route for deleting user
adminRouter.delete('/users/:id', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.deleteUser(req, res));

// put route for updating user status
adminRouter.put('/users/:id/status', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.updateUserStatus(req, res));

// put route for editing user details
adminRouter.put('/users/:id', requireAuth, requireAdmin, (req: Request, res: Response) => adminController.updateUserDetails(req, res));

export default adminRouter;