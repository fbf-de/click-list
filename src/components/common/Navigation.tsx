import React from 'react';
import { Home, Music, ListMusic, Zap, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, activePlaylist, playlists } = useApp();

  const handleNavClick = (view: AppView) => {
    if (view === 'performance' && !activePlaylist) {
      // If no active playlist yet, pick the first playlist or go to playlists screen
      if (playlists.length > 0) {
        useApp;
      }
    }
    setCurrentView(view);
  };

  const navItems: { view: AppView; label: string; icon: React.ReactNode }[] = [
    {
      view: 'home',
      label: 'Home',
      icon: <Home size={20} />
    },
    {
      view: 'songs',
      label: 'Songs',
      icon: <Music size={20} />
    },
    {
      view: 'playlists',
      label: 'Playlists',
      icon: <ListMusic size={20} />
    },
    {
      view: 'performance',
      label: 'Live Stage',
      icon: <Zap size={20} />
    },
    {
      view: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />
    }
  ];

  return (
    <nav className="nav-bar" aria-label="Main Navigation">
      <div className="nav-sidebar-brand" style={{ display: 'none' }}>
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
        <span>
          Click<span style={{ color: 'var(--accent-cyan)' }}>List</span>
        </span>
      </div>

      {navItems.map((item) => {
        const isActive = currentView === item.view;
        return (
          <button
            key={item.view}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavClick(item.view)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
