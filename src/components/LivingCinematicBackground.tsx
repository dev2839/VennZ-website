import React from 'react';

interface LivingCinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * LivingCinematicBackground
 * A bespoke, living atmospheric background designed specifically for VennZ.
 * Incorporates ultra-subtle, natural living motion:
 * - Ultra-slow 34s cinematic camera breath
 * - Gentle organic evening breeze swaying palm fronds on the left
 * - Slow rhythmic specular water ripple reflection across the coast
 * - Soft breathing twilight horizon glow in the VennZ palette (#140E1C, #462037, #A1525F, #C7577C, #F9AAAD)
 * - Zero artificial AI artifacts, hyper-refined for luxury feel.
 */
export const LivingCinematicBackground: React.FC<LivingCinematicBackgroundProps> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`living-cinematic-stage ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#140E1C',
      }}
    >
      <style>{`
        /* Slow camera float */
        @keyframes subtleCameraFloat {
          0% {
            transform: scale(1.02) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.05) translate3d(-0.4%, -0.3%, 0);
          }
          100% {
            transform: scale(1.03) translate3d(0.3%, 0.2%, 0);
          }
        }

        /* Palm fronds natural breeze sway (top-left) */
        @keyframes gentlePalmBreeze {
          0% {
            transform: rotate(0deg) skewX(0deg) scale(1);
          }
          35% {
            transform: rotate(0.4deg) skewX(0.25deg) scale(1.002);
          }
          70% {
            transform: rotate(-0.35deg) skewX(-0.2deg) scale(0.999);
          }
          100% {
            transform: rotate(0deg) skewX(0deg) scale(1);
          }
        }

        /* Water surface micro-ripple & dusk reflection */
        @keyframes waterSpecularDrift {
          0% {
            background-position: 0% 0%, 0% 100%;
            opacity: 0.14;
          }
          50% {
            background-position: 40px 8px, 120px 96%;
            opacity: 0.22;
          }
          100% {
            background-position: 80px 0%, 240px 100%;
            opacity: 0.14;
          }
        }

        /* Horizon twilight warmth breathing */
        @keyframes twilightHorizonBreathe {
          0% {
            opacity: 0.16;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.28;
            transform: scaleY(1.08);
          }
          100% {
            opacity: 0.16;
            transform: scaleY(1);
          }
        }

        /* Subtle dusk cloud atmospheric drift */
        @keyframes cloudAtmosphereDrift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(3%, 0, 0);
          }
        }

        .cinematic-bg-photo {
          animation: subtleCameraFloat 38s ease-in-out infinite alternate;
          will-change: transform;
        }

        .palm-breeze-overlay {
          animation: gentlePalmBreeze 11s ease-in-out infinite;
          transform-origin: top left;
          will-change: transform;
        }

        .water-ripple-layer {
          animation: waterSpecularDrift 18s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: opacity, background-position;
        }

        .horizon-breathe-layer {
          animation: twilightHorizonBreathe 14s ease-in-out infinite alternate;
          will-change: opacity, transform;
        }

        .cloud-drift-layer {
          animation: cloudAtmosphereDrift 70s linear infinite alternate;
          will-change: transform;
        }
      `}</style>

      {/* Layer 1: Base high-resolution photograph with subtle camera breathing */}
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          overflow: 'hidden',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <img
          src="/auth-twilight.jpg"
          alt="VennZ Twilight Horizon"
          className="cinematic-bg-photo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 42%',
            display: 'block',
          }}
        />
      </div>

      {/* Layer 2: Palm fronds breeze overlay (subtle animated clone masked to top-left) */}
      <div
        className="palm-breeze-overlay"
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '58vw',
          height: '65vh',
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
          maskImage: 'radial-gradient(ellipse at 15% 20%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 45%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 15% 20%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 45%, transparent 75%)',
        }}
      >
        <img
          src="/auth-twilight.jpg"
          alt=""
          aria-hidden="true"
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            objectPosition: 'center 42%',
            display: 'block',
            filter: 'contrast(105%) brightness(98%)',
          }}
        />
      </div>

      {/* Layer 3: Horizon Twilight Glow (breathing warm rose & blush along the dusk horizon) */}
      <div
        className="horizon-breathe-layer"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '38%',
          height: '24%',
          zIndex: 3,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 48% 50%, rgba(249, 170, 173, 0.22) 0%, rgba(199, 87, 124, 0.18) 35%, rgba(70, 32, 55, 0) 75%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 4: Living Water Specular Ripple Layer (masked to bottom calm ocean) */}
      <div
        className="water-ripple-layer"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '42%',
          zIndex: 4,
          pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(ellipse 90% 12% at 50% 30%, rgba(249, 170, 173, 0.16) 0%, transparent 70%),
            repeating-linear-gradient(180deg, rgba(199, 87, 124, 0.08) 0px, transparent 4px, rgba(104, 58, 70, 0.06) 8px, transparent 14px)
          `,
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 5: High-altitude twilight cloud drift */}
      <div
        className="cloud-drift-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: '-5%',
          width: '110%',
          height: '40%',
          zIndex: 5,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 40% at 65% 15%, rgba(161, 82, 95, 0.12) 0%, rgba(70, 32, 55, 0) 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 6: Cinematic Color Grading Vignette (Pure VennZ palette integration) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 75% 50%, rgba(20, 14, 28, 0.3) 0%, rgba(20, 14, 28, 0.72) 75%, rgba(20, 14, 28, 0.92) 100%),
            linear-gradient(to bottom, rgba(20, 14, 28, 0.65) 0%, rgba(70, 32, 55, 0.15) 30%, rgba(20, 14, 28, 0.45) 80%, rgba(20, 14, 28, 0.9) 100%),
            linear-gradient(to right, rgba(20, 14, 28, 0.45) 0%, transparent 50%, rgba(20, 14, 28, 0.65) 100%)
          `,
        }}
      />

      {/* Foreground Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
};
