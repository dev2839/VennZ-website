import React, { useState, useEffect } from 'react';
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
  // Unique luxury purple tonal gradient shades
  cardGradient: string;
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
    cardGradient: 'linear-gradient(150deg, #4A1D45 0%, #2E102B 55%, #180816 100%)',
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
    cardGradient: 'linear-gradient(150deg, #5B2355 0%, #391435 55%, #1C091A 100%)',
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
    cardGradient: 'linear-gradient(150deg, #3C1637 0%, #260C23 55%, #140512 100%)',
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
    cardGradient: 'linear-gradient(150deg, #63265D 0%, #3F173C 55%, #1F0A1D 100%)',
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
    cardGradient: 'linear-gradient(150deg, #44173F 0%, #2A0D27 55%, #160614 100%)',
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

  // Active highlighted card index for the 3D coverflow carousel
  const [activeIndex, setActiveIndex] = useState(2); // Center card active by default
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute smooth dynamic scroll scale: shrinks slightly as user scrolls down, enlarges back on top
  const headerScale = Math.max(0.86, 1 - scrollY * 0.0008);
  const headerOpacity = Math.max(0.72, 1 - scrollY * 0.001);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowX: 'hidden',
        backgroundColor: isDark ? '#140813' : '#FAF6F0',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* --- TOP MINIMAL BRANDING IMAGE / ELEMENTS BANNER --- */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '24px',
          zIndex: 1,
        }}
      >
        {/* Minimal Editorial Aesthetic Header Line Accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '12px',
            opacity: 0.85,
          }}
        >
          <span
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: isDark ? 'rgba(215, 175, 210, 0.4)' : 'rgba(73, 40, 61, 0.3)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: isDark ? '#D7AFD2' : 'var(--color-mulberry)',
            }}
          >
            THE INNER CIRCLE EXPERIENCE
          </span>
          <span
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: isDark ? 'rgba(215, 175, 210, 0.4)' : 'rgba(73, 40, 61, 0.3)',
            }}
          />
        </div>
      </div>

      {/* Trending Ambient Gradient Mesh Background with purple glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 12%, rgba(107, 45, 102, 0.38) 0%, rgba(35, 12, 33, 0.6) 42%, rgba(20, 8, 19, 1) 100%)'
            : 'radial-gradient(ellipse at 50% 10%, rgba(222, 203, 217, 0.45) 0%, rgba(244, 236, 227, 0.65) 50%, rgba(250, 246, 240, 1) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Decorative Subtle Intersecting Venn Aura */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(900px, 95vw)',
          height: 'min(600px, 80vh)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: isDark ? 0.45 : 0.6,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 'clamp(260px, 45vw, 420px)',
            height: 'clamp(260px, 45vw, 420px)',
            borderRadius: '50%',
            transform: 'translateX(-80px)',
            background: isDark
              ? 'radial-gradient(circle, rgba(139, 44, 116, 0.22) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(183, 142, 184, 0.22) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 'clamp(260px, 45vw, 420px)',
            height: 'clamp(260px, 45vw, 420px)',
            borderRadius: '50%',
            transform: 'translateX(80px)',
            background: isDark
              ? 'radial-gradient(circle, rgba(107, 45, 102, 0.22) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(232, 169, 155, 0.25) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />
      </div>

      {/* Optional Mobile Status Bar */}
      {showStatusBar && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Main Hero Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '24px 20px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Editorial Branding Lockup with VennZ in More Center and Dynamic Scroll Zoom */}
        <div
          style={{
            marginBottom: '32px',
            textAlign: 'center',
            transform: `scale(${headerScale})`,
            opacity: headerOpacity,
            transformOrigin: 'top center',
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
        <div style={{ width: '100%', maxWidth: '440px', marginBottom: '48px' }}>
          <SplashActions onGetStarted={onGetStarted} onLogin={onLogin} />
        </div>

        {/* --- 3D COVERFLOW NETFLIX CARDS (Matching user reference layout) --- */}
        <div
          style={{
            width: '100%',
            maxWidth: '1280px',
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            perspective: '1200px',
          }}
        >
          {/* Section Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '28px',
              padding: '0 16px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: isDark ? '#D7AFD2' : 'var(--color-mulberry)',
              }}
            >
              CURATED EXCELLENCE
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 500,
                color: isDark ? 'var(--color-warm-porcelain)' : 'var(--color-mulberry)',
                margin: '6px 0 0 0',
              }}
            >
              Explore the VennZ Standard
            </h3>
          </div>

          {/* 3D Curved / Staged Card Stage */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              padding: '20px 0',
            }}
          >
            {PILLARS.map((pillar, idx) => {
              // Calculate relative distance from the center active card
              const offset = idx - activeIndex;
              const isActive = offset === 0;

              // 3D positioning matching user reference:
              // Active: scale(1.08), zIndex 10, center translate, zero rotation, fully opaque, vibrant purple glow
              // Outer cards: scaled down (0.82), rotated on Y-axis (20deg / -20deg), translated outwards, blended into purple background
              const translateX = offset * 210; // spread spacing
              const translateZ = isActive ? 80 : -70 * Math.abs(offset);
              const rotateY = offset * -18; // curved amphitheater tilt
              const scale = isActive ? 1.08 : Math.max(0.76, 0.88 - Math.abs(offset) * 0.08);
              const opacity = isActive ? 1 : Math.max(0.38, 0.78 - Math.abs(offset) * 0.22);
              const zIndex = 10 - Math.abs(offset);

              return (
                <div
                  key={pillar.id}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    position: 'absolute',
                    width: 'clamp(230px, 24vw, 290px)',
                    height: '350px',
                    borderRadius: '24px',
                    background: pillar.cardGradient,
                    border: isActive
                      ? '1.5px solid rgba(235, 215, 230, 0.45)'
                      : '1px solid rgba(215, 175, 210, 0.15)',
                    boxShadow: isActive
                      ? `0 24px 50px rgba(0, 0, 0, 0.65), 0 0 35px ${pillar.glowColor}`
                      : '0 12px 28px rgba(0, 0, 0, 0.45)',
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition:
                      'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease, box-shadow 0.45s ease, border-color 0.4s ease',
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

                  {/* Top Bar: Category badge & Score pill (Matching reference format) */}
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
                        backgroundColor: 'rgba(255, 255, 255, 0.14)',
                        backdropFilter: 'blur(8px)',
                        color: '#F4ECE3',
                      }}
                    >
                      {pillar.badge}
                    </span>

                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        letterSpacing: '0.04em',
                        backgroundColor: 'rgba(0, 0, 0, 0.28)',
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
                        width: '58px',
                        height: '58px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        marginBottom: '10px',
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
                        color: 'rgba(243, 238, 233, 0.72)',
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
                        color: '#FFFFFF',
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
                        color: 'rgba(243, 238, 233, 0.85)',
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

          {/* Navigation Dots and Slide Trigger Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '28px',
            }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeIndex === 0}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                backgroundColor: isDark ? 'rgba(32, 14, 30, 0.85)' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: activeIndex === 0 ? 'default' : 'pointer',
                opacity: activeIndex === 0 ? 0.35 : 1,
                fontSize: '18px',
                transition: 'all 0.2s ease',
              }}
            >
              ‹
            </button>

            {PILLARS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  width: activeIndex === idx ? '26px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor:
                    activeIndex === idx
                      ? isDark
                        ? '#EADDCF'
                        : 'var(--color-mulberry)'
                      : isDark
                      ? 'rgba(215, 175, 210, 0.3)'
                      : 'rgba(73, 40, 61, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}

            <button
              type="button"
              aria-label="Next card"
              onClick={() => setActiveIndex((prev) => Math.min(PILLARS.length - 1, prev + 1))}
              disabled={activeIndex === PILLARS.length - 1}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                backgroundColor: isDark ? 'rgba(32, 14, 30, 0.85)' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: activeIndex === PILLARS.length - 1 ? 'default' : 'pointer',
                opacity: activeIndex === PILLARS.length - 1 ? 0.35 : 1,
                fontSize: '18px',
                transition: 'all 0.2s ease',
              }}
            >
              ›
            </button>
          </div>

          {/* --- LEARN HOW VENNZ WORKS BUTTON PLACED STRICTLY BELOW CARDS --- */}
          {onLearnHowItWorks && (
            <div style={{ textAlign: 'center', marginTop: '36px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={onLearnHowItWorks}
                style={{
                  background: isDark ? 'rgba(40, 18, 38, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                  border: isDark ? '1px solid rgba(215, 175, 210, 0.25)' : '1px solid rgba(73, 40, 61, 0.18)',
                  color: isDark ? '#FAF5EE' : 'var(--color-mulberry)',
                  padding: '12px 28px',
                  borderRadius: '999px',
                  fontSize: '14.5px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = isDark ? '#EADDCF' : 'var(--color-mulberry)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isDark
                    ? 'rgba(215, 175, 210, 0.25)'
                    : 'rgba(73, 40, 61, 0.18)';
                }}
              >
                Learn How VennZ Works →
              </button>
            </div>
          )}
        </div>
      </div>

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
