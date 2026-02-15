import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/payment.dart';

class PaymentService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Record a payment and update customer's amount due in a SINGLE TRANSACTION
  Future<void> recordPayment({
    required String customerId,
    required String userId,
    required double amount,
    required PaymentMethod method,
    String? note,
  }) async {
    final customerRef = _db.collection('customers').doc(customerId);
    final paymentRef = _db.collection('payments').doc();

    await _db.runTransaction((transaction) async {
      // 1. Get current customer data
      DocumentSnapshot customerDoc = await transaction.get(customerRef);
      if (!customerDoc.exists) {
        throw Exception("Customer does not exist!");
      }

      double currentDue = (customerDoc.get('amountDue') ?? 0).toDouble();
      String billingCycle = customerDoc.get('billingCycle') ?? 'MONTHLY';
      int billingDuration = customerDoc.get('billingDuration') ?? 1;
      DateTime currentNextDue = (customerDoc.get('nextDueDate') as Timestamp?)?.toDate() ?? DateTime.now();

      // 2. Calculate new values
      double newDue = currentDue - amount;
      if (newDue < 0) newDue = 0;

      // Calculate next due date if they paid in full
      DateTime newNextDue = currentNextDue;
      if (newDue == 0) {
        if (billingCycle == 'MONTHLY') {
          newNextDue = DateTime(currentNextDue.year, currentNextDue.month + billingDuration, currentNextDue.day);
        } else if (billingCycle == 'WEEKLY') {
          newNextDue = currentNextDue.add(Duration(days: 7 * billingDuration));
        }
      }

      // 3. Update Customer
      transaction.update(customerRef, {
        'amountDue': newDue,
        'nextDueDate': Timestamp.fromDate(newNextDue),
      });

      // 4. Create Payment Record
      transaction.set(paymentRef, {
        'customerId': customerId,
        'userId': userId,
        'amount': amount,
        'method': method.name.toUpperCase(),
        'date': FieldValue.serverTimestamp(),
        'note': note,
      });
    });
  }

  // Get Stream of Payments for a Customer
  Stream<List<Payment>> getCustomerPayments(String customerId) {
    return _db
        .collection('payments')
        .where('customerId', isEqualTo: customerId)
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => Payment.fromFirestore(doc)).toList());
  }
}
