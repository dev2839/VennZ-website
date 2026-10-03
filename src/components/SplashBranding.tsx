import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SplashBrandingProps {
  className?: string;
}

export const SplashBranding: React.FC<SplashBrandingProps> = ({ className = '' }) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
        padding: '0 20px',
      }}
    >
      {/* VennZ Brand Logo */}
      <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
        <img
          src="/vennz-logo.png"
          alt="VennZ"
          style={{
            maxHeight: '80px',
            maxWidth: '300px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            filter: isDark
              ? 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.6)) brightness(1.08)'
              : 'drop-shadow(0 4px 14px rgba(73, 40, 61, 0.18))',
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
          color: isDark ? 'rgba(243, 238, 233, 0.95)' : 'var(--color-mulberry)',
          marginTop: '16px',
          textShadow: isDark ? '0 1px 8px rgba(0, 0, 0, 0.6)' : 'none',
        }}
      >
        Real people. Meaningful
        <br />
        connections.
      </p>
    </div>
  );
};
