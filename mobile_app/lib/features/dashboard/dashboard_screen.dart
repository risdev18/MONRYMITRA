import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/network_provider.dart';
import '../../widgets/customer_card.dart';
import '../../services/voice_service.dart';
import '../../providers/business_provider.dart';
import '../../providers/customer_provider.dart';
import '../../providers/payment_provider.dart';
import '../../voice/intent_router.dart';
import '../customers/add_customer_screen.dart';
import '../customers/customer_detail_screen.dart';
import '../exam/paper_generator_screen.dart';
import '../../models/business.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final VoiceService _voiceService = VoiceService();
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    // Auto-refresh dues on app open
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(customerActionProvider.notifier).refreshDues();
    });
  }

  void _startVoiceSetup() async {
    // ... existed logic
  }

  @override
  Widget build(BuildContext context) {
    final networkStatus = ref.watch(networkStatusProvider);
    final businessState = ref.watch(businessProvider);
    final customersAsync = ref.watch(customersStreamProvider);
    final currentMonthPaymentsAsync = ref.watch(currentMonthPaymentsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56.0),
        child: AppBar(
          title: Text(businessState.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          backgroundColor: Colors.white,
          centerTitle: false,
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.logout_outlined, color: Colors.black87, size: 22),
              onPressed: () => ref.read(authProvider.notifier).logout(),
            ),
          ],
        ),
      ),
      body: customersAsync.when(
        data: (customers) {
          final payments = currentMonthPaymentsAsync.value ?? [];
          final now = DateTime.now();
          final today = DateTime(now.year, now.month, now.day);
          
          final collectedThisMonth = payments.fold<double>(0, (sum, p) => sum + p.amount);

          final totalPending = customers.fold<double>(0, (sum, c) => sum + c.amountDue);
          
          final dueTodayCount = customers.where((c) {
            if (c.nextDueDate == null) return false;
            final dueDate = DateTime(c.nextDueDate!.year, c.nextDueDate!.month, c.nextDueDate!.day);
            return dueDate.isAtSameMomentAs(today) && c.amountDue > 0;
          }).length;

          final overdueMembers = customers.where((c) => 
            c.amountDue > 0 && 
            (c.nextDueDate != null && c.nextDueDate!.isBefore(today))
          ).toList();

          return RefreshIndicator(
            onRefresh: () async {
               ref.refresh(customersStreamProvider);
               ref.read(customerActionProvider.notifier).refreshDues();
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 100),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (networkStatus == NetworkStatus.offline)
                    Container(
                      width: double.infinity,
                      color: Colors.amber.shade100,
                      padding: const EdgeInsets.all(8),
                      child: const Text('📡 Offline Mode', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                    ),
                  
                  // Subscription Status Banner
                  _SubscriptionBanner(business: businessState.business),
                  
                  // 1. Stats Numbers (MUST HAVE #4)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _StatCard(
                          label: "Total Pending",
                          amount: totalPending.toInt(),
                          color: Colors.red.shade600,
                          icon: Icons.error_outline,
                        ),
                        const SizedBox(width: 8),
                        _StatCard(
                          label: "Month Collected",
                          amount: collectedThisMonth.toInt(),
                          color: Colors.green.shade600,
                          icon: Icons.check_circle_outline,
                        ),
                        const SizedBox(width: 8),
                        _StatCard(
                          label: "Due Today",
                          amount: dueTodayCount,
                          color: Colors.orange.shade700,
                          icon: Icons.notifications_active_outlined,
                          isCount: true,
                        ),
                      ],
                    ),
                  ),

                  // 2. Defaulters Alert
                  if (overdueMembers.isNotEmpty)
                    _DefaultersWidget(members: overdueMembers),

                  // 3. Killer Feature: Auto Remote
                  _AutoReminderCard(businessState: businessState),

                  const SizedBox(height: 24),

                  // 4. Quick Actions
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _QuickActionBtn(
                            icon: Icons.person_add_alt_1,
                            label: "Member",
                            color: Colors.indigo,
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddCustomerScreen())),
                          ),
                          const SizedBox(width: 12),
                          _QuickActionBtn(
                            icon: Icons.mic,
                            label: "Speak",
                            color: Colors.purple,
                            onTap: _startVoiceSetup,
                          ),
                          const SizedBox(width: 12),
                          _QuickActionBtn(
                            icon: Icons.send_rounded,
                            label: "Broadcast",
                            color: Colors.green,
                            onTap: () {},
                          ),
                          // ⚠️ Conditional Feature: AI Question Paper
                          if (businessState.business?.category == BusinessCategory.TUITION || 
                              businessState.business?.category == BusinessCategory.COLLEGE) ...[
                            const SizedBox(width: 12),
                            _QuickActionBtn(
                              icon: Icons.description_outlined, // Paper icon
                              label: "Exam Paper",
                              color: Colors.orange,
                              onTap: () => Navigator.push(
                                context, 
                                MaterialPageRoute(builder: (_) => const PaperGeneratorScreen())
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 5. Members List Header
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text("Members List", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),

                  const SizedBox(height: 8),

                  if (customers.isEmpty)
                    const _EmptyState()
                  else
                    ...customers.map((c) => CustomerCard(
                      id: c.id,
                      name: c.name,
                      phone: c.phone,
                      amountDue: c.amountDue,
                      shopName: businessState.name,
                      onEdit: () {},
                      onDelete: () => ref.read(customerActionProvider.notifier).deleteCustomer(c.id),
                    )),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: Padding(
          padding: EdgeInsets.all(40.0),
          child: CircularProgressIndicator(),
        )),
        error: (err, _) => Center(child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Text("Connection Error. Try again. ($err)"),
        )),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _startVoiceSetup,
        backgroundColor: _isListening ? Colors.red : const Color(0xFF6366F1),
        label: Text(_isListening ? "Listening..." : "Speak Entry", style: const TextStyle(fontWeight: FontWeight.bold)),
        icon: Icon(_isListening ? Icons.mic : Icons.mic_none),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

class _DefaultersWidget extends StatelessWidget {
  final List<dynamic> members;
  const _DefaultersWidget({required this.members});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.red.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.report_problem, color: Colors.red.shade700, size: 20),
              const SizedBox(width: 8),
              Text(
                "⚠️ ${members.length} Members Overdue!",
                style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            "These members missed their payment deadline. Tap below to send reminders to all.",
            style: TextStyle(fontSize: 12, color: Colors.black54),
          ),
          const SizedBox(height: 12),
          ...members.take(3).map((m) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text("Due since: ${_formatDate(m.nextDueDate)}", style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
                Text("₹${m.amountDue.toInt()}", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
              ],
            ),
          )),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () async {
              // ⚠️ Bulk Sending Logic
              for (var member in members) {
                final message = WhatsAppService.generateReminderMessage(
                  customerName: member.name,
                  shopName: "MoneyMitra Shop", // We should fetch actual shop name
                  amount: member.amountDue,
                );
                await WhatsAppService.openWhatsApp(phone: member.phone, message: message);
                // We add a small delay to allow owner to send and come back
                await Future.delayed(const Duration(milliseconds: 500));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              elevation: 0,
            ),
            icon: const Icon(Icons.whatsapp, size: 20),
            label: const Text("Send Reminders to All", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return "N/A";
    return "${date.day}/${date.month}";
  }
}

