import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../services/api_service.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import '../widgets/album_artwork.dart';
import '../widgets/song_tile.dart';

class BrowseView extends StatefulWidget {
  const BrowseView({super.key});

  @override
  State<BrowseView> createState() => _BrowseViewState();
}

class _BrowseViewState extends State<BrowseView> {
  List<Song> _songs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final songs = await ApiService.fetchSongs();
    if (mounted) {
      setState(() {
        _songs = songs;
        _isLoading = false;
      });
    }
  }

  final List<Map<String, dynamic>> _genres = [
    {'name': 'Spatial Audio', 'gradient': ['#3B82F6', '#8B5CF6'], 'icon': Icons.surround_sound_rounded},
    {'name': 'Apple Lossless', 'gradient': ['#FA2D48', '#FF375F'], 'icon': Icons.high_quality_rounded},
    {'name': 'Electronic / Synth', 'gradient': ['#10B981', '#06B6D4'], 'icon': Icons.bolt_rounded},
    {'name': 'Acoustic & Indie', 'gradient': ['#F59E0B', '#EF4444'], 'icon': Icons.music_note_rounded},
    {'name': 'R&B / Soul', 'gradient': ['#8B5CF6', '#EC4899'], 'icon': Icons.nightlife_rounded},
    {'name': 'Classical Masters', 'gradient': ['#06B6D4', '#3B82F6'], 'icon': Icons.piano_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppleTheme.primary));
    }

    final player = Provider.of<PlayerService>(context, listen: false);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          floating: true,
          expandedHeight: 60,
          backgroundColor: AppleTheme.background,
          title: const Text(
            'Browse',
            style: TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.6,
            ),
          ),
        ),

        // Featured Categories Grid
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Text(
              'Browse by Audio Format & Mood',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.1,
            ),
            delegate: SliverChildBuilderDelegate(
              (ctx, idx) {
                final item = _genres[idx];
                final grad = item['gradient'] as List<String>;
                return InkWell(
                  onTap: () {
                    if (_songs.isNotEmpty) {
                      player.playSong(_songs[idx % _songs.length], newQueue: _songs);
                    }
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: LinearGradient(
                        colors: [
                          Color(int.parse('FF${grad[0].replaceAll('#', '')}')),
                          Color(int.parse('FF${grad[1].replaceAll('#', '')}')),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        )
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            item['name'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Icon(item['icon'] as IconData, color: Colors.white70, size: 22),
                      ],
                    ),
                  ),
                );
              },
              childCount: _genres.length,
            ),
          ),
        ),

        // Spatial Audio Editorial Tracks
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 28, 16, 8),
            child: Text(
              'Spatial Audio with Dolby Atmos',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ),

        SliverList(
          delegate: SliverChildBuilderDelegate(
            (ctx, idx) {
              final song = _songs[idx];
              return SongTile(song: song, queue: _songs);
            },
            childCount: _songs.length,
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }
}
