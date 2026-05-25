class Address {
  final String id;
  final String label;
  final String recipientName;
  final String phone;
  final String fullAddress;
  final String postalCode;
  final String destinationCityId;
  final String? destinationCityLabel;
  final bool isDefault;

  Address({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.phone,
    required this.fullAddress,
    required this.postalCode,
    required this.destinationCityId,
    this.destinationCityLabel,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      label: json['label'],
      recipientName: json['recipientName'],
      phone: json['phone'],
      fullAddress: json['address'],
      postalCode: json['postalCode'],
      destinationCityId: json['destinationCityId'].toString(),
      destinationCityLabel: json['destinationCityLabel'],
      isDefault: json['isDefault'] == 1 || json['isDefault'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'recipientName': recipientName,
      'phone': phone,
      'address': fullAddress,
      'postalCode': postalCode,
      'destinationCityId': destinationCityId,
      'destinationCityLabel': destinationCityLabel,
      'isDefault': isDefault,
    };
  }
}
