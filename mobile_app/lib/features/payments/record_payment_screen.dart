import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/payment.dart';
import '../../providers/auth_provider.dart';
import '../../services/payment_service.dart';

class RecordPaymentScreen extends ConsumerStatefulWidget {
  final String customerId;
  final String customerName;
  final double initialDue;

  const RecordPaymentScreen({
    super.key, 
    required this.customerId, 
    required this.customerName,
    required this.initialDue,
  });

  @override
  ConsumerState<RecordPaymentScreen> createState() => _RecordPaymentScreenState();
}

class _RecordPaymentScreenState extends ConsumerState<RecordPaymentScreen> {
  final TextEditingController amountController = TextEditingController();
  final PaymentService _paymentService = PaymentService();
  PaymentMethod _selectedMethod = PaymentMethod.cash;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // ⚠️ Auto-fill due amount
    amountController.text = widget.initialDue.toInt().toString();
  }

  @override
  void dispose() {
    amountController.dispose();
    super.dispose();
  }

  Future<void> _savePayment() async {
    final amount = double.tryParse(amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter a valid amount")),
      );
      return;
    }

    final auth = ref.read(authProvider);
    if (auth.user == null) return;

    setState(() => _isLoading = true);

    try {
      await _paymentService.recordPayment(
        customerId: widget.customerId,
        userId: auth.user!.uid,
        amount: amount,
        method: _selectedMethod,
      );
      
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("₹$amount paid via ${_selectedMethod.name.toUpperCase()}! Next due updated automatically."),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Receive Payment", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.customerName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text("Outstanding: ₹${widget.initialDue.toInt()}", style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.bold)),

            const SizedBox(height: 32),

            // Amount Input
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              autofocus: true,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.indigo),
              decoration: InputDecoration(
                labelText: "Amount Received (₹)",
                labelStyle: const TextStyle(fontSize: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                prefixText: "₹ ",
                filled: true,
                fillColor: Colors.indigo.withOpacity(0.05),
              ),
            ),

            const SizedBox(height: 16),

            // ⚠️ Quick Buttons (Full / Half / Custom)
            Row(
              children: [
                _QuickPayButton(
                  label: "FULL (₹${widget.initialDue.toInt()})",
                  onTap: () => setState(() => amountController.text = widget.initialDue.toInt().toString()),
                ),
                const SizedBox(width: 12),
                _QuickPayButton(
                  label: "HALF (₹${(widget.initialDue / 2).toInt()})",
                  onTap: () => setState(() => amountController.text = (widget.initialDue / 2).toInt().toString()),
                ),
                const SizedBox(width: 12),
                _QuickPayButton(
                  label: "CUSTOM",
                  onTap: () => amountController.clear(),
                  isOutlined: true,
                ),
              ],
            ),

            const SizedBox(height: 32),

            // ⚠️ Payment Mode Selection
            const Text("PAYMENT MODE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
            const SizedBox(height: 12),
            Row(
              children: [
                _ModeButton(
                  label: "CASH",
                  isSelected: _selectedMethod == PaymentMethod.cash,
                  onTap: () => setState(() => _selectedMethod = PaymentMethod.cash),
                  icon: Icons.money,
                ),
                const SizedBox(width: 12),
                _ModeButton(
                  label: "UPI",
                  isSelected: _selectedMethod == PaymentMethod.upi,
                  onTap: () => setState(() => _selectedMethod = PaymentMethod.upi),
                  icon: Icons.qr_code,
                ),
                const SizedBox(width: 12),
                _ModeButton(
                  label: "OTHER",
                  isSelected: _selectedMethod == PaymentMethod.online,
                  onTap: () => setState(() => _selectedMethod = PaymentMethod.online),
                  icon: Icons.more_horiz,
                ),
              ],
            ),

            const SizedBox(height: 48),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _savePayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _isLoading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text("Confirm & Update Balance", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
            
            const SizedBox(height: 16),
            const Center(
              child: Text(
                "Next due date will auto-update upon full payment",
                style: TextStyle(fontSize: 11, color: Colors.grey, fontStyle: FontStyle.italic),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickPayButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isOutlined;
  const _QuickPayButton({required this.label, required this.onTap, this.isOutlined = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isOutlined ? Colors.transparent : Colors.indigo.shade50,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.indigo.shade100),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.indigo.shade900),
          ),
        ),
      ),
    );
  }
}

class _ModeButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _ModeButton({required this.label, required this.icon, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? Colors.indigo : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? Colors.indigo : Colors.grey.shade300),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : Colors.grey.shade600, size: 24),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10, 
                  fontWeight: FontWeight.bold, 
                  color: isSelected ? Colors.white : Colors.grey.shade600
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
