import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    deviceId?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    details: { type: Schema.Types.Mixed }, // Flexible for storing event payload
    ipAddress: { type: String },
    deviceId: { type: String },
    timestamp: { type: Date, default: Date.now, expires: '365d' } // Auto-expire after 1 year
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
