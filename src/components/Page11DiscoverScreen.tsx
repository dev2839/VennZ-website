import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';
import { DUMMY_DISCOVER_PROFILES } from '../data/dummyProfiles';
import type { DiscoverProfile } from '../types/discover';
import { useLightbox } from '../context/LightboxContext';

interface Page11DiscoverScreenProps {
  onViewFullProfile: (profile: DiscoverProfile) => void;
  onSelectTab?: (tab: MemberTab) => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page11DiscoverScreen: React.FC<Page11DiscoverScreenProps> = ({
  onViewFullProfile,
  onSelectTab,
  onUpgradeToMembership,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    profile,
    updateProfile,
    passedProfileIds,
    sentRequestProfileIds,
    passProfile,
    sendConnectionRequest,
    resetDiscoverQueue,
    appearanceMode,
    isComplimentary,
    isMember,
    isTrialExpired,
    complimentaryProfilesRemaining,
    complimentaryRequestsRemaining,
    canDiscoverMore,
    canSendMoreRequests,
    setMembershipStatus,
  } = useAuth();
  const { openLightbox } = useLightbox();
  const isDark = appearanceMode === 'after-dark';

  // Active tab for bottom navigation (5 buttons: discover, matches, elevate, mixers, you)
  const [activeTab, setActiveTab] = useState<MemberTab>('discover');
  const [showLimitModal, setShowLimitModal] = useState<'profiles' | 'requests' | null>(null);

  // User's dating preference from onboarding profile
  const userDatingPref = (profile.datingPreference || '').trim().toUpperCase();

  const isProfileMatchingPreference = (candidateGender: 'woman' | 'man' | 'other') => {
    if (!userDatingPref || userDatingPref === 'EVERYONE' || userDatingPref === 'ANYTHING' || userDatingPref === 'ALL') {
      return true;
    }
    if (userDatingPref.includes('WOMEN') || userDatingPref === 'WOMAN') {
      return candidateGender === 'woman';
    }
    if (userDatingPref.includes('MEN') || userDatingPref === 'MAN') {
      return candidateGender === 'man';
    }
    return true;
  };

  // Filter out profiles that have already been passed/requested AND match gender preference
  const availableProfiles = DUMMY_DISCOVER_PROFILES.filter(
    (p) =>
      !passedProfileIds.includes(p.id) &&
      !sentRequestProfileIds.includes(p.id) &&
      isProfileMatchingPreference(p.gender)
  );

  const canShowProfile = isMember || (!isTrialExpired && complimentaryProfilesRemaining > 0);
  const currentProfile: DiscoverProfile | undefined = canShowProfile ? availableProfiles[0] : undefined;
  const remainingCount = isMember
    ? availableProfiles.length
    : Math.min(availableProfiles.length, complimentaryProfilesRemaining);

  // Photo Queue Animation & Deck Order State for Current Profile
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'drop' | 'return'>('idle');
  const isTransitioningRef = useRef<boolean>(false);
  const timeout1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
      if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
    };
  }, []);

  // Initialize or reset card queue order whenever current profile changes
  useEffect(() => {
    if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
    if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
    if (currentProfile?.photos && currentProfile.photos.length > 0) {
      setCardOrder(currentProfile.photos.map((_, i) => i));
    } else {
      setCardOrder([]);
    }
    setTransitionPhase('idle');
    isTransitioningRef.current = false;
  }, [currentProfile?.id]);

  // Preload upcoming photos in the queue
  useEffect(() => {
    if (!currentProfile?.photos || currentProfile.photos.length <= 1 || cardOrder.length === 0) return;
    const currentFront = cardOrder[0] ?? 0;
    const nextIdx = (currentFront + 1) % currentProfile.photos.length;
    const img1 = new Image();
    img1.src = currentProfile.photos[nextIdx];
    if (currentProfile.photos.length > 2) {
      const nextNextIdx = (currentFront + 2) % currentProfile.photos.length;
      const img2 = new Image();
      img2.src = currentProfile.photos[nextNextIdx];
    }
  }, [cardOrder, currentProfile]);

  // Transition to next photo: slide down in front, drop behind, and glide up into the rear of the stack
  const handleNextPhotoCard = useCallback(() => {
    if (!currentProfile?.photos || currentProfile.photos.length <= 1) return;
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Phase 1: Slide down in front to reveal the next card (which already has its own image & text!)
    setTransitionPhase('drop');

    // Phase 2: Outgoing front card drops behind the deck (zIndex 1) and glides up into rear position
    timeout1Ref.current = setTimeout(() => {
      setTransitionPhase('return');

      // Phase 3: Settle smoothly into back of queue, rotate order without coordinate jump
      timeout2Ref.current = setTimeout(() => {
        setCardOrder((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
        setTransitionPhase('idle');
        isTransitioningRef.current = false;
      }, 300);
    }, 280);
  }, [currentProfile]);

  // Active displayed photo index (during transition, the incoming front card is cardOrder[1])
  const activePhotoIndex = (transitionPhase === 'drop' || transitionPhase === 'return')
    ? (cardOrder.length > 1 ? cardOrder[1] : (cardOrder[0] ?? 0))
    : (cardOrder[0] ?? 0);

  // Helper to get distinct text & story details for each photo of a profile
  const getPhotoCardDetails = (prof: DiscoverProfile, photoIndex: number) => {
    // Photo 0: Exact same primary info as now (Name, Age, Verified, City, Role/Work)
    if (photoIndex === 0) {
      return {
        type: 'primary' as const,
        nameAge: `${prof.firstName}, ${prof.age}`,
        isVerified: prof.isVerified,
        city: prof.city,
        work: [prof.designation, prof.company].filter(Boolean).join(' · '),
      };
    }

    // Specific photo prompt if available in profile data
    const prompt = prof.photoPrompts?.find((p) => p.photoIndex === photoIndex);
    if (prompt) {
      return {
        type: 'prompt' as const,
        title: prompt.title,
        subtitle: prompt.subtitle,
        content: prompt.content,
        tags: prompt.tags || [],
      };
    }

    // Context-rich fallbacks for subsequent photos
    if (photoIndex === 1) {
      return {
        type: 'prompt' as const,
        title: 'WEEKEND RITUAL',
        subtitle: prof.vibes?.slice(0, 2).join(' · ') || 'Off-Hours Rhythm',
        content: prof.weekendRitual || prof.introduction,
        tags: prof.interests?.slice(0, 3) || [],
      };
    }

    if (photoIndex === 2) {
      return {
        type: 'prompt' as const,
        title: 'WHAT MOVES ME',
        subtitle: prof.vibes?.slice(2, 4).join(' · ') || 'Passions & Escapes',
        content: (prof.quirks && prof.quirks.length > 0)
          ? prof.quirks.join(' · ')
          : prof.introduction,
        tags: prof.interests?.slice(2, 5) || [],
      };
    }

    return {
      type: 'prompt' as const,
      title: 'LIFE BEYOND WORK',
      subtitle: prof.city,
      content: prof.introduction,
      tags: prof.vibes || [],
    };
  };

  // Touch handlers for mobile / tablet horizontal flick
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      handleNextPhotoCard();
    }
  };

  // Card dismissal animation state (only triggered via PASS / SEND REQUEST buttons)
  const [isAnimatingOut, setIsAnimatingOut] = useState<'left' | 'right' | null>(null);

  // Notification / toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // PASS Action Handler
  const handlePass = () => {
    if (!currentProfile || isAnimatingOut) return;
    if (!isMember && !canDiscoverMore) {
      setShowLimitModal('profiles');
      return;
    }
    setIsAnimatingOut('left');
    setTimeout(() => {
      passProfile(currentProfile.id);
      setIsAnimatingOut(null);
      showToast(`Passed ${currentProfile.firstName}`);
    }, 320);
  };

  // SEND REQUEST Action Handler
  const handleSendRequest = () => {
    if (!currentProfile || isAnimatingOut) return;
    if (!isMember && !canSendMoreRequests) {
      setShowLimitModal('requests');
      return;
    }
    setIsAnimatingOut('right');
    setTimeout(() => {
      sendConnectionRequest(currentProfile.id);
      setIsAnimatingOut(null);
      showToast(`Introduction request sent to ${currentProfile.firstName}`);
    }, 320);
  };

  // Handle Tab Switch (5 buttons: Discover, Matches, Elevate, Mixers, You)
  const handleTabChange = (tab: MemberTab) => {
    setActiveTab(tab);
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  // Rotation and translation during button-triggered dismissal
  const rotationDeg = isAnimatingOut === 'left' ? -18 : isAnimatingOut === 'right' ? 18 : 0;
  const cardTranslateX = isAnimatingOut === 'left' ? -420 : isAnimatingOut === 'right' ? 420 : 0;
  const cardOpacity = isAnimatingOut ? 0 : 1;

  // Dynamic theme styling
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const themeCardBg = isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: themeBgColor,
        color: themeTextColor,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* 
        REFERENCE 1: Exact Botanical Background Asset (Dynamic: Darkened Botanical wallpaper in After Dark)
      */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.98 : 0.96,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background-image 0.25s ease, opacity 0.25s ease',
        }}
      />

      {/* Subtle Luminous Parchment Glow & Dark Atmospheric Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.35)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* iOS Status Bar */}
      {showStatusBar && (
        <div
          style={{
            position: 'relative',
            zIndex: 45,
            backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.92)',
            transition: 'background-color 0.25s ease',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* REFERENCE 2: Fixed Member Top Bar */}
      <MemberTopBar />

      {/* Main Content Area */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Dynamic Introductions Sub-header */}
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            width: '100%',
            padding: '16px 24px 10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: themeMulberry,
              }}
            >
              {remainingCount > 0 ? 'TODAY’S INTRODUCTIONS' : 'DISCOVER'}
            </span>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: themeMuted,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(73, 40, 61, 0.08)',
              padding: '2px 9px',
              borderRadius: '9999px',
            }}
          >
            {remainingCount} REMAINING
          </span>
        </div>

        {/* Subtle Indicator on Discover during Free Trial (Image 3) */}
        {isComplimentary && !isTrialExpired && (
          <div
            style={{
              maxWidth: '1080px',
              margin: '0 auto',
              width: '100%',
              padding: '0 24px 12px 24px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(73, 40, 61, 0.04)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.08)'}`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: themeMulberry,
                  }}
                >
                  Complimentary Access
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    color: themeMuted,
                    letterSpacing: '0.02em',
                  }}
                >
                  Curated profiles. Meaningful connections.
                </span>
              </div>

              {/* Exact pill badge style from Image 3 */}
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#1C1619' : 'rgba(40, 20, 32, 0.88)',
                  color: '#FAF4E8',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {complimentaryProfilesRemaining} profiles remaining · {complimentaryRequestsRemaining} connections remaining
              </div>
            </div>
          </div>
        )}

        {/* PROFILE INTRODUCTION CARD OR EMPTY STATE */}
        {currentProfile ? (
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              width: '100%',
              padding: '0 20px 32px 20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* CARD STACK WRAPPER WITH 4:5 PORTRAIT RATIO & CARD-QUEUE ANIMATION */}
            {(() => {
              const photoList = currentProfile.photos || [];
              const N = photoList.length;

              const currentCardOrder = cardOrder.length === N ? cardOrder : photoList.map((_, i) => i);
              const frontIdx = currentCardOrder[0] ?? 0;
              const nextIdx = N > 1 ? currentCardOrder[1] : null;
              const thirdIdx = N > 2 ? currentCardOrder[2] : null;

              // Helper function to render the full self-contained content of each photo card
              const renderCardBody = (pIdx: number, isInteractiveFront: boolean) => {
                const photoUrl = photoList[pIdx];
                const details = getPhotoCardDetails(currentProfile, pIdx);

                return (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: '24px',
                    }}
                  >
                    {/* Photo Image */}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`${currentProfile.firstName}'s photo ${pIdx + 1}`}
                        draggable={false}
                        className="ken-burns-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top',
                          display: 'block',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isDark ? '#2D1B28' : '#F2E8EB',
                          color: themeMulberry,
                          fontSize: '48px',
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {currentProfile.firstName[0]}
                      </div>
                    )}

                    {/* Top Segmented Progress Bar */}
                    {N > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '16px',
                          right: '16px',
                          display: 'flex',
                          gap: '5px',
                          zIndex: 25,
                          pointerEvents: 'none',
                        }}
                      >
                        {photoList.map((_, segIdx) => (
                          <div
                            key={segIdx}
                            style={{
                              height: '3px',
                              flex: 1,
                              borderRadius: '2px',
                              backgroundColor: segIdx === pIdx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.38)',
                              boxShadow: segIdx === pIdx ? '0 0 6px rgba(255, 255, 255, 0.8)' : 'none',
                              transition: 'background-color 0.25s ease',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Activity Status Badge */}
                    {currentProfile.activeStatus && (
                      <div
                        style={{
                          position: 'absolute',
                          top: N > 1 ? '24px' : '14px',
                          left: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(16, 10, 18, 0.72)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          zIndex: 25,
                          pointerEvents: 'none',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#34D399',
                            boxShadow: '0 0 8px #34D399',
                            display: 'inline-block',
                          }}
                        />
                        <span>{currentProfile.activeStatus}</span>
                      </div>
                    )}

                    {/* Lightbox / Enlarge Trigger Button (interactive on front card) */}
                    {photoUrl && isInteractiveFront && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(photoList, pIdx, `${currentProfile.firstName}, ${currentProfile.age}`);
                        }}
                        aria-label="View photo in full screen lightbox"
                        title="View full screen photo"
                        style={{
                          position: 'absolute',
                          top: N > 1 ? '22px' : '12px',
                          right: '16px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(16, 10, 18, 0.65)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 25,
                          transition: 'transform 0.15s ease, background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                          e.currentTarget.style.backgroundColor = 'rgba(73, 40, 61, 0.9)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = 'rgba(16, 10, 18, 0.65)';
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Subtle Dark Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: details.type === 'primary' ? '58%' : '66%',
                        background: 'linear-gradient(to top, rgba(14, 8, 14, 0.96) 0%, rgba(14, 8, 14, 0.70) 42%, rgba(14, 8, 14, 0.16) 78%, transparent 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Overlay Details */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '18px',
                        left: '20px',
                        right: '20px',
                        zIndex: 15,
                        pointerEvents: 'none',
                      }}
                    >
                      {details.type === 'primary' ? (
                        // FIRST IMAGE: EXACT SAME TEXT AS NOW
                        <>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <h2
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '30px',
                                fontWeight: 400,
                                color: '#FFFFFF',
                                margin: 0,
                                letterSpacing: '-0.01em',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                              }}
                            >
                              {details.nameAge}
                            </h2>

                            {details.isVerified && (
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  letterSpacing: '0.1em',
                                  textTransform: 'uppercase',
                                  color: '#86EFAC',
                                  backgroundColor: 'rgba(34, 197, 94, 0.22)',
                                  border: '1px solid rgba(74, 222, 128, 0.35)',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                VERIFIED
                              </span>
                            )}
                          </div>

                          {details.city && (
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'rgba(255, 255, 255, 0.85)',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{details.city}</span>
                            </div>
                          )}

                          {details.work && (
                            <div
                              style={{
                                fontSize: '14px',
                                fontFamily: 'var(--font-serif)',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.95)',
                                lineHeight: '1.3',
                              }}
                            >
                              {details.work}
                            </div>
                          )}
                        </>
                      ) : (
                        // DIFFERENT TEXT ABOUT THAT PERSON ON SUBSEQUENT IMAGES
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: '#F9AAAD',
                                backgroundColor: 'rgba(161, 82, 95, 0.32)',
                                border: '1px solid rgba(161, 82, 95, 0.45)',
                                padding: '3px 9px',
                                borderRadius: '999px',
                              }}
                            >
                              {details.title}
                            </span>
                            {details.subtitle && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  letterSpacing: '0.04em',
                                  color: 'rgba(255, 255, 255, 0.85)',
                                }}
                              >
                                {details.subtitle}
                              </span>
                            )}
                          </div>

                          {details.content && (
                            <p
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '15.5px',
                                lineHeight: '1.42',
                                color: '#FFFFFF',
                                margin: '0 0 8px 0',
                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {details.content}
                            </p>
                          )}

                          {details.tags && details.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {details.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'rgba(255, 255, 255, 0.92)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                                    backdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    transform: `translate3d(${cardTranslateX}px, 0, 0) rotate(${rotationDeg}deg)`,
                    transition: isAnimatingOut ? 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease' : 'none',
                    opacity: cardOpacity,
                    userSelect: 'none',
                  }}
                >
                  {/* Photo Card Deck Container (4:5 Aspect Ratio) */}
                  <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 5',
                      borderRadius: '24px',
                      perspective: '1000px',
                    }}
                  >
                    {/* Layer 3: Deepest Background Card (shown if N >= 3) */}
                    {thirdIdx !== null && (
                      <div
                        key={`deck-card-${thirdIdx}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '24px',
                          backgroundColor: '#1E161C',
                          boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.45)' : '0 8px 22px rgba(73, 40, 61, 0.1)',
                          transform: transitionPhase === 'idle'
                            ? 'translate3d(0, -16px, -30px) scale(0.90) rotate(-2.8deg)'
                            : 'translate3d(0, -8px, -15px) scale(0.95) rotate(2.4deg)',
                          transformOrigin: 'bottom center',
                          opacity: transitionPhase === 'idle' ? 0.75 : 0.9,
                          filter: transitionPhase === 'idle'
                            ? (isDark ? 'brightness(0.68)' : 'brightness(0.78)')
                            : (isDark ? 'brightness(0.78)' : 'brightness(0.88)'),
                          zIndex: 2,
                          transition: prefersReducedMotion
                            ? 'none'
                            : transitionPhase === 'drop'
                            ? 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease, filter 0.28s ease'
                            : 'none',
                          pointerEvents: 'none',
                        }}
                      >
                        {renderCardBody(thirdIdx, false)}
                      </div>
                    )}

                    {/* Layer 2: Middle Background Card (shown if N >= 2) */}
                    {nextIdx !== null && (
                      <div
                        key={`deck-card-${nextIdx}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '24px',
                          backgroundColor: '#1E161C',
                          boxShadow: transitionPhase === 'idle'
                            ? (isDark ? '0 12px 30px rgba(0, 0, 0, 0.5)' : '0 12px 28px rgba(73, 40, 61, 0.12)')
                            : (isDark ? '0 18px 44px rgba(0, 0, 0, 0.6)' : '0 16px 40px rgba(73, 40, 61, 0.18)'),
                          transform: transitionPhase === 'idle'
                            ? 'translate3d(0, -8px, -15px) scale(0.95) rotate(2.4deg)'
                            : 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
                          transformOrigin: 'bottom center',
                          opacity: transitionPhase === 'idle' ? 0.9 : 1,
                          filter: transitionPhase === 'idle'
                            ? (isDark ? 'brightness(0.78)' : 'brightness(0.88)')
                            : 'brightness(1)',
                          zIndex: transitionPhase === 'idle' ? 5 : 10,
                          transition: prefersReducedMotion
                            ? 'none'
                            : transitionPhase === 'drop'
                            ? 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease, filter 0.28s ease'
                            : 'none',
                          pointerEvents: 'none',
                        }}
                      >
                        {renderCardBody(nextIdx, false)}
                      </div>
                    )}

                    {/* Layer 1: Front / Outgoing Card */}
                    <div
                      key={`deck-card-${frontIdx}`}
                      onClick={handleNextPhotoCard}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '24px',
                        backgroundColor: '#1E161C',
                        boxShadow: transitionPhase === 'drop'
                          ? (isDark ? '0 24px 50px rgba(0, 0, 0, 0.7)' : '0 22px 46px rgba(73, 40, 61, 0.24)')
                          : transitionPhase === 'return'
                          ? (isDark ? '0 8px 24px rgba(0, 0, 0, 0.45)' : '0 8px 22px rgba(73, 40, 61, 0.1)')
                          : (isDark ? '0 18px 44px rgba(0, 0, 0, 0.6)' : '0 16px 40px rgba(73, 40, 61, 0.18)'),
                        transform: transitionPhase === 'idle'
                          ? 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
                          : transitionPhase === 'drop'
                          ? 'translate3d(8px, 76%, 20px) scale(0.96) rotate(3.5deg)'
                          : (thirdIdx !== null
                            ? 'translate3d(0, -16px, -30px) scale(0.90) rotate(-2.8deg)'
                            : 'translate3d(0, -8px, -15px) scale(0.95) rotate(2.4deg)'),
                        transformOrigin: 'bottom center',
                        opacity: transitionPhase === 'return' ? (thirdIdx !== null ? 0.75 : 0.9) : 1,
                        filter: transitionPhase === 'return'
                          ? (thirdIdx !== null ? (isDark ? 'brightness(0.68)' : 'brightness(0.78)') : (isDark ? 'brightness(0.78)' : 'brightness(0.88)'))
                          : 'brightness(1)',
                        zIndex: transitionPhase === 'drop' ? 15 : (transitionPhase === 'return' ? 1 : 10),
                        cursor: N > 1 ? 'pointer' : 'default',
                        transition: prefersReducedMotion
                          ? 'none'
                          : transitionPhase === 'drop'
                          ? 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.28s ease'
                          : transitionPhase === 'return'
                          ? 'transform 0.30s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.30s ease, filter 0.30s ease'
                          : 'none',
                        userSelect: 'none',
                      }}
                      title={N > 1 ? 'Click to see next photo' : undefined}
                    >
                      {renderCardBody(frontIdx, true)}
                    </div>
                  </div>

                  {/* THREE ACTION BUTTONS: PASS, NEXT PHOTO, LIKE */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '20px',
                      marginTop: '22px',
                      marginBottom: '14px',
                    }}
                  >
                    {/* 1. Pass: Subtle cross icon */}
                    <button
                      type="button"
                      onClick={handlePass}
                      aria-label={`Pass on ${currentProfile.firstName}`}
                      title="Pass"
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255, 255, 255, 0.95)',
                        color: themeMulberry,
                        border: isDark ? '1.5px solid rgba(161, 82, 95, 0.4)' : '1.5px solid rgba(161, 82, 95, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: isDark ? '0 6px 18px rgba(0, 0, 0, 0.35)' : '0 6px 18px rgba(161, 82, 95, 0.1)',
                        transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.06)';
                        e.currentTarget.style.borderColor = themeMulberry;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = isDark ? 'rgba(161, 82, 95, 0.4)' : 'rgba(161, 82, 95, 0.25)';
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                    {/* 2. Next Photo: Discreet cycle / next control */}
                    {N > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextPhotoCard();
                        }}
                        aria-label="Next photo"
                        title="Next photo"
                        style={{
                          height: '42px',
                          padding: '0 16px',
                          borderRadius: '21px',
                          backgroundColor: isDark ? 'rgba(40, 20, 32, 0.75)' : 'rgba(255, 255, 255, 0.9)',
                          color: themeMulberry,
                          border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(161, 82, 95, 0.22)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 4px 14px rgba(161, 82, 95, 0.08)',
                          transition: 'transform 0.16s ease, background-color 0.16s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                        <span>Next photo</span>
                      </button>
                    )}

                    {/* 3. Like / Send Request: Prominent heart icon */}
                    <button
                      type="button"
                      onClick={handleSendRequest}
                      aria-label={`Send introduction request to ${currentProfile.firstName}`}
                      title="Send Request (Like)"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                        color: '#FDF3F5',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(161, 82, 95, 0.45)',
                        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.06)';
                        e.currentTarget.style.boxShadow = '0 10px 28px rgba(161, 82, 95, 0.55)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(161, 82, 95, 0.45)';
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  {/* Instruction Microcopy */}
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      color: themeMuted,
                      textAlign: 'center',
                      marginBottom: '22px',
                    }}
                  >
                    TAP PHOTO TO CYCLE · PASS OR REQUEST TO DECIDE · SCROLL FOR DETAILS
                  </div>
                </div>
              );
            })()}

            {/* Subtle Divider Line */}
            <div
              style={{
                height: '1px',
                backgroundColor: themeBorder,
                marginBottom: '20px',
              }}
            />

            {/* DYNAMIC PER-PHOTO STORY & INSIGHTS (CHANGES WITH EACH PHOTO) */}
            {(() => {
              const prompt = currentProfile.photoPrompts?.find((p) => p.photoIndex === activePhotoIndex) || {
                title:
                  activePhotoIndex === 0
                    ? `THE ESSENCE & INTRO`
                    : activePhotoIndex === 1
                    ? `PERSPECTIVE & FLOW`
                    : `LIFE BEYOND WORK`,
                subtitle:
                  activePhotoIndex === 0
                    ? `${currentProfile.designation} · ${currentProfile.city}`
                    : undefined,
                content:
                  activePhotoIndex === 0
                    ? currentProfile.introduction
                    : activePhotoIndex === 1
                    ? `“Drawn to meaningful moments, spontaneous plans, and effortless conversations.”`
                    : `“Enjoying quiet corners, good design, and exploring new horizons.”`,
              };

              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '18px 20px',
                    borderRadius: '18px',
                    backgroundColor: themeCardBg,
                    border: `1px solid ${themeBorder}`,
                    boxShadow: isDark ? '0 6px 20px rgba(0, 0, 0, 0.25)' : '0 6px 20px rgba(73, 40, 61, 0.06)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: themeMulberry,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ opacity: 0.65 }}>PHOTO {activePhotoIndex + 1} OF {currentProfile.photos.length} ·</span>
                      <span>{prompt.title}</span>
                    </div>

                    {prompt.subtitle && (
                      <span style={{ fontSize: '11.5px', color: themeMuted, fontWeight: 500 }}>
                        {prompt.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Distinct Quote / Narrative for this photo */}
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '15.5px',
                      lineHeight: '1.55',
                      color: isDark ? '#E5D8DF' : '#3E2F39',
                      margin: 0,
                    }}
                  >
                    {prompt.content}
                  </p>

                  {/* Clickable View Full Profile Button */}
                  <div style={{ paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => onViewFullProfile(currentProfile)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        color: themeMulberry,
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.75';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <span>View {currentProfile.firstName}’s full profile & complete details</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : isTrialExpired ? (
          /* ========================================================== */
          /* IMAGE 2: EXACT POST-24H TRIAL EXPIRED LOCK PROMPT         */
          /* ========================================================== */
          <div
            style={{
              maxWidth: '400px',
              margin: 'auto',
              padding: '44px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '28px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: themeMulberry,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '26px',
                lineHeight: '1.25',
                color: themeMulberry,
                margin: '0 0 12px 0',
                fontWeight: 400,
              }}
            >
              Your complimentary access has ended
            </h2>

            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: themeMuted,
                margin: '0 0 20px 0',
                maxWidth: '320px',
              }}
            >
              Continue discovering verified members and meaningful connections.
            </p>

            <div
              style={{
                fontSize: '20px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                color: themeMulberry,
                margin: '0 0 16px 0',
              }}
            >
              ₹1,499 / month
            </div>

            <div
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: themeMuted,
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              A more intentional way to meet, connect and grow!
            </div>

            <button
              type="button"
              onClick={() => {
                if (onUpgradeToMembership) {
                  onUpgradeToMembership();
                } else {
                  setMembershipStatus('member');
                }
              }}
              style={{
                height: '50px',
                padding: '0 30px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FDF3F5',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(161, 82, 95, 0.35)',
                transition: 'filter 0.2s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Upgrade to Membership</span>
              <span>→</span>
            </button>
          </div>
        ) : !isMember && complimentaryProfilesRemaining <= 0 ? (
          /* ========================================================== */
          /* 10 CURATED PROFILES LIMIT REACHED DURING TRIAL             */
          /* ========================================================== */
          <div
            style={{
              maxWidth: '400px',
              margin: 'auto',
              padding: '44px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: themeMulberry,
                marginBottom: '10px',
              }}
            >
              CURATION LIMIT REACHED
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '25px',
                lineHeight: '1.25',
                color: themeMulberry,
                margin: '0 0 12px 0',
                fontWeight: 400,
              }}
            >
              You've viewed your 20 complimentary profiles for today.
            </h2>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: themeMuted,
                margin: '0 0 20px 0',
                maxWidth: '320px',
              }}
            >
              Upgrade to Full Membership to unlock unlimited curated discovery, mixers, and concierge services.
            </p>
            <div
              style={{
                fontSize: '19px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                color: themeMulberry,
                margin: '0 0 16px 0',
              }}
            >
              ₹1,499 / month
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: themeMuted,
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              A more intentional way to meet, connect and grow!
            </div>
            <button
              type="button"
              onClick={() => {
                if (onUpgradeToMembership) {
                  onUpgradeToMembership();
                } else {
                  setMembershipStatus('member');
                }
              }}
              style={{
                height: '48px',
                padding: '0 28px',
                borderRadius: '24px',
                backgroundColor: 'var(--color-mulberry)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(73, 40, 61, 0.25)',
              }}
            >
              <span>Upgrade to Membership</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          /* ========================================================== */
          /* STANDARD EMPTY QUEUE STATE                                 */
          /* ========================================================== */
          <div
            style={{
              maxWidth: '380px',
              margin: 'auto',
              padding: '36px 20px',
              textAlign: 'center',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* DISCOVER EYEBROW */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: themeMulberry,
                marginBottom: '16px',
              }}
            >
              DISCOVER
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                color: themeMulberry,
                margin: '0 0 12px 0',
                lineHeight: '1.25',
                fontWeight: 400,
              }}
            >
              You've seen everyone for today.
            </h2>

            <p
              style={{
                fontSize: '14.5px',
                lineHeight: '1.55',
                color: themeMuted,
                margin: '0 0 28px 0',
              }}
            >
              New introductions arrive tomorrow morning.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={resetDiscoverQueue}
                style={{
                  padding: '12px 24px',
                  borderRadius: '24px',
                  backgroundColor: isDark ? 'rgba(243, 238, 233, 0.1)' : 'rgba(73, 40, 61, 0.08)',
                  border: `1px solid ${themeBorder}`,
                  color: themeMulberry,
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Replay Introductions (Demo)
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => updateProfile({ datingPreference: 'WOMEN' })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    backgroundColor: userDatingPref === 'WOMEN' ? (isDark ? '#F3EEE9' : 'var(--color-mulberry)') : (isDark ? 'rgba(243, 238, 233, 0.1)' : 'rgba(73, 40, 61, 0.06)'),
                    color: userDatingPref === 'WOMEN' ? (isDark ? '#140E1C' : '#FFFFFF') : themeMulberry,
                    border: `1px solid ${themeBorder}`,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Filter: Women
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ datingPreference: 'MEN' })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    backgroundColor: userDatingPref === 'MEN' ? (isDark ? '#F3EEE9' : 'var(--color-mulberry)') : (isDark ? 'rgba(243, 238, 233, 0.1)' : 'rgba(73, 40, 61, 0.06)'),
                    color: userDatingPref === 'MEN' ? (isDark ? '#140E1C' : '#FFFFFF') : themeMulberry,
                    border: `1px solid ${themeBorder}`,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Filter: Men
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ datingPreference: 'EVERYONE' })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    backgroundColor: (!userDatingPref || userDatingPref === 'EVERYONE') ? (isDark ? '#F3EEE9' : 'var(--color-mulberry)') : (isDark ? 'rgba(243, 238, 233, 0.1)' : 'rgba(73, 40, 61, 0.06)'),
                    color: (!userDatingPref || userDatingPref === 'EVERYONE') ? (isDark ? '#140E1C' : '#FFFFFF') : themeMulberry,
                    border: `1px solid ${themeBorder}`,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Filter: Everyone
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
            backgroundColor: 'rgba(39, 33, 36, 0.95)',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: '9999px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Limit Modal Dialog for Complimentary Users */}
      {showLimitModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(5, 1, 4, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setShowLimitModal(null)}
        >
          <div
            style={{
              backgroundColor: isDark ? '#140D12' : '#FFFFFF',
              border: `1.5px solid ${themeBorder}`,
              borderRadius: '22px',
              padding: '28px 24px',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: themeMulberry,
                marginBottom: '8px',
              }}
            >
              {showLimitModal === 'requests' ? 'CONNECTION LIMIT REACHED' : 'CURATION LIMIT REACHED'}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: themeMulberry,
                margin: '0 0 10px 0',
                fontWeight: 400,
              }}
            >
              {showLimitModal === 'requests' ? '5 of 5 Requests Used' : '20 of 20 Profiles Viewed'}
            </h3>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: themeMuted,
                margin: '0 0 16px 0',
              }}
            >
              {showLimitModal === 'requests'
                ? 'You have used all 5 of your complimentary connection requests. Upgrade to Paid Membership to start unlimited new introductions.'
                : 'You have viewed your 20 complimentary profiles for today. Upgrade to Paid Membership for unlimited curated discovery.'}
            </p>
            <div
              style={{
                fontSize: '17px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                color: themeMulberry,
                marginBottom: '14px',
              }}
            >
              ₹1,499 / month
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 500,
                  color: themeMuted,
                  textAlign: 'center',
                  marginBottom: '2px',
                }}
              >
                A more intentional way to meet, connect and grow!
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLimitModal(null);
                  if (onUpgradeToMembership) {
                    onUpgradeToMembership();
                  } else {
                    setMembershipStatus('member');
                  }
                }}
                style={{
                  height: '46px',
                  borderRadius: '23px',
                  backgroundColor: 'var(--color-mulberry)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(73, 40, 61, 0.25)',
                }}
              >
                UPGRADE TO MEMBERSHIP →
              </button>
              <button
                type="button"
                onClick={() => setShowLimitModal(null)}
                style={{
                  height: '36px',
                  borderRadius: '18px',
                  backgroundColor: 'transparent',
                  color: themeMuted,
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFERENCE 3 & 5-BUTTON BOTTOM NAVIGATION: DISCOVER, MATCHES, ELEVATE, MIXERS, YOU */}
      <MemberBottomNav
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
