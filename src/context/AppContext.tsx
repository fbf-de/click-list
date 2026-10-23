import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Song, Playlist, AppSettings, AppView, PlaybackState } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../services/storageService';
import { audioEngine, BeatEvent } from '../services/audioEngine';

interface AppContextType {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Data
  songs: Song[];
  playlists: Playlist[];
  settings: AppSettings;
  recentSongs: Song[];
  recentPlaylists: Playlist[];

  // Song CRUD
  createSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Song;
  updateSong: (id: string, updates: Partial<Omit<Song, 'id' | 'createdAt'>>) => void;
  deleteSong: (id: string) => void;
  getSongById: (id: string) => Song | undefined;

  // Playlist CRUD
  createPlaylist: (name: string, songIds: string[], description?: string) => Playlist;
  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => void;
  deletePlaylist: (id: string) => void;
  getPlaylistById: (id: string) => Playlist | undefined;

  // Playback
  playbackState: PlaybackState;
  playSong: (song: Song, playlist?: Playlist, songIndex?: number) => void;
  stopPlayback: () => void;
  togglePlayback: () => void;
  nextSong: () => void;
  prevSong: () => void;
  selectSongByIndex: (index: number) => void;
  setBpm: (newBpm: number) => void;

  // Visual beat
  currentBeat: number;
  isAccentBeat: boolean;
  beatFlashTrigger: number; // incremented on each main beat for CSS trigger

  // Settings & Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToDemo: () => void;
  clearAllData: () => void;
  activePlaylist: Playlist | null;
  openPerformanceMode: (playlist: Playlist, initialSongIndex?: number) => void;

  // Modal helpers
  editingSong: Song | null;
  setEditingSong: (song: Song | null) => void;
  isSongModalOpen: boolean;
  setIsSongModalOpen: (open: boolean) => void;

