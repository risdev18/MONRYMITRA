import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';

class VoiceService {
  final SpeechToText _speech = SpeechToText();
  final FlutterTts _tts = FlutterTts();
  bool _isInitialized = false;

  Future<bool> init() async {
    if (_isInitialized) return true;
    bool available = await _speech.initialize(
      onError: (val) => print('onError: $val'),
      onStatus: (val) => print('onStatus: $val'),
    );
    if (available) {
      _isInitialized = true;
      await _tts.setLanguage("en-IN");
      await _tts.setPitch(1.0);
    }
    return available;
  }

  Future<void> speak(String text) async {
    await _tts.speak(text);
  }

  Future<void> listen({required Function(String) onResult}) async {
    if (!_isInitialized) await init();
    
    await _speech.listen(
      onResult: (result) {
        if (result.finalResult) {
          onResult(result.recognizedWords);
        }
      },
      localeId: 'en_IN', // Dynamic based on user preference
      listenFor: const Duration(seconds: 5),
    );
  }

  Future<void> stop() async {
    await _speech.stop();
    await _tts.stop();
  }
}
