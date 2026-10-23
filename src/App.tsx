import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { HomeScreen } from './components/home/HomeScreen';
import { SongListScreen } from './components/songs/SongListScreen';
import { PlaylistListScreen } from './components/playlists/PlaylistListScreen';
import { PerformanceScreen } from './components/playlists/PerformanceScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { SongEditorModal } from './components/songs/SongEditorModal';
import { PlaylistEditorModal } from './components/playlists/PlaylistEditorModal';

const MainView: React.FC = () => {
  const { currentView } = useApp();

  return (
    <main className="main-content" role="main">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'songs' && <SongListScreen />}
      {currentView === 'playlists' && <PlaylistListScreen />}
      {currentView === 'performance' && <PerformanceScreen />}
      {currentView === 'settings' && <SettingsScreen />}

      {/* Global Modals */}
      <SongEditorModal />
      <PlaylistEditorModal />
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="app-container">
        {/* Navigation Sidebar (Tablet/Desktop) or Bottom Bar (Mobile) */}
        <Navigation />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Header Bar */}
          <Header />

          {/* Dynamic View */}
          <MainView />
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
