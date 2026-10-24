import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from '../components/StatusBar';

interface MobileSplashScreenProps {
  onGetStarted: () => void;
  onLearnHowItWorks?: () => void;
  showStatusBar?: boolean;
}

interface PillarItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  score: string;
  category: string;
  cardGradientDark: string;
  cardGradientLight: string;
  glowColor: string;
}

const PILLARS: PillarItem[] = [
  {
    id: 'pillar-curated',
    title: 'Curated Introductions',
    subtitle: 'Editorial Matchmaking',
    description: 'Handpicked verified profiles aligned with your career ambitions, values, and lifestyle standards.',
    icon: '✦',
    badge: 'DAILY CURATION',
    score: '9.8 ★',
    category: 'INTRODUCTIONS',
    cardGradientDark: 'linear-gradient(150deg, #462037 0%, #2A1322 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #683A46 0%, #462037 60%, #271420 100%)',
    glowColor: 'rgba(161, 82, 95, 0.45)',
  },
  {
    id: 'pillar-verification',
    title: 'Rigorous Verification',
    subtitle: 'Zero Anonymous Profiles',
    description: 'Biometric selfie authentication and human review ensure genuine, trustworthy members.',
    icon: '🛡️',
    badge: 'VERIFIED CIRCLE',
    score: '9.9 ★',
    category: 'INTEGRITY',
    cardGradientDark: 'linear-gradient(150deg, #532341 0%, #35172B 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #743E4E 0%, #4D233C 60%, #2D1625 100%)',
    glowColor: 'rgba(199, 87, 124, 0.45)',
  },
  {
    id: 'pillar-elevate',
    title: 'Elevate Concierge',
    subtitle: 'Personal Advisory',
    description: 'Private styling, executive photography, and personalized relationship advisory arranged for you.',
    icon: '✨',
    badge: 'LUXURY ADVISORY',
    score: '9.7 ★',
    category: 'CONCIERGE',
    cardGradientDark: 'linear-gradient(150deg, #441C33 0%, #271220 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #663248 0%, #441C33 60%, #25121F 100%)',
    glowColor: 'rgba(161, 82, 95, 0.4)',
  },
  {
    id: 'pillar-events',
    title: 'Private Mixers',
    subtitle: 'Real-World Dinners',
    description: 'Invitation-only salons, tasting evenings, and rooftop mixers in select metropolitan cities.',
    icon: '🍸',
    badge: 'EXCLUSIVE ACCESS',
    score: '9.9 ★',
    category: 'MEMBERS CLUB',
    cardGradientDark: 'linear-gradient(150deg, #4E1F3C 0%, #2E1325 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #6E3652 0%, #4E1F3C 60%, #2B1322 100%)',
    glowColor: 'rgba(199, 87, 124, 0.4)',
  },
  {
    id: 'pillar-afterhours',
    title: 'After Hours',
    subtitle: 'Nightly Blind Chats',
    description: 'Every evening 10 PM - 11 PM: 8-minute blind audio/text window before mutual unblur.',
    icon: '🌙',
    badge: '10 PM - 11 PM',
    score: '9.8 ★',
    category: 'EXPERIENCES',
    cardGradientDark: 'linear-gradient(150deg, #3B162C 0%, #240E1C 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #5A2942 0%, #3B162C 60%, #200D19 100%)',
    glowColor: 'rgba(161, 82, 95, 0.45)',
  },
];

