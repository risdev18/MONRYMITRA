import { Request, Response } from 'express';
import { Customer } from '../customers/customer.model';
import { Transaction } from './transaction.model';

export const triggerMonthlyReset = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.uid;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Find all active customers for this user
        const customers = await Customer.find({ userId, isActive: true });

        let updatedCount = 0;
        const now = new Date();

        // 2. Loop and update (Bulk write is better but loop is simpler for MVP logic)
        for (const cust of customers) {
            if (cust.monthlyFee && cust.monthlyFee > 0) {
                // Add Fee
                cust.amountDue += cust.monthlyFee;
                await cust.save();

                // Create Transaction Record (FEE)
                await Transaction.create({
                    userId,
                    customerId: cust._id,
                    amount: cust.monthlyFee,
                    type: 'FEE',
                    notes: `Monthly Fee for ${now.toLocaleString('default', { month: 'long' })}`,
                    date: now
                });
                updatedCount++;
            }
        }

        res.json({ success: true, message: `Updated ${updatedCount} customers with monthly fees.` });

    } catch (error) {
        console.error('Monthly Reset Error:', error);
        res.status(500).json({ error: 'Failed to process monthly reset' });
    }
};
