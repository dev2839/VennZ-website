import React from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page10OverviewScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page10OverviewScreen: React.FC<Page10OverviewScreenProps> = ({
  onBack,
  onNavigateHome,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { profile, membershipStatus, appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';
  const isComplimentary = membershipStatus === 'complimentary';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: isDark ? '#FDF3F5' : '#462037',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Botanical Parchment Background (with Cream flowers in Dark Mode) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/profile-bg-dark.png)' : 'url(/profile-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.98 : 0.94,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Luminous Warm Parchment Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.35)' : 'rgba(250, 241, 243, 0.42)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          flexShrink: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.92)' : 'rgba(250, 241, 243, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: isDark ? '1px solid rgba(161, 82, 95, 0.2)' : '1px solid rgba(199, 87, 124, 0.15)',
        }}
      >
        {showStatusBar && <StatusBar variant={isDark ? 'light' : 'dark'} />}

        <div
          style={{
            padding: '8px 24px 6px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
              cursor: 'pointer',
              padding: '6px 8px',
              marginLeft: '-8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '8px',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </button>

          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: isComplimentary ? '#B45309' : '#2E7D32',
              backgroundColor: isComplimentary
                ? 'rgba(217, 119, 6, 0.12)'
                : 'rgba(46, 125, 50, 0.12)',
              padding: '2px 8px',
              borderRadius: '10px',
            }}
          >
            {isComplimentary ? 'FIRST LOOK ACTIVE' : 'MEMBER ACTIVE'}
          </span>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '24px 24px 44px 24px',
            textAlign: 'left',
            maxWidth: '880px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Editorial Kickers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isDark ? '#F9AAAD' : '#A1525F',
              }}
            >
              WELCOME TO VENNZ
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              lineHeight: '1.2',
              fontWeight: 400,
              color: isDark ? '#FDF3F5' : '#462037',
              margin: '0 0 14px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {isComplimentary ? 'Your First Look is complimentary.' : `Welcome, ${profile.firstName?.trim() || 'Member'}.`}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.55',
              color: isDark ? '#D4A2AC' : '#683A46',
              margin: '0 0 28px 0',
            }}
          >
            {isComplimentary
              ? 'Experience meaningful connections, curated introductions and the VennZ community — completely complimentary for 24 hours.'
              : 'Your membership is active with unlimited access to verified, hand-reviewed members, private mixers, and priority events.'}
          </p>

          {/* Section: Your First Look includes */}
          <div
            style={{
              backgroundColor: isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(236, 209, 216, 0.65)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '18px',
              border: isDark ? '1.5px solid rgba(161, 82, 95, 0.35)' : '1.5px solid rgba(199, 87, 124, 0.25)',
              padding: '22px 20px',
              boxShadow: isDark ? 'none' : '0 4px 20px rgba(70, 32, 55, 0.08)',
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: isDark ? '#F9AAAD' : '#A1525F',
                marginBottom: '16px',
              }}
            >
              {isComplimentary ? 'Your First Look includes' : 'Your membership includes'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(isComplimentary
                ? [
                    { left: '20', label: 'Curated introductions' },
                    { left: '5', label: 'Connection requests' },
                    { left: 'Unlimited', label: 'Matches' },
                    { left: 'Access', label: 'Mixers' },
                    { left: 'Verified', label: 'Hand-reviewed members' },
                  ]
                : [
                    { left: 'Unlimited', label: 'Curated introductions' },
                    { left: '4 Monthly', label: 'Invitations' },
                    { left: 'Unlimited', label: 'Matches & Chat' },
                    { left: 'Full Access', label: 'Member mixers & events' },
                    { left: 'Verified', label: 'Hand-reviewed members' },
                  ]
              ).map((item, idx, arr) => (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      lineHeight: '1.4',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                        minWidth: '76px',
                      }}
                    >
                      {item.left}
                    </span>
                    <span style={{ color: isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.4)', fontWeight: 600 }}>—</span>
                    <span style={{ color: isDark ? '#F3EEE9' : '#272124', fontWeight: 500 }}>{item.label}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Timer note: Your First Look ends in 24 hours. */}
          {isComplimentary && (
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                letterSpacing: '0.03em',
                color: isDark ? '#B3A1A8' : '#7A6B74',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              Your First Look ends in 24 hours.
            </div>
          )}

          {/* Quick Action Button: START YOUR FIRST LOOK → */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                alert('Discover feed ready! Coming up next in the app.');
              }
            }}
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '27px',
              background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
              color: '#FDF3F5',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 22px rgba(20, 14, 28, 0.5), 0 0 16px rgba(161, 82, 95, 0.3)',
              transition: 'background 0.2s ease, transform 0.15s ease, color 0.2s ease',
              marginBottom: '20px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)';
              e.currentTarget.style.color = '#140E1C';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
              e.currentTarget.style.color = '#FDF3F5';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{isComplimentary ? 'START YOUR FIRST LOOK' : 'START EXPLORING'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          {/* Home Indicator */}
          {showHomeIndicator && (
            <div style={{ paddingBottom: '16px', marginTop: 'auto' }}>
              <div
                style={{
                  width: '134px',
                  height: '5px',
                  backgroundColor: isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.3)',
                  borderRadius: '9999px',
                  margin: '0 auto',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
