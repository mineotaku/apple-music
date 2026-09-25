import React, { useState, useEffect, useCallback } from 'react';
import { Song, Playlist, ActiveNavTab } from './types/music';
import { api } from './services/api';
import { globalAudioEngine, RepeatMode } from './services/audioEngine';
import { Sidebar } from './components/Sidebar';
import { TopPlayer } from './components/TopPlayer';
import { ListenNowView } from './components/ListenNowView';
import { BrowseView } from './components/BrowseView';
import { RadioView } from './components/RadioView';
import { SongsView } from './components/SongsView';
import { AlbumsView } from './components/AlbumsView';
import { ArtistsView } from './components/ArtistsView';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { AdminStudioView } from './components/AdminStudioView';
import { SearchResultsView } from './components/SearchResultsView';
import { LyricsModal } from './components/LyricsModal';
import { QueueDrawer } from './components/QueueDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileNowPlayingSheet } from './components/MobileNowPlayingSheet';
import { X, Sparkles, Plus } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('listen-now');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Audio Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [spectrum, setSpectrum] = useState<number[]>([]);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileNowPlayingOpen, setIsMobileNowPlayingOpen] = useState<boolean>(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      const [fetchedSongs, fetchedPlaylists, fetchedFavs] = await Promise.all([
        api.getSongs(),
        api.getPlaylists(),
        api.getFavorites(),
      ]);

      setSongs(fetchedSongs);
      setPlaylists(fetchedPlaylists);
      setFavorites(fetchedFavs);

      if (fetchedSongs.length > 0) {
        setQueue(fetchedSongs);
        setCurrentSong(fetchedSongs[0]);
        setDuration(fetchedSongs[0].duration);
      }
    }
    loadData();
  }, []);

  // Set up Audio Engine Listeners
  useEffect(() => {
    globalAudioEngine.setListeners({
      onTimeUpdate: (cur, dur) => {
        setCurrentTime(cur);
        if (dur) setDuration(dur);
      },
      onPlayStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onSpectrumUpdate: (spec) => {
        setSpectrum(spec);
      },
      onSongEnd: () => {
        handleNextTrack();
      },
    });

    return () => {
      globalAudioEngine.destroy();
    };
  }, [queue, queueIndex, repeatMode, isShuffle]);

  // Audio Playback Handlers
  const handlePlaySong = useCallback((song: Song, newQueue?: Song[]) => {
    const targetQueue = newQueue || songs;
    setQueue(targetQueue);
    const idx = targetQueue.findIndex((s) => s.id === song.id);
    setQueueIndex(idx !== -1 ? idx : 0);
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration);

    globalAudioEngine.playSong(song, 0);
    api.recordHistory(song.id);
  }, [songs]);

  const handlePlayPause = useCallback(() => {
    if (!currentSong) {
      if (songs[0]) handlePlaySong(songs[0]);
      return;
    }
    if (isPlaying) {
      globalAudioEngine.pause();
    } else {
      globalAudioEngine.resume();
    }
  }, [currentSong, isPlaying, songs, handlePlaySong]);

  const handleNextTrack = useCallback(() => {
    if (repeatMode === 'one' && currentSong) {
      globalAudioEngine.seek(0);
      globalAudioEngine.resume();
      return;
    }

    if (queue.length === 0) return;

    let nextIdx: number;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === 'all') {
          nextIdx = 0;
        } else {
          globalAudioEngine.pause();
          return;
        }
      }
    }

    setQueueIndex(nextIdx);
    const nextSong = queue[nextIdx];
    if (nextSong) {
      setCurrentSong(nextSong);
      setCurrentTime(0);
      setDuration(nextSong.duration);
      globalAudioEngine.playSong(nextSong, 0);
      api.recordHistory(nextSong.id);
    }
  }, [queue, queueIndex, repeatMode, isShuffle, currentSong]);

  const handlePrevTrack = useCallback(() => {
    if (currentTime > 4) {
      // If played more than 4 seconds, skip to start of track
      globalAudioEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIdx);
    const prevSong = queue[prevIdx];
    if (prevSong) {
      setCurrentSong(prevSong);
      setCurrentTime(0);
      setDuration(prevSong.duration);
      globalAudioEngine.playSong(prevSong, 0);
      api.recordHistory(prevSong.id);
    }
  }, [currentTime, queue, queueIndex]);

  const handleSeek = (timeInSecs: number) => {
    setCurrentTime(timeInSecs);
    globalAudioEngine.seek(timeInSecs);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(false);
    globalAudioEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const muted = globalAudioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleToggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const handleToggleFavorite = async (songId?: string) => {
    const targetId = songId || currentSong?.id;
    if (!targetId) return;

    const res = await api.toggleFavorite(targetId);
    if (res.isFavorite) {
      setFavorites((prev) => [...prev, targetId]);
    } else {
      setFavorites((prev) => prev.filter((id) => id !== targetId));
    }
  };

  // Playlists handlers
  const handlePlayPlaylist = (playlist: Playlist) => {
    const pSongs = playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));

    if (pSongs.length > 0) {
      handlePlaySong(pSongs[0], pSongs);
    }
  };

  const handleShufflePlaylist = (playlist: Playlist) => {
    const pSongs = playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));

    if (pSongs.length > 0) {
      const shuffled = [...pSongs].sort(() => Math.random() - 0.5);
      handlePlaySong(shuffled[0], shuffled);
      setIsShuffle(true);
    }
  };

  const handleCreatePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const created = await api.createPlaylist(newPlaylistName, newPlaylistDesc);
      setPlaylists((prev) => [...prev, created]);
      setSelectedPlaylistId(created.id);
      setActiveTab('playlist-detail');
      setIsCreatePlaylistOpen(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
    } catch (err) {
      alert('Failed to create playlist');
    }
  };

  const handleAddToPlaylist = async (playlistId: string, songId: string) => {
    try {
      const updated = await api.addSongToPlaylist(playlistId, songId);
      setPlaylists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const updated = await api.removeSongFromPlaylist(playlistId, songId);
      setPlaylists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to remove this song from the catalogue?')) return;
    try {
      await api.deleteSong(songId);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      setQueue((prev) => prev.filter((s) => s.id !== songId));
      if (currentSong?.id === songId) {
        handleNextTrack();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        handleNextTrack();
      } else if (e.code === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        handlePrevTrack();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLyricsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleNextTrack, handlePrevTrack]);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  return (
    <div className="min-h-screen bg-[#121212] text-[#f5f5f7] flex flex-col font-sans selection:bg-[#fa2d48]/40 selection:text-white">
      {/* Apple Music Frosted Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylistId}
        onSelectPlaylist={(pId) => {
          setSelectedPlaylistId(pId);
          setActiveTab('playlist-detail');
          setSearchQuery('');
        }}
        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchFocus={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Apple Music Sticky Top Player Bar */}
        <TopPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          isFavorite={Boolean(currentSong && favorites.includes(currentSong.id))}
          isLyricsOpen={isLyricsOpen}
          isQueueOpen={isQueueOpen}
          onPlayPause={handlePlayPause}
          onPrev={handlePrevTrack}
          onNext={handleNextTrack}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleShuffle={handleToggleShuffle}
          onToggleRepeat={handleToggleRepeat}
          onToggleFavorite={() => handleToggleFavorite()}
          onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8 max-w-7xl w-full mx-auto">
          {searchQuery.trim().length > 0 ? (
            <SearchResultsView
              query={searchQuery}
              songs={songs}
              playlists={playlists}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={(song) => handlePlaySong(song)}
              onSelectPlaylist={(pId) => {
                setSelectedPlaylistId(pId);
                setActiveTab('playlist-detail');
                setSearchQuery('');
              }}
            />
          ) : (
            <>
              {activeTab === 'listen-now' && (
                <ListenNowView
                  songs={songs}
                  playlists={playlists}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={(song) => handlePlaySong(song)}
                  onPlayPlaylist={handlePlayPlaylist}
                  onSelectPlaylist={(pId) => {
                    setSelectedPlaylistId(pId);
                    setActiveTab('playlist-detail');
                  }}
                />
              )}

              {activeTab === 'browse' && (
                <BrowseView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={(song) => handlePlaySong(song)}
                />
              )}

              {activeTab === 'radio' && (
                <RadioView
                  songs={songs}
                  isPlaying={isPlaying}
                  spectrum={spectrum}
                  onPlaySong={(song) => handlePlaySong(song)}
                />
              )}

              {(activeTab === 'songs' || activeTab === 'recently-added') && (
                <SongsView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  favorites={favorites}
                  playlists={playlists}
                  onPlaySong={(song) => handlePlaySong(song)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={handleAddToPlaylist}
                  onDeleteSong={handleDeleteSong}
                />
              )}

              {activeTab === 'favorites' && (
                <SongsView
                  songs={songs.filter((s) => favorites.includes(s.id))}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  favorites={favorites}
                  playlists={playlists}
                  onPlaySong={(song) => handlePlaySong(song)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              )}

              {activeTab === 'albums' && (
                <AlbumsView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={(song) => handlePlaySong(song)}
                />
              )}

              {activeTab === 'artists' && (
                <ArtistsView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={(song) => handlePlaySong(song)}
                />
              )}

              {activeTab === 'playlist-detail' && selectedPlaylist && (
                <PlaylistDetailView
                  playlist={selectedPlaylist}
                  allSongs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={(song) => handlePlaySong(song)}
                  onPlayPlaylist={handlePlayPlaylist}
                  onShufflePlaylist={handleShufflePlaylist}
                  onRemoveSong={handleRemoveFromPlaylist}
                  onAddSong={handleAddToPlaylist}
                />
              )}

              {activeTab === 'admin-studio' && (
                <AdminStudioView
                  songs={songs}
                  onSongAdded={(newSong) => {
                    setSongs((prev) => [newSong, ...prev]);
                    handlePlaySong(newSong);
                  }}
                  onPlaySong={(song) => handlePlaySong(song)}
                  onDeleteSong={handleDeleteSong}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Apple Music Full-Screen Synchronized Glowing Lyrics Modal */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        currentSong={currentSong}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        onPlayPause={handlePlayPause}
      />

      {/* Up Next & History Slide-In Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentIndex={queueIndex}
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayQueueIndex={(idx) => {
          setQueueIndex(idx);
          const song = queue[idx];
          if (song) {
            setCurrentSong(song);
            globalAudioEngine.playSong(song, 0);
          }
        }}
        onClearQueue={() => {
          if (currentSong) setQueue([currentSong]);
          setQueueIndex(0);
        }}
        onRemoveFromQueue={(idx) => {
          setQueue((prev) => prev.filter((_, i) => i !== idx));
        }}
      />

      {/* Create Playlist Modal */}
      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#1e1e22] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Create New Playlist</h3>
              <button
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="text-[#86868b] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a1a1a6] font-medium mb-1">Playlist Name *</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Gym Power Hour or Late Night Coding"
                  className="w-full h-9 px-3 bg-[#242428] border border-white/10 rounded-lg text-white placeholder-[#86868b] focus:outline-none focus:border-[#fa2d48]"
                />
              </div>

              <div>
                <label className="block text-[#a1a1a6] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Give your playlist a description..."
                  className="w-full p-2.5 bg-[#242428] border border-white/10 rounded-lg text-white placeholder-[#86868b] focus:outline-none focus:border-[#fa2d48]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePlaylistOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#d1d1d6] font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#fc3c44] text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apple Music Mobile Floating Mini-Player & iOS Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onOpenNowPlaying={() => setIsMobileNowPlayingOpen(true)}
        onOpenSearchFocus={() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Apple Music iOS Full-Screen Now Playing Modal Sheet */}
      <MobileNowPlayingSheet
        isOpen={isMobileNowPlayingOpen}
        onClose={() => setIsMobileNowPlayingOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFavorite={currentSong ? favorites.includes(currentSong.id) : false}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        spectrum={spectrum}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onToggleFavorite={() => handleToggleFavorite()}
        onToggleShuffle={handleToggleShuffle}
        onCycleRepeat={handleToggleRepeat}
        onOpenLyrics={() => {
          setIsMobileNowPlayingOpen(false);
          setIsLyricsOpen(true);
        }}
        onOpenQueue={() => {
          setIsMobileNowPlayingOpen(false);
          setIsQueueOpen(true);
        }}
      />
    </div>
  );
}
