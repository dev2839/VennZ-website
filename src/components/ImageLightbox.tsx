import React, { useEffect } from 'react';

export interface LightboxImage {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
}

interface ImageLightboxProps {
  isOpen: boolean;
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1 && onNavigate) {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && images.length > 1 && onNavigate) {
        onNavigate((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling while lightbox is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, images.length, currentIndex, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate && images.length > 1) {
      onNavigate((currentIndex - 1 + images.length) % images.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate && images.length > 1) {
      onNavigate((currentIndex + 1) % images.length);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 2, 4, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      {/* Top Bar: Title & Close Button */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          padding: '8px 12px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              letterSpacing: '0.1em',
              color: 'var(--color-warm-porcelain)',
              textTransform: 'uppercase',
            }}
          >
            {currentImage.title || 'VennZ'}
          </span>
          {currentImage.subtitle && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--color-dusty-lilac)',
                borderLeft: '1px solid rgba(243, 238, 233, 0.2)',
                paddingLeft: '12px',
              }}
            >
              {currentImage.subtitle}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {images.length > 1 && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'rgba(243, 238, 233, 0.65)',
                letterSpacing: '0.05em',
              }}
            >
              {currentIndex + 1} / {images.length}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(243, 238, 233, 0.2)',
              color: 'var(--color-warm-porcelain)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Center Image Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          height: 'calc(100vh - 160px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Image"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(18, 14, 17, 0.75)',
              border: '1px solid rgba(243, 238, 233, 0.25)',
              color: 'var(--color-warm-porcelain)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(73, 40, 61, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(18, 14, 17, 0.75)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* The Full Image */}
        <img
          src={currentImage.src}
          alt={currentImage.alt || 'Full View'}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
            userSelect: 'none',
            animation: 'fadeIn 0.25s ease-out',
          }}
        />

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Image"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(18, 14, 17, 0.75)',
              border: '1px solid rgba(243, 238, 233, 0.25)',
              color: 'var(--color-warm-porcelain)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(73, 40, 61, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(18, 14, 17, 0.75)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '90vw',
            overflowX: 'auto',
            padding: '8px 12px',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate && onNavigate(idx)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  padding: 0,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-peach-blush)' : '1px solid rgba(243, 238, 233, 0.2)',
                  opacity: isSelected ? 1 : 0.6,
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  backgroundColor: '#000',
                  flexShrink: 0,
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
