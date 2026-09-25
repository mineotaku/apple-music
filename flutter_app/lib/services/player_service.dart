import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import '../models/song.dart';
import 'api_service.dart';

enum RepeatMode { off, all, one }

class PlayerService extends ChangeNotifier {
  late final AudioPlayer _player;

  Song? _currentSong;
  List<Song> _queue = [];
  int _queueIndex = 0;
  bool _isPlaying = false;
  Duration _position = Duration.zero;
  Duration _duration = const Duration(seconds: 180);
  bool _isShuffle = false;
  RepeatMode _repeatMode = RepeatMode.off;
  final Set<String> _favorites = {'song-1', 'song-3'};

  // Visualizer spectrum simulation
  List<double> _spectrum = List.generate(24, (_) => 0.1);
  Timer? _spectrumTimer;

  PlayerService() {
    _player = AudioPlayer();
    _initListeners();
    _startSpectrumLoop();
  }

  Song? get currentSong => _currentSong;
  List<Song> get queue => _queue;
  int get queueIndex => _queueIndex;
  bool get isPlaying => _isPlaying;
  Duration get position => _position;
  Duration get duration => _duration;
  bool get isShuffle => _isShuffle;
  RepeatMode get repeatMode => _repeatMode;
  List<double> get spectrum => _spectrum;
  bool isFavorite(String songId) => _favorites.contains(songId);

  void _initListeners() {
    _player.playerStateStream.listen((state) {
      _isPlaying = state.playing;
      if (state.processingState == ProcessingState.completed) {
        _handleTrackEnded();
      }
      notifyListeners();
    });

    _player.positionStream.listen((pos) {
      _position = pos;
      notifyListeners();
    });

    _player.durationStream.listen((dur) {
      if (dur != null && dur > Duration.zero) {
        _duration = dur;
        notifyListeners();
      }
    });
  }

  void _startSpectrumLoop() {
    _spectrumTimer = Timer.periodic(const Duration(milliseconds: 100), (_) {
      if (_isPlaying) {
        _spectrum = List.generate(24, (i) {
          final t = DateTime.now().millisecondsSinceEpoch / 200.0;
          final wave = (0.5 + 0.5 * (i % 2 == 0 ? 1 : -1) * (i / 24.0)).clamp(0.15, 0.95);
          return wave;
        });
      } else {
        _spectrum = List.generate(24, (_) => 0.05);
      }
      notifyListeners();
    });
  }

  Future<void> playSong(Song song, {List<Song>? newQueue}) async {
    _currentSong = song;
    if (newQueue != null && newQueue.isNotEmpty) {
      _queue = List.from(newQueue);
      _queueIndex = _queue.indexWhere((s) => s.id == song.id);
      if (_queueIndex == -1) _queueIndex = 0;
    } else if (_queue.isEmpty) {
      _queue = [song];
      _queueIndex = 0;
    }

    _duration = Duration(seconds: song.duration);
    _position = Duration.zero;
    notifyListeners();

    try {
      final streamUrl = '${ApiService.baseUrl}/api/songs/${song.id}/stream';
      await _player.setUrl(streamUrl);
      await _player.play();
    } catch (e) {
      debugPrint('Streaming fallback notice: $e');
      // If server unreachable, continue simulated position timer for demo UI
    }
  }

  Future<void> togglePlayPause() async {
    if (_isPlaying) {
      await _player.pause();
    } else {
      await _player.play();
    }
  }

  Future<void> seek(Duration position) async {
    _position = position;
    notifyListeners();
    try {
      await _player.seek(position);
    } catch (_) {}
  }

  Future<void> next() async {
    if (_queue.isEmpty) return;
    if (_isShuffle) {
      _queueIndex = (_queueIndex + 1 + (_queue.length > 1 ? 1 : 0)) % _queue.length;
    } else {
      _queueIndex = (_queueIndex + 1) % _queue.length;
    }
    await playSong(_queue[_queueIndex]);
  }

  Future<void> previous() async {
    if (_position.inSeconds > 3) {
      await seek(Duration.zero);
      return;
    }
    if (_queue.isEmpty) return;
    _queueIndex = (_queueIndex - 1 + _queue.length) % _queue.length;
    await playSong(_queue[_queueIndex]);
  }

  void toggleShuffle() {
    _isShuffle = !_isShuffle;
    notifyListeners();
  }

  void cycleRepeat() {
    if (_repeatMode == RepeatMode.off) {
      _repeatMode = RepeatMode.all;
    } else if (_repeatMode == RepeatMode.all) {
      _repeatMode = RepeatMode.one;
    } else {
      _repeatMode = RepeatMode.off;
    }
    notifyListeners();
  }

  void toggleFavorite(String songId) {
    if (_favorites.contains(songId)) {
      _favorites.remove(songId);
    } else {
      _favorites.add(songId);
    }
    notifyListeners();
  }

  void _handleTrackEnded() {
    if (_repeatMode == RepeatMode.one) {
      seek(Duration.zero);
      _player.play();
    } else if (_repeatMode == RepeatMode.all || _queueIndex < _queue.length - 1) {
      next();
    }
  }

  int get currentLyricIndex {
    if (_currentSong == null || _currentSong!.lyrics.isEmpty) return -1;
    final currentSeconds = _position.inMilliseconds / 1000.0;
    for (int i = _currentSong!.lyrics.length - 1; i >= 0; i--) {
      if (currentSeconds >= _currentSong!.lyrics[i].time) {
        return i;
      }
    }
    return 0;
  }

  @override
  void dispose() {
    _spectrumTimer?.cancel();
    _player.dispose();
    super.dispose();
  }
}
