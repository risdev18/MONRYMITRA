import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum NetworkStatus { online, offline }

class NetworkNotifier extends StateNotifier<NetworkStatus> {
  NetworkNotifier() : super(NetworkStatus.online) {
    _init();
  }

  void _init() {
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result == ConnectivityResult.none) {
        state = NetworkStatus.offline;
      } else {
        state = NetworkStatus.online;
      }
    });
  }
}

final networkStatusProvider = StateNotifierProvider<NetworkNotifier, NetworkStatus>((ref) {
  return NetworkNotifier();
});
