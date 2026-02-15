import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../models/attendance.dart';
import '../../services/attendance_service.dart';
import '../../providers/auth_provider.dart';

class AttendanceTab extends ConsumerStatefulWidget {
  final String customerId;
  final bool isEmbed;
  const AttendanceTab({super.key, required this.customerId, this.isEmbed = false});

  @override
  ConsumerState<AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends ConsumerState<AttendanceTab> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  final AttendanceService _service = AttendanceService();

  Future<void> _markAttendance(AttendanceStatus status) async {
    final auth = ref.read(authProvider);
    if (auth.user == null) return;
    
    final dayToMark = _selectedDay ?? DateTime.now();

    try {
      await _service.markAttendance(
        customerId: widget.customerId,
        userId: auth.user!.uid,
        date: dayToMark,
        status: status,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Marked ${status.name.toUpperCase()} for ${_formatDate(dayToMark)}")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e")),
        );
      }
    }
  }

  String _formatDate(DateTime date) => "${date.day}/${date.month}";

  @override
  Widget build(BuildContext context) {
    final attendanceStream = _service.getCustomerAttendance(widget.customerId);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: widget.isEmbed ? BorderRadius.circular(14) : const BorderRadius.vertical(top: Radius.circular(24)),
        border: widget.isEmbed ? Border.all(color: Colors.grey.shade100) : null,
      ),
      child: StreamBuilder<List<Attendance>>(
        stream: attendanceStream,
        builder: (context, snapshot) {
          final events = snapshot.data ?? [];
          final eventMap = {
            for (var e in events) 
              DateTime(e.date.year, e.date.month, e.date.day): e.status
          };

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!widget.isEmbed) ...[
                const SizedBox(height: 12),
                Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
                const SizedBox(height: 24),
              ],
              
              TableCalendar(
                firstDay: DateTime.utc(2020, 1, 1),
                lastDay: DateTime.utc(2030, 12, 31),
                focusedDay: _focusedDay,
                selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                onDaySelected: (selectedDay, focusedDay) {
                  setState(() {
                    _selectedDay = selectedDay;
                    _focusedDay = focusedDay;
                  });
                },
                calendarFormat: CalendarFormat.month,
                headerStyle: const HeaderStyle(
                  formatButtonVisible: false, 
                  titleCentered: true,
                  titleTextStyle: TextStyle(fontWeight: FontWeight.bold),
                ),
                rowHeight: 45,
                daysOfWeekStyle: const DaysOfWeekStyle(
                  weekdayStyle: TextStyle(fontSize: 11, color: Colors.grey),
                  weekendStyle: TextStyle(fontSize: 11, color: Colors.grey),
                ),
                calendarStyle: CalendarStyle(
                  selectedDecoration: const BoxDecoration(color: Colors.indigo, shape: BoxShape.circle),
                  todayDecoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), shape: BoxShape.circle),
                  todayTextStyle: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold),
                ),
                eventLoader: (day) {
                  final status = eventMap[DateTime(day.year, day.month, day.day)];
                  return status != null ? [status] : [];
                },
                calendarBuilders: CalendarBuilders(
                  markerBuilder: (context, date, events) {
                    if (events.isEmpty) return null;
                    final status = events.first as AttendanceStatus;
                    Color color = Colors.green;
                    if (status == AttendanceStatus.absent) color = Colors.red;
                    if (status == AttendanceStatus.closed) color = Colors.black;

                    return Positioned(
                      bottom: 4,
                      child: Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16),
              
              // ⚠️ Legend & Instruction
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _LegendItem(color: Colors.green, label: "Present"),
                        SizedBox(width: 16),
                        _LegendItem(color: Colors.red, label: "Absent"),
                        SizedBox(width: 16),
                        _LegendItem(color: Colors.black, label: "Closed"),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _selectedDay == null ? "Tap a date to mark attendance" : "Marking for ${_formatDate(_selectedDay!)}",
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _selectedDay == null ? null : () => _markAttendance(AttendanceStatus.absent),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text("Absent"),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _selectedDay == null ? null : () => _markAttendance(AttendanceStatus.present),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        child: const Text("Present"),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          );
        }
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