const LOGO_LETTERS = [
  { id: 'V', src: '/letters/letter_V.png' },
  { id: 'e', src: '/letters/letter_e.png' },
  { id: 'n1', src: '/letters/letter_n1.png' },
  { id: 'n2', src: '/letters/letter_n2.png' },
  { id: 'z', src: '/letters/letter_z.png' },
];

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({
  onGetStarted,
  showStatusBar = false,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const [activeIndex, setActiveIndex] = useState(2);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setActiveIndex((prev) => Math.min(PILLARS.length - 1, prev + 1));
      } else {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 16%, rgba(70, 32, 55, 0.45) 0%, rgba(20, 14, 28, 0.98) 90%)'
            : 'linear-gradient(180deg, #FBF3F5 0%, #FAF1F3 42%, #FBF3F5 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* SECTION 1: HERO VIEWPORT (Centered & perfectly fitted for mobile phone) */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          minHeight: 'calc(100dvh - 20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 16px calc(28px + env(safe-area-inset-bottom, 16px))',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', height: '10px' }} />

        {/* VennZ 3D Logo Centerpiece */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Logo container strictly sized for mobile screen */}
          <div
            style={{
              position: 'relative',
              width: 'min(300px, 80vw)',
              aspectRatio: '984 / 303',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            {LOGO_LETTERS.map((letter) => (
              <img
                key={letter.id}
                src={letter.src}
                alt={letter.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ))}
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: isDark ? '#FDF3F5' : '#462037',
              margin: '8px 0 0 0',
              textAlign: 'center',
            }}
          >
            Real people. Meaningful connections.
          </p>
        </div>

        {/* Editorial Hook & Primary CTA Button */}
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: isDark ? '#D4A2AC' : '#683A46',
              margin: '0 0 2px 0',
            }}
          >
            Not just a dating app.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-script)',
              fontSize: '44px',
              lineHeight: 1.1,
              color: isDark ? '#FDF3F5' : '#462037',
              margin: '0 0 20px 0',
            }}
          >
            A community.
          </p>

          {/* Get Started Button: Full-width, never cut off, clear touch target */}
          <button
            type="button"
            onClick={onGetStarted}
            style={{
              width: '100%',
              height: '54px',
              background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
              color: '#FDF3F5',
              fontFamily: 'var(--font-sans)',
              fontSize: '17px',
              fontWeight: 700,
              borderRadius: '9999px',
              border: isDark ? '1px solid rgba(249, 170, 173, 0.4)' : '1px solid rgba(161, 82, 95, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              touchAction: 'manipulation',
              boxShadow: '0 8px 24px rgba(161, 82, 95, 0.4)',
            }}
          >
            <span>Get Started</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* SECTION 2: MOBILE 3D COVERFLOW (Smooth touch swipe, fits screen without horizontal overflow) */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          padding: '40px 16px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: isDark ? '#F9AAAD' : '#A1525F',
            }}
          >
            CURATED EXCELLENCE
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 600,
              color: isDark ? '#FDF3F5' : '#462037',
              margin: '6px 0 0 0',
            }}
          >
            Explore the VennZ Standard
          </h3>
        </div>

        {/* Mobile Carousel Track */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            height: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'pan-y',
          }}
        >
          {PILLARS.map((pillar, idx) => {
            const offset = idx - activeIndex;
            const isCardFocused = offset === 0;

            // Scaled positioning for mobile viewport (fits inside 360px - 414px)
            const translateX = offset * 140;
            const scale = isCardFocused ? 1.0 : Math.max(0.78, 0.88 - Math.abs(offset) * 0.08);
            const opacity = isCardFocused ? 1 : Math.max(0.35, 0.7 - Math.abs(offset) * 0.25);
            const zIndex = 20 - Math.abs(offset) * 2;

            if (Math.abs(offset) > 2) return null;

            return (
              <div
                key={pillar.id}
                onClick={() => setActiveIndex(idx)}
                style={{
                  position: 'absolute',
                  width: 'min(270px, 75vw)',
                  height: '340px',
                  borderRadius: '20px',
                  background: isDark ? pillar.cardGradientDark : pillar.cardGradientLight,
                  border: isCardFocused
                    ? `1.5px solid ${isDark ? 'rgba(249, 170, 173, 0.55)' : 'rgba(255, 255, 255, 0.7)'}`
                    : `1px solid ${isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(104, 58, 70, 0.18)'}`,
                  boxShadow: isCardFocused
                    ? `0 16px 36px rgba(0, 0, 0, 0.6), 0 0 24px ${pillar.glowColor}`
                    : '0 8px 20px rgba(0, 0, 0, 0.4)',
                  padding: '24px 20px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: 'transform 0.35s ease, opacity 0.35s ease, box-shadow 0.35s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px' }}>{pillar.icon}</span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        backgroundColor: isDark ? 'rgba(249, 170, 173, 0.16)' : 'rgba(255, 255, 255, 0.3)',
                        color: isDark ? '#F9AAAD' : '#FDF3F5',
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#FDF3F5', margin: '0 0 4px 0' }}>
                    {pillar.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: isDark ? '#F9AAAD' : '#F8E2E6', fontWeight: 600, marginBottom: '12px' }}>
                    {pillar.subtitle}
                  </div>
                  <p style={{ fontSize: '13px', color: '#FDF3F5', opacity: 0.85, lineHeight: 1.45, margin: 0 }}>
                    {pillar.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#F9AAAD', fontWeight: 600, letterSpacing: '0.08em' }}>
                    {pillar.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FDF3F5' }}>
                    {pillar.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel indicator dots */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '28px' }}>
          {PILLARS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              style={{
                width: activeIndex === idx ? '20px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: activeIndex === idx ? '#C7577C' : 'rgba(161, 82, 95, 0.35)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <button
            type="button"
            onClick={onGetStarted}
            style={{
              width: '100%',
              height: '52px',
              background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
              color: '#FDF3F5',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 700,
              borderRadius: '9999px',
              border: isDark ? '1px solid rgba(249, 170, 173, 0.4)' : '1px solid rgba(161, 82, 95, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              touchAction: 'manipulation',
              boxShadow: '0 8px 24px rgba(161, 82, 95, 0.4)',
            }}
          >
            <span>Get Started</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};
