import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { User } from '../modules/users/user.model';
import { logAudit } from '../services/audit-log.service';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any; // We will define a strict IUser interface later
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);

        // Find or Create User in MongoDB
        // We sync basic details from Firebase to Mongo on every authed request (lazy sync)
        // In a high-traffic app, we might cache this or only do it on login.
        let user = await User.findOne({ uid: decodedToken.uid });

        if (!user) {
            user = await User.create({
                uid: decodedToken.uid,
                email: decodedToken.email,
                phone: decodedToken.phone_number,
                name: decodedToken.name || 'User',
                role: 'OWNER', // Default role
                isActive: true,
                createdFromDevice: req.headers['x-device-id'] || 'unknown',
                lastSyncAt: new Date()
            });

            logAudit({
                userId: user.uid,
                action: 'USER_REGISTERED',
                entity: 'USER',
                entityId: user._id,
                details: { method: 'firebase_auth' }
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
