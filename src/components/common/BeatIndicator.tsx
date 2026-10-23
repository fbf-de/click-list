import React from 'react';

interface BeatIndicatorProps {
  totalBeats: number;
  currentBeat: number;
  isPlaying: boolean;
  accentFirstBeat: boolean;
  size?: 'normal' | 'large';
}

export const BeatIndicator: React.FC<BeatIndicatorProps> = ({
  totalBeats,
  currentBeat,
  isPlaying,
  accentFirstBeat,
  size = 'normal'
}) => {
  const safeTotalBeats = Math.max(1, Math.min(16, totalBeats));
  const dots = Array.from({ length: safeTotalBeats }, (_, i) => i);

  const dotSize = size === 'large' ? 32 : 20;

  return (
    <div
      className="beat-dots-container"
      style={{
        gap: size === 'large' ? '16px' : '10px',
        padding: size === 'large' ? '16px 0' : '8px 0'
      }}
      role="status"
      aria-label={`Beat ${isPlaying ? currentBeat + 1 : 0} of ${safeTotalBeats}`}
    >
      {dots.map((index) => {
        const isCurrent = isPlaying && currentBeat === index;
        const isFirst = index === 0;
        const isAccent = isCurrent && isFirst && accentFirstBeat;

        return (
          <div
            key={index}
            className={`beat-dot ${isFirst ? 'is-first' : ''} ${isCurrent ? 'active' : ''} ${
              isAccent ? 'is-accent' : ''
            }`}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              position: 'relative'
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size === 'large' ? '0.8rem' : '0.65rem',
                fontWeight: 700,
                color: isCurrent ? '#000000' : 'var(--text-muted)'
              }}
            >
              {index + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
};
