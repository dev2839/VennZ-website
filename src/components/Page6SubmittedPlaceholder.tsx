import React from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page6SubmittedPlaceholderProps {
  onBack: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page6SubmittedPlaceholder: React.FC<Page6SubmittedPlaceholderProps> = ({
  onBack,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { profile } = useAuth();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#F7F3EE',
        color: 'var(--color-espresso)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Background with continuous parchment botanical texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/profile-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.94,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(247, 243, 238, 0.42)',
          zIndex: 1,
        }}
      />

      {/* Top Region */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {showStatusBar && <StatusBar variant="dark" />}

        <div style={{ padding: '10px 24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-mulberry)',
              cursor: 'pointer',
              padding: '8px 10px 8px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </button>
        </div>
      </div>

      {/* Center Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 28px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'rgba(46, 125, 50, 0.12)',
            color: '#2E7D32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '32px',
            lineHeight: '1.2',
            color: 'var(--color-mulberry)',
            margin: 0,
          }}
        >
          Application Submitted!
        </h1>

        <p style={{ fontSize: '14.5px', lineHeight: '1.5', color: '#5E4E58', margin: 0 }}>
          Thank you, <strong>{profile.firstName || 'Member'}</strong>. Your application to VennZ has been received and is now hand-reviewed by our membership committee.
        </p>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.76)',
            borderRadius: '14px',
            border: '1px solid rgba(73, 40, 61, 0.16)',
            padding: '16px 20px',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'left',
            fontSize: '13px',
            color: '#5E4E58',
            marginTop: '8px',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-mulberry)', marginBottom: '4px' }}>
            Application Status:
          </div>
          <div>
            Review in progress · Notifications will be sent to your registered phone number.
          </div>
        </div>
      </div>

      {/* Bottom Spacer & Home Indicator */}
      <div style={{ position: 'relative', zIndex: 10, padding: '24px', textAlign: 'center' }}>
        {showHomeIndicator && (
          <div
            style={{
              width: '134px',
              height: '4px',
              backgroundColor: 'rgba(39, 33, 36, 0.4)',
              borderRadius: '2px',
              margin: '0 auto',
            }}
          />
        )}
      </div>
    </div>
  );
};
