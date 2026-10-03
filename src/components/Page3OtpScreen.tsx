import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';
import { otpService } from '../services/otpService';

interface Page3OtpScreenProps {
  onBack: () => void;
  onChangeNumber: () => void;
  onSuccess: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page3OtpScreen: React.FC<Page3OtpScreenProps> = ({
  onBack,
  onChangeNumber,
  onSuccess,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { phoneNumber, countryCode, authMethod, googleUser, setPhoneVerified } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the first empty input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Format recipient display text
  const getRecipientDisplay = () => {
    if (authMethod === 'google' && googleUser?.email) {
      return googleUser.email;
    }
    const cleanPhone = phoneNumber ? phoneNumber.trim() : '6896568960';
    return `${countryCode || '+91'} ${cleanPhone}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const numeric = value.replace(/\D/g, '');

    if (!numeric) {
      // Clear current box
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      if (errorMessage) setErrorMessage(null);
      return;
    }

    if (numeric.length === 1) {
      const nextDigits = [...digits];
      nextDigits[index] = numeric;
      setDigits(nextDigits);
      if (errorMessage) setErrorMessage(null);

      // Move to next box
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numeric.length > 1) {
      // User pasted or typed multiple digits
      handlePastedCode(numeric, index);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is already empty, move to previous and clear it
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current
        const nextDigits = [...digits];
        nextDigits[index] = '';
        setDigits(nextDigits);
      }
      if (errorMessage) setErrorMessage(null);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePastedCode = (pasted: string, startIndex: number = 0) => {
    const clean = pasted.replace(/\D/g, '').slice(0, 6);
    if (!clean) return;

    const nextDigits = [...digits];
    for (let i = 0; i < clean.length && startIndex + i < 6; i++) {
      nextDigits[startIndex + i] = clean[i];
    }
    setDigits(nextDigits);
    if (errorMessage) setErrorMessage(null);

    const nextFocus = Math.min(startIndex + clean.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePastedCode(pasted, index);
  };

  // Demo Fill helper
  const handleDemoFill = () => {
    const demoCode = otpService.getDemoCode();
    const split = demoCode.split('');
    setDigits(split);
    setErrorMessage(null);
    inputRefs.current[5]?.focus();
  };

  // Verify code action
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = digits.join('');

    if (fullCode.length < 6) {
      setErrorMessage('Please enter all six digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await otpService.verifyOtp(fullCode);
      if (result.success) {
        setPhoneVerified(true);
        onSuccess();
      } else {
        setErrorMessage(result.error || 'Incorrect verification code. Please try again.');
      }
    } catch {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
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
        color: 'var(--color-warm-porcelain)',
      }}
    >
      {/* Background: Same as Second Page with subtle blur */}
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

      {/* Atmospheric Vignette & Contrast Overlay for clear text visibility */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, rgba(16, 12, 14, 0.45) 0%, rgba(16, 12, 14, 0.25) 25%, rgba(16, 12, 14, 0.5) 55%, rgba(16, 12, 14, 0.85) 80%, rgba(16, 12, 14, 0.95) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Foreground Content Container */}
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
        {/* Top Header Region */}
        <div>
          {/* iOS Status Bar with light text */}
          {showStatusBar && <StatusBar variant="light" />}

          {/* ← BACK Navigation */}
          <div style={{ padding: '8px 24px 0 20px', textAlign: 'left' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-warm-porcelain)',
                cursor: 'pointer',
                padding: '6px 8px',
                marginLeft: '-8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'opacity 0.15s ease',
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.75';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <svg
                width="18"
                height="18"
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
              <span>BACK</span>
            </button>
          </div>

          {/* Heading & Instructions */}
          <div style={{ padding: '28px 24px 0 24px', textAlign: 'left' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px, 4vw, 46px)',
                lineHeight: '1.1',
                fontWeight: 400,
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                margin: 0,
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.7)',
              }}
            >
              VERIFY
            </h1>

            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--color-warm-porcelain)',
                margin: '14px 0 0 0',
                letterSpacing: '-0.01em',
                textShadow: '0 1px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              Enter the code we sent.
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15.5px',
                lineHeight: '1.5',
                color: 'var(--color-dusty-lilac)',
                margin: '8px 0 0 0',
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)',
              }}
            >
              A six-digit code has been sent to{' '}
              <span style={{ color: 'var(--color-warm-porcelain)', fontWeight: 600 }}>
                {getRecipientDisplay()}
              </span>
              .<br />
              It expires in ten minutes.
            </p>
          </div>

          {/* OTP Six-Digit Input Section */}
          <div style={{ padding: '34px 24px 0 24px' }}>
            <form onSubmit={handleVerify}>
              {/* Six OTP Input Boxes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '344px',
                }}
              >
                {digits.map((digit, index) => {
                  const isCurFocused = focusedIndex === index;
                  const isError = Boolean(errorMessage);

                  return (
                    <div
                      key={index}
                      onClick={() => inputRefs.current[index]?.focus()}
                      style={{
                        flex: 1,
                        height: '58px',
                        borderRadius: '13px',
                        backgroundColor: 'rgba(26, 20, 24, 0.65)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: isError
                          ? '1.5px solid #e05a5a'
                          : isCurFocused
                          ? '1.5px solid rgba(243, 238, 233, 0.65)'
                          : '1px solid rgba(243, 238, 233, 0.22)',
                        boxShadow: isCurFocused
                          ? '0 0 0 3px rgba(243, 238, 233, 0.12)'
                          : '0 4px 16px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'text',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(e, index)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(-1)}
                        style={{
                          width: '100%',
                          height: '100%',
                          textAlign: 'center',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontFamily: 'var(--font-serif)',
                          fontSize: '24px',
                          color: '#FFFFFF',
                          fontWeight: 500,
                          caretColor: 'var(--color-warm-porcelain)',
                          padding: 0,
                        }}
                      />

                      {/* Empty Placeholder Dash */}
                      {!digit && (
                        <span
                          style={{
                            position: 'absolute',
                            pointerEvents: 'none',
                            color: 'rgba(243, 238, 233, 0.35)',
                            fontSize: '18px',
                            fontWeight: 300,
                            lineHeight: 1,
                            bottom: '18px',
                          }}
                        >
                          —
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  style={{
                    color: '#ff8a8a',
                    fontSize: '14px',
                    fontFamily: 'var(--font-sans)',
                    textAlign: 'left',
                    marginTop: '10px',
                    fontWeight: 500,
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* DEMO — FILL THE CODE Helper */}
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  style={{
                    background: 'rgba(243, 238, 233, 0.1)',
                    border: '1px dashed rgba(243, 238, 233, 0.35)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'var(--color-warm-porcelain)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-sans)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(243, 238, 233, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(243, 238, 233, 0.1)';
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--color-dusty-lilac)' }}>✦</span>
                  <span>DEMO — FILL THE CODE</span>
                  <span
                    style={{
                      backgroundColor: 'rgba(243, 238, 233, 0.18)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#FFFFFF',
                    }}
                  >
                    123456
                  </span>
                </button>
              </div>

              {/* Primary Action: VERIFY AND CONTINUE → */}
              <div style={{ marginTop: '28px' }}>
                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{
                    width: '100%',
                    maxWidth: '344px',
                    height: '56px',
                    backgroundColor: 'var(--color-warm-porcelain)',
                    color: 'var(--color-espresso)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '16.5px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    borderRadius: '9999px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isVerifying ? 'wait' : 'pointer',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                    opacity: isVerifying ? 0.85 : 1,
                  }}
                  onMouseDown={(e) => {
                    if (!isVerifying) e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    if (!isVerifying) e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseEnter={(e) => {
                    if (!isVerifying) e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    if (!isVerifying) {
                      e.currentTarget.style.backgroundColor = 'var(--color-warm-porcelain)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span>{isVerifying ? 'VERIFYING...' : 'VERIFY AND CONTINUE'}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Secondary Action: CHANGE NUMBER */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={onChangeNumber}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-warm-porcelain)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    opacity: 0.9,
                    transition: 'opacity 0.15s ease',
                    textShadow: '0 1px 6px rgba(0, 0, 0, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                >
                  CHANGE NUMBER
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom iOS Home Indicator */}
        <div style={{ paddingBottom: showHomeIndicator ? '12px' : '24px' }}>
          {showHomeIndicator && (
            <div
              style={{
                width: '134px',
                height: '5px',
                backgroundColor: 'rgba(243, 238, 233, 0.45)',
                borderRadius: '9999px',
                margin: '0 auto',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
