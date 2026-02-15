import { AuditLog, IAuditLog } from '../modules/audit-logs/audit-log.model';
import { eventBus, EventTypes } from '../events/event-bus';

export const logAudit = async (data: Partial<IAuditLog>) => {
    try {
        await AuditLog.create(data);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

// Auto-subscribe to critical events to create logs automatically
export const initAuditLogSubscriber = () => {
    eventBus.on(EventTypes.USER_LOGIN, (payload) => {
        logAudit({
            userId: payload.userId,
            action: 'LOGIN',
            entity: 'USER',
            entityId: payload.userId,
            ipAddress: payload.ip,
            deviceId: payload.deviceId,
            details: payload
        });
    });

    eventBus.on(EventTypes.PAYMENT_SUCCESS, (payload) => {
        logAudit({
            userId: payload.userId,
            action: 'PAYMENT_RECEIVED',
            entity: 'PAYMENT',
            entityId: payload.paymentId,
            details: { amount: payload.amount, method: payload.method }
        });
    });

    eventBus.on(EventTypes.CUSTOMER_CREATED, (payload) => {
        logAudit({
            userId: payload.userId,
            action: 'CREATE',
            entity: 'CUSTOMER',
            entityId: payload.customerId,
            details: { name: payload.name }
        });
    });

    console.log('Audit Log Subscriber Initialized');
};
