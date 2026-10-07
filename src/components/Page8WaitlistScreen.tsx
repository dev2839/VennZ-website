import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page8WaitlistScreenProps {
  onBack: () => void;
  onReturnToWelcome?: () => void;
  onUpdatePhotographs?: () => void;
  onSelectMembership?: () => void;
  onSelectFreeTrial?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page8WaitlistScreen: React.FC<Page8WaitlistScreenProps> = ({
  onBack,
  onReturnToWelcome,
  onUpdatePhotographs,
  onSelectMembership,
  onSelectFreeTrial,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    profile,
    phoneNumber,
    applicationDecision,
    setApplicationApproved,
    setApplicationDecision,
    simulate90DaysPassed,
    appearanceMode,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Track whether photos were just updated by the applicant
  const [photosJustUpdated, setPhotosJustUpdated] = useState<boolean>(() => {
    return sessionStorage.getItem('ic_photos_just_updated') === 'true';
  });

  // Show confirmation popup initially on arrival only if newly submitted for the first time
  const [showPopup, setShowPopup] = useState<boolean>(() => {
    if (sessionStorage.getItem('ic_photos_just_updated') === 'true') return false;
    if (sessionStorage.getItem('ic_has_seen_submitted_popup') === 'true') return false;
    return !applicationDecision;
  });

  // Review decision state: 'under_review' | 'approved' | 'declined' | 'more_info'
  const [decision, setDecision] = useState<'under_review' | 'approved' | 'declined' | 'more_info'>(() => {
    if (applicationDecision === 'approved' || applicationDecision === 'declined' || applicationDecision === 'more_info') {
      return applicationDecision;
    }
    try {
      const raw =
        sessionStorage.getItem('inner_circle_active_applicant_data') ||
        localStorage.getItem('inner_circle_active_applicant_data') ||
        localStorage.getItem('inner_circle_auth_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.applicationDecision) return parsed.applicationDecision;
      }
    } catch {}
    return 'under_review';
  });

  // Re-sync local decision state when AuthContext's applicationDecision changes (e.g. after phone switch or 90 days expiration)
  React.useEffect(() => {
    if (applicationDecision === 'approved' || applicationDecision === 'declined' || applicationDecision === 'more_info') {
      setDecision(applicationDecision);
    } else {
      setDecision('under_review');
    }
  }, [applicationDecision]);

  const handleApprove = () => {
    sessionStorage.removeItem('ic_photos_just_updated');
    setPhotosJustUpdated(false);
    setDecision('approved');
    setApplicationApproved(true);
    setApplicationDecision('approved');
  };

  const handleDecline = () => {
    sessionStorage.removeItem('ic_photos_just_updated');
    setPhotosJustUpdated(false);
    setDecision('declined');
    setApplicationApproved(false);
    setApplicationDecision('declined');
  };

  const handleMoreInfo = () => {
    sessionStorage.removeItem('ic_photos_just_updated');
    setPhotosJustUpdated(false);
    setDecision('more_info');
    setApplicationApproved(false);
    setApplicationDecision('more_info');
  };

  const handleSimulate90Days = () => {
    simulate90DaysPassed();
    setDecision('under_review');
  };

  const handleJoinMembership = () => {
    if (onSelectMembership) {
      onSelectMembership();
    } else {
      alert('Membership flow initiated. Coming in the next step!');
    }
  };

  const handleTryFree = () => {
    if (onSelectFreeTrial) {
      onSelectFreeTrial();
    } else {
      alert('Complimentary First Look activated! 24-Hour Access granted.');
    }
  };

  const isApproved = decision === 'approved';
  const isDeclined = decision === 'declined';
  const isMoreInfo = decision === 'more_info';
  const isUnderReview = decision === 'under_review';
  const hasMadeDecision = !isUnderReview;

  // Editorial Title based on current state
  const getHeading = () => {
    if (isApproved) return "You're approved.";
    if (isDeclined) return "Not this time.";
    if (isMoreInfo) return "We need a little more.";
    return "Your profile is under review.";
  };

  // Subtitle based on current state
  const getSubtitle = () => {
    if (isApproved) {
      return "Choose how you'd like to enter: start your membership, or take a complimentary twenty-four hour First Look first.";
    }
    if (isDeclined) {
      return "We're unable to approve your application at this time. You're welcome to reapply in ninety days.";
    }
    if (isMoreInfo) {
      return "Your photographs were a little unclear. Add one more clear photograph and we'll continue the review.";
    }
    return "Everyone's profile is read by hand. Once you're approved you can enter free for twenty-four hours, or start your membership straight away.";
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
        Exact same asset as Profile, Verification, Context & Standards pages for uninterrupted visual continuity
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

        {/* Top Navigation Bar: ← BACK & STATUS */}
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
            aria-label="Go back"
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

          {/* Status Badge */}
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: isApproved
                ? '#2E7D32'
                : isDeclined
                ? '#C94A4A'
                : isMoreInfo
                ? '#B45309'
                : '#8A7A84',
            }}
          >
            {isApproved
              ? 'APPROVED'
              : isDeclined
              ? 'DECLINED'
              : isMoreInfo
              ? 'ACTION NEEDED'
              : 'WAITLIST'}
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
        <div
          style={{
            padding: '24px 24px 44px 24px',
            textAlign: 'left',
            maxWidth: '880px',
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
              margin: '0 0 12px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {getHeading()}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 24px 0',
            }}
          >
            {getSubtitle()}
          </p>

          {/* Updated Photographs Received Notification Banner */}
          {photosJustUpdated && isUnderReview && (
            <div
              style={{
                backgroundColor: isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(46, 125, 50, 0.08)',
                border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(46, 125, 50, 0.25)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: isDark ? '#86EFAC' : '#2E7D32',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>✓</span>
              <span>Updated photographs received. Application is back under review.</span>
            </div>
          )}

          {/* SECTION: APPLICATION STATUS */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                marginBottom: '10px',
              }}
            >
              APPLICATION STATUS
            </div>

            <div
              style={{
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : '1px solid rgba(73, 40, 61, 0.14)',
                padding: '8px 18px',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(73, 40, 61, 0.04)',
              }}
            >
              {/* Stage 1: Account created */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 125, 50, 0.12)',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span style={{ fontSize: '13.5px', color: isDark ? '#F3EEE9' : '#272124', fontWeight: 500 }}>
                  Account created
                </span>
              </div>

              {/* Stage 2: Profile completed */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 125, 50, 0.12)',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span style={{ fontSize: '13.5px', color: isDark ? '#F3EEE9' : '#272124', fontWeight: 500 }}>
                  Profile completed
                </span>
              </div>

              {/* Stage 3: Identity verification completed */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 125, 50, 0.12)',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span style={{ fontSize: '13.5px', color: isDark ? '#F3EEE9' : '#272124', fontWeight: 500 }}>
                  Identity verification completed
                </span>
              </div>

              {/* Stage 4: Application submitted */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 125, 50, 0.12)',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span style={{ fontSize: '13.5px', color: isDark ? '#F3EEE9' : '#272124', fontWeight: 500 }}>
                  Application submitted
                </span>
              </div>

              {/* Stage 5: Manual review status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isApproved ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(46, 125, 50, 0.12)',
                        color: '#2E7D32',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: isDeclined
                          ? 'rgba(201, 74, 74, 0.14)'
                          : 'rgba(217, 119, 6, 0.14)',
                        color: isDeclined ? '#C94A4A' : '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isDeclined ? '#C94A4A' : '#D97706',
                          display: 'block',
                        }}
                      />
                    </div>
                  )}

                  <span
                    style={{
                      fontSize: '13.5px',
                      color: isApproved ? (isDark ? '#F3EEE9' : '#272124') : (isDark ? '#F9AAAD' : 'var(--color-mulberry)'),
                      fontWeight: 600,
                    }}
                  >
                    {isApproved ? 'Manual review complete' : 'Manual review in progress'}
                  </span>
                </div>

                {!isApproved && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isDeclined ? '#C94A4A' : '#D97706',
                      backgroundColor: isDeclined
                        ? 'rgba(201, 74, 74, 0.12)'
                        : 'rgba(217, 119, 6, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {isDeclined ? 'CLOSED' : isMoreInfo ? 'PHOTO' : 'PENDING'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* STATE-SPECIFIC ACTION AREAS                                */}
          {/* ========================================================== */}

          {/* 1. APPROVED STATE */}
          {isApproved && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '32px',
              }}
            >
              {/* Prominent Attention Callout: YOU CAN HAVE YOUR FIRST LOOK AT VennZ for FREE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '999px',
                  backgroundColor: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(199, 87, 124, 0.12)',
                  border: isDark ? '1.5px solid rgba(161, 82, 95, 0.45)' : '1.5px solid rgba(199, 87, 124, 0.35)',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  marginBottom: '4px',
                  boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.2)' : '0 4px 14px rgba(161, 82, 95, 0.1)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>YOU CAN HAVE YOUR FIRST LOOK AT VennZ for FREE</span>
              </div>

              {/* JOIN FOR FREE (Top Button) */}
              <button
                type="button"
                onClick={handleTryFree}
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
                <span>JOIN FOR FREE</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>

              {/* JOIN WITH MEMBERSHIP (Below Button) */}
              <button
                type="button"
                onClick={handleJoinMembership}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '26px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.75)',
                  color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
                  border: isDark ? '1.5px solid rgba(243, 238, 233, 0.25)' : '1.5px solid rgba(73, 40, 61, 0.25)',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.borderColor = isDark ? '#F9AAAD' : 'var(--color-mulberry)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.75)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(243, 238, 233, 0.25)' : 'rgba(73, 40, 61, 0.25)';
                }}
              >
                <span>JOIN WITH MEMBERSHIP</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>

              {/* Intentional Tagline */}
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: isDark ? '#D9CFD5' : '#6E5E68',
                  textAlign: 'center',
                  marginTop: '4px',
                }}
              >
                A more intentional way to meet, connect and grow!
              </div>
            </div>
          )}

          {/* 2. DECLINED STATE */}
          {isDeclined && (
            <div style={{ marginBottom: '32px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onReturnToWelcome) {
                    onReturnToWelcome();
                  } else {
                    window.location.href = '/';
                  }
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '26px',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FDF3F5',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(161, 82, 95, 0.35)',
                  transition: 'filter 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <span>RETURN TO THE WELCOME PAGE</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* 3. MORE INFO STATE */}
          {isMoreInfo && (
            <div style={{ marginBottom: '32px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onUpdatePhotographs) {
                    onUpdatePhotographs();
                  } else {
                    window.location.href = '/join/profile';
                  }
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '26px',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FDF3F5',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(161, 82, 95, 0.35)',
                  transition: 'filter 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <span>UPDATE MY PHOTOGRAPHS</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* 4. UNDER REVIEW STATE: WHAT HAPPENS NEXT */}
          {isUnderReview && (
            <div
              style={{
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.62)' : 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : '1px solid rgba(73, 40, 61, 0.14)',
                padding: '20px',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                  marginBottom: '10px',
                }}
              >
                WHAT HAPPENS NEXT
              </div>

              <p
                style={{
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: isDark ? '#D9CFD5' : '#5E4E58',
                  margin: '0 0 12px 0',
                }}
              >
                Because you've verified your identity and taken a live selfie, approval usually comes quickly. When it does, you'll be able to enter with twenty-four hours free, or start your membership at ₹1,499 a month.
              </p>

              <p
                style={{
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: isDark ? '#D9CFD5' : '#5E4E58',
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                We'll let you know as soon as your profile is approved.
              </p>
            </div>
          )}

          {/* ========================================================== */}
          {/* DEMO REVIEW SECTION: SIMULATE REVIEWER DECISION            */}
          {/* ========================================================== */}
          <div
            style={{
              borderTop: isDark ? '1px dashed rgba(243, 238, 233, 0.18)' : '1px dashed rgba(73, 40, 61, 0.22)',
              paddingTop: '20px',
              marginTop: '10px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isDark ? '#B3A1A8' : '#8A7A84',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              DEMO — SIMULATE A REVIEWER DECISION
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* APPROVE */}
              <button
                type="button"
                onClick={handleApprove}
                disabled={hasMadeDecision}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: isApproved
                    ? 'rgba(46, 125, 50, 0.15)'
                    : hasMadeDecision
                    ? isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(73, 40, 61, 0.04)'
                    : 'var(--color-mulberry)',
                  color: isApproved
                    ? '#2E7D32'
                    : hasMadeDecision
                    ? isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.3)'
                    : '#FFFFFF',
                  border: isApproved
                    ? '1.5px solid rgba(46, 125, 50, 0.4)'
                    : hasMadeDecision
                    ? isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.08)'
                    : 'none',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: hasMadeDecision ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: isApproved || hasMadeDecision ? 'none' : '0 2px 10px rgba(73, 40, 61, 0.2)',
                  opacity: hasMadeDecision && !isApproved ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isApproved ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>APPROVED ✓</span>
                  </>
                ) : (
                  <span>APPROVE</span>
                )}
              </button>

              {/* MORE INFO */}
              <button
                type="button"
                onClick={handleMoreInfo}
                disabled={hasMadeDecision}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: isMoreInfo
                    ? 'rgba(217, 119, 6, 0.16)'
                    : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.05)',
                  color: isMoreInfo
                    ? '#B45309'
                    : hasMadeDecision
                    ? isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.3)'
                    : isDark ? '#E5DCD4' : 'var(--color-mulberry)',
                  border: isMoreInfo
                    ? '1.5px solid rgba(217, 119, 6, 0.5)'
                    : isDark ? '1px solid rgba(243, 238, 233, 0.14)' : '1px solid rgba(73, 40, 61, 0.12)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: hasMadeDecision ? 'not-allowed' : 'pointer',
                  opacity: hasMadeDecision && !isMoreInfo ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isMoreInfo ? 'MORE INFO ✓' : 'MORE INFO'}
              </button>

              {/* DECLINE */}
              <button
                type="button"
                onClick={handleDecline}
                disabled={hasMadeDecision}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: isDeclined
                    ? 'rgba(201, 74, 74, 0.14)'
                    : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.05)',
                  color: isDeclined
                    ? '#C94A4A'
                    : hasMadeDecision
                    ? isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.3)'
                    : isDark ? '#E5DCD4' : 'var(--color-mulberry)',
                  border: isDeclined
                    ? '1.5px solid rgba(201, 74, 74, 0.45)'
                    : isDark ? '1px solid rgba(243, 238, 233, 0.14)' : '1px solid rgba(73, 40, 61, 0.12)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: hasMadeDecision ? 'not-allowed' : 'pointer',
                  opacity: hasMadeDecision && !isDeclined ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isDeclined ? 'DECLINED ✓' : 'DECLINE'}
              </button>
            </div>

            {/* Active Phone Indicator & 90-Day Simulation Control */}
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {phoneNumber && (
                <div
                  style={{
                    fontSize: '11px',
                    color: isDark ? '#B3A1A8' : '#8A7A84',
                    fontFamily: 'monospace',
                  }}
                >
                  Applicant ID: +91 {phoneNumber}
                </div>
              )}

              {hasMadeDecision && (
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('ic_photos_just_updated');
                    setPhotosJustUpdated(false);
                    setDecision('under_review');
                    setApplicationApproved(false);
                    setApplicationDecision(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    fontWeight: 600,
                  }}
                  title="Reset review status so all 3 decision buttons become available"
                >
                  ↺ Reset Decision to "Under Review"
                </button>
              )}

              {isDeclined && (
                <button
                  type="button"
                  onClick={handleSimulate90Days}
                  style={{
                    backgroundColor: isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                    border: isDark ? '1px dashed rgba(243, 238, 233, 0.25)' : '1px dashed rgba(73, 40, 61, 0.3)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  title="Fast-forward 90 days to test re-applying"
                >
                  <span>⏩ Fast-Forward: Simulate 90 Days Passed</span>
                </button>
              )}
            </div>
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
      </div>

      {/* ========================================================== */}
      {/* CONFIRMATION POPUP / MODAL (Application Submitted)         */}
      {/* ========================================================== */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 14, 17, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
          onClick={() => {
            setShowPopup(false);
            sessionStorage.setItem('ic_has_seen_submitted_popup', 'true');
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '360px',
              backgroundColor: isDark ? '#1C1218' : '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 24px 28px 24px',
              textAlign: 'center',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              border: isDark ? '1px solid rgba(243, 238, 233, 0.12)' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button in Top-Right Corner */}
            <button
              type="button"
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem('ic_has_seen_submitted_popup', 'true');
              }}
              aria-label="Close application submitted confirmation"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                border: 'none',
                color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(73, 40, 61, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {/* Checkmark Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(46, 125, 50, 0.12)',
                color: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            {/* Popup Title */}
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '26px',
                lineHeight: '1.2',
                color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Application submitted.
            </h2>

            {/* Personalized Salutation */}
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
              }}
            >
              Thank you, {profile.firstName?.trim() || 'Member'}.
            </div>

            {/* Reassuring Explanatory Paragraph */}
            <p
              style={{
                fontSize: '13.5px',
                lineHeight: '1.5',
                color: isDark ? '#D9CFD5' : '#6B5A65',
                margin: 0,
              }}
            >
              Your application to VennZ has been received and is now hand-reviewed by our membership committee.
            </p>

            {/* Action Confirmation Button */}
            <button
              type="button"
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem('ic_has_seen_submitted_popup', 'true');
              }}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '23px',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FDF3F5',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: '0 4px 14px rgba(161, 82, 95, 0.4)',
              }}
            >
              VIEW STATUS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
