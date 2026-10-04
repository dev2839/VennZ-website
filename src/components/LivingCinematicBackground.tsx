import React, { useRef, useEffect } from 'react';

interface LivingCinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * LivingCinematicBackground
 * Renders the realistic cinematic video from the user's video folder
 * seamlessly behind the sign-up/authentication experience.
 *
 * Configured with elegant translucency and high-contrast dark scrim so that
 * all foreground typography, navigation, and cards are crystal-clear and readable.
 */
export const LivingCinematicBackground: React.FC<LivingCinematicBackgroundProps> = ({
  className = '',
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Guarantee seamless video playback across all browsers and devices
  useEffect(() => {
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };
    playVideo();
  }, []);

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
        /* Very subtle ambient pulse on the horizon glow */
        @keyframes twilightHorizonGlow {
          0% {
            opacity: 0.22;
          }
          50% {
            opacity: 0.38;
          }
          100% {
            opacity: 0.22;
          }
        }

        .cinematic-horizon-glow {
          animation: twilightHorizonGlow 14s ease-in-out infinite alternate;
          will-change: opacity;
        }

        .cinematic-bg-video-track {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 42%;
          display: block;
          opacity: 0.96;
          filter: brightness(109%) contrast(98%) saturate(112%) blur(0.52px);
          transform: scale(1.025) translateZ(0);
          will-change: transform;
        }
      `}</style>

      {/* Layer 1: Seamless Infinitely Continuous Living Cinematic Video (Zero loop cut / restart hitch) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <video
          ref={videoRef}
          className="cinematic-bg-video-track"
          autoPlay
          loop
          muted
          playsInline
          poster="/auth-twilight.jpg"
          preload="auto"
        >
          <source src="/videos/auth-loop.mp4" type="video/mp4" />
          <source src="/videos/auth-bg.mp4" type="video/mp4" />
          <source
            src="/videos/Firefly%20Create%20a%20premium,%20realistic%20cinematic%20video%20from%20this%20exact%20image.%20Preserve%20the%20original%20com.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Layer 2: Subtle Horizon Twilight Warmth */}
      <div
        className="cinematic-horizon-glow"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '32%',
          height: '35%',
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(249, 170, 173, 0.28) 0%, rgba(199, 87, 124, 0.16) 45%, transparent 80%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 3: Balanced Feathered Scrim (Preserves Full Video Luminosity with Clear Text Readability) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: `
            /* Left zone scrim: subtle protection behind typography, letting the living sunset motion shine */
            linear-gradient(to right, rgba(20, 14, 28, 0.52) 0%, rgba(20, 14, 28, 0.2) 36%, transparent 62%),
            /* Right zone halo: subtle backing behind the frosted glass auth panel */
            radial-gradient(ellipse at 82% 50%, rgba(20, 14, 28, 0.38) 0%, transparent 68%),
            /* Gentle top & bottom framing */
            linear-gradient(to bottom, rgba(20, 14, 28, 0.38) 0%, transparent 16%, transparent 82%, rgba(20, 14, 28, 0.48) 100%)
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
