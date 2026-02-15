import { Customer } from "../customers/customer.model";
import { Transaction } from "./transaction.model";

export const processAutoDues = async (userId: string) => {
    const now = new Date();
    // Find active customers where nextDueDate is in the past
    const overdueCustomers = await Customer.find({
        userId,
        isActive: true,
        nextDueDate: { $lt: now }
    });

    let updatedCount = 0;

    for (const cust of overdueCustomers) {
        if (cust.monthlyFee > 0 && cust.nextDueDate) {
            // 1. Add Fee
            cust.amountDue += cust.monthlyFee;

            // 2. Calculate New Next Due Date
            const oldDue = new Date(cust.nextDueDate);
            const newDue = new Date(oldDue);

            if (cust.billingCycle === 'MONTHLY') {
                newDue.setMonth(newDue.getMonth() + (cust.billingDuration || 1));
            } else if (cust.billingCycle === 'WEEKLY') {
                newDue.setDate(newDue.getDate() + (7 * (cust.billingDuration || 1)));
            }

            // If newDue is STILL in the past (e.g. missed 3 months), 
            // we should technically add multiple fees or just set it to next cycle.
            // For MVP simpler logic: just advance it once per check OR set to next future date.
            // Let's simple advance once to check "missed payment".

            // To prevent infinite loop if someone hasn't logged in for a year:
            // Force it to be at least "future" relative to the OLD due date? 
            // Or maybe just advance it to next valid slot.

            // Logic: "You missed the date. I added the fee. Now the new due date is Next Month."
            cust.nextDueDate = newDue;

            await cust.save();

            // 3. Log Transaction
            await Transaction.create({
                userId,
                customerId: cust._id,
                amount: cust.monthlyFee,
                type: 'FEE',
                notes: `Auto Fee for period ending ${oldDue.toLocaleDateString()}`,
                date: now
            });

            updatedCount++;
        }
    }

    return updatedCount;
};
