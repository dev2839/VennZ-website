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
  // 'traveling': letters physically travel in formation toward their exact Welcome page coordinates
  const [phase, setPhase] = useState<'wave' | 'traveling'>('wave');
  const [travel, setTravel] = useState<{
    deltaX: number;
    deltaY: number;
    scale: number;
  } | null>(null);

  const initiateTravel = () => {
    if (phase === 'traveling') return;

    // Find the exact location of the VennZ logo on the Welcome page
    const targetEl =
      document.getElementById('welcome-vennz-logo-img') ||
      document.getElementById('welcome-vennz-logo-inner') ||
      document.getElementById('welcome-vennz-logo-target');
    const introEl = logoContainerRef.current;

    if (targetEl && introEl) {
      const targetRect = targetEl.getBoundingClientRect();
      const introRect = introEl.getBoundingClientRect();

      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const introCenterX = introRect.left + introRect.width / 2;
      const introCenterY = introRect.top + introRect.height / 2;

      const deltaX = targetCenterX - introCenterX;
      const deltaY = targetCenterY - introCenterY;
      const scale = introRect.width > 0 ? targetRect.width / introRect.width : 0.88;

      setTravel({ deltaX, deltaY, scale });
    } else {
      // Natural responsive fallback toward the upper-hero center
      setTravel({
        deltaX: 0,
        deltaY: -(window.innerHeight * 0.16),
        scale: 0.88,
      });
    }

    setPhase('traveling');

    // Exactly when the letters settle into their final position on the Welcome page
    setTimeout(() => {
      onComplete();
    }, 820);
  };

  const handleSkip = () => {
    if (phase === 'traveling') return;
    initiateTravel();
  };

  useEffect(() => {
    // Letter pulse wave timeline:
    // V: 0.15s - 0.55s
    // e: 0.35s - 0.75s
    // n1: 0.55s - 0.95s
    // n2: 0.75s - 1.15s
    // z: 0.95s - 1.35s
    // Wave completes at 1.35s. Let complete logo rest unified for ~270ms.
    // At 1.62s, physically transition letters to their Welcome page position.
    const waveEndTimer = setTimeout(() => {
      initiateTravel();
    }, 1620);

    return () => {
      clearTimeout(waveEndTimer);
    };
  }, []);

  // Ambient themes
  const bgGradient = isDark
    ? 'linear-gradient(180deg, #180917 0%, #140813 50%, #100610 100%)'
    : 'linear-gradient(180deg, #F0E3EE 0%, #F5ECF4 45%, #F3EBF2 100%)';

  const skipColor = isDark ? 'rgba(243, 238, 233, 0.55)' : 'rgba(73, 40, 61, 0.6)';
  const skipHover = isDark ? '#FFFFFF' : 'var(--color-mulberry)';

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
        pointerEvents: phase === 'traveling' ? 'none' : 'auto',
        cursor: phase === 'traveling' ? 'default' : 'pointer',
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
      {/* 1. INTRO BACKDROP LAYER (Fades smoothly away during travel) */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: bgGradient,
          opacity: phase === 'traveling' ? 0 : 1,
          transition: 'opacity 0.80s cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: 'none',
        }}
      >
        {/* Subtle Atmospheric Light Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'radial-gradient(circle at 50% 20%, rgba(139, 44, 116, 0.25) 0%, transparent 65%)'
              : 'radial-gradient(circle at 50% 18%, rgba(185, 135, 188, 0.16) 0%, rgba(248, 240, 247, 0.3) 65%, transparent 100%)',
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
            opacity: phase === 'traveling' ? 0 : 1,
            transition: 'opacity 0.60s ease',
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
                ? '1.5px solid rgba(215, 175, 210, 0.18)'
                : '1.5px solid rgba(139, 44, 116, 0.14)',
              backgroundColor: isDark
                ? 'rgba(107, 45, 102, 0.05)'
                : 'rgba(183, 142, 184, 0.04)',
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
                ? '1.5px solid rgba(235, 195, 225, 0.18)'
                : '1.5px solid rgba(139, 44, 116, 0.14)',
              backgroundColor: isDark
                ? 'rgba(73, 40, 61, 0.05)'
                : 'rgba(183, 142, 184, 0.04)',
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
                ? 'radial-gradient(ellipse at center, rgba(215, 175, 210, 0.14) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(139, 44, 116, 0.10) 0%, transparent 70%)',
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
            opacity: phase === 'traveling' ? 0 : 0.85,
            pointerEvents: phase === 'traveling' ? 'none' : 'auto',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = skipHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = skipColor)}
        >
          Skip
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. PHYSICAL TRAVELING LOGO LAYER (Remains 100% OPAQUE)  */}
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
            transform: travel
              ? `translate3d(${travel.deltaX}px, ${travel.deltaY}px, 0) scale(${travel.scale})`
              : 'translate3d(0, 0, 0) scale(1)',
            transition: travel
              ? 'transform 0.82s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
            transformOrigin: 'center center',
            willChange: 'transform',
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
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(139, 44, 116, 0.35) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at center, rgba(73, 40, 61, 0.28) 0%, transparent 70%)',
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
                    'drop-shadow(0 26px 45px rgba(25, 5, 22, 0.6))',
                  ].join(' ')
                : [
                    'drop-shadow(0 3px 5px rgba(73, 40, 61, 0.35))',
                    'drop-shadow(0 12px 22px rgba(73, 40, 61, 0.18))',
                    'drop-shadow(0 0 20px rgba(183, 142, 184, 0.2))',
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
