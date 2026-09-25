import React, { useState } from 'react';
import { Play, Disc3, Clock, ArrowLeft } from 'lucide-react';
import { Song, Album } from '../types/music';
import { AlbumCoverArt } from './AlbumCoverArt';

interface AlbumsViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Group songs into albums
  const albumMap = new Map<string, { title: string; artist: string; releaseYear: number; genre: string; songs: Song[]; gradient: [string, string] }>();

  songs.forEach((song) => {
    if (!albumMap.has(song.album)) {
      albumMap.set(song.album, {
        title: song.album,
        artist: song.artist,
        releaseYear: song.releaseYear,
        genre: song.genre,
        songs: [],
        gradient: song.coverGradient,
      });
    }
    albumMap.get(song.album)!.songs.push(song);
  });

  const albums = Array.from(albumMap.values());
  const currentSelectedAlbum = selectedAlbum ? albumMap.get(selectedAlbum) : null;

  return (
    <div className="space-y-6 pb-16">
      {/* If an album is selected, show Album Details */}
      {currentSelectedAlbum ? (
        <div className="space-y-8 animate-fadeIn">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="inline-flex items-center gap-1.5 text-xs text-[#fa2d48] font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Albums</span>
          </button>

          {/* Album Hero Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-white/[0.08]">
            <AlbumCoverArt
              size="lg"
              title={currentSelectedAlbum.title}
              artist={currentSelectedAlbum.artist}
              gradient={currentSelectedAlbum.gradient}
              onPlayClick={() => currentSelectedAlbum.songs[0] && onPlaySong(currentSelectedAlbum.songs[0])}
            />

            <div className="space-y-2 text-center sm:text-left min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#fa2d48]">
                Album · {currentSelectedAlbum.genre}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {currentSelectedAlbum.title}
              </h1>
              <p className="text-lg text-white font-medium">
                {currentSelectedAlbum.artist}
              </p>
              <p className="text-xs text-[#86868b]">
                Released {currentSelectedAlbum.releaseYear} · {currentSelectedAlbum.songs.length} Songs ·{' '}
                {Math.round(currentSelectedAlbum.songs.reduce((acc, s) => acc + s.duration, 0) / 60)} minutes
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                <button
                  onClick={() => currentSelectedAlbum.songs[0] && onPlaySong(currentSelectedAlbum.songs[0])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#fc3c44] text-white font-semibold text-xs shadow-lg active:scale-95 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play</span>
                </button>
              </div>
            </div>
          </div>

          {/* Album Tracklist */}
          <div className="space-y-1">
            {currentSelectedAlbum.songs.map((song, idx) => {
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
                    <span className="w-5 text-right font-mono text-xs text-[#86868b]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#fa2d48]' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-[11px] text-[#86868b] truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase font-bold text-[#86868b] px-1.5 py-0.5 rounded bg-white/[0.06]">
                      Lossless
                    </span>
                    <span className="font-mono text-xs text-[#86868b]">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Albums Grid */
        <>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Albums</h1>
            <p className="text-xs text-[#86868b] mt-0.5">{albums.length} albums in your master library</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {albums.map((album) => (
              <div
                key={album.title}
                onClick={() => setSelectedAlbum(album.title)}
                className="group cursor-pointer flex flex-col p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all"
              >
                <AlbumCoverArt
                  size="md"
                  className="w-full aspect-square"
                  title={album.title}
                  artist={album.artist}
                  gradient={album.gradient}
                  onPlayClick={() => album.songs[0] && onPlaySong(album.songs[0])}
                />
                <div className="mt-2.5 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-[#fa2d48] transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-[11px] text-[#86868b] truncate mt-0.5">
                    {album.artist}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {album.releaseYear} · {album.songs.length} Tracks
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
