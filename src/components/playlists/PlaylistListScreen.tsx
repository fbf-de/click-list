import React, { useState } from 'react';
import { Plus, ListMusic, Edit3, Trash2, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Playlist } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const PlaylistListScreen: React.FC = () => {
  const {
    playlists,
    songs,
    deletePlaylist,
    setEditingPlaylist,
    setIsPlaylistModalOpen,
    openPerformanceMode
  } = useApp();

  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  const handleEdit = (e: React.MouseEvent, pl: Playlist) => {
    e.stopPropagation();
    setEditingPlaylist(pl);
    setIsPlaylistModalOpen(true);
  };

  const handleDeleteRequest = (e: React.MouseEvent, pl: Playlist) => {
    e.stopPropagation();
    setPlaylistToDelete(pl);
  };

  const handleConfirmDelete = () => {
    if (playlistToDelete) {
      deletePlaylist(playlistToDelete.id);
      setPlaylistToDelete(null);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Setlists & Playlists
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Organize song tempos into reusable live performance sets
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingPlaylist(null);
            setIsPlaylistModalOpen(true);
          }}
        >
          <Plus size={18} /> New Setlist
        </button>
      </div>

      {/* Playlist Grid */}
      {playlists.length === 0 ? (
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
            <ListMusic size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              No setlists created yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px' }}>
              Create a setlist to organize your song clicks in performance order for your next rehearsal or live gig.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingPlaylist(null);
              setIsPlaylistModalOpen(true);
            }}
          >
            <Plus size={18} /> Create First Setlist
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {playlists.map((pl) => {
            // Retrieve songs for preview
            const plSongs = pl.songIds
              .map((id) => songs.find((s) => s.id === id))
              .filter((s): s is typeof songs[0] => Boolean(s));

            return (
              <div
                key={pl.id}
                className="card card-clickable"
                onClick={() => openPerformanceMode(pl, 0)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-cyan)'
                        }}
                      >
                        <ListMusic size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{pl.name}</h3>
                        <span className="badge badge-cyan" style={{ marginTop: '2px' }}>
                          {pl.songIds.length} {pl.songIds.length === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        style={{ width: '34px', height: '34px' }}
                        onClick={(e) => handleEdit(e, pl)}
                        title="Edit Setlist"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        style={{ width: '34px', height: '34px' }}
                        onClick={(e) => handleDeleteRequest(e, pl)}
                        title="Delete Setlist"
                      >
                        <Trash2 size={15} color="var(--accent-rose)" />
                      </button>
                    </div>
                  </div>

                  {pl.description && (
                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        marginBottom: '12px'
                      }}
                    >
                      {pl.description}
                    </p>
                  )}

                  {/* Songs Preview List */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {plSongs.slice(0, 3).map((song, i) => (
                      <div
                        key={`${song.id}-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px'
                          }}
                        >
                          {i + 1}. {song.title}
                        </span>
                        <span className="badge badge-cyan font-mono" style={{ fontSize: '0.7rem' }}>
                          {song.bpm} BPM
                        </span>
                      </div>
                    ))}
                    {plSongs.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        +{plSongs.length - 3} more tracks...
                      </span>
                    )}
                    {plSongs.length === 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        No songs added yet. Click edit to add songs.
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance CTA Button */}
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openPerformanceMode(pl, 0);
                  }}
                  disabled={pl.songIds.length === 0}
                >
                  <Zap size={16} /> Open Live Stage Mode <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(playlistToDelete)}
        title={`Delete Setlist "${playlistToDelete?.name}"?`}
        message="Deleting this playlist will not delete the original songs in your library. Are you sure you want to proceed?"
        confirmLabel="Delete Setlist"
        cancelLabel="Keep Setlist"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPlaylistToDelete(null)}
      />
    </div>
  );
};
