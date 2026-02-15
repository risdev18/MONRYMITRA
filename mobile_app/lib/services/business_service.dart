import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/business.dart';

class BusinessService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Get Business Profile for a User
  Future<Business?> getBusiness(String userId) async {
    final doc = await _db.collection('businesses').doc(userId).get();
    if (!doc.exists) return null;
    return Business.fromFirestore(doc);
  }

  // Create or Update Business Profile
  Future<void> saveBusiness(String userId, Business business) async {
    await _db.collection('businesses').doc(userId).set(business.toFirestore());
  }

  // Toggle Auto Reminders
  Future<void> toggleAutoReminders(String userId, bool enabled) async {
    await _db.collection('businesses').doc(userId).update({
      'autoRemindersEnabled': enabled,
    });
  }

  // Activate Subscription (₹199 for 1 Month)
  Future<void> activateSubscription(String userId) async {
    final now = DateTime.now();
    final expiry = DateTime(now.year, now.month + 1, now.day);
    await _db.collection('businesses').doc(userId).update({
      'subscriptionExpiry': Timestamp.fromDate(expiry),
    });
  }

  // Validate Coupon
  Future<Map<String, dynamic>?> validateCoupon(String code) async {
    final snapshot = await _db
        .collection('coupons')
        .where('code', isEqualTo: code.toUpperCase())
        .where('isActive', isEqualTo: true)
        .get();

    if (snapshot.docs.isEmpty) return null;
    
    final data = snapshot.docs.first.data();
    return {
      'id': snapshot.docs.first.id,
      'discount': (data['discount'] ?? 0).toDouble(),
    };
  }

  // Admin: Generate Coupon
  Future<void> generateCoupon(String code, double discount) async {
    await _db.collection('coupons').add({
      'code': code.toUpperCase(),
      'discount': discount,
      'isActive': true,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }
}
