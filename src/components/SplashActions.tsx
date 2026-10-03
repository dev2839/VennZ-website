import React from 'react';
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
        {/* Line 1: Not just a dating app. (Made smaller per user request) */}
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

      {/* Primary CTA: Get Started with rich Purple and Cream shade background */}
      <button
        type="button"
        onClick={onGetStarted}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '56px',
          background: isDark
            ? 'linear-gradient(135deg, #6B2D66 0%, #49283D 45%, #EADDCF 140%)'
            : 'linear-gradient(135deg, #49283D 0%, #683256 50%, #F5ECE0 135%)',
          color: '#FAF5EE',
          fontFamily: 'var(--font-sans)',
          fontSize: '16.5px',
          fontWeight: 600,
          borderRadius: '9999px',
          border: isDark ? '1px solid rgba(250, 245, 238, 0.35)' : '1px solid rgba(73, 40, 61, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: isDark
            ? '0 10px 28px rgba(0, 0, 0, 0.5), 0 0 20px rgba(107, 45, 102, 0.35)'
            : '0 10px 24px rgba(73, 40, 61, 0.22)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
          letterSpacing: '0.02em',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(1.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
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
          style={{ marginTop: '1px' }}
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
