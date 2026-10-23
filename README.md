# ClickList — Music Click & Setlist Manager

**ClickList** is a modern, high-precision web metronome and setlist manager engineered specifically for musicians, drummers, and bands during rehearsals and live stage performances.

---

## 🌟 Key Features

### 1. High-Precision Web Audio Metronome Engine
- **Lookahead Scheduling**: Built on Chris Wilson's Web Audio API lookahead scheduling pattern (`audioContext.currentTime`), avoiding JavaScript timer jitter for sample-accurate timing.
- **Synthesized Click Sounds**: 5 zero-latency synthesized audio clicks (no external audio files needed, works 100% offline):
  - *Digital Pulse*: Clean modern electronic pulse with high-frequency accent
  - *Woodblock*: Resonant acoustic tone with pitch drop
  - *Classic Metronome*: Vintage mechanical pendulum click
  - *Rimshot*: Crisp snare drumstick strike
  - *Electronic Beep*: High-visibility stage beep
- **Subdivisions & Time Signatures**: Supports 4/4, 3/4, 2/4, 6/8, 5/4, 7/8, 12/8 and subdivisions (quarter notes, 8th notes, triplets, 16th notes).
- **Accented First Beat**: High-pitch chime on beat 1 of every measure.
- **Tap Tempo**: Real-time multi-tap average calculator with audio feedback.

### 2. Live Stage Performance Mode
- **Designed for Stage Use**: Tested for tablets mounted near drum kits or stage monitors.
- **Giant Touch Targets**: Minimum 48px, up to 76px for main transport controls (Start, Stop, Prev, Next).
- **Giant BPM Display**: Monospaced high-contrast typography readable from meters away.
- **Dynamic Visual Beat Indicator**: Illuminated dots representing every beat in the measure with golden accent on Beat 1.
- **Ambient Screen Pulse**: Optional screen background flash on beats for peripheral visual feedback.
- **Instant Track Switching**: Tapping any song in the setlist stops previous audio immediately and starts the new click with zero overlap.
- **Fullscreen Stage Mode**: Toggleable one-click fullscreen (press `F` or tap the fullscreen button).
- **Screen Wake Lock**: Uses the Screen Wake Lock API to prevent mobile and tablet displays from turning off mid-song.

### 3. Song Library & Setlist Management
- **Song Repertoire**: Save song name, BPM, time signature, subdivision, sound, accent, and performance notes.
- **Setlists / Playlists**: Reusable ordered collections of songs.
- **Drag-and-Drop & Touch Reordering**: Drag songs or use intuitive Up/Down arrows to set your live setlist order.
- **Duplicate Support**: Add the same song multiple times for repeated sections or encores.
- **Auto-Syncing**: Editing a song in the library automatically updates all setlists referencing that song.
- **Search & Sort**: Filter songs by name or tempo; sort by name (A-Z), BPM (slow/fast), or recently created.

### 4. Local Persistence & Portability
- **Zero Registration Needed**: All data is saved locally in the browser's persistent storage.
- **Survives Refresh**: Data persists across browser restarts and device reboots.
- **JSON Backup & Restore**: One-click JSON export and import for transferring setlists between devices.
- **Starter Repertoire**: Instant 1-click loading of demo classics (*Billie Jean*, *Back in Black*, *Take Five*, *Nothing Else Matters*, *Superstition*).

---

## 🎹 Keyboard Shortcuts (Stage Mode)

| Key | Action |
| :--- | :--- |
| `Space` | Start / Stop Metronome |
| `→` or `N` | Advance to Next Track |
| `←` or `P` | Return to Previous Track |
| `↑` | Increase BPM by +1 |
| `↓` | Decrease BPM by -1 |
| `F` | Toggle Fullscreen Mode |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended, v22+ tested)
- npm or pnpm

### Installation & Run

```bash
# Navigate to project directory
cd /Users/fbfreitas/.gemini/antigravity/scratch/clicklist

# Install dependencies (already pre-installed)
npm install

# Run the development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will start on `http://localhost:5173`.

---

## 📱 Mobile & Tablet Optimizations

- **Mobile Phones**: Compact bottom navigation bar, one-handed reachable buttons.
- **Tablets (iPad / Android Tablets)**: Split view stage mode with metronome on the left and scrollable setlist drawer on the right.
- **Dark & Stage Themes**: Deep pitch black (`#000000`) with high-contrast electric cyan and amber accents designed for dimly lit stages.

---

## 🔒 Notes & Browser Limitations

1. **Audio Autoplay Policy**: Modern mobile browsers (iOS Safari, Android Chrome) require a user gesture (such as tapping Play or Tap Tempo) before audio can play. The application automatically initializes and resumes the Web Audio context upon the first user interaction.
2. **Local Storage**: Saved data is device and browser-specific. To synchronize between different phones or laptops, use the **Export JSON** and **Import JSON** buttons in Settings.
3. **Screen Wake Lock**: Available in all modern browsers (Chrome, Edge, Safari 16.4+). If unsupported by an older browser, playback operates normally without raising errors.
