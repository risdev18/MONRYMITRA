import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
    customerId: string;
    userId: string;
    amount: number;
    scheduledAt: Date;
    status: 'PENDING' | 'QUEUED' | 'SENT' | 'FAILED';
    channel: 'WHATSAPP' | 'SMS';
    attemptCount: number;
    lastAttemptAt?: Date;
    errorMessage?: string;
    nextRetryAt?: Date;
}

const ReminderSchema: Schema = new Schema({
    customerId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ['PENDING', 'QUEUED', 'SENT', 'FAILED'], default: 'PENDING' },
    channel: { type: String, enum: ['WHATSAPP', 'SMS'], default: 'WHATSAPP' },
    attemptCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    errorMessage: { type: String },
    nextRetryAt: { type: Date }
}, {
    timestamps: true
});

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
