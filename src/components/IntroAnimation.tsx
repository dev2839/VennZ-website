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
  // 2. 'reveal': soft pulse rings expand, logo scales up smoothly with glow
  // 3. 'shimmer': trending luxury prismatic light beam sweeps across logo
  // 4. 'exiting': scale gently towards viewer with seamless cinematic fade out
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'shimmer' | 'exiting'>('initial');

  useEffect(() => {
    // Start reveal almost immediately with smooth physics
    const startTimer = setTimeout(() => {
      setPhase('reveal');
    }, 80);

    // Trigger trending specular shimmer sweep halfway through
    const shimmerTimer = setTimeout(() => {
      setPhase('shimmer');
    }, 1100);

    // Start graceful exit
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, duration);

    // Unmount upon complete fade out
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

  // Color schemes based on user theme request:
  // "if the theme is light then keep bg cream else keep dark bg"
  const bgColor = isDark ? '#080507' : '#FAF6F0';
  const ambientGlow = isDark
    ? 'radial-gradient(circle at center, rgba(139, 44, 116, 0.45) 0%, rgba(68, 20, 60, 0.22) 42%, rgba(8, 5, 7, 0) 72%)'
    : 'radial-gradient(circle at center, rgba(199, 148, 185, 0.38) 0%, rgba(230, 209, 219, 0.22) 45%, rgba(250, 246, 240, 0) 75%)';
  const ringBorder = isDark ? 'rgba(215, 175, 210, 0.14)' : 'rgba(107, 45, 102, 0.12)';
  const innerRingBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.07)';
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
      }}
    >
      {/* Ambient Pulsing Aura Backdrop */}
      <div
        style={{
          position: 'absolute',
          width: 'min(900px, 95vw)',
          height: 'min(900px, 95vw)',
          borderRadius: '50%',
          background: ambientGlow,
          filter: 'blur(60px)',
          transform: phase === 'initial' ? 'scale(0.5)' : phase === 'exiting' ? 'scale(1.3)' : 'scale(1.05)',
          transition: 'transform 3.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.5s ease',
          opacity: phase === 'exiting' ? 0 : 1,
          pointerEvents: 'none',
        }}
      />

      {/* Modern Trending Animated Geometric Concentric Halos */}
      <div
        style={{
          position: 'absolute',
          width: 'min(580px, 86vw)',
          height: 'min(580px, 86vw)',
          borderRadius: '50%',
          border: `1px solid ${ringBorder}`,
          transform: phase === 'initial' ? 'scale(0.65) rotate(0deg)' : 'scale(1.08) rotate(35deg)',
          transition: 'transform 3.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2s ease',
          opacity: phase === 'exiting' ? 0 : 0.8,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 'min(760px, 94vw)',
          height: 'min(760px, 94vw)',
          borderRadius: '50%',
          border: `1px dashed ${innerRingBorder}`,
          transform: phase === 'initial' ? 'scale(0.75) rotate(0deg)' : 'scale(1.04) rotate(-25deg)',
          transition: 'transform 3.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 2s ease',
          opacity: phase === 'exiting' ? 0 : 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Main Hero Container: ONLY VennZ Logo (Much Bigger) */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '92vw',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: '24px',
            padding: '28px 48px',
            transform:
              phase === 'initial'
                ? 'scale(0.78) translateY(24px)'
                : phase === 'exiting'
                ? 'scale(1.08) translateY(-6px)'
                : 'scale(1) translateY(0)',
            opacity: phase === 'initial' ? 0 : 1,
            transition:
              'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isDark
              ? 'drop-shadow(0 18px 48px rgba(139, 44, 116, 0.55)) drop-shadow(0 0 55px rgba(215, 175, 210, 0.3))'
              : 'drop-shadow(0 16px 36px rgba(73, 40, 61, 0.22)) drop-shadow(0 0 40px rgba(183, 142, 184, 0.2))',
          }}
        >
          {/* Much Bigger VennZ Logo */}
          <img
            src="/vennz-logo.png"
            alt="VennZ"
            style={{
              display: 'block',
              width: 'clamp(280px, 58vw, 620px)',
              height: 'auto',
              maxHeight: 'clamp(95px, 22vh, 180px)',
              objectFit: 'contain',
              userSelect: 'none',
            }}
          />

          {/* Trending Prismatic Specular Shimmer Beam */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              bottom: '-30%',
              left: 0,
              width: '65%',
              background: isDark
                ? 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 220, 245, 0.95) 53%, rgba(255, 255, 255, 0.3) 65%, transparent 85%)'
                : 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.4) 35%, rgba(255, 255, 255, 0.95) 50%, rgba(245, 230, 240, 0.95) 53%, rgba(255, 255, 255, 0.5) 65%, transparent 85%)',
              mixBlendMode: isDark ? 'screen' : 'overlay',
              transform:
                phase === 'initial' || phase === 'reveal'
                  ? 'translateX(-160%) skewX(-18deg)'
                  : 'translateX(260%) skewX(-18deg)',
              transition: 'transform 1.9s cubic-bezier(0.2, 0.8, 0.2, 1)',
              pointerEvents: 'none',
            }}
          />
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
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = skipHover)}
        onMouseLeave={(e) => (e.currentTarget.style.color = skipColor)}
      >
        Skip
      </button>
    </div>
  );
};
