import React, { useState } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Mic2, 
  Airplay, 
  Share2, 
  Sparkles,
  Shuffle,
  Repeat
} from 'lucide-react';
import { Song } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';
import { RepeatMode } from '../services/audioEngine';

interface MobileNowPlayingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  spectrum: number[];
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFavorite: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onOpenLyrics: () => void;
  onOpenQueue: () => void;
}

export const MobileNowPlayingSheet: React.FC<MobileNowPlayingSheetProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFavorite,
  isShuffle,
  repeatMode,
  spectrum,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onToggleFavorite,
  onToggleShuffle,
  onCycleRepeat,
  onOpenLyrics,
  onOpenQueue,
}) => {
  const [showLyricsInline, setShowLyricsInline] = useState(false);

  if (!isOpen || !currentSong) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const gradient0 = currentSong.coverGradient?.[0] || '#fa2d48';
  const gradient1 = currentSong.coverGradient?.[1] || '#8b5cf6';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1c1c1e] via-[#121214] to-[#0a0a0c] text-white animate-slideUp">
      {/* Dynamic blurred ambient glow behind artwork */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px] opacity-40 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${gradient0} 0%, ${gradient1} 70%, transparent 100%)`
        }}
      />

      {/* Top Header / Pull Bar */}
      <div className="relative z-10 px-6 pt-4 pb-2 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.08] text-[#d1d1d6] active:scale-95 transition-all"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Drag Pill */}
        <div className="w-12 h-1.5 rounded-full bg-white/30" />

        <button 
          onClick={onOpenQueue}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.08] text-[#d1d1d6] active:scale-95 transition-all"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Center Artwork or Inline Lyrics */}
      <div className="relative z-10 flex-1 px-8 flex flex-col items-center justify-center min-h-0">
        {!showLyricsInline ? (
          <div className="w-full max-w-[320px] aspect-square shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/15 my-auto">
            <AlbumCoverArt
              title={currentSong.title}
              artist={currentSong.artist}
              gradient={currentSong.coverGradient}
              size="hero"
            />
          </div>
        ) : (
          <div className="w-full h-full max-h-[340px] overflow-y-auto px-4 py-2 space-y-4 text-center my-auto no-scrollbar">
            {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
              currentSong.lyrics.map((line, idx) => {
                const isActive = currentTime >= line.time && (idx === currentSong.lyrics.length - 1 || currentTime < currentSong.lyrics[idx + 1].time);
                return (
                  <p
                    key={idx}
                    onClick={() => onSeek(line.time)}
                    className={`cursor-pointer transition-all duration-300 font-semibold ${
                      isActive 
                        ? 'text-white text-xl scale-105 drop-shadow-[0_0_12px_rgba(250,45,72,0.6)]' 
                        : 'text-white/40 text-base hover:text-white/70'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-white/50 text-sm italic mt-20">Instrumental / No synced lyrics available</p>
            )}
          </div>
        )}

        {/* Lossless & Spatial Audio Pill Badges */}
        <div className="flex items-center gap-2 mt-4">
          {currentSong.isLossless && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/[0.1] text-white/90 uppercase border border-white/10">
              Lossless
            </span>
          )}
          {currentSong.isDolbyAtmos && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/[0.1] text-white/90 uppercase border border-white/10">
              Spatial Audio
            </span>
          )}
          {currentSong.isAppleDigitalMaster && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/[0.1] text-white/90 uppercase border border-white/10">
              Apple Digital Master
            </span>
          )}
        </div>
      </div>

      {/* Song Title & Heart */}
      <div className="relative z-10 px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-bold text-white truncate tracking-tight">
              {currentSong.title}
            </h2>
            <p className="text-sm font-medium text-white/60 truncate mt-0.5">
              {currentSong.artist} — {currentSong.album}
            </p>
          </div>
          <button 
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-full transition-transform active:scale-90 ${
              isFavorite ? 'text-[#fa2d48] bg-[#fa2d48]/10' : 'text-white/50 hover:text-white bg-white/[0.06]'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#fa2d48]' : ''}`} />
          </button>
        </div>

        {/* Real-time spectrum visualizer bar */}
        <div className="flex items-end justify-between h-4 gap-1 mt-3 px-1">
          {spectrum.slice(0, 24).map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-gradient-to-t from-[#fa2d48] to-[#ff7a00] transition-all duration-75"
              style={{
                height: `${Math.max(15, val * 100)}%`,
                opacity: isPlaying ? 0.75 + val * 0.25 : 0.2
              }}
            />
          ))}
        </div>

        {/* Scrubber Slider */}
        <div className="mt-3">
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              onSeek(pct * duration);
            }}
            className="group relative h-2 w-full bg-white/[0.12] rounded-full cursor-pointer overflow-hidden"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-[#fa2d48] rounded-full transition-colors"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-white/50 mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button 
            onClick={onPrev}
            className="p-3 text-white/80 active:scale-90 transition-transform"
          >
            <SkipBack className="w-8 h-8 fill-white/80" />
          </button>

          <button 
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-black" />
            ) : (
              <Play className="w-8 h-8 fill-black ml-1" />
            )}
          </button>

          <button 
            onClick={onNext}
            className="p-3 text-white/80 active:scale-90 transition-transform"
          >
            <SkipForward className="w-8 h-8 fill-white/80" />
          </button>

          <button
            onClick={onCycleRepeat}
            className={`p-2 rounded-full transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === 'one' && (
              <span className="absolute top-1 right-1 text-[9px] font-bold">1</span>
            )}
          </button>
        </div>

        {/* Bottom Utility Bar: Lyrics Toggle & AirPlay */}
        <div className="flex items-center justify-around mt-4 pt-3 border-t border-white/[0.08] text-white/60 pb-6">
          <button 
            onClick={() => setShowLyricsInline(!showLyricsInline)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              showLyricsInline ? 'bg-[#fa2d48]/20 text-[#fa2d48]' : 'bg-white/[0.06] text-white/70'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span>Lyrics</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Airplay className="w-4 h-4" />
            <span>AirPlay Lossless</span>
          </div>

          <button 
            onClick={onOpenQueue}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.06] text-white/70"
          >
            <ListMusic className="w-4 h-4" />
            <span>Playing Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};
