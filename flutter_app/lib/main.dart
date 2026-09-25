import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'services/player_service.dart';
import 'theme/apple_theme.dart';
import 'views/main_scaffold.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge-to-edge system navigation and transparent status bar matching iOS & Android 14
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF161618),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PlayerService()),
      ],
      child: const AppleMusicApp(),
    ),
  );
}

class AppleMusicApp extends StatelessWidget {
  const AppleMusicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Apple Music',
      debugShowCheckedModeBanner: false,
      theme: AppleTheme.darkTheme,
      home: const MainScaffold(),
    );
  }
}
