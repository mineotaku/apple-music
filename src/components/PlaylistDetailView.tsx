import React, { useState } from 'react';
import { Play, Shuffle, Plus, Trash2, Clock, Music } from 'lucide-react';
import { Playlist, Song } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  allSongs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onShufflePlaylist: (playlist: Playlist) => void;
  onRemoveSong: (playlistId: string, songId: string) => void;
  onAddSong: (playlistId: string, songId: string) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  allSongs,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayPlaylist,
  onShufflePlaylist,
  onRemoveSong,
  onAddSong,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Retrieve full songs in playlist
  const playlistSongs = playlist.songIds
    .map((id) => allSongs.find((s) => s.id === id))
    .filter((s): s is Song => Boolean(s));

  const totalDurationSecs = playlistSongs.reduce((acc, s) => acc + s.duration, 0);
  const totalMins = Math.floor(totalDurationSecs / 60);

  const songsNotYetInPlaylist = allSongs.filter((s) => !playlist.songIds.includes(s.id));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-white/[0.08]">
        <AlbumCoverArt
          size="lg"
          title={playlist.name}
          artist={playlist.curator}
          gradient={playlist.gradient}
          onPlayClick={() => onPlayPlaylist(playlist)}
        />

        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#fa2d48]">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1a6] max-w-xl">
            {playlist.description}
          </p>
          <p className="text-xs text-[#86868b]">
            {playlist.curator} · {playlistSongs.length} Songs, {totalMins} minutes
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
            <button
              onClick={() => onPlayPlaylist(playlist)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#fc3c44] text-white font-semibold text-xs shadow-lg active:scale-95 transition-transform"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play</span>
            </button>

            <button
              onClick={() => onShufflePlaylist(playlist)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-medium text-xs border border-white/[0.06] transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-medium text-xs border border-white/[0.06] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Songs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Tracklist */}
      {playlistSongs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Music className="w-12 h-12 text-[#86868b] mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-white">This playlist is empty</h3>
          <p className="text-xs text-[#86868b]">Add songs from your master catalogue to build this mix.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90"
          >
            Add Songs Now
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {playlistSongs.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onDoubleClick={() => onPlaySong(song)}
                className={`group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.05] transition-colors ${
                  isCurrent ? 'bg-white/[0.06] text-[#fa2d48]' : 'text-white'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-5 text-right font-mono text-xs text-[#86868b] group-hover:hidden">
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => onPlaySong(song)}
                    className="hidden group-hover:flex items-center justify-center w-5 h-5 text-white"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <AlbumCoverArt
                    size="xs"
                    gradient={song.coverGradient}
                    showPlayOnHover={false}
                    isPlaying={isCurrent && isPlaying}
                    isCurrent={isCurrent}
                  />

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#fa2d48]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-[11px] text-[#86868b] truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#86868b] hidden md:inline truncate max-w-xs">
                    {song.album}
                  </span>
                  <span className="font-mono text-xs text-[#86868b]">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => onRemoveSong(playlist.id, song.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#86868b] hover:text-red-400 transition-opacity"
                    title="Remove from Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Songs Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#1e1e22] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Add Songs to &ldquo;{playlist.name}&rdquo;</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#86868b] hover:text-white text-sm"
              >
                Done
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {songsNotYetInPlaylist.length === 0 ? (
                <p className="text-xs text-[#86868b] text-center py-6">All available songs are already in this playlist!</p>
              ) : (
                songsNotYetInPlaylist.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-[#86868b] truncate">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => onAddSong(playlist.id, song.id)}
                      className="px-2.5 py-1 rounded bg-[#fa2d48] hover:bg-[#fc3c44] text-white text-xs font-semibold shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
