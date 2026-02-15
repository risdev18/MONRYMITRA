import 'package:cloud_firestore/cloud_firestore.dart';

enum BusinessCategory { GYM, SHOP, CLINIC, SERVICE, TUITION, COLLEGE, OTHER }

class Business {
  final String id;
  final String name;
  final String ownerName;
  final String? logoUrl;
  final String phone;
  final bool autoRemindersEnabled;
  final String reminderTime; // e.g., "10:00 AM"
  final BusinessCategory category;

  final DateTime createdAt;
  final DateTime trialExpiry;
  final DateTime? subscriptionExpiry;

  Business({
    required this.id,
    required this.name,
    required this.ownerName,
    this.logoUrl,
    required this.phone,
    this.autoRemindersEnabled = true,
    this.reminderTime = "10:00 AM",
    this.category = BusinessCategory.OTHER,
    required this.createdAt,
    required this.trialExpiry,
    this.subscriptionExpiry,
  });

  factory Business.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Business(
      id: doc.id,
      name: data['name'] ?? '',
      ownerName: data['ownerName'] ?? '',
      logoUrl: data['logoUrl'],
      phone: data['phone'] ?? '',
      autoRemindersEnabled: data['autoRemindersEnabled'] ?? true,
      reminderTime: data['reminderTime'] ?? "10:00 AM",
      category: _parseCategory(data['category']),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      trialExpiry: (data['trialExpiry'] as Timestamp?)?.toDate() ?? DateTime.now().add(const Duration(days: 3)),
      subscriptionExpiry: (data['subscriptionExpiry'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'ownerName': ownerName,
      'logoUrl': logoUrl,
      'phone': phone,
      'autoRemindersEnabled': autoRemindersEnabled,
      'reminderTime': reminderTime,
      'category': category.name,
      'createdAt': Timestamp.fromDate(createdAt),
      'trialExpiry': Timestamp.fromDate(trialExpiry),
      'subscriptionExpiry': subscriptionExpiry != null ? Timestamp.fromDate(subscriptionExpiry!) : null,
    };
  }

  bool get isSubscriptionActive {
    final now = DateTime.now();
    // Check if within 3-day trial
    if (now.isBefore(trialExpiry)) return true;
    
    // Check if paid subscription is active
    if (subscriptionExpiry != null && now.isBefore(subscriptionExpiry!)) {
      return true;
    }
    
    return false;
  }

  static BusinessCategory _parseCategory(String? value) {
    if (value == null) return BusinessCategory.OTHER;
    return BusinessCategory.values.firstWhere(
      (e) => e.name == value.toUpperCase(),
      orElse: () => BusinessCategory.OTHER,
    );
  }
}
