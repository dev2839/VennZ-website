import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
  Briefcase,
  MessageCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';
import { blindDateService } from '../services/mockBlindDateProvider';
import type {
  Recommendation,
  RecommendationStatus,
  MutualConnection,
} from '../types/blindDate';
import type { MatchItem } from '../types/matches';
import { getPageBackground, getPageScrim } from '../constants/themeGradients';

interface PageBlindDateScreenProps {
  onSelectTab: (tab: MemberTab) => void;
  onNavigateChat?: (matchId: string) => void;
  onNavigateHelp?: () => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const PageBlindDateScreen: React.FC<PageBlindDateScreenProps> = ({
  onSelectTab,
  onNavigateChat,
  onNavigateHelp,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { profile, appearanceMode, addDirectMatch, phoneNumber } = useAuth();
  const isDark = appearanceMode === 'after-dark';
  const userId = phoneNumber || profile.vennzName || profile.firstName || 'current-user';

  // State Management
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [status, setStatus] = useState<RecommendationStatus | 'loading' | 'empty' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mutualConnection, setMutualConnection] = useState<MutualConnection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Dynamic Theme Colors
  const themeBgColor = getPageBackground(isDark);
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMuted = isDark ? 'rgba(253, 243, 245, 0.72)' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.32)' : 'rgba(161, 82, 95, 0.18)';
  const themeCardBg = isDark ? 'rgba(36, 18, 30, 0.88)' : 'rgba(255, 255, 255, 0.92)';

