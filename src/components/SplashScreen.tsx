import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { SplashBranding } from './SplashBranding';
import { SplashActions } from './SplashActions';
import { useAuth } from '../context/AuthContext';

interface SplashScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onLearnHowItWorks?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
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
    cardGradientDark: 'linear-gradient(150deg, #3A1636 0%, #230B21 55%, #130512 100%)',
    cardGradientLight: 'linear-gradient(150deg, #582453 0%, #3B1638 55%, #220B20 100%)',
    glowColor: 'rgba(183, 142, 184, 0.45)',
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
    cardGradientDark: 'linear-gradient(150deg, #441A3F 0%, #2A0E27 55%, #160615 100%)',
    cardGradientLight: 'linear-gradient(150deg, #64285D 0%, #43173F 55%, #270D25 100%)',
    glowColor: 'rgba(215, 175, 210, 0.45)',
  },
  {
    id: 'pillar-elevate',
    title: 'Elevate Concierge',
    subtitle: 'Personal Advisory',
    description: 'Private styling, executive photography, and personalized relationship advisory arranged for you.',
    icon: '👑',
    badge: 'CONCIERGE DESK',
    score: '9.6 ★',
    category: 'PREMIUM SERVICE',
    cardGradientDark: 'linear-gradient(150deg, #33132F 0%, #20091E 55%, #110410 100%)',
    cardGradientLight: 'linear-gradient(150deg, #4E1E48 0%, #341231 55%, #1F0A1D 100%)',
    glowColor: 'rgba(232, 169, 155, 0.45)',
  },
  {
    id: 'pillar-mixers',
    title: 'Private Mixers',
    subtitle: 'Offline Gatherings',
    description: 'Curated intimate cocktail evenings and private dinners in premier venues across major cities.',
    icon: '🍸',
    badge: 'SECRET VENUES',
    score: '9.7 ★',
    category: 'MEMBERS GATHERINGS',
    cardGradientDark: 'linear-gradient(150deg, #481B43 0%, #2D0F2A 55%, #170716 100%)',
    cardGradientLight: 'linear-gradient(150deg, #6B2B64 0%, #481943 55%, #290E26 100%)',
    glowColor: 'rgba(200, 135, 185, 0.45)',
  },
  {
    id: 'pillar-community',
    title: 'High-Standard Culture',
    subtitle: 'Mutual Respect',
    description: 'An invitation-only ecosystem where integrity, truthful self-presentation, and ambition connect.',
    icon: '✨',
    badge: 'EXCLUSIVE ECOSYSTEM',
    score: '9.9 ★',
    category: 'COMMUNITY',
    cardGradientDark: 'linear-gradient(150deg, #371434 0%, #220B20 55%, #120511 100%)',
    cardGradientLight: 'linear-gradient(150deg, #531F4E 0%, #371434 55%, #210B20 100%)',
    glowColor: 'rgba(195, 150, 180, 0.45)',
  },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onGetStarted,
  onLogin,
  onLearnHowItWorks,
  showStatusBar = false,
  showHomeIndicator = false,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Active card index for the 3D coverflow carousel
  const [activeIndex, setActiveIndex] = useState(2); // Center card active by default
  const [scrollY, setScrollY] = useState(0);

  const lastSwipeTime = useRef(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle touchpad left/right swipe via wheel event
  const handleWheel = (e: React.WheelEvent) => {
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);

    // Trigger on horizontal trackpad swipe or Shift+Wheel
    if (absX > 18 || (e.shiftKey && absY > 18)) {
      const now = Date.now();
      if (now - lastSwipeTime.current > 260) {
        lastSwipeTime.current = now;
        const delta = absX > 18 ? e.deltaX : e.deltaY;
        if (delta > 0) {
          // Swipe left / move forward
          setActiveIndex((prev) => Math.min(PILLARS.length - 1, prev + 1));
        } else {
          // Swipe right / move backward
          setActiveIndex((prev) => Math.max(0, prev - 1));
        }
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left
        setActiveIndex((prev) => Math.min(PILLARS.length - 1, prev + 1));
      } else {
        // Swiped right
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
    }
    touchStartX.current = null;
  };

  // Compute smooth dynamic scroll scale: shrinks slightly as user scrolls down, enlarges back on top
  const headerScale = Math.max(0.86, 1 - scrollY * 0.0008);
  const headerOpacity = Math.max(0.72, 1 - scrollY * 0.001);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        backgroundColor: isDark ? '#100812' : '#F3EBF2',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Dynamic Ambient Gradient Mesh Background (softer purple in dark mode, gentle subtle purple nuance in light mode) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 16%, rgba(70, 26, 65, 0.28) 0%, rgba(28, 11, 26, 0.45) 45%, rgba(16, 8, 18, 1) 95%)'
            : [
                'radial-gradient(ellipse at 50% 14%, rgba(196, 152, 198, 0.32) 0%, rgba(220, 186, 222, 0.22) 38%, rgba(240, 220, 238, 0.12) 65%, transparent 100%)',
                'radial-gradient(ellipse at 50% 70%, rgba(185, 138, 188, 0.22) 0%, rgba(218, 184, 220, 0.15) 45%, transparent 80%)',
                'linear-gradient(180deg, #F6EEF5 0%, #EFE4EE 42%, #F6EEF5 100%)',
              ].join(', '),
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />



      {/* Optional Mobile Status Bar */}
      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: HERO VIEWPORT (Immediately visible on first open) */}
      {/* Takes 100vh so that the curated experience cards are only visible upon scrolling down */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* SECTION 1: HERO VIEWPORT (Immediately visible on first open) */}
      {/* Takes full 100vh with VennZ and CTA placed directly in the center */}
      {/* ======================================================== */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          minHeight: '100vh',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Editorial Branding Lockup with VennZ centered and Dynamic Scroll Zoom */}
        <div
          style={{
            marginBottom: '32px',
            textAlign: 'center',
            transform: `scale(${headerScale})`,
            opacity: headerOpacity,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SplashBranding />
        </div>

        {/* Action Suite (CTA: Get Started with Purple & Cream Shade) */}
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <SplashActions onGetStarted={onGetStarted} onLogin={onLogin} />
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: 3D COVERFLOW SECTION (Seen AFTER sliding down) */}
      {/* ======================================================== */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          perspective: '1200px',
          boxSizing: 'border-box',
        }}
      >
        {/* Curated Section Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '36px',
            padding: '0 16px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: isDark ? '#FAF5EE' : 'var(--color-mulberry)',
            }}
          >
            CURATED EXCELLENCE
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(24px, 3.2vw, 34px)',
              fontWeight: 500,
              color: isDark ? '#FAF5EE' : 'var(--color-mulberry)',
              margin: '8px 0 0 0',
            }}
          >
            Explore the VennZ Standard
          </h3>
        </div>

        {/* 3D Staged Card Stage with Touchpad Left/Right Swipe Interaction (No Cursor Hover Auto-Slide) */}
        <div
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '410px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            padding: '24px 0',
            touchAction: 'pan-y',
          }}
        >
          {/* Ambient Purple Backlight to blend the cards into purple ambiance */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(760px, 90vw)',
              height: '320px',
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(65, 24, 60, 0.22) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(183, 142, 184, 0.35) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {PILLARS.map((pillar, idx) => {
            // Distance from active center card
            const offset = idx - activeIndex;
            const isCardFocused = offset === 0;

            // 3D positioning matching user reference:
            // Center card: scale(1.12), zIndex 20, center translate, zero rotation, fully opaque, vibrant purple glow
            // Outer cards: scaled down (0.82), rotated on Y-axis (18deg / -18deg), translated outwards, blended into purple background
            const translateX = offset * 210;
            const translateZ = isCardFocused ? 90 : -70 * Math.abs(offset);
            const rotateY = offset * -18;
            const scale = isCardFocused ? 1.12 : Math.max(0.76, 0.88 - Math.abs(offset) * 0.08);
            const opacity = isCardFocused ? 1 : Math.max(0.42, 0.78 - Math.abs(offset) * 0.2);
            const zIndex = isCardFocused ? 20 : 10 - Math.abs(offset);

            const cardBg = isDark ? pillar.cardGradientDark : pillar.cardGradientLight;

            return (
              <div
                key={pillar.id}
                onClick={() => setActiveIndex(idx)}
                style={{
                  position: 'absolute',
                  width: 'clamp(235px, 24vw, 290px)',
                  height: '355px',
                  borderRadius: '24px',
                  background: cardBg,
                  border: isCardFocused
                    ? isDark
                      ? '1.5px solid rgba(250, 245, 238, 0.75)'
                      : '1.5px solid rgba(183, 142, 184, 0.75)'
                    : isDark
                    ? '1px solid rgba(250, 245, 238, 0.15)'
                    : '1px solid rgba(139, 44, 116, 0.25)',
                  boxShadow: isCardFocused
                    ? isDark
                      ? `0 28px 60px rgba(0, 0, 0, 0.7), 0 0 42px ${pillar.glowColor}`
                      : `0 24px 50px rgba(73, 40, 61, 0.28), 0 0 38px ${pillar.glowColor}`
                    : isDark
                    ? '0 12px 28px rgba(0, 0, 0, 0.45)'
                    : '0 10px 24px rgba(73, 40, 61, 0.18)',
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition:
                    'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease, box-shadow 0.4s ease, border-color 0.35s ease',
                  transformStyle: 'preserve-3d',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px 22px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Subtle Specular Top Rim Reflection */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '15%',
                    right: '15%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Bar: Category badge & Score pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: isDark ? 'rgba(250, 245, 238, 0.16)' : 'rgba(255, 255, 255, 0.14)',
                      border: isDark ? '1px solid rgba(250, 245, 238, 0.25)' : 'none',
                      backdropFilter: 'blur(8px)',
                      color: '#FAF5EE',
                    }}
                  >
                    {pillar.badge}
                  </span>

                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FAF5EE',
                      letterSpacing: '0.04em',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {pillar.score}
                  </span>
                </div>

                {/* Center Emblem / Icon with 3D float */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? 'rgba(250, 245, 238, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      color: '#FAF5EE',
                      boxShadow: '0 8px 22px rgba(0, 0, 0, 0.35)',
                      border: isDark ? '1px solid rgba(250, 245, 238, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                      marginBottom: '10px',
                      transition: 'transform 0.3s ease',
                      transform: isCardFocused ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {pillar.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: isDark ? '#FAF5EE' : 'rgba(243, 238, 233, 0.85)',
                    }}
                  >
                    {pillar.category}
                  </span>
                </div>

                {/* Bottom Card Title and Description */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#FAF5EE',
                      margin: '0 0 6px 0',
                      letterSpacing: '0.01em',
                      lineHeight: '1.2',
                    }}
                  >
                    {pillar.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      lineHeight: '1.45',
                      color: isDark ? '#FAF5EE' : 'rgba(243, 238, 233, 0.88)',
                      margin: 0,
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel pagination indicator dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '28px',
          }}
        >
          {PILLARS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: activeIndex === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: activeIndex === i
                  ? (isDark ? '#FAF5EE' : 'var(--color-mulberry)')
                  : (isDark ? 'rgba(250, 245, 238, 0.3)' : 'rgba(73, 40, 61, 0.25)'),
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* --- LEARN HOW VENNZ WORKS BUTTON PLACED STRICTLY BELOW CARDS --- */}
        {onLearnHowItWorks && (
          <div style={{ textAlign: 'center', marginTop: '36px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onLearnHowItWorks}
              style={{
                background: isDark ? 'rgba(40, 18, 38, 0.75)' : 'rgba(255, 255, 255, 0.9)',
                border: isDark ? '1px solid rgba(250, 245, 238, 0.35)' : '1px solid rgba(73, 40, 61, 0.18)',
                color: isDark ? '#FAF5EE' : 'var(--color-mulberry)',
                padding: '13px 32px',
                borderRadius: '999px',
                fontSize: '15px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = isDark ? '#FAF5EE' : 'var(--color-mulberry)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = isDark
                  ? 'rgba(250, 245, 238, 0.35)'
                  : 'rgba(73, 40, 61, 0.18)';
              }}
            >
              Learn How VennZ Works →
            </button>
          </div>
        )}
      </section>

      {/* Optional iOS Home Indicator */}
      {showHomeIndicator && (
        <div
          style={{
            width: '134px',
            height: '5px',
            backgroundColor: isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.25)',
            borderRadius: '9999px',
            margin: '0 auto 12px',
            position: 'relative',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};
