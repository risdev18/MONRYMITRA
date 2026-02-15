import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';

enum AuthStatus { authenticated, unauthenticated, loading }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  AuthState({this.status = AuthStatus.unauthenticated, this.user, this.errorMessage});

  AuthState copyWith({AuthStatus? status, User? user, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final _auth = FirebaseAuth.instance;

  AuthNotifier() : super(AuthState(status: AuthStatus.loading)) {
    _init();
  }

  void _init() {
    _auth.authStateChanges().listen((User? user) {
      if (user != null) {
        state = state.copyWith(status: AuthStatus.authenticated, user: user);
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated, user: null);
      }
    });
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
    } on FirebaseAuthException catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: e.message);
      rethrow;
    }
  }

  Future<void> signUp(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _auth.createUserWithEmailAndPassword(email: email, password: password);
    } on FirebaseAuthException catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: e.message);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
