import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface IntroAnimationProps {
  onComplete: () => void;
}

const LOGO_LETTERS = [
  { id: 'V', src: '/letters/letter_V.png', origin: '13.26% 49.17%', pulseDelay: 0.05, travelDelay: 0.00 },
  { id: 'e', src: '/letters/letter_e.png', origin: '33.49% 55.78%', pulseDelay: 0.18, travelDelay: 0.035 },
  { id: 'n1', src: '/letters/letter_n1.png', origin: '50.97% 59.74%', pulseDelay: 0.31, travelDelay: 0.070 },
  { id: 'n2', src: '/letters/letter_n2.png', origin: '69.51% 60.23%', pulseDelay: 0.44, travelDelay: 0.105 },
  { id: 'z', src: '/letters/letter_z.png', origin: '88.16% 43.07%', pulseDelay: 0.57, travelDelay: 0.140 },
];

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const logoContainerRef = useRef<HTMLDivElement>(null);

  // Phases:
  // 'wave': complete logo visible in center, letters sequentially pulse V -> e -> n -> n -> z in a continuous flowing wave
  // 'traveling': individual letters physically travel with elegant stagger into Welcome page logo position
  const [phase, setPhase] = useState<'wave' | 'traveling'>('wave');
  const [travel, setTravel] = useState<{ deltaX: number; deltaY: number; scale: number }>({
    deltaX: 0,
    deltaY: 0,
    scale: 1,
  });

  const isCompletedRef = useRef(false);

  const initiateTravel = () => {
    if (isCompletedRef.current) return;

    // Measure exact target logo bounding rect on the Welcome page
    const targetEl = document.getElementById('welcome-vennz-logo-inner');
    const introEl = logoContainerRef.current;

    let dX = 0;
    let dY = -70; // Sensible default upward shift if measurement unavailable
    let sc = 1;

    if (targetEl && introEl) {
      const targetRect = targetEl.getBoundingClientRect();
      const introRect = introEl.getBoundingClientRect();

      if (targetRect.width > 0 && introRect.width > 0) {
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const introCenterX = introRect.left + introRect.width / 2;
        const introCenterY = introRect.top + introRect.height / 2;

        dX = targetCenterX - introCenterX;
        dY = targetCenterY - introCenterY;
        sc = targetRect.width / introRect.width;
      }
    }

    setTravel({ deltaX: dX, deltaY: dY, scale: sc });
    setPhase('traveling');

    // Letter Z travel finishes at travelDelay (0.14s) + duration (0.85s) = 0.99s.
    // Allow letters to firmly dock into final position before triggering handover.
    setTimeout(() => {
      if (!isCompletedRef.current) {
        isCompletedRef.current = true;
        onComplete();
      }
    }, 1020);
  };

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isCompletedRef.current) {
      isCompletedRef.current = true;
      onComplete();
    }
  };

  useEffect(() => {
    // Wave pulse starts immediately at 0.05s and flows across all letters by ~1.05s.
    // Settle unified briefly, then initiate travel at 1280ms.
    const travelTimer = setTimeout(() => {
      initiateTravel();
    }, 1280);

    return () => {
      clearTimeout(travelTimer);
    };
  }, []);

  // Clean, seamless background matching the theme — zero colorful screen flash
  const bgGradient = isDark ? '#140E1C' : '#FAF1F3';

  const skipColor = isDark ? 'rgba(249, 170, 173, 0.7)' : 'rgba(104, 58, 70, 0.7)';
  const skipHover = isDark ? '#FDF3F5' : '#462037';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VennZ Intro"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        pointerEvents: phase === 'traveling' ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes vennzWavePulse {
          0% {
            transform: scale(1);
          }
          38% {
            transform: scale(1.22);
          }
          72% {
            transform: scale(0.97);
          }
          100% {
            transform: scale(1);
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
          opacity: phase === 'traveling' ? 0 : 1,
          transition: 'opacity 0.82s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ── Venn Diagram circles (brand-toned, ambient) ── */}
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
          {/* Left circle */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(220px, 38vw, 420px)',
              height: 'clamp(220px, 38vw, 420px)',
              borderRadius: '50%',
              border: isDark
                ? '1.5px solid rgba(161, 82, 95, 0.22)'
                : '1.5px solid rgba(161, 82, 95, 0.18)',
              backgroundColor: isDark
                ? 'rgba(70, 32, 55, 0.10)'
                : 'rgba(199, 87, 124, 0.05)',
              transform: 'translateX(calc(-1 * clamp(45px, 8vw, 80px)))',
              transition: 'opacity 0.6s ease',
            }}
          />
          {/* Right circle */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(220px, 38vw, 420px)',
              height: 'clamp(220px, 38vw, 420px)',
              borderRadius: '50%',
              border: isDark
                ? '1.5px solid rgba(161, 82, 95, 0.22)'
                : '1.5px solid rgba(161, 82, 95, 0.18)',
              backgroundColor: isDark
                ? 'rgba(70, 32, 55, 0.10)'
                : 'rgba(199, 87, 124, 0.05)',
              transform: 'translateX(clamp(45px, 8vw, 80px))',
              transition: 'opacity 0.6s ease',
            }}
          />
          {/* Intersection glow */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(80px, 14vw, 160px)',
              height: 'clamp(180px, 32vw, 360px)',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(161, 82, 95, 0.13) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(199, 87, 124, 0.08) 0%, transparent 70%)',
              filter: 'blur(14px)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Clean, subtle atmospheric vignette matching the cinematic theme */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'radial-gradient(circle at 50% 35%, rgba(70, 32, 55, 0.18) 0%, transparent 65%)'
              : 'radial-gradient(circle at 50% 30%, rgba(199, 87, 124, 0.08) 0%, transparent 65%)',
          }}
        />

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
      {/* 2. DYNAMIC LOGO TRAVEL LAYER                             */}
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
            width: 'clamp(280px, 48vw, 440px)',
            aspectRatio: '984 / 303',
            transformOrigin: 'center center',
          }}
        >
          {/* Letter drop-shadow layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
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
            {LOGO_LETTERS.map((letter) => {
              const isTraveling = phase === 'traveling';
              return (
                <div
                  key={letter.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    transform: isTraveling
                      ? `translate3d(${travel.deltaX}px, ${travel.deltaY}px, 0) scale(${travel.scale})`
                      : 'translate3d(0, 0, 0) scale(1)',
                    transition: isTraveling
                      ? `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${letter.travelDelay}s`
                      : 'none',
                    willChange: 'transform',
                    pointerEvents: 'none',
                  }}
                >
                  <img
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
                      zIndex: 2,
                      animation:
                        phase === 'wave'
                          ? `vennzWavePulse 0.48s cubic-bezier(0.34, 1.4, 0.64, 1) ${letter.pulseDelay}s 1 forwards`
                          : 'none',
                      willChange: 'transform, opacity',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
