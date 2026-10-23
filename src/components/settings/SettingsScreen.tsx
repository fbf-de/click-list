import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Flame,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Eye,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storageService';
import { ConfirmModal } from '../common/ConfirmModal';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemo,
    clearAllData,
    songs,
    playlists
  } = useApp();

  const [notification, setNotification] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    const json = StorageService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clicklist-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup successfully exported!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importData(content);
        if (success) {
          window.location.reload();
        } else {
          showToast('Failed to import backup: invalid file format');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Settings & Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Customize your stage display, audio volume, and backup your repertoire
        </p>
      </div>

      {notification && (
        <div
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid var(--accent-cyan)',
            color: 'var(--accent-cyan)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <Check size={18} />
          <span>{notification}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Stage Theme Settings */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Visual Theme
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Stage Dark */}
            <button
              type="button"
              className={`btn ${settings.theme === 'stage' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                height: 'auto'
              }}
              onClick={() => updateSettings({ theme: 'stage' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <Flame size={18} color="var(--accent-amber)" />
                <span style={{ fontWeight: 800 }}>Stage Dark</span>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', textAlign: 'left' }}>
                Ultra high contrast pitch black with neon cyan & amber glow for live stage use
              </span>
            </button>

            {/* Standard Dark */}
            <button
              type="button"
              className={`btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                height: 'auto'
              }}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <Moon size={18} />
                <span style={{ fontWeight: 800 }}>Standard Dark</span>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', textAlign: 'left' }}>
                Balanced dark charcoal for rehearsal studios and evening practice
              </span>
            </button>

            {/* Daylight Clean */}
            <button
              type="button"
              className={`btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                height: 'auto'
              }}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <Sun size={18} color="var(--accent-amber)" />
                <span style={{ fontWeight: 800 }}>Clean Light</span>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', textAlign: 'left' }}>
                High contrast light theme for outdoor daytime gigs or bright studios
              </span>
            </button>
          </div>
        </div>

        {/* Metronome Audio & Visuals */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Audio & Stage Feedback</h3>

          {/* Master Volume */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="form-label">Master Click Volume</span>
              <span className="font-mono text-gradient" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Flash Visuals Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={20} color="var(--accent-cyan)" />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Visual Beat Pulse</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Pulsates stage ambient background color with each beat
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.flashVisuals}
              onChange={(e) => updateSettings({ flashVisuals: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-cyan)' }}
            />
          </label>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Screen Wake Lock Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--accent-emerald)" />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Keep Screen Awake</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Prevents tablet and phone display from sleeping during playback (Screen Wake Lock)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.keepScreenAwake}
              onChange={(e) => updateSettings({ keepScreenAwake: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-emerald)' }}
            />
          </label>
        </div>

        {/* Local Storage & Backup Management */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Data Storage & Portability</h3>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <p>
              <strong>Device Storage Notice:</strong> All songs and setlists are securely saved locally
              in your browser's persistent storage. Your configurations survive page reloads and browser
              restarts without requiring any account registration.
            </p>
            <p style={{ marginTop: '8px' }}>
              Currently storing <strong>{songs.length} songs</strong> and{' '}
              <strong>{playlists.length} setlists</strong>.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            {/* Export */}
            <button type="button" className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export JSON Backup
            </button>

            {/* Import */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} /> Import Backup
            </button>

            {/* Reset to demo */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowResetConfirm(true)}
            >
              <RefreshCw size={16} /> Reset Demo Repertoire
            </button>

            {/* Clear All */}
            <button
              type="button"
              className="btn btn-danger"
              style={{ marginLeft: 'auto' }}
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 size={16} /> Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset to Demo Repertoire?"
        message="This will restore the starter songs (Billie Jean, Back in Black, Take Five, etc.) and demo playlists. Any custom modifications will be replaced."
        confirmLabel="Reset to Demo"
        cancelLabel="Cancel"
        onConfirm={() => {
          resetToDemo();
          setShowResetConfirm(false);
          showToast('Library reset to demo songs & setlists!');
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Clear Confirmation */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Library Data?"
        message="Warning: This will permanently delete all saved songs, playlists, and settings from this browser. Make sure to export a backup first if you wish to keep your repertoire."
        confirmLabel="Delete Everything"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setShowClearConfirm(false);
          showToast('All local data has been cleared.');
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
