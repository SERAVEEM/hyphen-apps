import 'package:flutter/material.dart';
import 'package:hyphen/models/city.dart';
import 'package:hyphen/services/api_client.dart';
import 'package:hyphen/data/indonesian_cities.dart';
import 'package:dio/dio.dart' as dio;

class ShippingManager extends ChangeNotifier {
  static final ShippingManager _instance = ShippingManager._internal();
  factory ShippingManager() => _instance;
  ShippingManager._internal();

  /// Fetches cities matching the query — tries RajaOngkir API first,
  /// falls back to local bundled data if the API is unavailable.
  Future<List<City>> searchCities(String query) async {
    if (query.trim().isEmpty) return [];

    try {
      final response = await ApiClient().dio.get(
        '/shipping/cities',
        queryParameters: {'search': query},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        if (data.isNotEmpty) {
          return data.map((json) => City.fromJson(json)).toList();
        }
      }
      // If API returned empty or non-200, fall back to local
      return searchLocalCities(query);
    } on dio.DioException catch (e) {
      debugPrint('City API unavailable (${e.message}), using local data');
      return searchLocalCities(query);
    } catch (e) {
      debugPrint('City search error: $e, using local data');
      return searchLocalCities(query);
    }
  }
  /// Fetches shipping costs from RajaOngkir
  Future<List<Map<String, dynamic>>> calculateShipping({
    required String originCityId,
    required String destinationCityId,
    required int weightGram,
    String? courier,
  }) async {
    try {
      final response = await ApiClient().dio.post(
        '/shipping/cost',
        data: {
          'originCityId': originCityId,
          'destinationCityId': destinationCityId,
          'weightGram': weightGram,
          if (courier != null) 'courier': courier,
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } on dio.DioException catch (e) {
      debugPrint('Error calculating shipping: ${e.message}');
      return [];
    } catch (e) {
      debugPrint('Error calculating shipping: $e');
      return [];
    }
  }
}
