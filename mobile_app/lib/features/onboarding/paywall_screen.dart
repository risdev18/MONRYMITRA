import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/business_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/business_service.dart';
import '../dashboard/dashboard_screen.dart';

class PaywallScreen extends ConsumerStatefulWidget {
  const PaywallScreen({super.key});

  @override
  ConsumerState<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends ConsumerState<PaywallScreen> {
  final _couponCtrl = TextEditingController();
  final _businessService = BusinessService();
  double _price = 199.0;
  String? _appliedCoupon;
  bool _isLoading = false;

  Future<void> _applyCoupon() async {
    final code = _couponCtrl.text.trim();
    if (code.isEmpty) return;

    setState(() => _isLoading = true);
    final result = await _businessService.validateCoupon(code);
    setState(() => _isLoading = false);

    if (result != null) {
      setState(() {
        _appliedCoupon = code.toUpperCase();
        _price = 199.0 - (result['discount'] ?? 0);
        if (_price < 0) _price = 0;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Coupon Applied! Discount: ₹${result['discount']}"), backgroundColor: Colors.green),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Invalid or Expired Coupon"), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _pay() async {
    final auth = ref.read(authProvider);
    if (auth.user == null) return;

    setState(() => _isLoading = true);
    // In a real app, this is where Razorpay/PhonePe SDK would go
    await _businessService.activateSubscription(auth.user!.uid);
    // Refresh business provider
    ref.refresh(businessProvider);
    setState(() => _isLoading = false);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final business = ref.watch(businessProvider).business;
    final isTrial = business != null && DateTime.now().isAfter(business.trialExpiry);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_clock_outlined, size: 80, color: Colors.indigo),
              const SizedBox(height: 24),
              Text(
                isTrial ? "Trial Expired 🛑" : "Subscription Ended",
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              const Text(
                "To continue using MoneyMitra and collect your pending dues, please subscribe.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 48),
              
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.indigo.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.indigo.shade100),
                ),
                child: Column(
                  children: [
                    const Text("Premium Monthly Plan", style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(
                      "₹${_price.toInt()}",
                      style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.indigo),
                    ),
                    const Text("per month", style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _couponCtrl,
                      decoration: InputDecoration(
                        hintText: "Enter Coupon Code",
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _applyCoupon,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo.shade100,
                      foregroundColor: Colors.indigo,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text("Apply"),
                  ),
                ],
              ),
              if (_appliedCoupon != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text("Coupon $_appliedCoupon Applied!", style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                ),

              const Spacer(),
              
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _pay,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Pay & Activate Now", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
