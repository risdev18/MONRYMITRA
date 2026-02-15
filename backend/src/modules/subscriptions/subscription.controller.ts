import { Request, Response } from 'express';
import { Subscription } from './subscription.model';
import { User } from '../users/user.model';
import { logAudit } from '../../services/audit-log.service';

// Mock Razorpay Webhook Handler
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
    try {
        // Verify signature (skip for mock)
        const { event, payload } = req.body;

        if (event === 'payment.captured') {
            const { payment } = payload;
            const { notes, amount, id } = payment.entity;
            const userId = notes.userId;
            const planId = notes.planId;

            // Calculate End Date (assuming monthly)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30);

            // Record Subscription
            await Subscription.create({
                userId,
                planId,
                amount: amount / 100, // Paise to Rupee
                transactionId: id,
                status: 'ACTIVE',
                startDate,
                endDate
            });

            // Update User Plan
            await User.findOneAndUpdate({ uid: userId }, { subscriptionPlan: planId });

            logAudit({
                userId,
                action: 'SUBSCRIPTION_UPGRADE',
                entity: 'SUBSCRIPTION',
                details: { plan: planId, amount: amount / 100 }
            });
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Get Current Plan
export const getMySubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user.uid;
        const sub = await Subscription.findOne({ userId, status: 'ACTIVE' }).sort({ endDate: -1 });
        // Return active sub or default free
        res.status(200).json(sub || { planId: 'FREE', status: 'ACTIVE' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
}
