import 'package:flutter/foundation.dart';
import 'package:hyphen/services/api_client.dart';
import 'package:hyphen/models/product_model.dart';
import 'package:dio/dio.dart';

class AdminDashboardStats {
  final int totalUsers;
  final int activeSellers;
  final int curatedProducts;
  final int pendingProducts;

  AdminDashboardStats({
    required this.totalUsers,
    required this.activeSellers,
    required this.curatedProducts,
    required this.pendingProducts,
  });

  factory AdminDashboardStats.fromJson(Map<String, dynamic> json) {
    return AdminDashboardStats(
      totalUsers: json['totalUsers'] ?? 0,
      activeSellers: json['activeSellers'] ?? 0,
      curatedProducts: json['curatedProducts'] ?? 0,
      pendingProducts: json['pendingProducts'] ?? 0,
    );
  }
}

class AdminManager extends ChangeNotifier {
  static final AdminManager _instance = AdminManager._internal();
  factory AdminManager() => _instance;

  AdminManager._internal();

  AdminDashboardStats? _stats;
  AdminDashboardStats? get stats => _stats;

  List<Product> _pendingProducts = [];
  List<Product> get pendingProducts => List.unmodifiable(_pendingProducts);

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> fetchDashboardStats() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiClient().dio.get('/admin/stats');
      if (response.statusCode == 200) {
        _stats = AdminDashboardStats.fromJson(response.data['data']);
      }
    } catch (e) {
      print('Error fetching dashboard stats: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchPendingProducts() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiClient().dio.get('/product/pending');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        _pendingProducts.clear();
        _pendingProducts.addAll(data.map((json) => Product.fromJson(json)).toList());
      }
    } catch (e) {
      print('Error fetching pending products: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> approveProduct(String productId) async {
    try {
      final response = await ApiClient().dio.put('/product/$productId/approve');
      if (response.statusCode == 200) {
        _pendingProducts.removeWhere((p) => p.id == productId);
        fetchDashboardStats();
        notifyListeners();
        return null; // success
      }
      return 'Unexpected status code: ${response.statusCode}';
    } catch (e) {
      if (e is DioException) {
        return 'DioError: ${e.response?.statusCode} - ${e.response?.data}';
      }
      return 'Error: $e';
    }
  }

  Future<String?> rejectProduct(String productId) async {
    try {
      final response = await ApiClient().dio.put('/product/$productId/reject');
      if (response.statusCode == 200) {
        _pendingProducts.removeWhere((p) => p.id == productId);
        fetchDashboardStats();
        notifyListeners();
        return null; // success
      }
      return 'Unexpected status code: ${response.statusCode}';
    } catch (e) {
      if (e is DioException) {
        return 'DioError: ${e.response?.statusCode} - ${e.response?.data}';
      }
      return 'Error: $e';
    }
  }

  void clearCache() {
    _stats = null;
    _pendingProducts.clear();
    notifyListeners();
  }
}
