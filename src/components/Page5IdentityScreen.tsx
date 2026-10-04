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

// Helper: Downscale & compress verification selfie to ensure crystal-clear quality under 60KB (prevents localStorage quota errors)
const compressSelfieFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve('');
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 720;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

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

  // Local verification states (initialized directly from context so refresh never resets them)
  const [identityCheckComplete, setLocalIdentityComplete] = useState<boolean>(isIdentityVerified);
  const [selfieComplete, setLocalSelfieComplete] = useState<boolean>(isSelfieVerified);

  // Secure Identity Check Modal State
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<VerificationStep>('idle');

  // Camera States - camera is never locked! Ready and accessible immediately
  const [cameraState, setCameraState] = useState<CameraState>(() => {
    if (isSelfieVerified && selfieImage) return 'captured';
    return 'idle';
  });
  const [capturedSelfieUrl, setCapturedSelfieUrl] = useState<string | null>(selfieImage);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string>('');

  // Refs for camera feed, capture & file upload
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if context updates or upon page refresh
  useEffect(() => {
    if (isIdentityVerified && !identityCheckComplete) {
      setLocalIdentityComplete(true);
    }
    if (isSelfieVerified && !selfieComplete) {
      setLocalSelfieComplete(true);
    }
    if (selfieImage && !capturedSelfieUrl) {
      setCapturedSelfieUrl(selfieImage);
      setCameraState('captured');
    }
  }, [isIdentityVerified, isSelfieVerified, selfieImage]);

  // Robustly attach stream whenever video element mounts into DOM
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraState]);

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
    }, 3600);
  };

  // --------------------------------------------------------------------------
  // 2. REAL BROWSER SELFIE CAMERA WITH PROGRESSIVE FALLBACK
  // --------------------------------------------------------------------------
  const handleStartCamera = async () => {
    setCameraErrorMessage('');

    // If mediaDevices is missing (e.g. non-HTTPS IP on LAN or strict privacy mode), trigger native camera capture
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        setCameraState('unsupported');
        setCameraErrorMessage(
          'Live webcam streaming requires a secure HTTPS browser connection. Please use the Device Camera button below to take your selfie.',
        );
      }
      return;
    }

    try {
      setCameraState('active');

      let stream: MediaStream | null = null;
      // Progressive constraints: user-facing 720p -> user-facing general -> any video device
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

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
          'Camera access was not granted by your browser. Please allow camera access in your browser address bar, or use the device camera option below.',
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraErrorMessage('No camera device was detected on your system. You can take or upload your selfie using the device camera button below.');
      } else {
        setCameraErrorMessage(
          'Could not start live camera feed. You can take or choose your verification selfie using your device camera below.',
        );
      }
    }
  };

  // Handle file capture from native camera/file picker
  const handleSelfieFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressSelfieFile(file);
      if (dataUrl) {
        setCapturedSelfieUrl(dataUrl);
        setCameraState('captured');
        stopCameraStream();
        setCameraErrorMessage('');
      }
    } catch {
      setCameraErrorMessage('Failed to process image. Please try again.');
    }
    e.target.value = '';
  };

  // Capture current video frame to canvas
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    // Downscale canvas to max 720px to keep base64 image crisp yet very light (~40KB)
    const maxDim = 720;
    let targetWidth = width;
    let targetHeight = height;
    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
        targetHeight = maxDim;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally to match the mirrored user-facing camera preview
    ctx.save();
    ctx.translate(targetWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
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
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: isDark ? '#FDF3F5' : '#462037',
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
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.42)',
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
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.92)' : 'rgba(250, 241, 243, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: isDark ? '1px solid rgba(161, 82, 95, 0.2)' : '1px solid rgba(161, 82, 95, 0.12)',
        }}
      >
        {showStatusBar && <StatusBar variant={isDark ? 'light' : 'dark'} />}

        {/* Top Navigation Bar: ← BACK & VERIFICATION */}
        <div
          style={{
            padding: '10px 24px 8px 20px',
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
              fontSize: '14.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '8px',
            }}
          >
            <svg
              width="20"
              height="20"
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
              fontSize: '13px',
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
            padding: '28px 24px 40px 24px',
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
              fontSize: 'clamp(32px, 3.8vw, 44px)',
              lineHeight: '1.2',
              fontWeight: 400,
              color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
              margin: '0 0 12px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Verify your identity.
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.55',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 28px 0',
            }}
          >
            VennZ is built for genuine people. Every applicant verifies their identity before review.
          </p>

          {/* ========================================================== */}
          {/* ========================================================== */}
          {/* CARD 1 — SECURE IDENTITY CHECK                             */}
          {/* ========================================================== */}
          <div
            style={{
              backgroundColor: isDark ? 'rgba(70, 32, 55, 0.72)' : 'rgba(255, 255, 255, 0.76)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: identityCheckComplete
                ? (isDark ? '1.5px solid rgba(74, 222, 128, 0.4)' : '1.5px solid rgba(46, 125, 50, 0.35)')
                : (isDark ? '1.5px solid rgba(243, 238, 233, 0.14)' : '1px solid rgba(73, 40, 61, 0.16)'),
              padding: '24px 22px',
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
                marginBottom: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                SECURE IDENTITY CHECK
              </h2>

              {/* Status Badge */}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 11px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  backgroundColor: identityCheckComplete
                    ? (isDark ? 'rgba(74, 222, 128, 0.18)' : 'rgba(46, 125, 50, 0.12)')
                    : (isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)'),
                  color: identityCheckComplete
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : (isDark ? '#F9AAAD' : 'var(--color-mulberry)'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {identityCheckComplete ? 'COMPLETE ✓' : 'REQUIRED'}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.55',
                color: isDark ? '#D9CFD5' : '#5E4E58',
                margin: '0 0 18px 0',
              }}
            >
              You'll be taken to our verification partner's consent-based flow and authenticate directly with them. We never see or store your government credentials — only the verified result.
            </p>

            {/* Privacy Metadata Grid */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(243, 238, 233, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    minWidth: '85px',
                  }}
                >
                  RETURNED
                </span>
                <span style={{ fontSize: '15px', color: isDark ? '#FBF7F2' : 'var(--color-espresso)', fontWeight: 500 }}>
                  Verified name · Date of birth
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)' }} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    minWidth: '85px',
                  }}
                >
                  RETAINED
                </span>
                <span style={{ fontSize: '15px', color: isDark ? '#FBF7F2' : 'var(--color-espresso)', fontWeight: 500 }}>
                  Only the minimum required result
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)' }} />

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    minWidth: '85px',
                  }}
                >
                  PUBLIC
                </span>
                <span style={{ fontSize: '15px', color: isDark ? '#FBF7F2' : 'var(--color-espresso)', fontWeight: 500 }}>
                  Nothing — verification is private
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            {identityCheckComplete ? (
              <div
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                  border: isDark ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid rgba(46, 125, 50, 0.25)',
                  color: isDark ? '#86EFAC' : '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  gap: '8px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? '#A1525F' : 'var(--color-mulberry)',
                  color: '#FFFFFF',
                  border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                  fontSize: '14.5px',
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
                  e.currentTarget.style.backgroundColor = isDark ? '#A1525F' : 'var(--color-mulberry)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              backgroundColor: isDark ? 'rgba(70, 32, 55, 0.72)' : 'rgba(255, 255, 255, 0.76)',
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
                marginBottom: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                VERIFICATION SELFIE
              </h2>

              {/* Status Badge */}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 11px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  backgroundColor: selfieComplete
                    ? (isDark ? 'rgba(74, 222, 128, 0.18)' : 'rgba(46, 125, 50, 0.12)')
                    : (isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)'),
                  color: selfieComplete
                    ? (isDark ? '#86EFAC' : '#2E7D32')
                    : (isDark ? '#F9AAAD' : 'var(--color-mulberry)'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {selfieComplete ? 'COMPLETE ✓' : 'REQUIRED'}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.5',
                color: isDark ? '#D9CFD5' : '#5E4E58',
                margin: '0 0 18px 0',
              }}
            >
              One clear selfie taken on this device, used only as an authenticity signal during manual review. It is never visible to other members and never appears on your profile.
            </p>

            {/* STATE B: UNLOCKED — CAMERA IDLE (Prompt to open live camera or use device camera) */}
            {cameraState === 'idle' && !selfieComplete && (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(243, 238, 233, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>

                <div style={{ fontSize: '15px', color: isDark ? '#D9CFD5' : '#5E4E58', lineHeight: '1.45', maxWidth: '400px' }}>
                  Face the camera in good lighting. No sunglasses, hats, or filters.
                </div>

                {/* Primary Button: Live Camera */}
                <button
                  type="button"
                  onClick={handleStartCamera}
                  style={{
                    width: '100%',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? '#A1525F' : 'var(--color-mulberry)',
                    color: '#FFFFFF',
                    border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(73, 40, 61, 0.18)',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.backgroundColor = isDark ? '#73375B' : '#3B1F31';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = isDark ? '#A1525F' : 'var(--color-mulberry)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>OPEN LIVE CAMERA & TAKE SELFIE</span>
                </button>

                {/* Secondary Button: Native Device Camera / File Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                    border: isDark ? '1px solid rgba(240, 212, 184, 0.25)' : '1px solid rgba(73, 40, 61, 0.18)',
                    color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(243, 238, 233, 0.14)' : 'rgba(73, 40, 61, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.06)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>OR TAKE / UPLOAD WITH DEVICE CAMERA</span>
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
                  gap: '14px',
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
                    border: isDark ? '2px solid #F9AAAD' : '2px solid var(--color-mulberry)',
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
                      backgroundColor: isDark ? '#A1525F' : 'var(--color-mulberry)',
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
                      color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
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
                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button
                      type="button"
                      onClick={handleRetakeSelfie}
                      style={{
                        flex: 1,
                        height: '50px',
                        borderRadius: '14px',
                        backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)',
                        border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                        color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(243, 238, 233, 0.14)' : 'rgba(73, 40, 61, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                        flex: 1.5,
                        height: '50px',
                        borderRadius: '14px',
                        backgroundColor: isDark ? '#A1525F' : 'var(--color-mulberry)',
                        color: '#FFFFFF',
                        border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(73, 40, 61, 0.22)',
                        transition: 'transform 0.15s ease, background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.backgroundColor = isDark ? '#73375B' : '#3B1F31';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = isDark ? '#A1525F' : 'var(--color-mulberry)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                      color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '6px 10px',
                    }}
                  >
                    Retake verification selfie
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
                  borderRadius: '14px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ color: '#E06D6D', fontSize: '14.5px', lineHeight: '1.5', maxWidth: '440px' }}>
                  {cameraErrorMessage ||
                    'Camera access was not granted. Please allow camera access in your browser or take/upload your selfie using your device camera below.'}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  {/* Primary Option: Device Camera / Upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: isDark ? '#A1525F' : 'var(--color-mulberry)',
                      color: '#FFFFFF',
                      border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                      borderRadius: '10px',
                      padding: '10px 18px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>USE DEVICE CAMERA / UPLOAD</span>
                  </button>

                  {/* Secondary Option: Retry Live Camera */}
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    style={{
                      backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)',
                      color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                      border: isDark ? '1px solid rgba(240, 212, 184, 0.25)' : '1px solid rgba(73, 40, 61, 0.2)',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    TRY WEBCAM AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* CONTINUE BUTTON — AT THE VERY BOTTOM OF SCROLLABLE CONTENT */}
          {/* ========================================================== */}
          <div style={{ marginTop: '14px', marginBottom: '24px' }}>
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinueClick}
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '28px',
                background: canContinue
                  ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
                  : (isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(161, 82, 95, 0.22)'),
                color: canContinue
                  ? '#FDF3F5'
                  : (isDark ? 'rgba(253, 243, 245, 0.35)' : 'rgba(70, 32, 55, 0.45)'),
                border: 'none',
                fontSize: '15.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: canContinue
                  ? '0 6px 22px rgba(161, 82, 95, 0.4)'
                  : 'none',
                transition: 'filter 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (canContinue) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (canContinue) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>CONTINUE</span>
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {!canContinue && (
              <div
                style={{
                  fontSize: '13.5px',
                  color: isDark ? '#B3A1A8' : '#8A7A84',
                  textAlign: 'center',
                  marginTop: '10px',
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

        {/* Hidden File Input for Device Camera Capture Fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleSelfieFileUpload}
          style={{ display: 'none' }}
        />
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
                    : (isDark ? '#F9AAAD' : 'var(--color-mulberry)'),
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
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.78)' : '#F9F6F3',
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
                    : (isDark ? '#F9AAAD' : 'var(--color-mulberry)'),
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
                      ? (isDark ? '#F9AAAD' : 'var(--color-mulberry)')
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
