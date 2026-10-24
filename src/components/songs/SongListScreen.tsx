import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Play,
  Square,
  Edit3,
  Trash2,
  ListPlus,
  ArrowUpDown,
  Music
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Song } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import { BeatIndicator } from '../common/BeatIndicator';

type SortOption = 'name-asc' | 'name-desc' | 'bpm-asc' | 'bpm-desc' | 'newest';

export const SongListScreen: React.FC = () => {
  const {
    songs,
    playlists,
    deleteSong,
    setEditingSong,
    setIsSongModalOpen,
    playbackState,
    playSong,
    stopPlayback,
    currentBeat
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Deletion modal state
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  // Add to playlist modal state
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);

  // Filter & sort songs
  const filteredSongs = useMemo(() => {
    let result = songs.filter((song) => {
      const q = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(q) ||
        song.notes?.toLowerCase().includes(q) ||
        song.bpm.toString().includes(q)
      );
    });

    switch (sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'bpm-asc':
        result.sort((a, b) => a.bpm - b.bpm);
        break;
      case 'bpm-desc':
        result.sort((a, b) => b.bpm - a.bpm);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [songs, searchQuery, sortOption]);

  const handleRowClick = (song: Song) => {
    if (playbackState.isPlaying && playbackState.currentSong?.id === song.id) {
      stopPlayback();
    } else {
      playSong(song);
    }
  };

  const handleEdit = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setEditingSong(song);
    setIsSongModalOpen(true);
  };

  const handleDeleteRequest = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setSongToDelete(song);
  };

  const handleConfirmDelete = () => {
    if (songToDelete) {
      deleteSong(songToDelete.id);
      setSongToDelete(null);
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setSongToAddToPlaylist(song);
  };

  // Check how many playlists use the song being deleted
  const playlistsUsingSong = useMemo(() => {
    if (!songToDelete) return [];
    return playlists.filter((p) => p.songIds.includes(songToDelete.id));
  }, [songToDelete, playlists]);

  return (
    <div style={{ padding: '24px 20px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            All Songs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {songs.length} saved {songs.length === 1 ? 'song' : 'songs'} with tempo configurations
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingSong(null);
            setIsSongModalOpen(true);
          }}
        >
          <Plus size={18} /> New Song
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 260px'
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by song name or BPM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            style={{ minWidth: '160px' }}
          >
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="bpm-asc">BPM (Slow → Fast)</option>
            <option value="bpm-desc">BPM (Fast → Slow)</option>
            <option value="newest">Recently Created</option>
          </select>
        </div>
      </div>

      {/* Song List */}
      {filteredSongs.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <Music size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              {searchQuery ? 'No matching songs found' : 'No songs saved yet'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px' }}>
              {searchQuery
                ? `No songs match "${searchQuery}". Try a different keyword or reset filters.`
                : 'Create your first song metronome click configuration to build your repertoire.'}
            </p>
          </div>

          {searchQuery ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingSong(null);
                setIsSongModalOpen(true);
              }}
            >
              <Plus size={18} /> Create First Song
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredSongs.map((song) => {
            const isCurrent = playbackState.currentSong?.id === song.id;
            const isPlaying = isCurrent && playbackState.isPlaying;

            return (
              <div
                key={song.id}
                className={`song-row ${isPlaying ? 'is-active' : ''}`}
                onClick={() => handleRowClick(song)}
                title="Tap to play or stop metronome"
              >
                {/* Left: Play button & Song details */}
                <div className="song-row-details" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    className={`btn btn-icon ${isPlaying ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(song);
                    }}
                    style={{ flexShrink: 0, width: '48px', height: '48px' }}
                    aria-label={isPlaying ? `Stop ${song.title}` : `Play ${song.title}`}
                  >
                    {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: isPlaying ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {song.title}
                      </span>
                      {song.accentFirstBeat && (
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                          ACCENT 1
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '4px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span
                        className="badge badge-cyan font-mono"
                        style={{ fontSize: '0.85rem', fontWeight: 800 }}
                      >
                        {song.bpm} BPM
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {song.timeSignature.numerator}/{song.timeSignature.denominator}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        • {song.soundType}
                      </span>
                      {song.notes && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          }}
                        >
                          "{song.notes}"
                        </span>
                      )}
                    </div>

                    {/* Inline beat visualizer if currently playing */}
                    {isPlaying && (
                      <div style={{ marginTop: '8px' }}>
                        <BeatIndicator
                          totalBeats={song.timeSignature.numerator}
                          currentBeat={currentBeat}
                          isPlaying={isPlaying}
                          accentFirstBeat={song.accentFirstBeat}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div
                  className="song-row-actions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: '12px',
                    flexShrink: 0
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={(e) => handleAddToPlaylist(e, song)}
                    title="Add to Playlist"
                  >
                    <ListPlus size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={(e) => handleEdit(e, song)}
                    title="Edit Song"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={(e) => handleDeleteRequest(e, song)}
                    title="Delete Song"
                  >
                    <Trash2 size={18} color="var(--accent-rose)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(songToDelete)}
        title={`Delete "${songToDelete?.title}"?`}
        message={
          playlistsUsingSong.length > 0
            ? `Warning: This song is used in ${playlistsUsingSong.length} playlist(s) (${playlistsUsingSong
                .map((p) => `"${p.name}"`)
                .join(', ')}). Deleting it will safely remove it from those setlists as well.`
            : 'Are you sure you want to delete this song click configuration? This action cannot be undone.'
        }
        confirmLabel="Delete Song"
        cancelLabel="Keep Song"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSongToDelete(null)}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={Boolean(songToAddToPlaylist)}
        song={songToAddToPlaylist}
        onClose={() => setSongToAddToPlaylist(null)}
      />
    </div>
  );
};
