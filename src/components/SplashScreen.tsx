import React, { useState, useRef } from 'react';
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
  isIntroActive?: boolean;
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
    icon: '👑',
    badge: 'CONCIERGE DESK',
    score: '9.6 ★',
    category: 'PREMIUM SERVICE',
    cardGradientDark: 'linear-gradient(150deg, #683A46 0%, #3F1C32 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #8C475A 0%, #5B2945 60%, #341829 100%)',
    glowColor: 'rgba(249, 170, 173, 0.45)',
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
    cardGradientDark: 'linear-gradient(150deg, #4F223D 0%, #301426 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #6E3B4B 0%, #482038 60%, #2A1423 100%)',
    glowColor: 'rgba(199, 87, 124, 0.45)',
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
    cardGradientDark: 'linear-gradient(150deg, #5C2847 0%, #39182E 55%, #140E1C 100%)',
    cardGradientLight: 'linear-gradient(150deg, #7A4153 0%, #522540 60%, #2F1727 100%)',
    glowColor: 'rgba(161, 82, 95, 0.45)',
  },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onGetStarted,
  onLogin,
  onLearnHowItWorks,
  showStatusBar = false,
  showHomeIndicator = false,
  isIntroActive = false,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Active card index for the 3D coverflow carousel
  const [activeIndex, setActiveIndex] = useState(2); // Center card active by default
  const lastSwipeTime = useRef(0);
  const touchStartX = useRef<number | null>(null);


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



  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Dynamic Ambient Gradient Mesh Background (Cinematic dark plum / mauve subtle sweep) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 16%, rgba(70, 32, 55, 0.45) 0%, rgba(104, 58, 70, 0.22) 40%, rgba(20, 14, 28, 0.98) 90%)'
            : [
                'radial-gradient(ellipse at 50% 14%, rgba(236, 209, 216, 0.5) 0%, rgba(242, 223, 228, 0.3) 38%, rgba(250, 241, 243, 0.15) 65%, transparent 100%)',
                'radial-gradient(ellipse at 50% 70%, rgba(227, 189, 199, 0.3) 0%, rgba(245, 230, 235, 0.2) 45%, transparent 80%)',
                'linear-gradient(180deg, #FBF3F5 0%, #FAF1F3 42%, #FBF3F5 100%)',
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
          minHeight: 'calc(100dvh - 68px)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Editorial Branding Lockup with VennZ centered */}
        <div
          style={{
            marginBottom: '32px',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SplashBranding isIntroActive={isIntroActive} />
        </div>

        {/* Action Suite (CTA: Get Started with Purple & Cream Shade) */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            opacity: isIntroActive ? 0 : 1,
            transform: isIntroActive ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.45s ease 0.25s, transform 0.45s ease 0.25s',
          }}
        >
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
              color: isDark ? '#F9AAAD' : '#A1525F',
            }}
          >
            CURATED EXCELLENCE
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(24px, 3.2vw, 34px)',
              fontWeight: 500,
              color: isDark ? '#FDF3F5' : '#462037',
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
          {/* Ambient Mauve/Plum Backlight to blend the cards into cinematic ambiance */}
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
                ? 'radial-gradient(ellipse at center, rgba(104, 58, 70, 0.28) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(199, 87, 124, 0.25) 0%, transparent 70%)',
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
                      ? '1.5px solid #F9AAAD'
                      : '1.5px solid #C7577C'
                    : isDark
                    ? '1px solid rgba(161, 82, 95, 0.35)'
                    : '1px solid rgba(161, 82, 95, 0.22)',
                  boxShadow: isCardFocused
                    ? isDark
                      ? `0 28px 60px rgba(20, 14, 28, 0.8), 0 0 36px ${pillar.glowColor}`
                      : `0 24px 50px rgba(70, 32, 55, 0.25), 0 0 32px ${pillar.glowColor}`
                    : isDark
                    ? '0 12px 28px rgba(20, 14, 28, 0.5)'
                    : '0 10px 24px rgba(70, 32, 55, 0.15)',
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
                    background: 'linear-gradient(90deg, transparent, rgba(249, 170, 173, 0.4), transparent)',
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
                      backgroundColor: isDark ? 'rgba(249, 170, 173, 0.16)' : 'rgba(255, 255, 255, 0.18)',
                      border: isDark ? '1px solid rgba(249, 170, 173, 0.35)' : '1px solid rgba(199, 87, 124, 0.3)',
                      backdropFilter: 'blur(8px)',
                      color: '#FDF3F5',
                    }}
                  >
                    {pillar.badge}
                  </span>

                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FDF3F5',
                      letterSpacing: '0.04em',
                      backgroundColor: 'rgba(20, 14, 28, 0.55)',
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
                      backgroundColor: isDark ? 'rgba(104, 58, 70, 0.45)' : 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      color: isDark ? '#F9AAAD' : '#FDF3F5',
                      boxShadow: '0 8px 22px rgba(20, 14, 28, 0.4)',
                      border: isDark ? '1px solid rgba(161, 82, 95, 0.4)' : '1px solid rgba(255, 255, 255, 0.3)',
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
                      color: isDark ? '#F9AAAD' : 'rgba(253, 243, 245, 0.9)',
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
                      color: '#FDF3F5',
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
                      color: isDark ? 'rgba(253, 243, 245, 0.85)' : 'rgba(253, 243, 245, 0.9)',
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
                  ? (isDark ? '#F9AAAD' : '#A1525F')
                  : (isDark ? 'rgba(161, 82, 95, 0.35)' : 'rgba(161, 82, 95, 0.22)'),
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Bottom CTA suite to guide users into application */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '36px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
              border: 'none',
              color: '#FDF3F5',
              padding: '13px 36px',
              borderRadius: '999px',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(161, 82, 95, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(199, 87, 124, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(161, 82, 95, 0.4)';
            }}
          >
            Apply to Join VennZ →
          </button>

          {onLearnHowItWorks && (
            <button
              type="button"
              onClick={onLearnHowItWorks}
              style={{
                background: isDark ? 'rgba(70, 32, 55, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                border: isDark ? '1px solid rgba(161, 82, 95, 0.45)' : '1px solid rgba(161, 82, 95, 0.25)',
                color: isDark ? '#FDF3F5' : '#462037',
                padding: '13px 32px',
                borderRadius: '999px',
                fontSize: '15px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                boxShadow: isDark ? '0 4px 18px rgba(20, 14, 28, 0.4)' : '0 4px 18px rgba(70, 32, 55, 0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = isDark ? '#F9AAAD' : '#A1525F';
                e.currentTarget.style.color = isDark ? '#F9AAAD' : '#A1525F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = isDark
                  ? 'rgba(161, 82, 95, 0.45)'
                  : 'rgba(161, 82, 95, 0.25)';
                e.currentTarget.style.color = isDark ? '#FDF3F5' : '#462037';
              }}
            >
              Learn How VennZ Works
            </button>
          )}
        </div>
      </section>

      {/* Optional iOS Home Indicator */}
      {showHomeIndicator && (
        <div
          style={{
            width: '134px',
            height: '5px',
            backgroundColor: isDark ? 'rgba(161, 82, 95, 0.35)' : 'rgba(161, 82, 95, 0.25)',
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
