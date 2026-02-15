import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/attendance.dart';

class AttendanceService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Mark attendance for a member on a specific day
  Future<void> markAttendance({
    required String customerId,
    required String userId,
    required DateTime date,
    required AttendanceStatus status,
  }) async {
    // Canonical ID for the day: customerId_yyyy_mm_dd
    final dateStr = "${date.year}_${date.month}_${date.day}";
    final docId = "${customerId}_$dateStr";

    await _db.collection('attendance').doc(docId).set({
      'customerId': customerId,
      'userId': userId,
      'date': Timestamp.fromDate(DateTime(date.year, date.month, date.day)),
      'status': status.name.toUpperCase(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  // Get attendance stream for a member
  Stream<List<Attendance>> getCustomerAttendance(String customerId) {
    return _db
        .collection('attendance')
        .where('customerId', isEqualTo: customerId)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => Attendance.fromFirestore(doc)).toList());
  }

  // Get attendance for all members on a specific day
  Stream<List<Attendance>> getDailyAttendance(String userId, DateTime date) {
    final start = Timestamp.fromDate(DateTime(date.year, date.month, date.day));
    final end = Timestamp.fromDate(DateTime(date.year, date.month, date.day, 23, 59, 59));

    return _db
        .collection('attendance')
        .where('userId', isEqualTo: userId)
        .where('date', isGreaterThanOrEqualTo: start)
        .where('date', isLessThanOrEqualTo: end)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => Attendance.fromFirestore(doc)).toList());
  }
}
