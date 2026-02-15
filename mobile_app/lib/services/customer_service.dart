import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/customer.dart';

class CustomerService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Get Stream of Customers for a specific User (Gym Owner)
  Stream<List<Customer>> getCustomers(String userId) {
    return _db
        .collection('customers')
        .where('userId', isEqualTo: userId)
        .where('isActive', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => Customer.fromFirestore(doc)).toList());
  }

  // Add new Customer
  Future<void> addCustomer(Customer customer) async {
    await _db.collection('customers').add(customer.toFirestore());
  }

  // Update Customer
  Future<void> updateCustomer(String id, Map<String, dynamic> data) async {
    await _db.collection('customers').doc(id).update(data);
  }

  // Soft Delete Customer
  Future<void> deleteCustomer(String id) async {
    await _db.collection('customers').doc(id).update({'isActive': false});
  }

  // Check and apply monthly dues automatically
  Future<void> checkAndApplyMonthlyDues(String userId) async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final snapshot = await _db
        .collection('customers')
        .where('userId', isEqualTo: userId)
        .where('isActive', isEqualTo: true)
        .get();

    final batch = _db.batch();
    bool hasChanges = false;

    for (var doc in snapshot.docs) {
      final data = doc.data();
      final nextDueDate = (data['nextDueDate'] as Timestamp?)?.toDate();
      final monthlyFee = (data['monthlyFee'] ?? 0).toDouble();
      final currentDue = (data['amountDue'] ?? 0).toDouble();
      final billingCycle = data['billingCycle'] ?? 'MONTHLY';

      // If due date passed (or is today) and we haven't applied for this cycle
      if (nextDueDate != null && nextDueDate.isBefore(now) && monthlyFee > 0) {
        double newDue = currentDue + monthlyFee;
        
        // Advance next due date
        DateTime newNextDue;
        if (billingCycle == 'WEEKLY') {
          newNextDue = nextDueDate.add(const Duration(days: 7));
        } else {
          newNextDue = DateTime(nextDueDate.year, nextDueDate.month + 1, nextDueDate.day);
        }

        batch.update(doc.reference, {
          'amountDue': newDue,
          'nextDueDate': Timestamp.fromDate(newNextDue),
        });
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await batch.commit();
    }
  }

  // Clear All Customers for a User
  Future<void> clearAllCustomers(String userId) async {
    final snapshot = await _db
        .collection('customers')
        .where('userId', isEqualTo: userId)
        .get();
    
    final batch = _db.batch();
    for (var doc in snapshot.docs) {
      batch.delete(doc.reference); // Hard delete as requested "option to delete individual data now"
    }
    await batch.commit();
  }

  // Hard delete individual customer
  Future<void> hardDeleteCustomer(String id) async {
    await _db.collection('customers').doc(id).delete();
  }
}
