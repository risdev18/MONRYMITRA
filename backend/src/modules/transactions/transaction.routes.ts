import { Router } from 'express';
import { recordPayment, getTransactions } from './transaction.controller';
import { triggerMonthlyReset } from './monthly-reset.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // Protect all routes

router.post('/monthly-reset', triggerMonthlyReset as any);
router.post('/', recordPayment as any);
router.get('/', getTransactions as any);

export default router;
