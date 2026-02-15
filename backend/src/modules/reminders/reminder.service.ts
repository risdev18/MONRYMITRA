import { Queue, Worker } from 'bullmq';
import { redisClient } from '../../config/redis'; // Note: BullMQ uses separate connection ideally, using default for now
import { Reminder } from './reminder.model';
import { config } from '../../config/env';
import { Customer } from '../customers/customer.model';

const REMINDER_QUEUE = 'reminder-queue';

// Create Queue
const reminderQueue = new Queue(REMINDER_QUEUE, {
    connection: {
        host: 'localhost', // Pull from config in prod
        port: 6379
    }
});

// Add to Queue
export const queueReminder = async (reminderId: string) => {
    await reminderQueue.add('send-reminder', { reminderId }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true
    });
};

// Worker Mock (Detailed implementation later)
const worker = new Worker(REMINDER_QUEUE, async job => {
    console.log(`Processing reminder: ${job.data.reminderId}`);

    const reminder = await Reminder.findById(job.data.reminderId);
    if (!reminder) return; // job.discard();

    const customer = await Customer.findById(reminder.customerId);
    if (!customer) throw new Error('Customer not found');

    try {
        // Mock WhatsApp API Call
        console.log(`Sending WhatsApp to ${customer.phone}: Pay Rs ${reminder.amount}`);

        // Update status
        reminder.status = 'SENT';
        reminder.lastAttemptAt = new Date();
        await reminder.save();
    } catch (error) {
        // Let BullMQ handle retry
        throw error;
    }

}, { connection: { host: 'localhost', port: 6379 } });

worker.on('failed', async (job, err) => {
    if (job) {
        console.log(`Job ${job.id} failed: ${err.message}`);
        // Update MongoDB with failure
        await Reminder.findByIdAndUpdate(job.data.reminderId, {
            status: 'FAILED',
            errorMessage: err.message,
            attemptCount: (job.attemptsMade || 0) + 1
        });
    }
});

export const reminderService = {
    queueReminder
};
