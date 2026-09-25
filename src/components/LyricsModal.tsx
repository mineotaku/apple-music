import React, { useEffect, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Song } from '../types/music';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  currentTime,
  isPlaying,
  onSeek,
  onPlayPause,
}) => {
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !currentSong) return null;

  const lyrics = currentSong.lyrics || [];

  // Find active line index based on currentTime
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smoothly scroll active lyric into view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const gradient = currentSong.coverGradient || ['#fa2d48', '#8b5cf6'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col select-none animate-fadeIn">
      {/* Dynamic blurred ambient gradient background */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${gradient[0]}dd 0%, ${gradient[1]}99 50%, #0d0d10 100%)`,
        }}
      />
      {/* Heavy frosted blur layer */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl shadow-lg border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            }}
          />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight leading-tight">
              {currentSong.title}
            </h3>
            <p className="text-xs text-white/70 font-medium">
              {currentSong.artist} · <span className="text-[#fa2d48] font-semibold">Lossless Audio</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          title="Close Lyrics"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Synchronized Lyrics Container */}
      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-16 lg:px-24 py-12 scrollbar-none flex flex-col justify-start space-y-8 max-w-4xl mx-auto w-full text-left"
      >
        {lyrics.length === 0 ? (
          <div className="text-center py-24 text-white/50 text-xl font-medium">
            No synchronized lyrics available for this track.
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`cursor-pointer transition-all duration-300 transform origin-left ${
                  isActive
                    ? 'text-white text-3xl sm:text-5xl font-extrabold tracking-tight scale-100 drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)] opacity-100 py-2'
                    : isPast
                    ? 'text-white/40 text-2xl sm:text-3xl font-bold tracking-tight hover:text-white/70 opacity-50'
                    : 'text-white/30 text-2xl sm:text-3xl font-bold tracking-tight hover:text-white/60 opacity-40'
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="relative z-10 p-6 flex items-center justify-center gap-6 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={onPlayPause}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
