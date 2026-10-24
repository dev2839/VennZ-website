import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../mobile/useIsMobile';
import { LivingCinematicBackground } from './LivingCinematicBackground';
import { digiLockerService } from '../services/digiLockerService';
import type { DigiLockerFlowStep } from '../types/digilocker';
import { isAgeEligible } from '../utils/ageCalculation';

interface Page3DigiLockerScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const Page3DigiLockerScreen: React.FC<Page3DigiLockerScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { setDigiLockerVerified, appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';
  const isMobile = useIsMobile(768);

  const [step, setStep] = useState<DigiLockerFlowStep>('intro');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Dynamic Theme Colors
  const textColor = isDark ? '#FDF3F5' : '#462037';
  const mutedColor = isDark ? '#D4A2AC' : '#683A46';
  const cardBg = isDark ? 'rgba(30, 16, 28, 0.78)' : 'rgba(255, 255, 255, 0.94)';
  const cardBorder = isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(161, 82, 95, 0.22)';
  const cardShadow = isDark
    ? '0 28px 68px rgba(10, 6, 14, 0.75), 0 0 1px 1px rgba(249, 170, 173, 0.1) inset'
    : '0 20px 50px rgba(73, 40, 61, 0.14), 0 0 1px 1px rgba(255, 255, 255, 0.8) inset';
  const rowBg = isDark ? 'rgba(70, 32, 55, 0.35)' : 'rgba(250, 241, 243, 0.92)';
  const rowBorder = isDark ? '1px solid rgba(161, 82, 95, 0.25)' : '1px solid rgba(199, 87, 124, 0.2)';
  const rowText = isDark ? '#F8E2E6' : '#462037';
  const privacyBg = isDark ? 'rgba(20, 14, 28, 0.5)' : 'rgba(246, 236, 239, 0.85)';
  const privacyBorder = isDark ? '1px solid rgba(161, 82, 95, 0.2)' : '1px solid rgba(161, 82, 95, 0.15)';
  const iconBg = isDark
    ? 'linear-gradient(135deg, rgba(70, 32, 55, 0.6) 0%, rgba(104, 58, 70, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 230, 235, 0.95) 100%)';
  const iconBorder = isDark ? '1px solid rgba(161, 82, 95, 0.4)' : '1px solid rgba(199, 87, 124, 0.35)';
  const iconStroke = isDark ? '#F9AAAD' : '#A1525F';

  // Prevent duplicate API calls
  const isRequestInFlight = useRef(false);
  // Store session from initiateFlow to pass to fetchVerifiedData
  const sessionIdRef = useRef<string>('');

