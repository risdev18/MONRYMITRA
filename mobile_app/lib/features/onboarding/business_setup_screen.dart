import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/business.dart';
import '../../providers/business_provider.dart';
import '../../providers/auth_provider.dart';
import '../dashboard/dashboard_screen.dart';

class BusinessSetupScreen extends ConsumerStatefulWidget {
  const BusinessSetupScreen({super.key});

  @override
  ConsumerState<BusinessSetupScreen> createState() => _BusinessSetupScreenState();
}

class _BusinessSetupScreenState extends ConsumerState<BusinessSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  BusinessCategory _category = BusinessCategory.GYM;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_formKey.currentState!.validate()) {
      final auth = ref.read(authProvider);
      if (auth.user == null) return;

      final now = DateTime.now();
      final business = Business(
        id: auth.user!.uid,
        name: _nameCtrl.text.trim(),
        ownerName: auth.user!.displayName ?? "Owner",
        phone: _phoneCtrl.text.trim(),
        category: _category,
        createdAt: now,
        trialExpiry: now.add(const Duration(days: 3)),
      );

      await ref.read(businessProvider.notifier).saveBusiness(business);
      
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Setup your\nBusiness 🚀",
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1.2),
                ),
                const SizedBox(height: 8),
                const Text(
                  "This helps us customize MoneyMitra for you.",
                  style: TextStyle(color: Colors.grey, fontSize: 16),
                ),
                const SizedBox(height: 48),
                
                TextFormField(
                  controller: _nameCtrl,
                  decoration: InputDecoration(
                    labelText: "Business Name",
                    hintText: "e.g. FitLife Gym or Apex Tuition",
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    prefixIcon: const Icon(Icons.business_outlined),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 24),

                TextFormField(
                  controller: _phoneCtrl,
                  decoration: InputDecoration(
                    labelText: "Contact Phone",
                    hintText: "e.g. 9876543210",
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    prefixIcon: const Icon(Icons.phone_outlined),
                  ),
                  keyboardType: TextInputType.phone,
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 24),

                const Text("What is your business type?", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  children: [
                    _TypeChip(
                      label: "Gym",
                      isSelected: _category == BusinessCategory.GYM,
                      onTap: () => setState(() => _category = BusinessCategory.GYM),
                    ),
                    _TypeChip(
                      label: "Tuition",
                      isSelected: _category == BusinessCategory.TUITION,
                      onTap: () => setState(() => _category = BusinessCategory.TUITION),
                    ),
                    _TypeChip(
                      label: "Shop",
                      isSelected: _category == BusinessCategory.SHOP,
                      onTap: () => setState(() => _category = BusinessCategory.SHOP),
                    ),
                    _TypeChip(
                      label: "Service",
                      isSelected: _category == BusinessCategory.SERVICE,
                      onTap: () => setState(() => _category = BusinessCategory.SERVICE),
                    ),
                  ],
                ),

                const Spacer(),
                
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: const Text("Start Using MoneyMitra", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TypeChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onTap(),
      selectedColor: Colors.indigo.shade100,
      checkmarkColor: Colors.indigo,
      labelStyle: TextStyle(
        color: isSelected ? Colors.indigo.shade900 : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
  }
}
