import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/customer.dart';
import '../services/customer_service.dart';
import 'auth_provider.dart';

final customerServiceProvider = Provider((ref) => CustomerService());

final customersStreamProvider = StreamProvider<List<Customer>>((ref) {
  final authState = ref.watch(authProvider);
  if (authState.user == null) return Stream.value([]);
  
  return ref.watch(customerServiceProvider).getCustomers(authState.user!.uid);
});

class CustomerNotifier extends StateNotifier<AsyncValue<void>> {
  final CustomerService _service;
  final String? _userId;

  CustomerNotifier(this._service, this._userId) : super(const AsyncValue.data(null));

  Future<void> addCustomer({
    required String name,
    required String phone,
    required double monthlyFee,
    required DateTime startDate,
    double initialDue = 0,
    String? notes,
  }) async {
    if (_userId == null) return;
    
    state = const AsyncValue.loading();
    try {
      // Calculate first next due date (1 month after start date)
      final nextDueDate = DateTime(startDate.year, startDate.month + 1, startDate.day);
      
      final customer = Customer(
        id: '', 
        userId: _userId!,
        name: name,
        phone: phone,
        amountDue: initialDue,
        monthlyFee: monthlyFee,
        startDate: startDate,
        nextDueDate: nextDueDate,
        notes: notes,
        createdAt: DateTime.now(),
      );
      await _service.addCustomer(customer);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteCustomer(String id) async {
    state = const AsyncValue.loading();
    try {
      await _service.hardDeleteCustomer(id); // Using hard delete as requested
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refreshDues() async {
    if (_userId == null) return;
    try {
      await _service.checkAndApplyMonthlyDues(_userId!);
    } catch (e) {
      // Silent error for auto-refresh
    }
  }

  Future<void> clearAll() async {
    if (_userId == null) return;
    state = const AsyncValue.loading();
    try {
      await _service.clearAllCustomers(_userId!);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final customerActionProvider = StateNotifierProvider<CustomerNotifier, AsyncValue<void>>((ref) {
  final service = ref.watch(customerServiceProvider);
  final auth = ref.watch(authProvider);
  return CustomerNotifier(service, auth.user?.uid);
});
