import React, { useRef, useState, useEffect } from 'react';
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
  title: string;
  description: string;
  icon: string;
  badge: string;
  bgImage: string;
}

const PILLARS: PillarItem[] = [
  {
    title: 'Curated Introductions',
    description: 'Handpicked verified profiles aligned with your professional standards and ambitions.',
    icon: '✦',
    badge: 'DAILY CURATION',
    bgImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
  },
  {
    title: 'Rigorous Verification',
    description: 'Biometric selfie verification and background vetting ensure real, authentic members.',
    icon: '🛡️',
    badge: '100% VERIFIED',
    bgImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80',
  },
  {
    title: 'Elevate Concierge',
    description: 'Private styling, executive photography, and personalized relationship coaching.',
    icon: '👑',
    badge: 'MEMBERS ONLY',
    bgImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=700&auto=format&fit=crop&q=80',
  },
  {
    title: 'Private Mixers',
    description: 'Curated in-person gatherings in premier venues across Mumbai, Delhi, Bengaluru & Pune.',
    icon: '🍸',
    badge: 'SECRET VENUES',
    bgImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&auto=format&fit=crop&q=80',
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

  // Dynamic scroll shrink state: "when user slide down the text should look small while sliding above make the image correct"
  const [scrollY, setScrollY] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleSlide = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Compute smooth dynamic scroll scale: shrinks slightly as user scrolls down, enlarges back on top
  const headerScale = Math.max(0.88, 1 - scrollY * 0.0007);
  const headerOpacity = Math.max(0.7, 1 - scrollY * 0.001);

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
        // Trending ambient shading: Light = warm cream with soft purple mist; Dark = rich midnight purple
        backgroundColor: isDark ? '#140813' : '#FAF6F0',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Trending Ambient Gradient Mesh Background with subtle purple hue */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 12%, rgba(107, 45, 102, 0.32) 0%, rgba(35, 12, 33, 0.6) 42%, rgba(20, 8, 19, 1) 100%)'
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
              ? 'radial-gradient(circle, rgba(139, 44, 116, 0.18) 0%, transparent 70%)'
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
              ? 'radial-gradient(circle, rgba(107, 45, 102, 0.2) 0%, transparent 70%)'
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
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '48px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Editorial Branding Lockup with Smooth Dynamic Scroll Zoom */}
        <div
          style={{
            marginBottom: '28px',
            textAlign: 'center',
            transform: `scale(${headerScale})`,
            opacity: headerOpacity,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <SplashBranding />
        </div>

        {/* Action Suite */}
        <div style={{ width: '100%', maxWidth: '440px', marginBottom: '56px' }}>
          <SplashActions onGetStarted={onGetStarted} onLogin={onLogin} />

          {onLearnHowItWorks && (
            <div style={{ textAlign: 'center', marginTop: '18px' }}>
              <button
                type="button"
                onClick={onLearnHowItWorks}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? 'rgba(243, 238, 233, 0.85)' : 'var(--color-mulberry)',
                  fontSize: '14.5px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Learn How VennZ Works →
              </button>
            </div>
          )}
        </div>

        {/* --- NETFLIX-STYLE SLIDING CARDS SECTION --- */}
        <div
          style={{
            width: '100%',
            maxWidth: '1240px',
            marginTop: 'auto',
            paddingTop: '20px',
          }}
        >
          {/* Section Header with Slider Navigation Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              padding: '0 8px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isDark ? '#D7AFD2' : 'var(--color-mulberry)',
                }}
              >
                DISCOVER THE EXPERIENCE
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(20px, 2.5vw, 26px)',
                  fontWeight: 500,
                  color: isDark ? 'var(--color-warm-porcelain)' : 'var(--color-mulberry)',
                  margin: '4px 0 0 0',
                }}
              >
                Why Ambitious Singles Choose VennZ
              </h3>
            </div>

            {/* Netflix-style Slider Arrows */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                aria-label="Previous card"
                onClick={() => handleSlide('left')}
                disabled={!canScrollLeft}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                  backgroundColor: isDark ? 'rgba(32, 14, 30, 0.85)' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollLeft ? 'pointer' : 'default',
                  opacity: canScrollLeft ? 1 : 0.4,
                  transition: 'opacity 0.2s ease, transform 0.15s ease',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next card"
                onClick={() => handleSlide('right')}
                disabled={!canScrollRight}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: isDark ? '1px solid rgba(243, 238, 233, 0.2)' : '1px solid rgba(73, 40, 61, 0.2)',
                  backgroundColor: isDark ? 'rgba(32, 14, 30, 0.85)' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollRight ? 'pointer' : 'default',
                  opacity: canScrollRight ? 1 : 0.4,
                  transition: 'opacity 0.2s ease, transform 0.15s ease',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                }}
              >
                ›
              </button>
            </div>
          </div>

          {/* Horizontal Netflix Slider Track */}
          <div
            ref={sliderRef}
            onScroll={updateScrollButtons}
            className="netflix-slider-track"
          >
            {PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="netflix-card"
                style={{
                  height: '340px',
                  backgroundColor: isDark ? '#1C0D1A' : '#FFFFFF',
                  border: isDark ? '1px solid rgba(215, 175, 210, 0.22)' : '1px solid rgba(73, 40, 61, 0.12)',
                  boxShadow: isDark
                    ? '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 24px rgba(107, 45, 102, 0.25)'
                    : '0 12px 32px rgba(73, 40, 61, 0.1)',
                }}
              >
                {/* Background Editorial Image */}
                <img
                  src={pillar.bgImage}
                  alt={pillar.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    transition: 'transform 0.45s ease',
                  }}
                />

                {/* Cinematic Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark
                      ? 'linear-gradient(180deg, rgba(20, 8, 19, 0.1) 0%, rgba(20, 8, 19, 0.5) 45%, rgba(16, 6, 15, 0.94) 100%)'
                      : 'linear-gradient(180deg, rgba(40, 15, 34, 0.05) 0%, rgba(40, 15, 34, 0.45) 45%, rgba(25, 8, 21, 0.92) 100%)',
                    zIndex: 2,
                  }}
                />

                {/* Top Badge & Icon */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 3,
                    padding: '18px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {pillar.badge}
                  </span>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: '#FFFFFF',
                    }}
                  >
                    {pillar.icon}
                  </div>
                </div>

                {/* Bottom Card Content */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 3,
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '21px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      margin: 0,
                      letterSpacing: '0.01em',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {pillar.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      color: 'rgba(243, 238, 233, 0.92)',
                      margin: 0,
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
