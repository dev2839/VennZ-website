import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';
import { googleAuth } from '../services/googleAuth';
import { appleAuth } from '../services/appleAuth';

interface Page2AuthScreenProps {
  onBack: () => void;
  onContinueToOtp: (phoneNumber: string) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page2AuthScreen: React.FC<Page2AuthScreenProps> = ({
  onBack,
  onContinueToOtp,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { phoneNumber: savedPhone, setPhoneAuth, setGoogleAuth } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(savedPhone || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [oauthModal, setOauthModal] = useState<{
    isOpen: boolean;
    provider: 'google' | 'apple';
    message: string;
    missingEnv?: string;
  } | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only numbers, max 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (phoneError) setPhoneError(null);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = phoneNumber.trim();

    if (!raw) {
      setPhoneError('Please enter your 10-digit mobile number');
      return;
    }

    // Validate standard 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(raw)) {
      if (raw.length !== 10) {
        setPhoneError(`Mobile number must be 10 digits (currently ${raw.length})`);
      } else {
        setPhoneError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
      }
      return;
    }

    // Save in Auth Context and navigate to OTP route
    setPhoneAuth(raw);
    onContinueToOtp(raw);
  };

  const handleGoogleSignIn = async () => {
    const result = await googleAuth.initiateGoogleSignIn(
      (profile) => {
        setGoogleAuth({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });
        // Navigates to onboarding continuation
        onContinueToOtp(`google:${profile.email}`);
      },
      (error) => {
        setOauthModal({
          isOpen: true,
          provider: 'google',
          message: error,
        });
      }
    );

    if (result.status === 'missing_config') {
      setOauthModal({
        isOpen: true,
        provider: 'google',
        message:
          'Google OAuth 2.0 requires a valid Client ID. The real Google authentication flow is fully wired to Google Identity Services.',
        missingEnv: 'VITE_GOOGLE_CLIENT_ID',
      });
    } else if (result.status === 'error') {
      setOauthModal({
        isOpen: true,
        provider: 'google',
        message: result.message || 'Failed to initialize Google OAuth.',
      });
    }
  };

  const handleAppleSignIn = async () => {
    const res = await appleAuth.initiateAppleSignIn();
    if (res.status === 'pending_configuration') {
      setOauthModal({
        isOpen: true,
        provider: 'apple',
        message:
          'Apple Sign-In architecture is ready. Apple requires an active Apple Developer Team Service ID (VITE_APPLE_CLIENT_ID) and backend private key verification.',
        missingEnv: 'VITE_APPLE_CLIENT_ID',
      });
    }
  };

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
      }}
    >
      {/* Clean Foliage Bokeh Background Asset */}
      <img
        src="/auth-bg.png"
        alt="The Inner Circle foliage twilight background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 1,
          pointerEvents: 'none',
          filter: 'blur(4px)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Atmospheric Vignette & Contrast Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, rgba(16, 12, 14, 0.42) 0%, rgba(16, 12, 14, 0.18) 25%, rgba(16, 12, 14, 0.45) 55%, rgba(16, 12, 14, 0.82) 80%, rgba(16, 12, 14, 0.94) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          minHeight: '100%',
          justifyContent: 'space-between',
          padding: '24px 0',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Region: Status Bar & Back Button */}
        <div>
          {showStatusBar && <StatusBar />}

          {/* Back Arrow Button */}
          <div style={{ padding: '8px 24px 0 20px' }}>
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to Welcome screen"
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
                transition: 'opacity 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.75';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
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

          {/* Heading & Subtitle */}
          <div style={{ padding: '24px 24px 0 24px', textAlign: 'left' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                lineHeight: '1.18',
                fontWeight: 400,
                color: 'var(--color-warm-porcelain)',
                letterSpacing: '-0.01em',
                margin: 0,
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
              }}
            >
              Welcome back,
              <br />
              let's continue
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px',
                lineHeight: '1.45',
                color: 'rgba(243, 238, 233, 0.85)',
                margin: '12px 0 0 0',
                textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              Enter your mobile number to log in
              <br />
              or create a new account.
            </p>
          </div>
        </div>

        {/* Lower Region: Input, Continue Button, Social Auth & Legal */}
        <div style={{ padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleContinue}>
            {/* Phone Number Input Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'rgba(26, 20, 24, 0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: isFocused
                  ? '1px solid rgba(243, 238, 233, 0.55)'
                  : phoneError
                  ? '1px solid #e05a5a'
                  : '1px solid rgba(243, 238, 233, 0.22)',
                boxShadow: isFocused
                  ? '0 0 0 3px rgba(243, 238, 233, 0.08)'
                  : '0 4px 16px rgba(0, 0, 0, 0.2)',
                padding: '0 16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Country Code Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-warm-porcelain)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15.5px',
                  fontWeight: 500,
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                <span>+91</span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.8 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Vertical Divider */}
              <div
                style={{
                  width: '1px',
                  height: '24px',
                  backgroundColor: 'rgba(243, 238, 233, 0.25)',
                  margin: '0 14px',
                }}
              />

              {/* Mobile Number Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Mobile number"
                autoComplete="tel-national"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-warm-porcelain)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15.5px',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                }}
              />
            </div>

            {/* Validation Error Message */}
            {phoneError && (
              <div
                style={{
                  color: '#ff8a8a',
                  fontSize: '12px',
                  marginTop: '6px',
                  textAlign: 'left',
                  paddingLeft: '4px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {phoneError}
              </div>
            )}

            {/* Continue Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '54px',
                backgroundColor: 'var(--color-warm-porcelain)',
                color: 'var(--color-espresso)',
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '18px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-warm-porcelain)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Continue
            </button>
          </form>

          {/* "or" Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '22px 0',
              gap: '14px',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: 'rgba(243, 238, 233, 0.18)',
              }}
            />
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(243, 238, 233, 0.65)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
              }}
            >
              or
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: 'rgba(243, 238, 233, 0.18)',
              }}
            />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: 'rgba(26, 20, 24, 0.45)',
              border: '1px solid rgba(243, 238, 233, 0.25)',
              borderRadius: '9999px',
              color: 'var(--color-warm-porcelain)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '12px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 20, 24, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(243, 238, 233, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 20, 24, 0.45)';
              e.currentTarget.style.borderColor = 'rgba(243, 238, 233, 0.25)';
            }}
          >
            {/* Google "G" 4-color SVG Logo */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Continue with Apple */}
          <button
            type="button"
            onClick={handleAppleSignIn}
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: 'rgba(26, 20, 24, 0.45)',
              border: '1px solid rgba(243, 238, 233, 0.25)',
              borderRadius: '9999px',
              color: 'var(--color-warm-porcelain)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '24px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 20, 24, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(243, 238, 233, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 20, 24, 0.45)';
              e.currentTarget.style.borderColor = 'rgba(243, 238, 233, 0.25)';
            }}
          >
            {/* Apple Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77.99.08 2.03-.51 2.67-1.27z" />
            </svg>
            <span>Continue with Apple</span>
          </button>

          {/* Terms and Privacy Footer */}
          <div
            style={{
              textAlign: 'left',
              paddingBottom: showHomeIndicator ? '8px' : '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                lineHeight: '1.5',
                color: 'rgba(243, 238, 233, 0.65)',
                margin: 0,
              }}
            >
              By continuing, you agree to our{' '}
              <span
                style={{
                  color: 'var(--color-warm-porcelain)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2.5px',
                  cursor: 'pointer',
                }}
              >
                Terms & Conditions
              </span>{' '}
              and{' '}
              <span
                style={{
                  color: 'var(--color-warm-porcelain)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2.5px',
                  cursor: 'pointer',
                }}
              >
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {/* iOS Home Indicator Bar */}
          {showHomeIndicator && (
            <div
              style={{
                width: '134px',
                height: '5px',
                backgroundColor: 'rgba(243, 238, 233, 0.45)',
                borderRadius: '9999px',
                margin: '12px auto 4px auto',
              }}
            />
          )}
        </div>
      </div>

      {/* OAuth Configuration / Status Modal */}
      {oauthModal?.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 8, 10, 0.8)',
            backdropFilter: 'blur(8px)',
            padding: '24px',
          }}
          onClick={() => setOauthModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: 'var(--color-espresso)',
              border: '1px solid rgba(243, 238, 233, 0.15)',
              borderRadius: '24px',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '20px' }}>
                {oauthModal.provider === 'google' ? '🔐' : '🍏'}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  color: 'var(--color-warm-porcelain)',
                  margin: 0,
                }}
              >
                {oauthModal.provider === 'google'
                  ? 'Google OAuth 2.0'
                  : 'Apple Authentication'}
              </h3>
            </div>

            <p
              style={{
                fontSize: '13.5px',
                lineHeight: '1.5',
                color: 'rgba(243, 238, 233, 0.82)',
                margin: '0 0 16px 0',
              }}
            >
              {oauthModal.message}
            </p>

            {oauthModal.missingEnv && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(243, 238, 233, 0.1)',
                  marginBottom: '20px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: 'var(--color-dusty-lilac)',
                }}
              >
                <div style={{ color: 'var(--color-mushroom)', fontSize: '10.5px', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Environment Variable Required
                </div>
                <code>{oauthModal.missingEnv}=your-client-id</code>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOauthModal(null)}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: 'var(--color-warm-porcelain)',
                color: 'var(--color-espresso)',
                fontSize: '14.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
