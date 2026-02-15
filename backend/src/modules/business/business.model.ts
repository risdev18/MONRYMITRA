import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    language: { type: String, enum: ['HINDI', 'MARATHI', 'ENGLISH'], default: 'ENGLISH' },
    businessType: {
        type: String,
        enum: ['GYM', 'TUITION', 'RENT', 'SOCIETY', 'SHOP', 'WORKSHOP', 'SUBSCRIPTION'],
        required: true
    },
    autoRemindersEnabled: { type: Boolean, default: false },
    reminderTime: { type: String, default: '08:00' },
    createdAt: { type: Date, default: Date.now }
});

export const Business = mongoose.model('Business', businessSchema);

const userPreferencesSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    dashboardLayout: { type: String, default: 'GRID' },
    enabledModules: [{ type: String }],
    theme: { type: String, default: 'light' }
});

export const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
