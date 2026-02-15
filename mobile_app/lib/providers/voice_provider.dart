import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/voice_service.dart';
import '../voice/intent_router.dart';

enum VoiceState { idle, listening, processing, speaking }

class VoiceNotifier extends StateNotifier<VoiceState> {
  final VoiceService _service;
  
  VoiceNotifier(this._service) : super(VoiceState.idle);

  Future<void> startListening() async {
    state = VoiceState.listening;
    await _service.listen(onResult: (text) async {
      state = VoiceState.processing;
      print("User said: $text");
      
      final intent = IntentRouter.parse(text);
      await _handleIntent(intent);
      
      state = VoiceState.idle;
    });
  }

  Future<void> _handleIntent(VoiceIntent intent) async {
    switch (intent.type) {
      case VoiceIntentType.ADD_CUSTOMER:
        final name = intent.params['name'] ?? 'Unknown';
        await _service.speak("Opening Add Customer for $name");
        // Trigger Navigation or Modal here
        break;
      case VoiceIntentType.SEND_REMINDER:
        await _service.speak("Sending reminder");
        break;
      case VoiceIntentType.UNKNOWN:
        await _service.speak("Sorry, I did not understand.");
        break;
      default:
        break;
    }
  }

  Future<void> speak(String text) async {
    state = VoiceState.speaking;
    await _service.speak(text);
    state = VoiceState.idle;
  }
}

final voiceServiceProvider = Provider((ref) => VoiceService());

final voiceProvider = StateNotifierProvider<VoiceNotifier, VoiceState>((ref) {
  final service = ref.watch(voiceServiceProvider);
  return VoiceNotifier(service);
});
