import React, { useState } from 'react';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { StatusBar } from './StatusBar';
import type { DiscoverProfile } from '../types/discover';
import { useAuth } from '../context/AuthContext';
import { useLightbox } from '../context/LightboxContext';

interface Page12FullProfileScreenProps {
  profile: DiscoverProfile;
  onBack: () => void;
  onActionComplete: () => void;
  onSelectTab?: (tab: MemberTab) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page12FullProfileScreen: React.FC<Page12FullProfileScreenProps> = ({
  profile,
  onBack,
  onActionComplete,
  onSelectTab,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { passProfile, sendConnectionRequest, appearanceMode } = useAuth();
  const { openLightbox } = useLightbox();
  const isDark = appearanceMode === 'after-dark';
  const [activeTab, setActiveTab] = useState<MemberTab>('discover');
  const [actionAnimating, setActionAnimating] = useState<'pass' | 'request' | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const cardBg = isDark ? 'rgba(32, 17, 28, 0.72)' : 'rgba(255, 255, 255, 0.78)';
  const cardBorder = isDark ? 'rgba(161, 82, 95, 0.32)' : 'rgba(161, 82, 95, 0.16)';
  const chipBg = isDark ? 'rgba(70, 32, 55, 0.55)' : 'rgba(255, 255, 255, 0.85)';
  const chipBorder = isDark ? 'rgba(161, 82, 95, 0.35)' : 'rgba(73, 40, 61, 0.2)';

  const handlePass = () => {
    setActionAnimating('pass');
    setTimeout(() => {
      passProfile(profile.id);
      onActionComplete();
    }, 280);
  };

  const handleSendRequest = () => {
    setActionAnimating('request');
    setTimeout(() => {
      sendConnectionRequest(profile.id);
      onActionComplete();
    }, 280);
  };

  const handleTabChange = (tab: MemberTab) => {
    setActiveTab(tab);
    if (tab === 'discover') {
      onBack();
    }
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  const showSocials =
    (profile.showLinkedinPublicly && Boolean(profile.linkedinUrl)) ||
    (profile.showInstagramPublicly && Boolean(profile.instagramUsername));

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
      {/* Background Wallpaper */}
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

      {/* Subtle Ambient Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(3, 0, 3, 0.16)' : 'rgba(247, 243, 238, 0.32)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* iOS Status Bar */}
      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 45, backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.92)' }}>
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Fixed Member Top Bar */}
      <MemberTopBar onLogoClick={onBack} />

      {/* Scrollable Profile Body */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.28s ease, opacity 0.28s ease',
          transform: actionAnimating === 'pass'
            ? 'translateX(-100px)'
            : actionAnimating === 'request'
            ? 'translateX(100px)'
            : 'none',
          opacity: actionAnimating ? 0 : 1,
        }}
      >
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            width: '100%',
            padding: '16px 20px 44px 20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Subheader: < BACK on left, Activity & VERIFIED badges on right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: themeMulberry,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>BACK</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Activity indicator badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: isDark ? '#6EE7B7' : '#047857',
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
                  border: isDark ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)',
                    display: 'inline-block',
                  }}
                />
                {profile.activeStatus || 'Active today'}
              </span>

              {/* Verified Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isDark ? '#86EFAC' : '#15803D',
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.14)' : 'rgba(34, 197, 94, 0.12)',
                  border: isDark ? '1px solid rgba(74, 222, 128, 0.28)' : '1px solid rgba(34, 197, 94, 0.22)',
                  padding: '3px 9px',
                  borderRadius: '12px',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                VERIFIED
              </span>
            </div>
          </div>

          {/* Hero Header: Name, Age, Profession, City */}
          <div
            style={{
              marginBottom: '24px',
              padding: '20px 22px',
              borderRadius: '20px',
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              backdropFilter: 'blur(12px)',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(73, 40, 61, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '34px',
                    fontWeight: 400,
                    color: themeMulberry,
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.15',
                  }}
                >
                  {profile.firstName}, {profile.age}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '15px',
                    color: themeMuted,
                    fontWeight: 500,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{profile.designation} · {profile.company}</span>
                </div>
              </div>

              {/* Location Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isDark ? 'rgba(161, 82, 95, 0.2)' : 'rgba(161, 82, 95, 0.1)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  color: themeMulberry,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{profile.city}</span>
              </div>
            </div>
          </div>

          {/* PHOTOS GALLERY (Balanced softer portrait aspect, less rectangular) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            {profile.photos.map((photoUrl, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(profile.photos, idx, `${profile.firstName}, ${profile.age}`)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '300px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#1E161C',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 10px 28px rgba(0, 0, 0, 0.35)' : '0 10px 28px rgba(73, 40, 61, 0.1)',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 14px 34px rgba(0, 0, 0, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDark ? '0 10px 28px rgba(0, 0, 0, 0.35)' : '0 10px 28px rgba(73, 40, 61, 0.1)';
                }}
                title="Click to view full screen photograph"
              >
                <img
                  src={photoUrl}
                  alt={`${profile.firstName} photograph ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Subtitle / Photo counter pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFF',
                    padding: '3px 9px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  {idx + 1} / {profile.photos.length}
                </div>

                {/* Enlarge badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFF',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  <span>Enlarge</span>
                </div>
              </div>
            ))}
          </div>

          {/* TWO-COLUMN EDITORIAL CARDS GRID (Space fully utilized) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
              marginBottom: '28px',
            }}
          >
            {/* Card 1: Bio & Story */}
            <div
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                padding: '22px',
                backdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(73, 40, 61, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeMulberry,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                  }}
                >
                  About {profile.firstName}
                </h3>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: isDark ? '#F5E6ED' : '#2D1B28',
                  margin: 0,
                }}
              >
                "{profile.introduction}"
              </p>

              {/* Weekend Ritual highlight if available */}
              {profile.weekendRitual && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(247, 243, 238, 0.7)',
                    border: `1px solid ${themeBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: themeMulberry, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                    <span>Weekend Ritual</span>
                  </div>
                  <span style={{ fontSize: '13px', lineHeight: '1.45', color: isDark ? '#E5D8DF' : '#523B49' }}>
                    {profile.weekendRitual}
                  </span>
                </div>
              )}
            </div>

            {/* Card 2: Vibes & Energy */}
            <div
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                padding: '22px',
                backdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(73, 40, 61, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeMulberry,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                  }}
                >
                  Vibe & Atmosphere
                </h3>
              </div>

              {/* Dynamic Vibe Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(profile.vibes && profile.vibes.length > 0 ? profile.vibes : ['Thoughtful', 'Curious', 'Creative']).map((vibe, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: chipBg,
                      border: `1px solid ${chipBorder}`,
                      color: themeMulberry,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span style={{ fontSize: '13px' }}>✨</span>
                    {vibe}
                  </span>
                ))}
              </div>

              {/* Conversational Quirks if present */}
              {profile.quirks && profile.quirks.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: themeMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Conversation Starters
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {profile.quirks.map((quirk, qIdx) => (
                      <div
                        key={qIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '13px',
                          color: isDark ? '#E5D8DF' : '#523B49',
                        }}
                      >
                        <span style={{ color: themeMulberry, fontWeight: 700 }}>•</span>
                        <span>{quirk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Passions & Interests */}
            <div
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                padding: '22px',
                backdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(73, 40, 61, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeMulberry,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                  }}
                >
                  Interests & Passions
                </h3>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: chipBg,
                      border: `1px solid ${chipBorder}`,
                      color: themeTextColor,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span>✦</span>
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 4: Career & Education */}
            <div
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                padding: '22px',
                backdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(73, 40, 61, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeMulberry,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                  }}
                >
                  Career & Background
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Role and Company */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: themeMulberry, flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="7" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: themeTextColor }}>
                      {profile.designation}
                    </div>
                    <div style={{ fontSize: '13px', color: themeMuted }}>
                      {profile.company}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: themeMulberry, flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: themeMuted, fontWeight: 700 }}>
                      Current Status
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: themeTextColor }}>
                      {profile.currentStatus || 'Working Professional'}
                    </div>
                  </div>
                </div>

                {/* Education if available */}
                {(profile.education || profile.careerAndEducation?.education) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: themeMulberry, flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: themeMuted, fontWeight: 700 }}>
                        Education
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: themeTextColor }}>
                        {profile.education || profile.careerAndEducation?.education}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PUBLIC SOCIAL PROFILES CARD (Clickable LinkedIn & Instagram when permitted) */}
          {showSocials && (
            <div
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                padding: '22px',
                marginBottom: '28px',
                backdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(73, 40, 61, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: themeMulberry,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: themeMuted,
                      }}
                    >
                      Verified Public Socials
                    </h3>
                    <div style={{ fontSize: '11px', color: themeMuted, marginTop: '2px' }}>
                      Shared publicly by member choice for authenticity
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: isDark ? '#86EFAC' : '#15803D',
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  AUTHENTICATED
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                }}
              >
                {/* LinkedIn Card */}
                {profile.showLinkedinPublicly && profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      backgroundColor: isDark ? 'rgba(10, 102, 194, 0.15)' : 'rgba(10, 102, 194, 0.08)',
                      border: isDark ? '1px solid rgba(10, 102, 194, 0.35)' : '1px solid rgba(10, 102, 194, 0.2)',
                      textDecoration: 'none',
                      transition: 'transform 0.18s ease, background-color 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* LinkedIn Official Logo */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: isDark ? '#E5E7EB' : '#111827' }}>
                          LinkedIn
                        </div>
                        <div style={{ fontSize: '11px', color: '#0A66C2', fontWeight: 600 }}>
                          View professional profile
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#0A66C2', fontSize: '13px', fontWeight: 700 }}>
                      ↗
                    </div>
                  </a>
                )}

                {/* Instagram Card */}
                {profile.showInstagramPublicly && profile.instagramUsername && (
                  <a
                    href={`https://instagram.com/${profile.instagramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      backgroundColor: isDark ? 'rgba(225, 48, 108, 0.15)' : 'rgba(225, 48, 108, 0.08)',
                      border: isDark ? '1px solid rgba(225, 48, 108, 0.35)' : '1px solid rgba(225, 48, 108, 0.2)',
                      textDecoration: 'none',
                      transition: 'transform 0.18s ease, background-color 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Instagram Logo */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: isDark ? '#E5E7EB' : '#111827' }}>
                          Instagram
                        </div>
                        <div style={{ fontSize: '11px', color: '#E1306C', fontWeight: 600 }}>
                          {profile.instagramUsername.startsWith('@') ? profile.instagramUsername : `@${profile.instagramUsername}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#E1306C', fontSize: '13px', fontWeight: 700 }}>
                      ↗
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS (PASS & SEND REQUEST) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {/* Button 1: PASS */}
            <button
              type="button"
              onClick={handlePass}
              style={{
                flex: 1,
                height: '50px',
                borderRadius: '25px',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                color: themeMulberry,
                border: isDark ? '1.5px solid rgba(161, 82, 95, 0.4)' : '1.5px solid rgba(161, 82, 95, 0.25)',
                fontSize: '12.5px',
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isDark ? '0 3px 12px rgba(0, 0, 0, 0.25)' : '0 3px 12px rgba(161, 82, 95, 0.08)',
                transition: 'transform 0.15s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              <span>PASS</span>
            </button>

            {/* Button 2: SEND REQUEST */}
            <button
              type="button"
              onClick={handleSendRequest}
              style={{
                flex: 1.35,
                height: '50px',
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FDF3F5',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(161, 82, 95, 0.45)',
                transition: 'transform 0.15s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>SEND REQUEST</span>
            </button>
          </div>

          {/* REPORT OR BLOCK THIS MEMBER */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setBlockModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: themeMuted,
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              REPORT OR BLOCK THIS MEMBER
            </button>
          </div>
        </div>
      </div>

      {/* Report / Block Modal */}
      {blockModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(28, 22, 26, 0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setBlockModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#210D1D' : '#FFFFFF',
              border: isDark ? '1px solid rgba(243, 238, 233, 0.18)' : 'none',
              borderRadius: '20px',
              padding: '24px 20px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              boxShadow: isDark ? '0 16px 36px rgba(0,0,0,0.5)' : '0 16px 36px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: themeMulberry, margin: '0 0 8px 0' }}>
              Member Safety
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: isDark ? '#E5D8DF' : '#6E5E68', margin: '0 0 18px 0' }}>
              Would you like to pass and block {profile.firstName}? They will no longer appear in your introductions.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setBlockModalOpen(false);
                  handlePass();
                }}
                style={{
                  height: '42px',
                  borderRadius: '21px',
                  backgroundColor: '#C94A4A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                BLOCK MEMBER
              </button>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                style={{
                  height: '40px',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: themeMuted,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5-BUTTON BOTTOM NAVIGATION: DISCOVER, MATCHES, ELEVATE, MIXERS, YOU */}
      <MemberBottomNav
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
