import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SplashActionsProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  className?: string;
}

export const SplashActions: React.FC<SplashActionsProps> = ({
  onGetStarted,
  className = '',
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Editorial Hook: "Not just a dating app. A community." */}
      <div
        style={{
          marginBottom: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Line 1: Not just a dating app. */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13.5px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: isDark ? '#F5ECE0' : '#7A5B72',
            margin: '0 0 4px 0',
            textShadow: isDark ? '0 1px 6px rgba(0, 0, 0, 0.6)' : 'none',
          }}
        >
          Not just a dating app.
        </p>

        {/* Line 2: A community. in flowing luxury script */}
        <p
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: 'clamp(44px, 5.8vw, 56px)',
            lineHeight: 1.15,
            color: isDark ? '#FAF5EE' : 'var(--color-mulberry)',
            margin: 0,
            letterSpacing: '0.02em',
            textShadow: isDark ? '0 2px 14px rgba(0, 0, 0, 0.85)' : 'none',
          }}
        >
          A community.
        </p>
      </div>

      {/* Primary CTA: Get Started with Day/Night artwork background transition */}
      <button
        type="button"
        onClick={onGetStarted}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '360px',
          height: '56px',
          backgroundColor: isDark ? '#220D23' : '#421A37',
          color: '#FAF5EE',
          fontFamily: 'var(--font-sans)',
          fontSize: '16.5px',
          fontWeight: 600,
          borderRadius: '9999px',
          border: isDark
            ? '1px solid rgba(250, 245, 238, 0.35)'
            : '1px solid rgba(245, 215, 230, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isDark
            ? '0 10px 28px rgba(0, 0, 0, 0.55), 0 0 20px rgba(107, 45, 102, 0.35)'
            : '0 10px 24px rgba(73, 40, 61, 0.28), 0 0 16px rgba(220, 140, 160, 0.20)',
          transform: isPressed
            ? 'scale(0.98)'
            : isHovered
            ? 'translateY(-2px)'
            : 'translateY(0)',
          filter: isHovered ? 'brightness(1.08)' : 'none',
          transition: 'transform 0.18s ease, box-shadow 0.25s ease, filter 0.18s ease, background-color 0.6s ease, border-color 0.6s ease',
          letterSpacing: '0.02em',
        }}
      >
        {/* Underlayer Base Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(135deg, #2D1429 0%, #1A0D18 100%)'
              : 'linear-gradient(135deg, #4A223E 0%, #2F1126 100%)',
            transition: 'background 0.6s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Light Mode Artwork Layer (Warm Dawn/Dusk Desert & Sun) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isDark ? 0 : 0.46,
            transform: isDark ? 'scale(1.06)' : 'scale(1)',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <img
            src="/cta-bg-light.png"
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              display: 'block',
            }}
          />
        </div>

        {/* Dark Mode Artwork Layer (Nocturnal Purple Desert & Moon/Stars) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isDark ? 0.50 : 0,
            transform: isDark ? 'scale(1)' : 'scale(1.06)',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <img
            src="/cta-bg-dark.png"
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              display: 'block',
            }}
          />
        </div>

        {/* Central Contrast Scrim to guarantee razor-sharp text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(16, 6, 17, 0.35) 0%, rgba(16, 6, 17, 0.15) 70%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Text & Icon Layer */}
        <span
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.55)',
            letterSpacing: '0.02em',
          }}
        >
          <span>Get Started</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              marginTop: '1px',
              filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.7))',
            }}
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
};
