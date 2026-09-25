import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Clock, 
  Plus, 
  Trash2, 
  Disc, 
  Check, 
  ArrowUpDown 
} from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface SongsViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: string[];
  playlists: Playlist[];
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onDeleteSong?: (songId: string) => void;
}

export const SongsView: React.FC<SongsViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  favorites,
  playlists,
  onPlaySong,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteSong,
}) => {
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'album' | 'duration' | 'plays'>('title');
  const [sortAsc, setSortAsc] = useState(true);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const sortedSongs = [...songs].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'title') comp = a.title.localeCompare(b.title);
    else if (sortBy === 'artist') comp = a.artist.localeCompare(b.artist);
    else if (sortBy === 'album') comp = a.album.localeCompare(b.album);
    else if (sortBy === 'duration') comp = a.duration - b.duration;
    else if (sortBy === 'plays') comp = a.plays - b.plays;
    return sortAsc ? comp : -comp;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Songs</h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            {songs.length} tracks · {Math.round(songs.reduce((acc, s) => acc + s.duration, 0) / 60)} minutes total
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => songs[0] && onPlaySong(songs[0])}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fa2d48] hover:bg-[#fc3c44] text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play All</span>
          </button>
        </div>
      </div>

      {/* Apple Music Tracklist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-white/[0.08] text-[#86868b] uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th 
                onClick={() => handleSort('title')}
                className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Title</span>
                  {sortBy === 'title' && <ArrowUpDown className="w-3 h-3 text-[#fa2d48]" />}
                </div>
              </th>
              <th 
                onClick={() => handleSort('artist')}
                className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Artist</span>
                  {sortBy === 'artist' && <ArrowUpDown className="w-3 h-3 text-[#fa2d48]" />}
                </div>
              </th>
              <th 
                onClick={() => handleSort('album')}
                className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors hidden lg:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Album</span>
                  {sortBy === 'album' && <ArrowUpDown className="w-3 h-3 text-[#fa2d48]" />}
                </div>
              </th>
              <th 
                onClick={() => handleSort('plays')}
                className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors hidden sm:table-cell text-right"
              >
                Plays
              </th>
              <th className="py-2.5 px-3 text-center hidden xl:table-cell">Format</th>
              <th 
                onClick={() => handleSort('duration')}
                className="py-2.5 px-3 w-16 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sortedSongs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = favorites.includes(song.id);
              const isMenuOpen = activeMenuSongId === song.id;

              return (
                <tr
                  key={song.id}
                  onDoubleClick={() => onPlaySong(song)}
                  className={`group transition-colors hover:bg-white/[0.04] ${
                    isCurrent ? 'bg-white/[0.06] text-[#fa2d48]' : 'text-white'
                  }`}
                >
                  {/* # or Play button */}
                  <td className="py-2.5 px-3 text-center text-[#86868b]">
                    <div className="relative flex items-center justify-center w-6 h-6 mx-auto">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-[#fa2d48] animate-pulse h-full" />
                          <span className="w-0.5 bg-[#fa2d48] animate-pulse h-2/3" />
                          <span className="w-0.5 bg-[#fa2d48] animate-pulse h-4/5" />
                        </div>
                      ) : (
                        <span className="group-hover:hidden font-mono text-[11px]">
                          {idx + 1}
                        </span>
                      )}
                      <button
                        onClick={() => onPlaySong(song)}
                        className={`hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full text-white hover:scale-110 active:scale-95 transition-transform ${
                          isCurrent ? 'text-[#fa2d48]' : 'text-white'
                        }`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Title & Cover */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-3">
                      <AlbumCoverArt
                        size="xs"
                        gradient={song.coverGradient}
                        isPlaying={isCurrent && isPlaying}
                        isCurrent={isCurrent}
                        showPlayOnHover={false}
                      />
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${isCurrent ? 'text-[#fa2d48]' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[11px] text-[#86868b] md:hidden truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Artist */}
                  <td className="py-2.5 px-3 text-[#a1a1a6] hidden md:table-cell truncate">
                    {song.artist}
                  </td>

                  {/* Album */}
                  <td className="py-2.5 px-3 text-[#86868b] hidden lg:table-cell truncate">
                    {song.album}
                  </td>

                  {/* Plays */}
                  <td className="py-2.5 px-3 text-right font-mono text-[#86868b] hidden sm:table-cell tabular-nums">
                    {song.plays.toLocaleString()}
                  </td>

                  {/* Format Pill */}
                  <td className="py-2.5 px-3 text-center hidden xl:table-cell">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-[#86868b]">
                      {song.isDolbyAtmos ? 'Dolby Atmos' : 'Lossless'}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-2.5 px-3 text-right font-mono text-[#86868b] tabular-nums">
                    {formatDuration(song.duration)}
                  </td>

                  {/* Actions / Loved / Context Menu */}
                  <td className="py-2.5 px-2 text-center relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleFavorite(song.id)}
                        className="p-1 rounded text-[#86868b] hover:text-[#fa2d48] transition-colors"
                        title={isFav ? 'Remove Favorite' : 'Favorite'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[#fa2d48] fill-[#fa2d48]' : ''}`} />
                      </button>

                      <button
                        onClick={() => setActiveMenuSongId(isMenuOpen ? null : song.id)}
                        className="p-1 rounded text-[#86868b] hover:text-white transition-colors"
                        title="More Actions"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Popover Dropdown Menu */}
                    {isMenuOpen && (
                      <div 
                        onMouseLeave={() => setActiveMenuSongId(null)}
                        className="absolute right-0 top-full mt-1 w-48 bg-[#1e1e22] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 text-left text-xs"
                      >
                        <p className="px-2 py-1 text-[10px] font-bold text-[#86868b] uppercase tracking-wider">
                          Add to Playlist
                        </p>
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => {
                              onAddToPlaylist(pl.id, song.id);
                              setActiveMenuSongId(null);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-white/[0.08] text-white flex items-center justify-between"
                          >
                            <span className="truncate">{pl.name}</span>
                            {pl.songIds.includes(song.id) && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        ))}

                        {onDeleteSong && (
                          <div className="mt-1 pt-1 border-t border-white/[0.08]">
                            <button
                              onClick={() => {
                                onDeleteSong(song.id);
                                setActiveMenuSongId(null);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-red-500/20 text-red-400 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Track</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
