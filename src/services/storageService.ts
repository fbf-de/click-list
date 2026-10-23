import type { Song, Playlist, AppSettings } from '../types/index.ts';

const STORAGE_KEYS = {
  SONGS: 'clicklist_songs_v1',
  PLAYLISTS: 'clicklist_playlists_v1',
  SETTINGS: 'clicklist_settings_v1',
  RECENT_SONG_IDS: 'clicklist_recent_songs_v1',
  RECENT_PLAYLIST_IDS: 'clicklist_recent_playlists_v1'
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'stage',
  volume: 0.85,
  flashVisuals: true,
  keepScreenAwake: true,
  autoAdvance: false
};

export const INITIAL_DEMO_SONGS: Song[] = [
  {
    id: 'demo-song-1',
    title: 'Billie Jean',
    bpm: 117,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: 1,
    soundType: 'digital',
    accentFirstBeat: true,
    notes: 'Straight 4/4 groove, tight hi-hat',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'demo-song-2',
    title: 'Back in Black',
    bpm: 94,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: 1,
    soundType: 'woodblock',
    accentFirstBeat: true,
    notes: 'Heavy pocket beat, AC/DC feel',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4
  },
  {
    id: 'demo-song-3',
    title: 'Take Five',
    bpm: 174,
    timeSignature: { numerator: 5, denominator: 4 },
    subdivision: 1,
    soundType: 'classic',
    accentFirstBeat: true,
    notes: 'Dave Brubeck classic 5/4 jazz pulse (3+2)',
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3
  },
  {
    id: 'demo-song-4',
    title: 'Nothing Else Matters',
    bpm: 142,
    timeSignature: { numerator: 6, denominator: 8 },
    subdivision: 1,
    soundType: 'rimshot',
    accentFirstBeat: true,
    notes: '6/8 ballad tempo with accent on beat 1 & 4',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'demo-song-5',
    title: 'Superstition',
    bpm: 100,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: 2,
    soundType: 'digital',
    accentFirstBeat: true,
    notes: 'Stevie Wonder funk groove with 8th note subdivisions',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  }
];

export const INITIAL_DEMO_PLAYLISTS: Playlist[] = [
  {
    id: 'demo-playlist-1',
    name: 'Weekend Headline Set',
    description: 'Main setlist for Friday night club show',
    songIds: ['demo-song-1', 'demo-song-2', 'demo-song-4', 'demo-song-5'],
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'demo-playlist-2',
    name: 'Acoustic Rehearsal',
    description: 'Mid-tempo tracks for acoustic arrangement',
    songIds: ['demo-song-4', 'demo-song-1'],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  }
];

export class StorageService {
  public static getSongs(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SONGS);
      if (!data) {
        // Initialize with default demo songs on first visit
        this.saveSongs(INITIAL_DEMO_SONGS);
        return INITIAL_DEMO_SONGS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read songs from localStorage', e);
      return INITIAL_DEMO_SONGS;
    }
  }

  public static saveSongs(songs: Song[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    } catch (e) {
      console.error('Failed to save songs to localStorage', e);
    }
  }

  public static getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (!data) {
        this.savePlaylists(INITIAL_DEMO_PLAYLISTS);
        return INITIAL_DEMO_PLAYLISTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read playlists from localStorage', e);
      return INITIAL_DEMO_PLAYLISTS;
    }
  }

  public static savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists to localStorage', e);
    }
  }

  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }

  public static getRecentSongIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_SONG_IDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static addRecentSongId(id: string): void {
    try {
      const recents = this.getRecentSongIds().filter((r) => r !== id);
      recents.unshift(id);
      localStorage.setItem(STORAGE_KEYS.RECENT_SONG_IDS, JSON.stringify(recents.slice(0, 10)));
    } catch (e) {
      console.error(e);
    }
  }

  public static getRecentPlaylistIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_PLAYLIST_IDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static addRecentPlaylistId(id: string): void {
    try {
      const recents = this.getRecentPlaylistIds().filter((r) => r !== id);
      recents.unshift(id);
      localStorage.setItem(STORAGE_KEYS.RECENT_PLAYLIST_IDS, JSON.stringify(recents.slice(0, 10)));
    } catch (e) {
      console.error(e);
    }
  }

  public static exportData(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      songs: this.getSongs(),
      playlists: this.getPlaylists(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.songs) && Array.isArray(parsed.playlists)) {
        this.saveSongs(parsed.songs);
        this.savePlaylists(parsed.playlists);
        if (parsed.settings) {
          this.saveSettings(parsed.settings);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid backup format', e);
      return false;
    }
  }

  public static resetToDemo(): void {
    this.saveSongs(INITIAL_DEMO_SONGS);
    this.savePlaylists(INITIAL_DEMO_PLAYLISTS);
    this.saveSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_SONG_IDS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_PLAYLIST_IDS);
  }

  public static clearAll(): void {
    this.saveSongs([]);
    this.savePlaylists([]);
    this.saveSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_SONG_IDS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_PLAYLIST_IDS);
  }
}
