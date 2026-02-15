import 'package:flutter/material.dart';
import 'admin_coupon_screen.dart';

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  final _userCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  void _login() {
    if (_userCtrl.text == "RishabhAnsh" && _passCtrl.text == "4137RishAnsh") {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AdminCouponScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Invalid Admin Credentials"), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("MoneyMitra Admin")),
      body: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          children: [
            const Icon(Icons.admin_panel_settings, size: 64, color: Colors.indigo),
            const SizedBox(height: 32),
            TextField(
              controller: _userCtrl,
              decoration: const InputDecoration(labelText: "Username"),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passCtrl,
              decoration: const InputDecoration(labelText: "Password"),
              obscureText: true,
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _login,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.black, foregroundColor: Colors.white),
                child: const Text("Enter Admin Panel"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
