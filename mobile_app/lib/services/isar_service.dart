import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import '../offline/offline_queue.dart';

class IsarService {
  late Future<Isar> db;

  IsarService() {
    db = openDB();
  }

  Future<Isar> openDB() async {
    if (Isar.instanceNames.isEmpty) {
      final dir = await getApplicationDocumentsDirectory();
      return await Isar.open(
        [OfflineQueueSchema], // Add other schemas here (Customer, Payment)
        directory: dir.path,
        inspector: true,
      );
    }
    return Future.value(Isar.getInstance());
  }
}
