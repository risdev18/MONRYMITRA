import 'package:cloud_firestore/cloud_firestore.dart';

enum PaymentMethod { cash, upi, online, check }

class Payment {
  final String id;
  final String customerId;
  final String userId;
  final double amount;
  final PaymentMethod method;
  final DateTime date;
  final String? note;

  Payment({
    required this.id,
    required this.customerId,
    required this.userId,
    required this.amount,
    required this.method,
    required this.date,
    this.note,
  });

  factory Payment.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Payment(
      id: doc.id,
      customerId: data['customerId'] ?? '',
      userId: data['userId'] ?? '',
      amount: (data['amount'] ?? 0).toDouble(),
      method: _parseMethod(data['method']),
      date: (data['date'] as Timestamp).toDate(),
      note: data['note'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerId': customerId,
      'userId': userId,
      'amount': amount,
      'method': method.name.toUpperCase(),
      'date': Timestamp.fromDate(date),
      'note': note,
    };
  }

  static PaymentMethod _parseMethod(String? value) {
    switch (value) {
      case 'UPI': return PaymentMethod.upi;
      case 'ONLINE': return PaymentMethod.online;
      case 'CHECK': return PaymentMethod.check;
      default: return PaymentMethod.cash;
    }
  }
}
