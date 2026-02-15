import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/voice_provider.dart';

class VoiceOnboardingScreen extends ConsumerStatefulWidget {
  const VoiceOnboardingScreen({super.key});

  @override
  ConsumerState<VoiceOnboardingScreen> createState() => _VoiceOnboardingScreenState();
}

class _VoiceOnboardingScreenState extends ConsumerState<VoiceOnboardingScreen> {
  int _step = 0;
  
  final List<String> _prompts = [
    "Welcome to MoneyMitra. I am your assistant. What is your Shop's name?",
    "Great! Now, tell me your phone number.",
    "Do you want to add your first customer now?",
  ];

  @override
  void initState() {
    super.initState();
    _playPrompt();
  }

  void _playPrompt() {
    if (_step < _prompts.length) {
      ref.read(voiceProvider.notifier).speak(_prompts[_step]);
    } else {
       // Finish
       Navigator.pop(context);
    }
  }

  void _nextStep() {
    setState(() {
      _step++;
    });
    _playPrompt();
  }

  @override
  Widget build(BuildContext context) {
    final voiceState = ref.watch(voiceProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            // Avatar
            Container(
              height: 200,
              width: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.green.shade50,
              ),
              child: Icon(
                Icons.smart_toy_rounded, 
                size: 100, 
                color: voiceState == VoiceState.listening ? Colors.red : Colors.green
              ),
            ),
            const SizedBox(height: 32),
            // Text Log
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                _step < _prompts.length ? _prompts[_step] : "Setup Complete!",
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const Spacer(),
            // Mic Button
            GestureDetector(
              onTap: () {
                ref.read(voiceProvider.notifier).startListening();
                // Mock next step after listen for prototype
                Future.delayed(const Duration(seconds: 4), () => _nextStep());
              },
              child: CircleAvatar(
                radius: 40,
                backgroundColor: Colors.green,
                child: Icon(
                  voiceState == VoiceState.listening ? Icons.mic_off : Icons.mic,
                  color: Colors.white, 
                  size: 32
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text("Tap to Speak"),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
