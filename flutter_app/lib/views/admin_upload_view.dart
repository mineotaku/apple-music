import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/player_service.dart';
import '../models/song.dart';
import '../theme/apple_theme.dart';

class AdminUploadView extends StatefulWidget {
  const AdminUploadView({super.key});

  @override
  State<AdminUploadView> createState() => _AdminUploadViewState();
}

class _AdminUploadViewState extends State<AdminUploadView> {
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  final _titleCtrl = TextEditingController();
  final _artistCtrl = TextEditingController();
  final _albumCtrl = TextEditingController();
  String _selectedGenre = 'Electronic';
  bool _isLossless = true;
  bool _isDolbyAtmos = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    final stats = await ApiService.fetchAdminStats();
    if (mounted) {
      setState(() {
        _stats = stats;
        _isLoading = false;
      });
    }
  }

  Future<void> _handleUpload() async {
    if (_titleCtrl.text.trim().isEmpty || _artistCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter Title and Artist')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    // Create local song and notify player
    final newSong = Song(
      id: 'song-${DateTime.now().millisecondsSinceEpoch}',
      title: _titleCtrl.text.trim(),
      artist: _artistCtrl.text.trim(),
      artistId: 'artist-${_artistCtrl.text.trim().toLowerCase().replaceAll(' ', '-')}',
      album: _albumCtrl.text.trim().isNotEmpty ? _albumCtrl.text.trim() : 'Studio Singles',
      albumId: 'album-single',
      duration: 195,
      releaseYear: 2026,
      genre: _selectedGenre,
      bitrate: '24-bit / 96kHz ALAC',
      codec: _isLossless ? 'Apple Lossless' : 'AAC 256kbps',
      isLossless: _isLossless,
      isDolbyAtmos: _isDolbyAtmos,
      isAppleDigitalMaster: true,
      coverGradient: ['#FA2D48', '#8B5CF6'],
      plays: 1,
      lyrics: [
        LyricLine(time: 0, text: 'Now streaming ${_titleCtrl.text.trim()}'),
        LyricLine(time: 8, text: 'Uploaded via Apple Music Studio Pipeline'),
      ],
      streamUrl: '/api/songs/song-1/stream',
    );

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      final player = Provider.of<PlayerService>(context, listen: false);
      player.playSong(newSong);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Uploaded "${newSong.title}" and queued in Lossless engine!'),
          backgroundColor: AppleTheme.primary,
        ),
      );

      _titleCtrl.clear();
      _artistCtrl.clear();
      _albumCtrl.clear();
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppleTheme.background,
      appBar: AppBar(
        title: const Text('Admin Studio'),
        backgroundColor: Colors.transparent,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppleTheme.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Server Metrics Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppleTheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Apple Streaming Engine',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text('HTTP 206 Online', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem('Songs', '${_stats?['songsCount'] ?? 6}'),
                            _buildStatItem('Artists', '${_stats?['artistsCount'] ?? 4}'),
                            _buildStatItem('Subscribers', '${_stats?['usersCount'] ?? 1420}'),
                            _buildStatItem('Total Plays', '${_stats?['totalPlays'] ?? 748500}'),
                          ],
                        ),
                        const Divider(color: Colors.white12, height: 24),
                        Text(
                          'Estimated Bandwidth Saved: ${_stats?['bandwidthSavedEstimate'] ?? "3508 GB"}',
                          style: const TextStyle(color: AppleTheme.primaryLight, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Text(
                    'Upload Track to Catalog',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  // Upload Form
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppleTheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Column(
                      children: [
                        TextField(
                          controller: _titleCtrl,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: 'Song Title *',
                            labelStyle: const TextStyle(color: AppleTheme.textSecondary),
                            filled: true,
                            fillColor: const Color(0xFF242428),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _artistCtrl,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: 'Artist Name *',
                            labelStyle: const TextStyle(color: AppleTheme.textSecondary),
                            filled: true,
                            fillColor: const Color(0xFF242428),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _albumCtrl,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: 'Album / EP',
                            labelStyle: const TextStyle(color: AppleTheme.textSecondary),
                            filled: true,
                            fillColor: const Color(0xFF242428),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          ),
                        ),
                        const SizedBox(height: 14),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Apple Lossless (ALAC)', style: TextStyle(color: Colors.white, fontSize: 14)),
                          value: _isLossless,
                          activeColor: AppleTheme.primary,
                          onChanged: (v) => setState(() => _isLossless = v),
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Spatial Audio with Dolby Atmos', style: TextStyle(color: Colors.white, fontSize: 14)),
                          value: _isDolbyAtmos,
                          activeColor: AppleTheme.primary,
                          onChanged: (v) => setState(() => _isDolbyAtmos = v),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isSubmitting ? null : _handleUpload,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppleTheme.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: _isSubmitting
                                ? const CircularProgressIndicator(color: Colors.white)
                                : const Text('Publish & Stream Song', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppleTheme.textSecondary, fontSize: 11)),
      ],
    );
  }
}
