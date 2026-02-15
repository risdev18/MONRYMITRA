import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    customerId: string;
    userId: string;
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    notes?: string;
}

const AttendanceSchema: Schema = new Schema({
    customerId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true }, // For faster querying by shop owner
    date: { type: Date, required: true, index: true },
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
        default: 'PRESENT'
    },
    notes: { type: String }
}, {
    timestamps: true
});

// Composite index to prevent duplicate attendance for same customer on same day (handled in logic or here)
AttendanceSchema.index({ customerId: 1, date: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
