import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page7StandardsScreenProps {
  onBack: () => void;
  onSubmit: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

const STANDARDS_LIST = [
  {
    number: '01',
    text: 'Be who you say you are. Fake profiles and impersonation are removed.',
  },
  {
    number: '02',
    text: 'Harassment of any kind ends membership.',
  },
  {
    number: '03',
    text: 'Invitations are a trust, not a currency. Misuse affects your access.',
  },
  {
    number: '04',
    text: 'Consent and privacy come before curiosity — including in chat.',
  },
];

export const Page7StandardsScreen: React.FC<Page7StandardsScreenProps> = ({
  onBack,
  onSubmit,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { setApplicationSubmitted, appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccepted) return;

    // Mark application as submitted in global auth context
    sessionStorage.removeItem('ic_has_seen_submitted_popup');
    sessionStorage.removeItem('ic_photos_just_updated');
    setApplicationSubmitted(true);
    onSubmit();
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
        Exact same asset as Profile, Verification & Context pages for continuous visual flow
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

        {/* Top Navigation Bar: ← BACK & STEP 4 OF 4 */}
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
            aria-label="Go back to Context page"
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

          {/* Standards Badge */}
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: isDark ? '#B3A1A8' : '#8A7A84',
            }}
          >
            STANDARDS
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
            maxWidth: '840px',
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
            The standards we hold.
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 24px 0',
            }}
          >
            The Inner Circle is built for genuine and respectful connections.
          </p>

          {/* Numbered Standards List */}
          <div
            style={{
              backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : '1px solid rgba(73, 40, 61, 0.14)',
              padding: '8px 20px',
              marginBottom: '26px',
              boxShadow: isDark ? 'none' : '0 4px 20px rgba(73, 40, 61, 0.04)',
            }}
          >
            {STANDARDS_LIST.map((std, index) => (
              <div
                key={std.number}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom:
                    index < STANDARDS_LIST.length - 1
                      ? isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.09)'
                      : 'none',
                }}
              >
                {/* Number Badge */}
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '20px',
                    lineHeight: '1.2',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    fontWeight: 600,
                    width: '26px',
                    flexShrink: 0,
                    letterSpacing: '0.04em',
                  }}
                >
                  {std.number}
                </div>

                {/* Standard Text */}
                <p
                  style={{
                    fontSize: '15.5px',
                    lineHeight: '1.5',
                    color: isDark ? '#F3EEE9' : '#382833',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {std.text}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Acceptance Checkbox Area */}
            <div
              onClick={() => setIsAccepted(!isAccepted)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                marginBottom: '28px',
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: isDark ? 'rgba(24, 15, 20, 0.65)' : 'rgba(255, 255, 255, 0.55)',
                padding: '14px 16px',
                borderRadius: '14px',
                border: isAccepted
                  ? isDark ? '1.5px solid rgba(240, 212, 184, 0.45)' : '1.5px solid rgba(73, 40, 61, 0.35)'
                  : isDark ? '1px solid rgba(243, 238, 233, 0.14)' : '1px solid rgba(73, 40, 61, 0.14)',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            >
              {/* Custom Styled Checkbox */}
              <div
                role="checkbox"
                aria-checked={isAccepted}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsAccepted(!isAccepted);
                  }
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: isAccepted
                    ? isDark ? '1.5px solid #F0D4B8' : '1.5px solid var(--color-mulberry)'
                    : isDark ? '1.5px solid rgba(243, 238, 233, 0.3)' : '1.5px solid rgba(73, 40, 61, 0.35)',
                  backgroundColor: isAccepted
                    ? isDark ? '#5C2D4C' : 'var(--color-mulberry)'
                    : isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'background-color 0.18s ease, border-color 0.18s ease',
                  boxShadow: isAccepted
                    ? '0 2px 8px rgba(73, 40, 61, 0.25)'
                    : 'none',
                }}
              >
                {isAccepted && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>

              {/* Checkbox Legal Text with Distinguishable Links */}
              <div
                style={{
                  fontSize: '14.5px',
                  lineHeight: '1.5',
                  color: isDark ? '#D9CFD5' : '#4E3E48',
                }}
              >
                I accept the{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModal('Terms and Conditions');
                  }}
                  style={{
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    cursor: 'pointer',
                  }}
                >
                  Terms and Conditions
                </span>
                , the{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModal('Privacy Policy');
                  }}
                  style={{
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    cursor: 'pointer',
                  }}
                >
                  Privacy Policy
                </span>{' '}
                and the{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModal('Community Guidelines');
                  }}
                  style={{
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    cursor: 'pointer',
                  }}
                >
                  Community Guidelines
                </span>
                , and I confirm the information in my application is true.
              </div>
            </div>

            {/* ========================================================== */}
            {/* SUBMIT APPLICATION BUTTON (Enabled strictly upon checkbox) */}
            {/* ========================================================== */}
            <div style={{ marginTop: '10px', marginBottom: '24px' }}>
              <button
                type="submit"
                disabled={!isAccepted}
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '28px',
                  backgroundColor: isAccepted
                    ? 'var(--color-mulberry)'
                    : isDark ? 'rgba(243, 238, 233, 0.1)' : 'rgba(73, 40, 61, 0.22)',
                  color: isAccepted
                    ? '#FFFFFF'
                    : isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.45)',
                  border: 'none',
                  fontSize: '16.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: isAccepted ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isAccepted
                    ? '0 6px 22px rgba(73, 40, 61, 0.28)'
                    : 'none',
                  transition:
                    'background-color 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (isAccepted) {
                    e.currentTarget.style.backgroundColor = '#3B1F31';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isAccepted) {
                    e.currentTarget.style.backgroundColor = 'var(--color-mulberry)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span>SUBMIT APPLICATION</span>
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

              {!isAccepted && (
                <div
                  style={{
                    fontSize: '11.5px',
                    color: isDark ? '#AFA2A9' : '#8A7A84',
                    textAlign: 'center',
                    marginTop: '8px',
                    fontWeight: 500,
                  }}
                >
                  Please accept the terms and guidelines above to submit
                </div>
              )}
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

      {/* Information Modal for Guidelines/Terms/Privacy links */}
      {activeModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(18, 14, 17, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: isDark ? '#1C1218' : '#FFFFFF',
              borderRadius: '20px',
              padding: '28px 24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              textAlign: 'left',
              border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
                margin: '0 0 12px 0',
              }}
            >
              {activeModal}
            </h3>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: isDark ? '#D9CFD5' : '#5E4E58',
                margin: '0 0 20px 0',
              }}
            >
              {activeModal === 'Terms and Conditions' &&
                'By submitting your application to The Inner Circle, you agree to uphold our community integrity standards, respectful communications, and truthful representation.'}
              {activeModal === 'Privacy Policy' &&
                'Your privacy is our utmost priority. Profile verification credentials are never stored or displayed publicly, and all private data is guarded under high-grade TLS encryption.'}
              {activeModal === 'Community Guidelines' &&
                'Our community flourishes on genuine mutual respect, active consent, anti-harassment safeguards, and trustworthy referrals.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '23px',
                backgroundColor: 'var(--color-mulberry)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
