import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../services/whatsapp_service.dart';
import '../features/payments/record_payment_screen.dart';
import '../features/customers/customer_detail_screen.dart';

class CustomerCard extends StatelessWidget {
  final String id;
  final String name;
  final String phone;
  final double amountDue;
  final String shopName;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const CustomerCard({
    super.key,
    required this.id,
    required this.name,
    required this.phone,
    required this.amountDue,
    required this.shopName,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    // Determine status color
    Color statusColor = Colors.green;
    String statusText = "Settled";
    
    if (amountDue > 0) {
      statusColor = Colors.red;
      statusText = "Overdue";
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CustomerDetailScreen(customerId: id),
                ),
              );
            },
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Avatar with Color Indicator
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        name[0].toUpperCase(),
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 22,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Name & Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                statusText,
                                style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              amountDue > 0 ? "₹${amountDue.toInt()} Pending" : "Clear",
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: amountDue > 0 ? Colors.black87 : Colors.green,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Delete Button (Requested to be individual option)
                  IconButton(
                    icon: Icon(Icons.delete_outline, color: Colors.grey.shade400, size: 20),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text("Delete Customer?"),
                          content: const Text("Are you sure you want to remove this data permanently?"),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
                            TextButton(
                              onPressed: () {
                                onDelete();
                                Navigator.pop(ctx);
                              }, 
                              child: const Text("Delete", style: TextStyle(color: Colors.red))
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          // Quick Action Footer (MUST HAVE #5)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _DirectAction(
                  icon: Icons.call,
                  label: "Call",
                  color: Colors.blue,
                  onTap: () async {
                    final Uri tel = Uri.parse('tel:$phone');
                    if (await canLaunchUrl(tel)) await launchUrl(tel);
                  },
                ),
                _DirectAction(
                  icon: FontAwesomeIcons.whatsapp,
                  label: "Remind",
                  color: const Color(0xFF25D366),
                  onTap: () {
                    final message = WhatsAppService.generateReminderMessage(
                      customerName: name,
                      shopName: shopName,
                      amount: amountDue,
                    );
                    WhatsAppService.openWhatsApp(phone: phone, message: message);
                  },
                ),
                _DirectAction(
                  icon: Icons.payments,
                  label: "Mark Paid",
                  color: Colors.indigo,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RecordPaymentScreen(
                          customerId: id,
                          customerName: name,
                          initialDue: amountDue,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DirectAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _DirectAction({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}
