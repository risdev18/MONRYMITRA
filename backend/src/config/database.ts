import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
