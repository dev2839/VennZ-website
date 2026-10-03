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
      {/* VennZ 3D Brand Logo */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: '1000px',
          width: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'perspective(1000px) rotateX(4deg) translateZ(8px)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s ease',
          }}
        >
          {/* Subtle Ground Depth Shadow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '10%',
              right: '10%',
              height: '24px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(139, 44, 116, 0.35) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at center, rgba(73, 40, 61, 0.28) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          <img
            src="/vennz-logo.png"
            alt="VennZ"
            style={{
              maxHeight: '100px',
              maxWidth: 'min(360px, 85vw)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              filter: isDark
                ? [
                    // Top rim highlight for 3D bevel
                    'drop-shadow(0 -1.5px 1px rgba(255, 230, 255, 0.5))',
                    // Primary extrusion step
                    'drop-shadow(0 3px 5px rgba(20, 5, 18, 0.8))',
                    // Secondary depth drop
                    'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.85))',
                    // Ambient purple glow
                    'drop-shadow(0 20px 35px rgba(139, 44, 116, 0.5))',
                  ].join(' ')
                : [
                    'drop-shadow(0 -1.5px 1px rgba(255, 255, 255, 0.9))',
                    'drop-shadow(0 3px 4px rgba(73, 40, 61, 0.35))',
                    'drop-shadow(0 12px 20px rgba(73, 40, 61, 0.18))',
                    'drop-shadow(0 0 20px rgba(183, 142, 184, 0.2))',
                  ].join(' '),
            }}
          />
        </div>
      </div>

      {/* Tagline: Real people. Meaningful connections. (Bigger and responsive) */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(20px, 3.2vw, 26px)',
          lineHeight: '1.4',
          fontWeight: 500,
          letterSpacing: '0.015em',
          color: isDark ? 'rgba(243, 238, 233, 0.96)' : 'var(--color-mulberry)',
          marginTop: '18px',
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
