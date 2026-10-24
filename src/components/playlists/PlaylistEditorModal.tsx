import React, { useState, useEffect } from 'react';
import {
  ListMusic,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Search,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PlaylistEditorModal: React.FC = () => {
  const {
    isPlaylistModalOpen,
    setIsPlaylistModalOpen,
    editingPlaylist,
    setEditingPlaylist,
    createPlaylist,
    updatePlaylist,
    songs
  } = useApp();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [songSearchQuery, setSongSearchQuery] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (editingPlaylist) {
      setName(editingPlaylist.name);
      setDescription(editingPlaylist.description || '');
      setSelectedSongIds([...editingPlaylist.songIds]);
    } else {
      setName('');
      setDescription('');
      setSelectedSongIds([]);
    }
    setError('');
    setSongSearchQuery('');
  }, [editingPlaylist, isPlaylistModalOpen]);

  const handleClose = () => {
    setEditingPlaylist(null);
    setIsPlaylistModalOpen(false);
  };

  const handleAddSong = (songId: string) => {
    // Allows duplicates as per requirement
    setSelectedSongIds((prev) => [...prev, songId]);
  };

  const handleRemoveSongAtIndex = (index: number) => {
    setSelectedSongIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setSelectedSongIds((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= selectedSongIds.length - 1) return;
    setSelectedSongIds((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setSelectedSongIds((prev) => {
      const updated = [...prev];
      const item = updated.splice(draggedIndex, 1)[0];
      updated.splice(index, 0, item);
      return updated;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist / Setlist name is required');
      return;
    }

    if (editingPlaylist) {
      updatePlaylist(editingPlaylist.id, {
        name: name.trim(),
        description: description.trim(),
        songIds: selectedSongIds
      });
    } else {
      createPlaylist(name.trim(), selectedSongIds, description.trim());
    }

    handleClose();
  };

  // Filter available songs by search query
  const availableSongs = songs.filter((s) => {
    const q = songSearchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.bpm.toString().includes(q);
  });

  if (!isPlaylistModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <form
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSave}
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListMusic size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {editingPlaylist ? 'Edit Setlist' : 'Create New Setlist'}
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid var(--accent-rose)',
                  color: 'var(--accent-rose)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {error}
              </div>
            )}

            {/* Playlist Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="playlist-name">
                Setlist / Playlist Name *
              </label>
              <input
                id="playlist-name"
                type="text"
                className="form-input"
                placeholder="e.g. Friday Festival Set, Rehearsal List A..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="playlist-desc">
                Description / Gig Venue (Optional)
              </label>
              <input
                id="playlist-desc"
                type="text"
                className="form-input"
                placeholder="e.g. 45 min set at The Jazz Tavern"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Setlist Order Section */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="form-label">
                  Setlist Track Order ({selectedSongIds.length} {selectedSongIds.length === 1 ? 'song' : 'songs'})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Drag to reorder or use ↑ ↓ buttons
                </span>
              </div>

              {selectedSongIds.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem'
                  }}
                >
                  No songs in this setlist yet. Select songs below to build your set.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '230px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}
                >
                  {selectedSongIds.map((songId, index) => {
                    const song = songs.find((s) => s.id === songId);
                    if (!song) return null;

                    const isDragged = draggedIndex === index;

                    return (
                      <div
                        key={`${songId}-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: isDragged ? 'var(--bg-elevated)' : 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          opacity: isDragged ? 0.6 : 1,
                          cursor: 'grab'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <GripVertical size={16} color="var(--text-muted)" />
                          <span
                            className="font-mono"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-tertiary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {index + 1}
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {song.title}
                          </span>
                          <span className="badge badge-cyan font-mono" style={{ fontSize: '0.75rem' }}>
                            {song.bpm} BPM
                          </span>
                        </div>

                        {/* Order Controls & Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Move Up"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => handleMoveDown(index)}
                            disabled={index === selectedSongIds.length - 1}
                            title="Move Down"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{ width: '32px', height: '32px', marginLeft: '6px' }}
                            onClick={() => handleRemoveSongAtIndex(index)}
                            title="Remove from setlist"
                          >
                            <Trash2 size={15} color="var(--accent-rose)" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Song Selection Picker */}
            <div className="form-group">
              <span className="form-label">Add Songs from Library</span>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
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
                  placeholder="Filter available songs..."
                  value={songSearchQuery}
                  onChange={(e) => setSongSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '38px', fontSize: '0.9rem' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                {availableSongs.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {songs.length === 0 ? 'No songs in your library yet.' : 'No matching songs.'}
                  </div>
                ) : (
                  availableSongs.map((s) => {
                    const timesAdded = selectedSongIds.filter((id) => id === s.id).length;
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: timesAdded > 0 ? 'var(--bg-tertiary)' : 'transparent',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</span>
                          <span className="badge badge-cyan font-mono" style={{ fontSize: '0.75rem' }}>
                            {s.bpm} BPM
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {s.timeSignature.numerator}/{s.timeSignature.denominator}
                          </span>
                          {timesAdded > 0 && (
                            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                              <Check size={11} style={{ marginRight: '3px' }} />
                              {timesAdded}x in set
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', height: '32px' }}
                          onClick={() => handleAddSong(s.id)}
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
              {editingPlaylist ? 'Save Setlist' : 'Create Setlist'}
            </button>
          </div>
      </form>
    </div>
  );
};
