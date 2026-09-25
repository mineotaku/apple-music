import React from 'react';
import { 
  PlayCircle, 
  Compass, 
  Radio, 
  Clock, 
  Users, 
  Disc3, 
  Music, 
  Heart, 
  Plus, 
  Search, 
  SlidersHorizontal,
  CloudUpload,
  Sparkles
} from 'lucide-react';
import { ActiveNavTab, Playlist } from '../types/music';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSearchFocus: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  onCreatePlaylist,
  searchQuery,
  onSearchChange,
  onOpenSearchFocus,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col bg-[#161618]/95 backdrop-blur-2xl border-r border-white/[0.08] select-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* macOS Traffic Lights & Apple Music Logo */}
        <div className="pt-4 px-5 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/40 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/40 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/40 inline-block shadow-sm" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#fa2d48] to-[#ff5b79] flex items-center justify-center shadow-lg shadow-[#fa2d48]/25">
              <Music className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-white tracking-tight text-base">Music</span>
              <span className="text-[10px] uppercase font-bold text-[#fa2d48] tracking-widest">Lossless</span>
            </div>
          </div>
        </div>

        {/* Apple Music Search Bar */}
        <div className="px-4 py-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#86868b] pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onOpenSearchFocus}
              className="w-full h-8 pl-9 pr-9 bg-[#262629]/90 hover:bg-[#2c2c30] focus:bg-[#2c2c30] text-[13px] text-white placeholder-[#86868b] rounded-lg border border-white/[0.06] focus:border-white/20 focus:outline-none transition-colors"
            />
            <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-[#86868b] bg-white/[0.06] rounded border border-white/[0.08]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-[13px] scrollbar-thin scrollbar-thumb-white/10">
          {/* Apple Music Editorial Section */}
          <div>
            <p className="px-3 pb-1 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Apple Music
            </p>
            <nav className="space-y-0.5">
              <button
                onClick={() => { onTabChange('listen-now'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'listen-now'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <PlayCircle className="w-4 h-4 shrink-0" />
                <span>Listen Now</span>
              </button>

              <button
                onClick={() => { onTabChange('browse'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'browse'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Browse</span>
              </button>

              <button
                onClick={() => { onTabChange('radio'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'radio'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Radio className="w-4 h-4 shrink-0" />
                <span>Radio</span>
              </button>
            </nav>
          </div>

          {/* Library Section */}
          <div>
            <p className="px-3 pb-1 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Library
            </p>
            <nav className="space-y-0.5">
              <button
                onClick={() => { onTabChange('recently-added'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'recently-added'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Recently Added</span>
              </button>

              <button
                onClick={() => { onTabChange('artists'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'artists'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Artists</span>
              </button>

              <button
                onClick={() => { onTabChange('albums'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'albums'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Disc3 className="w-4 h-4 shrink-0" />
                <span>Albums</span>
              </button>

              <button
                onClick={() => { onTabChange('songs'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'songs'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Music className="w-4 h-4 shrink-0" />
                <span>Songs</span>
              </button>

              <button
                onClick={() => { onTabChange('favorites'); onCloseMobile(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                  activeTab === 'favorites'
                    ? 'bg-[#fa2d48] text-white shadow-sm'
                    : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0 text-[#fa2d48]" />
                <span>Favorite Songs</span>
              </button>
            </nav>
          </div>

          {/* Playlists Section */}
          <div>
            <div className="flex items-center justify-between px-3 pb-1">
              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                Playlists
              </p>
              <button
                onClick={onCreatePlaylist}
                title="New Playlist"
                className="text-[#86868b] hover:text-[#fa2d48] p-0.5 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {playlists.map((playlist) => {
                const isSelected = activeTab === 'playlist-detail' && selectedPlaylistId === playlist.id;
                return (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      onSelectPlaylist(playlist.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left truncate ${
                      isSelected
                        ? 'bg-[#fa2d48] text-white shadow-sm'
                        : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${playlist.gradient[0]}, ${playlist.gradient[1]})` }}
                    />
                    <span className="truncate">{playlist.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Studio Section (Detailed Plan Section 5 & 17) */}
          <div className="pt-2 border-t border-white/[0.06]">
            <p className="px-3 pb-1 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Music Studio & Storage
            </p>
            <button
              onClick={() => { onTabChange('admin-studio'); onCloseMobile(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md font-medium transition-colors text-left ${
                activeTab === 'admin-studio'
                  ? 'bg-[#fa2d48] text-white shadow-sm'
                  : 'text-[#d1d1d6] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <CloudUpload className="w-4 h-4 shrink-0 text-[#3b82f6]" />
              <div className="flex flex-col">
                <span className="leading-tight">Upload & Stream Engine</span>
                <span className="text-[10px] text-[#86868b] leading-tight">Admin & Range 206</span>
              </div>
            </button>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#121214]">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/[0.04]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#fa2d48] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-white shadow">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">Alex Mercer</p>
              <p className="text-[10px] text-[#86868b] truncate leading-tight">Apple ID · Lossless</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
