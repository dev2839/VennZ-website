import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page6ContextScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onSkip?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page6ContextScreen: React.FC<Page6ContextScreenProps> = ({
  onBack,
  onSuccess,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { profile, updateProfile, appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Local state initialized from profile context
  const [linkedinUrl, setLinkedinUrl] = useState<string>(profile.linkedinUrl || '');
  const [instagramUsername, setInstagramUsername] = useState<string>(profile.instagramUsername || '');
  const [showLinkedinPublicly, setShowLinkedinPublicly] = useState<boolean>(profile.showLinkedinPublicly ?? false);
  const [showInstagramPublicly, setShowInstagramPublicly] = useState<boolean>(profile.showInstagramPublicly ?? false);

  // Validation errors
  const [errors, setErrors] = useState<{
    linkedinUrl?: string;
    instagramUsername?: string;
  }>({});

  // Input focus tracking
  const [focusedField, setFocusedField] = useState<'linkedin' | 'instagram' | null>(null);

  // Validate only if user actually entered something
  const validateInputs = (): boolean => {
    const newErrors: { linkedinUrl?: string; instagramUsername?: string } = {};

    const trimmedLinkedin = linkedinUrl.trim();
    if (trimmedLinkedin) {
      // Basic check: should resemble a LinkedIn URL or profile path
      const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i;
      if (!linkedinPattern.test(trimmedLinkedin)) {
        newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)';
      }
    }

    const trimmedInstagram = instagramUsername.trim();
    if (trimmedInstagram) {
      // Normal Instagram username: alphanumeric, periods, underscores, max 30 chars
      const cleanHandle = trimmedInstagram.startsWith('@')
        ? trimmedInstagram.slice(1)
        : trimmedInstagram;
      const instagramPattern = /^[a-zA-Z0-9._]{1,30}$/;
      if (!instagramPattern.test(cleanHandle)) {
        newErrors.instagramUsername = 'Please enter a valid Instagram handle (e.g. @username)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }

    // Format handle with leading @ if entered without it
    let formattedInstagram = instagramUsername.trim();
    if (formattedInstagram && !formattedInstagram.startsWith('@')) {
      formattedInstagram = `@${formattedInstagram}`;
    }

    // Save values into global auth context
    updateProfile({
      linkedinUrl: linkedinUrl.trim(),
      instagramUsername: formattedInstagram,
      showLinkedinPublicly,
      showInstagramPublicly,
    });

    onSuccess();
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
        Exact same asset as Page 4 & Page 5 to ensure complete visual continuity with zero break
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

        {/* Top Navigation Bar: ← BACK & CONTEXT */}
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
            onClick={onBack}
            aria-label="Go back to Verify Identity"
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

          {/* Context Badge */}
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: isDark ? '#B3A1A8' : '#8A7A84',
            }}
          >
            CONTEXT
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
            padding: '24px 24px 40px 24px',
            textAlign: 'left',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Main Editorial Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 3.8vw, 42px)',
              lineHeight: '1.15',
              fontWeight: 400,
              color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
              margin: '0 0 10px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Anything else we should see?
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 28px 0',
            }}
          >
            Optional, and recommended. These help our reviewers place you — they are never shown to other members.
          </p>

          <form onSubmit={handleContinue} noValidate>
            {/* 1. LINKEDIN PROFILE URL */}
            <div style={{ marginBottom: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <label
                  htmlFor="context-linkedin"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
                  }}
                >
                  LINKEDIN PROFILE URL
                </label>
                <span
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    color: isDark ? '#AFA2A9' : '#8A7A84',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  OPTIONAL
                </span>
              </div>

              <input
                id="context-linkedin"
                type="url"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  if (errors.linkedinUrl) {
                    setErrors((prev) => ({ ...prev, linkedinUrl: undefined }));
                  }
                }}
                onFocus={() => setFocusedField('linkedin')}
                onBlur={() => setFocusedField(null)}
                placeholder="https://linkedin.com/in/yourname"
                autoComplete="off"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.linkedinUrl
                    ? '1.5px solid #E06D6D'
                    : focusedField === 'linkedin'
                    ? isDark ? '1.5px solid #F9AAAD' : '1.5px solid var(--color-mulberry)'
                    : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow:
                    focusedField === 'linkedin'
                      ? isDark ? '0 0 0 3px rgba(249, 170, 173, 0.2)' : '0 0 0 3px rgba(73, 40, 61, 0.08)'
                      : 'none',
                }}
              />

              {errors.linkedinUrl && (
                <div
                  style={{
                    color: '#E06D6D',
                    fontSize: '13px',
                    marginTop: '6px',
                    lineHeight: '1.4',
                  }}
                >
                  {errors.linkedinUrl}
                </div>
              )}

              {/* Public Display Toggle for LinkedIn */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={showLinkedinPublicly}
                  onChange={(e) => setShowLinkedinPublicly(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#C7577C',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '13px', color: isDark ? '#D9CFD5' : '#5E4E58' }}>
                  Display LinkedIn publicly on my VennZ profile
                </span>
              </label>
            </div>

            {/* 2. INSTAGRAM USERNAME */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <label
                  htmlFor="context-instagram"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
                  }}
                >
                  INSTAGRAM USERNAME
                </label>
                <span
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    color: isDark ? '#AFA2A9' : '#8A7A84',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  OPTIONAL
                </span>
              </div>

              <input
                id="context-instagram"
                type="text"
                value={instagramUsername}
                onChange={(e) => {
                  setInstagramUsername(e.target.value);
                  if (errors.instagramUsername) {
                    setErrors((prev) => ({ ...prev, instagramUsername: undefined }));
                  }
                }}
                onFocus={() => setFocusedField('instagram')}
                onBlur={() => setFocusedField(null)}
                placeholder="@username"
                autoComplete="off"
                autoCapitalize="none"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.instagramUsername
                    ? '1.5px solid #E06D6D'
                    : focusedField === 'instagram'
                    ? isDark ? '1.5px solid #F9AAAD' : '1.5px solid var(--color-mulberry)'
                    : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow:
                    focusedField === 'instagram'
                      ? isDark ? '0 0 0 3px rgba(249, 170, 173, 0.2)' : '0 0 0 3px rgba(73, 40, 61, 0.08)'
                      : 'none',
                }}
              />

              {errors.instagramUsername && (
                <div
                  style={{
                    color: '#E06D6D',
                    fontSize: '13px',
                    marginTop: '6px',
                    lineHeight: '1.4',
                  }}
                >
                  {errors.instagramUsername}
                </div>
              )}

              {/* Public Display Toggle for Instagram */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={showInstagramPublicly}
                  onChange={(e) => setShowInstagramPublicly(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#C7577C',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '13px', color: isDark ? '#D9CFD5' : '#5E4E58' }}>
                  Display Instagram publicly on my VennZ profile
                </span>
              </label>
            </div>

            {/* 3. EXPLANATION CALLOUT */}
            <div
              style={{
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.62)' : 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '14px',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : '1px solid rgba(73, 40, 61, 0.12)',
                padding: '16px',
                marginBottom: '32px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: isDark ? '#C0B3B9' : '#6B5A65',
                  margin: 0,
                }}
              >
                Optional LinkedIn and Instagram profiles support verification and consistency checks. They will only be displayed publicly on your VennZ profile if you explicitly choose to display them above.
              </p>
            </div>

            {/* ========================================================== */}
            {/* BUTTON: PRIMARY CONTINUE                                  */}
            {/* ========================================================== */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '8px',
                marginBottom: '24px',
              }}
            >
              {/* PRIMARY: CONTINUE */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FDF3F5',
                  border: 'none',
                  fontSize: '16.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 22px rgba(161, 82, 95, 0.4)',
                  transition: 'filter 0.2s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
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
            </div>
          </form>

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
      </div>
    </div>
  );
};
