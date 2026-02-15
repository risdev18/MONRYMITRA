import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    userId: string;
    planId: 'FREE' | 'BASIC' | 'PRO';
    amount: number;
    currency: string;
    provider: 'RAZORPAY';
    transactionId: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: Date;
    endDate: Date;
}

const SubscriptionSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    planId: { type: String, enum: ['FREE', 'BASIC', 'PRO'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: { type: String, default: 'RAZORPAY' },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true }
}, {
    timestamps: true
});

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
