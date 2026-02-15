import 'package:cloud_firestore/cloud_firestore.dart';

enum BillingCycle { monthly, weekly, fixed }
enum CustomerCategory { customer, student, staff, other }

class Customer {
  final String id;
  final String userId;
  final String name;
  final String phone;
  final double amountDue;
  final DateTime? nextDueDate;
  final String? notes;
  final String? avatarColor;
  final BillingCycle billingCycle;
  final int billingDuration;
  final double monthlyFee;
  final DateTime startDate;
  final CustomerCategory category;
  final String? photoUrl;
  final bool isActive;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.userId,
    required this.name,
    required this.phone,
    required this.amountDue,
    this.nextDueDate,
    this.notes,
    this.avatarColor,
    this.billingCycle = BillingCycle.monthly,
    this.billingDuration = 1,
    this.monthlyFee = 0,
    required this.startDate,
    this.category = CustomerCategory.customer,
    this.photoUrl,
    this.isActive = true,
    required this.createdAt,
  });

  factory Customer.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Customer(
      id: doc.id,
      userId: data['userId'] ?? '',
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      amountDue: (data['amountDue'] ?? 0).toDouble(),
      nextDueDate: (data['nextDueDate'] as Timestamp?)?.toDate(),
      notes: data['notes'],
      avatarColor: data['avatarColor'],
      billingCycle: _parseBillingCycle(data['billingCycle']),
      billingDuration: data['billingDuration'] ?? 1,
      monthlyFee: (data['monthlyFee'] ?? 0).toDouble(),
      startDate: (data['startDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      category: _parseCategory(data['category']),
      photoUrl: data['photoUrl'],
      isActive: data['isActive'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'name': name,
      'phone': phone,
      'amountDue': amountDue,
      'nextDueDate': nextDueDate != null ? Timestamp.fromDate(nextDueDate!) : null,
      'notes': notes,
      'avatarColor': avatarColor,
      'billingCycle': billingCycle.name.toUpperCase(),
      'billingDuration': billingDuration,
      'monthlyFee': monthlyFee,
      'startDate': Timestamp.fromDate(startDate),
      'category': category.name.toUpperCase(),
      'photoUrl': photoUrl,
      'isActive': isActive,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  static BillingCycle _parseBillingCycle(String? value) {
    switch (value) {
      case 'WEEKLY': return BillingCycle.weekly;
      case 'FIXED': return BillingCycle.fixed;
      default: return BillingCycle.monthly;
    }
  }

  static CustomerCategory _parseCategory(String? value) {
    switch (value) {
      case 'STUDENT': return CustomerCategory.student;
      case 'STAFF': return CustomerCategory.staff;
      case 'OTHER': return CustomerCategory.other;
      default: return CustomerCategory.customer;
    }
  }

  Customer copyWith({
    String? name,
    String? phone,
    double? amountDue,
    DateTime? nextDueDate,
    bool? isActive,
  }) {
    return Customer(
      id: id,
      userId: userId,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      amountDue: amountDue ?? this.amountDue,
      nextDueDate: nextDueDate ?? this.nextDueDate,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt,
      startDate: startDate,
    );
  }
}
