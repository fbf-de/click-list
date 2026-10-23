import React, { useState, useRef, useCallback } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface TapTempoButtonProps {
  onBpmChange: (bpm: number) => void;
  className?: string;
  label?: string;
}

export const TapTempoButton: React.FC<TapTempoButtonProps> = ({
  onBpmChange,
  className = '',
  label = 'TAP TEMPO'
}) => {
  const [tapCount, setTapCount] = useState<number>(0);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const tapTimesRef = useRef<number[]>([]);
  const resetTimeoutRef = useRef<number | null>(null);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const now = performance.now();

      // Play soft click feedback
      audioEngine.previewClick('beep', false);

      setIsTapping(true);

      // Clear any pending reset
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }

      const times = tapTimesRef.current;
      times.push(now);

      // Keep only recent taps (last 5)
      if (times.length > 5) {
        times.shift();
      }

      setTapCount(times.length);

      if (times.length >= 2) {
        // Calculate average interval
        const intervals: number[] = [];
        for (let i = 1; i < times.length; i++) {
          intervals.push(times[i] - times[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);

        if (calculatedBpm >= 20 && calculatedBpm <= 320) {
          onBpmChange(calculatedBpm);
        }
      }

      // Reset tap detection after 2.2 seconds of inactivity
      resetTimeoutRef.current = window.setTimeout(() => {
        tapTimesRef.current = [];
        setTapCount(0);
        setIsTapping(false);
      }, 2200);
    },
    [onBpmChange]
  );

  return (
    <button
      type="button"
      onClick={handleTap}
      className={`btn btn-secondary ${className} ${isTapping ? 'border-cyan' : ''}`}
      style={{
        userSelect: 'none',
        touchAction: 'manipulation',
        minWidth: '110px'
      }}
      title="Tap in tempo to set BPM"
    >
      <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em' }}>
        {label} {tapCount > 1 ? `(${tapCount})` : ''}
      </span>
    </button>
  );
};
