import 'dart:convert';
import 'package:flutter/material.dart';

class LyricLine {
  final double time;
  final String text;

  LyricLine({required this.time, required this.text});

  factory LyricLine.fromJson(Map<String, dynamic> json) {
    return LyricLine(
      time: (json['time'] as num).toDouble(),
      text: json['text'] as String,
    );
  }

  Map<String, dynamic> toJson() => {'time': time, 'text': text};
}

class Song {
  final String id;
  final String title;
  final String artist;
  final String artistId;
  final String album;
  final String albumId;
  final int duration;
  final int releaseYear;
  final String genre;
  final String bitrate;
  final String codec;
  final bool isLossless;
  final bool isDolbyAtmos;
  final bool isAppleDigitalMaster;
  final List<String> coverGradient;
  final int plays;
  final List<LyricLine> lyrics;
  final String? streamUrl;

  Song({
    required this.id,
    required this.title,
    required this.artist,
    required this.artistId,
    required this.album,
    required this.albumId,
    required this.duration,
    required this.releaseYear,
    required this.genre,
    required this.bitrate,
    required this.codec,
    required this.isLossless,
    required this.isDolbyAtmos,
    required this.isAppleDigitalMaster,
    required this.coverGradient,
    required this.plays,
    required this.lyrics,
    this.streamUrl,
  });

  factory Song.fromJson(Map<String, dynamic> json) {
    List<LyricLine> parsedLyrics = [];
    if (json['lyrics'] != null) {
      if (json['lyrics'] is List) {
        parsedLyrics = (json['lyrics'] as List)
            .map((item) => LyricLine.fromJson(item as Map<String, dynamic>))
            .toList();
      } else if (json['lyrics'] is String) {
        try {
          final decoded = jsonDecode(json['lyrics']);
          if (decoded is List) {
            parsedLyrics = decoded
                .map((item) => LyricLine.fromJson(item as Map<String, dynamic>))
                .toList();
          }
        } catch (_) {}
      }
    }

    List<String> gradients = ['#FA2D48', '#8B5CF6'];
    if (json['coverGradient'] != null) {
      if (json['coverGradient'] is List) {
        gradients = List<String>.from(json['coverGradient']);
      } else if (json['coverGradient'] is String) {
        gradients = (json['coverGradient'] as String).split(',');
      }
    }

    return Song(
      id: json['id'] as String,
      title: json['title'] as String,
      artist: json['artist'] as String,
      artistId: json['artistId'] ?? 'artist-1',
      album: json['album'] ?? 'Single',
      albumId: json['albumId'] ?? 'album-1',
      duration: (json['duration'] as num?)?.toInt() ?? 180,
      releaseYear: (json['releaseYear'] as num?)?.toInt() ?? 2026,
      genre: json['genre'] ?? 'Pop',
      bitrate: json['bitrate'] ?? '24-bit / 96kHz ALAC',
      codec: json['codec'] ?? 'Apple Lossless',
      isLossless: json['isLossless'] ?? true,
      isDolbyAtmos: json['isDolbyAtmos'] ?? true,
      isAppleDigitalMaster: json['isAppleDigitalMaster'] ?? true,
      coverGradient: gradients,
      plays: (json['plays'] as num?)?.toInt() ?? 1000,
      lyrics: parsedLyrics,
      streamUrl: json['streamUrl'] ?? '/api/songs/${json['id']}/stream',
    );
  }

  Color get primaryColor {
    try {
      final hex = coverGradient.first.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFFFA2D48);
    }
  }

  Color get secondaryColor {
    try {
      final hex = coverGradient.last.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFF8B5CF6);
    }
  }
}
