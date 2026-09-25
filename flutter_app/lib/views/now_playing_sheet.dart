import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import '../widgets/album_artwork.dart';

class NowPlayingSheet extends StatefulWidget {
  const NowPlayingSheet({super.key});

  @override
  State<NowPlayingSheet> createState() => _NowPlayingSheetState();
}

class _NowPlayingSheetState extends State<NowPlayingSheet> {
  bool _showLyrics = false;
  final ScrollController _lyricsScroll = ScrollController();

  String _formatDuration(Duration d) {
    final m = d.inMinutes;
    final s = d.inSeconds % 60;
    return '$m:${s < 10 ? '0' : ''}$s';
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerService>(context);
    final song = player.currentSong;

    if (song == null) {
      return const SizedBox.shrink();
    }

    final c1 = song.primaryColor;
    final c2 = song.secondaryColor;

    return Container(
      height: MediaQuery.of(context).size.height * 0.94,
      decoration: BoxDecoration(
        color: const Color(0xFF141416),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            c1.withOpacity(0.35),
            const Color(0xFF141416),
            const Color(0xFF0C0C0E),
          ],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Pull down bar
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              width: 40,
              height: 4.5,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2.5),
              ),
            ),

            // Top Header: Close & Queue
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 30),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Row(
                    children: [
                      if (song.isLossless) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.white24, width: 0.5),
                          ),
                          child: const Text(
                            'LOSSLESS',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      if (song.isDolbyAtmos) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.white24, width: 0.5),
                          ),
                          child: const Text(
                            'DOLBY ATMOS',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.list_rounded, color: Colors.white70, size: 26),
                    onPressed: () => _showQueueModal(context, player),
                  ),
                ],
              ),
            ),

            // Main Content: Artwork or Synchronized Lyrics
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: !_showLyrics
                    ? Center(
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final artSize = constraints.maxWidth > 300 ? 300.0 : constraints.maxWidth;
                            return Hero(
                              tag: 'cover_${song.id}',
                              child: AlbumArtwork(
                                title: song.title,
                                artist: song.artist,
                                gradient: song.coverGradient,
                                size: artSize,
                                borderRadius: 16,
                                showGlow: true,
                              ),
                            );
                          },
                        ),
                      )
                    : _buildLyricsView(player, song),
              ),
            ),

            // Song Info & Favorite
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          song.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.4,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${song.artist} — ${song.album}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.65),
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      player.isFavorite(song.id) ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      color: player.isFavorite(song.id) ? AppleTheme.primary : Colors.white60,
                      size: 26,
                    ),
                    onPressed: () => player.toggleFavorite(song.id),
                  ),
                ],
              ),
            ),

            // Real-time spectrum visualizer bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 4),
              child: SizedBox(
                height: 14,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: player.spectrum.map((val) {
                    return Container(
                      width: 5,
                      height: (val * 14).clamp(3.0, 14.0),
                      decoration: BoxDecoration(
                        color: player.isPlaying ? AppleTheme.primary : Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            // Scrubber Slider
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Column(
                children: [
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                      activeTrackColor: Colors.white,
                      inactiveTrackColor: Colors.white12,
                      thumbColor: Colors.white,
                    ),
                    child: Slider(
                      value: player.position.inMilliseconds
                          .clamp(0, player.duration.inMilliseconds)
                          .toDouble(),
                      max: player.duration.inMilliseconds.toDouble(),
                      onChanged: (val) {
                        player.seek(Duration(milliseconds: val.toInt()));
                      },
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatDuration(player.position),
                          style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
                        ),
                        Text(
                          '-${_formatDuration(player.duration - player.position)}',
                          style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Main Controls: Shuffle, Prev, Play/Pause, Next, Repeat
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    icon: Icon(
                      Icons.shuffle_rounded,
                      color: player.isShuffle ? AppleTheme.primary : Colors.white38,
                      size: 24,
                    ),
                    onPressed: () => player.toggleShuffle(),
                  ),
                  IconButton(
                    icon: const Icon(Icons.skip_previous_rounded, color: Colors.white, size: 40),
                    onPressed: () => player.previous(),
                  ),
                  GestureDetector(
                    onTap: () => player.togglePlayPause(),
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Colors.black38, blurRadius: 16, offset: Offset(0, 4)),
                        ],
                      ),
                      child: Icon(
                        player.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                        color: Colors.black,
                        size: 40,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 40),
                    onPressed: () => player.next(),
                  ),
                  IconButton(
                    icon: Icon(
                      player.repeatMode == RepeatMode.one
                          ? Icons.repeat_one_rounded
                          : Icons.repeat_rounded,
                      color: player.repeatMode != RepeatMode.off ? AppleTheme.primary : Colors.white38,
                      size: 24,
                    ),
                    onPressed: () => player.cycleRepeat(),
                  ),
                ],
              ),
            ),

            // Bottom Actions: Lyrics Toggle & AirPlay
            Padding(
              padding: const EdgeInsets.only(bottom: 20, top: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _showLyrics = !_showLyrics;
                      });
                    },
                    icon: Icon(
                      Icons.lyrics_rounded,
                      size: 18,
                      color: _showLyrics ? AppleTheme.primary : Colors.white70,
                    ),
                    label: Text(
                      'Lyrics',
                      style: TextStyle(
                        color: _showLyrics ? AppleTheme.primary : Colors.white70,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _showLyrics
                          ? AppleTheme.primary.withOpacity(0.18)
                          : Colors.white.withOpacity(0.08),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Row(
                    children: [
                      Icon(Icons.airplay_rounded, size: 16, color: Colors.white.withOpacity(0.4)),
                      const SizedBox(width: 6),
                      Text(
                        'AirPlay Lossless',
                        style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLyricsView(PlayerService player, dynamic song) {
    if (song.lyrics.isEmpty) {
      return const Center(
        child: Text(
          'No synced lyrics available',
          style: TextStyle(color: Colors.white54, fontStyle: FontStyle.italic),
        ),
      );
    }

    final activeIdx = player.currentLyricIndex;

    return ListView.builder(
      controller: _lyricsScroll,
      itemCount: song.lyrics.length,
      itemBuilder: (ctx, idx) {
        final line = song.lyrics[idx];
        final isActive = idx == activeIdx;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: GestureDetector(
            onTap: () {
              player.seek(Duration(milliseconds: (line.time * 1000).toInt()));
            },
            child: AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 300),
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white24,
                fontSize: isActive ? 24 : 18,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                letterSpacing: -0.3,
                shadows: isActive
                    ? [
                        Shadow(
                          color: AppleTheme.primary.withOpacity(0.8),
                          blurRadius: 16,
                        )
                      ]
                    : null,
              ),
              child: Text(line.text, textAlign: TextAlign.center),
            ),
          ),
        );
      },
    );
  }

  void _showQueueModal(BuildContext context, PlayerService player) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppleTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Playing Next',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: player.queue.length,
                itemBuilder: (c, i) {
                  final s = player.queue[i];
                  final isCur = i == player.queueIndex;
                  return ListTile(
                    leading: AlbumArtwork(
                      title: s.title,
                      artist: s.artist,
                      gradient: s.coverGradient,
                      size: 40,
                      borderRadius: 6,
                    ),
                    title: Text(
                      s.title,
                      style: TextStyle(
                        color: isCur ? AppleTheme.primary : Colors.white,
                        fontWeight: isCur ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    subtitle: Text(s.artist, style: const TextStyle(color: AppleTheme.textSecondary)),
                    trailing: isCur
                        ? const Icon(Icons.equalizer_rounded, color: AppleTheme.primary)
                        : null,
                    onTap: () {
                      player.playSong(s);
                      Navigator.pop(ctx);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
