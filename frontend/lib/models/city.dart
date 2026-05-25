class City {
  final int id;
  final String label;

  City({
    required this.id,
    required this.label,
  });

  factory City.fromJson(Map<String, dynamic> json) {
    return City(
      id: json['id'],
      label: json['label'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
    };
  }

  @override
  String toString() => label;
}
