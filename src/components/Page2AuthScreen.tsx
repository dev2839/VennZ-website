import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LivingCinematicBackground } from './LivingCinematicBackground';
import { otpService } from '../services/otpService';
import { googleAuth } from '../services/googleAuth';
import { appleAuth } from '../services/appleAuth';

interface CountryCodeOption {
  code: string;
  flag: string;
  name: string;
}

const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
];

interface Page2AuthScreenProps {
  onBack: () => void;
  onContinueToOtp?: (phoneNumber: string) => void;
  onSuccess?: () => void;
  initialStep?: 'phone' | 'otp';
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page2AuthScreen: React.FC<Page2AuthScreenProps> = ({
  onBack,
  onContinueToOtp,
  onSuccess,
  initialStep = 'phone',
}) => {
  const { phoneNumber: savedPhone, countryCode: savedCountryCode, setPhoneAuth, setPhoneVerified, setGoogleAuth } = useAuth();

  // Mobile number state
  const [countryCode, setCountryCode] = useState<string>(savedCountryCode || '+91');
  const [phoneNumber, setPhoneNumber] = useState<string>(savedPhone || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState<boolean>(false);

  // OTP Section state (revealed below mobile number on same page)
  const isOtpInitial = (initialStep as 'phone' | 'otp') === 'otp';
  const [otpRevealed, setOtpRevealed] = useState<boolean>(isOtpInitial || Boolean(savedPhone && isOtpInitial));
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number>(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [isResendActive, setIsResendActive] = useState<boolean>(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<boolean>(false);

  // OAuth Modal state
  const [oauthModal, setOauthModal] = useState<{
    isOpen: boolean;
    provider: 'google' | 'apple';
    message: string;
    missingEnv?: string;
  } | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (otpRevealed && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setIsResendActive(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpRevealed, resendCountdown]);

  // Focus first OTP box automatically when OTP is revealed
  useEffect(() => {
    if (otpRevealed) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 350);
    }
  }, [otpRevealed]);

  // Click outside listener for country code dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (phoneError) setPhoneError(null);
  };

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = phoneNumber.trim();

    if (!raw) {
      setPhoneError('Please enter your 10-digit mobile number');
      return;
    }

    // For Indian mobile numbers, ensure valid 10-digit number
    if (countryCode === '+91') {
      const indianMobileRegex = /^[6-9]\d{9}$/;
      if (!indianMobileRegex.test(raw)) {
        if (raw.length !== 10) {
          setPhoneError(`Mobile number must be 10 digits (currently ${raw.length})`);
        } else {
          setPhoneError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
        }
        return;
      }
    } else {
      if (raw.length < 7 || raw.length > 12) {
        setPhoneError('Please enter a valid mobile number');
        return;
      }
    }

    // Persist phone in auth context
    setPhoneAuth(raw);
    if (onContinueToOtp) {
      onContinueToOtp(raw);
    }

    // Reveal OTP section seamlessly below phone number
    setPhoneError(null);
    setOtpRevealed(true);
    setResendCountdown(30);
    setIsResendActive(false);
    setResendNotice(null);
  };

  const handleEditPhoneNumber = () => {
    setOtpRevealed(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
  };

  // OTP Digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, '');

    if (!numeric) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      if (otpError) setOtpError(null);
      return;
    }

