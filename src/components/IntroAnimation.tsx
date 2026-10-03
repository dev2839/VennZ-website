import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface IntroAnimationProps {
  onComplete: () => void;
  /** Display duration in ms before starting exit fade */
  duration?: number;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  duration = 3400,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Phases:
  // 1. 'initial': pre-mount resting state
  // 2. 'reveal': Venn circles drift into convergence, logo rises in 3D perspective
  // 3. 'shimmer': specular shimmer sweep & subtle 3D highlight shift
  // 4. 'exiting': seamless scale towards camera and fade out
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'shimmer' | 'exiting'>('initial');

  useEffect(() => {
    // Start reveal with elegant easing
    const startTimer = setTimeout(() => {
      setPhase('reveal');
    }, 80);

    // Specular shimmer sweep across the 3D logo
    const shimmerTimer = setTimeout(() => {
      setPhase('shimmer');
    }, 1100);

    // Exit transition
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, duration);

    // Unmount
    const finishTimer = setTimeout(() => {
      onComplete();
    }, duration + 850);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(shimmerTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onComplete]);

  // Color schemes:
  // Light: Rich warm luxurious cream (#F5EFE6)
  // Dark: Deep nocturnal mulberry-black (#0B070A)
  const bgColor = isDark ? '#0B070A' : '#F5EFE6';
  
  // Minimal Venn diagram circle styling (faint, geometric, interconnected)
  const vennStrokeA = isDark ? 'rgba(215, 175, 210, 0.16)' : 'rgba(107, 45, 102, 0.15)';
  const vennFillA = isDark ? 'rgba(107, 45, 102, 0.05)' : 'rgba(107, 45, 102, 0.035)';
  
  const vennStrokeB = isDark ? 'rgba(235, 195, 225, 0.14)' : 'rgba(139, 44, 116, 0.13)';
  const vennFillB = isDark ? 'rgba(73, 40, 61, 0.06)' : 'rgba(73, 40, 61, 0.03)';

  const ambientGlow = isDark
    ? 'radial-gradient(circle at center, rgba(139, 44, 116, 0.42) 0%, rgba(68, 20, 60, 0.20) 40%, rgba(11, 7, 10, 0) 74%)'
    : 'radial-gradient(circle at center, rgba(210, 160, 195, 0.42) 0%, rgba(235, 215, 225, 0.25) 45%, rgba(245, 239, 230, 0) 75%)';

  const skipColor = isDark ? 'rgba(243, 238, 233, 0.45)' : 'rgba(73, 40, 61, 0.45)';
  const skipHover = isDark ? '#FFFFFF' : 'var(--color-mulberry)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VennZ"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'exiting' ? 0 : 1,
        transform: phase === 'exiting' ? 'scale(1.06)' : 'scale(1)',
        pointerEvents: phase === 'exiting' ? 'none' : 'auto',
        perspective: '1200px',
      }}
    >
      {/* Delicate Micro-Grain / Atmospheric Gradient Mesh Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 40%, rgba(35, 14, 30, 0.8) 0%, rgba(11, 7, 10, 1) 100%)'
            : 'radial-gradient(ellipse at 50% 40%, rgba(255, 252, 247, 0.95) 0%, rgba(245, 239, 230, 1) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Pulsing Aura Backdrop */}
      <div
        style={{
          position: 'absolute',
          width: 'min(900px, 95vw)',
          height: 'min(900px, 95vw)',
          borderRadius: '50%',
          background: ambientGlow,
          filter: 'blur(65px)',
          transform: phase === 'initial' ? 'scale(0.5)' : phase === 'exiting' ? 'scale(1.35)' : 'scale(1.08)',
          transition: 'transform 3.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.5s ease',
          opacity: phase === 'exiting' ? 0 : 1,
          pointerEvents: 'none',
        }}
      />

      {/* --- MINIMAL FAINT VENN DIAGRAM REFERENCE IN BACKGROUND --- */}
      <div
        style={{
          position: 'absolute',
          width: 'min(780px, 92vw)',
          height: 'min(480px, 60vh)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: phase === 'initial' ? 0 : phase === 'exiting' ? 0 : 0.85,
          transition: 'opacity 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Venn Circle Left */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(260px, 42vw, 440px)',
            height: 'clamp(260px, 42vw, 440px)',
            borderRadius: '50%',
            border: `1.5px solid ${vennStrokeA}`,
            backgroundColor: vennFillA,
            transform:
              phase === 'initial'
                ? 'translateX(-110px) scale(0.85)'
                : phase === 'exiting'
                ? 'translateX(-130px) scale(1.15)'
                : 'translateX(-95px) scale(1)',
            transition: 'transform 3.4s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(1px)',
            boxShadow: isDark
              ? 'inset 0 0 40px rgba(107, 45, 102, 0.12)'
              : 'inset 0 0 35px rgba(210, 160, 195, 0.18)',
          }}
        />

        {/* Venn Circle Right */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(260px, 42vw, 440px)',
            height: 'clamp(260px, 42vw, 440px)',
            borderRadius: '50%',
            border: `1.5px solid ${vennStrokeB}`,
            backgroundColor: vennFillB,
            transform:
              phase === 'initial'
                ? 'translateX(110px) scale(0.85)'
                : phase === 'exiting'
                ? 'translateX(130px) scale(1.15)'
                : 'translateX(95px) scale(1)',
            transition: 'transform 3.4s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(1px)',
            boxShadow: isDark
              ? 'inset 0 0 40px rgba(139, 44, 116, 0.12)'
              : 'inset 0 0 35px rgba(210, 160, 195, 0.18)',
          }}
        />

        {/* Venn Intersection Subtle Radial Focus Accent */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(140px, 24vw, 240px)',
            height: 'clamp(200px, 32vw, 320px)',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(ellipse at center, rgba(215, 175, 210, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(139, 44, 116, 0.08) 0%, transparent 70%)',
            filter: 'blur(14px)',
            transform:
              phase === 'initial'
                ? 'scale(0.7)'
                : phase === 'exiting'
                ? 'scale(1.2)'
                : 'scale(1)',
            transition: 'transform 3.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Delicate Thin Concentric Coordinate Crosshairs / Orbitals */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(320px, 50vw, 540px)',
            height: 'clamp(320px, 50vw, 540px)',
            borderRadius: '50%',
            border: isDark ? '1px dashed rgba(243, 238, 233, 0.07)' : '1px dashed rgba(73, 40, 61, 0.08)',
            transform: phase === 'initial' ? 'rotate(0deg) scale(0.8)' : 'rotate(35deg) scale(1.05)',
            transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* --- MAIN HERO: 3D PERSPECTIVE VENNZ LOGO --- */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '92vw',
          zIndex: 10,
          perspective: '1000px',
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
                ? 'perspective(1000px) rotateX(16deg) rotateY(-8deg) scale(0.8) translateZ(-40px) translateY(28px)'
                : phase === 'exiting'
                ? 'perspective(1000px) rotateX(-4deg) rotateY(2deg) scale(1.1) translateZ(50px) translateY(-8px)'
                : 'perspective(1000px) rotateX(2deg) rotateY(0deg) scale(1) translateZ(10px) translateY(0)',
            opacity: phase === 'initial' ? 0 : 1,
            transition:
              'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* 3D Realistic Cast Depth Shadow under the Logo */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '10%',
              right: '10%',
              height: '38px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(107, 45, 102, 0.4) 40%, transparent 80%)'
                : 'radial-gradient(ellipse at center, rgba(50, 20, 42, 0.28) 0%, rgba(139, 44, 116, 0.15) 45%, transparent 80%)',
              filter: 'blur(16px)',
              transform:
                phase === 'initial'
                  ? 'scale(0.65) translateY(10px)'
                  : phase === 'exiting'
                  ? 'scale(1.2) translateY(6px)'
                  : 'scale(1) translateY(0)',
              transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 3D Emboss / Bevel Glow Wrapper */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              filter: isDark
                ? 'drop-shadow(0 2px 0px rgba(255, 230, 250, 0.25)) drop-shadow(0 14px 18px rgba(0, 0, 0, 0.75)) drop-shadow(0 28px 42px rgba(107, 45, 102, 0.45)) drop-shadow(0 0 32px rgba(215, 175, 210, 0.25))'
                : 'drop-shadow(0 1.5px 0px rgba(255, 255, 255, 0.85)) drop-shadow(0 12px 16px rgba(73, 40, 61, 0.24)) drop-shadow(0 26px 38px rgba(73, 40, 61, 0.16)) drop-shadow(0 0 24px rgba(183, 142, 184, 0.22))',
              transition: 'filter 1.8s ease',
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
                transform: 'translateZ(15px)',
              }}
            />

            {/* Trending Prismatic Specular Shimmer Beam */}
            <div
              style={{
                position: 'absolute',
                top: '-35%',
                bottom: '-35%',
                left: 0,
                width: '60%',
                background: isDark
                  ? 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 220, 245, 0.95) 53%, rgba(255, 255, 255, 0.3) 65%, transparent 85%)'
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
          fontWeight: 500,
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
