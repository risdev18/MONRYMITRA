import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/customer_provider.dart';
import '../../providers/business_provider.dart';
import '../../services/whatsapp_service.dart';
import '../attendance/attendance_tab.dart';
import '../payments/record_payment_screen.dart';

class CustomerDetailScreen extends ConsumerWidget {
  final String customerId;

  const CustomerDetailScreen({
    super.key, 
    required this.customerId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(customersStreamProvider);
    final business = ref.watch(businessProvider);
    
    return customersAsync.when(
      data: (customers) {
        final customer = customers.firstWhere(
          (c) => c.id == customerId,
          orElse: () => throw Exception('Member not found'),
        );

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            title: const Text("Member Profile", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            elevation: 0,
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
          ),
          body: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1️⃣ Name & Due Amount (BIG)
                      Center(
                        child: Column(
                          children: [
                            CircleAvatar(
                              radius: 40,
                              backgroundColor: Colors.indigo.shade50,
                              child: Text(customer.name[0].toUpperCase(), 
                                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.indigo)),
                            ),
                            const SizedBox(height: 16),
                            Text(customer.name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text(
                              "₹${customer.amountDue.toInt()}",
                              style: TextStyle(
                                fontSize: 40, 
                                fontWeight: FontWeight.w900, 
                                color: customer.amountDue > 0 ? Colors.red.shade700 : Colors.green.shade700
                              ),
                            ),
                            Text(
                              customer.amountDue > 0 ? "TOTAL OUTSTANDING" : "ALL CLEAR ✅",
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 40),

                      // 2️⃣ Plan Details
                      _InfoSection(
                        title: "PLAN DETAILS",
                        value: "${customer.category.name.toUpperCase()} - ${customer.billingCycle.name.toUpperCase()}",
                        icon: Icons.assignment_outlined,
                      ),
                      
                      const SizedBox(height: 24),

                      // 3️⃣ Next Due Date
                      _InfoSection(
                        title: "NEXT BILLING DATE",
                        value: _formatDate(customer.nextDueDate),
                        icon: Icons.calendar_month_outlined,
                        valueColor: Colors.indigo,
                      ),

                      const SizedBox(height: 40),

                      // 4️⃣ Attendance Summary
                      const Text("ATTENDANCE HISTORY", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                      const SizedBox(height: 16),
                      AttendanceTab(customerId: customerId, isEmbed: true),
                    ],
                  ),
                ),
              ),

              // 5️⃣ Action Buttons (Decision Points at the bottom)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          final message = WhatsAppService.generateReminderMessage(
                            customerName: customer.name,
                            shopName: business.name,
                            amount: customer.amountDue,
                          );
                          WhatsAppService.openWhatsApp(phone: customer.phone, message: message);
                        },
                        icon: const Icon(Icons.whatsapp),
                        label: const Text("Reminder"),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF25D366),
                          side: const BorderSide(color: Color(0xFF25D366)),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => RecordPaymentScreen(
                             customerId: customerId,
                             customerName: customer.name,
                             initialDue: customer.amountDue,
                           )));
                        },
                        icon: const Icon(Icons.payments_outlined),
                        label: const Text("Record Payment"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, _) => Scaffold(body: Center(child: Text("Error: $err"))),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return "Not Set";
    return "${date.day} ${_getMonthName(date.month)} ${date.year}";
  }
  
  String _getMonthName(int month) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1];
  }
}

class _InfoSection extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color? valueColor;

  const _InfoSection({required this.title, required this.value, required this.icon, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: Colors.grey.shade700, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
            const SizedBox(height: 2),
            Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: valueColor ?? Colors.black87)),
          ],
        ),
      ],
    );
  }
}
