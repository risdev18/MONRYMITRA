import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import customerRoutes from './modules/customers/customer.routes';
import syncRoutes from './modules/sync/sync.routes';
import reminderRoutes from './modules/reminders/reminder.routes';
import subscriptionRoutes from './modules/subscriptions/subscription.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import transactionRoutes from './modules/transactions/transaction.routes';
import businessRoutes from './modules/business/business.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate Limiting (Basic IP based)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging
app.use(morgan('dev'));

// Body Parsers
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        env: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/business', businessRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server if not imported (for testing)
import { connectDB } from './config/database';
import { initAuditLogSubscriber } from './services/audit-log.service';
import { scheduleRemindersJob } from './jobs/reminder-scheduler';

if (require.main === module) {
    connectDB().then(() => {
        initAuditLogSubscriber();
        // Run every hour to check for businesses whose reminderTime has arrived
        setInterval(scheduleRemindersJob, 60 * 60 * 1000);
        app.listen(config.PORT, () => {
            console.log(`MoneyMitra Backend running on port ${config.PORT}`);
            console.log(`Environment: ${config.NODE_ENV}`);
        });
    });
}

export default app;
