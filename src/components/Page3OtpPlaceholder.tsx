import React from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page3OtpPlaceholderProps {
  onBack: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page3OtpPlaceholder: React.FC<Page3OtpPlaceholderProps> = ({
  onBack,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { phoneNumber, countryCode, authMethod, googleUser } = useAuth();

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
        backgroundColor: '#151013',
        color: 'var(--color-warm-porcelain)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background with Ambient Dark Mulberry Tone */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 20%, #2f1a27 0%, #151013 70%)',
          zIndex: 1,
        }}
      />

      {/* Top Bar */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {showStatusBar && <StatusBar />}

        {/* Back Button */}
        <div style={{ padding: '8px 24px 0 20px' }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Sign Up / Log In"
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

      {/* Center Notice & Preserved State Display */}
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
        {/* Verification Icon Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(179, 154, 174, 0.15)',
            border: '1px solid rgba(243, 238, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-porcelain)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            margin: '0 0 10px 0',
          }}
        >
          Verification Route
        </h2>

        <p
          style={{
            fontSize: '14.5px',
            lineHeight: '1.5',
            color: 'var(--color-dusty-lilac)',
            margin: '0 0 24px 0',
          }}
        >
          Route <code style={{ color: 'var(--color-warm-porcelain)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>/join/verify-code</code>
        </p>

        {/* Preserved Phone / State Card */}
        <div
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(39, 33, 36, 0.7)',
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
            Preserved Application State
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-warm-porcelain)' }}>
                {authMethod === 'google'
                  ? googleUser?.email || 'Google Account'
                  : `${countryCode} ${phoneNumber || 'No phone entered'}`}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-dusty-lilac)', marginTop: '2px' }}>
                Auth method: {authMethod || 'phone'}
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              style={{
                fontSize: '12.5px',
                color: 'var(--color-warm-porcelain)',
                textDecoration: 'underline',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: 'rgba(243, 238, 233, 0.7)',
            margin: 0,
          }}
        >
          Screen 3 (OTP / Verification Code) will be fully designed and implemented in the next phase after Page 2 is reviewed and approved.
        </p>
      </div>

      {/* Bottom Actions */}
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
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Return to Sign Up / Log In
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
