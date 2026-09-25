import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Heart, 
  ListMusic, 
  Quote, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Cast,
  Info
} from 'lucide-react';
import { Song } from '../types/music';
import { RepeatMode } from '../services/audioEngine';
import { AlbumCoverArt } from './AlbumCoverArt';

interface TopPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isFavorite: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onToggleMobileSidebar: () => void;
}

export const TopPlayer: React.FC<TopPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  isFavorite,
  isLyricsOpen,
  isQueueOpen,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onToggleLyrics,
  onToggleQueue,
  onToggleMobileSidebar,
}) => {
  const [showAudioInfo, setShowAudioInfo] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRemainingTime = (cur: number, dur: number) => {
    const remaining = Math.max(0, dur - cur);
    return `-${formatTime(remaining)}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#18181b]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger + navigation + transport controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-md text-[#a1a1a6] hover:text-white hover:bg-white/[0.08] lg:hidden"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1 text-[#86868b] mr-2">
          <button className="p-1 hover:text-white rounded disabled:opacity-40" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 hover:text-white rounded disabled:opacity-40" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Shuffle */}
        <button
          onClick={onToggleShuffle}
          className={`p-1.5 rounded-md transition-colors ${
            isShuffle ? 'text-[#fa2d48] bg-[#fa2d48]/10' : 'text-[#a1a1a6] hover:text-white'
          }`}
          title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrev}
          className="p-1.5 rounded-md text-[#a1a1a6] hover:text-white hover:scale-105 active:scale-95 transition-all"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black" />
          ) : (
            <Play className="w-4 h-4 fill-black ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="p-1.5 rounded-md text-[#a1a1a6] hover:text-white hover:scale-105 active:scale-95 transition-all"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        {/* Repeat */}
        <button
          onClick={onToggleRepeat}
          className={`p-1.5 rounded-md relative transition-colors ${
            repeatMode !== 'off' ? 'text-[#fa2d48] bg-[#fa2d48]/10' : 'text-[#a1a1a6] hover:text-white'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          <Repeat className="w-4 h-4" />
          {repeatMode === 'one' && (
            <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-[#fa2d48]">1</span>
          )}
        </button>
      </div>

      {/* Center: Apple Music LCD / Capsule track display */}
      <div className="flex-1 max-w-xl mx-auto min-w-0">
        <div className="relative flex items-center gap-3 bg-[#242426] hover:bg-[#28282b] transition-colors border border-white/[0.08] rounded-xl px-3 py-1.5 shadow-inner">
          {/* Mini Album Cover */}
          <AlbumCoverArt
            size="xs"
            gradient={currentSong?.coverGradient || ['#fa2d48', '#8b5cf6']}
            isPlaying={isPlaying}
            isCurrent={true}
            showPlayOnHover={false}
          />

          {/* Track Info & Scrubber */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Title & Artist & Badges */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-semibold text-white truncate">
                  {currentSong ? currentSong.title : 'Not Playing'}
                </span>
                <span className="text-white/40 text-xs shrink-0">·</span>
                <span className="text-xs text-[#a1a1a6] truncate">
                  {currentSong ? currentSong.artist : 'Select a track to stream'}
                </span>
              </div>

              {/* Audio Format Pill & Favorite */}
              <div className="flex items-center gap-1.5 shrink-0">
                {currentSong && (
                  <button
                    onClick={() => setShowAudioInfo(!showAudioInfo)}
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.08] hover:bg-white/[0.15] text-[#fa2d48] border border-white/[0.06] transition-colors"
                    title="Audio Quality Stream Specs"
                  >
                    Lossless
                  </button>
                )}

                {currentSong && (
                  <button
                    onClick={onToggleFavorite}
                    className="p-0.5 rounded transition-transform active:scale-125"
                    title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFavorite ? 'text-[#fa2d48] fill-[#fa2d48]' : 'text-[#86868b] hover:text-white'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Scrubber Bar */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono tabular-nums text-[#86868b] w-8 text-right shrink-0">
                {formatTime(currentTime)}
              </span>

              <div 
                className="relative flex-1 h-3 flex items-center cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  onSeek(ratio * duration);
                }}
              >
                {/* Background track */}
                <div className="w-full h-1 bg-white/[0.15] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white group-hover:bg-[#fa2d48] transition-colors duration-150 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Scrubber thumb */}
                <div
                  className="absolute w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -ml-1"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              <span className="text-[10px] font-mono tabular-nums text-[#86868b] w-9 shrink-0">
                {formatRemainingTime(currentTime, duration)}
              </span>
            </div>
          </div>

          {/* Audio Quality Info Popover */}
          {showAudioInfo && currentSong && (
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[#1e1e20] border border-white/10 rounded-xl shadow-2xl z-50 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-semibold text-white">Apple Lossless Audio</span>
                <span className="text-[10px] bg-[#fa2d48]/20 text-[#fa2d48] px-1.5 py-0.5 rounded font-bold">ALAC</span>
              </div>
              <div className="py-2 space-y-1.5 text-xs text-[#a1a1a6]">
                <div className="flex justify-between">
                  <span>Stream Quality:</span>
                  <span className="text-white font-mono tabular-nums">{currentSong.bitrate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Encoding Codec:</span>
                  <span className="text-white">{currentSong.codec}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spatial Audio:</span>
                  <span className="text-[#3b82f6]">{currentSong.isDolbyAtmos ? 'Dolby Atmos' : 'Stereo'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Streaming Protocol:</span>
                  <span className="text-emerald-400 font-mono">HTTP 206 Range</span>
                </div>
              </div>
              <p className="text-[10px] text-[#86868b] pt-1 border-t border-white/[0.06]">
                Delivered byte-by-byte with low latency seeking and zero loss in acoustic fidelity.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Lyrics, Queue, Volume */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Lyrics Button */}
        <button
          onClick={onToggleLyrics}
          className={`p-1.5 rounded-lg transition-colors ${
            isLyricsOpen ? 'bg-[#fa2d48] text-white shadow-sm' : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Time-Synced Lyrics"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Up Next / Queue Button */}
        <button
          onClick={onToggleQueue}
          className={`p-1.5 rounded-lg transition-colors ${
            isQueueOpen ? 'bg-[#fa2d48] text-white shadow-sm' : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Playing Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* AirPlay / Output simulation */}
        <button
          className="hidden md:flex p-1.5 rounded-lg text-[#a1a1a6] hover:text-white hover:bg-white/[0.06] transition-colors"
          title="AirPlay & Audio Devices"
        >
          <Cast className="w-4 h-4" />
        </button>

        {/* Volume Slider with Mute */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2">
          <button
            onClick={onToggleMute}
            className="text-[#a1a1a6] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 lg:w-24 h-1 bg-white/[0.2] rounded-full accent-white hover:accent-[#fa2d48] cursor-pointer"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </header>
  );
};
