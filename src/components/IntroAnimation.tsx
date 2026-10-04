import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface IntroAnimationProps {
  onComplete: () => void;
}

const LOGO_LETTERS = [
  { id: 'V', src: '/letters/letter_V.png', origin: '13.26% 49.17%', delay: 0.15 },
  { id: 'e', src: '/letters/letter_e.png', origin: '33.49% 55.78%', delay: 0.35 },
  { id: 'n1', src: '/letters/letter_n1.png', origin: '50.97% 59.74%', delay: 0.55 },
  { id: 'n2', src: '/letters/letter_n2.png', origin: '69.51% 60.23%', delay: 0.75 },
  { id: 'z', src: '/letters/letter_z.png', origin: '88.16% 43.07%', delay: 0.95 },
];

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const logoContainerRef = useRef<HTMLDivElement>(null);

  // Phases:
  // 'wave': complete logo visible in center, letters sequentially pulse V -> e -> n -> n -> z in a continuous flowing wave
  // 'dissolving': intro overlay smoothly dissolves in place, keeping the logo perfectly stationary without moving/jumping
  const [phase, setPhase] = useState<'wave' | 'dissolving'>('wave');

  const initiateComplete = () => {
    if (phase === 'dissolving') return;
    setPhase('dissolving');

    // Smoothly complete after fade duration without any coordinate translation
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleSkip = () => {
    initiateComplete();
  };

  useEffect(() => {
    // Letter pulse wave timeline:
    // Wave completes around 1.35s. Let complete logo rest unified for ~250ms.
    // At 1.6s, smoothly dissolve the intro overlay in place (NO coordinate movement).
    const waveEndTimer = setTimeout(() => {
      initiateComplete();
    }, 1600);

    return () => {
      clearTimeout(waveEndTimer);
    };
  }, []);

  // Ambient themes
  const bgGradient = isDark
    ? 'linear-gradient(180deg, #140E1C 0%, #462037 50%, #140E1C 100%)'
    : 'linear-gradient(180deg, #FBF3F5 0%, #ECD1D8 50%, #FAF1F3 100%)';

  const skipColor = isDark ? 'rgba(249, 170, 173, 0.7)' : 'rgba(104, 58, 70, 0.7)';
  const skipHover = isDark ? '#FDF3F5' : '#462037';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VennZ Intro"
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        pointerEvents: phase === 'dissolving' ? 'none' : 'auto',
        cursor: phase === 'dissolving' ? 'default' : 'pointer',
        opacity: phase === 'dissolving' ? 0 : 1,
        transition: 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <style>{`
        @keyframes vennzWavePulse {
          0% {
            transform: scale(1);
            z-index: 2;
          }
          50% {
            transform: scale(1.18);
            z-index: 10;
          }
          100% {
            transform: scale(1);
            z-index: 2;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. INTRO BACKDROP LAYER (Seamless ambient atmosphere)   */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: bgGradient,
          pointerEvents: 'none',
        }}
      >
        {/* Subtle Atmospheric Light Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'radial-gradient(circle at 50% 20%, rgba(104, 58, 70, 0.35) 0%, transparent 65%)'
              : 'radial-gradient(circle at 50% 18%, rgba(199, 87, 124, 0.18) 0%, rgba(250, 241, 243, 0.3) 65%, transparent 100%)',
          }}
        />

        {/* Subtle, Elegant Venn-Diagram Overlapping Circles in Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Left Venn Circle */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(260px, 38vw, 380px)',
              height: 'clamp(260px, 38vw, 380px)',
              borderRadius: '50%',
              border: isDark
                ? '1.5px solid rgba(161, 82, 95, 0.25)'
                : '1.5px solid rgba(199, 87, 124, 0.2)',
              backgroundColor: isDark
                ? 'rgba(70, 32, 55, 0.12)'
                : 'rgba(249, 170, 173, 0.08)',
              transform: 'translateX(-75px)',
            }}
          />

          {/* Right Venn Circle */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(260px, 38vw, 380px)',
              height: 'clamp(260px, 38vw, 380px)',
              borderRadius: '50%',
              border: isDark
                ? '1.5px solid rgba(199, 87, 124, 0.25)'
                : '1.5px solid rgba(199, 87, 124, 0.2)',
              backgroundColor: isDark
                ? 'rgba(104, 58, 70, 0.12)'
                : 'rgba(249, 170, 173, 0.08)',
              transform: 'translateX(75px)',
            }}
          />

          {/* Venn Intersection Center Glow */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(140px, 22vw, 220px)',
              height: 'clamp(190px, 28vw, 290px)',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(249, 170, 173, 0.12) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(199, 87, 124, 0.12) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
        </div>

        {/* Accessible Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
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
            opacity: phase === 'dissolving' ? 0 : 0.85,
            pointerEvents: phase === 'dissolving' ? 'none' : 'auto',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = skipHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = skipColor)}
        >
          Skip
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. STATIONARY LOGO LAYER (Rock-solid in place, 0 movement) */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div
          ref={logoContainerRef}
          style={{
            position: 'relative',
            width: 'clamp(280px, 50vw, 480px)',
            aspectRatio: '984 / 303',
            transform: 'translate3d(0, 0, 0) scale(1)',
            transformOrigin: 'center center',
          }}
        >
          {/* Subtle Ground Depth Shadow matching Welcome page */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '10%',
              right: '10%',
              height: '24px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(104, 58, 70, 0.35) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at center, rgba(161, 82, 95, 0.25) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 3D Multi-Layered Depth Shadow and Perspective Tilt */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transform: 'perspective(1000px) rotateX(4deg) translateZ(8px)',
              transformStyle: 'preserve-3d',
              zIndex: 2,
              filter: isDark
                ? [
                    'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.9))',
                    'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.85))',
                    'drop-shadow(0 26px 45px rgba(20, 14, 28, 0.7))',
                    'drop-shadow(0 0 20px rgba(161, 82, 95, 0.25))',
                  ].join(' ')
                : [
                    'drop-shadow(0 3px 5px rgba(70, 32, 55, 0.3))',
                    'drop-shadow(0 12px 22px rgba(104, 58, 70, 0.16))',
                    'drop-shadow(0 0 20px rgba(199, 87, 124, 0.18))',
                  ].join(' '),
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
                  animation:
                    phase === 'wave'
                      ? `vennzWavePulse 0.40s cubic-bezier(0.42, 0, 0.58, 1) ${letter.delay}s 1 normal both`
                      : 'none',
                  willChange: 'transform',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