class _AutoReminderCard extends ConsumerWidget {
  final dynamic businessState;
  const _AutoReminderCard({required this.businessState});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.bolt, color: Colors.indigo, size: 20),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Daily Auto-Reminders", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text("Sends messages at 8 AM", style: TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          Switch(
            value: businessState.autoRemindersEnabled, 
            onChanged: (v) => ref.read(businessProvider.notifier).toggleAutoReminders(v),
            activeColor: Colors.indigo,
          ),
        ],
      ),
    );
  }
}

class _SubscriptionBanner extends StatelessWidget {
  final Business? business;
  const _SubscriptionBanner({this.business});

  @override
  Widget build(BuildContext context) {
    if (business == null) return const SizedBox.shrink();
    
    final now = DateTime.now();
    final isTrial = now.isBefore(business!.trialExpiry);
    final expiryDate = isTrial ? business!.trialExpiry : business!.subscriptionExpiry;
    
    if (expiryDate == null) return const SizedBox.shrink();
    
    final daysLeft = expiryDate.difference(now).inDays;
    
    if (daysLeft > 7) return const SizedBox.shrink(); // Don't annoy them early

    return Container(
      width: double.infinity,
      color: isTrial ? Colors.blue.shade50 : Colors.orange.shade50,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      child: Row(
        children: [
          Icon(isTrial ? Icons.timer_outlined : Icons.warning_amber_rounded, 
               size: 16, color: isTrial ? Colors.blue : Colors.orange),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isTrial 
                ? "Your 3-day Free Trial expires in $daysLeft ${daysLeft == 1 ? 'day' : 'days'}"
                : "Your subscription expires in $daysLeft ${daysLeft == 1 ? 'day' : 'days'}",
              style: TextStyle(
                fontSize: 12, 
                fontWeight: FontWeight.bold, 
                color: isTrial ? Colors.blue.shade900 : Colors.orange.shade900
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              // Navigate to Paywall or Billing
            },
            child: const Text("PAY NOW", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.indigo)),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int amount;
  final Color color;
  final IconData icon;
  final bool isCount;

  const _StatCard({
    required this.label, 
    required this.amount, 
    required this.color, 
    required this.icon,
    this.isCount = false,
  });

  @override
  Widget build(BuildContext context) {
    String displayAmount = isCount 
      ? amount.toString() 
      : "₹${amount >= 1000 ? '${(amount / 1000).toStringAsFixed(1)}k' : amount}";

    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 8),
            Text(displayAmount, 
                 style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(label, 
                 textAlign: TextAlign.center,
                 style: const TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _QuickActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionBtn({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(60.0),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.people_outline, size: 64, color: Color(0xFFCBD5E1)),
            SizedBox(height: 16),
            Text("No members yet", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
