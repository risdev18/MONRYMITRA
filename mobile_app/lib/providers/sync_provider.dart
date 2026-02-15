import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/isar_service.dart';
import '../offline/offline_queue.dart';
import 'network_provider.dart';
import 'package:isar/isar.dart';

enum SyncState { idle, syncing, success, error }

class SyncNotifier extends StateNotifier<SyncState> {
  final IsarService isarService;
  final Ref ref;

  SyncNotifier(this.isarService, this.ref) : super(SyncState.idle) {
    _listenToNetwork();
  }

  void _listenToNetwork() {
    ref.listen(networkStatusProvider, (previous, next) {
      if (next == NetworkStatus.online) {
        processQueue();
      }
    });
  }

  Future<void> addToQueue(String action, String payload) async {
    final isar = await isarService.db;
    final item = OfflineQueue()
      ..action = action
      ..payload = payload
      ..createdAt = DateTime.now();

    await isar.writeTxn(() async {
      await isar.offlineQueues.put(item);
    });

    // Try to sync immediately if online
    if (ref.read(networkStatusProvider) == NetworkStatus.online) {
      processQueue();
    }
  }

  Future<void> processQueue() async {
    if (state == SyncState.syncing) return;

    state = SyncState.syncing;
    try {
      final isar = await isarService.db;
      final pendingItems = await isar.offlineQueues
          .filter()
          .isSyncedEqualTo(false)
          .findAll();

      if (pendingItems.isEmpty) {
        state = SyncState.success;
        return;
      }

      for (final item in pendingItems) {
        bool success = await _syncItem(item);
        if (success) {
          await isar.writeTxn(() async {
            item.isSynced = true;
            await isar.offlineQueues.put(item); // Or delete
            await isar.offlineQueues.delete(item.id);
          });
        }
      }
      state = SyncState.success;
    } catch (e) {
      state = SyncState.error;
      print('Sync Error: $e');
    }
  }

  Future<bool> _syncItem(OfflineQueue item) async {
    // TODO: Call Backend API based on item.action
    await Future.delayed(const Duration(milliseconds: 500)); // Mock
    return true;
  }
}

final isarServiceProvider = Provider((ref) => IsarService());

final syncProvider = StateNotifierProvider<SyncNotifier, SyncState>((ref) {
  final isarService = ref.watch(isarServiceProvider);
  return SyncNotifier(isarService, ref);
});
