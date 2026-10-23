import React, { useState } from 'react';
import {
  Plus,
  Play,
  Square,
  ListMusic,
  Music,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TapTempoButton } from '../common/TapTempoButton';
import { audioEngine } from '../../services/audioEngine';

export const HomeScreen: React.FC = () => {
  const {
    songs,
    playlists,
    recentSongs,
    recentPlaylists,
    playbackState,
    playSong,
    stopPlayback,
    setCurrentView,
    setIsSongModalOpen,
    setEditingSong,
    setIsPlaylistModalOpen,
    setEditingPlaylist,
    openPerformanceMode,
    resetToDemo
  } = useApp();

  // Quick Standalone Metronome state
  const [quickBpm, setQuickBpm] = useState<number>(120);
  const [isQuickPlaying, setIsQuickPlaying] = useState<boolean>(false);

  const toggleQuickMetronome = async () => {
    if (isQuickPlaying) {
      audioEngine.stop();
      setIsQuickPlaying(false);
    } else {
      stopPlayback(); // stop any current playlist song
      audioEngine.configure({
        bpm: quickBpm,
        timeSignature: { numerator: 4, denominator: 4 },
        subdivision: 1,
        soundType: 'digital',
        accentFirstBeat: true
      });
      await audioEngine.start();
      setIsQuickPlaying(true);
    }
  };

  const handleAdjustQuickBpm = (delta: number) => {
    const updated = Math.max(20, Math.min(320, quickBpm + delta));
    setQuickBpm(updated);
    if (isQuickPlaying) {
      audioEngine.configure({ bpm: updated });
    }
  };

  const hasContent = songs.length > 0 || playlists.length > 0;

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="badge badge-cyan"
            style={{ fontWeight: 800, letterSpacing: '0.05em' }}
          >
            PRECISION LIVE METRONOME
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v1.0</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.75rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}
        >
          Welcome to Click<span style={{ color: 'var(--accent-cyan)' }}>List</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px' }}>
          Stage-ready metronome and setlist manager designed for live musicians and drummers.
        </p>
      </div>

      {/* Primary Actions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* Create Song Card */}
        <div
          className="card card-clickable"
          onClick={() => {
            setEditingSong(null);
            setIsSongModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            border: '1px solid var(--border-strong)'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Plus size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create New Song</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Save BPM, time signature & sound click
            </p>
          </div>
        </div>

        {/* Create Playlist Card */}
        <div
          className="card card-clickable"
          onClick={() => {
            setEditingPlaylist(null);
            setIsPlaylistModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            border: '1px solid var(--border-strong)'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ListMusic size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create Setlist</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Organize songs for live gigs & rehearsals
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stage Metronome Widget */}
      <div
        className="card"
        style={{
          marginBottom: '32px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Instant Metronome</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Quick click without opening a setlist
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              className="font-mono text-gradient"
              style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}
            >
              {quickBpm}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              BPM (4/4)
            </span>
          </div>

          {/* Quick Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => handleAdjustQuickBpm(-5)}
              >
                -5
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => handleAdjustQuickBpm(-1)}
              >
                -1
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => handleAdjustQuickBpm(1)}
              >
                +1
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => handleAdjustQuickBpm(5)}
              >
                +5
              </button>
            </div>

            <TapTempoButton
              onBpmChange={(bpm) => {
                setQuickBpm(bpm);
                if (isQuickPlaying) audioEngine.configure({ bpm });
              }}
              label="TAP"
            />

            <button
              type="button"
              className={`btn ${isQuickPlaying ? 'btn-danger' : 'btn-primary'}`}
              style={{ minWidth: '120px' }}
              onClick={toggleQuickMetronome}
            >
              {isQuickPlaying ? (
                <>
                  <Square size={18} fill="currentColor" /> Stop
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Play
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recents & Shortcuts Grid */}
      {hasContent ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Recent / Favorite Setlists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--accent-amber)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Playlists & Setlists</h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem', height: '28px' }}
                onClick={() => setCurrentView('playlists')}
              >
                View All ({playlists.length})
              </button>
            </div>

            {playlists.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No playlists saved yet.</p>
            ) : (
              (recentPlaylists.length > 0 ? recentPlaylists.slice(0, 3) : playlists.slice(0, 3)).map(
                (pl) => (
                  <div
                    key={pl.id}
                    className="card card-clickable"
                    onClick={() => openPerformanceMode(pl, 0)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pl.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pl.songIds.length} {pl.songIds.length === 1 ? 'song' : 'songs'} in set
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-icon"
                      style={{ width: '36px', height: '36px' }}
                      title="Launch Live Stage Mode"
                    >
                      <Zap size={16} />
                    </button>
                  </div>
                )
              )
            )}
          </div>

          {/* Recently Played Songs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Music size={16} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Saved Songs</h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem', height: '28px' }}
                onClick={() => setCurrentView('songs')}
              >
                View All ({songs.length})
              </button>
            </div>

            {songs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No songs saved yet.</p>
            ) : (
              (recentSongs.length > 0 ? recentSongs.slice(0, 4) : songs.slice(0, 4)).map((song) => {
                const isPlaying = playbackState.isPlaying && playbackState.currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`song-row ${isPlaying ? 'is-active' : ''}`}
                    onClick={() => {
                      if (isPlaying) {
                        stopPlayback();
                      } else {
                        playSong(song);
                      }
                    }}
                    style={{ margin: 0, padding: '10px 14px' }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: isPlaying ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {song.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {song.timeSignature.numerator}/{song.timeSignature.denominator} • {song.soundType}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-cyan font-mono" style={{ fontSize: '0.8rem' }}>
                        {song.bpm} BPM
                      </span>
                      <button
                        type="button"
                        className={`btn btn-icon ${isPlaying ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ width: '34px', height: '34px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlaying) stopPlayback();
                          else playSong(song);
                        }}
                      >
                        {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
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
              color: 'var(--accent-cyan)'
            }}
          >
            <Sparkles size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Welcome to ClickList!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', marginTop: '6px' }}>
              Your library is currently empty. Would you like to load a starter pack of demo songs and setlists to explore the features?
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={resetToDemo}>
              <Sparkles size={16} /> Load Demo Repertoire
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingSong(null);
                setIsSongModalOpen(true);
              }}
            >
              <Plus size={16} /> Create Song from Scratch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
