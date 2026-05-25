import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hyphen/models/city.dart';
import 'package:hyphen/managers/shipping_manager.dart';

class CityAutocompleteField extends StatelessWidget {
  final ValueChanged<City> onSelected;
  final String labelText;
  final String hintText;
  final String? initialValue;

  const CityAutocompleteField({
    super.key,
    required this.onSelected,
    this.labelText = 'Asal Pengiriman (Kota)',
    this.hintText = 'Ketik nama kota, misal: Jakarta Selatan',
    this.initialValue,
  });

  @override
  Widget build(BuildContext context) {
    return Autocomplete<City>(
      initialValue: initialValue != null ? TextEditingValue(text: initialValue!) : null,
      optionsBuilder: (TextEditingValue textEditingValue) async {
        if (textEditingValue.text.length < 3) {
          return const Iterable<City>.empty();
        }
        return await ShippingManager().searchCities(textEditingValue.text);
      },
      displayStringForOption: (City option) => option.label,
      onSelected: onSelected,
      fieldViewBuilder: (context, controller, focusNode, onEditingComplete) {
        return TextFormField(
          controller: controller,
          focusNode: focusNode,
          onEditingComplete: onEditingComplete,
          decoration: InputDecoration(
            labelText: labelText,
            hintText: hintText,
            hintStyle: GoogleFonts.plusJakartaSans(
              color: Colors.black38,
              fontSize: 14,
            ),
            labelStyle: GoogleFonts.plusJakartaSans(
              color: Colors.black54,
              fontSize: 14,
            ),
            filled: true,
            fillColor: const Color(0xFFF6F6F6),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.all(16),
            suffixIcon: const Icon(Icons.location_on_outlined, color: Colors.black26),
          ),
          style: GoogleFonts.plusJakartaSans(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '$labelText wajib diisi';
            }
            return null;
          },
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(16),
            color: Colors.white,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: 250,
                maxWidth: MediaQuery.of(context).size.width - 40,
              ),
              child: ListView.separated(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: options.length,
                separatorBuilder: (context, index) => const Divider(height: 1, color: Color(0xFFF0F0F0)),
                itemBuilder: (context, index) {
                  final option = options.elementAt(index);
                  return InkWell(
                    onTap: () => onSelected(option),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        option.label,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}
