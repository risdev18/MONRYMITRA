import { Request, Response } from 'express';
import { Business, UserPreferences } from './business.model';

const generateDashboardConfig = (businessType: string) => {
    switch (businessType) {
        case 'GYM':
            return ["members", "attendance", "monthly_fees", "reminders"];
        case 'TUITION':
            return ["students", "batch", "fees", "attendance"];
        case 'SHOP':
            return ["customers", "credit_ledger", "payments", "reminders", "inventory"];
        case 'RENT':
            return ["tenants", "rent_due", "payment_history", "reminders"];
        case 'SOCIETY':
            return ["units", "maintenance_dues", "complaints", "reminders"];
        default:
            return ["customers", "payments", "reminders"];
    }
};

export const setupBusiness = async (req: any, res: Response) => {
    try {
        const { businessName, ownerName, phone, city, language, businessType } = req.body;
        const userId = req.user.uid;

        const business = await Business.create({
            userId,
            businessName,
            ownerName,
            phone,
            city,
            language,
            businessType
        });

        const modules = generateDashboardConfig(businessType);

        const preferences = await UserPreferences.create({
            userId,
            enabledModules: modules,
            dashboardLayout: 'GRID'
        });

        res.status(201).json({ business, preferences });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to setup business' });
    }
};

export const getBusinessInfo = async (req: any, res: Response) => {
    try {
        const userId = req.user.uid;
        const business = await Business.findOne({ userId });
        const preferences = await UserPreferences.findOne({ userId });
        res.status(200).json({ business, preferences });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch business info' });
    }
};

export const updateBusinessSettings = async (req: any, res: Response) => {
    try {
        const userId = req.user.uid;
        const { autoRemindersEnabled, reminderTime } = req.body;

        const business = await Business.findOneAndUpdate(
            { userId },
            {
                $set: {
                    ...(autoRemindersEnabled !== undefined && { autoRemindersEnabled }),
                    ...(reminderTime !== undefined && { reminderTime })
                }
            },
            { new: true }
        );

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        res.status(200).json({ business });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
