import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SplashBrandingProps {
  className?: string;
  isIntroActive?: boolean;
}

export const SplashBranding: React.FC<SplashBrandingProps> = ({
  className = '',
  isIntroActive = false,
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
        textAlign: 'center',
        color: isDark ? '#FDF3F5' : '#462037',
        padding: '0 20px',
      }}
    >
      {/* VennZ 3D Brand Logo */}
      <div
        id="welcome-vennz-logo-target"
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
          id="welcome-vennz-logo-inner"
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
                ? 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(104, 58, 70, 0.35) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at center, rgba(161, 82, 95, 0.25) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: isIntroActive ? 0 : 1,
              transition: 'opacity 0.25s ease',
            }}
          />

          <img
            id="welcome-vennz-logo-img"
            src="/vennz-logo.png"
            alt="VennZ"
            style={{
              maxHeight: 'clamp(115px, 16vh, 145px)',
              maxWidth: 'min(460px, 90vw)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              opacity: isIntroActive ? 0 : 1,
              transition: 'opacity 0.25s ease',
              filter: isDark
                ? [
                    // Pure 3D depth shadow with dark occlusion and soft plum/mauve ambient
                    'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.9))',
                    'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.85))',
                    'drop-shadow(0 26px 45px rgba(20, 14, 28, 0.7))',
                    'drop-shadow(0 0 20px rgba(161, 82, 95, 0.25))',
                  ].join(' ')
                : [
                    'drop-shadow(0 3px 5px rgba(70, 32, 55, 0.3))',
                    'drop-shadow(0 12px 22px rgba(104, 58, 70, 0.16))',
                    'drop-shadow(0 0 20px rgba(199, 87, 124, 0.18))',
                  ].join(' '),
            }}
          />
        </div>
      </div>

      {/* Tagline: Real people. Meaningful connections. (Strictly in one line) */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(18px, 2.8vw, 24px)',
          lineHeight: '1.4',
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: isDark ? '#FDF3F5' : '#462037',
          marginTop: '16px',
          whiteSpace: 'nowrap',
          textShadow: isDark ? '0 1px 8px rgba(0, 0, 0, 0.6)' : 'none',
          opacity: isIntroActive ? 0 : 1,
          transform: isIntroActive ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s',
        }}
      >
        Real people. Meaningful connections.
      </p>
    </div>
  );
};
