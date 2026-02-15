import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: string;
    customerId: string;
    amount: number;
    type: 'PAYMENT' | 'FEE'; // PAYMENT = Customer paid, FEE = Monthly charge
    mode?: 'CASH' | 'UPI' | 'OTHER';
    notes?: string;
    date: Date;
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['PAYMENT', 'FEE'], required: true },
    mode: { type: String, enum: ['CASH', 'UPI', 'OTHER'] },
    notes: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
