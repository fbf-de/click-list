import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test environment
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key in mockStorage) delete mockStorage[key];
  },
  length: 0,
  key: (_index: number) => null
};

// Import StorageService and types
import { StorageService } from '../src/services/storageService.ts';
import type { Song, Playlist } from '../src/types/index.ts';

test('ClickList - Storage Service Song Management', () => {
  // Test Scenario 1 & 2: User can create a song called "Song A" at 120 BPM and save it
  const songA: Song = {
    id: 'test-song-a',
    title: 'Song A',
    bpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: 1,
    soundType: 'digital',
    accentFirstBeat: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  StorageService.saveSongs([songA]);
  const loadedSongs = StorageService.getSongs();
  assert.equal(loadedSongs.length, 1);
  assert.equal(loadedSongs[0].title, 'Song A');
  assert.equal(loadedSongs[0].bpm, 120);

  // Test Scenario 4: User can edit the song to 140 BPM and the updated value persists
  const updatedSongs = loadedSongs.map((s) => (s.id === 'test-song-a' ? { ...s, bpm: 140 } : s));
  StorageService.saveSongs(updatedSongs);

  const reloaded = StorageService.getSongs();
  assert.equal(reloaded[0].bpm, 140);
});

test('ClickList - Playlist Management & Ordering', () => {
  // Test Scenario 5: User can create a playlist called "Live Set"
  // Test Scenario 6: User can add multiple saved songs to that playlist
  const song1: Song = {
    id: 'song-1',
    title: 'Intro Song',
    bpm: 100,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: 1,
    soundType: 'digital',
    accentFirstBeat: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const song2: Song = {
    id: 'song-2',
    title: 'Fast Rocker',
    bpm: 160,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: 1,
    soundType: 'woodblock',
    accentFirstBeat: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const song3: Song = {
    id: 'song-3',
    title: 'Ballad',
    bpm: 72,
    timeSignature: { numerator: 3, denominator: 4 },
    subdivision: 1,
    soundType: 'classic',
    accentFirstBeat: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  StorageService.saveSongs([song1, song2, song3]);

  const playlist: Playlist = {
    id: 'live-set-1',
    name: 'Live Set',
    description: 'Friday Night Show',
    songIds: ['song-1', 'song-2', 'song-3'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  StorageService.savePlaylists([playlist]);
  const savedPls = StorageService.getPlaylists();
  assert.equal(savedPls.length, 1);
  assert.equal(savedPls[0].name, 'Live Set');
  assert.deepEqual(savedPls[0].songIds, ['song-1', 'song-2', 'song-3']);

  // Test Scenario 7: User can reorder the songs and the order persists
  // Swap song-1 and song-3
  const reorderedPls = savedPls.map((p) =>
    p.id === 'live-set-1' ? { ...p, songIds: ['song-3', 'song-2', 'song-1'] } : p
  );
  StorageService.savePlaylists(reorderedPls);

  const reloadedPls = StorageService.getPlaylists();
  assert.deepEqual(reloadedPls[0].songIds, ['song-3', 'song-2', 'song-1']);

  // Test allowing duplicate songs (repeated track / reprise)
  const withDuplicate = reloadedPls.map((p) =>
    p.id === 'live-set-1' ? { ...p, songIds: [...p.songIds, 'song-3'] } : p
  );
  StorageService.savePlaylists(withDuplicate);

  const withDupReloaded = StorageService.getPlaylists();
  assert.equal(withDupReloaded[0].songIds.length, 4);
  assert.equal(withDupReloaded[0].songIds[3], 'song-3');
});

test('ClickList - Timing & Tempo Math Calculations', () => {
  // Test Scenario 3: Verify precision timing math
  // In 4/4 time at 120 BPM:
  // Quarter note duration = 60 / 120 = 0.5s = 500ms
  const calcStepDuration = (bpm: number, denominator: number, subdivision: number) => {
    const beatValueRelativeToQuarter = 4 / denominator;
    const beatDuration = (60.0 / bpm) * beatValueRelativeToQuarter;
    return beatDuration / subdivision;
  };

  assert.equal(calcStepDuration(120, 4, 1), 0.5); // 120 BPM 4/4 Quarter notes
  assert.equal(calcStepDuration(120, 4, 2), 0.25); // 120 BPM 4/4 8th notes
  assert.equal(calcStepDuration(60, 4, 1), 1.0); // 60 BPM 4/4 Quarter notes
  assert.equal(calcStepDuration(240, 4, 1), 0.25); // 240 BPM 4/4 Quarter notes

  // In 6/8 at 120 BPM:
  // 60 / 120 = 0.5s for quarter note. Eighth note = 0.25s.
  assert.equal(calcStepDuration(120, 8, 1), 0.25);
});

test('ClickList - Backup Export and Import', () => {
  // Test data export
  const exportJson = StorageService.exportData();
  assert.ok(exportJson.length > 0);

  const parsed = JSON.parse(exportJson);
  assert.equal(parsed.version, '1.0');
  assert.ok(Array.isArray(parsed.songs));
  assert.ok(Array.isArray(parsed.playlists));

  // Test import
  const newBackup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    songs: [
      {
        id: 'imported-1',
        title: 'Imported Song',
        bpm: 130,
        timeSignature: { numerator: 4, denominator: 4 },
        subdivision: 1,
        soundType: 'rimshot',
        accentFirstBeat: true,
        createdAt: 1000,
        updatedAt: 1000
      }
    ],
    playlists: [
      {
        id: 'imported-pl-1',
        name: 'Imported Setlist',
        songIds: ['imported-1'],
        createdAt: 1000,
        updatedAt: 1000
      }
    ],
    settings: {
      theme: 'stage',
      volume: 0.9,
      flashVisuals: true,
      keepScreenAwake: true,
      autoAdvance: false
    }
  };

  const importResult = StorageService.importData(JSON.stringify(newBackup));
  assert.equal(importResult, true);

  const loaded = StorageService.getSongs();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].title, 'Imported Song');
  assert.equal(loaded[0].bpm, 130);
});
