import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page5IdentityScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

type VerificationStep = 'idle' | 'connecting' | 'authenticating' | 'matched' | 'complete';
type CameraState = 'locked' | 'idle' | 'active' | 'captured' | 'permission_denied' | 'unsupported';

export const Page5IdentityScreen: React.FC<Page5IdentityScreenProps> = ({
  onBack,
  onSuccess,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    profile,
    isIdentityVerified = false,
    isSelfieVerified = false,
    selfieImage = null,
    setIdentityVerified,
    setSelfieVerified,
    appearanceMode,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Local verification states (initialized from context)
  const [identityCheckComplete, setLocalIdentityComplete] = useState<boolean>(isIdentityVerified);
  const [selfieComplete, setLocalSelfieComplete] = useState<boolean>(isSelfieVerified);

  // Secure Identity Check Modal State
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<VerificationStep>('idle');

  // Camera States
  const [cameraState, setCameraState] = useState<CameraState>(() => {
    if (isSelfieVerified) return 'captured';
    return isIdentityVerified ? 'idle' : 'locked';
  });
  const [capturedSelfieUrl, setCapturedSelfieUrl] = useState<string | null>(selfieImage);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string>('');

  // Refs for camera feed & capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Keep camera locked until identity check is complete
  useEffect(() => {
    if (!identityCheckComplete && !selfieComplete) {
      setCameraState('locked');
    } else if (identityCheckComplete && cameraState === 'locked' && !selfieComplete) {
      setCameraState('idle');
    }
  }, [identityCheckComplete, selfieComplete, cameraState]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Helper: Stop active camera stream
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // --------------------------------------------------------------------------
  // 1. SECURE IDENTITY CHECK DEMO FLOW
  // --------------------------------------------------------------------------
  const handleStartIdentityCheck = () => {
    setIsVerifyingModalOpen(true);
    setVerifyStep('connecting');

    // Simulate realistic multi-step authentication flow
    setTimeout(() => {
      setVerifyStep('authenticating');
    }, 900);

    setTimeout(() => {
      setVerifyStep('matched');
    }, 2000);

    setTimeout(() => {
      setVerifyStep('complete');
    }, 2800);

    setTimeout(() => {
      setIsVerifyingModalOpen(false);
      setLocalIdentityComplete(true);
      setIdentityVerified(true);
      if (!selfieComplete) {
        setCameraState('idle');
      }
    }, 3600);
  };

  // --------------------------------------------------------------------------
  // 2. REAL BROWSER SELFIE CAMERA
  // --------------------------------------------------------------------------
  const handleStartCamera = async () => {
    setCameraErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setCameraErrorMessage(
        'Your browser or device does not support real-time camera access. Please use an updated modern browser.',
      );
      return;
    }

    try {
      setCameraState('active');

      // Request front-facing camera
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      stopCameraStream();
      setCameraState('permission_denied');

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraErrorMessage(
          'Camera access is required for the verification selfie. Please allow camera access in your browser settings and try again.',
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraErrorMessage('No camera device was detected on your system.');
      } else {
        setCameraErrorMessage(
          'Could not start camera feed. Please check browser permissions and try again.',
        );
      }
    }
  };

  // Capture current video frame to canvas
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally to match the mirrored user-facing camera preview
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedSelfieUrl(dataUrl);
      setCameraState('captured');
      stopCameraStream();
    } catch {
      setCameraErrorMessage('Failed to capture frame. Please try again.');
    }
  };

  // Retake photo: discard captured frame and reopen live stream
  const handleRetakeSelfie = () => {
    setCapturedSelfieUrl(null);
    setLocalSelfieComplete(false);
    setSelfieVerified(false, null);
    handleStartCamera();
  };

  // Confirm selfie
  const handleUseSelfie = () => {
    if (!capturedSelfieUrl) return;
    setLocalSelfieComplete(true);
    setSelfieVerified(true, capturedSelfieUrl);
    stopCameraStream();
  };

  // Both steps required for Continue
  const canContinue = identityCheckComplete && selfieComplete;

  const handleContinueClick = () => {
    if (!canContinue) return;
    stopCameraStream();
    onSuccess();
  };

  const handleBackClick = () => {
    stopCameraStream();
    onBack();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#050104' : '#F7F3EE',
        color: isDark ? '#F3EEE9' : 'var(--color-espresso)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* 
        Background: Botanical Parchment Texture (with Cream flowers in Dark Mode)
      */}
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
          backgroundColor: isDark ? 'rgba(3, 0, 3, 0.12)' : 'rgba(247, 243, 238, 0.42)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Fixed Top Header (Status Bar + Navigation) */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          flexShrink: 0,
          backgroundColor: isDark ? 'rgba(5, 1, 4, 0.88)' : 'rgba(247, 243, 238, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.06)',
        }}
      >
        {showStatusBar && <StatusBar variant={isDark ? 'light' : 'dark'} />}

        {/* Top Navigation Bar: ← BACK & VERIFICATION */}
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
            onClick={handleBackClick}
            aria-label="Go back to Profile Setup"
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

          {/* Verification Badge */}
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: isDark ? '#B3A1A8' : '#8A7A84',
            }}
          >
            VERIFICATION
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
        {/* Main Content Area */}
        <div
          style={{
            padding: '24px 24px 36px 24px',
            textAlign: 'left',
            maxWidth: '820px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Main Editorial Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '34px',
              lineHeight: '1.15',
              fontWeight: 400,
              color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
              margin: '0 0 10px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Verify your identity.
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.45',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 24px 0',
            }}
          >
            The Inner Circle is built for genuine people. Every applicant verifies their identity before review.
          </p>

          {/* ========================================================== */}
          {/* ========================================================== */}
          {/* CARD 1 — SECURE IDENTITY CHECK                             */}
          {/* ========================================================== */}
          <div
            style={{
              backgroundColor: isDark ? 'rgba(24, 15, 20, 0.76)' : 'rgba(255, 255, 255, 0.76)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: identityCheckComplete
                ? (isDark ? '1.5px solid rgba(74, 222, 128, 0.4)' : '1.5px solid rgba(46, 125, 50, 0.35)')
                : (isDark ? '1.5px solid rgba(243, 238, 233, 0.14)' : '1px solid rgba(73, 40, 61, 0.16)'),
              padding: '20px',
              marginBottom: '20px',
              boxShadow: isDark ? 'none' : '0 6px 20px rgba(73, 40, 61, 0.05)',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Header: Title + Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <h2
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                SECURE IDENTITY CHECK
              </h2>

              {/* Status Badge */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  backgroundColor: identityCheckComplete
                    ? (isDark ? 'rgba(74, 222, 128, 0.18)' : 'rgba(46, 125, 50, 0.12)')
                    : (isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)'),
                  color: identityCheckComplete
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : (isDark ? '#F0D4B8' : 'var(--color-mulberry)'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {identityCheckComplete ? 'COMPLETE ✓' : 'REQUIRED'}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.45',
                color: isDark ? '#D9CFD5' : '#5E4E58',
                margin: '0 0 16px 0',
              }}
            >
              You'll be taken to our verification partner's consent-based flow and authenticate directly with them. We never see or store your government credentials — only the verified result.
            </p>

            {/* Privacy Metadata Grid */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(243, 238, 233, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    minWidth: '70px',
                  }}
                >
                  RETURNED
                </span>
                <span style={{ fontSize: '12.5px', color: isDark ? '#FBF7F2' : 'var(--color-espresso)', fontWeight: 500 }}>
                  Verified name · Date of birth
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)' }} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    minWidth: '70px',
                  }}
                >
                  RETAINED
                </span>
                <span style={{ fontSize: '12.5px', color: isDark ? '#FBF7F2' : 'var(--color-espresso)', fontWeight: 500 }}>
                  Only the minimum required result
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)' }} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    minWidth: '70px',
                  }}
                >
                  PUBLIC
                </span>
                <span style={{ fontSize: '12.5px', color: isDark ? '#FBF7F2' : 'var(--color-espresso)', fontWeight: 500 }}>
                  Nothing — verification is private
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            {identityCheckComplete ? (
              <div
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                  border: isDark ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid rgba(46, 125, 50, 0.25)',
                  color: isDark ? '#86EFAC' : '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>CREDENTIALS VERIFIED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartIdentityCheck}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#5C2D49' : 'var(--color-mulberry)',
                  color: '#FFFFFF',
                  border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(73, 40, 61, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s ease, background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.backgroundColor = isDark ? '#73375B' : '#3B1F31';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = isDark ? '#5C2D49' : 'var(--color-mulberry)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>VERIFY SECURELY</span>
              </button>
            )}
          </div>

          {/* ========================================================== */}
          {/* CARD 2 — VERIFICATION SELFIE                               */}
          {/* ========================================================== */}
          <div
            style={{
              backgroundColor: isDark ? 'rgba(24, 15, 20, 0.76)' : 'rgba(255, 255, 255, 0.76)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: selfieComplete
                ? (isDark ? '1.5px solid rgba(74, 222, 128, 0.4)' : '1.5px solid rgba(46, 125, 50, 0.35)')
                : (isDark ? '1.5px solid rgba(243, 238, 233, 0.14)' : '1px solid rgba(73, 40, 61, 0.16)'),
              padding: '20px',
              marginBottom: '24px',
              boxShadow: isDark ? 'none' : '0 6px 20px rgba(73, 40, 61, 0.05)',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Header: Title + Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <h2
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                VERIFICATION SELFIE
              </h2>

              {/* Status Badge */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  backgroundColor: selfieComplete
                    ? (isDark ? 'rgba(74, 222, 128, 0.18)' : 'rgba(46, 125, 50, 0.12)')
                    : !identityCheckComplete
                    ? (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)')
                    : (isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)'),
                  color: selfieComplete
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : !identityCheckComplete
                    ? (isDark ? '#B3A1A8' : '#8A7A84')
                    : (isDark ? '#F0D4B8' : 'var(--color-mulberry)'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selfieComplete
                  ? 'COMPLETE ✓'
                  : !identityCheckComplete
                  ? 'LOCKED 🔒'
                  : 'REQUIRED'}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.45',
                color: isDark ? '#D9CFD5' : '#5E4E58',
                margin: '0 0 16px 0',
              }}
            >
              One clear selfie taken on this device, used only as an authenticity signal during manual review. It is never visible to other members and never appears on your profile.
            </p>

            {/* STATE A: LOCKED UNTIL IDENTITY CHECK COMPLETE */}
            {!identityCheckComplete && (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(243, 238, 233, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                  borderRadius: '12px',
                  border: isDark ? '1.5px dashed rgba(243, 238, 233, 0.2)' : '1.5px dashed rgba(73, 40, 61, 0.2)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    lineHeight: '1.4',
                  }}
                >
                  COMPLETE THE IDENTITY CHECK ABOVE TO UNLOCK THE CAMERA.
                </div>
              </div>
            )}

            {/* STATE B: UNLOCKED — CAMERA IDLE (Prompt to open real camera) */}
            {identityCheckComplete && cameraState === 'idle' && !selfieComplete && (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(243, 238, 233, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                  borderRadius: '14px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>

                <div style={{ fontSize: '13px', color: isDark ? '#D9CFD5' : '#5E4E58', lineHeight: '1.4' }}>
                  Face the front camera in good lighting. No sunglasses, hats, or filters.
                </div>

                <button
                  type="button"
                  onClick={handleStartCamera}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? '#5C2D49' : 'var(--color-mulberry)',
                    color: '#FFFFFF',
                    border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(73, 40, 61, 0.18)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>OPEN CAMERA & TAKE SELFIE</span>
                </button>
              </div>
            )}

            {/* STATE C: ACTIVE LIVE CAMERA VIEWFINDER */}
            {cameraState === 'active' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Viewfinder Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3/4',
                    maxHeight: '340px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#1C151A',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                    border: isDark ? '2px solid #F0D4B8' : '2px solid var(--color-mulberry)',
                  }}
                >
                  {/* Real Live Camera Video Feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)', // Mirror front camera naturally
                    }}
                  />

                  {/* Face Guide Oval Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '68%',
                      height: '75%',
                      borderRadius: '50%',
                      border: '2px dashed rgba(255, 255, 255, 0.75)',
                      pointerEvents: 'none',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.28)',
                    }}
                  />

                  {/* Top Live Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#E53935',
                        display: 'inline-block',
                      }}
                    />
                    LIVE CAMERA
                  </div>
                </div>

                {/* Shutter Capture Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <button
                    type="button"
                    onClick={handleCaptureFrame}
                    style={{
                      flex: 1,
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? '#5C2D49' : 'var(--color-mulberry)',
                      color: '#FFFFFF',
                      border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(73, 40, 61, 0.22)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" fill="currentColor" />
                    </svg>
                    <span>TAKE SELFIE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setCameraState('idle');
                    }}
                    style={{
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)',
                      border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                      color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* STATE D: CAPTURED SELFIE (Preview & Retake / Use Choice) */}
            {cameraState === 'captured' && capturedSelfieUrl && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                {/* Captured Frame Preview */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3/4',
                    maxHeight: '340px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#1C151A',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    border: selfieComplete
                      ? (isDark ? '2px solid #86EFAC' : '2px solid #2E7D32')
                      : (isDark ? '2px solid rgba(243, 238, 233, 0.25)' : '2px solid rgba(73, 40, 61, 0.25)'),
                  }}
                >
                  <img
                    src={capturedSelfieUrl}
                    alt="Captured verification selfie"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Confirmed Verification Badge */}
                  {selfieComplete && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(46, 125, 50, 0.92)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>SELFIE VERIFIED</span>
                    </div>
                  )}
                </div>

                {/* Retake & Use Action Controls */}
                {!selfieComplete ? (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      type="button"
                      onClick={handleRetakeSelfie}
                      style={{
                        flex: 1,
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)',
                        border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                        color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                      <span>RETAKE</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseSelfie}
                      style={{
                        flex: 1.4,
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#5C2D49' : 'var(--color-mulberry)',
                        color: '#FFFFFF',
                        border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(73, 40, 61, 0.22)',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>USE THIS SELFIE</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetakeSelfie}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Retake selfie
                  </button>
                )}
              </div>
            )}

            {/* STATE E: PERMISSION DENIED OR ERROR */}
            {(cameraState === 'permission_denied' || cameraState === 'unsupported') && (
              <div
                style={{
                  backgroundColor: 'rgba(201, 74, 74, 0.08)',
                  border: '1px solid rgba(201, 74, 74, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ color: '#E06D6D', fontSize: '13px', lineHeight: '1.45' }}>
                  {cameraErrorMessage ||
                    'Camera access is required for the verification selfie. Please allow camera access in your browser settings and try again.'}
                </div>

                <button
                  type="button"
                  onClick={handleStartCamera}
                  style={{
                    backgroundColor: isDark ? '#5C2D49' : 'var(--color-mulberry)',
                    color: '#FFFFFF',
                    border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  TRY AGAIN
                </button>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* CONTINUE BUTTON — AT THE VERY BOTTOM OF SCROLLABLE CONTENT */}
          {/* ========================================================== */}
          <div style={{ marginTop: '12px', marginBottom: '20px' }}>
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinueClick}
              style={{
                width: '100%',
                height: '54px',
                borderRadius: '27px',
                backgroundColor: canContinue
                  ? (isDark ? '#5C2D49' : 'var(--color-mulberry)')
                  : (isDark ? 'rgba(243, 238, 233, 0.1)' : 'rgba(73, 40, 61, 0.22)'),
                color: canContinue
                  ? '#FFFFFF'
                  : (isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.45)'),
                border: canContinue && isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: canContinue
                  ? (isDark ? '0 6px 22px rgba(0, 0, 0, 0.35)' : '0 6px 22px rgba(73, 40, 61, 0.28)')
                  : 'none',
                transition: 'background-color 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (canContinue) {
                  e.currentTarget.style.backgroundColor = isDark ? '#73375B' : '#3B1F31';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (canContinue) {
                  e.currentTarget.style.backgroundColor = isDark ? '#5C2D49' : 'var(--color-mulberry)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>CONTINUE</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {!canContinue && (
              <div
                style={{
                  fontSize: '11.5px',
                  color: isDark ? '#B3A1A8' : '#8A7A84',
                  textAlign: 'center',
                  marginTop: '8px',
                  fontWeight: 500,
                }}
              >
                Complete both identity check and selfie to continue
              </div>
            )}
          </div>

          {/* Bottom Home Indicator */}
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

        {/* Hidden Canvas for High-Res Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* ========================================================== */}
      {/* SECURE IDENTITY CHECK DEMO MODAL                           */}
      {/* ========================================================== */}
      {isVerifyingModalOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(18, 14, 17, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: isDark ? '#1C1218' : '#FFFFFF',
              border: isDark ? '1.5px solid rgba(243, 238, 233, 0.15)' : 'none',
              borderRadius: '20px',
              padding: '28px 24px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Animated Shield / Check Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor:
                  verifyStep === 'complete' || verifyStep === 'matched'
                    ? (isDark ? 'rgba(74, 222, 128, 0.18)' : 'rgba(46, 125, 50, 0.12)')
                    : (isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)'),
                color:
                  verifyStep === 'complete' || verifyStep === 'matched'
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : (isDark ? '#F0D4B8' : 'var(--color-mulberry)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s ease, color 0.3s ease',
              }}
            >
              {verifyStep === 'complete' || verifyStep === 'matched' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'spin 1.8s linear infinite' }}
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              )}
            </div>

            {/* Modal Title */}
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
                  margin: '0 0 6px 0',
                }}
              >
                {verifyStep === 'complete'
                  ? 'Identity Authenticated'
                  : 'Secure Verification Partner'}
              </h3>
              <p style={{ fontSize: '13px', color: isDark ? '#BDB0B6' : '#6E5E68', margin: 0, lineHeight: '1.45' }}>
                {verifyStep === 'connecting' && 'Establishing encrypted handshake with identity network...'}
                {verifyStep === 'authenticating' && 'Authenticating official government records...'}
                {verifyStep === 'matched' && `Verified name and DOB matched for ${profile.firstName || 'applicant'}!`}
                {verifyStep === 'complete' && 'Zero credentials stored. Verification record secured.'}
              </p>
            </div>

            {/* Step Checkpoints */}
            <div
              style={{
                width: '100%',
                backgroundColor: isDark ? 'rgba(24, 15, 20, 0.85)' : '#F9F6F3',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : 'none',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: verifyStep !== 'connecting'
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : (isDark ? '#F0D4B8' : 'var(--color-mulberry)'),
                }}
              >
                <span>{verifyStep !== 'connecting' ? '✓' : '●'}</span>
                <span>Consent-based OAuth Handshake</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color:
                    verifyStep === 'matched' || verifyStep === 'complete'
                      ? (isDark ? '#86EFAC' : '#2E7D32')
                      : verifyStep === 'authenticating'
                      ? (isDark ? '#F0D4B8' : 'var(--color-mulberry)')
                      : (isDark ? '#B3A1A8' : '#8A7A84'),
                }}
              >
                <span>
                  {verifyStep === 'matched' || verifyStep === 'complete'
                    ? '✓'
                    : verifyStep === 'authenticating'
                    ? '●'
                    : '○'}
                </span>
                <span>Government Credential Verification</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: verifyStep === 'complete'
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : (isDark ? '#B3A1A8' : '#8A7A84'),
                }}
              >
                <span>{verifyStep === 'complete' ? '✓' : '○'}</span>
                <span>Tokenized Result Encrypted</span>
              </div>
            </div>

            {/* Privacy Badge Footer */}
            <div
              style={{
                fontSize: '11px',
                color: isDark ? '#B3A1A8' : '#8A7A84',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>256-Bit TLS Encryption · Zero Credentials Retained</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
