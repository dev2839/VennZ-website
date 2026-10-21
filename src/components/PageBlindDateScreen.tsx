import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
  Briefcase,
  MessageCircle,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  Lock,
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
  FullProfile,
} from '../types/blindDate';
import type { MatchItem } from '../types/matches';
import { getPageBackground, getPageScrim } from '../constants/themeGradients';
import { ModalPortal } from './ModalPortal';

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
  const [fullProfileModal, setFullProfileModal] = useState<FullProfile | null>(null);

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
            lastMessage: '✨ Connected via VennZ BlindDate! Complete profile unlocked.',
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
   * View full profile modal
   */
  const handleViewProfile = async () => {
    if (!mutualConnection) return;
    try {
      const full = await blindDateService.getFullProfile(
        mutualConnection.candidateProfileId,
        userId
      );
      setFullProfileModal(full);
    } catch {
      // Fallback to mutual full profile
      if (mutualConnection.fullProfile) {
        setFullProfileModal(mutualConnection.fullProfile);
      }
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
              fontSize: '11px',
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
              fontSize: '32px',
              fontWeight: 400,
              color: themeTextColor,
              letterSpacing: '-0.01em',
            }}
          >
            BlindDate
          </h1>

          <p
            style={{
              margin: '0 auto',
              fontSize: '13px',
              color: themeMuted,
              lineHeight: 1.5,
              maxWidth: '420px',
            }}
          >
            A tailored introduction selected for you by VennZ. Complete profiles and private details unlock strictly upon mutual consent.
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
              fontSize: '13px',
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
                fontSize: '20px',
                margin: '0 0 8px',
                color: themeTextColor,
              }}
            >
              Selecting Your Introduction
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: themeMuted, maxWidth: '320px' }}>
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
                fontSize: '22px',
                margin: '0 0 8px',
                color: themeTextColor,
              }}
            >
              You're All Caught Up
            </h3>

            <p style={{ margin: '0 0 24px', fontSize: '13px', color: themeMuted, maxWidth: '340px', lineHeight: 1.5 }}>
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
                  fontSize: '13px',
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
                  fontSize: '12.5px',
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
                    <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      MUTUAL CONNECTION CONFIRMED
                    </div>
                    <div style={{ fontSize: '11.5px', opacity: 0.9 }}>
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
                    fontSize: '12px',
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
                <div style={{ fontSize: '12.5px', fontWeight: 600, lineHeight: 1.4 }}>
                  <span>Curated invitation delivered. Awaiting response from {recommendation.preview.displayName}.</span>
                </div>
              </div>
            )}

            {/* PHOTO VIEWFINDER */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '360px',
                overflow: 'hidden',
                backgroundColor: isDark ? '#1F111E' : '#E8DCE0',
              }}
            >
              <img
                src={recommendation.preview.previewPhoto}
                alt={recommendation.preview.displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  display: 'block',
                }}
              />

              {/* Discreet Privacy Scrim Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(20, 14, 28, 0.92) 0%, rgba(20, 14, 28, 0.35) 45%, transparent 70%)',
                }}
              />

              {/* Top Privacy Shield Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(20, 14, 28, 0.72)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                }}
              >
                {status === 'mutual' ? <CheckCircle2 size={13} color="#4ADE80" /> : <Lock size={12} color="#F9AAAD" />}
                <span>{status === 'mutual' ? 'Verified Connection' : 'Confidential Preview'}</span>
              </div>

              {/* Bottom Photo Identity Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '18px',
                  right: '18px',
                  color: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '28px',
                      fontWeight: 400,
                      color: '#FFFFFF',
                    }}
                  >
                    {recommendation.preview.displayName}, {recommendation.preview.age}
                  </h2>
                  {recommendation.preview.isVerified && (
                    <ShieldCheck size={20} color="#F9AAAD" />
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.88)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={13} />
                    {recommendation.preview.designation}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} />
                    {recommendation.preview.city}
                  </span>
                </div>
              </div>
            </div>

            {/* CURATED PROFILE DETAILS BODY */}
            <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Editorial Curation Highlight */}
              {recommendation.preview.curationHighlight && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(253, 235, 239, 0.85)',
                    border: `1px solid ${themeBorder}`,
                    color: isDark ? '#F9AAAD' : '#A1525F',
                    fontSize: '12.5px',
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

              {/* Introductory Snippet */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                    marginBottom: '6px',
                  }}
                >
                  ABOUT
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: themeTextColor,
                    fontStyle: 'italic',
                  }}
                >
                  "{recommendation.preview.introductionSnippet}"
                </p>
              </div>

              {/* Interests & Vibes Chips */}
              {recommendation.preview.interests.length > 0 && (
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: themeMuted,
                      marginBottom: '8px',
                    }}
                  >
                    SHARED INTERESTS & VIBE
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {recommendation.preview.interests.slice(0, 5).map((interest) => (
                      <span
                        key={interest}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '999px',
                          backgroundColor: isDark ? 'rgba(70, 32, 55, 0.5)' : 'rgba(240, 230, 235, 0.8)',
                          color: isDark ? '#F9AAAD' : '#462037',
                          border: `1px solid ${themeBorder}`,
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                    {recommendation.preview.vibes.slice(0, 3).map((vibe) => (
                      <span
                        key={vibe}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '999px',
                          backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(253, 235, 239, 0.7)',
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

              {/* Privacy Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px dashed ${themeBorder}`,
                  fontSize: '11.5px',
                  color: themeMuted,
                  lineHeight: 1.4,
                }}
              >
                <ShieldCheck size={16} color={isDark ? '#F9AAAD' : '#A1525F'} style={{ flexShrink: 0 }} />
                <span>
                  {status === 'mutual'
                    ? 'Both users have consented. Full profile, albums, and messaging access are unlocked.'
                    : 'Personal contact credentials, full legal names, and private photo albums remain confidential until mutual connection is confirmed.'}
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
                        fontSize: '13px',
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
                        fontSize: '13.5px',
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
                        fontSize: '13px',
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
                        fontSize: '12px',
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleViewProfile}
                      style={{
                        height: '48px',
                        borderRadius: '999px',
                        border: `1.5px solid ${themeBorder}`,
                        backgroundColor: isDark ? 'rgba(70, 32, 55, 0.4)' : '#FFFFFF',
                        color: themeTextColor,
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={15} />
                      <span>View Full Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartChat}
                      style={{
                        height: '48px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 6px 18px rgba(34, 197, 94, 0.35)',
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>Open Chat</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FULL PROFILE MODAL (Available strictly upon mutual connection) */}
      {fullProfileModal && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(10, 5, 10, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
              padding: '24px 16px',
              boxSizing: 'border-box',
            }}
            onClick={() => setFullProfileModal(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '24px',
                backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                border: `1.5px solid ${themeBorder}`,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                position: 'relative',
                margin: 'auto',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setFullProfileModal(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              >
                <X size={18} />
              </button>

              {/* Photo Viewfinder */}
              <div style={{ position: 'relative', width: '100%', height: '340px' }}>
                <img
                  src={fullProfileModal.photos[0] || ''}
                  alt={fullProfileModal.firstName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(20, 14, 28, 0.95) 0%, transparent 60%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '20px',
                    color: '#FFFFFF',
                  }}
                >
                  <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-serif)', fontSize: '28px' }}>
                    {fullProfileModal.firstName}, {fullProfileModal.age}
                  </h2>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>
                    {[fullProfileModal.designation, fullProfileModal.company, fullProfileModal.city].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>

              {/* Body Details */}
              <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: themeMuted, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    ABOUT
                  </span>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: themeTextColor }}>
                    {fullProfileModal.introduction}
                  </p>
                </div>

                {fullProfileModal.interests.length > 0 && (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: themeMuted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      INTERESTS
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {fullProfileModal.interests.map((int) => (
                        <span
                          key={int}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            backgroundColor: isDark ? 'rgba(70, 32, 55, 0.5)' : '#F5EBEF',
                            color: themeTextColor,
                          }}
                        >
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFullProfileModal(null);
                    handleStartChat();
                  }}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '8px',
                    boxShadow: '0 6px 18px rgba(161, 82, 95, 0.35)',
                  }}
                >
                  Start Conversation →
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Member Bottom Nav */}
      <MemberBottomNav
        activeTab="blinddate"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
