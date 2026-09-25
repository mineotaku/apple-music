import React from 'react';
import { Play, Shuffle, Sparkles, Radio, ChevronRight } from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface ListenNowViewProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onSelectPlaylist: (playlistId: string) => void;
}

export const ListenNowView: React.FC<ListenNowViewProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayPlaylist,
  onSelectPlaylist,
}) => {
  const featuredSong = songs[0] || null;

  return (
    <div className="space-y-10 pb-16">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Listen Now</h1>
        <p className="text-sm text-[#86868b] mt-1">
          Handpicked releases, personalized stations, and Spatial Audio masterpieces.
        </p>
      </div>

      {/* Hero Showcase Banner */}
      {featuredSong && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#20152b] via-[#1a1829] to-[#121214] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Subtle atmospheric glow */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: featuredSong.coverGradient[0] }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#fa2d48]">
                  Featured Spatial Audio
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-xs text-[#a1a1a6]">Apple Music 1 Spotlight</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {featuredSong.title}
              </h2>

              <p className="text-base sm:text-lg text-[#d1d1d6] font-medium">
                {featuredSong.artist} — <span className="text-[#86868b]">{featuredSong.album}</span>
              </p>

              <div className="flex items-center gap-2 pt-1 text-xs text-[#a1a1a6]">
                <span className="px-2 py-0.5 rounded bg-white/[0.08] text-white font-semibold">
                  Lossless
                </span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.08] text-[#3b82f6] font-semibold">
                  Dolby Atmos
                </span>
                <span>·</span>
                <span className="font-mono tabular-nums">{featuredSong.bitrate}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => onPlaySong(featuredSong)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#fc3c44] text-white font-semibold text-sm shadow-lg shadow-[#fa2d48]/30 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentSong?.id === featuredSong.id && isPlaying ? 'Pause' : 'Play Now'}</span>
                </button>

                <button
                  onClick={() => {
                    const randomSong = songs[Math.floor(Math.random() * songs.length)];
                    if (randomSong) onPlaySong(randomSong);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-medium text-sm transition-colors border border-white/[0.06]"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Hero Album Cover */}
            <div className="shrink-0 drop-shadow-2xl">
              <AlbumCoverArt
                title={featuredSong.title}
                artist={featuredSong.artist}
                gradient={featuredSong.coverGradient}
                size="hero"
                badge="dolby"
                isCurrent={currentSong?.id === featuredSong.id}
                isPlaying={isPlaying}
                onPlayClick={() => onPlaySong(featuredSong)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Picks / Heavy Rotation Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Top Picks</h2>
            <p className="text-xs text-[#86868b]">Updated hourly based on your acoustic profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {songs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className="group cursor-pointer flex flex-col p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                <AlbumCoverArt
                  title={song.title}
                  artist={song.artist}
                  gradient={song.coverGradient}
                  size="md"
                  className="w-full aspect-square"
                  badge={song.isDolbyAtmos ? 'dolby' : 'lossless'}
                  isCurrent={isCurrent}
                  isPlaying={isCurrent && isPlaying}
                  onPlayClick={() => onPlaySong(song)}
                />
                <div className="mt-2.5 min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[#fa2d48] transition-colors">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-[#86868b] truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curated Editorial Playlists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Made for You</h2>
            <p className="text-xs text-[#86868b]">Continuous mix tapes crafted with Apple Music algorithms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist.id)}
              className="group cursor-pointer relative overflow-hidden rounded-2xl p-5 border border-white/[0.06] hover:border-white/20 transition-all hover:bg-white/[0.03] flex items-center justify-between gap-4"
              style={{
                background: `linear-gradient(135deg, ${playlist.gradient[0]}22 0%, #161618 100%)`,
              }}
            >
              <div className="space-y-1.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#fa2d48]">
                  {playlist.curator}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-[#fa2d48] transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-xs text-[#86868b] line-clamp-2 leading-relaxed">
                  {playlist.description}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#a1a1a6]">
                  <span>{playlist.songIds.length} tracks</span>
                  <span>·</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayPlaylist(playlist);
                    }}
                    className="text-[#fa2d48] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-[#fa2d48]" /> Play All
                  </button>
                </div>
              </div>

              <div className="shrink-0">
                <AlbumCoverArt
                  size="md"
                  gradient={playlist.gradient}
                  title={playlist.name}
                  artist={playlist.curator}
                  onPlayClick={() => onPlayPlaylist(playlist)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
