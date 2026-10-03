import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface IntroAnimationProps {
  onComplete: () => void;
  /** Display duration in ms before starting exit fade */
  duration?: number;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  duration = 3800,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Phases:
  // 1. 'initial': pre-mount resting state
  // 2. 'reveal': shaded canvas appears, interconnected Venn diagram stabilizes & spins in place in 3D
  // 3. 'shimmer': specular beam sweeps across 3D logo
  // 4. 'exiting': scale gently towards user and smoothly fade out
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'shimmer' | 'exiting'>('initial');

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setPhase('reveal');
    }, 80);

    const shimmerTimer = setTimeout(() => {
      setPhase('shimmer');
    }, 1200);

    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, duration);

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

  // Shaded background: top purple to bottom cream shade
  // "shaded bg like top purple to botton cream shade not so much purple our logo should be clearly visible"
  const backgroundGradient = isDark
    ? 'linear-gradient(180deg, #240A20 0%, #170716 35%, #0F050E 70%, #070306 100%)'
    : 'linear-gradient(180deg, #E6D3E3 0%, #EFE1EC 20%, #F6ECE4 50%, #FAF3EB 75%, #FBF8F2 100%)';

  // 3D Venn Ring Colors (distinctive Venn diagram intersection)
  const vennRingStrokeA = isDark ? 'rgba(235, 185, 230, 0.42)' : 'rgba(139, 44, 116, 0.35)';
  const vennRingFillA = isDark ? 'rgba(139, 44, 116, 0.08)' : 'rgba(139, 44, 116, 0.04)';

  const vennRingStrokeB = isDark ? 'rgba(215, 160, 220, 0.38)' : 'rgba(107, 45, 102, 0.3)';
  const vennRingFillB = isDark ? 'rgba(107, 45, 102, 0.08)' : 'rgba(107, 45, 102, 0.04)';

  const vennIntersectionFill = isDark ? 'rgba(235, 185, 230, 0.16)' : 'rgba(139, 44, 116, 0.11)';

  const skipColor = isDark ? 'rgba(243, 238, 233, 0.55)' : 'rgba(73, 40, 61, 0.55)';
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
        background: backgroundGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'exiting' ? 0 : 1,
        transform: phase === 'exiting' ? 'scale(1.06)' : 'scale(1)',
        pointerEvents: phase === 'exiting' ? 'none' : 'auto',
        perspective: '1400px',
      }}
    >
      {/* Soft atmospheric ambient glow beam centered behind the logo */}
      <div
        style={{
          position: 'absolute',
          width: 'min(920px, 95vw)',
          height: 'min(920px, 95vw)',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 58, 142, 0.32) 0%, rgba(95, 28, 82, 0.18) 45%, rgba(0, 0, 0, 0) 75%)'
            : 'radial-gradient(circle, rgba(225, 175, 215, 0.5) 0%, rgba(240, 215, 230, 0.25) 45%, rgba(251, 248, 242, 0) 75%)',
          filter: 'blur(60px)',
          transform: phase === 'initial' ? 'scale(0.6)' : phase === 'exiting' ? 'scale(1.3)' : 'scale(1.05)',
          transition: 'transform 3.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.5s ease',
          opacity: phase === 'exiting' ? 0 : 1,
          pointerEvents: 'none',
        }}
      />

      {/* --- 3D IN-PLACE ROTATING VENN DIAGRAM (FIXED VENNZ INTERSECTION) --- */}
      <div
        style={{
          position: 'absolute',
          width: 'min(760px, 92vw)',
          height: 'min(520px, 62vh)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
          opacity: phase === 'initial' ? 0 : phase === 'exiting' ? 0 : 1,
          transition: 'opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'vennSystem3DTilt 9s ease-in-out infinite',
        }}
      >
        {/* LEFT VENN CIRCLE (Fixed in place at -90px, spins in place in 3D) */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - clamp(240px, 36vw, 360px) / 2 - 95px)',
            width: 'clamp(240px, 36vw, 360px)',
            height: 'clamp(240px, 36vw, 360px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${vennRingStrokeA}`,
              backgroundColor: vennRingFillA,
              boxShadow: isDark
                ? '0 0 30px rgba(168, 58, 142, 0.25), inset 0 0 25px rgba(168, 58, 142, 0.18)'
                : '0 8px 25px rgba(139, 44, 116, 0.14), inset 0 0 25px rgba(220, 160, 205, 0.22)',
              transformStyle: 'preserve-3d',
              animation: 'vennRingSpin3DLeft 12s linear infinite',
              position: 'relative',
            }}
          >
            {/* Bevel Rim Light Edge */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '50%',
                borderTop: isDark ? '2.5px solid rgba(255, 230, 250, 0.85)' : '2.5px solid rgba(255, 255, 255, 0.95)',
                borderBottom: 'transparent',
                borderLeft: 'transparent',
                borderRight: 'transparent',
                filter: 'blur(0.5px)',
              }}
            />
          </div>
        </div>

        {/* RIGHT VENN CIRCLE (Fixed in place at +90px, spins in place in 3D) */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - clamp(240px, 36vw, 360px) / 2 + 95px)',
            width: 'clamp(240px, 36vw, 360px)',
            height: 'clamp(240px, 36vw, 360px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${vennRingStrokeB}`,
              backgroundColor: vennRingFillB,
              boxShadow: isDark
                ? '0 0 30px rgba(139, 44, 116, 0.25), inset 0 0 25px rgba(139, 44, 116, 0.18)'
                : '0 8px 25px rgba(107, 45, 102, 0.14), inset 0 0 25px rgba(220, 160, 205, 0.22)',
              transformStyle: 'preserve-3d',
              animation: 'vennRingSpin3DRight 12s linear infinite',
              position: 'relative',
            }}
          >
            {/* Bevel Rim Light Edge */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '50%',
                borderBottom: isDark ? '2.5px solid rgba(255, 230, 250, 0.85)' : '2.5px solid rgba(255, 255, 255, 0.95)',
                borderTop: 'transparent',
                borderLeft: 'transparent',
                borderRight: 'transparent',
                filter: 'blur(0.5px)',
              }}
            />
          </div>
        </div>

        {/* DISTINCT CENTRAL VENN INTERSECTION LENS */}
        {/* Clearly illustrates the Venn intersection in place right behind VennZ */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(115px, 18vw, 170px)',
            height: 'clamp(185px, 28vw, 275px)',
            borderRadius: '50%',
            backgroundColor: vennIntersectionFill,
            border: isDark ? '1px solid rgba(255, 230, 250, 0.35)' : '1px solid rgba(139, 44, 116, 0.3)',
            boxShadow: isDark
              ? '0 0 35px rgba(215, 160, 220, 0.35), inset 0 0 25px rgba(215, 160, 220, 0.25)'
              : '0 0 30px rgba(139, 44, 116, 0.22), inset 0 0 20px rgba(139, 44, 116, 0.18)',
            transform: 'translateZ(10px)',
            pointerEvents: 'none',
          }}
        />

        {/* Minimal Orbital Axis Line */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(320px, 48vw, 520px)',
            height: 'clamp(320px, 48vw, 520px)',
            borderRadius: '50%',
            border: isDark ? '1px dashed rgba(243, 238, 233, 0.14)' : '1px dashed rgba(107, 45, 102, 0.15)',
            transform: 'rotateX(75deg)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* --- MAIN HERO: 3D VENNZ LOGO --- */}
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
          className="venn-logo-3d-wrapper"
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '32px',
            padding: '24px 44px',
            transformStyle: 'preserve-3d',
            animation: phase === 'reveal' || phase === 'shimmer' ? 'vennFloat3D 4.5s ease-in-out infinite' : undefined,
            transform:
              phase === 'initial'
                ? 'perspective(1200px) rotateX(20deg) scale(0.78) translateZ(-50px) translateY(30px)'
                : phase === 'exiting'
                ? 'perspective(1200px) rotateX(-5deg) scale(1.12) translateZ(60px) translateY(-10px)'
                : undefined,
            opacity: phase === 'initial' ? 0 : 1,
            transition:
              'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Real 3D Ground/Depth Shadow under Logo */}
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '8%',
              right: '8%',
              height: '42px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.92) 0%, rgba(95, 28, 82, 0.45) 45%, transparent 80%)'
                : 'radial-gradient(ellipse at center, rgba(50, 18, 42, 0.32) 0%, rgba(139, 44, 116, 0.16) 45%, transparent 80%)',
              filter: 'blur(16px)',
              transform:
                phase === 'initial'
                  ? 'scale(0.65) translateY(12px)'
                  : phase === 'exiting'
                  ? 'scale(1.25) translateY(6px)'
                  : 'scale(1) translateY(0)',
              transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 3D Emboss / Bevel Glow Profile */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              filter: isDark
                ? 'drop-shadow(0 2.5px 0px rgba(255, 230, 250, 0.35)) drop-shadow(0 16px 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 30px 48px rgba(139, 44, 116, 0.5)) drop-shadow(0 0 35px rgba(215, 175, 210, 0.3))'
                : 'drop-shadow(0 2px 0px rgba(255, 255, 255, 0.95)) drop-shadow(0 14px 18px rgba(73, 40, 61, 0.24)) drop-shadow(0 28px 42px rgba(73, 40, 61, 0.16)) drop-shadow(0 0 28px rgba(183, 142, 184, 0.25))',
              transition: 'filter 1.8s ease',
            }}
          >
            {/* High-res VennZ Logo Image */}
            <img
              src="/vennz-logo.png"
              alt="VennZ"
              style={{
                display: 'block',
                width: 'clamp(310px, 62vw, 680px)',
                height: 'auto',
                maxHeight: 'clamp(105px, 25vh, 205px)',
                objectFit: 'contain',
                userSelect: 'none',
                transform: 'translateZ(25px)',
              }}
            />

            {/* Specular 3D Shimmer Beam */}
            <div
              style={{
                position: 'absolute',
                top: '-35%',
                bottom: '-35%',
                left: 0,
                width: '60%',
                background: isDark
                  ? 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.92) 50%, rgba(255, 220, 245, 0.95) 53%, rgba(255, 255, 255, 0.3) 65%, transparent 85%)'
                  : 'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.45) 35%, rgba(255, 255, 255, 0.98) 50%, rgba(245, 230, 240, 0.98) 53%, rgba(255, 255, 255, 0.5) 65%, transparent 85%)',
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
