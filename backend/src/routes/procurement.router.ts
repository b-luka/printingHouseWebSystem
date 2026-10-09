import express from 'express';
import { ProcurementController } from '../controllers/procurement.controller';
import { requireAuth } from '../middleware/auth.middleware';

const procurementRouter = express.Router();
const procurementController = new ProcurementController();

procurementRouter.post('/start', requireAuth, (req, res) => procurementController.startProcurement(req, res));
procurementRouter.post('/bid', requireAuth, (req, res) => procurementController.placeOffer(req, res));
procurementRouter.get('/active', requireAuth, (req, res) => procurementController.getActiveProcurements(req, res));
procurementRouter.get('/past', (req, res) => procurementController.getPastProcurements(req, res));
procurementRouter.get('/client/:clientId', requireAuth, (req, res) => procurementController.getClientProcurements(req, res));
procurementRouter.get('/:id/report', (req, res) => procurementController.generateReport(req, res));

export default procurementRouter;