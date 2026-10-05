import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SplashActionsProps {
  onGetStarted?: () => void;
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
        {/* Line 1: Not just a dating app. */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13.5px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: isDark ? '#D4A2AC' : '#683A46',
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
            color: isDark ? '#FDF3F5' : '#462037',
            margin: 0,
            letterSpacing: '0.02em',
            textShadow: isDark ? '0 2px 14px rgba(0, 0, 0, 0.85)' : 'none',
          }}
        >
          A community.
        </p>
      </div>

      {/* Primary CTA: Get Started with reference palette gradient #A1525F -> #C7577C */}
      <button
        type="button"
        onClick={onGetStarted}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '56px',
          background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
          color: '#FDF3F5',
          fontFamily: 'var(--font-sans)',
          fontSize: '16.5px',
          fontWeight: 600,
          borderRadius: '9999px',
          border: isDark ? '1px solid rgba(249, 170, 173, 0.4)' : '1px solid rgba(161, 82, 95, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: isDark
            ? '0 10px 28px rgba(20, 14, 28, 0.6), 0 0 20px rgba(161, 82, 95, 0.35)'
            : '0 10px 24px rgba(70, 32, 55, 0.22)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease, color 0.2s ease',
          letterSpacing: '0.02em',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)';
          e.currentTarget.style.color = '#140E1C';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
          e.currentTarget.style.color = '#FDF3F5';
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
