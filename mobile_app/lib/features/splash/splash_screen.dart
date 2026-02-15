import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import '../onboarding/business_setup_screen.dart';
import '../onboarding/paywall_screen.dart';
import '../../providers/business_provider.dart';
import '../dashboard/dashboard_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  Widget build(BuildContext context) {
    // Listen to combined state of Auth and Business
    final auth = ref.watch(authProvider);
    final business = ref.watch(businessProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (auth.status == AuthStatus.authenticated && !business.isLoading) {
        if (business.business == null) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const BusinessSetupScreen()),
          );
        } else if (!business.business!.isSubscriptionActive) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const PaywallScreen()),
          );
        } else {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const DashboardScreen()),
          );
        }
      } else if (auth.status == AuthStatus.unauthenticated) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    });

    return const Scaffold(
      backgroundColor: Color(0xFF4CAF50),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.monetization_on, size: 80, color: Colors.white),
            SizedBox(height: 16),
            Text(
              'MoneyMitra',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8),
            CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}
