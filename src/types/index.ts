export type TimeSignature = {
  numerator: number;
  denominator: number;
};

export type Subdivision = 1 | 2 | 3 | 4; // 1 = Quarter, 2 = 8th, 3 = Triplet, 4 = 16th

export type SoundType = 'digital' | 'woodblock' | 'classic' | 'rimshot' | 'beep';

export interface Song {
  id: string;
  title: string;
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  soundType: SoundType;
  accentFirstBeat: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSong: Song | null;
  currentPlaylist: Playlist | null;
  currentSongIndex: number;
  currentBeat: number; // 0-indexed within current bar
  totalBeatsInBar: number;
  isAccent: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'stage';
  volume: number; // 0.0 - 1.0
  flashVisuals: boolean;
  keepScreenAwake: boolean;
  autoAdvance: boolean;
}

export type AppView = 'home' | 'songs' | 'playlists' | 'performance' | 'settings';
