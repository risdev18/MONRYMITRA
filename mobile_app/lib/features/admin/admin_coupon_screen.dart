import 'package:flutter/material.dart';
import '../../services/business_service.dart';

class AdminCouponScreen extends StatefulWidget {
  const AdminCouponScreen({super.key});

  @override
  State<AdminCouponScreen> createState() => _AdminCouponScreenState();
}

class _AdminCouponScreenState extends State<AdminCouponScreen> {
  final _codeCtrl = TextEditingController();
  final _discountCtrl = TextEditingController();
  final _businessService = BusinessService();
  bool _isLoading = false;

  Future<void> _generate() async {
    final code = _codeCtrl.text.trim();
    final discount = double.tryParse(_discountCtrl.text) ?? 0;

    if (code.isEmpty || discount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Enter valid code and discount")));
      return;
    }

    setState(() => _isLoading = true);
    await _businessService.generateCoupon(code, discount);
    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Coupon $code generated successfully!"), backgroundColor: Colors.green),
      );
      _codeCtrl.clear();
      _discountCtrl.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Generate Coupons")),
      body: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          children: [
            const Text("Admin Control: Create Discounts", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            TextField(
              controller: _codeCtrl,
              decoration: const InputDecoration(labelText: "Coupon Code (e.g. SAVE50)", border: OutlineInputBorder()),
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _discountCtrl,
              decoration: const InputDecoration(labelText: "Discount Amount (₹)", border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _generate,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white),
                child: const Text("Generate Coupon Now"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
