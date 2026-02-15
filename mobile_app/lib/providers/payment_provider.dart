import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/payment.dart';
import '../services/payment_service.dart';
import 'auth_provider.dart';

final paymentServiceProvider = Provider((ref) => PaymentService());

final currentMonthPaymentsProvider = StreamProvider<List<Payment>>((ref) {
  final auth = ref.watch(authProvider);
  if (auth.user == null) return Stream.value([]);
  
  final now = DateTime.now();
  final startOfMonth = DateTime(now.year, now.month, 1);
  
  return FirebaseFirestore.instance
      .collection('payments')
      .where('userId', isEqualTo: auth.user!.uid)
      .where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfMonth))
      .snapshots()
      .map((snapshot) =>
          snapshot.docs.map((doc) => Payment.fromFirestore(doc)).toList());
});

final recentPaymentsProvider = StreamProvider<List<Payment>>((ref) {
  final auth = ref.watch(authProvider);
  if (auth.user == null) return Stream.value([]);
  
  return FirebaseFirestore.instance
      .collection('payments')
      .where('userId', isEqualTo: auth.user!.uid)
      .orderBy('date', descending: true)
      .limit(10)
      .snapshots()
      .map((snapshot) =>
          snapshot.docs.map((doc) => Payment.fromFirestore(doc)).toList());
});
