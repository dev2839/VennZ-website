import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SplashBrandingProps {
  className?: string;
  isIntroActive?: boolean;
}

const LOGO_LETTERS = [
  { id: 'V', src: '/letters/letter_V.png' },
  { id: 'e', src: '/letters/letter_e.png' },
  { id: 'n1', src: '/letters/letter_n1.png' },
  { id: 'n2', src: '/letters/letter_n2.png' },
  { id: 'z', src: '/letters/letter_z.png' },
];

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
            width: 'clamp(280px, 48vw, 440px)',
            aspectRatio: '984 / 303',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'perspective(1000px) rotateX(4deg) translateZ(8px)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
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
              transition: 'none',
            }}
          />

          {/* Letter / Logo Layer */}
          <div
            id="welcome-vennz-logo-letters"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              opacity: isIntroActive ? 0 : 1,
              transition: 'none',
              filter: isDark
                ? [
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
          >
            {LOGO_LETTERS.map((letter) => (
              <img
                key={letter.id}
                src={letter.src}
                alt={letter.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>
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
          transform: isIntroActive ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        }}
      >
        Real people. Meaningful connections.
      </p>
    </div>
  );
};
