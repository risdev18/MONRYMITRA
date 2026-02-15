import 'package:isar/isar.dart';

part 'offline_queue.g.dart';

@collection
class OfflineQueue {
  Id id = Isar.autoIncrement;

  @Index()
  late String action; // e.g., 'CREATE_CUSTOMER', 'UPDATE_PAYMENT'

  late String payload; // JSON string of the data

  @Index()
  late DateTime createdAt;

  @Index()
  bool isSynced = false;

  int retryCount = 0;
}
