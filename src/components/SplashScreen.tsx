import React from 'react';
import { StatusBar } from './StatusBar';
import { SplashBranding } from './SplashBranding';
import { SplashActions } from './SplashActions';
import { useAuth } from '../context/AuthContext';

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
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

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
        backgroundColor: isDark ? '#080507' : '#FAF6F0',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* Optional Mobile Status Bar */}
      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <StatusBar variant={isDark ? 'light' : 'dark'} />
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
                  color: isDark ? 'rgba(243, 238, 233, 0.85)' : 'var(--color-mulberry)',
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Learn How VennZ Works →
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
                backgroundColor: isDark ? 'rgba(18, 14, 17, 0.75)' : '#FFFFFF',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(73, 40, 61, 0.06)',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : '1px solid rgba(73, 40, 61, 0.1)',
                borderRadius: '16px',
                padding: '20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(232, 169, 155, 0.4)' : 'var(--color-mulberry)';
                if (!isDark) e.currentTarget.style.boxShadow = '0 8px 24px rgba(73, 40, 61, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(243, 238, 233, 0.12)' : 'rgba(73, 40, 61, 0.1)';
                if (!isDark) e.currentTarget.style.boxShadow = '0 4px 20px rgba(73, 40, 61, 0.06)';
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{pillar.icon}</div>
              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '17px',
                  color: isDark ? 'var(--color-warm-porcelain)' : 'var(--color-mulberry)',
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {pillar.title}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                  color: isDark ? 'rgba(243, 238, 233, 0.72)' : '#6B5765',
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
