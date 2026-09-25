import React, { useState } from 'react';
import { X, Play, Trash2, Clock, ListMusic, Music, Sparkles } from 'lucide-react';
import { Song } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayQueueIndex: (index: number) => void;
  onClearQueue: () => void;
  onRemoveFromQueue: (index: number) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  currentIndex,
  currentSong,
  isPlaying,
  onPlayQueueIndex,
  onClearQueue,
  onRemoveFromQueue,
}) => {
  const [tab, setTab] = useState<'queue' | 'history'>('queue');

  if (!isOpen) return null;

  const upNextList = queue.slice(currentIndex + 1);
  const historyList = queue.slice(0, currentIndex).reverse();

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <div className="fixed top-16 bottom-0 right-0 z-50 w-80 sm:w-96 bg-[#1a1a1d]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl flex flex-col select-none animate-slideLeft">
        {/* Header with Segmented Control */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-white/[0.06] rounded-lg">
            <button
              onClick={() => setTab('queue')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                tab === 'queue' ? 'bg-[#fa2d48] text-white shadow-sm' : 'text-[#86868b] hover:text-white'
              }`}
            >
              Playing Next
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                tab === 'history' ? 'bg-[#fa2d48] text-white shadow-sm' : 'text-[#86868b] hover:text-white'
              }`}
            >
              History
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#86868b] hover:text-white hover:bg-white/[0.08]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {tab === 'queue' ? (
            <>
              {/* Currently Playing Card */}
              {currentSong && (
                <div>
                  <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-2">
                    Now Playing
                  </p>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06]">
                    <AlbumCoverArt
                      size="sm"
                      gradient={currentSong.coverGradient}
                      isPlaying={isPlaying}
                      isCurrent={true}
                      showPlayOnHover={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#fa2d48] truncate">
                        {currentSong.title}
                      </p>
                      <p className="text-[11px] text-[#86868b] truncate">
                        {currentSong.artist}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Up Next List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                    Next In Queue ({upNextList.length})
                  </p>
                  {upNextList.length > 0 && (
                    <button
                      onClick={onClearQueue}
                      className="text-[11px] text-[#fa2d48] hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {upNextList.length === 0 ? (
                  <p className="text-xs text-[#86868b] py-6 text-center">
                    Queue is empty. Select songs to queue up next.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {upNextList.map((song, idx) => {
                      const actualIdx = currentIndex + 1 + idx;
                      return (
                        <div
                          key={`${song.id}-${actualIdx}`}
                          className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                          <div
                            onClick={() => onPlayQueueIndex(actualIdx)}
                            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                          >
                            <AlbumCoverArt
                              size="xs"
                              gradient={song.coverGradient}
                              showPlayOnHover={false}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate group-hover:text-[#fa2d48] transition-colors">
                                {song.title}
                              </p>
                              <p className="text-[10px] text-[#86868b] truncate">
                                {song.artist}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveFromQueue(actualIdx)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#86868b] hover:text-red-400"
                            title="Remove from Queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* History Tab */
            <div>
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-2">
                Previously Played ({historyList.length})
              </p>

              {historyList.length === 0 ? (
                <p className="text-xs text-[#86868b] py-6 text-center">
                  No playback history recorded in this session.
                </p>
              ) : (
                <div className="space-y-1">
                  {historyList.map((song, idx) => {
                    const originalIndex = currentIndex - 1 - idx;
                    return (
                      <div
                        key={`${song.id}-hist-${idx}`}
                        onClick={() => onPlayQueueIndex(originalIndex)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors"
                      >
                        <AlbumCoverArt
                          size="xs"
                          gradient={song.coverGradient}
                          showPlayOnHover={false}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-[#86868b] truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