  // Reset scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  /**
   * Fetch next available recommendation
   */
  const loadRecommendation = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    setActivePhotoIndex(0);
    try {
      const rec = await blindDateService.getNextRecommendation(userId);
      if (!rec) {
        setStatus('empty');
        setRecommendation(null);
        return;
      }

      setRecommendation(rec);
      setStatus(rec.status);

      // If already mutual, fetch mutual details
      if (rec.status === 'mutual') {
        const mutual = await blindDateService.getMutualConnection(rec.id, userId);
        setMutualConnection(mutual);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load recommendation.');
    }
  }, [userId]);

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  // Candidate photos list for multi-photo gallery
  const candidatePhotos: string[] =
    recommendation?.preview.photos && recommendation.preview.photos.length > 0
      ? recommendation.preview.photos
      : recommendation?.preview.previewPhoto
      ? [recommendation.preview.previewPhoto]
      : [];

  const currentPhoto = candidatePhotos[activePhotoIndex] || candidatePhotos[0] || '';

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (candidatePhotos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : candidatePhotos.length - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (candidatePhotos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev < candidatePhotos.length - 1 ? prev + 1 : 0));
  };

  /**
   * Handle user accepting recommendation
   */
  const handleAccept = async () => {
    if (!recommendation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const resultStatus = await blindDateService.acceptRecommendation(
        recommendation.id,
        userId
      );

      setStatus(resultStatus);

      if (resultStatus === 'mutual') {
        const mutual = await blindDateService.getMutualConnection(
          recommendation.id,
          userId
        );
        setMutualConnection(mutual);

        // Register mutual connection in global Auth matches infrastructure
        if (mutual) {
          const newMatch: MatchItem = {
            id: `match-${mutual.candidateProfileId}`,
            profileId: mutual.candidateProfileId,
            name: mutual.candidateName,
            age: mutual.fullProfile.age,
            city: mutual.fullProfile.city,
            designation: mutual.fullProfile.designation,
            company: mutual.fullProfile.company || 'Private Studio',
            photo: mutual.candidatePhoto,
            isVerified: mutual.fullProfile.isVerified,
            matchedAt: Date.now(),
            lastMessage: '✨ Connected via VennZ PickForMe! Complete profile unlocked.',
            lastMessageTime: Date.now(),
          };
          addDirectMatch(newMatch);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle user rejecting recommendation
   */
  const handleReject = async () => {
    if (!recommendation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await blindDateService.rejectRecommendation(
        recommendation.id,
        userId
      );
      // Retrieve next candidate
      await loadRecommendation();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Action failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Open Chat with the mutual match
   */
  const handleStartChat = () => {
    if (!mutualConnection) return;
    const matchId = `match-${mutualConnection.candidateProfileId}`;
    if (onNavigateChat) {
      onNavigateChat(matchId);
    } else {
      onSelectTab('matches');
    }
  };

  /**
   * Reset demonstration queue
   */
  const handleResetQueue = async () => {
    await blindDateService.resetRecommendations(userId);
    await loadRecommendation();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: themeBgColor,
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: themeTextColor,
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Wallpaper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.94 : 0.92,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Atmospheric Ambient Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: getPageScrim(isDark),
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* iOS Status Bar */}
      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 45 }}>
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Member Top Bar */}
      <div style={{ position: 'relative', zIndex: 40 }}>
        <MemberTopBar onConciergeClick={onNavigateHelp} />
      </div>

      {/* Main Content Stage */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 20px 100px',
          maxWidth: '540px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Editorial Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', width: '100%' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
              border: `1px solid ${themeBorder}`,
              color: isDark ? '#F9AAAD' : '#A1525F',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={12} />
            <span>Curated Recommendation</span>
          </div>

          <h1
            style={{
              margin: '0 0 6px',
              fontFamily: 'var(--font-serif)',
              fontSize: '34px',
              fontWeight: 400,
              color: themeTextColor,
              letterSpacing: '-0.01em',
            }}
          >
            PickForMe
          </h1>

          <p
            style={{
              margin: '0 auto',
              fontSize: '15px',
              color: themeMuted,
              lineHeight: 1.5,
              maxWidth: '440px',
            }}
          >
            A tailored introduction curated for you by VennZ. Review their complete profile and photographs below — direct messaging unlocks when both of you accept.
          </p>
        </div>

        {/* Error Notice if any */}
        {errorMessage && (
          <div
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(224, 109, 109, 0.15)',
              border: '1px solid rgba(224, 109, 109, 0.3)',
              color: '#E06D6D',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={loadRecommendation}
              style={{
                background: 'none',
                border: 'none',
                color: '#E06D6D',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* STATE: LOADING */}
        {status === 'loading' && (
          <div
            style={{
              width: '100%',
              minHeight: '460px',
              borderRadius: '24px',
              backgroundColor: themeCardBg,
              border: `1px solid ${themeBorder}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: `3px solid ${isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.2)'}`,
                borderTopColor: isDark ? '#F9AAAD' : '#A1525F',
                animation: 'spin 1s linear infinite',
                marginBottom: '18px',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                margin: '0 0 8px',
                color: themeTextColor,
              }}
            >
              Selecting Your Introduction
            </h3>
            <p style={{ margin: 0, fontSize: '15px', color: themeMuted, maxWidth: '320px' }}>
              Synthesizing lifestyle alignment, verified standards, and mutual preferences...
            </p>
          </div>
        )}

        {/* STATE: EMPTY QUEUE */}
        {status === 'empty' && (
          <div
            style={{
              width: '100%',
              minHeight: '420px',
              borderRadius: '24px',
              backgroundColor: themeCardBg,
              border: `1px solid ${themeBorder}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                boxShadow: '0 8px 24px rgba(161, 82, 95, 0.35)',
              }}
            >
              <Sparkles size={28} />
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                margin: '0 0 8px',
                color: themeTextColor,
              }}
            >
              You're All Caught Up
            </h3>

            <p style={{ margin: '0 0 24px', fontSize: '15px', color: themeMuted, maxWidth: '340px', lineHeight: 1.5 }}>
              VennZ only recommends candidates who strictly match our mutual criteria. Check back soon or explore today's standard introductions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '280px' }}>
              <button
                type="button"
                onClick={() => onSelectTab('discover')}
                style={{
                  height: '46px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(161, 82, 95, 0.35)',
                }}
              >
                Go to Discover Feed →
              </button>
              <button
                type="button"
                onClick={handleResetQueue}
                style={{
                  height: '42px',
                  borderRadius: '999px',
                  background: 'transparent',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  border: `1.5px solid ${themeBorder}`,
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} /> Refresh Recommendations
              </button>
            </div>
          </div>
        )}

        {/* STATE: ACTIVE RECOMMENDATION (pending, accepted_waiting, mutual) */}
        {recommendation && (status === 'pending' || status === 'accepted_waiting' || status === 'mutual') && (
          <div
            style={{
              width: '100%',
              borderRadius: '24px',
              backgroundColor: themeCardBg,
              border: `1.5px solid ${status === 'mutual' ? 'rgba(74, 222, 128, 0.4)' : themeBorder}`,
              boxShadow: isDark
                ? '0 16px 40px rgba(0, 0, 0, 0.45)'
                : '0 12px 32px rgba(161, 82, 95, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* MUTUAL CONNECTION CONFIRMED BANNER */}
            {status === 'mutual' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                  padding: '14px 20px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      MUTUAL CONNECTION CONFIRMED
                    </div>
                    <div style={{ fontSize: '13.5px', opacity: 0.9 }}>
                      Both of you agreed to connect. Full profile unlocked.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartChat}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#15803D',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  Chat Now →
                </button>
              </div>
            )}

            {/* AWAITING CANDIDATE RESPONSE BANNER */}
            {status === 'accepted_waiting' && (
              <div
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(161, 82, 95, 0.4) 0%, rgba(199, 87, 124, 0.3) 100%)'
                    : 'linear-gradient(135deg, #FDECF0 0%, #F8D9E0 100%)',
                  borderBottom: `1px solid ${themeBorder}`,
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                }}
              >
                <Clock size={18} />
                <div style={{ fontSize: '14.5px', fontWeight: 600, lineHeight: 1.4 }}>
                  <span>Curated invitation delivered. Awaiting response from {recommendation.preview.displayName}.</span>
                </div>
              </div>
            )}

            {/* PHOTO VIEWFINDER WITH MULTI-PHOTO GALLERY */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '420px',
                overflow: 'hidden',
                backgroundColor: isDark ? '#1F111E' : '#E8DCE0',
                userSelect: 'none',
              }}
            >
              <img
                key={currentPhoto}
                src={currentPhoto}
                alt={`${recommendation.preview.displayName} photo ${activePhotoIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  display: 'block',
                  transition: 'opacity 0.25s ease',
                }}
              />

              {/* Discreet Privacy Scrim Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(to top, rgba(20, 14, 28, 0.95) 0%, rgba(20, 14, 28, 0.35) 45%, transparent 70%)',
                }}
              />

              {/* Top Segmented Indicators for Photos */}
              {candidatePhotos.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    gap: '4px',
                    zIndex: 15,
                  }}
                >
                  {candidatePhotos.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex(idx);
                      }}
                      style={{
                        flex: 1,
                        height: '3px',
                        borderRadius: '2px',
                        backgroundColor: idx === activePhotoIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.38)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Top Left Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: candidatePhotos.length > 1 ? '24px' : '14px',
                  left: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(20, 14, 28, 0.72)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  zIndex: 12,
                }}
              >
                {status === 'mutual' ? <CheckCircle2 size={13} color="#4ADE80" /> : <Sparkles size={12} color="#F9AAAD" />}
                <span>{status === 'mutual' ? 'Mutual Match' : 'Curated Introduction'}</span>
              </div>

              {/* Photo Counter Badge */}
              {candidatePhotos.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '14px',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(20, 14, 28, 0.72)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    zIndex: 12,
                  }}
                >
                  {activePhotoIndex + 1} / {candidatePhotos.length}
                </div>
              )}

              {/* Tap zones for intuitive photo browsing */}
              <div
                onClick={handlePrevPhoto}
                title="Previous photograph"
                style={{
                  position: 'absolute',
                  top: '50px',
                  bottom: '80px',
                  left: 0,
                  width: '40%',
                  zIndex: 10,
                  cursor: candidatePhotos.length > 1 ? 'pointer' : 'default',
                }}
              />
              <div
                onClick={handleNextPhoto}
                title="Next photograph"
                style={{
                  position: 'absolute',
                  top: '50px',
                  bottom: '80px',
                  right: 0,
                  width: '60%',
                  zIndex: 10,
                  cursor: candidatePhotos.length > 1 ? 'pointer' : 'default',
                }}
              />

              {/* Visual Previous/Next Chevron Arrows */}
              {candidatePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    aria-label="Previous photo"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      zIndex: 14,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(20, 14, 28, 0.65)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    aria-label="Next photo"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '12px',
                      transform: 'translateY(-50%)',
                      zIndex: 14,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(20, 14, 28, 0.65)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Bottom Photo Identity Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '18px',
                  right: '18px',
                  color: '#FFFFFF',
                  zIndex: 11,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '32px',
                      fontWeight: 400,
                      color: '#FFFFFF',
                      lineHeight: 1.1,
                    }}
                  >
                    {recommendation.preview.displayName}, {recommendation.preview.age}
                  </h2>
                  {recommendation.preview.isVerified && (
                    <ShieldCheck size={22} color="#F9AAAD" />
                  )}
                  {recommendation.preview.activeStatus && (
                    <span
                      style={{
                        fontSize: '13px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.22)',
                        backdropFilter: 'blur(4px)',
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 600,
                      }}
                    >
                      {recommendation.preview.activeStatus}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '15.5px',
                    color: 'rgba(255, 255, 255, 0.92)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="#F9AAAD" />
                    {[recommendation.preview.designation, recommendation.preview.company].filter(Boolean).join(' · ')}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#F9AAAD" />
                    {recommendation.preview.city}
                  </span>
                  {recommendation.preview.education && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={14} color="#F9AAAD" />
                      {recommendation.preview.education}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* COMPLETE PROFILE DETAILS BODY */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Editorial Curation Highlight */}
              {recommendation.preview.curationHighlight && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(253, 235, 239, 0.85)',
                    border: `1px solid ${themeBorder}`,
                    color: isDark ? '#F9AAAD' : '#A1525F',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={15} style={{ flexShrink: 0 }} />
                  <span>{recommendation.preview.curationHighlight}</span>
                </div>
              )}

              {/* Complete Introduction / About */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                    marginBottom: '6px',
                  }}
                >
                  ABOUT {recommendation.preview.displayName.toUpperCase()}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: '16.5px',
                    lineHeight: 1.6,
                    color: themeTextColor,
                  }}
                >
                  {recommendation.preview.introduction || recommendation.preview.introductionSnippet}
                </p>
              </div>

              {/* Career & Education Details Card */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(40, 20, 34, 0.65)' : 'rgba(248, 238, 242, 0.75)',
                  border: `1px solid ${themeBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={15} color={isDark ? '#F9AAAD' : '#A1525F'} />
                  <span style={{ fontSize: '15.5px', color: themeTextColor, fontWeight: 600 }}>
                    {recommendation.preview.designation}
                    {recommendation.preview.company && ` at ${recommendation.preview.company}`}
                  </span>
                </div>
                {recommendation.preview.education && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={15} color={isDark ? '#F9AAAD' : '#A1525F'} />
                    <span style={{ fontSize: '15px', color: themeMuted }}>
                      {recommendation.preview.education}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color={isDark ? '#F9AAAD' : '#A1525F'} />
                  <span style={{ fontSize: '15px', color: themeMuted }}>
                    {recommendation.preview.city}
                  </span>
                </div>
                {recommendation.preview.datingPreference && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={15} color={isDark ? '#F9AAAD' : '#A1525F'} />
                    <span style={{ fontSize: '15px', color: themeMuted }}>
                      Interested in dating {recommendation.preview.datingPreference.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* All Shared Interests & Vibes */}
              {((recommendation.preview.interests && recommendation.preview.interests.length > 0) ||
                (recommendation.preview.vibes && recommendation.preview.vibes.length > 0)) && (
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: themeMuted,
                      marginBottom: '8px',
                    }}
                  >
                    INTERESTS & VIBE
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {recommendation.preview.interests.map((interest) => (
                      <span
                        key={interest}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          padding: '5px 13px',
                          borderRadius: '999px',
                          backgroundColor: isDark ? 'rgba(70, 32, 55, 0.5)' : 'rgba(240, 230, 235, 0.8)',
                          color: isDark ? '#F9AAAD' : '#462037',
                          border: `1px solid ${themeBorder}`,
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                    {recommendation.preview.vibes.map((vibe) => (
                      <span
                        key={vibe}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          padding: '5px 13px',
                          borderRadius: '999px',
                          backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(253, 235, 239, 0.85)',
                          color: isDark ? '#F9AAAD' : '#A1525F',
                          border: `1px solid ${themeBorder}`,
                        }}
                      >
                        ✨ {vibe}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Prompts / Lifestyle Prompts if available */}
              {recommendation.preview.photoPrompts && recommendation.preview.photoPrompts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recommendation.preview.photoPrompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        backgroundColor: isDark ? 'rgba(30, 15, 25, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                        border: `1px solid ${themeBorder}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: isDark ? '#F9AAAD' : '#A1525F',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: '4px',
                        }}
                      >
                        {prompt.title}
                      </div>
                      <div style={{ fontSize: '15.5px', color: themeTextColor, lineHeight: 1.5 }}>
                        {prompt.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Informative Curation Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px solid ${themeBorder}`,
                  fontSize: '14px',
                  color: themeMuted,
                  lineHeight: 1.45,
                }}
              >
                <Sparkles size={16} color={isDark ? '#F9AAAD' : '#A1525F'} style={{ flexShrink: 0 }} />
                <span>
                  {status === 'mutual'
                    ? 'Mutual match confirmed! Direct 1:1 conversation and messaging are unlocked.'
                    : 'Curated based on your preferences. Accepting this PickForMe match will unlock direct chat once they accept too.'}
                </span>
              </div>

              {/* ACTION SUITE */}
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {status === 'pending' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    {/* Pass / Reject */}
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isSubmitting}
                      style={{
                        height: '50px',
                        borderRadius: '999px',
                        border: `1.5px solid ${themeBorder}`,
                        backgroundColor: 'transparent',
                        color: themeMuted,
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <X size={16} />
                      <span>Pass</span>
                    </button>

                    {/* Accept / Connect */}
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={isSubmitting}
                      style={{
                        height: '50px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                        color: '#FFFFFF',
                        fontSize: '15.5px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 6px 20px rgba(161, 82, 95, 0.4)',
                        transition: 'transform 0.15s ease',
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      <Heart size={16} fill="#FFFFFF" />
                      <span>{isSubmitting ? 'Submitting...' : 'Accept Introduction'}</span>
                    </button>
                  </div>
                )}

                {status === 'accepted_waiting' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div
                      style={{
                        height: '46px',
                        borderRadius: '999px',
                        backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                        border: `1px solid ${themeBorder}`,
                        color: isDark ? '#F9AAAD' : '#A1525F',
                        fontSize: '15px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <Clock size={16} />
                      <span>Invitation Sent · Awaiting Response</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleReject}
                      style={{
                        height: '40px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: themeMuted,
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Skip to Next Recommendation
                    </button>
                  </div>
                )}

                {status === 'mutual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleStartChat}
                      style={{
                        height: '52px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 6px 20px rgba(34, 197, 94, 0.38)',
                        width: '100%',
                      }}
                    >
                      <MessageCircle size={18} />
                      <span>Start Chat with {recommendation.preview.displayName} →</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReject}
                      style={{
                        height: '38px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: themeMuted,
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Next Introduction →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Member Bottom Nav */}
      <MemberBottomNav
        activeTab="blinddate"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
