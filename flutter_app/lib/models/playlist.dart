import 'package:flutter/material.dart';

class Playlist {
  final String id;
  final String name;
  final String description;
  final String curator;
  final List<String> gradient;
  final List<String> songIds;

  Playlist({
    required this.id,
    required this.name,
    required this.description,
    required this.curator,
    required this.gradient,
    required this.songIds,
  });

  factory Playlist.fromJson(Map<String, dynamic> json) {
    List<String> grads = ['#FA2D48', '#FF7A00'];
    if (json['gradient'] != null) {
      if (json['gradient'] is List) {
        grads = List<String>.from(json['gradient']);
      } else if (json['gradient'] is String) {
        grads = (json['gradient'] as String).split(',');
      }
    }

    return Playlist(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] ?? '',
      curator: json['curator'] ?? 'Apple Music',
      gradient: grads,
      songIds: json['songIds'] != null ? List<String>.from(json['songIds']) : [],
    );
  }

  Color get primaryColor {
    try {
      final hex = gradient.first.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFFFA2D48);
    }
  }

  Color get secondaryColor {
    try {
      final hex = gradient.last.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFFFF7A00);
    }
  }
}
