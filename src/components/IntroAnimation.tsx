import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface IntroAnimationProps {
  onComplete: () => void;
  /** Display duration in ms before starting exit fade */
  duration?: number;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  duration = 2100,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Phases:
  // 1. 'initial': pre-mount resting state
  // 2. 'reveal': Venn diagram circles confluence into center, logo gently settles
  // 3. 'shimmer': specular light wave sweeps through the 3D logo
  // 4. 'exiting': buttery smooth crossfade dissolve into the welcome page
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'shimmer' | 'exiting'>('initial');

  const handleSkip = () => {
    if (phase === 'exiting') return;
    setPhase('exiting');
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  useEffect(() => {
    // Start reveal with elegant easing
    const startTimer = setTimeout(() => {
      setPhase('reveal');
    }, 40);

    // Specular shimmer sweep across the 3D logo
    const shimmerTimer = setTimeout(() => {
      setPhase('shimmer');
    }, 700);

    // Exit transition
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, duration);

    // Unmount
    const finishTimer = setTimeout(() => {
      onComplete();
    }, duration + 650);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(shimmerTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onComplete]);

  // Color schemes matching the welcome page ambient palette exactly
  const bgGradient = isDark
    ? 'linear-gradient(180deg, #180917 0%, #140813 50%, #100610 100%)'
    : 'linear-gradient(180deg, #FAF4F8 0%, #F5EEF4 45%, #FAF6F0 100%)';

  // Venn diagram circle styling (faint, geometric, interconnected)
  const vennStrokeA = isDark ? 'rgba(215, 175, 210, 0.22)' : 'rgba(107, 45, 102, 0.18)';
  const vennFillA = isDark ? 'rgba(107, 45, 102, 0.08)' : 'rgba(107, 45, 102, 0.04)';

  const vennStrokeB = isDark ? 'rgba(235, 195, 225, 0.2)' : 'rgba(139, 44, 116, 0.16)';
  const vennFillB = isDark ? 'rgba(73, 40, 61, 0.08)' : 'rgba(73, 40, 61, 0.04)';

  const ambientGlow = isDark
    ? 'radial-gradient(circle at center, rgba(145, 45, 125, 0.32) 0%, rgba(68, 20, 60, 0.15) 42%, transparent 72%)'
    : 'radial-gradient(circle at center, rgba(200, 145, 185, 0.3) 0%, rgba(225, 195, 215, 0.18) 42%, transparent 72%)';

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
      {/* Subtle Atmospheric Light Vignette & Soft Radiance (Top purple to bottom cream enhancer) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(circle at 50% 20%, rgba(139, 44, 116, 0.28) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 18%, rgba(175, 115, 160, 0.22) 0%, rgba(250, 245, 238, 0.3) 65%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Pulsing Aura Backdrop behind logo */}
      <div
        style={{
          position: 'absolute',
          width: 'min(900px, 95vw)',
          height: 'min(900px, 95vw)',
          borderRadius: '50%',
          background: ambientGlow,
          filter: 'blur(70px)',
          transform: phase === 'initial' ? 'scale(0.5)' : 'scale(1.05)',
          transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.8s ease',
          opacity: phase === 'exiting' ? 0.3 : 1,
          pointerEvents: 'none',
        }}
      />

      {/* --- MINIMAL FAINT VENN DIAGRAM IN BACKGROUND --- */}
      <div
        style={{
          position: 'absolute',
          width: 'min(820px, 94vw)',
          height: 'min(500px, 62vh)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: phase === 'initial' ? 0 : phase === 'exiting' ? 0 : 0.9,
          transition: 'opacity 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Venn Circle Left */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(270px, 44vw, 460px)',
            height: 'clamp(270px, 44vw, 460px)',
            borderRadius: '50%',
            border: `1.5px solid ${vennStrokeA}`,
            backgroundColor: vennFillA,
            transform:
              phase === 'initial'
                ? 'translateX(-115px) scale(0.85)'
                : 'translateX(-95px) scale(1)',
            transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(1.5px)',
            boxShadow: isDark
              ? 'inset 0 0 45px rgba(107, 45, 102, 0.16)'
              : 'inset 0 0 40px rgba(160, 100, 145, 0.18)',
          }}
        />

        {/* Venn Circle Right */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(270px, 44vw, 460px)',
            height: 'clamp(270px, 44vw, 460px)',
            borderRadius: '50%',
            border: `1.5px solid ${vennStrokeB}`,
            backgroundColor: vennFillB,
            transform:
              phase === 'initial'
                ? 'translateX(115px) scale(0.85)'
                : 'translateX(95px) scale(1)',
            transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(1.5px)',
            boxShadow: isDark
              ? 'inset 0 0 45px rgba(139, 44, 116, 0.16)'
              : 'inset 0 0 40px rgba(160, 100, 145, 0.18)',
          }}
        />

        {/* Venn Intersection Subtle Radial Focus Accent */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(150px, 26vw, 260px)',
            height: 'clamp(210px, 34vw, 340px)',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(ellipse at center, rgba(215, 175, 210, 0.16) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(139, 44, 116, 0.12) 0%, transparent 70%)',
            filter: 'blur(16px)',
            transform:
              phase === 'initial'
                ? 'scale(0.7)'
                : 'scale(1)',
            transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* --- MAIN HERO: 3D EMBOSSED PERSPECTIVE VENNZ LOGO --- */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '92vw',
          zIndex: 10,
          perspective: '1200px',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '28px',
            padding: '28px 48px',
            transformStyle: 'preserve-3d',
            transform:
              phase === 'initial'
                ? 'perspective(1200px) scale(0.92) translateY(14px)'
                : 'perspective(1200px) scale(1) translateY(0)',
            opacity: phase === 'initial' ? 0 : 1,
            transition:
              'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease',
          }}
        >
          {/* Deep 3D Realistic Cast Ground Shadow underneath the 3D lettering */}
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '8%',
              right: '8%',
              height: '42px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9) 0%, rgba(85, 20, 75, 0.5) 45%, transparent 80%)'
                : 'radial-gradient(ellipse at center, rgba(60, 20, 50, 0.38) 0%, rgba(139, 44, 116, 0.22) 45%, transparent 80%)',
              filter: 'blur(18px)',
              transform:
                phase === 'initial'
                  ? 'scale(0.8) translateY(8px)'
                  : 'scale(1) translateY(0)',
              transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 3D Multi-Layered Extrusion & Bevel Illumination for High Contrast Logo Clarity */}
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
            {/* VennZ Logo Image */}
            <img
              src="/vennz-logo.png"
              alt="VennZ"
              style={{
                display: 'block',
                width: 'clamp(300px, 60vw, 660px)',
                height: 'auto',
                maxHeight: 'clamp(100px, 24vh, 195px)',
                objectFit: 'contain',
                userSelect: 'none',
                transform: 'translateZ(20px)',
              }}
            />

            {/* Trending Prismatic Specular Shimmer Beam across 3D face */}
            <div
              style={{
                position: 'absolute',
                top: '-35%',
                bottom: '-35%',
                left: 0,
                width: '60%',
                background: isDark
                  ? 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.92) 50%, rgba(255, 220, 245, 0.95) 53%, rgba(255, 255, 255, 0.3) 65%, transparent 85%)'
                  : 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.4) 35%, rgba(255, 255, 255, 0.98) 50%, rgba(245, 230, 240, 0.95) 53%, rgba(255, 255, 255, 0.5) 65%, transparent 85%)',
                mixBlendMode: isDark ? 'screen' : 'overlay',
                transform:
                  phase === 'initial' || phase === 'reveal'
                    ? 'translateX(-160%) skewX(-20deg)'
                    : 'translateX(260%) skewX(-20deg)',
                transition: 'transform 1.9s cubic-bezier(0.2, 0.8, 0.2, 1)',
                pointerEvents: 'none',
              }}
            />
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
          opacity: phase === 'initial' ? 0 : 0.85,
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
