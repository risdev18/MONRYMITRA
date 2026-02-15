import { Request, Response } from 'express';
import { Customer } from '../../modules/customers/customer.model';
import { logAudit } from '../../services/audit-log.service';
import { eventBus, EventTypes } from '../../events/event-bus';

interface SyncItem {
    id: string; // Local ID or UUID
    action: 'CREATE_CUSTOMER' | 'UPDATE_CUSTOMER' | 'DELETE_CUSTOMER';
    payload: any;
    timestamp: string;
}

export const syncOfflineActions = async (req: Request, res: Response) => {
    const { actions, deviceId } = req.body as { actions: SyncItem[], deviceId: string };
    const userId = req.user.uid;
    const results = [];

    console.log(`Processing ${actions.length} offline actions for User: ${userId}`);

    for (const item of actions) {
        try {
            let result;
            switch (item.action) {
                case 'CREATE_CUSTOMER':
                    // Check duplicate by phone to prevent double creation on sync
                    const existing = await Customer.findOne({ userId, phone: item.payload.phone });
                    if (existing) {
                        result = { id: item.id, status: 'SKIPPED', message: 'Already exists' };
                    } else {
                        const newCustomer = await Customer.create({
                            ...item.payload,
                            userId,
                            createdOffline: true
                        });
                        result = { id: item.id, status: 'SUCCESS', serverId: newCustomer._id };
                        eventBus.emit(EventTypes.CUSTOMER_CREATED, { userId, customerId: newCustomer._id });
                    }
                    break;

                // Add other cases here (UPDATE, DELETE)
                default:
                    result = { id: item.id, status: 'FAILED', message: 'Unknown Action' };
            }
            results.push(result);
        } catch (error: any) {
            console.error(`Sync Error [${item.action}]:`, error);
            results.push({ id: item.id, status: 'FAILED', message: error.message });
        }
    }

    logAudit({
        userId,
        action: 'OFFLINE_SYNC',
        entity: 'SYSTEM',
        details: { count: actions.length, deviceId }
    });

    res.status(200).json({ results });
};
