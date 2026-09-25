import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import '../widgets/mini_player.dart';
import 'listen_now_view.dart';
import 'browse_view.dart';
import 'library_view.dart';
import 'search_view.dart';
import 'admin_upload_view.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;

  final List<Widget> _tabs = const [
    ListenNowView(),
    BrowseView(),
    LibraryView(),
    SearchView(),
  ];

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerService>(context);

    return Scaffold(
      backgroundColor: AppleTheme.background,
      body: Stack(
        children: [
          // Current Tab View
          IndexedStack(
            index: _currentIndex,
            children: _tabs,
          ),

          // Floating Studio Admin button in top right
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            right: 16,
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AdminUploadView()),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF242428).withOpacity(0.8),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white24, width: 0.6),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.cloud_upload_rounded, color: AppleTheme.primary, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Studio',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Docked MiniPlayer above bottom navigation
          if (player.currentSong != null)
            const Positioned(
              left: 0,
              right: 0,
              bottom: 60,
              child: MiniPlayer(),
            ),
        ],
      ),
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF161618).withOpacity(0.92),
              border: const Border(top: BorderSide(color: Color(0x1AFFFFFF), width: 0.5)),
            ),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (idx) => setState(() => _currentIndex = idx),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.play_circle_filled_rounded),
                  label: 'Listen Now',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.explore_rounded),
                  label: 'Browse',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.library_music_rounded),
                  label: 'Library',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.search_rounded),
                  label: 'Search',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
