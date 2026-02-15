import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
}

export const eventBus = EventBus.getInstance();

export enum EventTypes {
    // User Events
    USER_REGISTERED = 'USER_REGISTERED',
    USER_LOGIN = 'USER_LOGIN',

    // Customer Events
    CUSTOMER_CREATED = 'CUSTOMER_CREATED',
    CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
    CUSTOMER_DELETED = 'CUSTOMER_DELETED',

    // Payment Events
    PAYMENT_INITIATED = 'PAYMENT_INITIATED',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',

    // Reminder Events
    REMINDER_SCHEDULED = 'REMINDER_SCHEDULED',
    REMINDER_SENT = 'REMINDER_SENT',
    REMINDER_FAILED = 'REMINDER_FAILED',

    // System Events
    OFFLINE_SYNC_COMPLETED = 'OFFLINE_SYNC_COMPLETED',
    ERROR_OCCURRED = 'ERROR_OCCURRED'
}
