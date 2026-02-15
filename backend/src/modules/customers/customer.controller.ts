import { Request, Response } from 'express';
import { Customer } from './customer.model';
import { logAudit } from '../../services/audit-log.service';
import { eventBus, EventTypes } from '../../events/event-bus';

// Create Customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { name, phone, amountDue, dueDate, notes, createdOffline } = req.body;
        const userId = req.user.uid;

        const customer = await Customer.create({
            userId,
            name,
            phone,
            amountDue,
            dueDate,
            notes,
            createdOffline: createdOffline || false
        });

        eventBus.emit(EventTypes.CUSTOMER_CREATED, {
            userId,
            customerId: customer._id,
            name: customer.name
        });

        res.status(201).json(customer);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Customer with this phone number already exists.' });
        }
        console.error('Create Customer Error:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};

// Get All Customers for User
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.uid;
        if (userId) {
            // Trigger auto-due check whenever user loads dashboard/list
            // This ensures data is always fresh "on view" without complex cron jobs
            await processAutoDues(userId).catch(err => console.error("Auto-due error", err));
        }

        const customers = await Customer.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

// Update Customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        // Ensure user owns the customer
        const customer = await Customer.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        eventBus.emit(EventTypes.CUSTOMER_UPDATED, { userId, customerId: id });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};

// Delete Customer (Soft Delete)
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const customer = await Customer.findOneAndUpdate(
            { _id: id, userId },
            { isActive: false },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        eventBus.emit(EventTypes.CUSTOMER_DELETED, { userId, customerId: id });

        // Log explicit audit for deletion
        logAudit({
            userId,
            action: 'DELETE',
            entity: 'CUSTOMER',
            entityId: id,
            details: { phone: customer.phone }
        });

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};

// Clear All Customers (Soft Delete All)
export const clearAllCustomers = async (req: Request, res: Response) => {
    try {
        const userId = req.user.uid;

        const result = await Customer.updateMany(
            { userId, isActive: true },
            { isActive: false }
        );

        logAudit({
            userId,
            action: 'DELETE_ALL',
            entity: 'CUSTOMER',
            details: { count: result.modifiedCount }
        });

        res.status(200).json({ message: `Successfully cleared ${result.modifiedCount} customers` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear customers' });
    }
};
