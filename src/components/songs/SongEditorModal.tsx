import React, { useState, useEffect } from 'react';
import { Play, Square, X, Plus, Minus, Music, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SoundType, Subdivision, TimeSignature } from '../../types';
import { TapTempoButton } from '../common/TapTempoButton';
import { BeatIndicator } from '../common/BeatIndicator';
import { audioEngine, BeatEvent } from '../../services/audioEngine';

const COMMON_TIME_SIGNATURES: { label: string; value: TimeSignature }[] = [
  { label: '4/4', value: { numerator: 4, denominator: 4 } },
  { label: '3/4', value: { numerator: 3, denominator: 4 } },
  { label: '2/4', value: { numerator: 2, denominator: 4 } },
  { label: '6/8', value: { numerator: 6, denominator: 8 } },
  { label: '5/4', value: { numerator: 5, denominator: 4 } },
  { label: '7/8', value: { numerator: 7, denominator: 8 } },
  { label: '12/8', value: { numerator: 12, denominator: 8 } }
];

const SOUND_OPTIONS: { id: SoundType; label: string; desc: string }[] = [
  { id: 'digital', label: 'Digital Pulse', desc: 'Modern electronic click' },
  { id: 'woodblock', label: 'Woodblock', desc: 'Organic acoustic resonance' },
  { id: 'classic', label: 'Classic Metronome', desc: 'Vintage mechanical pendulum' },
  { id: 'rimshot', label: 'Rimshot Click', desc: 'Crisp drum stick strike' },
  { id: 'beep', label: 'Electronic Beep', desc: 'High visibility stage beep' }
];

const SUBDIVISIONS: { id: Subdivision; label: string; symbol: string }[] = [
  { id: 1, label: 'Quarter', symbol: '♩' },
  { id: 2, label: '8th Notes', symbol: '♪ ♪' },
  { id: 3, label: 'Triplets', symbol: '3' },
  { id: 4, label: '16th Notes', symbol: '♬' }
];

