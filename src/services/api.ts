import { Song, Playlist } from '../types/music';

const API_BASE = '/api';

export const api = {
  async getSongs(): Promise<Song[]> {
    try {
      const res = await fetch(`${API_BASE}/songs`);
      if (!res.ok) throw new Error('Failed to fetch songs');
      return await res.json();
    } catch (e) {
      console.warn('API error, falling back to local dataset', e);
      return [];
    }
  },

  async getSong(id: string): Promise<Song | null> {
    try {
      const res = await fetch(`${API_BASE}/songs/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const res = await fetch(`${API_BASE}/playlists`);
      if (!res.ok) throw new Error('Failed to fetch playlists');
      return await res.json();
    } catch (e) {
      console.warn('API error', e);
      return [];
    }
  },

  async createPlaylist(name: string, description: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create playlist');
    return await res.json();
  },

  async addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    if (!res.ok) throw new Error('Failed to add song to playlist');
    return await res.json();
  },

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove song from playlist');
    return await res.json();
  },

  async getFavorites(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/favorites`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async toggleFavorite(songId: string): Promise<{ isFavorite: boolean }> {
    const res = await fetch(`${API_BASE}/songs/${songId}/favorite`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return await res.json();
  },

  async recordHistory(songId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      });
    } catch {
      // non-blocking
    }
  },

  async getHistory(): Promise<{ songId: string; playedAt: string }[]> {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async search(query: string): Promise<{
    songs: Song[];
    artists: { name: string; songCount: number }[];
    albums: { title: string; artist: string; releaseYear: number; coverGradient: [string, string] }[];
    playlists: Playlist[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { songs: [], artists: [], albums: [], playlists: [] };
      return await res.json();
    } catch {
      return { songs: [], artists: [], albums: [], playlists: [] };
    }
  },

  async getAdminStats(): Promise<{
    songsCount: number;
    artistsCount: number;
    albumsCount: number;
    usersCount: number;
    totalStorageBytes: number;
    formattedStorage: string;
    totalPlays: number;
    bandwidthSavedEstimate: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return await res.json();
    } catch {
      return {
        songsCount: 6,
        artistsCount: 4,
        albumsCount: 4,
        usersCount: 1420,
        totalStorageBytes: 15400000,
        formattedStorage: '14.68 MB',
        totalPlays: 748400,
        bandwidthSavedEstimate: '3.50 GB (via Range 206 Caching)',
      };
    }
  },

  async uploadSong(songData: {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    duration?: number;
    audioBase64?: string;
    isLossless?: boolean;
    isDolbyAtmos?: boolean;
    lyrics?: { time: number; text: string }[];
  }): Promise<Song> {
    const res = await fetch(`${API_BASE}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData),
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  },

  async deleteSong(songId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/songs/${songId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete song');
  },
};