  editingPlaylist: Playlist | null;
  setEditingPlaylist: (playlist: Playlist | null) => void;
  isPlaylistModalOpen: boolean;
  setIsPlaylistModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [songs, setSongs] = useState<Song[]>(() => StorageService.getSongs());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => StorageService.getPlaylists());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Wake lock reference
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentSong: null,
    currentPlaylist: null,
    currentSongIndex: 0,
    currentBeat: 0,
    totalBeatsInBar: 4,
    isAccent: false
  });

  // Active playlist for performance mode
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  // Visual beat sync
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [isAccentBeat, setIsAccentBeat] = useState<boolean>(false);
  const [beatFlashTrigger, setBeatFlashTrigger] = useState<number>(0);

  // Modal states
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);

  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    audioEngine.setVolume(settings.volume);
  }, [settings.theme, settings.volume]);

  // Screen wake lock
  useEffect(() => {
    const handleWakeLock = async () => {
      if ('wakeLock' in navigator && settings.keepScreenAwake && playbackState.isPlaying) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch (err) {
          console.warn('Wake Lock error:', err);
        }
      } else if (wakeLockRef.current && !playbackState.isPlaying) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
    handleWakeLock();
  }, [settings.keepScreenAwake, playbackState.isPlaying]);

  // AudioEngine beat listener
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((event: BeatEvent) => {
      if (event.isMainBeat) {
        setCurrentBeat(event.beatIndex);
        setIsAccentBeat(event.isAccent);
        setBeatFlashTrigger((prev) => prev + 1);
        setPlaybackState((prev) => ({
          ...prev,
          currentBeat: event.beatIndex,
          isAccent: event.isAccent
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // CRUD for Songs
  const createSong = useCallback(
    (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Song => {
      const newSong: Song = {
        ...songData,
        id: `song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updated = [newSong, ...songs];
      setSongs(updated);
      StorageService.saveSongs(updated);
      return newSong;
    },
    [songs]
  );

  const updateSong = useCallback(
    (id: string, updates: Partial<Omit<Song, 'id' | 'createdAt'>>) => {
      const updated = songs.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      );
      setSongs(updated);
      StorageService.saveSongs(updated);

      // If updating currently playing song, update audio engine real-time
      if (playbackState.currentSong?.id === id) {
        const updatedCurrent = updated.find((s) => s.id === id);
        if (updatedCurrent) {
          setPlaybackState((prev) => ({
            ...prev,
            currentSong: updatedCurrent,
            totalBeatsInBar: updatedCurrent.timeSignature.numerator
          }));
          audioEngine.configure({
            bpm: updatedCurrent.bpm,
            timeSignature: updatedCurrent.timeSignature,
            subdivision: updatedCurrent.subdivision,
            soundType: updatedCurrent.soundType,
            accentFirstBeat: updatedCurrent.accentFirstBeat
          });
        }
      }
    },
    [songs, playbackState.currentSong]
  );

  const deleteSong = useCallback(
    (id: string) => {
      // If currently playing, stop
      if (playbackState.currentSong?.id === id) {
        audioEngine.stop();
        setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentSong: null }));
      }

      const updatedSongs = songs.filter((s) => s.id !== id);
      setSongs(updatedSongs);
      StorageService.saveSongs(updatedSongs);

      // Clean up playlists referencing this song
      const updatedPlaylists = playlists.map((p) => ({
        ...p,
        songIds: p.songIds.filter((sId) => sId !== id)
      }));
      setPlaylists(updatedPlaylists);
      StorageService.savePlaylists(updatedPlaylists);
    },
    [songs, playlists, playbackState.currentSong]
  );

  const getSongById = useCallback(
    (id: string) => songs.find((s) => s.id === id),
    [songs]
  );

  // CRUD for Playlists
  const createPlaylist = useCallback(
    (name: string, songIds: string[], description?: string): Playlist => {
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        description,
        songIds,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updated = [newPlaylist, ...playlists];
      setPlaylists(updated);
      StorageService.savePlaylists(updated);
      return newPlaylist;
    },
    [playlists]
  );

  const updatePlaylist = useCallback(
    (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => {
      const updated = playlists.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      );
      setPlaylists(updated);
      StorageService.savePlaylists(updated);

      if (activePlaylist?.id === id) {
        const found = updated.find((p) => p.id === id);
        if (found) setActivePlaylist(found);
      }
    },
    [playlists, activePlaylist]
  );

  const deletePlaylist = useCallback(
    (id: string) => {
      if (activePlaylist?.id === id) {
        setActivePlaylist(null);
        if (currentView === 'performance') {
          setCurrentView('playlists');
        }
      }
      const updated = playlists.filter((p) => p.id !== id);
      setPlaylists(updated);
      StorageService.savePlaylists(updated);
    },
    [playlists, activePlaylist, currentView]
  );

  const getPlaylistById = useCallback(
    (id: string) => playlists.find((p) => p.id === id),
    [playlists]
  );

  // Playback Control Functions
  const stopPlayback = useCallback(() => {
    audioEngine.stop();
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      currentBeat: 0
    }));
    setCurrentBeat(0);
    setIsAccentBeat(false);
  }, []);

  const playSong = useCallback(
    (song: Song, playlist?: Playlist, songIndex: number = 0) => {
      // 1. Stop any currently playing click immediately
      audioEngine.stop();

      // 2. Configure audio engine with song specs
      audioEngine.configure({
        bpm: song.bpm,
        timeSignature: song.timeSignature,
        subdivision: song.subdivision,
        soundType: song.soundType,
        accentFirstBeat: song.accentFirstBeat
      });

      // 3. Update playback state
      setPlaybackState({
        isPlaying: true,
        currentSong: song,
        currentPlaylist: playlist || null,
        currentSongIndex: songIndex,
        currentBeat: 0,
        totalBeatsInBar: song.timeSignature.numerator,
        isAccent: song.accentFirstBeat
      });

      // 4. Save recent record
      StorageService.addRecentSongId(song.id);
      if (playlist) {
        StorageService.addRecentPlaylistId(playlist.id);
      }

      // 5. Start audio scheduling
      audioEngine.start();
    },
    []
  );

  const togglePlayback = useCallback(() => {
    if (playbackState.isPlaying) {
      stopPlayback();
    } else {
      if (playbackState.currentSong) {
        playSong(
          playbackState.currentSong,
          playbackState.currentPlaylist || undefined,
          playbackState.currentSongIndex
        );
      } else if (songs.length > 0) {
        playSong(songs[0]);
      }
    }
  }, [playbackState, songs, playSong, stopPlayback]);

  const selectSongByIndex = useCallback(
    (index: number) => {
      const playlist = playbackState.currentPlaylist || activePlaylist;
      if (!playlist || playlist.songIds.length === 0) return;

      const safeIndex = Math.max(0, Math.min(playlist.songIds.length - 1, index));
      const songId = playlist.songIds[safeIndex];
      const song = getSongById(songId);

      if (song) {
        playSong(song, playlist, safeIndex);
      }
    },
    [playbackState.currentPlaylist, activePlaylist, getSongById, playSong]
  );

  const nextSong = useCallback(() => {
    const playlist = playbackState.currentPlaylist || activePlaylist;
    if (!playlist || playlist.songIds.length === 0) return;

    const nextIndex = (playbackState.currentSongIndex + 1) % playlist.songIds.length;
    selectSongByIndex(nextIndex);
  }, [playbackState.currentPlaylist, playbackState.currentSongIndex, activePlaylist, selectSongByIndex]);

  const prevSong = useCallback(() => {
    const playlist = playbackState.currentPlaylist || activePlaylist;
    if (!playlist || playlist.songIds.length === 0) return;

    const prevIndex =
      playbackState.currentSongIndex === 0
        ? playlist.songIds.length - 1
        : playbackState.currentSongIndex - 1;
    selectSongByIndex(prevIndex);
  }, [playbackState.currentPlaylist, playbackState.currentSongIndex, activePlaylist, selectSongByIndex]);

  const setBpm = useCallback(
    (newBpm: number) => {
      const clampedBpm = Math.max(20, Math.min(320, Math.round(newBpm)));
      audioEngine.configure({ bpm: clampedBpm });

      if (playbackState.currentSong) {
        const updatedCurrent = { ...playbackState.currentSong, bpm: clampedBpm };
        setPlaybackState((prev) => ({
          ...prev,
          currentSong: updatedCurrent
        }));
      }
    },
    [playbackState.currentSong]
  );

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      const updated = { ...settings, ...updates };
      setSettings(updated);
      StorageService.saveSettings(updated);
    },
    [settings]
  );

  const resetToDemo = useCallback(() => {
    stopPlayback();
    StorageService.resetToDemo();
    setSongs(StorageService.getSongs());
    setPlaylists(StorageService.getPlaylists());
    setSettings(StorageService.getSettings());
    setActivePlaylist(null);
  }, [stopPlayback]);

  const clearAllData = useCallback(() => {
    stopPlayback();
    StorageService.clearAll();
    setSongs([]);
    setPlaylists([]);
    setSettings(DEFAULT_SETTINGS);
    setActivePlaylist(null);
  }, [stopPlayback]);

  const openPerformanceMode = useCallback(
    (playlist: Playlist, initialSongIndex: number = 0) => {
      setActivePlaylist(playlist);
      setCurrentView('performance');

      // If playlist has songs, start or cue the chosen song
      if (playlist.songIds.length > 0) {
        const targetSongId = playlist.songIds[initialSongIndex] || playlist.songIds[0];
        const song = getSongById(targetSongId);
        if (song) {
          playSong(song, playlist, initialSongIndex);
        }
      }
    },
    [getSongById, playSong]
  );

  // Compute recents
  const recentSongIds = StorageService.getRecentSongIds();
  const recentSongs = recentSongIds
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is Song => Boolean(s));

  const recentPlaylistIds = StorageService.getRecentPlaylistIds();
  const recentPlaylists = recentPlaylistIds
    .map((id) => playlists.find((p) => p.id === id))
    .filter((p): p is Playlist => Boolean(p));

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        songs,
        playlists,
        settings,
        recentSongs,
        recentPlaylists,
        createSong,
        updateSong,
        deleteSong,
        getSongById,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        getPlaylistById,
        playbackState,
        playSong,
        stopPlayback,
        togglePlayback,
        nextSong,
        prevSong,
        selectSongByIndex,
        setBpm,
        currentBeat,
        isAccentBeat,
        beatFlashTrigger,
        updateSettings,
        resetToDemo,
        clearAllData,
        activePlaylist,
        openPerformanceMode,
        editingSong,
        setEditingSong,
        isSongModalOpen,
        setIsSongModalOpen,
        editingPlaylist,
        setEditingPlaylist,
        isPlaylistModalOpen,
        setIsPlaylistModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
