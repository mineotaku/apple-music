import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../models/playlist.dart';
import '../services/api_service.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import '../widgets/album_artwork.dart';
import '../widgets/song_tile.dart';

class LibraryView extends StatefulWidget {
  const LibraryView({super.key});

  @override
  State<LibraryView> createState() => _LibraryViewState();
}

class _LibraryViewState extends State<LibraryView> {
  List<Song> _songs = [];
  List<Playlist> _playlists = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final s = await ApiService.fetchSongs();
    final p = await ApiService.fetchPlaylists();
    if (mounted) {
      setState(() {
        _songs = s;
        _playlists = p;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppleTheme.primary));
    }

    final player = Provider.of<PlayerService>(context);
    final favSongs = _songs.where((s) => player.isFavorite(s.id)).toList();

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          floating: true,
          expandedHeight: 60,
          backgroundColor: AppleTheme.background,
          title: const Text(
            'Library',
            style: TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.6,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {},
              child: const Text('Edit', style: TextStyle(color: AppleTheme.primary, fontSize: 16)),
            ),
          ],
        ),

        // Apple Music Library Nav list
        SliverToBoxAdapter(
          child: Column(
            children: [
              _buildLibRow(Icons.playlist_play_rounded, 'Playlists', '${_playlists.length}'),
              _buildLibRow(Icons.mic_external_on_rounded, 'Artists', '4'),
              _buildLibRow(Icons.album_rounded, 'Albums', '4'),
              _buildLibRow(Icons.music_note_rounded, 'Songs', '${_songs.length}'),
              _buildLibRow(Icons.favorite_rounded, 'Favorites', '${favSongs.length}'),
            ],
          ),
        ),

        // User Playlists Section
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
            child: Text(
              'Playlists',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 14,
              childAspectRatio: 0.8,
            ),
            delegate: SliverChildBuilderDelegate(
              (ctx, idx) {
                final pl = _playlists[idx];
                return GestureDetector(
                  onTap: () {
                    if (_songs.isNotEmpty) {
                      player.playSong(_songs[idx % _songs.length], newQueue: _songs);
                    }
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: AlbumArtwork(
                          title: pl.name,
                          artist: pl.curator,
                          gradient: pl.gradient,
                          size: double.infinity,
                          borderRadius: 12,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        pl.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '${pl.songIds.length} Songs • Lossless',
                        style: const TextStyle(
                          color: AppleTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                );
              },
              childCount: _playlists.length,
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }

  Widget _buildLibRow(IconData icon, String title, String count) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0x1AFFFFFF), width: 0.5)),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppleTheme.primary, size: 24),
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(count, style: const TextStyle(color: AppleTheme.textTertiary, fontSize: 14)),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded, color: AppleTheme.textTertiary, size: 20),
          ],
        ),
      ),
    );
  }
}
