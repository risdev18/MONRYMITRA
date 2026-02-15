import { Customer } from '../modules/customers/customer.model';
import { Reminder } from '../modules/reminders/reminder.model';
import { Business } from '../modules/business/business.model';
import { queueReminder } from '../modules/reminders/reminder.service';

/**
 * Main Job to schedule reminders for all businesses that have enabled Auto-Reminders.
 * This should ideally run hourly via a cron job.
 */
export const scheduleRemindersJob = async () => {
    console.log('--- Starting Reminder Scheduler Job ---');

    const now = new Date();
    const currentHour = now.getHours(); // 0-23

    try {
        // 1. Find all active businesses with Auto-Reminders enabled
        const activeBusinesses = await Business.find({
            autoRemindersEnabled: true
        });

        console.log(`Checking ${activeBusinesses.length} businesses for auto-reminders...`);

        let totalScheduledCount = 0;

        for (const business of activeBusinesses) {
            // 2. Check if the current hour matches the business's preferred reminder time
            // business.reminderTime is expected format "HH:mm" e.g., "08:00"
            const [remHourStr] = (business.reminderTime || "08:00").split(':');
            const reminderHour = parseInt(remHourStr, 10);

            if (currentHour !== reminderHour) {
                // Not the time for this business yet
                continue;
            }

            console.log(`Processing reminders for Business: ${business.businessName} (User: ${business.userId})`);

            // 3. Find customers for this business who are in debt
            const dueCustomers = await Customer.find({
                userId: business.userId,
                amountDue: { $gt: 0 },
                isActive: true
            });

            let businessScheduledCount = 0;

            for (const customer of dueCustomers) {
                // 4. Ensure we don't send multiple reminders on the same day
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const existingReminder = await Reminder.findOne({
                    customerId: (customer._id as any).toString(),
                    scheduledAt: { $gte: startOfDay }
                });

                if (!existingReminder) {
                    // Schedule new reminder
                    const reminderData = {
                        customerId: (customer._id as any).toString(),
                        userId: business.userId,
                        amount: customer.amountDue,
                        scheduledAt: new Date(),
                        status: 'QUEUED' as const,
                        channel: 'WHATSAPP' as const
                    };

                    const reminder = await Reminder.create(reminderData);

                    await queueReminder((reminder._id as any).toString());
                    businessScheduledCount++;
                }
            }

            console.log(`- Scheduled ${businessScheduledCount} reminders for ${business.businessName}`);
            totalScheduledCount += businessScheduledCount;
        }

        console.log(`--- Scheduler Finished. Total Scheduled: ${totalScheduledCount} ---`);
    } catch (error) {
        console.error('CRITICAL: Reminder Scheduler Error:', error);
    }
};
