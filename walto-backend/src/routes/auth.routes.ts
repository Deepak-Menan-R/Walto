import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/upgrade', authenticateUser, authController.upgradePlan.bind(authController));

export default router;