  const VerifiedRow: React.FC<{ label: string }> = ({ label }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        backgroundColor: rowBg,
        border: rowBorder,
      }}
    >
      <span
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: isDark ? 'rgba(199, 87, 124, 0.2)' : 'rgba(161, 82, 95, 0.12)',
          border: isDark ? '1.5px solid #C7577C' : '1.5px solid #A1525F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ fontSize: '15.5px', color: rowText, fontWeight: 500 }}>{label}</span>
    </div>
  );

  const PrivacyRow: React.FC<{ text: string }> = ({ text }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ color: isDark ? '#A1525F' : '#C7577C', fontSize: '15px', lineHeight: '20px', flexShrink: 0 }}>•</span>
      <span style={{ fontSize: '14.5px', color: mutedColor, lineHeight: 1.5 }}>{text}</span>
    </div>
  );

  // ─── Step: Intro → trigger DigiLocker flow ──────────────────────────────────

  const handleContinueWithDigiLocker = async () => {
    if (isRequestInFlight.current) return;
    isRequestInFlight.current = true;
    setStep('redirecting');

    try {
      const result = await digiLockerService.initiateFlow();
      if (result.status === 'initiated') {
        sessionIdRef.current = result.sessionId;
        setStep('permission');
      } else {
        setErrorMessage(result.message);
        setStep('error');
      }
    } catch {
      setErrorMessage('Unable to connect to DigiLocker. Please check your connection.');
      setStep('error');
    } finally {
      isRequestInFlight.current = false;
    }
  };

  // ─── Step: Permission → user grants or declines consent ─────────────────────

  const handleAllow = async () => {
    if (isRequestInFlight.current) return;
    isRequestInFlight.current = true;
    setStep('verifying');

    try {
      const result = await digiLockerService.fetchVerifiedData(sessionIdRef.current, true);
      if (result.status === 'granted') {
        // Enforce 18+ eligibility requirement from verified DOB
        const isEligible = isAgeEligible(result.data.dateOfBirth);
        if (!isEligible) {
          setErrorMessage('You must be 18 years or older to join VennZ. Based on your DigiLocker verified date of birth, you are not eligible to register.');
          setStep('error');
          return;
        }

        // Store verified data in auth context — only called after explicit consent
        setDigiLockerVerified(result.data.name, result.data.dateOfBirth);
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else if (result.status === 'declined') {
        setStep('declined');
      } else {
        setErrorMessage(result.message);
        setStep('error');
      }
    } catch {
      setErrorMessage('Verification failed. Please try again.');
      setStep('error');
    } finally {
      isRequestInFlight.current = false;
    }
  };

  const handleDecline = async () => {
    if (isRequestInFlight.current) return;
    isRequestInFlight.current = true;
    setStep('verifying');
    try {
      await digiLockerService.fetchVerifiedData(sessionIdRef.current, false);
    } catch {
      // Graceful
    } finally {
      isRequestInFlight.current = false;
    }
    setStep('declined');
  };

  const handleRetryFromError = () => {
    setErrorMessage('');
    sessionIdRef.current = '';
    setStep('intro');
  };

  const handleRetryFromDeclined = () => {
    sessionIdRef.current = '';
    setStep('intro');
  };

  // ─── Shared card wrapper ────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: cardBg,
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: cardBorder,
    borderRadius: '24px',
    boxShadow: cardShadow,
    padding: isMobile ? '24px 20px' : 'clamp(28px, 5vw, 40px)',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0px',
    animation: 'dlFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    height: '50px',
    borderRadius: '9999px',
    border: 'none',
    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
    color: '#FDF3F5',
    fontSize: '16.5px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(70, 32, 55, 0.45)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
  };

  const ghostBtnStyle: React.CSSProperties = {
    width: '100%',
    height: '46px',
    borderRadius: '9999px',
    border: isDark ? '1px solid rgba(161, 82, 95, 0.4)' : '1px solid rgba(161, 82, 95, 0.3)',
    background: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.75)',
    color: mutedColor,
    fontSize: '15.5px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-sans)',
  };

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderContent = () => {
    // ── INTRO ──
    if (step === 'intro') {
      return (
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            {/* DigiLocker Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: iconBg,
                border: iconBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 14px rgba(70, 32, 55, 0.1)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: isMobile ? '24px' : '26px',
                fontWeight: 500,
                color: textColor,
                margin: '0 0 8px 0',
                letterSpacing: '0.01em',
              }}
            >
              Identity Verification
            </h2>
            <p style={{ fontSize: isMobile ? '14px' : '15.5px', color: mutedColor, margin: 0, lineHeight: 1.5 }}>
              VennZ uses DigiLocker to verify your identity. This is a one-time step.
            </p>
          </div>

          {/* What we access */}
          <div style={{ marginBottom: '18px' }}>
            <p
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: isDark ? '#F9AAAD' : '#A1525F',
                marginBottom: '10px',
              }}
            >
              We will request access to
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <VerifiedRow label="Your Full Name" />
              <VerifiedRow label="Date of Birth" />
            </div>
          </div>

          {/* Privacy assurances */}
          <div
            style={{
              backgroundColor: privacyBg,
              border: privacyBorder,
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <PrivacyRow text="You'll be taken to the official DigiLocker platform to sign in." />
            <PrivacyRow text="We do not access or receive your Aadhaar number." />
            <PrivacyRow text="We only receive the information you explicitly authorise." />
            <PrivacyRow text="We do not view anything else in your DigiLocker account." />
            <PrivacyRow text="Your verified name and date of birth are kept private." />
          </div>

          {/* CTA */}
          <button
            type="button"
            style={primaryBtnStyle}
            onClick={handleContinueWithDigiLocker}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Continue with DigiLocker
          </button>
          <button
            type="button"
            style={{ ...ghostBtnStyle, marginTop: '10px' }}
            onClick={onBack}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C7577C'; e.currentTarget.style.color = isDark ? '#F9AAAD' : '#A1525F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(161, 82, 95, 0.4)' : 'rgba(161, 82, 95, 0.3)'; e.currentTarget.style.color = mutedColor; }}
          >
            Go Back
          </button>
        </div>
      );
    }

    // ── REDIRECTING ──
    if (step === 'redirecting') {
      return (
        <div style={{ ...cardStyle, alignItems: 'center', textAlign: 'center', gap: '20px' }}>
          <div style={{ animation: 'dlSpin 1.2s linear infinite', width: '48px', height: '48px' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke={isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.15)'} strokeWidth="4" />
              <path d="M24 4a20 20 0 0 1 20 20" stroke="#C7577C" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: textColor, margin: '0 0 8px 0' }}>
              Connecting to DigiLocker
            </p>
            <p style={{ fontSize: '15px', color: mutedColor, margin: 0 }}>
              Please wait while we initiate the secure connection…
            </p>
          </div>
        </div>
      );
    }

    // ── PERMISSION ──
    if (step === 'permission') {
      return (
        <div style={cardStyle}>
          <div
            style={{
              textAlign: 'center',
              padding: '0 0 20px 0',
              borderBottom: `1px solid ${isDark ? 'rgba(161, 82, 95, 0.2)' : 'rgba(161, 82, 95, 0.15)'}`,
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isDark ? 'rgba(20, 14, 28, 0.6)' : 'rgba(250, 241, 243, 0.9)',
                border: isDark ? '1px solid rgba(161, 82, 95, 0.3)' : '1px solid rgba(161, 82, 95, 0.2)',
                borderRadius: '999px',
                padding: '5px 12px',
                marginBottom: '14px',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#4CAF50" strokeWidth="1.5" />
                <path d="M3.5 6l1.8 1.8L8.5 4" stroke="#4CAF50" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: '12px', color: isDark ? '#F9AAAD' : '#A1525F', letterSpacing: '0.08em', fontWeight: 600 }}>
                SECURE CONNECTION · DIGILOCKER
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: isMobile ? '22px' : '24px',
                color: textColor,
                margin: '0 0 8px 0',
                fontWeight: 500,
              }}
            >
              VennZ is requesting permission
            </h2>
            <p style={{ fontSize: '14.5px', color: mutedColor, margin: 0, lineHeight: 1.5 }}>
              VennZ would like to access the following information from your DigiLocker account
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: isDark ? '#F9AAAD' : '#A1525F', margin: '0 0 10px 0' }}>
              Permissions requested
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <VerifiedRow label="Full Name" />
              <VerifiedRow label="Date of Birth" />
            </div>
          </div>

          <div
            style={{
              backgroundColor: privacyBg,
              border: privacyBorder,
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '22px',
            }}
          >
            <p style={{ fontSize: '14px', color: mutedColor, margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: textColor }}>VennZ will not access</strong> your Aadhaar number, documents, certificates, or any other information stored in DigiLocker.
            </p>
          </div>

          <button
            type="button"
            style={primaryBtnStyle}
            onClick={handleAllow}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)'; e.currentTarget.style.color = '#140E1C'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'; e.currentTarget.style.color = '#FDF3F5'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Allow &amp; Continue
          </button>
          <button
            type="button"
            style={{ ...ghostBtnStyle, marginTop: '10px' }}
            onClick={handleDecline}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C7577C'; e.currentTarget.style.color = isDark ? '#F9AAAD' : '#A1525F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(161, 82, 95, 0.4)' : 'rgba(161, 82, 95, 0.3)'; e.currentTarget.style.color = mutedColor; }}
          >
            Decline
          </button>
        </div>
      );
    }

    // ── VERIFYING ──
    if (step === 'verifying') {
      return (
        <div style={{ ...cardStyle, alignItems: 'center', textAlign: 'center', gap: '20px' }}>
          <div style={{ animation: 'dlSpin 1.2s linear infinite', width: '48px', height: '48px' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke={isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.15)'} strokeWidth="4" />
              <path d="M24 4a20 20 0 0 1 20 20" stroke="#C7577C" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: textColor, margin: '0 0 8px 0' }}>
              Verifying your identity
            </p>
            <p style={{ fontSize: '15px', color: mutedColor, margin: 0 }}>
              Securely retrieving your verified information…
            </p>
          </div>
        </div>
      );
    }

    // ── SUCCESS ──
    if (step === 'success') {
      return (
        <div style={{ ...cardStyle, alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: iconBg,
              border: '2px solid #C7577C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'dlSuccessPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: textColor, margin: '0 0 8px 0' }}>
              Identity Verified
            </p>
            <p style={{ fontSize: '15px', color: mutedColor, margin: 0 }}>
              Your name and date of birth have been securely verified. Continuing to profile setup…
            </p>
          </div>
        </div>
      );
    }

    // ── DECLINED ──
    if (step === 'declined') {
      return (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.5)' : 'rgba(250, 241, 243, 0.9)',
                border: isDark ? '1.5px solid rgba(161, 82, 95, 0.5)' : '1.5px solid rgba(161, 82, 95, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A1525F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: textColor, margin: '0 0 8px 0', fontWeight: 500 }}>
              Verification Declined
            </h3>
            <p style={{ fontSize: '15px', color: mutedColor, margin: 0, lineHeight: 1.55 }}>
              DigiLocker verification is required to join VennZ. We need to confirm your identity to maintain a trusted, verified community.
            </p>
          </div>
          <button
            type="button"
            style={primaryBtnStyle}
            onClick={handleRetryFromDeclined}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)'; e.currentTarget.style.color = '#140E1C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'; e.currentTarget.style.color = '#FDF3F5'; }}
          >
            Try Again
          </button>
          <button
            type="button"
            style={{ ...ghostBtnStyle, marginTop: '10px' }}
            onClick={onBack}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C7577C'; e.currentTarget.style.color = isDark ? '#F9AAAD' : '#A1525F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(161, 82, 95, 0.4)' : 'rgba(161, 82, 95, 0.3)'; e.currentTarget.style.color = mutedColor; }}
          >
            Go Back
          </button>
        </div>
      );
    }

    // ── ERROR ──
    if (step === 'error') {
      return (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.5)' : 'rgba(250, 241, 243, 0.9)',
                border: '1.5px solid rgba(201, 74, 74, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C94A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: textColor, margin: '0 0 8px 0', fontWeight: 500 }}>
              Something went wrong
            </h3>
            <p style={{ fontSize: '15px', color: mutedColor, margin: 0, lineHeight: 1.55 }}>
              {errorMessage || 'Unable to complete DigiLocker verification. Please try again.'}
            </p>
          </div>
          <button
            type="button"
            style={primaryBtnStyle}
            onClick={handleRetryFromError}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)'; e.currentTarget.style.color = '#140E1C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'; e.currentTarget.style.color = '#FDF3F5'; }}
          >
            Try Again
          </button>
          <button
            type="button"
            style={{ ...ghostBtnStyle, marginTop: '10px' }}
            onClick={onBack}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C7577C'; e.currentTarget.style.color = isDark ? '#F9AAAD' : '#A1525F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(161, 82, 95, 0.4)' : 'rgba(161, 82, 95, 0.3)'; e.currentTarget.style.color = mutedColor; }}
          >
            Go Back
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <LivingCinematicBackground>
      <style>{`
        @keyframes dlFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dlSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dlSuccessPop {
          0% { opacity: 0; transform: scale(0.7); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Outer Viewport Container */}
      <div
        style={{
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          padding: isMobile
            ? 'calc(16px + env(safe-area-inset-top, 8px)) 16px calc(24px + env(safe-area-inset-bottom, 16px))'
            : 'clamp(24px, 5vw, 60px)',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* On Mobile: Dedicated Top Header Bar to guarantee zero overlap with the card box */}
        {isMobile ? (
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              padding: '0 2px',
              zIndex: 35,
            }}
          >
            {/* Back button: Arrow ONLY on mobile (no "Back" text) */}
            <button
              onClick={onBack}
              type="button"
              aria-label="Back"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255, 255, 255, 0.9)',
                border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(161, 82, 95, 0.25)',
                color: isDark ? '#F9AAAD' : '#A1525F',
                cursor: 'pointer',
                padding: 0,
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(70,32,55,0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* VennZ Logo */}
            <div onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img
                src="/vennz-logo.png"
                alt="VennZ"
                style={{
                  height: '26px',
                  width: 'auto',
                  maxWidth: '95px',
                  objectFit: 'contain',
                  filter: isDark ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' : 'drop-shadow(0 1px 3px rgba(70,32,55,0.15))',
                }}
              />
            </div>

            {/* Step Progress Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {(['intro', 'redirecting', 'permission', 'verifying', 'success'] as const).map((s) => {
                const isActive = step === s;
                const isPast = ['intro', 'redirecting', 'permission', 'verifying', 'success'].indexOf(step) >
                  ['intro', 'redirecting', 'permission', 'verifying', 'success'].indexOf(s);
                return (
                  <div
                    key={s}
                    style={{
                      width: isActive ? '16px' : '5px',
                      height: '5px',
                      borderRadius: '3px',
                      backgroundColor: isActive ? '#C7577C' : isPast ? (isDark ? '#683A46' : '#A1525F') : (isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(199, 87, 124, 0.25)'),
                      transition: 'all 0.35s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* Desktop & Tablet: Top-left logo + Back button and top-right dots remain 100% original */
          <>
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
              <img
                src="/vennz-logo.png"
                alt="VennZ"
                onClick={onBack}
                style={{
                  height: '34px',
                  width: 'auto',
                  maxWidth: '130px',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  filter: isDark ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' : 'drop-shadow(0 1px 4px rgba(70,32,55,0.2))',
                }}
              />
              {step === 'intro' && (
                <button
                  onClick={onBack}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: isDark ? '1px solid rgba(161, 82, 95, 0.3)' : '1px solid rgba(161, 82, 95, 0.25)',
                    borderRadius: '100px',
                    padding: '9px 16px',
                    color: isDark ? '#F9AAAD' : '#A1525F',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(104, 58, 70, 0.65)' : '#FFFFFF';
                    e.currentTarget.style.borderColor = '#C7577C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.borderColor = isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.25)';
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </button>
              )}
            </div>

            <div
              style={{
                position: 'absolute',
                top: 'clamp(20px, 3.5vh, 32px)',
                right: 'clamp(20px, 4vw, 48px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 35,
              }}
            >
              {(['intro', 'redirecting', 'permission', 'verifying', 'success'] as const).map((s) => {
                const isActive = step === s;
                const isPast = ['intro', 'redirecting', 'permission', 'verifying', 'success'].indexOf(step) >
                  ['intro', 'redirecting', 'permission', 'verifying', 'success'].indexOf(s);
                return (
                  <div
                    key={s}
                    style={{
                      width: isActive ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: isActive ? '#C7577C' : isPast ? (isDark ? '#683A46' : '#A1525F') : (isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(199, 87, 124, 0.25)'),
                      transition: 'all 0.35s ease',
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Main card */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {renderContent()}
        </div>
      </div>
    </LivingCinematicBackground>
  );
};

export default Page3DigiLockerScreen;
