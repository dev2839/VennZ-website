import React from 'react';

interface SplashBrandingProps {
  className?: string;
}

export const SplashBranding: React.FC<SplashBrandingProps> = ({ className = '' }) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        color: '#FFFFFF',
        padding: '0 20px',
      }}
    >
      {/* "THE" */}
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '14px',
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
          fontWeight: 400,
          color: '#FFFFFF',
          opacity: 0.95,
          paddingLeft: '0.45em', // optical center alignment for tracked text
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
        }}
      >
        THE
      </div>

      {/* "INNER CIRCLE" */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '32px',
          lineHeight: '1.2',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 400,
          marginTop: '6px',
          color: '#FFFFFF',
          paddingLeft: '0.22em', // optical center alignment for tracked text
          textShadow: '0 2px 16px rgba(0, 0, 0, 0.65)',
        }}
      >
        INNER CIRCLE
      </h1>

      {/* Tagline: Real people. Meaningful connections. */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15.5px',
          lineHeight: '1.42',
          fontWeight: 400,
          letterSpacing: '0.01em',
          color: 'rgba(243, 238, 233, 0.95)',
          marginTop: '16px',
          textShadow: '0 1px 8px rgba(0, 0, 0, 0.6)',
        }}
      >
        Real people. Meaningful
        <br />
        connections.
      </p>
    </div>
  );
};
