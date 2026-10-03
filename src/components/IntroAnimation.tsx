import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
  appearanceMode?: 'ivory' | 'after-dark';
  /** Total animation duration before initiating fade exit */
  durationMs?: number;
}

interface LetterItem {
  id: string;
  char: string;
  src: string;
  width: number; // proportional width
  delay: number; // staggered entrance delay in ms
  initialRotation: number;
}

const LETTERS: LetterItem[] = [
  { id: 'v', char: 'V', src: '/letters/aligned_V.png', width: 286, delay: 200, initialRotation: -12 },
  { id: 'e', char: 'e', src: '/letters/aligned_e.png', width: 113, delay: 550, initialRotation: 8 },
  { id: 'n', char: 'n', src: '/letters/aligned_n.png', width: 112, delay: 900, initialRotation: -8 },
  { id: 'z', char: 'Z', src: '/letters/aligned_Z.png', width: 151, delay: 1250, initialRotation: 14 },
];

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  appearanceMode = 'after-dark',
  durationMs = 4200,
}) => {
  const isDark = appearanceMode === 'after-dark';
  const [phase, setPhase] = useState<'idle' | 'letters-entering' | 'unified-glow' | 'exiting'>('idle');
  const [visibleLetters, setVisibleLetters] = useState<Set<string>>(new Set());

  // Palette according to current theme
  const bgColor = isDark ? '#080407' : '#FAF6F0';
  const auraGlow = isDark
    ? 'radial-gradient(circle, rgba(138, 48, 120, 0.42) 0%, rgba(73, 40, 61, 0.22) 42%, rgba(8, 4, 7, 0) 72%)'
    : 'radial-gradient(circle, rgba(232, 169, 155, 0.55) 0%, rgba(179, 154, 174, 0.35) 45%, rgba(250, 246, 240, 0) 75%)';
  const ringColor = isDark ? 'rgba(220, 180, 215, 0.16)' : 'rgba(73, 40, 61, 0.12)';
  const shadowFilter = isDark
    ? 'drop-shadow(0 20px 40px rgba(107, 45, 102, 0.55)) drop-shadow(0 0 50px rgba(183, 142, 184, 0.32))'
    : 'drop-shadow(0 14px 32px rgba(73, 40, 61, 0.25)) drop-shadow(0 0 40px rgba(232, 169, 155, 0.35))';

  useEffect(() => {
    // 1. Start letter cascade immediately
    const startTimer = setTimeout(() => {
      setPhase('letters-entering');
    }, 100);

    // Stagger reveal each letter
    const letterTimers = LETTERS.map((letter) => {
      return setTimeout(() => {
        setVisibleLetters((prev) => new Set(prev).add(letter.id));
      }, letter.delay);
    });

    // 2. Lock into unified shimmer glow state after all letters land
    const glowTimer = setTimeout(() => {
      setPhase('unified-glow');
    }, 2200);

    // 3. Initiate smooth slow cinematic exit
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, durationMs);

    // 4. Complete callback after exit transition finishes
    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs + 900);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(glowTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      letterTimers.forEach(clearTimeout);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      aria-label="VennZ Launch Animation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 'exiting' ? 0 : 1,
        transform: phase === 'exiting' ? 'scale(1.06)' : 'scale(1)',
        pointerEvents: phase === 'exiting' ? 'none' : 'auto',
      }}
    >
      {/* Dynamic atmospheric ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 'min(90vw, 820px)',
          height: 'min(90vw, 820px)',
          borderRadius: '50%',
          background: auraGlow,
          filter: 'blur(70px)',
          transform: phase === 'idle' ? 'scale(0.5)' : phase === 'exiting' ? 'scale(1.4)' : 'scale(1.15)',
          transition: 'transform 3.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.8s ease',
          opacity: phase === 'exiting' ? 0 : 0.9,
          pointerEvents: 'none',
        }}
      />

      {/* Elegant geometric orbital circles */}
      <div
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          border: `1.5px solid ${ringColor}`,
          transform: phase === 'idle' ? 'scale(0.8) rotate(0deg)' : 'scale(1.12) rotate(60deg)',
          transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2s ease',
          opacity: phase === 'exiting' ? 0 : 0.65,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '740px',
          height: '740px',
          borderRadius: '50%',
          border: `1px dashed ${ringColor}`,
          transform: phase === 'idle' ? 'scale(0.85) rotate(0deg)' : 'scale(1.08) rotate(-45deg)',
          transition: 'transform 4.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 2s ease',
          opacity: phase === 'exiting' ? 0 : 0.45,
          pointerEvents: 'none',
        }}
      />

      {/* Main Logo Container - Big & prominent (NO extra subtitles, only VennZ) */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '92vw',
          maxWidth: '680px', // prominently large
          filter: shadowFilter,
          transition: 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transform:
            phase === 'unified-glow'
              ? 'scale(1.03)'
              : phase === 'exiting'
              ? 'scale(1.08)'
              : 'scale(1)',
        }}
      >
        {/* Shimmer light sweep on top */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            overflow: 'hidden',
            padding: '24px 0',
          }}
        >
          {/* Individual letter reveal stream */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: '0px',
            }}
          >
            {LETTERS.map((letter) => {
              const isVisible = visibleLetters.has(letter.id);
              return (
                <div
                  key={letter.id}
                  style={{
                    flex: letter.width,
                    maxWidth: `${(letter.width / 662) * 100}%`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isVisible
                      ? 'translateY(0) scale(1) rotate(0deg)'
                      : `translateY(45px) scale(0.65) rotate(${letter.initialRotation}deg)`,
                    opacity: isVisible ? 1 : 0,
                    filter: isVisible ? 'blur(0px)' : 'blur(8px)',
                    transition:
                      'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <img
                    src={letter.src}
                    alt={letter.char}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Luxury Shimmer Sweep Line across the letters */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '45%',
              background:
                'linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.15) 70%, transparent 100%)',
              pointerEvents: 'none',
              transform: phase === 'unified-glow' ? 'translateX(260%)' : 'translateX(-160%)',
              transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Discreet Skip Button */}
      <button
        type="button"
        onClick={onComplete}
        style={{
          position: 'absolute',
          bottom: '36px',
          background: 'transparent',
          border: 'none',
          color: isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.45)',
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '999px',
          transition: 'color 0.2s ease, opacity 0.2s ease',
          opacity: phase === 'idle' ? 0 : 1,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = isDark ? 'rgba(243, 238, 233, 0.85)' : 'var(--color-mulberry)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.45)')
        }
      >
        Skip
      </button>
    </div>
  );
};
