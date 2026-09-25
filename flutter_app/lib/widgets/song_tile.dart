import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import 'album_artwork.dart';

class SongTile extends StatelessWidget {
  final Song song;
  final List<Song>? queue;
  final int? index;

  const SongTile({
    super.key,
    required this.song,
    this.queue,
    this.index,
  });

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerService>(context);
    final isCurrent = player.currentSong?.id == song.id;

    return InkWell(
      onTap: () {
        player.playSong(song, newQueue: queue);
      },
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            if (index != null)
              SizedBox(
                width: 28,
                child: Text(
                  '$index',
                  style: TextStyle(
                    color: isCurrent ? AppleTheme.primary : AppleTheme.textTertiary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            // Album art thumbnail
            AlbumArtwork(
              title: song.title,
              artist: song.artist,
              gradient: song.coverGradient,
              size: 48,
              borderRadius: 8,
            ),
            const SizedBox(width: 14),
            // Title & Artist
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    song.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: isCurrent ? AppleTheme.primary : Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      if (song.isDolbyAtmos) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                          margin: const EdgeInsets.only(right: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: const Text(
                            'ATMOS',
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 7.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                      Expanded(
                        child: Text(
                          '${song.artist} — ${song.album}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppleTheme.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Playing indicator or more options
            if (isCurrent && player.isPlaying) ...[
              const Icon(
                Icons.equalizer_rounded,
                color: AppleTheme.primary,
                size: 20,
              ),
            ] else ...[
              IconButton(
                icon: const Icon(
                  Icons.more_horiz_rounded,
                  color: AppleTheme.textTertiary,
                  size: 20,
                ),
                onPressed: () {
                  _showOptionsSheet(context, player);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showOptionsSheet(BuildContext context, PlayerService player) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppleTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            ListTile(
              leading: AlbumArtwork(
                title: song.title,
                artist: song.artist,
                gradient: song.coverGradient,
                size: 40,
                borderRadius: 6,
              ),
              title: Text(song.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              subtitle: Text(song.artist, style: const TextStyle(color: AppleTheme.textSecondary)),
            ),
            const Divider(color: Colors.white12),
            ListTile(
              leading: Icon(
                player.isFavorite(song.id) ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                color: AppleTheme.primary,
              ),
              title: Text(
                player.isFavorite(song.id) ? 'Favorited' : 'Add to Favorites',
                style: const TextStyle(color: Colors.white),
              ),
              onTap: () {
                player.toggleFavorite(song.id);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.playlist_add_rounded, color: Colors.white70),
              title: const Text('Add to Playlist', style: TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(ctx),
            ),
            ListTile(
              leading: const Icon(Icons.share_rounded, color: Colors.white70),
              title: const Text('Share Song Link', style: TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(ctx),
            ),
          ],
        ),
      ),
    );
  }
}
