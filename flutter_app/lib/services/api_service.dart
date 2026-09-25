import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/song.dart';
import '../models/playlist.dart';

class ApiService {
  // Configurable base URL: Android emulator uses 10.0.2.2, localhost for web/desktop, or custom deployed URL
  static String baseUrl = 'http://10.0.2.2:8000';

  static void setBaseUrl(String url) {
    baseUrl = url.replaceAll(RegExp(r'/+$'), '');
  }

  // Initial fallback catalogue for instant zero-config playback
  static final List<Song> mockSongs = [
    Song(
      id: 'song-1',
      title: 'Starfall Over Shibuya',
      artist: 'Kaito Takahashi',
      artistId: 'artist-1',
      album: 'Neon Horizon',
      albumId: 'album-1',
      duration: 194,
      releaseYear: 2026,
      genre: 'Electronic',
      bitrate: '24-bit / 96kHz ALAC',
      codec: 'Apple Lossless',
      isLossless: true,
      isDolbyAtmos: true,
      isAppleDigitalMaster: true,
      coverGradient: ['#3B82F6', '#8B5CF6'],
      plays: 142890,
      lyrics: [
        LyricLine(time: 0, text: 'Neon lights reflecting in the midnight rain'),
        LyricLine(time: 6, text: 'Walking through Shibuya crossing once again'),
        LyricLine(time: 14, text: 'The city breathes in frequencies of electric sound'),
        LyricLine(time: 22, text: 'Lost within the reverie, feet above the ground'),
        LyricLine(time: 31, text: 'Catch the starfall as the morning breaks through glass'),
        LyricLine(time: 42, text: 'Every second glowing like it was made to last'),
        LyricLine(time: 54, text: 'Endless pulses through the quiet night'),
        LyricLine(time: 66, text: 'We are floating in the atmosphere of light'),
      ],
      streamUrl: '/api/songs/song-1/stream',
    ),
    Song(
      id: 'song-2',
      title: 'Golden Hour Reverie',
      artist: 'Elena Rostova',
      artistId: 'artist-2',
      album: 'Sunlight & Cedar',
      albumId: 'album-2',
      duration: 218,
      releaseYear: 2026,
      genre: 'Acoustic / Indie',
      bitrate: '24-bit / 192kHz ALAC',
      codec: 'Hi-Res Lossless',
      isLossless: true,
      isDolbyAtmos: true,
      isAppleDigitalMaster: true,
      coverGradient: ['#F59E0B', '#EF4444'],
      plays: 98450,
      lyrics: [
        LyricLine(time: 0, text: 'Sunlight filtering through the cedar trees'),
        LyricLine(time: 8, text: 'Carrying the warmth upon an ocean breeze'),
        LyricLine(time: 16, text: 'Strings vibrate with memories of home'),
        LyricLine(time: 25, text: 'Through the mountain passes where we used to roam'),
        LyricLine(time: 35, text: 'Golden hour painting amber in your eyes'),
        LyricLine(time: 46, text: 'No words needed under open skies'),
      ],
      streamUrl: '/api/songs/song-2/stream',
    ),
    Song(
      id: 'song-3',
      title: 'Midnight Velvet',
      artist: 'Marcus Vance & The Low-Fi Society',
      artistId: 'artist-3',
      album: 'City Lights After Dark',
      albumId: 'album-3',
      duration: 184,
      releaseYear: 2026,
      genre: 'R&B / Soul',
      bitrate: '24-bit / 48kHz ALAC',
      codec: 'Spatial Audio with Dolby Atmos',
      isLossless: true,
      isDolbyAtmos: true,
      isAppleDigitalMaster: true,
      coverGradient: ['#8B5CF6', '#EC4899'],
      plays: 231100,
      lyrics: [
        LyricLine(time: 0, text: 'Smooth Rhodes chords fading into the fog'),
        LyricLine(time: 7, text: 'Late night conversation on a rooftop balcony'),
        LyricLine(time: 15, text: 'Sipping coffee while the bassline slides along'),
        LyricLine(time: 24, text: 'Everything feels easier when you hear this song'),
      ],
      streamUrl: '/api/songs/song-3/stream',
    ),
    Song(
      id: 'song-4',
      title: 'Clair de Lune (Spatial Piano Rework)',
      artist: 'Julian C. Mercier',
      artistId: 'artist-4',
      album: 'Modern Impressions',
      albumId: 'album-4',
      duration: 260,
      releaseYear: 2025,
      genre: 'Classical',
      bitrate: '24-bit / 192kHz ALAC',
      codec: 'Hi-Res Lossless',
      isLossless: true,
      isDolbyAtmos: true,
      isAppleDigitalMaster: true,
      coverGradient: ['#06B6D4', '#3B82F6'],
      plays: 76540,
      lyrics: [
        LyricLine(time: 0, text: '[Instrumental intro - Gentle arpeggios]'),
        LyricLine(time: 20, text: '[Theme enters with delicate rubato]'),
        LyricLine(time: 45, text: '[Harmonic shift into warm D-flat major]'),
      ],
      streamUrl: '/api/songs/song-4/stream',
    ),
    Song(
      id: 'song-5',
      title: 'Aura Borealis',
      artist: 'Kaito Takahashi',
      artistId: 'artist-1',
      album: 'Neon Horizon',
      albumId: 'album-1',
      duration: 205,
      releaseYear: 2026,
      genre: 'Ambient / Synthwave',
      bitrate: '24-bit / 96kHz ALAC',
      codec: 'Apple Lossless',
      isLossless: true,
      isDolbyAtmos: true,
      isAppleDigitalMaster: true,
      coverGradient: ['#10B981', '#06B6D4'],
      plays: 87120,
      lyrics: [
        LyricLine(time: 0, text: 'Green shimmer dancing on arctic snow'),
        LyricLine(time: 9, text: 'Sub-bass rumbling gentle and slow'),
        LyricLine(time: 18, text: 'Magnetic field in harmonic flow'),
      ],
      streamUrl: '/api/songs/song-5/stream',
    ),
    Song(
      id: 'song-6',
      title: 'Solstice Drive',
      artist: 'Marcus Vance & The Low-Fi Society',
      artistId: 'artist-3',
      album: 'City Lights After Dark',
      albumId: 'album-3',
      duration: 172,
      releaseYear: 2026,
      genre: 'R&B / Soul',
      bitrate: '24-bit / 48kHz ALAC',
      codec: 'Lossless',
      isLossless: true,
      isDolbyAtmos: false,
      isAppleDigitalMaster: true,
      coverGradient: ['#F43F5E', '#FB923C'],
      plays: 112400,
      lyrics: [
        LyricLine(time: 0, text: 'Windows down along the coastal highway'),
        LyricLine(time: 8, text: 'Sunset orange fading to indigo blue'),
        LyricLine(time: 18, text: 'Cruising through the longest day of summer'),
      ],
      streamUrl: '/api/songs/song-6/stream',
    ),
  ];

