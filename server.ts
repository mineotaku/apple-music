import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

// Helper to synthesize a valid WAV file in memory
function generateProceduralWav(bpm: number, rootFreq: number, patternType: string, durationSeconds: number = 30): Buffer {
  const sampleRate = 22050; // 22.05kHz mono for fast compact buffer
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate music wave data
  let offset = 44;
  const beatDuration = 60 / bpm;
  const scale = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2]; // Major scale intervals
  const minorScale = [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5, 2];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const currentBeat = Math.floor(t / beatDuration);
    const beatPhase = (t % beatDuration) / beatDuration;

    let sample = 0;

    if (patternType === 'synthwave') {
      // Arp + bass
      const noteIdx = currentBeat % 4;
      const freq = rootFreq * minorScale[noteIdx % minorScale.length];
      const envelope = Math.exp(-beatPhase * 4);
      const bassFreq = rootFreq * 0.5;
      sample += Math.sin(2 * Math.PI * freq * t) * 0.4 * envelope;
      sample += Math.sin(2 * Math.PI * bassFreq * t) * 0.3;
      sample += Math.sin(2 * Math.PI * (freq * 2) * t) * 0.1 * envelope;
    } else if (patternType === 'lofi') {
      // Warm chords + vinyl crackle
      const chordIdx = Math.floor(currentBeat / 2) % 4;
      const chordFrequencies = [rootFreq, rootFreq * 1.2, rootFreq * 1.5];
      for (const cf of chordFrequencies) {
        sample += Math.sin(2 * Math.PI * cf * t) * 0.15;
      }
      // soft kick on beat
      if (beatPhase < 0.2) {
        sample += Math.sin(2 * Math.PI * 60 * (1 - beatPhase * 5) * t) * 0.3 * Math.exp(-beatPhase * 10);
      }
    } else if (patternType === 'piano') {
      // Gentle acoustic piano harmonics
      const noteIdx = [0, 2, 4, 6, 4, 2][currentBeat % 6];
      const freq = rootFreq * scale[noteIdx];
      const env = Math.exp(-beatPhase * 2.5);
      sample += Math.sin(2 * Math.PI * freq * t) * 0.35 * env;
      sample += Math.sin(2 * Math.PI * freq * 2 * t) * 0.15 * env;
      sample += Math.sin(2 * Math.PI * freq * 3 * t) * 0.05 * env;
    } else {
      // Ambient atmospheric pad
      sample += Math.sin(2 * Math.PI * rootFreq * t) * 0.25;
      sample += Math.sin(2 * Math.PI * (rootFreq * 1.498) * t) * 0.2;
      sample += Math.sin(2 * Math.PI * (rootFreq * 2.002) * t) * 0.1;
    }

    // Clamp to 16-bit signed integer
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

// In-memory data store with Apple Music initial editorial catalogue
export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number; // in seconds
  releaseYear: number;
  genre: string;
  bitrate: string;
  codec: string;
  isLossless: boolean;
  isDolbyAtmos: boolean;
  isAppleDigitalMaster: boolean;
  coverGradient: [string, string];
  plays: number;
  lyrics: { time: number; text: string }[];
  audioBuffer?: Buffer;
}

