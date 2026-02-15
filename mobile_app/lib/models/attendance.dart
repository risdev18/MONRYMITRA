import 'package:cloud_firestore/cloud_firestore.dart';

enum AttendanceStatus { present, absent, closed }

class Attendance {
  final String id;
  final String customerId;
  final String userId;
  final DateTime date;
  final AttendanceStatus status;

  Attendance({
    required this.id,
    required this.customerId,
    required this.userId,
    required this.date,
    required this.status,
  });

  factory Attendance.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Attendance(
      id: doc.id,
      customerId: data['customerId'] ?? '',
      userId: data['userId'] ?? '',
      date: (data['date'] as Timestamp).toDate(),
      status: _parseStatus(data['status']),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerId': customerId,
      'userId': userId,
      'date': Timestamp.fromDate(DateTime(date.year, date.month, date.day)), // Normalize to day
      'status': status.name.toUpperCase(),
    };
  }

  static AttendanceStatus _parseStatus(String? value) {
    switch (value) {
      case 'ABSENT': return AttendanceStatus.absent;
      case 'CLOSED': return AttendanceStatus.closed;
      default: return AttendanceStatus.present;
    }
  }
}
