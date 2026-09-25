import 'package:flutter/material.dart';

class AppleTheme {
  // Apple Music Signature Palette
  static const Color primary = Color(0xFFFA2D48); // Apple Music Red/Pink
  static const Color primaryLight = Color(0xFFFF375F);
  static const Color background = Color(0xFF000000); // True OLED Black
  static const Color surface = Color(0xFF161618); // Elevated glass surface
  static const Color surfaceElevated = Color(0xFF242426);
  static const Color surfaceTranslucent = Color(0xD91C1C1E);
  static const Color divider = Color(0x1AFFFFFF);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF8E8E93);
  static const Color textTertiary = Color(0xFF636366);

  // Gradient Presets
  static const LinearGradient appleMusicGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF3B5C), Color(0xFFFA2D48), Color(0xFFD61036)],
  );

  static const LinearGradient spatialAudioGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
  );

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primary,
      scaffoldBackgroundColor: background,
      canvasColor: surface,
      cardColor: surface,
      dividerColor: divider,
      splashColor: Colors.transparent,
      highlightColor: Colors.white.withOpacity(0.05),
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: primaryLight,
        surface: surface,
        background: background,
        onPrimary: Colors.white,
        onSurface: textPrimary,
        onBackground: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 22,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: primary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceTranslucent,
        selectedItemColor: primary,
        unselectedItemColor: textSecondary,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
