import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Square,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Plus,
  Minus,
  ShieldCheck,
  ListMusic
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BeatIndicator } from '../common/BeatIndicator';
import { TapTempoButton } from '../common/TapTempoButton';
import { Song, Playlist } from '../../types';

export const PerformanceScreen: React.FC = () => {
  const {
    activePlaylist,
    playlists,
    songs,
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
    settings,
    setCurrentView
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  // If no active playlist is selected, fallback to first available or show selector
  const effectivePlaylist: Playlist | null =
    activePlaylist || (playlists.length > 0 ? playlists[0] : null);

  // Current playing or selected song
  const currentSong: Song | null =
    playbackState.currentSong ||
    (effectivePlaylist && effectivePlaylist.songIds.length > 0
      ? songs.find((s) => s.id === effectivePlaylist.songIds[0]) || null
      : songs.length > 0
      ? songs[0]
      : null);

  // Beat flash effect
  useEffect(() => {
    if (!settings.flashVisuals || !playbackState.isPlaying) return;
    setFlashActive(true);
    const timeout = setTimeout(() => {
      setFlashActive(false);
    }, 70);
    return () => clearTimeout(timeout);
  }, [beatFlashTrigger, settings.flashVisuals, playbackState.isPlaying]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard controls for musicians
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyN') {
        e.preventDefault();
        nextSong();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyP') {
        e.preventDefault();
        prevSong();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (currentSong) setBpm(currentSong.bpm + 1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (currentSong) setBpm(currentSong.bpm - 1);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback, nextSong, prevSong, currentSong, setBpm, toggleFullscreen]);

  if (!effectivePlaylist && songs.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>No Songs or Playlists Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Please create a song or playlist first to use Live Stage Mode.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCurrentView('songs')}
        >
          Go to Songs
        </button>
      </div>
    );
  }

  // Get playlist song objects
  const playlistSongs: Song[] = effectivePlaylist
    ? effectivePlaylist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : songs;

  const currentIdx = playbackState.currentSongIndex;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      {/* Visual Beat Flash Ambient Layer */}
      <div
        className={`beat-flash-overlay ${flashActive ? (isAccentBeat ? 'flashing-accent' : 'flashing') : ''}`}
      />

      {/* Top Stage Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => setCurrentView('playlists')}
            title="Back to Playlists"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Live Stage Mode
            </span>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '240px'
              }}
            >
              {effectivePlaylist ? effectivePlaylist.name : 'Standalone Song Practice'}
            </h2>
          </div>
        </div>

        {/* Status Indicators & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {settings.keepScreenAwake && (
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-emerald)',
                border: '1px solid var(--accent-emerald)',
                gap: '4px'
              }}
              title="Screen Wake Lock is active — display will remain on while playing"
            >
              <ShieldCheck size={13} />
              <span style={{ fontSize: '0.7rem' }}>WAKE LOCK</span>
            </span>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Stage Mode (F)'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Stage Grid: Metronome Center + Setlist Sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          alignItems: 'start'
        }}
        className="performance-grid"
      >
        {/* Metronome Center Stage */}
        <div
          className="card"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: playbackState.isPlaying ? 'var(--accent-cyan)' : 'var(--border-subtle)',
            boxShadow: playbackState.isPlaying ? 'var(--primary-glow)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Active Song Title Banner */}
          <div style={{ marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Track {currentIdx + 1} of {playlistSongs.length}
            </span>
            <h1
              style={{
                fontSize: 'clamp(1.6rem, 5vw, 2.6rem)',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}
            >
              {currentSong ? currentSong.title : 'Select a Song'}
            </h1>
            {currentSong?.notes && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--accent-amber)',
                  marginTop: '4px',
                  fontWeight: 600
                }}
              >
                ♪ {currentSong.notes}
              </p>
            )}
          </div>

          {/* Giant BPM Display */}
          <div
            style={{
              margin: '12px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              className="font-mono text-gradient"
              style={{
                fontSize: 'clamp(5rem, 16vw, 9.5rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                userSelect: 'none'
              }}
            >
              {currentSong ? currentSong.bpm : 120}
            </div>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: 'var(--text-muted)',
                marginTop: '4px'
              }}
            >
              BPM
            </span>
          </div>

          {/* Time Signature & Accent Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <span
              className="badge badge-cyan font-mono"
              style={{ fontSize: '1rem', padding: '6px 14px', fontWeight: 800 }}
            >
              {currentSong
                ? `${currentSong.timeSignature.numerator}/${currentSong.timeSignature.denominator}`
                : '4/4'}
            </span>

            {currentSong?.accentFirstBeat && (
              <span
                className="badge badge-amber"
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                ACCENT ON 1
              </span>
            )}

            <span
              className="badge"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              {currentSong?.soundType || 'digital'}
            </span>
          </div>

          {/* Visual Beat Indicator Dots */}
          <div style={{ margin: '8px 0 20px 0', width: '100%' }}>
            <BeatIndicator
              totalBeats={currentSong?.timeSignature.numerator || 4}
              currentBeat={currentBeat}
              isPlaying={playbackState.isPlaying}
              accentFirstBeat={currentSong?.accentFirstBeat || false}
              size="large"
            />
          </div>

          {/* Primary Transport Play/Pause/Stop Buttons (Giant Touch Targets for Drummers) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              width: '100%',
              maxWidth: '520px',
              marginBottom: '20px'
            }}
          >
            {/* Previous Song */}
            <button
              type="button"
              className="btn btn-secondary btn-giant"
              onClick={prevSong}
              disabled={playlistSongs.length <= 1}
              style={{ flex: 1, minHeight: '68px' }}
              title="Previous Track (Arrow Left)"
            >
              <SkipBack size={26} />
              <span className="hide-on-mobile">PREV</span>
            </button>

            {/* Main Play / Pause Button */}
            <button
              type="button"
              className={`btn btn-giant ${
                playbackState.isPlaying ? 'btn-danger' : 'btn-primary'
              }`}
              onClick={() => {
                if (currentSong) {
                  if (playbackState.isPlaying) {
                    stopPlayback();
                  } else {
                    playSong(currentSong, effectivePlaylist || undefined, currentIdx);
                  }
                }
              }}
              style={{
                flex: 2,
                minHeight: '76px',
                fontSize: '1.4rem',
                fontWeight: 900,
                letterSpacing: '0.04em'
              }}
              title="Play / Stop (Spacebar)"
            >
              {playbackState.isPlaying ? (
                <>
                  <Square size={28} fill="currentColor" /> STOP
                </>
              ) : (
                <>
                  <Play size={28} fill="currentColor" /> START
                </>
              )}
            </button>

            {/* Next Song */}
            <button
              type="button"
              className="btn btn-secondary btn-giant"
              onClick={nextSong}
              disabled={playlistSongs.length <= 1}
              style={{ flex: 1, minHeight: '68px' }}
              title="Next Track (Arrow Right)"
            >
              <span className="hide-on-mobile">NEXT</span>
              <SkipForward size={26} />
            </button>
          </div>

          {/* Quick Tempo Adjust & Tap Tempo Tools */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => currentSong && setBpm(currentSong.bpm - 5)}
              >
                -5
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => currentSong && setBpm(currentSong.bpm - 1)}
              >
                <Minus size={15} /> 1
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => currentSong && setBpm(currentSong.bpm + 1)}
              >
                <Plus size={15} /> 1
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => currentSong && setBpm(currentSong.bpm + 5)}
              >
                +5
              </button>
            </div>

            <TapTempoButton
              onBpmChange={(newBpm) => setBpm(newBpm)}
              label="TAP"
              className="btn-secondary"
            />
          </div>
        </div>

        {/* Setlist Drawer / Playlist Tracklist */}
        <div
          className="card"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '600px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListMusic size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Setlist Tracks ({playlistSongs.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tap any song to switch click
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {playlistSongs.map((song, idx) => {
              const isSelected = currentIdx === idx;
              const isPlayingThis = isSelected && playbackState.isPlaying;

              return (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => selectSongByIndex(idx)}
                  className={`song-row ${isSelected ? 'is-active' : ''}`}
                  style={{
                    padding: '12px 14px',
                    margin: 0,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <span
                      className="font-mono"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                        color: isSelected ? '#000000' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.95rem',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
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
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      className="badge badge-cyan font-mono"
                      style={{ fontSize: '0.85rem', fontWeight: 800 }}
                    >
                      {song.bpm} BPM
                    </span>
                    {isPlayingThis ? (
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-cyan)',
                          boxShadow: '0 0 8px var(--accent-cyan)'
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .performance-grid {
            grid-template-columns: 1.4fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
