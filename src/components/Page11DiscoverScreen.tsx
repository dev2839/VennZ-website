import React, { useState, useEffect } from 'react';
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

  // Photo Carousel State for Current Profile
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Reset photo index when profile changes
  useEffect(() => {
    setActivePhotoIndex(0);
    setPhotoDragX(0);
    setIsPhotoDragging(false);
    setIsPhotoTouchActive(false);
  }, [currentProfile?.id]);

  // Photo Touch, Mouse & Trackpad Slide Gesture State
  const [photoDragX, setPhotoDragX] = useState<number>(0);
  const [isPhotoDragging, setIsPhotoDragging] = useState<boolean>(false);
  const [isPhotoTouchActive, setIsPhotoTouchActive] = useState<boolean>(false);
  const photoStartXRef = React.useRef<number>(0);
  const photoStartYRef = React.useRef<number>(0);
  const isHorizontalSwipeRef = React.useRef<boolean | null>(null);
  const lastWheelTimeRef = React.useRef<number>(0);

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

  // Carousel Next/Prev Photo
  const handleNextPhoto = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!currentProfile || currentProfile.photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev < currentProfile.photos.length - 1 ? prev + 1 : 0));
  };

  const handlePrevPhoto = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!currentProfile || currentProfile.photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : currentProfile.photos.length - 1));
  };

  // Desktop / Laptop Mouse & Trackpad Click-and-Drag Window Listeners
  useEffect(() => {
    if (!isPhotoDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!currentProfile) return;
      const deltaX = e.clientX - photoStartXRef.current;
      const isAtFirst = activePhotoIndex === 0 && deltaX > 0;
      const isAtLast = activePhotoIndex === currentProfile.photos.length - 1 && deltaX < 0;
      const resistance = isAtFirst || isAtLast ? 0.25 : 1;
      setPhotoDragX(deltaX * resistance);
    };

    const handleWindowMouseUp = () => {
      setIsPhotoDragging(false);
      setPhotoDragX((currentDragX) => {
        const SWIPE_PHOTO_THRESHOLD = 35;
        if (currentDragX < -SWIPE_PHOTO_THRESHOLD) {
          handleNextPhoto();
        } else if (currentDragX > SWIPE_PHOTO_THRESHOLD) {
          handlePrevPhoto();
        }
        return 0;
      });
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPhotoDragging, activePhotoIndex, currentProfile]);

  // Touch handlers for mobile / tablet gestures
  const handlePhotoTouchStart = (e: React.TouchEvent) => {
    if (!currentProfile || currentProfile.photos.length <= 1) return;
    photoStartXRef.current = e.touches[0].clientX;
    photoStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsPhotoTouchActive(true);
    setPhotoDragX(0);
  };

  const handlePhotoTouchMove = (e: React.TouchEvent) => {
    if (!currentProfile || !isPhotoTouchActive) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - photoStartXRef.current;
    const deltaY = currentY - photoStartYRef.current;

    // Detect direction on first significant movement
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      const isAtFirst = activePhotoIndex === 0 && deltaX > 0;
      const isAtLast = activePhotoIndex === currentProfile.photos.length - 1 && deltaX < 0;
      const resistance = isAtFirst || isAtLast ? 0.25 : 1;
      setPhotoDragX(deltaX * resistance);
    }
  };

  const handlePhotoTouchEnd = () => {
    if (!isPhotoTouchActive) return;
    setIsPhotoTouchActive(false);

    if (isHorizontalSwipeRef.current === true) {
      const SWIPE_PHOTO_THRESHOLD = 35;
      if (photoDragX < -SWIPE_PHOTO_THRESHOLD) {
        handleNextPhoto();
      } else if (photoDragX > SWIPE_PHOTO_THRESHOLD) {
        handlePrevPhoto();
      }
    }
    setPhotoDragX(0);
    isHorizontalSwipeRef.current = null;
  };

  // Laptop Touchpad two-finger horizontal flick / scroll (Wheel event)
  const handlePhotoWheel = (e: React.WheelEvent) => {
    if (!currentProfile || currentProfile.photos.length <= 1) return;
    if (Math.abs(e.deltaX) > 20 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current > 360) {
        lastWheelTimeRef.current = now;
        if (e.deltaX > 20) {
          handleNextPhoto();
        } else if (e.deltaX < -20) {
          handlePrevPhoto();
        }
      }
    }
  };

  const handlePhotoMouseDown = (e: React.MouseEvent) => {
    if (!currentProfile || currentProfile.photos.length <= 1) return;
    if (e.button !== 0) return; // Only main left click
    setIsPhotoDragging(true);
    photoStartXRef.current = e.clientX;
    photoStartYRef.current = e.clientY;
    setPhotoDragX(0);
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
            {/* PROFILE INTRODUCTION CARD */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.35)' : '0 10px 30px rgba(73, 40, 61, 0.12)',
                transform: `translate3d(${cardTranslateX}px, 0, 0) rotate(${rotationDeg}deg)`,
                transition: isAnimatingOut ? 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease' : 'none',
                opacity: cardOpacity,
                userSelect: 'none',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
                paddingBottom: '16px',
              }}
            >
              {/* Photo Viewport Container (Interactive touch, mouse drag, and laptop trackpad photo slider) */}
              <div
                onMouseDown={handlePhotoMouseDown}
                onTouchStart={handlePhotoTouchStart}
                onTouchMove={handlePhotoTouchMove}
                onTouchEnd={handlePhotoTouchEnd}
                onTouchCancel={handlePhotoTouchEnd}
                onWheel={handlePhotoWheel}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#1E161C',
                  overflow: 'hidden',
                  cursor: isPhotoDragging ? 'grabbing' : 'grab',
                  touchAction: 'pan-y',
                  userSelect: 'none',
                }}
              >
                {/* Real-time Activity Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(20, 14, 28, 0.72)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
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
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      boxShadow: '0 0 8px #4CAF50',
                      flexShrink: 0,
                    }}
                  />
                  <span>{currentProfile.activeStatus || 'Active today'}</span>
                </div>

                {/* Sliding Photo Track */}
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    transform: `translateX(calc(-${activePhotoIndex * 100}% + ${photoDragX}px))`,
                    transition: isPhotoDragging || isPhotoTouchActive ? 'none' : 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)',
                    willChange: 'transform',
                  }}
                >
                  {currentProfile.photos.map((photoUrl, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        flex: '0 0 100%',
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={photoUrl}
                        alt={`${currentProfile.firstName}'s photo ${pIdx + 1}`}
                        draggable={false}
                        className="ken-burns-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      />
                      {/* Gradient Overlay for Text Readability */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '60%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Left and Right Navigational Arrow Buttons */}
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  aria-label="Previous photo"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(28, 22, 26, 0.5)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 20,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNextPhoto}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  aria-label="Next photo"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(28, 22, 26, 0.5)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 20,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>

                {/* Full-screen Lightbox trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(currentProfile.photos, activePhotoIndex, `${currentProfile.firstName}, ${currentProfile.age}`);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  aria-label="View photo in full screen lightbox"
                  title="View full screen photo"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(28, 22, 26, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
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
                    e.currentTarget.style.backgroundColor = 'rgba(28, 22, 26, 0.65)';
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
              </div>

              {/* Carousel Pagination Dots below the photograph */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  marginBottom: '10px',
                }}
              >
                {currentProfile.photos.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(dotIdx);
                    }}
                    aria-label={`Show photo ${dotIdx + 1}`}
                    style={{
                      width: activePhotoIndex === dotIdx ? '20px' : '6px',
                      height: '5px',
                      borderRadius: '3px',
                      backgroundColor: activePhotoIndex === dotIdx ? themeMulberry : (isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.25)'),
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>

              {/* Overlay Profile Details */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '20px',
                right: '20px',
                zIndex: 10,
                pointerEvents: 'none',
              }}>
                {/* Row 1: Name, Age and VERIFIED Pill */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '32px',
                      fontWeight: 400,
                      color: '#FFFFFF',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {currentProfile.firstName}, {currentProfile.age}
                  </h2>

                  {currentProfile.isVerified && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#66BB6A',
                      }}
                    >
                      VERIFIED
                    </span>
                  )}
                </div>

                {/* Subtitle Line 1: City in uppercase letterspacing */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.85)',
                    marginBottom: '4px',
                  }}
                >
                  {currentProfile.city}
                </div>

                {/* Subtitle Line 2: Role · Company */}
                <div
                  style={{
                    fontSize: '15px',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.3',
                  }}
                >
                  {currentProfile.designation} · {currentProfile.company}
                </div>
              </div>

              {/* Floating Action Buttons */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  zIndex: 20,
                }}
              >
                <button
                  type="button"
                  className="btn-tactile"
                  onClick={handlePass}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(20, 14, 28, 0.75)' : 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    color: isDark ? '#F9AAAD' : '#FFFFFF',
                    border: '1px solid ' + (isDark ? 'rgba(161, 82, 95, 0.4)' : 'rgba(255, 255, 255, 0.3)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn-tactile"
                  onClick={handleSendRequest}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FDF3F5',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(161, 82, 95, 0.45)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Instruction Microcopy with comfortable spacing below photo */}
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: themeMuted,
                textAlign: 'center',
                marginTop: '22px',
                marginBottom: '22px',
              }}
            >
              SWIPE RIGHT TO REQUEST, LEFT TO PASS · SCROLL FOR DETAILS
            </div>

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
