import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Flame, Square } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    settings,
    updateSettings,
    playbackState,
    stopPlayback,
    setCurrentView
  } = useApp();

  const handleThemeCycle = () => {
    if (settings.theme === 'stage') {
      updateSettings({ theme: 'dark' });
    } else if (settings.theme === 'dark') {
      updateSettings({ theme: 'light' });
    } else {
      updateSettings({ theme: 'stage' });
    }
  };

  const handleVolumeToggle = () => {
    if (settings.volume > 0) {
      updateSettings({ volume: 0 });
    } else {
      updateSettings({ volume: 0.85 });
    }
  };

  return (
    <header className="top-header">
      <div
        className="brand-badge"
        style={{ cursor: 'pointer' }}
        onClick={() => setCurrentView('home')}
      >
        <div className="brand-icon-box">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 19 21 5 21" />
            <line x1="12" y1="9" x2="16" y2="15" />
            <circle cx="16" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ lineHeight: 1 }}>
            Click<span style={{ color: 'var(--accent-cyan)' }}>List</span>
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            Live Stage Metronome
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Active playback mini chip */}
        {playbackState.isPlaying && playbackState.currentSong && (
          <div
            onClick={() => {
              if (playbackState.currentPlaylist) {
                setCurrentView('performance');
              } else {
                setCurrentView('songs');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              cursor: 'pointer'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-cyan)',
                boxShadow: '0 0 8px var(--accent-cyan)'
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {playbackState.currentSong.bpm} BPM
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                stopPlayback();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-rose)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title="Stop Metronome"
            >
              <Square size={13} fill="currentColor" />
            </button>
          </div>
        )}

        {/* Volume toggle */}
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={handleVolumeToggle}
          title={settings.volume > 0 ? `Volume: ${Math.round(settings.volume * 100)}%` : 'Muted'}
        >
          {settings.volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} color="var(--accent-rose)" />}
        </button>

        {/* Theme Cycler */}
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={handleThemeCycle}
          title={`Theme: ${settings.theme.toUpperCase()} (Click to toggle)`}
        >
          {settings.theme === 'stage' ? (
            <Flame size={18} color="var(--accent-amber)" />
          ) : settings.theme === 'dark' ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} color="var(--accent-amber)" />
          )}
        </button>
      </div>
    </header>
  );
};
