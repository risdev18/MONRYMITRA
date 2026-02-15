import 'package:url_launcher/url_launcher.dart';

class WhatsAppService {
  static Future<void> openWhatsApp({
    required String phone,
    required String message,
  }) async {
    // Clean phone number (remove +91 or spaces if needed, but 'wa.me' handles international format usually)
    // Assuming phone is stored with country code like 919876543210
    
    final Uri whatsappUrl = Uri.parse("https://wa.me/$phone?text=${Uri.encodeComponent(message)}");

    try {
      if (await canLaunchUrl(whatsappUrl)) {
        await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
      } else {
        // Fallback for some devices or simulators
        print("Could not launch WhatsApp for $phone");
        // Try generic sms/tel as last resort or show error
      }
    } catch (e) {
      print("Error launching WhatsApp: $e");
    }
  }

  static String generateReminderMessage({
    required String customerName,
    required String shopName,
    required double amount,
  }) {
    return "🙏 Namaste $customerName,\n\nYour balance of *₹$amount* is pending at *$shopName*.\n\nPlease clear it at your earliest convenience. \n\n_Sent via MoneyMitra – Paise Vasooli ka Tension Khatam_ 🚀";
  }
}
