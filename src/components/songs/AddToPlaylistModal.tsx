import React, { useState } from 'react';
import { Plus, Check, ListMusic, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Song } from '../../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  song,
  onClose
}) => {
  const { playlists, updatePlaylist, createPlaylist } = useApp();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !song) return null;

  const handleToggleSongInPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    // Add song to playlist (allow adding even if exists, or append)
    const updatedSongIds = [...playlist.songIds, song.id];
    updatePlaylist(playlistId, { songIds: updatedSongIds });

    setFeedback(`Added "${song.title}" to "${playlist.name}"`);
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 900);
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const created = createPlaylist(newPlaylistName.trim(), [song.id]);
    setFeedback(`Created "${created.name}" and added "${song.title}"`);
    setNewPlaylistName('');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 900);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListMusic size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Add "{song.title}" to Playlist
            </h3>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {feedback && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                border: '1px solid var(--accent-emerald)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600
              }}
            >
              <Check size={16} />
              <span>{feedback}</span>
            </div>
          )}

          <div className="form-group">
            <span className="form-label">Select existing playlist:</span>
            {playlists.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No playlists created yet. Create one below!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {playlists.map((pl) => {
                  const songCount = pl.songIds.filter((id) => id === song.id).length;
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleToggleSongInPlaylist(pl.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left',
                        padding: '12px 16px'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{pl.name}</span>
                      <span className="badge badge-cyan">
                        {pl.songIds.length} songs {songCount > 0 ? `(${songCount} added)` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '8px 0' }} />

          <form onSubmit={handleCreateAndAdd} className="form-group">
            <label className="form-label" htmlFor="new-playlist-quick">
              Or create new playlist:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                id="new-playlist-quick"
                type="text"
                className="form-input"
                placeholder="New Setlist Name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                style={{ flex: '1 1 200px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newPlaylistName.trim()}
                style={{ flex: '1 1 auto', minHeight: '44px' }}
              >
                <Plus size={16} /> Create & Add
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
