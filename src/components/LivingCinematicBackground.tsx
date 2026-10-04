import React from 'react';

interface LivingCinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * LivingCinematicBackground
 * A refined, living atmospheric background designed specifically for VennZ.
 * - Wind-blowing motion on tropical palm trees: natural sway and frond flexion (zero watery distortion)
 * - Flowing water effect: smooth horizontal tidal current and wave reflection flow across coastal waters
 * - Seamless edge-to-edge canvas with ZERO rectangular artifacts or seam lines behind text
 * - Bright, illuminated twilight landscape with warm dusk glow
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
        /* Slow ambient camera breathing */
        @keyframes subtleCameraFloat {
          0% {
            transform: scale(1.02) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.045) translate3d(-0.3%, -0.2%, 0);
          }
          100% {
            transform: scale(1.025) translate3d(0.2%, 0.15%, 0);
          }
        }

        /* Trees moving naturally in a slow blowing breeze (NO watery distortion) */
        @keyframes treeBreezeWind {
          0% {
            transform: rotate(0deg) skewX(0deg) translate3d(0, 0, 0);
          }
          22% {
            transform: rotate(1.8deg) skewX(1.3deg) translate3d(3.5px, 1.2px, 0);
          }
          48% {
            transform: rotate(-1.2deg) skewX(-0.9deg) translate3d(-2.2px, -0.6px, 0);
          }
          72% {
            transform: rotate(1.3deg) skewX(0.8deg) translate3d(2.4px, 0.8px, 0);
          }
          88% {
            transform: rotate(-0.5deg) skewX(-0.4deg) translate3d(-1px, 0, 0);
          }
          100% {
            transform: rotate(0deg) skewX(0deg) translate3d(0, 0, 0);
          }
        }

        /* Secondary fronds fluttering in wind gusts */
        @keyframes frondGustWind {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          25% {
            transform: rotate(1.5deg) translate3d(2.5px, 0.6px, 0);
          }
          52% {
            transform: rotate(-1.0deg) translate3d(-1.8px, -0.4px, 0);
          }
          78% {
            transform: rotate(1.1deg) translate3d(1.4px, 0.4px, 0);
          }
          100% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
        }

        /* Natural flowing water current effect across the ocean surface */
        @keyframes oceanCurrentFlow {
          0% {
            background-position: 0px 0%, 0px 50%;
            opacity: 0.28;
          }
          50% {
            background-position: 140px 10px, -90px 48%;
            opacity: 0.42;
          }
          100% {
            background-position: 280px 0%, -180px 50%;
            opacity: 0.28;
          }
        }

        /* Gentle tidal swell flow */
        @keyframes waterTidalSwell {
          0% {
            transform: translate3d(0, 0, 0) scaleY(1);
          }
          40% {
            transform: translate3d(2px, -2.5px, 0) scaleY(1.018);
          }
          75% {
            transform: translate3d(-1.5px, 2px, 0) scaleY(0.99);
          }
          100% {
            transform: translate3d(0, 0, 0) scaleY(1);
          }
        }

        /* Horizon twilight warmth breathing */
        @keyframes twilightHorizonGlow {
          0% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.42;
          }
          100% {
            opacity: 0.25;
          }
        }

        .cinematic-bg-photo {
          animation: subtleCameraFloat 42s ease-in-out infinite alternate;
          will-change: transform;
        }

        .tree-wind-layer {
          animation: treeBreezeWind 8.5s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          transform-origin: 12% 12%;
          will-change: transform;
        }

        .frond-wind-layer {
          animation: frondGustWind 5.8s cubic-bezier(0.35, 0.1, 0.45, 1) infinite;
          transform-origin: 10% 20%;
          will-change: transform;
        }

        .water-flow-sheen {
          animation: oceanCurrentFlow 16s linear infinite;
          will-change: background-position, opacity;
        }

        .water-flow-swell {
          animation: waterTidalSwell 9s ease-in-out infinite;
          will-change: transform;
        }

        .horizon-glow-layer {
          animation: twilightHorizonGlow 12s ease-in-out infinite alternate;
          will-change: opacity;
        }
      `}</style>

      {/* Layer 1: Base high-resolution continuous photograph covering entire viewport */}
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
            filter: 'brightness(128%) contrast(106%) saturate(120%)',
          }}
        />
      </div>

      {/* Layer 2: PALM TREES SWAYING IN THE WIND (Clean physical breeze sway, NO watery distortion) */}
      <div
        className="tree-wind-layer"
        style={{
          position: 'absolute',
          top: '-25px',
          left: '-25px',
          width: '56vw',
          height: '75vh',
          zIndex: 2,
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
            filter: 'brightness(128%) contrast(106%) saturate(120%)',
          }}
        />
      </div>

      {/* Layer 3: FRONDS WIND GUST FLUTTER (Tip leaves flutter naturally with wind gusts) */}
      <div
        className="frond-wind-layer"
        style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '42vw',
          height: '52vh',
          zIndex: 3,
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
            filter: 'brightness(128%) contrast(106%) saturate(120%)',
          }}
        />
      </div>

      {/* Layer 4: NATURAL WATER FLOW EFFECT (Smooth horizontal tidal current & flowing waves) */}
      <div
        className="water-flow-swell"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '50%',
          zIndex: 4,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to top, black 0%, black 55%, rgba(0,0,0,0.6) 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, black 55%, rgba(0,0,0,0.6) 80%, transparent 100%)',
        }}
      >
        {/* Flowing current highlights */}
        <div
          className="water-flow-sheen"
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(ellipse 90% 18% at 48% 30%, rgba(249, 170, 173, 0.4) 0%, transparent 70%),
              radial-gradient(ellipse 95% 12% at 52% 65%, rgba(199, 87, 124, 0.3) 0%, transparent 75%),
              repeating-linear-gradient(90deg, rgba(249, 170, 173, 0.14) 0px, transparent 35px, rgba(199, 87, 124, 0.12) 70px, transparent 110px)
            `,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Layer 5: Horizon Twilight Warmth Glow (Soft radial ambient light, NO hard edges) */}
      <div
        className="horizon-glow-layer"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '35%',
          height: '30%',
          zIndex: 5,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(249, 170, 173, 0.32) 0%, rgba(199, 87, 124, 0.22) 40%, transparent 80%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 6: Soft Vignette & Backlight Shading (100% seamless, NO horizontal bands) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 82% 50%, rgba(20, 14, 28, 0.46) 0%, rgba(20, 14, 28, 0.18) 48%, transparent 75%),
            linear-gradient(to bottom, rgba(20, 14, 28, 0.18) 0%, transparent 18%, transparent 82%, rgba(20, 14, 28, 0.42) 100%)
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