const initialSongs: Song[] = [
  {
    id: 'song-1',
    title: 'Starfall Over Shibuya',
    artist: 'Kaito Takahashi',
    artistId: 'artist-1',
    album: 'Neon Horizon',
    albumId: 'album-1',
    duration: 194,
    releaseYear: 2026,
    genre: 'Electronic',
    bitrate: '24-bit / 96kHz ALAC',
    codec: 'Apple Lossless',
    isLossless: true,
    isDolbyAtmos: true,
    isAppleDigitalMaster: true,
    coverGradient: ['#3b82f6', '#8b5cf6'],
    plays: 142890,
    lyrics: [
      { time: 0, text: 'Neon lights reflecting in the midnight rain' },
      { time: 6, text: 'Walking through Shibuya crossing once again' },
      { time: 14, text: 'The city breathes in frequencies of electric sound' },
      { time: 22, text: 'Lost within the reverie, feet above the ground' },
      { time: 31, text: 'Catch the starfall as the morning breaks through glass' },
      { time: 42, text: 'Every second glowing like it was made to last' },
      { time: 54, text: 'Endless pulses through the quiet night' },
      { time: 66, text: 'We are floating in the atmosphere of light' },
    ],
    audioBuffer: generateProceduralWav(124, 261.63, 'synthwave', 30),
  },
  {
    id: 'song-2',
    title: 'Golden Hour Reverie',
    artist: 'Elena Rostova',
    artistId: 'artist-2',
    album: 'Sunlight & Cedar',
    albumId: 'album-2',
    duration: 218,
    releaseYear: 2026,
    genre: 'Acoustic / Indie',
    bitrate: '24-bit / 192kHz ALAC',
    codec: 'Hi-Res Lossless',
    isLossless: true,
    isDolbyAtmos: true,
    isAppleDigitalMaster: true,
    coverGradient: ['#f59e0b', '#ef4444'],
    plays: 98450,
    lyrics: [
      { time: 0, text: 'Sunlight filtering through the cedar trees' },
      { time: 8, text: 'Carrying the warmth upon an ocean breeze' },
      { time: 16, text: 'Strings vibrate with memories of home' },
      { time: 25, text: 'Through the mountain passes where we used to roam' },
      { time: 35, text: 'Golden hour painting amber in your eyes' },
      { time: 46, text: 'No words needed under open skies' },
      { time: 58, text: 'Let the quiet linger till the stars awaken' },
    ],
    audioBuffer: generateProceduralWav(92, 220.00, 'piano', 30),
  },
  {
    id: 'song-3',
    title: 'Midnight Velvet',
    artist: 'Marcus Vance & The Low-Fi Society',
    artistId: 'artist-3',
    album: 'City Lights After Dark',
    albumId: 'album-3',
    duration: 184,
    releaseYear: 2026,
    genre: 'R&B / Soul',
    bitrate: '24-bit / 48kHz ALAC',
    codec: 'Spatial Audio with Dolby Atmos',
    isLossless: true,
    isDolbyAtmos: true,
    isAppleDigitalMaster: true,
    coverGradient: ['#8b5cf6', '#ec4899'],
    plays: 231100,
    lyrics: [
      { time: 0, text: 'Smooth Rhodes chords fading into the fog' },
      { time: 7, text: 'Late night conversation on a rooftop balcony' },
      { time: 15, text: 'Sipping coffee while the bassline slides along' },
      { time: 24, text: 'Everything feels easier when you hear this song' },
      { time: 34, text: 'Velvet shadows moving in slow motion' },
      { time: 44, text: 'Deeper than the calmest midnight ocean' },
    ],
    audioBuffer: generateProceduralWav(84, 174.61, 'lofi', 30),
  },
  {
    id: 'song-4',
    title: 'Clair de Lune (Spatial Piano Rework)',
    artist: 'Julian C. Mercier',
    artistId: 'artist-4',
    album: 'Modern Impressions',
    albumId: 'album-4',
    duration: 260,
    releaseYear: 2025,
    genre: 'Classical',
    bitrate: '24-bit / 192kHz ALAC',
    codec: 'Hi-Res Lossless',
    isLossless: true,
    isDolbyAtmos: true,
    isAppleDigitalMaster: true,
    coverGradient: ['#06b6d4', '#3b82f6'],
    plays: 76540,
    lyrics: [
      { time: 0, text: '[Instrumental intro - Gentle arpeggios]' },
      { time: 20, text: '[Theme enters with delicate rubato]' },
      { time: 45, text: '[Harmonic shift into warm D-flat major]' },
      { time: 75, text: '[Crescendo with cascading spatial resonance]' },
    ],
    audioBuffer: generateProceduralWav(72, 138.59, 'piano', 30),
  },
  {
    id: 'song-5',
    title: 'Aura Borealis',
    artist: 'Kaito Takahashi',
    artistId: 'artist-1',
    album: 'Neon Horizon',
    albumId: 'album-1',
    duration: 205,
    releaseYear: 2026,
    genre: 'Ambient / Synthwave',
    bitrate: '24-bit / 96kHz ALAC',
    codec: 'Apple Lossless',
    isLossless: true,
    isDolbyAtmos: true,
    isAppleDigitalMaster: true,
    coverGradient: ['#10b981', '#06b6d4'],
    plays: 87120,
    lyrics: [
      { time: 0, text: 'Green shimmer dancing on arctic snow' },
      { time: 9, text: 'Sub-bass rumbling gentle and slow' },
      { time: 18, text: 'Magnetic field in harmonic flow' },
      { time: 28, text: 'Higher than the satellite signals go' },
    ],
    audioBuffer: generateProceduralWav(110, 196.00, 'ambient', 30),
  },
  {
    id: 'song-6',
    title: 'Solstice Drive',
    artist: 'Marcus Vance & The Low-Fi Society',
    artistId: 'artist-3',
    album: 'City Lights After Dark',
    albumId: 'album-3',
    duration: 172,
    releaseYear: 2026,
    genre: 'R&B / Soul',
    bitrate: '24-bit / 48kHz ALAC',
    codec: 'Lossless',
    isLossless: true,
    isDolbyAtmos: false,
    isAppleDigitalMaster: true,
    coverGradient: ['#f43f5e', '#fb923c'],
    plays: 112400,
    lyrics: [
      { time: 0, text: 'Windows down along the coastal highway' },
      { time: 8, text: 'Sunset orange fading to indigo blue' },
      { time: 18, text: 'Cruising through the longest day of summer' },
      { time: 30, text: 'Nothing on my mind except the view of you' },
    ],
    audioBuffer: generateProceduralWav(96, 246.94, 'lofi', 30),
  }
];

