import React from 'react';

interface SplashActionsProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  className?: string;
}

export const SplashActions: React.FC<SplashActionsProps> = ({
  onGetStarted,
  onLogin,
  className = '',
}) => {
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
          marginBottom: '20px',
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
            fontSize: '17px',
            fontWeight: 400,
            color: 'rgba(243, 238, 233, 0.95)',
            letterSpacing: '0.02em',
            margin: '0 0 2px 0',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
          }}
        >
          Not just a dating app.
        </p>

        {/* Line 2: A community. in flowing luxury script */}
        <p
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: '44px',
            lineHeight: 1.15,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '0.02em',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.85)',
          }}
        >
          A community.
        </p>
      </div>

      {/* Primary CTA: Get Started */}
      <button
        type="button"
        onClick={onGetStarted}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '58px',
          backgroundColor: '#E8A99B',
          color: '#272124',
          fontFamily: 'var(--font-sans)',
          fontSize: '17.5px',
          fontWeight: 600,
          borderRadius: '9999px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 8px 26px rgba(0, 0, 0, 0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
          letterSpacing: '0.01em',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F0B6A9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#E8A99B';
          e.currentTarget.style.transform = 'scale(1)';
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

      {/* Secondary Action: Already a member? Log in */}
      <div
        style={{
          marginTop: '20px',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          color: 'rgba(243, 238, 233, 0.92)',
          textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>Already a member?</span>
        <button
          type="button"
          onClick={onLogin}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            textDecorationColor: 'rgba(243, 238, 233, 0.8)',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Log in
        </button>
      </div>
    </div>
  );
};
