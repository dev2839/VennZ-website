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
      {/* VennZ Brand Logo */}
      <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
        <img
          src="/vennz-logo.png"
          alt="VennZ"
          style={{
            maxHeight: '76px',
            maxWidth: '280px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))',
          }}
        />
      </div>

      {/* Tagline: Real people. Meaningful connections. */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '18px',
          lineHeight: '1.45',
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: 'rgba(243, 238, 233, 0.95)',
          marginTop: '18px',
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
