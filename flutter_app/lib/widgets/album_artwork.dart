import 'package:flutter/material.dart';

class AlbumArtwork extends StatelessWidget {
  final String title;
  final String artist;
  final List<String> gradient;
  final double size;
  final double borderRadius;
  final bool showGlow;

  const AlbumArtwork({
    super.key,
    required this.title,
    required this.artist,
    required this.gradient,
    this.size = 56,
    this.borderRadius = 10,
    this.showGlow = false,
  });

  Color _parseColor(String hex, Color fallback) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return fallback;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c1 = gradient.isNotEmpty ? _parseColor(gradient[0], const Color(0xFFFA2D48)) : const Color(0xFFFA2D48);
    final c2 = gradient.length > 1 ? _parseColor(gradient[1], const Color(0xFF8B5CF6)) : const Color(0xFF8B5CF6);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [c1, c2],
        ),
        boxShadow: showGlow
            ? [
                BoxShadow(
                  color: c1.withOpacity(0.4),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                  spreadRadius: 2,
                )
              ]
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                )
              ],
      ),
      child: Stack(
        children: [
          // Glossy top-to-bottom subtle glass sheen
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: size * 0.45,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(borderRadius)),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.25),
                    Colors.white.withOpacity(0.0),
                  ],
                ),
              ),
            ),
          ),
          // Vinyl groove circle lines
          Center(
            child: Container(
              width: size * 0.55,
              height: size * 0.55,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
              ),
              child: Center(
                child: Container(
                  width: size * 0.22,
                  height: size * 0.22,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.black.withOpacity(0.25),
                    border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
