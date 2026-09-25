import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../models/playlist.dart';
import '../services/api_service.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import '../widgets/album_artwork.dart';
import '../widgets/song_tile.dart';

class ListenNowView extends StatefulWidget {
  const ListenNowView({super.key});

  @override
  State<ListenNowView> createState() => _ListenNowViewState();
}

class _ListenNowViewState extends State<ListenNowView> {
  List<Song> _songs = [];
  List<Playlist> _playlists = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final songs = await ApiService.fetchSongs();
    final playlists = await ApiService.fetchPlaylists();
    if (mounted) {
      setState(() {
        _songs = songs;
        _playlists = playlists;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppleTheme.primary));
    }

    final player = Provider.of<PlayerService>(context, listen: false);
    final featuredSong = _songs.isNotEmpty ? _songs.first : null;

    return CustomScrollView(
      slivers: [
        // Apple Music Header
        SliverAppBar(
          floating: true,
          pinned: false,
          expandedHeight: 60,
          backgroundColor: AppleTheme.background,
          title: const Text(
            'Listen Now',
            style: TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.6,
            ),
          ),
          actions: [
            IconButton(
              icon: const CircleAvatar(
                radius: 16,
                backgroundColor: AppleTheme.primary,
                child: Icon(Icons.person, color: Colors.white, size: 18),
              ),
              onPressed: () {},
            ),
          ],
        ),

        // Hero Spotlight Banner
        if (featuredSong != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: GestureDetector(
                onTap: () => player.playSong(featuredSong, newQueue: _songs),
                child: Container(
                  height: 220,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        featuredSong.primaryColor,
                        featuredSong.secondaryColor,
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: featuredSong.primaryColor.withOpacity(0.35),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        top: 16,
                        left: 18,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'FEATURED SPOTLIGHT',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              featuredSong.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                letterSpacing: -0.4,
                              ),
                            ),
                            Text(
                              featuredSong.artist,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.85),
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        bottom: 16,
                        left: 18,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.play_arrow_rounded, color: Colors.black, size: 20),
                              SizedBox(width: 4),
                              Text(
                                'Stream Now',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 16,
                        right: 18,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.35),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white24, width: 0.5),
                          ),
                          child: const Text(
                            '24-bit / 96kHz ALAC',
                            style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

        // Heavy Rotation section title
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
            child: Text(
              'Heavy Rotation',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.4,
              ),
            ),
          ),
        ),

        // Horizontal Playlist / Song Cards
        SliverToBoxAdapter(
          child: SizedBox(
            height: 190,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _playlists.length,
              itemBuilder: (ctx, idx) {
                final p = _playlists[idx];
                return GestureDetector(
                  onTap: () {
                    if (_songs.isNotEmpty) {
                      player.playSong(_songs[idx % _songs.length], newQueue: _songs);
                    }
                  },
                  child: Container(
                    width: 140,
                    margin: const EdgeInsets.only(right: 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AlbumArtwork(
                          title: p.name,
                          artist: p.curator,
                          gradient: p.gradient,
                          size: 140,
                          borderRadius: 12,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          p.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          p.curator,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppleTheme.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        // Top Songs List
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
            child: Text(
              'Recently Added & Streamable',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.4,
              ),
            ),
          ),
        ),

        SliverList(
          delegate: SliverChildBuilderDelegate(
            (ctx, idx) {
              final song = _songs[idx];
              return SongTile(
                song: song,
                queue: _songs,
                index: idx + 1,
              );
            },
            childCount: _songs.length,
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }
}
