import React from 'react';
import { StatusBar } from './StatusBar';
import { SplashBranding } from './SplashBranding';
import { SplashActions } from './SplashActions';

interface SplashScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onLearnHowItWorks?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onGetStarted,
  onLogin,
  onLearnHowItWorks,
  showStatusBar = false,
  showHomeIndicator = false,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        backgroundColor: '#100c0e',
      }}
    >
      {/* Cinematic Mediterranean Sunset Background */}
      <img
        src="/welcome-bg.jpg"
        alt="The Inner Circle Mediterranean sunset coastal terrace"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Soft Cinematic Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, rgba(16, 12, 14, 0.4) 0%, rgba(16, 12, 14, 0.15) 30%, rgba(16, 12, 14, 0.35) 60%, rgba(16, 12, 14, 0.85) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Optional Mobile Status Bar */}
      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <StatusBar variant="light" />
        </div>
      )}

      {/* Main Hero Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '48px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Editorial Branding Lockup */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <SplashBranding />
        </div>

        {/* Action Suite */}
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '48px' }}>
          <SplashActions onGetStarted={onGetStarted} onLogin={onLogin} />

          {onLearnHowItWorks && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onLearnHowItWorks}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(243, 238, 233, 0.85)',
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(243, 238, 233, 0.85)')}
              >
                Learn How The Inner Circle Works →
              </button>
            </div>
          )}
        </div>

        {/* Desktop Feature Pillars (visible on tablet/desktop >= 768px) */}
        <div
          className="hidden-on-mobile"
          style={{
            width: '100%',
            maxWidth: '1120px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginTop: 'auto',
            paddingTop: '20px',
          }}
        >
          {[
            {
              title: 'Curated Introductions',
              description: 'Handpicked verified profiles aligned with your professional standards and ambitions.',
              icon: '✦',
            },
            {
              title: 'Rigorous Verification',
              description: 'Biometric selfie verification and background vetting ensure real, authentic members.',
              icon: '🛡️',
            },
            {
              title: 'Elevate Concierge',
              description: 'Private styling, executive photography, and personalized relationship coaching.',
              icon: '👑',
            },
            {
              title: 'Private Mixers',
              description: 'Curated in-person gatherings in premier venues across Mumbai, Delhi, Bengaluru & Pune.',
              icon: '🍸',
            },
          ].map((pillar, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(18, 14, 17, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(243, 238, 233, 0.12)',
                borderRadius: '16px',
                padding: '20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(232, 169, 155, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(243, 238, 233, 0.12)';
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{pillar.icon}</div>
              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '17px',
                  color: 'var(--color-warm-porcelain)',
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {pillar.title}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'rgba(243, 238, 233, 0.72)',
                  margin: 0,
                }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Optional iOS Home Indicator */}
      {showHomeIndicator && (
        <div
          style={{
            width: '134px',
            height: '5px',
            backgroundColor: 'rgba(243, 238, 233, 0.55)',
            borderRadius: '9999px',
            margin: '0 auto 12px',
            position: 'relative',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};