let songsDatabase = [...initialSongs];
let favoritesSet = new Set<string>(['song-1', 'song-3']);
let playHistory: { songId: string; playedAt: string }[] = [
  { songId: 'song-1', playedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { songId: 'song-3', playedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { songId: 'song-2', playedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
];

let userPlaylists = [
  {
    id: 'playlist-1',
    name: 'Heavy Rotation',
    description: 'The tracks you have on constant replay right now.',
    curator: 'Apple Music Editorial',
    gradient: ['#fa2d48', '#ff7a00'] as [string, string],
    songIds: ['song-1', 'song-3', 'song-2', 'song-5'],
  },
  {
    id: 'playlist-2',
    name: 'Spatial Audio: Pure Focus',
    description: 'Immersive soundscapes engineered for deep concentration and flow state.',
    curator: 'Apple Music Spatial Audio',
    gradient: ['#3b82f6', '#10b981'] as [string, string],
    songIds: ['song-4', 'song-5', 'song-1'],
  },
  {
    id: 'playlist-3',
    name: 'Late Night Chill',
    description: 'Downtempo soul, mellow beats, and warm nocturnal analog warmth.',
    curator: 'Curated by You',
    gradient: ['#8b5cf6', '#ec4899'] as [string, string],
    songIds: ['song-3', 'song-6', 'song-2'],
  }
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // API Endpoints

  // 1. List songs
  app.get('/api/songs', (req: Request, res: Response) => {
    const list = songsDatabase.map(({ audioBuffer, ...rest }) => rest);
    res.json(list);
  });

  // 2. Single song
  app.get('/api/songs/:id', (req: Request, res: Response) => {
    const song = songsDatabase.find(s => s.id === req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    const { audioBuffer, ...rest } = song;
    res.json(rest);
  });

  // 3. HTTP Range Streaming endpoint (Section 6 & 10 of detailed plan)
  app.get('/api/songs/:id/stream', (req: Request, res: Response) => {
    const song = songsDatabase.find(s => s.id === req.params.id);
    if (!song || !song.audioBuffer) {
      return res.status(404).json({ error: 'Audio track not found' });
    }

    const audio = song.audioBuffer;
    const totalLength = audio.length;
    const range = req.headers.range;

    if (!range) {
      // Stream complete content if no range requested
      res.writeHead(200, {
        'Content-Length': totalLength,
        'Content-Type': 'audio/wav',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });
      res.end(audio);
      return;
    }

    // Parse Range header e.g. "bytes=0-102400"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 512 * 1024 - 1, totalLength - 1);

    if (start >= totalLength || end >= totalLength || start > end) {
      res.status(416).set({
        'Content-Range': `bytes */${totalLength}`
      }).send('Requested range not satisfiable');
      return;
    }

    const chunkSize = end - start + 1;
    const chunk = audio.subarray(start, end + 1);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${totalLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/wav',
      'Cache-Control': 'no-cache',
    });
    res.end(chunk);
  });

  // 4. Upload / Create song (Admin pipeline)
  app.post('/api/songs', (req: Request, res: Response) => {
    const { title, artist, album, genre, duration, audioBase64, isLossless, isDolbyAtmos, lyrics } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    let buffer: Buffer;
    if (audioBase64) {
      try {
        const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        buffer = generateProceduralWav(115, 220, 'synthwave', 30);
      }
    } else {
      buffer = generateProceduralWav(115, 220, 'synthwave', 30);
    }

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title,
      artist,
      artistId: `artist-${artist.toLowerCase().replace(/\s+/g, '-')}`,
      album: album || 'Singles',
      albumId: `album-${(album || 'singles').toLowerCase().replace(/\s+/g, '-')}`,
      duration: Number(duration) || 180,
      releaseYear: new Date().getFullYear(),
      genre: genre || 'Electronic',
      bitrate: '24-bit / 96kHz ALAC',
      codec: isLossless ? 'Apple Lossless' : 'AAC 256kbps',
      isLossless: isLossless !== false,
      isDolbyAtmos: isDolbyAtmos || false,
      isAppleDigitalMaster: true,
      coverGradient: ['#fa2d48', '#8b5cf6'],
      plays: 1,
      lyrics: lyrics || [
        { time: 0, text: `Listening to ${title} by ${artist}` },
        { time: 10, text: 'Lossless audio streaming on Apple Music engine' }
      ],
      audioBuffer: buffer,
    };

    songsDatabase.unshift(newSong);
    const { audioBuffer: _, ...cleanSong } = newSong;
    res.status(201).json(cleanSong);
  });

  // 5. Delete song
  app.delete('/api/songs/:id', (req: Request, res: Response) => {
    const index = songsDatabase.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Song not found' });
    songsDatabase.splice(index, 1);
    res.json({ success: true, message: 'Song deleted from storage and catalog' });
  });

  // 6. Search
  app.get('/api/search', (req: Request, res: Response) => {
    const query = String(req.query.q || '').toLowerCase().trim();
    if (!query) {
      return res.json({ songs: [], artists: [], albums: [], playlists: [] });
    }

    const matchedSongs = songsDatabase
      .filter(s => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query) || s.album.toLowerCase().includes(query))
      .map(({ audioBuffer, ...rest }) => rest);

    const artistNames = Array.from(new Set(songsDatabase.map(s => s.artist)));
    const matchedArtists = artistNames
      .filter(a => a.toLowerCase().includes(query))
      .map(name => ({
        name,
        songCount: songsDatabase.filter(s => s.artist === name).length,
      }));

    const albumNames = Array.from(new Set(songsDatabase.map(s => s.album)));
    const matchedAlbums = albumNames
      .filter(a => a.toLowerCase().includes(query))
      .map(title => {
        const sample = songsDatabase.find(s => s.album === title);
        return {
          title,
          artist: sample?.artist || 'Various Artists',
          releaseYear: sample?.releaseYear || 2026,
          coverGradient: sample?.coverGradient || ['#fa2d48', '#8b5cf6'],
        };
      });

    const matchedPlaylists = userPlaylists.filter(p => p.name.toLowerCase().includes(query));

    res.json({
      songs: matchedSongs,
      artists: matchedArtists,
      albums: matchedAlbums,
      playlists: matchedPlaylists,
    });
  });

  // 7. Playlists
  app.get('/api/playlists', (req: Request, res: Response) => {
    res.json(userPlaylists);
  });

  app.post('/api/playlists', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Playlist name is required' });
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name,
      description: description || 'Curated user collection',
      curator: 'You',
      gradient: ['#fa2d48', '#ec4899'] as [string, string],
      songIds: [],
    };
    userPlaylists.push(newPlaylist);
    res.status(201).json(newPlaylist);
  });

  app.post('/api/playlists/:id/songs', (req: Request, res: Response) => {
    const playlist = userPlaylists.find(p => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    const { songId } = req.body;
    if (!songId || !songsDatabase.some(s => s.id === songId)) {
      return res.status(400).json({ error: 'Valid songId required' });
    }
    if (!playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
    }
    res.json(playlist);
  });

  app.delete('/api/playlists/:id/songs/:songId', (req: Request, res: Response) => {
    const playlist = userPlaylists.find(p => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    playlist.songIds = playlist.songIds.filter(id => id !== req.params.songId);
    res.json(playlist);
  });

  // 8. Favorites
  app.get('/api/favorites', (req: Request, res: Response) => {
    res.json(Array.from(favoritesSet));
  });

  app.post('/api/songs/:id/favorite', (req: Request, res: Response) => {
    const id = req.params.id;
    if (favoritesSet.has(id)) {
      favoritesSet.delete(id);
      res.json({ isFavorite: false, songId: id });
    } else {
      favoritesSet.add(id);
      res.json({ isFavorite: true, songId: id });
    }
  });

  // 9. History / Recently Played
  app.get('/api/history', (req: Request, res: Response) => {
    res.json(playHistory);
  });

  app.post('/api/history', (req: Request, res: Response) => {
    const { songId } = req.body;
    const song = songsDatabase.find(s => s.id === songId);
    if (song) {
      song.plays += 1;
      playHistory.unshift({ songId, playedAt: new Date().toISOString() });
      if (playHistory.length > 50) playHistory.pop();
    }
    res.json({ success: true });
  });

  // 10. Admin stats (Plan Section 17)
  app.get('/api/admin/stats', (req: Request, res: Response) => {
    const totalBytes = songsDatabase.reduce((acc, s) => acc + (s.audioBuffer?.length || 0), 0);
    const artists = new Set(songsDatabase.map(s => s.artist)).size;
    const albums = new Set(songsDatabase.map(s => s.album)).size;
    const totalPlays = songsDatabase.reduce((acc, s) => acc + s.plays, 0);

    res.json({
      songsCount: songsDatabase.length,
      artistsCount: artists,
      albumsCount: albums,
      usersCount: 1420,
      totalStorageBytes: totalBytes,
      formattedStorage: `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`,
      totalPlays,
      bandwidthSavedEstimate: `${((totalPlays * 4.8) / 1024).toFixed(2)} GB (via Range 206 Caching)`,
    });
  });

  // 11. Auth simulation
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({
      id: 'usr_apple_id_882',
      username: 'Alex Mercer',
      email: 'alex.mercer@icloud.com',
      tier: 'Apple Music Family (Hi-Res Lossless)',
      isAdmin: true,
      avatarColor: '#fa2d48',
    });
  });

  // Vite middleware in dev or static server in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Apple Music Streaming & Studio Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
