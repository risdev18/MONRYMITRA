import { Request, Response } from 'express';
import { Attendance } from './attendance.model';
import { Customer } from '../customers/customer.model';
import { startOfDay, endOfDay } from 'date-fns';

// Mark Attendance
export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { customerId, status, date, notes } = req.body;
        const userId = req.user.uid;

        const customer = await Customer.findOne({ _id: customerId, userId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const attendanceDate = new Date(date);

        // Check if record exists for this day
        const query = {
            customerId,
            date: {
                $gte: startOfDay(attendanceDate),
                $lte: endOfDay(attendanceDate)
            }
        };

        const update = { userId, status, notes, date: attendanceDate };
        const options = { upsert: true, new: true };

        const result = await Attendance.findOneAndUpdate(query, update, options);

        res.status(200).json(result);
    } catch (error) {
        console.error("Mark Attendance Error", error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

// Get Monthly Attendance
export const getMonthlyAttendance = async (req: Request, res: Response) => {
    try {
        const { customerId, month, year } = req.query;
        const userId = req.user.uid;

        if (!customerId || !month || !year) {
            return res.status(400).json({ error: 'Missing params' });
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        const records = await Attendance.find({
            customerId,
            userId,
            date: { $gte: startDate, $lte: endDate }
        });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
