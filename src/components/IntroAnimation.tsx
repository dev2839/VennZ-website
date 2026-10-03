import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
  /** Minimum display duration in ms before fading out */
  minDuration?: number;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  minDuration = 2200,
}) => {
  const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>('entering');

  useEffect(() => {
    // Phase 1 -> holding at 500ms
    const holdTimer = setTimeout(() => {
      setPhase('holding');
    }, 600);

    // Phase 2 -> exiting at minDuration
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, minDuration);

    // Phase 3 -> complete callback
    const finishTimer = setTimeout(() => {
      onComplete();
    }, minDuration + 650);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [minDuration, onComplete]);

  return (
    <div
      aria-label="VennZ Launch Animation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#0A060A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'exiting' ? 0 : 1,
        transform: phase === 'exiting' ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: phase === 'exiting' ? 'none' : 'auto',
      }}
    >
      {/* Background radial luxury aura */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107, 45, 102, 0.35) 0%, rgba(73, 40, 61, 0.15) 45%, rgba(10, 6, 10, 0) 75%)',
          filter: 'blur(50px)',
          transform: phase === 'entering' ? 'scale(0.6)' : 'scale(1.2)',
          transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.8s ease',
          opacity: phase === 'exiting' ? 0 : 0.85,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient micro sparkle particles / rings */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          border: '1px solid rgba(220, 180, 215, 0.12)',
          transform: phase === 'entering' ? 'scale(0.8) rotate(0deg)' : 'scale(1.15) rotate(45deg)',
          transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease',
          opacity: phase === 'exiting' ? 0 : 0.6,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          border: '1px dashed rgba(243, 238, 233, 0.08)',
          transform: phase === 'entering' ? 'scale(0.9) rotate(0deg)' : 'scale(1.1) rotate(-30deg)',
          transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease',
          opacity: phase === 'exiting' ? 0 : 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Main Logo Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '85vw',
        }}
      >
        {/* Shimmer light sweep wrapper */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            padding: '16px 28px',
            transform:
              phase === 'entering'
                ? 'scale(0.86) translateY(14px)'
                : phase === 'holding'
                ? 'scale(1) translateY(0)'
                : 'scale(1.02) translateY(-4px)',
            opacity: phase === 'entering' ? 0 : 1,
            transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 14px 32px rgba(107, 45, 102, 0.45)) drop-shadow(0 0 45px rgba(183, 142, 184, 0.25))',
          }}
        >
          {/* High-res transparent logo image */}
          <img
            src="/vennz-logo.png"
            alt="VennZ"
            style={{
              display: 'block',
              maxHeight: '84px',
              maxWidth: '320px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
          />

          {/* Luxury Shimmer Sweep Line */}
          <div
            className="intro-shimmer-sweep"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.45) 45%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.45) 55%, transparent 80%)',
              pointerEvents: 'none',
              transform: phase === 'entering' ? 'translateX(-120%)' : 'translateX(140%)',
              transition: 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.3s',
            }}
          />
        </div>

        {/* Elegant Subtitle Reveal */}
        <div
          style={{
            marginTop: '16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(243, 238, 233, 0.82)',
            transform: phase === 'entering' ? 'translateY(8px)' : 'translateY(0)',
            opacity: phase === 'entering' ? 0 : 1,
            transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              backgroundColor: 'rgba(220, 180, 215, 0.4)',
            }}
          />
          <span>CURATED CONNECTIONS</span>
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              backgroundColor: 'rgba(220, 180, 215, 0.4)',
            }}
          />
        </div>
      </div>

      {/* Subtle Skip button in corner for accessibility / power users */}
      <button
        type="button"
        onClick={onComplete}
        style={{
          position: 'absolute',
          bottom: '28px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(243, 238, 233, 0.4)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '999px',
          transition: 'color 0.2s ease, opacity 0.2s ease',
          opacity: phase === 'entering' ? 0 : 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(243, 238, 233, 0.85)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(243, 238, 233, 0.4)')}
      >
        Skip
      </button>
    </div>
  );
};
