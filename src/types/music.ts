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
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  curator: string;
  gradient: [string, string];
  songIds: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  releaseYear: number;
  genre: string;
  coverGradient: [string, string];
  songIds: string[];
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  listeners: string;
  gradient: [string, string];
  albums: string[];
}

export interface RadioStation {
  id: string;
  name: string;
  tagline: string;
  currentShow: string;
  host: string;
  accent: string;
  gradient: [string, string];
  frequency: string;
}

export type ActiveNavTab = 
  | 'listen-now'
  | 'browse'
  | 'radio'
  | 'recently-added'
  | 'artists'
  | 'albums'
  | 'songs'
  | 'favorites'
  | 'playlist-detail'
  | 'admin-studio';
