import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ModalPortal } from './ModalPortal';
import { LivingCinematicBackground } from './LivingCinematicBackground';
import { googleAuth, type GoogleUserProfile } from '../services/googleAuth';
import { appleAuth } from '../services/appleAuth';

interface Page2AuthScreenProps {
  onBack: () => void;
  onContinueToOtp?: (identifier: string) => void;
  onSuccess?: () => void;
  initialStep?: 'phone' | 'otp' | 'email';
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page2AuthScreen: React.FC<Page2AuthScreenProps> = ({
  onBack,
  onContinueToOtp,
  onSuccess,
}) => {
  const {
    setEmailAuth,
    setGoogleAuth,
    setAppleAuth,
    appearanceMode,
    setAppearanceMode,
    notifications = [],
    unreadNotificationsCount = 0,
    markNotificationsAsRead,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Notifications dropdown
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Native Google GIS button mount container
  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);

  // OAuth Modal state (informative dialog with Demo Account fallback)
  const [oauthModal, setOauthModal] = useState<{
    isOpen: boolean;
    provider: 'google' | 'apple';
    title: string;
    message: string;
    missingEnv?: string;
    showDemoOption?: boolean;
  } | null>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-load Google Identity Services script on mount for seamless instant response across all devices
  useEffect(() => {
    googleAuth.loadGoogleScript().then(() => {
      if (googleAuth.isConfigured() && googleBtnContainerRef.current) {
        googleAuth.renderGoogleButton(
          googleBtnContainerRef.current,
          (profile) => handleGoogleSuccess(profile),
          (error) => handleGoogleError(error)
        );
      }
    });
  }, []);

  const handleAuthCompletion = (identifier?: string) => {
    if (onSuccess) {
      onSuccess();
    } else if (onContinueToOtp) {
      onContinueToOtp(identifier || 'member');
    }
  };

  // Google OAuth Handlers
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
          'To connect with your personal Google account, your Google OAuth 2.0 Client ID (VITE_GOOGLE_CLIENT_ID) needs to be configured in your environment or Vercel dashboard. You can continue right now using our verified Demo Google Account.',
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

  // Apple OAuth Handler
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
        title: 'Apple Sign-In Configuration',
        message:
          'Apple Sign-In requires an Apple Services ID (VITE_APPLE_CLIENT_ID) configured in your environment or Vercel dashboard. You can test right now with our verified Demo Apple Account.',
        missingEnv: 'VITE_APPLE_CLIENT_ID',
        showDemoOption: true,
      });
    }
  };

  // Fallback demo Apple sign-in when client ID is not yet configured
  const handleDemoAppleSignIn = () => {
    setOauthModal(null);
    setAppleAuth();
    setEmailAuth('priya.apple@icloud.com', 'Priya Patel');
    handleAuthCompletion('priya.apple@icloud.com');
  };

  // Fallback demo Google sign-in when client ID is not yet configured
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
    <LivingCinematicBackground>
      <style>{`
        .auth-panel-card {
          will-change: transform, opacity;
        }

        .primary-action-btn {
          background: linear-gradient(135deg, #A1525F 0%, #C7577C 100%);
          box-shadow: 0 8px 24px rgba(70, 32, 55, 0.55), 0 0 1px 1px rgba(249, 170, 173, 0.2) inset;
          transition: all 0.22s ease;
        }
        .primary-action-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%);
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(161, 82, 95, 0.55), 0 0 1px 1px rgba(253, 243, 245, 0.3) inset;
        }
        .primary-action-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .social-auth-btn {
          transition: all 0.2s ease;
        }
        .social-auth-btn:hover {
          background-color: rgba(90, 42, 70, 0.85) !important;
          border-color: #F9AAAD !important;
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(161, 82, 95, 0.35) !important;
        }
        .social-auth-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Main Responsive Viewport Grid */}
      <div
        style={{
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: 'clamp(20px, 4vw, 48px)',
          paddingTop: 'clamp(80px, 12vh, 120px)',
          paddingBottom: 'clamp(32px, 5vh, 60px)',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Top-Left Brand & Navigation */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(20px, 3.5vh, 32px)',
            left: 'clamp(20px, 4vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            zIndex: 35,
          }}
        >
          {/* VennZ Logo */}
          <div
            onClick={onBack}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              userSelect: 'none',
            }}
            title="Return to welcome"
          >
            <img
              src="/vennz-logo.png"
              alt="VennZ"
              style={{
                height: '34px',
                width: 'auto',
                maxWidth: '130px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8)) drop-shadow(0 4px 14px rgba(161, 82, 95, 0.4))',
              }}
            />
          </div>

          {/* Back Navigation Button */}
          <button
            onClick={onBack}
            type="button"
            aria-label="Back to welcome page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(70, 32, 55, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(161, 82, 95, 0.3)',
              borderRadius: '100px',
              padding: '9px 16px',
              color: '#F9AAAD',
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(104, 58, 70, 0.65)';
              e.currentTarget.style.borderColor = '#C7577C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(70, 32, 55, 0.45)';
              e.currentTarget.style.borderColor = 'rgba(161, 82, 95, 0.3)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Top-Right Action Suite (Notifications & Theme Toggle) */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(20px, 3.5vh, 32px)',
            right: 'clamp(20px, 4vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 35,
          }}
        >
          {/* Notifications Icon Button */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                const next = !notificationsOpen;
                setNotificationsOpen(next);
                if (next && unreadNotificationsCount > 0) {
                  markNotificationsAsRead();
                }
              }}
              aria-label="View notifications"
              title="Notifications"
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(70, 32, 55, 0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(161, 82, 95, 0.3)',
                color: '#F9AAAD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(104, 58, 70, 0.65)';
                e.currentTarget.style.borderColor = '#C7577C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(70, 32, 55, 0.45)';
                e.currentTarget.style.borderColor = 'rgba(161, 82, 95, 0.3)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#C94A4A',
                    boxShadow: '0 0 8px #C94A4A',
                  }}
                />
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'rgba(30, 16, 28, 0.95)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(161, 82, 95, 0.35)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FDF3F5' }}>Notifications</span>
                  <span style={{ fontSize: '13px', color: '#F9AAAD' }}>{unreadNotificationsCount} new</span>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#F8E2E6', opacity: 0.7, margin: 0, textAlign: 'center', padding: '12px 0' }}>
                    No new notifications
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(70, 32, 55, 0.4)',
                          fontSize: '14px',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#FDF3F5', marginBottom: '2px' }}>{notif.title}</div>
                        <div style={{ color: '#F8E2E6', opacity: 0.8, fontSize: '13px' }}>{notif.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setAppearanceMode(isDark ? 'ivory' : 'after-dark')}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Ivory theme' : 'Switch to After Dark theme'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(70, 32, 55, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(161, 82, 95, 0.3)',
              color: '#F9AAAD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(104, 58, 70, 0.65)';
              e.currentTarget.style.borderColor = '#C7577C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(70, 32, 55, 0.45)';
              e.currentTarget.style.borderColor = 'rgba(161, 82, 95, 0.3)';
            }}
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Ambient Left Brand Typography (Desktop only) */}
        <div
          className="hidden-on-mobile"
          style={{
            position: 'absolute',
            left: 'clamp(48px, 6vw, 96px)',
            bottom: 'clamp(48px, 6vh, 96px)',
            maxWidth: '480px',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              lineHeight: 1.15,
              color: '#FDF3F5',
              fontWeight: 400,
              margin: '0 0 14px 0',
              textShadow: '0 2px 14px rgba(10, 6, 14, 0.95), 0 0 28px rgba(20, 14, 28, 0.85)',
            }}
          >
            Real people.<br />
            <span style={{ color: '#F9AAAD', fontStyle: 'italic', fontFamily: 'var(--font-serif-italic)' }}>
              Meaningful connections.
            </span>
          </h2>

          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#F8E2E6',
              margin: 0,
              opacity: 0.9,
              textShadow: '0 1px 12px rgba(10, 6, 14, 0.95), 0 0 18px rgba(20, 14, 28, 0.8)',
            }}
          >
            An invite-only ecosystem with zero anonymous profiles, identity verification, and intentional matchmaking.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div
          className="auth-panel-card"
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'rgba(30, 16, 28, 0.74)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid rgba(161, 82, 95, 0.35)',
            borderRadius: '24px',
            boxShadow: '0 28px 68px rgba(10, 6, 14, 0.75), 0 0 1px 1px rgba(249, 170, 173, 0.12) inset',
            padding: 'clamp(32px, 5vw, 44px)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            margin: 0,
          }}
        >
          {/* Editorial Card Badge & Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(161, 82, 95, 0.22)',
                border: '1px solid rgba(249, 170, 173, 0.3)',
                color: '#F9AAAD',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              <span>✦</span>
              <span>Exclusive Circle Access</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(26px, 3.2vw, 32px)',
                fontWeight: 400,
                color: '#FDF3F5',
                letterSpacing: '0.01em',
                margin: '0 0 10px 0',
              }}
            >
              Welcome to VennZ
            </h1>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.55,
                color: '#F8E2E6',
                opacity: 0.85,
                margin: 0,
              }}
            >
              Sign in with Google or Apple to access your curated circle and private introductions.
            </p>
          </div>

          {/* Social Authentication Suite (Google & Apple Only) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '12px' }}>
            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="social-auth-btn"
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'rgba(70, 32, 55, 0.65)',
                border: '1.5px solid rgba(161, 82, 95, 0.45)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#FDF3F5',
                fontSize: '17px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* Official Multi-Color Google G SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Continue with Apple */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              className="social-auth-btn"
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'rgba(55, 26, 44, 0.65)',
                border: '1.5px solid rgba(161, 82, 95, 0.45)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#FDF3F5',
                fontSize: '17px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.63 1.35-.58.67-1.09 1.74-.95 2.78 1.01.08 2.05-.51 2.66-1.26z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Privacy & Terms Note */}
          <p
            style={{
              fontSize: '13px',
              lineHeight: 1.55,
              color: '#F8E2E6',
              opacity: 0.6,
              textAlign: 'center',
              marginTop: '22px',
              marginBottom: 0,
            }}
          >
            By continuing, you agree to VennZ’s Membership Terms, Community Integrity Standards, and Privacy Policy.
          </p>
        </div>
      </div>

      {/* OAuth Configuration & Demo Account Dialog */}
      {oauthModal && oauthModal.isOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(20, 14, 28, 0.85)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setOauthModal(null)}
          >
            <div
              style={{
                backgroundColor: '#35182B',
                border: '1px solid rgba(161, 82, 95, 0.45)',
                borderRadius: '22px',
                padding: '28px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
                color: '#FDF3F5',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(161, 82, 95, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F9AAAD',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '22px',
                    margin: 0,
                    color: '#F9AAAD',
                  }}
                >
                  {oauthModal.title}
                </h3>
              </div>

              <p style={{ fontSize: '15.5px', lineHeight: 1.6, color: '#F8E2E6', margin: '0 0 16px 0', opacity: 0.9 }}>
                {oauthModal.message}
              </p>

              {oauthModal.missingEnv && (
                <div
                  style={{
                    background: 'rgba(20, 14, 28, 0.7)',
                    border: '1px solid rgba(161, 82, 95, 0.3)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#F9AAAD',
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '13px', opacity: 0.7 }}>Environment Variable:</span>
                  <code>{oauthModal.missingEnv}</code>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {oauthModal.showDemoOption && (
                  <button
                    type="button"
                    onClick={oauthModal.provider === 'apple' ? handleDemoAppleSignIn : handleDemoGoogleSignIn}
                    className="primary-action-btn"
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#FDF3F5',
                      fontWeight: 600,
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>
                      {oauthModal.provider === 'apple'
                        ? 'Continue with Demo Apple Account (Priya Patel) →'
                        : 'Continue with Demo Google Account (Rahul Sharma) →'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOauthModal(null)}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '12px',
                    border: '1px solid rgba(161, 82, 95, 0.3)',
                    background: 'rgba(70, 32, 55, 0.4)',
                    color: '#F8E2E6',
                    fontSize: '15.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(70, 32, 55, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(70, 32, 55, 0.4)';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </LivingCinematicBackground>
  );
};
