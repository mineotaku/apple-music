import React, { useState } from 'react';
import { Play, Users, ArrowLeft } from 'lucide-react';
import { Song } from '../types/music';

interface ArtistsViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
}) => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Group songs by artist
  const artistMap = new Map<string, { name: string; songs: Song[]; genre: string; gradient: [string, string] }>();

  songs.forEach((song) => {
    if (!artistMap.has(song.artist)) {
      artistMap.set(song.artist, {
        name: song.artist,
        songs: [],
        genre: song.genre,
        gradient: song.coverGradient,
      });
    }
    artistMap.get(song.artist)!.songs.push(song);
  });

  const artists = Array.from(artistMap.values());
  const currentSelectedArtist = selectedArtist ? artistMap.get(selectedArtist) : null;

  return (
    <div className="space-y-6 pb-16">
      {currentSelectedArtist ? (
        <div className="space-y-8 animate-fadeIn">
          <button
            onClick={() => setSelectedArtist(null)}
            className="inline-flex items-center gap-1.5 text-xs text-[#fa2d48] font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Artists</span>
          </button>

          {/* Artist Hero */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-[#18181b] border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-2xl">
            <div
              className="w-40 h-40 rounded-full shadow-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 border-4 border-white/10"
              style={{
                background: `linear-gradient(135deg, ${currentSelectedArtist.gradient[0]}, ${currentSelectedArtist.gradient[1]})`,
              }}
            >
              {currentSelectedArtist.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-2 text-center sm:text-left min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#fa2d48]">
                Verified Artist · {currentSelectedArtist.genre}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {currentSelectedArtist.name}
              </h1>
              <p className="text-xs text-[#86868b]">
                {currentSelectedArtist.songs.length} Releases · Spatial Audio Ready
              </p>
              <div className="pt-2">
                <button
                  onClick={() => currentSelectedArtist.songs[0] && onPlaySong(currentSelectedArtist.songs[0])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#fc3c44] text-white font-semibold text-xs shadow-lg active:scale-95 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Top Tracks</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Songs */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">Top Tracks</h2>
            <div className="space-y-1">
              {currentSelectedArtist.songs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => onPlaySong(song)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/[0.05] transition-colors ${
                      isCurrent ? 'bg-white/[0.06] text-[#fa2d48]' : 'text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-5 text-right font-mono text-xs text-[#86868b]">{idx + 1}</span>
                      <div>
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#fa2d48]' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[11px] text-[#86868b] truncate">{song.album}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#86868b]">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Artists</h1>
            <p className="text-xs text-[#86868b] mt-0.5">{artists.length} artists in your library</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {artists.map((artist) => (
              <div
                key={artist.name}
                onClick={() => setSelectedArtist(artist.name)}
                className="group cursor-pointer flex flex-col items-center text-center p-3 rounded-2xl hover:bg-white/[0.04] transition-all"
              >
                <div
                  className="w-32 h-32 rounded-full shadow-xl flex items-center justify-center text-2xl font-bold text-white group-hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${artist.gradient[0]}, ${artist.gradient[1]})`,
                  }}
                >
                  {artist.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="mt-3 min-w-0 w-full">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#fa2d48] transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    {artist.songs.length} {artist.songs.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
