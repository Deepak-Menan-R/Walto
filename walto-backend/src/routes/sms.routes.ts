import { Router } from 'express';
import smsController from '../controllers/sms.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/parse-sms', smsController.parseSMS.bind(smsController));
router.get('/transactions', smsController.getTransactions.bind(smsController));
router.get('/summary', smsController.getMonthlySummary.bind(smsController));
router.put('/transactions/:id', smsController.updateTransaction.bind(smsController));
router.delete('/transactions/:id', smsController.deleteTransaction.bind(smsController));

export default router;
