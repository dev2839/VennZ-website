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

      {/* Subtle Luminous Parchment Glow & Dark Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(3, 0, 3, 0.12)' : 'rgba(247, 243, 238, 0.35)',
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

      {/* REFERENCE 2: Fixed Member Top Bar */}
      <MemberTopBar onLogoClick={onBack} />

      {/* Scrollable Profile Body matching Reference media_1788925390644.png */}
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
            padding: '16px 24px 40px 24px',
            boxSizing: 'border-box',
          }}
        >
          {/* Subheader: < BACK on left, VERIFIED on right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
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

            {/* VERIFIED label on right (Replaces three-dot menu) */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isDark ? '#66BB6A' : '#2E7D32',
              }}
            >
              VERIFIED
            </span>
          </div>

          {/* Heading: Name, Age and Designation / Company */}
          <div style={{ marginBottom: '22px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '34px',
                fontWeight: 400,
                color: themeMulberry,
                margin: '0 0 4px 0',
                letterSpacing: '-0.01em',
                lineHeight: '1.15',
              }}
            >
              {profile.firstName}, {profile.age}
            </h1>

            <div
              style={{
                fontSize: '15px',
                color: themeMuted,
                fontWeight: 500,
              }}
            >
              {profile.designation} · {profile.company}
            </div>
          </div>

          {/* PHOTOS GALLERY (clickable for full-screen lightbox) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {profile.photos.map((photoUrl, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(profile.photos, idx, `${profile.firstName}, ${profile.age}`)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '420px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#1E161C',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(73, 40, 61, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(73, 40, 61, 0.1)';
                }}
                title="Click to view full screen"
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFF',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
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

          {/* EDITORIAL DETAIL ROWS / DATA TABLE (matching Reference media_1788925390644.png) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '28px',
            }}
          >
            {/* Row 1: CITY */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: `1px solid ${themeBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                }}
              >
                CITY
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeTextColor }}>
                {profile.city}
              </span>
            </div>

            {/* Row 2: STATUS */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: `1px solid ${themeBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                }}
              >
                STATUS
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeTextColor }}>
                {profile.currentStatus || 'Working'}
              </span>
            </div>

            {/* Row 3: WORK */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: `1px solid ${themeBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                }}
              >
                WORK
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeTextColor }}>
                {profile.designation}, {profile.company}
              </span>
            </div>

            {/* Row 4: INTRODUCTION */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '12px 0',
                borderBottom: `1px solid ${themeBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                }}
              >
                INTRODUCTION
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '15px',
                  lineHeight: '1.55',
                  color: isDark ? '#E5D8DF' : '#272124',
                  margin: 0,
                }}
              >
                {profile.introduction}
              </p>
            </div>

            {/* Row 5: IDENTITY */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: `1px solid ${themeBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                }}
              >
                IDENTITY
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: isDark ? '#66BB6A' : '#2E7D32' }}>
                Verified
              </span>
            </div>
          </div>

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
                height: '48px',
                borderRadius: '24px',
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
                gap: '6px',
                boxShadow: isDark ? '0 3px 12px rgba(0, 0, 0, 0.25)' : '0 3px 12px rgba(161, 82, 95, 0.08)',
              }}
            >
              <span>PASS</span>
            </button>

            {/* Button 2: SEND REQUEST */}
            <button
              type="button"
              onClick={handleSendRequest}
              style={{
                flex: 1.25,
                height: '48px',
                borderRadius: '24px',
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
                gap: '6px',
                boxShadow: '0 6px 18px rgba(161, 82, 95, 0.4)',
              }}
            >
              <span>SEND REQUEST</span>
            </button>
          </div>

          {/* REPORT OR BLOCK THIS MEMBER (matching Reference media_1788925390644.png) */}
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

      {/* REFERENCE 3 & 5-BUTTON BOTTOM NAVIGATION: DISCOVER, MATCHES, ELEVATE, MIXERS, YOU */}
      <MemberBottomNav
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
