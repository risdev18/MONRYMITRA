import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    uid: string; // Firebase UID
    name: string;
    email?: string;
    phone?: string;
    role: 'OWNER' | 'STAFF' | 'ADMIN';
    subscriptionPlan: 'FREE' | 'BASIC' | 'PRO';
    isActive: boolean;
    language: 'en' | 'hi' | 'mr';
    createdFromDevice?: string;
    lastSyncAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['OWNER', 'STAFF', 'ADMIN'], default: 'OWNER' },
    subscriptionPlan: { type: String, enum: ['FREE', 'BASIC', 'PRO'], default: 'FREE' },
    isActive: { type: Boolean, default: true },
    language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
    createdFromDevice: { type: String },
    lastSyncAt: { type: Date, default: Date.now },
}, {
    timestamps: true // Auto manage createdAt and updatedAt
});

export const User = mongoose.model<IUser>('User', UserSchema);
