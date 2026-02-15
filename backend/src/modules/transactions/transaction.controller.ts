import { Request, Response } from 'express';
import { Transaction } from './transaction.model';
import { Customer } from '../customers/customer.model';

export const recordPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId, amount, mode, notes, date } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 1. Create Transaction Record
        const transaction = await Transaction.create({
            userId,
            customerId,
            amount,
            type: 'PAYMENT',
            mode,
            notes,
            date: date || new Date()
        });

        // 2. Update Customer Due Amount (Subtract payment)
        const customer = await Customer.findOneAndUpdate(
            { _id: customerId, userId: userId },
            { $inc: { amountDue: -amount } },
            { new: true }
        );

        res.status(201).json({ transaction, customer });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.query;
        const userId = req.user?.uid;

        const query: any = { userId };
        if (customerId) query.customerId = customerId;

        const transactions = await Transaction.find(query).sort({ date: -1 }).limit(50);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}
