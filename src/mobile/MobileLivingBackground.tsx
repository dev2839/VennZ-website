import React, { useRef, useEffect } from 'react';
import { useIsMobile } from './useIsMobile';
import { LivingCinematicBackground } from '../components/LivingCinematicBackground';

interface MobileLivingBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Mobile-Optimized Cinematic Video Background
 * 
 * Specifically fixes:
 * 1. Background video being half visible with blank bottom screen on mobile
 * 2. GPU lag / frame drops on mobile
 * 
 * On desktop/PC/iPad (width >= 768px), effortlessly renders the original LivingCinematicBackground.
 */
export const MobileLivingBackground: React.FC<MobileLivingBackgroundProps> = ({
  className = '',
  children,
}) => {
  const isMobile = useIsMobile(768);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isMobile]);

  // If on laptop, PC, or iPad (width >= 768px), keep the exact original component untouched!
  if (!isMobile) {
    return (
      <LivingCinematicBackground className={className}>
        {children}
      </LivingCinematicBackground>
    );
  }

  // Mobile-specific layout (< 768px)
  return (
    <div
      className={`mobile-cinematic-stage ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        backgroundColor: '#140E1C',
        overflowX: 'hidden',
      }}
    >
      {/* Fixed Full-Screen Mobile Video: Locks to viewport so it never cuts in half or leaves blank space */}
      <div
        className="cinematic-bg-video-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
          backgroundColor: '#140E1C',
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
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            opacity: 0.95,
            filter: 'brightness(105%) contrast(98%)',
          }}
        >
          <source src="/videos/auth-loop.mp4" type="video/mp4" />
          <source src="/videos/auth-bg.mp4" type="video/mp4" />
          <source
            src="/videos/Firefly%20Create%20a%20premium,%20realistic%20cinematic%20video%20from%20this%20exact%20image.%20Preserve%20the%20original%20com.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Fixed Subtle Horizon Twilight Warmth */}
      <div
        className="cinematic-horizon-glow"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: '25%',
          height: '40%',
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 65% at 50% 50%, rgba(249, 170, 173, 0.22) 0%, rgba(199, 87, 124, 0.12) 45%, transparent 80%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Fixed Balanced Dark Scrim to ensure text readability */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, rgba(20, 14, 28, 0.65) 0%, rgba(20, 14, 28, 0.45) 40%, rgba(20, 14, 28, 0.78) 100%)',
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
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
};
