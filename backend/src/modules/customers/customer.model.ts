import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    userId: string; // Reference to the shop owner
    name: string;
    phone: string;
    amountDue: number;
    dueDate?: Date;
    notes?: string;
    avatarColor?: string; // Hex code for UI
    reminderFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    createdOffline: boolean;
    monthlyFee: number;
    billingCycle: 'MONTHLY' | 'WEEKLY' | 'FIXED';
    billingDuration: number;
    startDate: Date;
    nextDueDate: Date;
    expiryDate: Date;

    address?: string;
    category?: 'CUSTOMER' | 'STUDENT' | 'STAFF' | 'OTHER';
    photoUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    amountDue: { type: Number, default: 0 },
    dueDate: { type: Date },
    notes: { type: String },
    avatarColor: { type: String, default: 'blue' },
    reminderFrequency: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], default: 'WEEKLY' },
    createdOffline: { type: Boolean, default: false },
    monthlyFee: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ['MONTHLY', 'WEEKLY', 'FIXED'], default: 'MONTHLY' },
    billingDuration: { type: Number, default: 1 }, // e.g., Every 1 Month, or Every 3 Months
    startDate: { type: Date, default: Date.now },
    nextDueDate: { type: Date },
    expiryDate: { type: Date }, // For fixed packages where membership ends

    // New Fields for Enhanced Profile
    address: { type: String },
    category: { type: String, enum: ['CUSTOMER', 'STUDENT', 'STAFF', 'OTHER'], default: 'CUSTOMER' },
    photoUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    // Ensure unique phone per user (handled by index below but good to be explicit)
});

// Middleware to set nextDueDate on creation if not present
CustomerSchema.pre('save', function (next) {
    if (this.isNew && !this.nextDueDate) {
        const start = this.startDate || new Date();
        const nextDate = new Date(start);

        if (this.billingCycle === 'MONTHLY') {
            nextDate.setMonth(nextDate.getMonth() + (this.billingDuration || 1));
        } else if (this.billingCycle === 'WEEKLY') {
            nextDate.setDate(nextDate.getDate() + (7 * (this.billingDuration || 1)));
        }
        // FIXED usually implies a specific end date, or one-time, 
        // but for MVP we might just set it to null or far future if not recurring.

        this.nextDueDate = nextDate;
    }
    next();
});

// Compound index to ensure phone number is unique PER USER
CustomerSchema.index({ userId: 1, phone: 1 }, { unique: true });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