export const SongEditorModal: React.FC = () => {
  const {
    isSongModalOpen,
    setIsSongModalOpen,
    editingSong,
    setEditingSong,
    createSong,
    updateSong
  } = useApp();

  const [title, setTitle] = useState<string>('');
  const [bpm, setBpm] = useState<number>(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({ numerator: 4, denominator: 4 });
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [soundType, setSoundType] = useState<SoundType>('digital');
  const [accentFirstBeat, setAccentFirstBeat] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [previewBeat, setPreviewBeat] = useState<number>(0);

  // Sync state when editingSong changes
  useEffect(() => {
    if (editingSong) {
      setTitle(editingSong.title);
      setBpm(editingSong.bpm);
      setTimeSignature(editingSong.timeSignature);
      setSubdivision(editingSong.subdivision);
      setSoundType(editingSong.soundType);
      setAccentFirstBeat(editingSong.accentFirstBeat);
      setNotes(editingSong.notes || '');
    } else {
      // Default new song
      setTitle('');
      setBpm(120);
      setTimeSignature({ numerator: 4, denominator: 4 });
      setSubdivision(1);
      setSoundType('digital');
      setAccentFirstBeat(true);
      setNotes('');
    }
    setError('');
    setIsPreviewing(false);
  }, [editingSong, isSongModalOpen]);

  // AudioEngine beat listener for preview
  useEffect(() => {
    if (!isPreviewing) return;

    audioEngine.configure({
      bpm,
      timeSignature,
      subdivision,
      soundType,
      accentFirstBeat
    });

    const unsubscribe = audioEngine.subscribe((event: BeatEvent) => {
      if (event.isMainBeat) {
        setPreviewBeat(event.beatIndex);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isPreviewing, bpm, timeSignature, subdivision, soundType, accentFirstBeat]);

  // Stop preview on unmount or close
  const handleClose = () => {
    if (isPreviewing) {
      audioEngine.stop();
      setIsPreviewing(false);
    }
    setEditingSong(null);
    setIsSongModalOpen(false);
  };

  const togglePreview = async () => {
    if (isPreviewing) {
      audioEngine.stop();
      setIsPreviewing(false);
      setPreviewBeat(0);
    } else {
      audioEngine.configure({
        bpm,
        timeSignature,
        subdivision,
        soundType,
        accentFirstBeat
      });
      await audioEngine.start();
      setIsPreviewing(true);
    }
  };

  const handleAdjustBpm = (delta: number) => {
    setBpm((prev) => Math.max(20, Math.min(320, prev + delta)));
  };

  const handlePreviewSound = (sound: SoundType) => {
    setSoundType(sound);
    audioEngine.previewClick(sound, accentFirstBeat);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Song name is required');
      return;
    }

    if (bpm < 20 || bpm > 320) {
      setError('BPM must be between 20 and 320');
      return;
    }

    if (isPreviewing) {
      audioEngine.stop();
      setIsPreviewing(false);
    }

    if (editingSong) {
      updateSong(editingSong.id, {
        title: title.trim(),
        bpm,
        timeSignature,
        subdivision,
        soundType,
        accentFirstBeat,
        notes: notes.trim()
      });
    } else {
      createSong({
        title: title.trim(),
        bpm,
        timeSignature,
        subdivision,
        soundType,
        accentFirstBeat,
        notes: notes.trim()
      });
    }

    handleClose();
  };

  if (!isSongModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <form
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSave}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Music size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {editingSong ? 'Edit Song Click' : 'Create New Song Click'}
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

            {/* Song Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="song-title">
                Song Name *
              </label>
              <input
                id="song-title"
                type="text"
                className="form-input"
                placeholder="e.g. Master of Puppets, Superstition..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                required
              />
            </div>

            {/* BPM Controls */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="form-label">Tempo (BPM)</span>
                <span
                  className="font-mono text-gradient"
                  style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}
                >
                  {bpm}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="20"
                max="300"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-cyan)',
                  cursor: 'pointer'
                }}
              />

              {/* Step Nudge Buttons & Tap Tempo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleAdjustBpm(-5)}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleAdjustBpm(-1)}
                  >
                    <Minus size={14} /> 1
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleAdjustBpm(1)}
                  >
                    <Plus size={14} /> 1
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleAdjustBpm(5)}
                  >
                    +5
                  </button>
                </div>

                <TapTempoButton onBpmChange={(newBpm) => setBpm(newBpm)} />
              </div>
            </div>

            {/* Time Signature & Subdivision Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}
            >
              {/* Time Signature */}
              <div className="form-group">
                <label className="form-label">Time Signature</label>
                <select
                  className="form-select"
                  value={`${timeSignature.numerator}/${timeSignature.denominator}`}
                  onChange={(e) => {
                    const [num, den] = e.target.value.split('/').map(Number);
                    setTimeSignature({ numerator: num, denominator: den });
                  }}
                >
                  {COMMON_TIME_SIGNATURES.map((ts) => (
                    <option
                      key={`${ts.value.numerator}/${ts.value.denominator}`}
                      value={`${ts.value.numerator}/${ts.value.denominator}`}
                    >
                      {ts.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subdivision */}
              <div className="form-group">
                <label className="form-label">Subdivision</label>
                <select
                  className="form-select"
                  value={subdivision}
                  onChange={(e) => setSubdivision(Number(e.target.value) as Subdivision)}
                >
                  {SUBDIVISIONS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label} ({sub.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Click Sound Selector */}
            <div className="form-group">
              <label className="form-label">Click Sound</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px'
                }}
              >
                {SOUND_OPTIONS.map((snd) => {
                  const isSelected = soundType === snd.id;
                  return (
                    <button
                      key={snd.id}
                      type="button"
                      onClick={() => handlePreviewSound(snd.id)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: 'auto'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{snd.label}</span>
                        {isSelected && <Check size={14} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          opacity: 0.8,
                          whiteSpace: 'normal',
                          textAlign: 'left'
                        }}
                      >
                        {snd.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent First Beat Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Accent First Beat</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  High-pitch chime/accent on Beat 1 of every measure
                </span>
              </div>
              <input
                type="checkbox"
                checked={accentFirstBeat}
                onChange={(e) => setAccentFirstBeat(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: 'var(--accent-amber)',
                  cursor: 'pointer'
                }}
              />
            </label>

            {/* Live Visual Preview & Beat Indicator */}
            {isPreviewing && (
              <div
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  LIVE PREVIEW RUNNING
                </span>
                <BeatIndicator
                  totalBeats={timeSignature.numerator}
                  currentBeat={previewBeat}
                  isPlaying={isPreviewing}
                  accentFirstBeat={accentFirstBeat}
                />
              </div>
            )}

            {/* Optional Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="song-notes">
                Musician Notes (Optional)
              </label>
              <input
                id="song-notes"
                type="text"
                className="form-input"
                placeholder="e.g. 4 bar intro, drum fill cue, switch to half-time bridge"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className={`btn ${isPreviewing ? 'btn-danger' : 'btn-secondary'} btn-full-mobile`}
              onClick={togglePreview}
              style={{ marginRight: 'auto' }}
            >
              {isPreviewing ? (
                <>
                  <Square size={16} fill="currentColor" /> Stop Preview
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> Preview Click
                </>
              )}
            </button>

            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
              {editingSong ? 'Save Changes' : 'Create Song'}
            </button>
          </div>
      </form>
    </div>
  );
};
