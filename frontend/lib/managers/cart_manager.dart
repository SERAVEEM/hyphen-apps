import 'package:flutter/material.dart';
import 'package:hyphen/models/product_model.dart';
import 'package:hyphen/services/api_client.dart';
import 'package:dio/dio.dart' as dio;

class CartItem {
  final String id; // cart_items id
  final Product product;
  int quantity;
  String size;

  CartItem({
    required this.id,
    required this.product,
    this.quantity = 1,
    required this.size,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    // We construct a partial Product object since the backend joins it
    final product = Product(
      id: json['productId'].toString(),
      imageUrl: json['imageUrl'] ?? 'assets/images/placeholder.png',
      brand: 'Hyphen', // Backend doesn't join brand for now
      title: json['product_name'] ?? 'Product',
      price: double.tryParse(json['product_price'].toString()) ?? 0,
      size: json['size'] ?? 'M',
      condition: json['item_condition'] ?? 'good',
      category: json['productCategory'] ?? 'Daily',
      isVerified: true,
    );

    return CartItem(
      id: json['id'].toString(),
      product: product,
      quantity: int.tryParse(json['quantity'].toString()) ?? 1,
      size: json['size'] ?? '',
    );
  }
}

class CartManager extends ChangeNotifier {
  static final CartManager _instance = CartManager._internal();
  factory CartManager() => _instance;
  CartManager._internal();

  List<CartItem> _items = [];
  bool _isLoading = false;

  List<CartItem> get items => List.unmodifiable(_items);
  bool get isLoading => _isLoading;

  double get totalPrice {
    return _items.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));
  }

  int get totalQuantity {
    return _items.fold(0, (sum, item) => sum + item.quantity);
  }

  Future<void> fetchCart() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiClient().dio.get('/cart/getcart');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        _items = data.map((json) => CartItem.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching cart: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> addItem(Product product, {required String size, int quantity = 1}) async {
    try {
      final response = await ApiClient().dio.post('/cart/addcart', data: {
        'productId': product.id,
        'size': size,
        'quantity': quantity,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchCart();
        return null; // Success
      }
      return response.data['message'] ?? 'Failed to add to cart';
    } on dio.DioException catch (e) {
      return e.response?.data['message'] ?? e.message;
    } catch (e) {
      return e.toString();
    }
  }

  Future<void> removeItem(String productId, String size) async {
    try {
      final response = await ApiClient().dio.delete('/cart/removefromcart/$productId/$size');
      if (response.statusCode == 200) {
        await fetchCart();
      }
    } catch (e) {
      debugPrint('Error removing from cart: $e');
    }
  }

  Future<void> updateQuantity(String productId, String size, int quantity) async {
    if (quantity <= 0) {
      await removeItem(productId, size);
      return;
    }
    // Note: If your backend supports updating quantity, call it here.
    // For now, our backend /addcart only adds 1 and throws error if exists.
    // Assuming backend doesn't support update, we just fetchCart or handle locally.
  }

  Future<void> clear() async {
    try {
      final response = await ApiClient().dio.delete('/cart/clearcart');
      if (response.statusCode == 200) {
        _items.clear();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error clearing cart: $e');
    }
  }
}
