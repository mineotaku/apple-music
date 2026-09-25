import React from 'react';
import { Play, Pause, Disc } from 'lucide-react';

interface AlbumCoverArtProps {
  title?: string;
  artist?: string;
  gradient?: [string, string];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isPlaying?: boolean;
  isCurrent?: boolean;
  showPlayOnHover?: boolean;
  onPlayClick?: () => void;
  className?: string;
  badge?: 'lossless' | 'dolby' | 'master' | null;
}

export const AlbumCoverArt: React.FC<AlbumCoverArtProps> = ({
  title = 'Apple Music',
  artist = 'Featured',
  gradient = ['#fa2d48', '#8b5cf6'],
  size = 'md',
  isPlaying = false,
  isCurrent = false,
  showPlayOnHover = true,
  onPlayClick,
  className = '',
  badge = null,
}) => {
  const sizeClasses = {
    xs: 'w-10 h-10 rounded-md text-[9px]',
    sm: 'w-12 h-12 rounded-lg text-[10px]',
    md: 'w-36 h-36 rounded-xl text-xs',
    lg: 'w-48 h-48 rounded-2xl text-sm',
    xl: 'w-64 h-64 rounded-2xl text-base',
    hero: 'w-72 h-72 sm:w-80 sm:h-80 rounded-2xl text-lg',
  }[size];

  return (
    <div
      className={`group relative overflow-hidden shrink-0 select-none shadow-xl transition-all duration-300 ${sizeClasses} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}
    >
      {/* Vinyl gloss & lighting reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/15 rounded-full blur-2xl pointer-events-none" />

      {/* Abstract geometric concentric rings resembling Apple Music dynamic art */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
        <div className="w-3/4 h-3/4 rounded-full border border-white/30" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-white/20" />
        <div className="absolute w-1/4 h-1/4 rounded-full border border-white/25" />
      </div>

      {/* Content typography */}
      {size !== 'xs' && size !== 'sm' && (
        <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col justify-end text-left pointer-events-none drop-shadow-md">
          <p className="font-bold text-white tracking-tight leading-tight line-clamp-2">
            {title}
          </p>
          <p className="text-white/80 font-medium text-[11px] truncate mt-0.5">
            {artist}
          </p>
        </div>
      )}

      {/* Mini size representation */}
      {(size === 'xs' || size === 'sm') && (
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          <Disc className="w-5 h-5 opacity-70" />
        </div>
      )}

      {/* Audio Badge */}
      {badge && size !== 'xs' && size !== 'sm' && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
            {badge === 'lossless' ? 'Lossless' : badge === 'dolby' ? 'Dolby Atmos' : 'Apple Master'}
          </span>
        </div>
      )}

      {/* Playing equalizer indicator */}
      {isCurrent && isPlaying && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-end gap-0.5 h-3.5 px-1.5 py-1 rounded bg-black/60 backdrop-blur-md">
          <span className="w-0.5 bg-[#fa2d48] animate-pulse h-full" />
          <span className="w-0.5 bg-[#fa2d48] animate-pulse h-2/3" style={{ animationDelay: '0.15s' }} />
          <span className="w-0.5 bg-[#fa2d48] animate-pulse h-4/5" style={{ animationDelay: '0.3s' }} />
        </div>
      )}

      {/* Hover Play Button Overlay */}
      {showPlayOnHover && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick?.();
          }}
          className={`absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-[2px] transition-opacity duration-200 cursor-pointer ${
            isCurrent && isPlaying ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
            aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
