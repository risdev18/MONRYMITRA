enum VoiceIntentType {
  ADD_CUSTOMER,
  SEND_REMINDER,
  SHOW_REPORTS,
  UNKNOWN
}

class VoiceIntent {
  final VoiceIntentType type;
  final Map<String, dynamic> params;

  VoiceIntent(this.type, this.params);
}

class IntentRouter {
  static VoiceIntent parse(String text) {
    String lower = text.toLowerCase();

    // 1. Add Customer (Regex)
    // "Add customer Rahul gym 1500 monthly"
    // "Rahul ko jodo 1500 monthly"
    if (lower.contains('add') || lower.contains('jodo') || lower.contains('create')) {
        final nameMatch = RegExp(r'(?:add|jodo|create)\s+(?:customer|grahak)?\s*([a-zA-Z]+)').firstMatch(lower);
        final amountMatch = RegExp(r'(\d+)').firstMatch(lower);
        final frequencyMatch = RegExp(r'(monthly|weekly|daily|daily basis)').firstMatch(lower);

        String? name = nameMatch?.group(1);
        String? amount = amountMatch?.group(1);
        String? frequency = frequencyMatch?.group(1) ?? 'monthly';

        return VoiceIntent(VoiceIntentType.ADD_CUSTOMER, {
          'name': name,
          'amount': amount,
          'frequency': frequency,
          'category': lower.contains('gym') ? 'Gym' : (lower.contains('tuition') ? 'Tuition' : 'General')
        });
    }

    // 2. Send Reminder
    // "Rahul ko reminder bhejo"
    if (lower.contains('reminder') || lower.contains('bhejo')) {
        final nameMatch = RegExp(r'(?:to|ko)\s*([a-zA-Z]+)').firstMatch(lower);
        String? name = nameMatch?.group(1);
        return VoiceIntent(VoiceIntentType.SEND_REMINDER, {'name': name});
    }
    
    // 3. Reports
    if (lower.contains('report') || lower.contains('hisab')) {
        return VoiceIntent(VoiceIntentType.SHOW_REPORTS, {});
    }

    return VoiceIntent(VoiceIntentType.UNKNOWN, {'original': text});
  }
}
