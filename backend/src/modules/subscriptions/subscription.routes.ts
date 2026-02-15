import { Router } from 'express';
import { handleRazorpayWebhook, getMySubscription } from './subscription.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Webhook (Public, verify signature in middleware in prod)
router.post('/webhook', handleRazorpayWebhook);

// Protected
router.get('/my', authenticate, getMySubscription);

export default router;
