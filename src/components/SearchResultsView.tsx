import React from 'react';
import { Play, Search, Disc, Users, Music } from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface SearchResultsViewProps {
  query: string;
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onSelectPlaylist: (playlistId: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectPlaylist,
}) => {
  const q = query.toLowerCase().trim();

  const matchedSongs = songs.filter(
    (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)
  );

  const matchedPlaylists = playlists.filter((p) => p.name.toLowerCase().includes(q));

  const topSong = matchedSongs[0] || null;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-xs text-[#86868b] mt-1">
          {matchedSongs.length} songs · {matchedPlaylists.length} playlists found
        </p>
      </div>

      {matchedSongs.length === 0 && matchedPlaylists.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Search className="w-12 h-12 text-[#86868b] mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-white">No results found</h3>
          <p className="text-xs text-[#86868b]">Please check your spelling or search for another artist, song, or album.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Result (Apple Music signature feature) */}
          {topSong && (
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-base font-bold text-white">Top Result</h2>
              <div
                onClick={() => onPlaySong(topSong)}
                className="group cursor-pointer p-5 rounded-2xl bg-[#1c1c1f] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between h-64 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <AlbumCoverArt
                    size="md"
                    title={topSong.title}
                    artist={topSong.artist}
                    gradient={topSong.coverGradient}
                    isPlaying={currentSong?.id === topSong.id && isPlaying}
                    isCurrent={currentSong?.id === topSong.id}
                    onPlayClick={() => onPlaySong(topSong)}
                  />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/[0.06] text-[#fa2d48]">
                    Song
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#fa2d48] transition-colors">
                    {topSong.title}
                  </h3>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    {topSong.artist} · <span className="text-white/60">{topSong.album}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fa2d48] text-white text-xs font-semibold shadow hover:scale-105 active:scale-95 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play</span>
                    </button>
                    <span className="text-[10px] text-[#86868b] uppercase font-bold">
                      {topSong.isDolbyAtmos ? 'Dolby Atmos' : 'Lossless'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Songs matching */}
          <div className={`${topSong ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
            <h2 className="text-base font-bold text-white">Songs</h2>
            <div className="space-y-1">
              {matchedSongs.slice(0, 6).map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => onPlaySong(song)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors ${
                      isCurrent ? 'bg-white/[0.06] text-[#fa2d48]' : 'text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                      <span className="text-[10px] uppercase font-bold text-[#86868b] px-1.5 py-0.5 rounded bg-white/[0.06]">
                        {song.isDolbyAtmos ? 'Atmos' : 'Lossless'}
                      </span>
                      <span className="font-mono text-xs text-[#86868b]">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Playlists matching */}
      {matchedPlaylists.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white">Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {matchedPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="group cursor-pointer p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <AlbumCoverArt
                  size="md"
                  className="w-full aspect-square"
                  title={pl.name}
                  artist={pl.curator}
                  gradient={pl.gradient}
                />
                <h4 className="text-xs font-semibold text-white mt-2 truncate group-hover:text-[#fa2d48] transition-colors">
                  {pl.name}
                </h4>
                <p className="text-[11px] text-[#86868b] truncate">{pl.curator}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
