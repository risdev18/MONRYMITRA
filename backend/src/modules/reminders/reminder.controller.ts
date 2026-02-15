import { Request, Response } from 'express';
import { Reminder } from './reminder.model';
import { queueReminder } from './reminder.service';
import { Customer } from '../customers/customer.model';

// Powering the "Due Today" Dashboard
export const getReminderSuggestions = async (req: Request, res: Response) => {
    try {
        const userId = req.user.uid;

        // Find all customers with Amount Due > 0
        const dueCustomers = await Customer.find({
            userId,
            amountDue: { $gt: 0 },
            isActive: true
        });

        // In a real app, we would filter out those whom we already reminded today.
        // For MVP, we pass them all, and let the frontend decide or just show them.
        // Or we can check the 'Reminder' collection for 'SENT' today.

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const recentReminders = await Reminder.find({
            userId,
            scheduledAt: { $gte: startOfDay }
        });

        const recentlyRemindedCustomerIds = new Set(recentReminders.map(r => r.customerId));

        const suggestions = dueCustomers.filter(c => !recentlyRemindedCustomerIds.has(c._id.toString())).map(c => ({
            customerId: c._id,
            name: c.name,
            phone: c.phone,
            amountDue: c.amountDue,
            dueDate: c.dueDate
        }));

        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
}

// Create Manual Reminder (Log that user sent it via WhatsApp)
export const createReminder = async (req: Request, res: Response) => {
    try {
        const { customerId, amount, scheduledAt } = req.body;
        const userId = req.user.uid;

        const customer = await Customer.findOne({ _id: customerId, userId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // For Assisted Mode: We just log it as SENT immediately because user clicked "WhatsApp"
        const reminder = await Reminder.create({
            customerId,
            userId,
            amount,
            scheduledAt: new Date(),
            status: 'SENT', // Mark as sent because user did it manually
            channel: 'WHATSAPP',
            errorMessage: 'Manual Assisted Send'
        });

        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create reminder' });
    }
};

// Get Reminders History
export const getReminders = async (req: Request, res: Response) => {
    try {
        const userId = req.user.uid;
        const reminders = await Reminder.find({ userId }).sort({ scheduledAt: -1 }).limit(50);
        res.status(200).json(reminders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
};
