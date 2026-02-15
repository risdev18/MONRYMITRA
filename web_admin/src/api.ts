import axios from 'axios';
import { db, auth } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    addDoc,
    Timestamp
} from 'firebase/firestore';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Helper to get current user ID
const getUserId = () => auth.currentUser?.uid;

// ==================== CUSTOMER API ====================
export const CustomerAPI = {
    getAll: async () => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const q = query(collection(db, 'customers'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const customers = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        return { data: customers };
    },

    getById: async (id: string) => {
        const docRef = doc(db, 'customers', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Customer not found');
        return { data: { _id: docSnap.id, ...docSnap.data() } };
    },

    create: async (data: any) => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const customerData = { ...data, userId, createdAt: Timestamp.now() };
        const docRef = await addDoc(collection(db, 'customers'), customerData);
        return { data: { _id: docRef.id, ...customerData } };
    },

    update: async (id: string, data: any) => {
        const docRef = doc(db, 'customers', id);
        await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
        return { data: { _id: id, ...data } };
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, 'customers', id));
        return { data: { success: true } };
    },

    recordPayment: async (customerId: string, data: any) => {
        const docRef = doc(db, 'customers', customerId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error('Customer not found');

        const customer = docSnap.data();
        const newAmountDue = (customer.amountDue || 0) - (data.amount || 0);

        await updateDoc(docRef, {
            amountDue: newAmountDue,
            lastPayment: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        // Log payment history
        await addDoc(collection(db, 'payments'), {
            customerId,
            userId: getUserId(),
            amount: data.amount,
            method: data.method || 'CASH',
            timestamp: Timestamp.now()
        });

        return { data: { success: true, newAmountDue } };
    }
};

// ==================== ATTENDANCE API ====================
export const AttendanceAPI = {
    mark: async (data: any) => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const attendanceData = { ...data, userId, timestamp: Timestamp.now() };
        const docRef = await addDoc(collection(db, 'attendance'), attendanceData);
        return { data: { _id: docRef.id, ...attendanceData } };
    },

    getByCustomer: async (customerId: string) => {
        const q = query(
            collection(db, 'attendance'),
            where('customerId', '==', customerId)
        );
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        return { data: records };
    },

    getStats: async (customerId: string) => {
        const records = await AttendanceAPI.getByCustomer(customerId);
        const present = records.data.filter((r: any) => r.status === 'PRESENT').length;
        const absent = records.data.filter((r: any) => r.status === 'ABSENT').length;
        return { data: { present, absent, total: present + absent } };
    }
};

// ==================== COUPON API ====================
export const CouponAPI = {
    getAll: async () => {
        const snapshot = await getDocs(collection(db, 'coupons'));
        const coupons = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        return { data: coupons };
    },

    create: async (data: any) => {
        const couponData = { ...data, createdAt: Timestamp.now() };
        const docRef = await addDoc(collection(db, 'coupons'), couponData);
        return { data: { _id: docRef.id, ...couponData } };
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, 'coupons', id));
        return { data: { success: true } };
    },

    validate: async (code: string) => {
        const q = query(
            collection(db, 'coupons'),
            where('code', '==', code.toUpperCase()),
            where('isActive', '==', true)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return { data: null };

        const coupon = snapshot.docs[0];
        return { data: { _id: coupon.id, ...coupon.data() } };
    }
};

// ==================== BUSINESS API ====================
export const BusinessAPI = {
    // Get all businesses (Admin only)
    getAll: async () => {
        const snapshot = await getDocs(collection(db, 'businesses'));
        const businesses = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        return { data: businesses };
    },

    // Get current user's business
    getCurrent: async () => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const docRef = doc(db, 'businesses', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return { data: null };
        return { data: { _id: docSnap.id, ...docSnap.data() } };
    },

    // Create/Update business
    save: async (data: any) => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const now = new Date();
        const trialExpiry = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days

        const businessData = {
            ...data,
            createdAt: Timestamp.fromDate(now),
            trialExpiry: Timestamp.fromDate(trialExpiry),
            paymentStatus: 'TRIAL'
        };

        await setDoc(doc(db, 'businesses', userId), businessData);
        return { data: { _id: userId, ...businessData } };
    },

    // User: Request Activation
    requestActivation: async (business: any) => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        await updateDoc(doc(db, 'businesses', userId), {
            paymentStatus: 'PENDING_APPROVAL',
            requestedAt: Timestamp.now()
        });

        return { data: { success: true } };
    },

    // Admin: Toggle Premium
    togglePremium: async (businessId: string, activate: boolean) => {
        const docRef = doc(db, 'businesses', businessId);

        if (activate) {
            const now = new Date();
            const expiry = new Date(now.setMonth(now.getMonth() + 1)); // +1 Month

            await updateDoc(docRef, {
                paymentStatus: 'PAID',
                subscriptionExpiry: Timestamp.fromDate(expiry),
                activatedAt: Timestamp.now()
            });
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            await updateDoc(docRef, {
                paymentStatus: 'EXPIRED',
                subscriptionExpiry: Timestamp.fromDate(yesterday)
            });
        }

        return { data: { success: true } };
    }
};

// ==================== TRANSACTION API (Mock/Real Mixed) ====================
export const TransactionAPI = {
    getAll: async () => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        // Fetch actual payments from Firestore
        const q = query(collection(db, 'payments'), where('userId', '==', userId));
        const snapshot = await getDocs(q);

        const transactions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                ...data,
                date: data.timestamp?.toDate() || new Date(), // Convert Firestore Timestamp
                type: 'PAYMENT', // Injected for Dashboard logic
                category: 'Payment Received'
            };
        });

        return { data: transactions };
    },

    getHistory: async (customerId: string) => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const q = query(
            collection(db, 'payments'),
            where('customerId', '==', customerId)
            // orderBy('timestamp', 'desc') // Requires index, skipping for now or sort client-side
        );
        const snapshot = await getDocs(q);

        const transactions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                ...data,
                date: data.timestamp?.toDate() || new Date(),
                type: 'PAYMENT',
                category: 'Payment Received'
            };
        });

        // Client-side sort to avoid index issues immediately
        transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

        return { data: transactions };
    },

    recordPayment: async (data: { customerId: string, amount: number, mode: string, notes?: string }) => {
        const userId = getUserId();
        if (!userId) throw new Error('Not authenticated');

        const { customerId, amount, mode, notes } = data;

        // 1. Get Customer to update balance
        const customerRef = doc(db, 'customers', customerId);
        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) throw new Error('Customer not found');

        const customer = customerSnap.data();
        const newAmountDue = (customer.amountDue || 0) - amount;

        // 2. Update Customer
        await updateDoc(customerRef, {
            amountDue: newAmountDue,
            lastPayment: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        // 3. Add Payment Record
        const paymentData = {
            customerId,
            userId,
            amount,
            method: mode || 'CASH',
            notes: notes || '',
            timestamp: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'payments'), paymentData);

        return { data: { _id: docRef.id, ...paymentData, newAmountDue } };
    }
};

export default api;
