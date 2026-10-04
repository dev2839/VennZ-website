import React from 'react';

interface LivingCinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * LivingCinematicBackground
 * A bespoke, living atmospheric background designed specifically for VennZ.
 * Features vivid, natural motion:
 * - Floating, undulating living water with liquid surface swell & specular wave crests
 * - Tropical palm trees and fronds swaying naturally in a slow evening sea breeze
 * - Horizon twilight warmth breathing along the dusk coast
 * - High-altitude atmospheric drift
 * - Strict VennZ color palette grading (#140E1C, #462037, #683A46, #A1525F, #C7577C, #F9AAAD)
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
      {/* SVG Liquid & Breeze Displacement Filters */}
      <svg
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          pointerEvents: 'none',
          opacity: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Water liquid undulation filter */}
          <filter id="water-wave-displacement" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.045"
              numOctaves="2"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="10s"
                values="0.01 0.035; 0.015 0.06; 0.012 0.045; 0.01 0.035"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Tree leaves breeze sway filter */}
          <filter id="tree-breeze-displacement" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015 0.008"
              numOctaves="2"
              result="windTurbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="8s"
                values="0.012 0.006; 0.022 0.014; 0.016 0.009; 0.012 0.006"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="windTurbulence"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <style>{`
        /* Slow cinematic camera drift */
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

        /* Water surface floating & gentle liquid swell */
        @keyframes waterSurfaceFloat {
          0% {
            transform: translateY(0px) scale(1.02, 1);
          }
          30% {
            transform: translateY(-4px) scale(1.025, 1.015);
          }
          65% {
            transform: translateY(3px) scale(1.018, 0.99);
          }
          100% {
            transform: translateY(0px) scale(1.02, 1);
          }
        }

        /* Specular twilight reflections & moving caustics across water */
        @keyframes waterCausticsDrift {
          0% {
            background-position: 0px 0px, 0px 100%;
            opacity: 0.22;
          }
          50% {
            background-position: 60px 10px, 140px 92%;
            opacity: 0.36;
          }
          100% {
            background-position: 120px 0px, 280px 100%;
            opacity: 0.22;
          }
        }

        /* Palm trees and branches swaying naturally in a slow breeze */
        @keyframes treeBreezeMain {
          0% {
            transform: rotate(0deg) skewX(0deg) translate3d(0, 0, 0);
          }
          28% {
            transform: rotate(1.6deg) skewX(1.1deg) translate3d(3px, 1.5px, 0);
          }
          60% {
            transform: rotate(-1.1deg) skewX(-0.8deg) translate3d(-2px, -1px, 0);
          }
          82% {
            transform: rotate(0.8deg) skewX(0.5deg) translate3d(1.8px, 0.8px, 0);
          }
          100% {
            transform: rotate(0deg) skewX(0deg) translate3d(0, 0, 0);
          }
        }

        /* Secondary leaf fronds flutter (responsive to wind gusts) */
        @keyframes frondWindGust {
          0% {
            transform: rotate(0deg) scale(1) translate3d(0, 0, 0);
          }
          22% {
            transform: rotate(1.2deg) scale(1.008) translate3d(2.2px, 0.8px, 0);
          }
          50% {
            transform: rotate(-0.7deg) scale(0.998) translate3d(-1.5px, -0.5px, 0);
          }
          75% {
            transform: rotate(0.9deg) scale(1.004) translate3d(1.2px, 0.4px, 0);
          }
          100% {
            transform: rotate(0deg) scale(1) translate3d(0, 0, 0);
          }
        }

        /* Horizon twilight warmth breathing */
        @keyframes twilightHorizonBreathe {
          0% {
            opacity: 0.2;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.35;
            transform: scaleY(1.1);
          }
          100% {
            opacity: 0.2;
            transform: scaleY(1);
          }
        }

        /* Sky cloud atmospheric drift */
        @keyframes cloudAtmosphereDrift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(3.5%, 0, 0);
          }
        }

        .cinematic-bg-photo {
          animation: subtleCameraFloat 42s ease-in-out infinite alternate;
          will-change: transform;
        }

        .water-floating-layer {
          animation: waterSurfaceFloat 7.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          filter: url(#water-wave-displacement);
          will-change: transform, filter;
        }

        .water-caustics-layer {
          animation: waterCausticsDrift 14s ease-in-out infinite;
          will-change: opacity, background-position;
        }

        .tree-breeze-layer {
          animation: treeBreezeMain 8.2s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          transform-origin: 15% 15%;
          filter: url(#tree-breeze-displacement);
          will-change: transform, filter;
        }

        .frond-flutter-layer {
          animation: frondWindGust 5.6s cubic-bezier(0.35, 0.1, 0.45, 1) infinite;
          transform-origin: 10% 25%;
          will-change: transform;
        }

        .horizon-breathe-layer {
          animation: twilightHorizonBreathe 12s ease-in-out infinite alternate;
          will-change: opacity, transform;
        }

        .cloud-drift-layer {
          animation: cloudAtmosphereDrift 80s linear infinite alternate;
          will-change: transform;
        }
      `}</style>

      {/* Layer 1: Base high-resolution photograph with slow camera drift */}
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

      {/* Layer 2: FLOATING & UNDULATING WATER LAYER (Bottom 48% of the image) */}
      <div
        className="water-floating-layer"
        style={{
          position: 'absolute',
          left: '-20px',
          right: '-20px',
          bottom: '-15px',
          height: '52%',
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 10%, black 28%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 10%, black 28%, black 100%)',
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
            position: 'absolute',
            bottom: 0,
            left: '20px',
            display: 'block',
            filter: 'contrast(106%) saturate(110%)',
          }}
        />
      </div>

      {/* Layer 3: WATER CAUSTICS & SPECULAR WAVE CRESTS (Glistening twilight ripples) */}
      <div
        className="water-caustics-layer"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '46%',
          zIndex: 3,
          pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(ellipse 85% 14% at 48% 28%, rgba(249, 170, 173, 0.28) 0%, transparent 68%),
            radial-gradient(ellipse 95% 10% at 52% 55%, rgba(199, 87, 124, 0.2) 0%, transparent 72%),
            repeating-linear-gradient(180deg, rgba(249, 170, 173, 0.12) 0px, transparent 4px, rgba(161, 82, 95, 0.08) 7px, transparent 15px)
          `,
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 4: PRIMARY PALM TREES & BREEZE SWAY (Top-left & Left foliage) */}
      <div
        className="tree-breeze-layer"
        style={{
          position: 'absolute',
          top: '-25px',
          left: '-25px',
          width: '56vw',
          height: '75vh',
          zIndex: 4,
          pointerEvents: 'none',
          overflow: 'hidden',
          maskImage: 'radial-gradient(ellipse at 15% 25%, black 45%, rgba(0,0,0,0.7) 70%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 15% 25%, black 45%, rgba(0,0,0,0.7) 70%, transparent 88%)',
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
            filter: 'contrast(108%) brightness(99%)',
          }}
        />
      </div>

      {/* Layer 5: SECONDARY FROND FLUTTER (Tip leaves flutter with wind gusts) */}
      <div
        className="frond-flutter-layer"
        style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '42vw',
          height: '52vh',
          zIndex: 5,
          pointerEvents: 'none',
          overflow: 'hidden',
          maskImage: 'radial-gradient(ellipse at 25% 18%, rgba(0,0,0,0.85) 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 25% 18%, rgba(0,0,0,0.85) 20%, transparent 75%)',
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
            filter: 'contrast(106%)',
          }}
        />
      </div>

      {/* Layer 6: Horizon Twilight Glow (Warm blush & rose breathing along coastline) */}
      <div
        className="horizon-breathe-layer"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '38%',
          height: '24%',
          zIndex: 6,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 48% 50%, rgba(249, 170, 173, 0.26) 0%, rgba(199, 87, 124, 0.2) 35%, rgba(70, 32, 55, 0) 75%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 7: High-altitude twilight cloud drift */}
      <div
        className="cloud-drift-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: '-5%',
          width: '110%',
          height: '40%',
          zIndex: 7,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 40% at 65% 15%, rgba(161, 82, 95, 0.14) 0%, rgba(70, 32, 55, 0) 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 8: Cinematic Color Grading Vignette (Pure VennZ luxury palette integration) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 8,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 75% 50%, rgba(20, 14, 28, 0.28) 0%, rgba(20, 14, 28, 0.7) 75%, rgba(20, 14, 28, 0.92) 100%),
            linear-gradient(to bottom, rgba(20, 14, 28, 0.65) 0%, rgba(70, 32, 55, 0.12) 30%, rgba(20, 14, 28, 0.4) 80%, rgba(20, 14, 28, 0.9) 100%),
            linear-gradient(to right, rgba(20, 14, 28, 0.4) 0%, transparent 50%, rgba(20, 14, 28, 0.65) 100%)
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
