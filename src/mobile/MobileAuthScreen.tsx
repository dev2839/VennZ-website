import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ModalPortal } from '../components/ModalPortal';
import { googleAuth, type GoogleUserProfile } from '../services/googleAuth';
import { appleAuth } from '../services/appleAuth';

interface MobileAuthScreenProps {
  onBack: () => void;
  onContinueToOtp?: (identifier: string) => void;
  onSuccess?: () => void;
}

export const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({
  onBack,
  onContinueToOtp,
  onSuccess,
}) => {
  const {
    setEmailAuth,
    setGoogleAuth,
    setAppleAuth,
    appearanceMode,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [oauthModal, setOauthModal] = useState<{
    isOpen: boolean;
    provider: 'google' | 'apple';
    title: string;
    message: string;
    missingEnv?: string;
    showDemoOption?: boolean;
  } | null>(null);

  // Auto-play mobile video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleAuthCompletion = (identifier?: string) => {
    if (onSuccess) {
      onSuccess();
    } else if (onContinueToOtp) {
      onContinueToOtp(identifier || 'member');
    }
  };

  const handleGoogleSuccess = (profile: GoogleUserProfile) => {
    setGoogleAuth({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    });
    handleAuthCompletion(profile.email);
  };

  const handleGoogleError = (error: string) => {
    setOauthModal({
      isOpen: true,
      provider: 'google',
      title: 'Google Sign-In Notice',
      message: error,
      showDemoOption: true,
    });
  };

  const handleGoogleSignIn = async () => {
    const result = await googleAuth.initiateGoogleSignIn(
      (profile) => handleGoogleSuccess(profile),
      (error) => handleGoogleError(error)
    );

    if (result.status === 'missing_config') {
      setOauthModal({
        isOpen: true,
        provider: 'google',
        title: 'Google OAuth Setup',
        message:
          'To connect with your personal Google account, your Google OAuth 2.0 Client ID needs to be configured. You can continue right now using our verified Demo Account.',
        missingEnv: 'VITE_GOOGLE_CLIENT_ID',
        showDemoOption: true,
      });
    } else if (result.status === 'error') {
      setOauthModal({
        isOpen: true,
        provider: 'google',
        title: 'Google Authentication',
        message: result.message || 'Unable to connect with Google.',
        showDemoOption: true,
      });
    }
  };

  const handleAppleSignIn = async () => {
    const res = await appleAuth.initiateAppleSignIn(
      (profile) => {
        setAppleAuth();
        if (profile.email) {
          setEmailAuth(profile.email, profile.name);
        }
        handleAuthCompletion(profile.email);
      },
      (error) => {
        setOauthModal({
          isOpen: true,
          provider: 'apple',
          title: 'Apple Sign-In Notice',
          message: error,
          showDemoOption: true,
        });
      }
    );

    if (res.status === 'pending_configuration') {
      setOauthModal({
        isOpen: true,
        provider: 'apple',
        title: 'Apple Sign-In Notice',
        message: 'Apple Sign-In requires configuration. You can test right now with our verified Demo Account.',
        missingEnv: 'VITE_APPLE_CLIENT_ID',
        showDemoOption: true,
      });
    }
  };

  const handleDemoAppleSignIn = () => {
    setOauthModal(null);
    setAppleAuth();
    setEmailAuth('priya.apple@icloud.com', 'Priya Patel');
    handleAuthCompletion('priya.apple@icloud.com');
  };

  const handleDemoGoogleSignIn = () => {
    setOauthModal(null);
    setGoogleAuth({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    });
    handleAuthCompletion('rahul.sharma@gmail.com');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        backgroundColor: '#140E1C',
        overflowX: 'hidden',
      }}
    >
      {/* 1. FIXED BACKGROUND VIDEO: Covers 100% of mobile screen, never cuts in half, never leaves blank screen */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
          backgroundColor: '#140E1C',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/auth-twilight.jpg"
          preload="auto"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            opacity: 0.94,
            filter: 'brightness(104%) contrast(98%)',
          }}
        >
          <source src="/videos/auth-loop-mobile.mp4" media="(max-width: 767px)" type="video/mp4" />
        <source src="/videos/auth-loop.mp4" type="video/mp4" />
          <source src="/videos/auth-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. Fixed Mobile Scrim to protect readability & zero GPU lag */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(20, 14, 28, 0.62) 0%, rgba(20, 14, 28, 0.42) 35%, rgba(20, 14, 28, 0.85) 100%)',
        }}
      />

      {/* 3. MOBILE VIEWPORT CONTAINER */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 16px calc(24px + env(safe-area-inset-bottom, 16px))',
          boxSizing: 'border-box',
        }}
      >
        {/* Mobile Top Header: Back Button & VennZ Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: 'env(safe-area-inset-top, 8px)',
            marginBottom: '20px',
          }}
        >
          {/* Back Pill Button */}
          <button
            onClick={onBack}
            type="button"
            aria-label="Back to welcome page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(70, 32, 55, 0.65)',
              border: '1px solid rgba(161, 82, 95, 0.35)',
              borderRadius: '999px',
              padding: '8px 14px',
              color: '#F9AAAD',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </button>

          {/* VennZ Logo */}
          <div onClick={onBack} style={{ cursor: 'pointer' }}>
            <img
              src="/vennz-logo.png"
              alt="VennZ"
              style={{
                height: '30px',
                width: 'auto',
                maxWidth: '110px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Spacer for symmetrical header */}
          <div style={{ width: '65px' }} />
        </div>

        {/* Center / Auth Panel: Cleanly centered, 100% visible, zero button clipping */}
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            margin: 'auto',
            backgroundColor: 'rgba(30, 16, 28, 0.88)',
            border: '1px solid rgba(161, 82, 95, 0.35)',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            padding: '24px 18px',
            boxSizing: 'border-box',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Badge & Title */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(161, 82, 95, 0.22)',
                border: '1px solid rgba(249, 170, 173, 0.3)',
                color: '#F9AAAD',
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              <span>✦</span>
              <span>Exclusive Circle Access</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#FDF3F5',
                margin: '0 0 6px 0',
                lineHeight: 1.25,
              }}
            >
              Welcome to VennZ
            </h1>

            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.5,
                color: '#F8E2E6',
                opacity: 0.85,
                margin: 0,
              }}
            >
              Sign in with Google or Apple to access your curated circle and private introductions.
            </p>
          </div>

          {/* Social Authentication Suite: 100% width, fully visible, comfortable 50px touch targets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                height: '50px',
                backgroundColor: 'rgba(70, 32, 55, 0.75)',
                border: '1.5px solid rgba(161, 82, 95, 0.45)',
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#FDF3F5',
                fontSize: '15.5px',
                fontWeight: 600,
                cursor: 'pointer',
                touchAction: 'manipulation',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8 0-1 .2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.3L1.2 16C3.1 19.8 7.2 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Continue with Apple */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              style={{
                width: '100%',
                height: '50px',
                backgroundColor: 'rgba(70, 32, 55, 0.75)',
                border: '1.5px solid rgba(161, 82, 95, 0.45)',
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#FDF3F5',
                fontSize: '15.5px',
                fontWeight: 600,
                cursor: 'pointer',
                touchAction: 'manipulation',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.79 1.09-1.88.97-2.89-.93.04-2.07.62-2.73 1.41-.58.68-1.09 1.77-.95 2.83 1.05.08 2.06-.56 2.71-1.35z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Privacy & Legal Disclaimer */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid rgba(161, 82, 95, 0.25)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                lineHeight: 1.45,
                color: isDark ? '#D4A2AC' : '#8A5868',
                margin: 0,
              }}
            >
              By continuing, you agree to VennZ Community Standards and Privacy Policy. Private & verified community.
            </p>
          </div>
        </div>

        {/* Bottom Safety / Encryption Note */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '16px',
            fontSize: '12px',
            color: '#F9AAAD',
            opacity: 0.8,
          }}
        >
          <span>🔒 DigiLocker Verified & 256-Bit Encrypted</span>
        </div>
      </div>

      {/* OAuth Setup & Demo Fallback Modal */}
      {oauthModal && oauthModal.isOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '360px',
                backgroundColor: '#1E1220',
                border: '1px solid rgba(161, 82, 95, 0.45)',
                borderRadius: '18px',
                padding: '22px 18px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#FDF3F5', margin: '0 0 10px' }}>
                {oauthModal.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#F8E2E6', lineHeight: 1.5, margin: '0 0 18px' }}>
                {oauthModal.message}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {oauthModal.showDemoOption && (
                  <button
                    type="button"
                    onClick={oauthModal.provider === 'apple' ? handleDemoAppleSignIn : handleDemoGoogleSignIn}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                      color: '#FFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Continue with Demo {oauthModal.provider === 'apple' ? 'Apple' : 'Google'} Account →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOauthModal(null)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    border: '1px solid rgba(161, 82, 95, 0.3)',
                    background: 'transparent',
                    color: '#F9AAAD',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
