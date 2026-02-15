import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'features/splash/splash_screen.dart';

class MoneyMitraApp extends ConsumerWidget {
  const MoneyMitraApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'MoneyMitra',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4CAF50), // Green for money/growth
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.poppinsTextTheme(), // Generic accessible font
      ),
      home: const SplashScreen(),
    );
  }
}