    if (numeric.length === 1) {
      const next = [...otpDigits];
      next[index] = numeric;
      setOtpDigits(next);
      if (otpError) setOtpError(null);

      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      // Pasted multiple digits
      handleOtpPasteString(numeric, index);
    }
  };

  const handleOtpPasteString = (pasted: string, startIndex: number = 0) => {
    const clean = pasted.replace(/\D/g, '').slice(0, 6);
    if (!clean) return;

    const next = [...otpDigits];
    for (let i = 0; i < clean.length && startIndex + i < 6; i++) {
      next[startIndex + i] = clean[i];
    }
    setOtpDigits(next);
    if (otpError) setOtpError(null);

    const nextFocus = Math.min(startIndex + clean.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const next = [...otpDigits];
        next[index - 1] = '';
        setOtpDigits(next);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const next = [...otpDigits];
        next[index] = '';
        setOtpDigits(next);
      }
      if (otpError) setOtpError(null);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDemoFill = () => {
    const demoCode = otpService.getDemoCode();
    setOtpDigits(demoCode.split(''));
    setOtpError(null);
    otpInputRefs.current[5]?.focus();
  };

  const handleResendCode = () => {
    if (!isResendActive) return;
    setResendCountdown(30);
    setIsResendActive(false);
    setResendNotice('A new verification code has been dispatched to your mobile number.');
    setTimeout(() => setResendNotice(null), 4000);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('');

    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      const result = await otpService.verifyOtp(code);
      if (result.success) {
        setVerifySuccess(true);
        setPhoneVerified(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (onContinueToOtp) {
            onContinueToOtp(phoneNumber);
          }
        }, 650);
      } else {
        setOtpError(result.error || 'Incorrect code. In demo mode, use 123456');
      }
    } catch {
      setOtpError('Verification request failed. Please check connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    const result = await googleAuth.initiateGoogleSignIn(
      (profile) => {
        setGoogleAuth({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });
        if (onSuccess) onSuccess();
        else if (onContinueToOtp) onContinueToOtp(`google:${profile.email}`);
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
        message: 'Google OAuth requires Client ID configuration.',
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

  // Apple Sign In
  const handleAppleSignIn = async () => {
    const result = await appleAuth.initiateAppleSignIn();
    if (result.status === 'configured') {
      if (onSuccess) onSuccess();
      else if (onContinueToOtp) onContinueToOtp('apple:user');
    } else {
      setOauthModal({
        isOpen: true,
        provider: 'apple',
        message: result.message,
        missingEnv: 'VITE_APPLE_CLIENT_ID',
      });
    }
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <LivingCinematicBackground>
      <style>{`
        /* Continuous entrance animation from previous page */
        @keyframes continuousEntrance {
          0% {
            opacity: 0;
            transform: translate3d(28px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes otpSmoothReveal {
          0% {
            opacity: 0;
            max-height: 0px;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            max-height: 520px;
            transform: translateY(0);
          }
        }

        .auth-panel-card {
          animation: continuousEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        .otp-reveal-container {
          animation: otpSmoothReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, max-height;
        }

        .otp-input-box:focus {
          border-color: #F9AAAD !important;
          box-shadow: 0 0 0 1px #F9AAAD, 0 0 16px rgba(249, 170, 173, 0.35) !important;
          background: rgba(104, 58, 70, 0.7) !important;
        }

        .phone-input-custom:focus {
          border-color: #C7577C !important;
          box-shadow: 0 0 0 1px #C7577C, 0 0 14px rgba(199, 87, 124, 0.3) !important;
        }

        .primary-action-btn {
          background: linear-gradient(135deg, #A1525F 0%, #C7577C 100%);
          box-shadow: 0 8px 24px rgba(70, 32, 55, 0.55), 0 0 1px 1px rgba(249, 170, 173, 0.2) inset;
          transition: all 0.25s ease;
        }
        .primary-action-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%);
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(161, 82, 95, 0.55), 0 0 1px 1px rgba(253, 243, 245, 0.3) inset;
        }
        .primary-action-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .primary-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {/* Main Responsive Viewport Grid */}
      <div
        style={{
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: 'clamp(20px, 4vw, 48px)',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Back navigation button */}
        <button
          onClick={onBack}
          aria-label="Back to welcome page"
          style={{
            position: 'absolute',
            top: 'clamp(20px, 3vh, 32px)',
            left: 'clamp(20px, 4vw, 48px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(70, 32, 55, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(161, 82, 95, 0.3)',
            borderRadius: '100px',
            padding: '10px 18px',
            color: '#F9AAAD',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            zIndex: 30,
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back</span>
        </button>

        {/* Ambient Left Brand Typography (Desktop only - creates luxury balance) */}
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
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '100px',
              background: 'rgba(70, 32, 55, 0.45)',
              border: '1px solid rgba(161, 82, 95, 0.35)',
              backdropFilter: 'blur(12px)',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#F9AAAD' }}>✦</span>
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#F9AAAD',
                fontWeight: 600,
              }}
            >
              Curated Private Membership
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              lineHeight: 1.15,
              color: '#FDF3F5',
              fontWeight: 400,
              margin: '0 0 14px 0',
              textShadow: '0 2px 20px rgba(20, 14, 28, 0.8)',
            }}
          >
            Real people.<br />
            <span style={{ color: '#F9AAAD', fontStyle: 'italic', fontFamily: 'var(--font-serif-italic)' }}>
              Meaningful connections.
            </span>
          </h2>

          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#F8E2E6',
              margin: 0,
              opacity: 0.88,
              textShadow: '0 1px 12px rgba(20, 14, 28, 0.7)',
            }}
          >
            An invite-only ecosystem with zero anonymous profiles, biometric verification, and human matchmaking.
          </p>
        </div>

        {/* Authentication Card (Right-aligned on Desktop, Centered on Mobile) */}
        <div
          className="auth-panel-card"
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'rgba(30, 16, 28, 0.72)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid rgba(161, 82, 95, 0.35)',
            borderRadius: '24px',
            boxShadow: '0 28px 68px rgba(10, 6, 14, 0.75), 0 0 1px 1px rgba(249, 170, 173, 0.12) inset',
            padding: 'clamp(28px, 4vw, 36px)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            marginTop: 'clamp(48px, 6vh, 0px)',
            marginBottom: 'clamp(24px, 4vh, 0px)',
          }}
        >
          {/* Card Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* VennZ Emblem / Logo */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <img
                src="/vennz-logo.png"
                alt="VennZ"
                style={{
                  height: '38px',
                  width: 'auto',
                  maxWidth: '150px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8)) drop-shadow(0 4px 14px rgba(161, 82, 95, 0.4))',
                }}
              />
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '26px',
                fontWeight: 400,
                color: '#FDF3F5',
                letterSpacing: '0.01em',
                margin: '0 0 8px 0',
              }}
            >
              {otpRevealed ? 'Verification Code' : 'Welcome to VennZ'}
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
              {otpRevealed
                ? `Enter the 6-digit code sent to ${countryCode} ${phoneNumber}`
                : 'Enter your mobile number to begin or continue your membership application.'}
            </p>
          </div>

          {/* Form Section 1: Mobile Number Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#F9AAAD',
                }}
              >
                Mobile Number
              </label>

              {/* Edit phone link when in OTP state */}
              {otpRevealed && (
                <button
                  type="button"
                  onClick={handleEditPhoneNumber}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#F9AAAD',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FDF3F5')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#F9AAAD')}
                >
                  Edit number
                </button>
              )}
            </div>

            {/* Combined Country Code + Phone Input Group */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                position: 'relative',
              }}
            >
              {/* Country Code Dropdown Trigger */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  disabled={otpRevealed}
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  aria-label="Select country dial code"
                  style={{
                    height: '52px',
                    padding: '0 14px',
                    backgroundColor: 'rgba(70, 32, 55, 0.65)',
                    border: '1px solid rgba(161, 82, 95, 0.4)',
                    borderRadius: '14px',
                    color: '#FDF3F5',
                    fontSize: '15px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: otpRevealed ? 'default' : 'pointer',
                    opacity: otpRevealed ? 0.75 : 1,
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '17px' }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                  {!otpRevealed && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F9AAAD"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: countryDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                {/* Country Code Dropdown Menu */}
                {countryDropdownOpen && !otpRevealed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '58px',
                      left: 0,
                      width: '240px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      backgroundColor: 'rgba(30, 16, 28, 0.95)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(161, 82, 95, 0.45)',
                      borderRadius: '16px',
                      boxShadow: '0 16px 36px rgba(10, 6, 14, 0.85)',
                      zIndex: 100,
                      padding: '6px',
                    }}
                  >
                    {COUNTRY_CODES.map((item) => (
                      <button
                        key={item.code + item.name}
                        type="button"
                        onClick={() => {
                          setCountryCode(item.code);
                          setCountryDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: item.code === countryCode ? 'rgba(161, 82, 95, 0.35)' : 'transparent',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#FDF3F5',
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (item.code !== countryCode) e.currentTarget.style.backgroundColor = 'rgba(70, 32, 55, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          if (item.code !== countryCode) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{item.flag}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <span style={{ color: '#F9AAAD', fontWeight: 500, fontSize: '13px' }}>{item.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Input Box */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={otpRevealed}
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                  placeholder="98765 43210"
                  className="phone-input-custom"
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 16px',
                    backgroundColor: otpRevealed ? 'rgba(70, 32, 55, 0.35)' : 'rgba(70, 32, 55, 0.65)',
                    border: `1px solid ${
                      phoneError
                        ? '#C7577C'
                        : isPhoneFocused
                        ? '#F9AAAD'
                        : 'rgba(161, 82, 95, 0.4)'
                    }`,
                    borderRadius: '14px',
                    color: '#FDF3F5',
                    fontSize: '16px',
                    letterSpacing: '0.05em',
                    boxSizing: 'border-box',
                    outline: 'none',
                    opacity: otpRevealed ? 0.75 : 1,
                    cursor: otpRevealed ? 'not-allowed' : 'text',
                    transition: 'all 0.2s ease',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !otpRevealed) {
                      e.preventDefault();
                      handleSendOtp();
                    }
                  }}
                />
              </div>
            </div>

            {/* Phone Error Message */}
            {phoneError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F9AAAD',
                  fontSize: '13px',
                  paddingLeft: '4px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{phoneError}</span>
              </div>
            )}

            {/* Continue Button (Visible ONLY BEFORE OTP is revealed) */}
            {!otpRevealed && (
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="primary-action-btn"
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '14px',
                    border: 'none',
                    color: '#FDF3F5',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>Continue</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Form Section 2: OTP Verification Reveal (ON THE SAME PAGE BELOW MOBILE INPUT) */}
          {otpRevealed && (
            <div className="otp-reveal-container" style={{ marginTop: '22px' }}>
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'rgba(161, 82, 95, 0.25)',
                  marginBottom: '20px',
                }}
              />

              {/* 6 OTP Input Boxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#F9AAAD',
                    }}
                  >
                    6-Digit Verification Code
                  </label>

                  {/* Demo fill shortcut for testers */}
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    style={{
                      background: 'rgba(104, 58, 70, 0.5)',
                      border: '1px solid rgba(249, 170, 173, 0.35)',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#F9AAAD',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    title="Click to quickly fill code: 123456"
                  >
                    <span>✦ Demo Fill</span>
                    <span style={{ opacity: 0.7 }}>(123456)</span>
                  </button>
                </div>

                {/* The 6 Digit Boxes */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: 'clamp(6px, 1.8vw, 10px)',
                  }}
                >
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onFocus={() => setFocusedOtpIndex(index)}
                      className="otp-input-box"
                      style={{
                        height: 'clamp(48px, 6.5vw, 56px)',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 600,
                        color: '#FDF3F5',
                        backgroundColor: 'rgba(70, 32, 55, 0.55)',
                        border: `1.5px solid ${
                          otpError
                            ? '#C7577C'
                            : focusedOtpIndex === index
                            ? '#F9AAAD'
                            : digit
                            ? 'rgba(199, 87, 124, 0.65)'
                            : 'rgba(161, 82, 95, 0.35)'
                        }`,
                        borderRadius: '12px',
                        outline: 'none',
                        transition: 'all 0.18s ease',
                        boxShadow: digit ? '0 0 8px rgba(199, 87, 124, 0.2)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* OTP Error Notice */}
                {otpError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#F9AAAD',
                      fontSize: '13px',
                      paddingLeft: '2px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Resend Notice Toast */}
                {resendNotice && (
                  <div
                    style={{
                      color: '#C7577C',
                      fontSize: '12px',
                      paddingLeft: '2px',
                    }}
                  >
                    {resendNotice}
                  </div>
                )}

                {/* Resend Code Timer / Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '4px',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: '#F8E2E6', opacity: 0.75 }}>Didn't receive the code?</span>
                  {isResendActive ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#F9AAAD',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span style={{ color: '#A1525F', fontWeight: 500 }}>
                      Resend in 00:{resendCountdown < 10 ? `0${resendCountdown}` : resendCountdown}
                    </span>
                  )}
                </div>

                {/* Verify Action Button */}
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    disabled={isVerifying || otpDigits.join('').length !== 6}
                    onClick={() => handleVerifyOtp()}
                    className="primary-action-btn"
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '14px',
                      border: 'none',
                      color: '#FDF3F5',
                      fontSize: '15px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#FDF3F5',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }}
                        />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <span>Verifying...</span>
                      </>
                    ) : verifySuccess ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDF3F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Social Sign In Alternatives (Visible when OTP is NOT revealed) */}
          {!otpRevealed && (
            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(161, 82, 95, 0.25)' }} />
                <span
                  style={{
                    fontSize: '12px',
                    color: '#F8E2E6',
                    opacity: 0.65,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  or continue with
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(161, 82, 95, 0.25)' }} />
              </div>

              {/* Social Login Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  style={{
                    height: '46px',
                    backgroundColor: 'rgba(70, 32, 55, 0.5)',
                    border: '1px solid rgba(161, 82, 95, 0.3)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#FDF3F5',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(104, 58, 70, 0.65)';
                    e.currentTarget.style.borderColor = '#C7577C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(70, 32, 55, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(161, 82, 95, 0.3)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
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
                  <span>Google</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  style={{
                    height: '46px',
                    backgroundColor: 'rgba(70, 32, 55, 0.5)',
                    border: '1px solid rgba(161, 82, 95, 0.3)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#FDF3F5',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(104, 58, 70, 0.65)';
                    e.currentTarget.style.borderColor = '#C7577C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(70, 32, 55, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(161, 82, 95, 0.3)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FDF3F5">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.8 1.44-.59.68-1.11 1.77-1.03 2.82 1.07.08 2.2-.64 2.82-1.39z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Terms Note */}
          <p
            style={{
              fontSize: '11px',
              lineHeight: 1.5,
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

      {/* OAuth Information Modal */}
      {oauthModal && oauthModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(20, 14, 28, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setOauthModal(null)}
        >
          <div
            style={{
              backgroundColor: '#462037',
              border: '1px solid rgba(161, 82, 95, 0.4)',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              color: '#FDF3F5',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 10px 0', color: '#F9AAAD' }}>
              {oauthModal.provider === 'google' ? 'Google Authentication' : 'Apple Sign In'}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#F8E2E6', margin: '0 0 16px 0' }}>
              {oauthModal.message}
            </p>
            {oauthModal.missingEnv && (
              <div
                style={{
                  background: 'rgba(20, 14, 28, 0.6)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#F9AAAD',
                  marginBottom: '18px',
                }}
              >
                Missing: {oauthModal.missingEnv}
              </div>
            )}
            <button
              onClick={() => setOauthModal(null)}
              className="primary-action-btn"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                color: '#FDF3F5',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </LivingCinematicBackground>
  );
};
