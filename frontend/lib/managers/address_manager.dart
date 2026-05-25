import 'package:flutter/material.dart';
import 'package:hyphen/models/address.dart';
import 'package:hyphen/services/api_client.dart';
import 'package:dio/dio.dart' as dio;

class AddressManager extends ChangeNotifier {
  static final AddressManager _instance = AddressManager._internal();
  factory AddressManager() => _instance;
  AddressManager._internal();

  List<Address> _addresses = [];
  List<Address> get addresses => List.unmodifiable(_addresses);

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  /// Fetch all addresses for the logged-in user
  Future<void> fetchAddresses() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiClient().dio.get('/address/addresses');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        _addresses = data.map((json) => Address.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching addresses: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get the default address, or the first address if none is marked default
  Address? get defaultAddress {
    if (_addresses.isEmpty) return null;
    try {
      return _addresses.firstWhere((a) => a.isDefault);
    } catch (_) {
      return _addresses.first;
    }
  }

  /// Add a new address
  Future<String?> addAddress({
    required String label,
    required String recipientName,
    required String phone,
    required String address,
    required String postalCode,
    required String destinationCityId,
    required String destinationCityLabel,
    bool isDefault = false,
  }) async {
    try {
      final response = await ApiClient().dio.post('/address/add', data: {
        'label': label,
        'recipientName': recipientName,
        'phone': phone,
        'address': address,
        'postalCode': postalCode,
        'destinationCityId': destinationCityId,
        'destinationCityLabel': destinationCityLabel,
        'isDefault': isDefault,
      });

      if (response.statusCode == 201) {
        await fetchAddresses();
        return null; // Success
      }
      return response.data['message'] ?? 'Failed to add address';
    } on dio.DioException catch (e) {
      return e.response?.data['message'] ?? e.message;
    } catch (e) {
      return e.toString();
    }
  }
}
