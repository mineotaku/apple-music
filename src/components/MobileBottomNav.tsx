import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Compass, 
  Radio, 
  Music, 
  Search, 
  Play, 
  Pause, 
  SkipForward, 
  Download, 
  Smartphone,
  Sparkles
} from 'lucide-react';
import { ActiveNavTab, Song } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface MobileBottomNavProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onOpenNowPlaying: () => void;
  onOpenSearchFocus: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onOpenNowPlaying,
  onOpenSearchFocus,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already installed in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setShowInstallBanner(false);
      return;
    }

    // Android PWA install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("To install on iOS: tap the Share button (square with arrow) at the bottom of Safari, then choose 'Add to Home Screen'.");
    }
  };

  const navItems: { id: ActiveNavTab | 'search'; label: string; icon: React.ReactNode }[] = [
    { id: 'listen-now', label: 'Listen Now', icon: <PlayCircle className="w-5 h-5" /> },
    { id: 'browse', label: 'Browse', icon: <Compass className="w-5 h-5" /> },
    { id: 'radio', label: 'Radio', icon: <Radio className="w-5 h-5" /> },
    { id: 'songs', label: 'Library', icon: <Music className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
  ];

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-auto">
      {/* Optional Install PWA Banner */}
      {showInstallBanner && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-[#252528]/95 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#fa2d48] flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Install Apple Music</p>
              <p className="text-[10px] text-white/50">Free full app for home screen</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 rounded-full bg-[#fa2d48] text-white font-medium text-xs shadow hover:bg-[#fc3c44] active:scale-95 transition-all"
          >
            Install
          </button>
        </div>
      )}

      {/* Floating Apple Music Mini-Player */}
      {currentSong && (
        <div className="mx-3 mb-2 rounded-2xl bg-[#212124]/90 backdrop-blur-2xl border border-white/[0.12] shadow-2xl overflow-hidden transition-all duration-300">
          {/* Progress thin bar */}
          <div className="h-0.5 w-full bg-white/[0.08]">
            <div 
              className="h-full bg-[#fa2d48] transition-all duration-200" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="px-3 py-2 flex items-center justify-between gap-3">
            {/* Clickable song info opening Now Playing modal */}
            <div 
              onClick={onOpenNowPlaying} 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer active:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                <AlbumCoverArt
                  title={currentSong.title}
                  artist={currentSong.artist}
                  gradient={currentSong.coverGradient}
                  size="xs"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">
                    {currentSong.title}
                  </h4>
                  {currentSong.isLossless && (
                    <span className="text-[9px] font-bold px-1 rounded bg-white/[0.1] text-white/70">
                      Lossless
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#a1a1a6] truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Play/Pause & Next controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPause();
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="w-9 h-9 rounded-full bg-transparent active:scale-90 flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <SkipForward className="w-5 h-5 fill-white/70" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Translucent Bottom Tab Bar */}
      <nav className="bg-[#161618]/95 backdrop-blur-3xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around pb-safe">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'search') {
                  onOpenSearchFocus();
                } else {
                  onTabChange(item.id as ActiveNavTab);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive ? 'text-[#fa2d48]' : 'text-[#86868b] hover:text-[#d1d1d6]'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