  static final List<Playlist> mockPlaylists = [
    Playlist(
      id: 'playlist-1',
      name: 'Heavy Rotation',
      description: 'The tracks you have on constant replay right now.',
      curator: 'Apple Music Editorial',
      gradient: ['#FA2D48', '#FF7A00'],
      songIds: ['song-1', 'song-3', 'song-2', 'song-5'],
    ),
    Playlist(
      id: 'playlist-2',
      name: 'Spatial Audio: Pure Focus',
      description: 'Immersive soundscapes engineered for deep concentration and flow state.',
      curator: 'Apple Music Spatial Audio',
      gradient: ['#3B82F6', '#10B981'],
      songIds: ['song-4', 'song-5', 'song-1'],
    ),
    Playlist(
      id: 'playlist-3',
      name: 'Late Night Chill',
      description: 'Downtempo soul, mellow beats, and warm nocturnal analog warmth.',
      curator: 'Curated by You',
      gradient: ['#8B5CF6', '#EC4899'],
      songIds: ['song-3', 'song-6', 'song-2'],
    ),
  ];

  static Future<List<Song>> fetchSongs() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/api/songs'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        return list.map((json) => Song.fromJson(json)).toList();
      }
    } catch (_) {}
    return mockSongs;
  }

  static Future<List<Playlist>> fetchPlaylists() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/api/playlists'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        return list.map((json) => Playlist.fromJson(json)).toList();
      }
    } catch (_) {}
    return mockPlaylists;
  }

  static Future<List<Song>> searchSongs(String query) async {
    if (query.trim().isEmpty) return [];
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/api/search?q=${Uri.encodeComponent(query)}'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> songsList = data['songs'] ?? [];
        return songsList.map((json) => Song.fromJson(json)).toList();
      }
    } catch (_) {}

    final q = query.toLowerCase();
    return mockSongs
        .filter((s) =>
            s.title.toLowerCase().contains(q) ||
            s.artist.toLowerCase().contains(q) ||
            s.album.toLowerCase().contains(q))
        .toList();
  }

  static Future<Map<String, dynamic>> fetchAdminStats() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/api/admin/stats'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return {
      'songsCount': mockSongs.length,
      'artistsCount': 4,
      'albumsCount': 4,
      'usersCount': 1420,
      'formattedStorage': '7.57 MB',
      'totalPlays': 748500,
      'bandwidthSavedEstimate': '3508.59 GB (via Range 206 Caching)',
    };
  }
}

extension ListFilter<T> on List<T> {
  Iterable<T> filter(bool Function(T element) test) sync* {
    for (var element in this) {
      if (test(element)) yield element;
    }
  }
}
