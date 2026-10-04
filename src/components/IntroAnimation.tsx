import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface IntroAnimationProps {
  onComplete: () => void;
  /** Display duration in ms before starting exit fade */
  duration?: number;
}

const LOGO_LETTERS = [
  { id: 'V', src: '/letters/letter_V.png', origin: '13.26% 49.17%', delay: 0.18 },
  { id: 'e', src: '/letters/letter_e.png', origin: '33.49% 55.78%', delay: 0.52 },
  { id: 'n1', src: '/letters/letter_n1.png', origin: '50.97% 59.74%', delay: 0.86 },
  { id: 'n2', src: '/letters/letter_n2.png', origin: '69.51% 60.23%', delay: 1.20 },
  { id: 'z', src: '/letters/letter_z.png', origin: '88.16% 43.07%', delay: 1.54 },
];

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  duration = 2250,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Phases:
  // 'visible': complete logo visible from start, letters pulse sequentially V -> e -> n -> n -> z
  // 'exiting': buttery smooth crossfade dissolve into the welcome page
  const [phase, setPhase] = useState<'visible' | 'exiting'>('visible');

  const handleSkip = () => {
    if (phase === 'exiting') return;
    setPhase('exiting');
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  useEffect(() => {
    // Exit transition starts after the letter pulse wave has completed and rested
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, duration);

    // Unmount and hand off to main welcome page
    const finishTimer = setTimeout(() => {
      onComplete();
    }, duration + 650);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onComplete]);

  // Color schemes: soft subtle purple nuance in light mode, deep twilight in dark mode
  const bgGradient = isDark
    ? 'linear-gradient(180deg, #180917 0%, #140813 50%, #100610 100%)'
    : 'linear-gradient(180deg, #F0E3EE 0%, #F5ECF4 45%, #F3EBF2 100%)';

  const skipColor = isDark ? 'rgba(243, 238, 233, 0.55)' : 'rgba(73, 40, 61, 0.6)';
  const skipHover = isDark ? '#FFFFFF' : 'var(--color-mulberry)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VennZ"
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: bgGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: phase === 'exiting' ? 0 : 1,
        pointerEvents: phase === 'exiting' ? 'none' : 'auto',
        perspective: '1200px',
        cursor: 'pointer',
      }}
    >
      <style>{`
        @keyframes vennzLetterWave {
          0% {
            transform: scale(1);
            z-index: 2;
          }
          50% {
            transform: scale(1.17);
            z-index: 10;
          }
          100% {
            transform: scale(1);
            z-index: 2;
          }
        }
      `}</style>

      {/* Subtle Atmospheric Light Vignette (Soft background glow, no floating circles or discs) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 20%, rgba(139, 44, 116, 0.25) 0%, transparent 65%)'
            : 'radial-gradient(ellipse at 50% 18%, rgba(185, 135, 188, 0.16) 0%, rgba(248, 240, 247, 0.3) 65%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* --- MAIN HERO: TASTEFULLY PROPORTIONED VENNZ LOGO WITH SEQUENTIAL LETTER PULSE --- */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '92vw',
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 36px',
          }}
        >
          {/* Subtle Ground Depth Shadow */}
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '6%',
              right: '6%',
              height: '32px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(85, 20, 75, 0.35) 45%, transparent 80%)'
                : 'radial-gradient(ellipse at center, rgba(60, 20, 50, 0.28) 0%, rgba(139, 44, 116, 0.14) 45%, transparent 80%)',
              filter: 'blur(14px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 3D Multi-Layered Extrusion & Depth Shadows */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              filter: isDark
                ? [
                    'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.9))',
                    'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.85))',
                    'drop-shadow(0 26px 45px rgba(25, 5, 22, 0.6))',
                  ].join(' ')
                : [
                    'drop-shadow(0 3px 5px rgba(73, 40, 61, 0.35))',
                    'drop-shadow(0 12px 22px rgba(73, 40, 61, 0.18))',
                    'drop-shadow(0 0 20px rgba(183, 142, 184, 0.2))',
                  ].join(' '),
              transition: 'filter 1.2s ease',
            }}
          >
            {/* Complete VennZ Logo Canvas with Letter-by-Letter Wave Animation */}
            <div
              style={{
                position: 'relative',
                width: 'clamp(240px, 46vw, 480px)',
                maxHeight: 'clamp(80px, 16vh, 148px)',
                aspectRatio: '984 / 303',
                overflow: 'visible',
              }}
            >
              {LOGO_LETTERS.map((letter) => (
                <img
                  key={letter.id}
                  src={letter.src}
                  alt={letter.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    transformOrigin: letter.origin,
                    transform: 'scale(1)',
                    zIndex: 2,
                    animation: `vennzLetterWave 0.34s cubic-bezier(0.42, 0, 0.58, 1) ${letter.delay}s 1 normal both`,
                    willChange: 'transform',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Skip Button */}
      <button
        type="button"
        onClick={onComplete}
        style={{
          position: 'absolute',
          bottom: '36px',
          background: 'transparent',
          border: 'none',
          color: skipColor,
          fontSize: '11.5px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          padding: '8px 18px',
          borderRadius: '999px',
          transition: 'color 0.25s ease, opacity 0.3s ease',
          opacity: 0.85,
          zIndex: 20,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = skipHover)}
        onMouseLeave={(e) => (e.currentTarget.style.color = skipColor)}
      >
        Skip
      </button>
    </div>
  );
};

export default IntroAnimation;
