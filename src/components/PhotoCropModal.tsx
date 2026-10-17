import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ModalPortal } from './ModalPortal';
import { RotateCw, ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

interface PhotoCropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onSave: (croppedDataUrl: string) => void;
  onClose: () => void;
  isDark?: boolean;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  imageSrc,
  isOpen,
  onSave,
  onClose,
  isDark = false,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset when image changes or opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle Touch Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset framing
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Perform canvas crop in 3:4 aspect ratio (900x1200)
  const handleApply = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const canvas = document.createElement('canvas');
    const targetWidth = 900;
    const targetHeight = 1200; // 3:4 ratio
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerRect = container.getBoundingClientRect();
    const cropWidth = containerRect.width;
    const cropHeight = containerRect.height;

    // Background fill
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Compute transformation matrix
    ctx.save();
    // Center canvas
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Translation relative to target canvas size
    const factorX = targetWidth / cropWidth;
    const factorY = targetHeight / cropHeight;

    ctx.translate(position.x * factorX, position.y * factorY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Natural image dimensions
    const isRotatedSideways = rotation === 90 || rotation === 270;
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    // Draw scaled to fit container naturally
    const imgAspect = naturalW / naturalH;
    const containerAspect = cropWidth / cropHeight;

    let drawW: number;
    let drawH: number;

    if (imgAspect > containerAspect) {
      drawH = targetHeight;
      drawW = targetHeight * imgAspect;
    } else {
      drawW = targetWidth;
      drawH = targetWidth / imgAspect;
    }

    if (isRotatedSideways) {
      // Adjust draw dimensions when 90 or 270
      const tmp = drawW;
      drawW = drawH;
      drawH = tmp;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    try {
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onSave(croppedDataUrl);
      onClose();
    } catch {
      // Fallback
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(10, 5, 9, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-crop-title"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
            borderRadius: '24px',
            border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(161, 82, 95, 0.2)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: isDark ? '#FDF3F5' : '#462037',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 20px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: isDark ? '1px solid rgba(161, 82, 95, 0.2)' : '1px solid rgba(161, 82, 95, 0.12)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  display: 'block',
                  marginBottom: '2px',
                }}
              >
                PORTRAIT FRAMING (3:4)
              </span>
              <h3
                id="photo-crop-title"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  fontWeight: 500,
                  margin: 0,
                  color: isDark ? '#FDF3F5' : '#462037',
                }}
              >
                Adjust Your Photo
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? '#B3A1A8' : '#8A7A84',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Viewport & Viewfinder */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: isDark ? '#120810' : '#F6EEF0',
            }}
          >
            {/* Viewfinder Container (Exact 3:4 Aspect Ratio) */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                position: 'relative',
                width: '240px',
                height: '320px', // 3:4 aspect ratio
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                border: '2px solid rgba(199, 87, 124, 0.45)',
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              {/* Image with transform */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Framing preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
              />

              {/* Rule-of-thirds Overlay Guides */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.2)', borderBottom: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.2)', borderBottom: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.2)', borderBottom: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.2)', borderBottom: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.2)' }} />
                <div />
              </div>

              {/* Drag Hint Pill */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  pointerEvents: 'none',
                }}
              >
                <Move size={10} />
                <span>Drag to reposition</span>
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                color: isDark ? '#B3A1A8' : '#8A7A84',
                marginTop: '10px',
                textAlign: 'center',
              }}
            >
              Framed as seen by members on the Discover cards
            </span>
          </div>

          {/* Controls Bar */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Zoom Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(1, +(s - 0.1).toFixed(2)))}
                aria-label="Zoom out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <ZoomOut size={17} />
              </button>
              <input
                type="range"
                min="1"
                max="2.6"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#A1525F',
                  cursor: 'pointer',
                }}
              />
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2.6, +(s + 0.1).toFixed(2)))}
                aria-label="Zoom in"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <ZoomIn size={17} />
              </button>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  width: '38px',
                  textAlign: 'right',
                  color: isDark ? '#D4A2AC' : '#683A46',
                }}
              >
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <button
                type="button"
                onClick={handleRotate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(161, 82, 95, 0.2)',
                  backgroundColor: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(250, 241, 243, 0.8)',
                  color: isDark ? '#FDF3F5' : '#462037',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={13} />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isDark ? '#B3A1A8' : '#8A7A84',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div
            style={{
              padding: '14px 20px 18px',
              display: 'flex',
              gap: '10px',
              borderTop: isDark ? '1px solid rgba(161, 82, 95, 0.2)' : '1px solid rgba(161, 82, 95, 0.12)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '999px',
                border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(161, 82, 95, 0.2)',
                backgroundColor: 'transparent',
                color: isDark ? '#FDF3F5' : '#462037',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                flex: 1.6,
                padding: '12px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(161, 82, 95, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check size={16} />
              <span>Apply Framing</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
