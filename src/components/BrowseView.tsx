import React from 'react';
import { Play, TrendingUp, Sparkles, Globe, Compass } from 'lucide-react';
import { Song } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface BrowseViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
}

const genres = [
  { name: 'Spatial Audio', gradient: ['#3b82f6', '#8b5cf6'] as [string, string] },
  { name: 'Electronic', gradient: ['#06b6d4', '#3b82f6'] as [string, string] },
  { name: 'R&B / Soul', gradient: ['#ec4899', '#8b5cf6'] as [string, string] },
  { name: 'Indie & Acoustic', gradient: ['#f59e0b', '#ef4444'] as [string, string] },
  { name: 'Classical Masterworks', gradient: ['#10b981', '#06b6d4'] as [string, string] },
  { name: 'Hip-Hop / Rap', gradient: ['#f43f5e', '#fb923c'] as [string, string] },
  { name: 'Chill & Ambient', gradient: ['#6366f1', '#a855f7'] as [string, string] },
  { name: 'Jazz & Lo-Fi', gradient: ['#d97706', '#b45309'] as [string, string] },
];

const cityCharts = [
  { city: 'Tokyo Top 25', track: 'Starfall Over Shibuya', artist: 'Kaito Takahashi' },
  { city: 'New York Top 25', track: 'Midnight Velvet', artist: 'Marcus Vance' },
  { city: 'London Top 25', track: 'Golden Hour Reverie', artist: 'Elena Rostova' },
  { city: 'Paris Top 25', track: 'Clair de Lune (Spatial)', artist: 'Julian C. Mercier' },
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
}) => {
  return (
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Browse</h1>
        <p className="text-sm text-[#86868b] mt-1">
          Explore global charts, emerging artists, and spatial music categories.
        </p>
      </div>

      {/* Featured Editorial Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => songs[0] && onPlaySong(songs[0])}
          className="group cursor-pointer relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#1e1b4b] to-[#121214] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between h-64"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#fa2d48] tracking-widest uppercase">
              Exclusive Release
            </span>
            <h3 className="text-2xl font-bold text-white group-hover:text-[#fa2d48] transition-colors">
              Spatial Horizons: Future Audio
            </h3>
            <p className="text-xs text-[#a1a1a6]">
              Engineered with multi-channel Dolby Atmos depth for headphones and studio monitors.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-md group-hover:bg-[#fa2d48] group-hover:text-white transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" />
              Listen Now
            </button>
            <span className="text-xs text-[#86868b]">High-Res 24-bit / 96kHz</span>
          </div>
        </div>

        <div 
          onClick={() => songs[1] && onPlaySong(songs[1])}
          className="group cursor-pointer relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#451a03] to-[#121214] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between h-64"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#f59e0b] tracking-widest uppercase">
              Apple Music 1 Sessions
            </span>
            <h3 className="text-2xl font-bold text-white group-hover:text-[#f59e0b] transition-colors">
              Acoustic Resonance
            </h3>
            <p className="text-xs text-[#a1a1a6]">
              Pure unadulterated live recordings captured on pristine Neumann tube microphones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-md group-hover:bg-[#f59e0b] group-hover:text-white transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" />
              Listen Now
            </button>
            <span className="text-xs text-[#86868b]">Apple Digital Master</span>
          </div>
        </div>
      </div>

      {/* Global Charts / Top Songs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#fa2d48]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Today&apos;s Top Tracks</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className={`group cursor-pointer flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] hover:bg-white/[0.06] transition-colors ${
                  isCurrent ? 'bg-white/[0.08] border-[#fa2d48]/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center font-bold text-sm text-[#86868b] group-hover:text-white">
                    {index + 1}
                  </span>
                  <AlbumCoverArt
                    size="sm"
                    gradient={song.coverGradient}
                    title={song.title}
                    artist={song.artist}
                    isPlaying={isCurrent && isPlaying}
                    isCurrent={isCurrent}
                    onPlayClick={() => onPlaySong(song)}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#fa2d48]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-[11px] text-[#86868b] truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] text-[#86868b] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06]">
                    {song.isDolbyAtmos ? 'Atmos' : 'Lossless'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* City Charts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold text-white tracking-tight">City Charts</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cityCharts.map((item) => (
            <div
              key={item.city}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-[#fa2d48] uppercase tracking-wider">{item.city}</p>
              <h4 className="text-sm font-semibold text-white mt-1 truncate">{item.track}</h4>
              <p className="text-xs text-[#86868b] truncate">{item.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Browse by Category & Genre */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-4">Browse by Genre</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.name}
              className="relative overflow-hidden rounded-xl h-24 p-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md flex items-end"
              style={{
                background: `linear-gradient(135deg, ${genre.gradient[0]} 0%, ${genre.gradient[1]} 100%)`,
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <span className="relative z-10 text-sm font-bold text-white tracking-tight drop-shadow">
                {genre.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
