import React from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page4ProfilePlaceholderProps {
  onBack: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page4ProfilePlaceholder: React.FC<Page4ProfilePlaceholderProps> = ({
  onBack,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { phoneNumber, countryCode } = useAuth();

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
        overflow: 'hidden',
        backgroundColor: '#100c0e',
        color: 'var(--color-warm-porcelain)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background with Ambient Dark Mulberry Tone */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 20%, #3a1d2e 0%, #100c0e 75%)',
          zIndex: 1,
        }}
      />

      {/* Top Header Region */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {showStatusBar && <StatusBar />}

        {/* Back Button */}
        <div style={{ padding: '8px 24px 0 20px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-warm-porcelain)',
              cursor: 'pointer',
              padding: '8px',
              marginLeft: '-8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center Content: Route & State Confirmation */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Verification Success Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(73, 40, 61, 0.45)',
            border: '1.5px solid var(--color-dusty-lilac)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(179, 154, 174, 0.25)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-porcelain)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            margin: '0 0 8px 0',
            color: 'var(--color-warm-porcelain)',
          }}
        >
          Phone Verified
        </h2>

        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--color-dusty-lilac)',
            margin: '0 0 24px 0',
          }}
        >
          Route <code style={{ color: 'var(--color-warm-porcelain)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>/join/profile</code>
        </p>

        {/* State Summary Card */}
        <div
          style={{
            width: '100%',
            padding: '18px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(39, 33, 36, 0.75)',
            border: '1px solid rgba(243, 238, 233, 0.12)',
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-mushroom)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
            }}
          >
            Verified Member State
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-warm-porcelain)' }}>
            {countryCode || '+91'} {phoneNumber || '6896568960'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-dusty-lilac)', marginTop: '4px' }}>
            Status: OTP Verification Successful (Code: 123456)
          </div>
        </div>

        <p
          style={{
            fontSize: '13.5px',
            lineHeight: '1.5',
            color: 'rgba(243, 238, 233, 0.7)',
            margin: 0,
          }}
        >
          Page 4 (Profile Setup) will be implemented in the next phase after Page 3 is reviewed and approved.
        </p>
      </div>

      {/* Bottom Action */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 20px 24px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '9999px',
            border: '1px solid rgba(243, 238, 233, 0.25)',
            backgroundColor: 'transparent',
            color: 'var(--color-warm-porcelain)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14.5px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Return to Verification (Page 3)
        </button>

        {showHomeIndicator && (
          <div
            style={{
              width: '134px',
              height: '5px',
              backgroundColor: 'rgba(243, 238, 233, 0.45)',
              borderRadius: '9999px',
              margin: '16px auto 4px auto',
            }}
          />
        )}
      </div>
    </div>
  );
};
