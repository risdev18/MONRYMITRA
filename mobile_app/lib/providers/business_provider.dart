import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/business.dart';
import '../services/business_service.dart';
import 'auth_provider.dart';

class BusinessState {
  final Business? business;
  final bool isLoading;
  final String? error;

  BusinessState({this.business, this.isLoading = false, this.error});

  BusinessState copyWith({Business? business, bool? isLoading, String? error}) {
    return BusinessState(
      business: business ?? this.business,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  String get name => business?.name ?? "MoneyMitra";
  String get reminderTime => business?.reminderTime ?? "10:00 AM";
  bool get autoRemindersEnabled => business?.autoRemindersEnabled ?? true;
}

class BusinessNotifier extends StateNotifier<BusinessState> {
  final BusinessService _service = BusinessService();
  final String? _userId;

  BusinessNotifier(this._userId) : super(BusinessState()) {
    if (_userId != null) _load();
  }

  Future<void> _load() async {
    state = state.copyWith(isLoading: true);
    try {
      final business = await _service.getBusiness(_userId!);
      state = state.copyWith(business: business, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> saveBusiness(Business business) async {
    if (_userId == null) return;
    state = state.copyWith(isLoading: true);
    try {
      await _service.saveBusiness(_userId!, business);
      state = state.copyWith(business: business, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> toggleAutoReminders(bool enabled) async {
    if (_userId == null || state.business == null) return;
    try {
      await _service.toggleAutoReminders(_userId!, enabled);
      state = state.copyWith(
        business: Business(
          id: state.business!.id,
          name: state.business!.name,
          ownerName: state.business!.ownerName,
          phone: state.business!.phone,
          autoRemindersEnabled: enabled,
          reminderTime: state.business!.reminderTime,
        ),
      );
    } catch (e) {
      // Log error
    }
  }
}

final businessProvider = StateNotifierProvider<BusinessNotifier, BusinessState>((ref) {
  final auth = ref.watch(authProvider);
  return BusinessNotifier(auth.user?.uid);
});
