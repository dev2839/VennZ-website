import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AppNotification } from '../types/discover';

export interface NotificationPopupProps {
  onNavigate?: (route: string) => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ onNavigate }) => {
  const {
    latestPopupNotification,
    dismissNotificationPopup,
    markNotificationAsRead,
    appearanceMode,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  const [activeNotif, setActiveNotif] = useState<AppNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  const durationMs = 5500;
  const timerRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  // Sync with AuthContext's latestPopupNotification
  useEffect(() => {
    if (latestPopupNotification) {
      setActiveNotif(latestPopupNotification);
      setIsVisible(true);
      setProgress(100);
      setIsHovered(false);

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }
  }, [latestPopupNotification]);

  // Smooth timer decrement with hover pause
  useEffect(() => {
    if (!isVisible || !activeNotif) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isHovered) {
      return; // Pause countdown while member is inspecting or reading
    }

    const intervalMs = 40;
    const step = (intervalMs / durationMs) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          handleDismiss();
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, activeNotif, isHovered]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => {
      dismissNotificationPopup();
      setActiveNotif(null);
    }, 320);
  };

  const handleClickCard = () => {
    if (!activeNotif) return;
    if (activeNotif.id) {
      markNotificationAsRead(activeNotif.id);
    }
    if (activeNotif.targetRoute && onNavigate) {
      onNavigate(activeNotif.targetRoute);
    }
    handleDismiss();
  };

  if (!activeNotif) return null;

  // Render contextual icon matching category
  const renderCategoryIcon = (category?: string, type?: string) => {
    const cat = (category || type || '').toUpperCase();

    if (cat.includes('MATCH')) {
      // Overlapping Venn circles
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="12" r="6" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.6" />
          <circle cx="15" cy="12" r="6" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.6" />
        </svg>
      );
    }

    if (cat.includes('ELEVATE') || cat.includes('MEMBERSHIP')) {
      // Minimalist crown
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 17L3 7L8 11L12 5L16 11L21 7L20 17H4Z"
            stroke={isDark ? '#F9AAAD' : '#A1525F'}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <line x1="4" y1="19" x2="20" y2="19" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    }

    if (cat.includes('MIXER')) {
      // Minimalist cocktail / gathering glass
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 5L12 12L18 5H6Z" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="12" y1="12" x2="12" y2="19" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="9" y1="19" x2="15" y2="19" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    }

    if (cat.includes('REQUEST')) {
      // Heart silhouette
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke={isDark ? '#F9AAAD' : '#A1525F'}
            strokeWidth="1.6"
            fill={isDark ? 'rgba(249, 170, 173, 0.12)' : 'rgba(161, 82, 95, 0.08)'}
          />
        </svg>
      );
    }

    // Default: VennZ luxury 4-point sparkle star
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isDark ? '#F9AAAD' : '#A1525F'}>
        <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
      </svg>
    );
  };

  const categoryLabel = (activeNotif.category || activeNotif.type || 'NOTIFICATION').toUpperCase();

  return (
    <aside
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 1500,
        maxWidth: '420px',
        width: 'calc(100vw - 32px)',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-14px) scale(0.97)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        cursor: activeNotif.targetRoute ? 'pointer' : 'default',
        boxSizing: 'border-box',
      }}
      onClick={handleClickCard}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '18px',
          backgroundColor: isDark ? 'rgba(22, 13, 28, 0.92)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: isDark ? '1px solid rgba(249, 170, 173, 0.22)' : '1px solid rgba(161, 82, 95, 0.18)',
          boxShadow: isDark
            ? '0 20px 48px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(161, 82, 95, 0.2)'
            : '0 20px 48px -10px rgba(70, 32, 55, 0.16), 0 0 0 1px rgba(161, 82, 95, 0.12)',
          padding: '16px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Top Header Row: Category Badge + Timestamp + Close Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#F9AAAD' : '#A1525F',
                boxShadow: isDark ? '0 0 8px rgba(249, 170, 173, 0.8)' : '0 0 8px rgba(161, 82, 95, 0.5)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: isDark ? '#F9AAAD' : '#A1525F',
              }}
            >
              {categoryLabel}
            </span>
            <span style={{ fontSize: '10px', color: isDark ? '#8A7A84' : '#A38E9B' }}>•</span>
            <span style={{ fontSize: '11px', color: isDark ? '#D4A2AC' : '#8A7A84' }}>
              {activeNotif.timestamp || 'Just now'}
            </span>
          </div>

          {/* Minimalist Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            aria-label="Dismiss notification"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: isDark ? '#B3A1A8' : '#8A7A84',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(70, 32, 55, 0.06)';
              e.currentTarget.style.color = isDark ? '#FFFFFF' : '#140E1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isDark ? '#B3A1A8' : '#8A7A84';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body: Icon + Title + Description */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          {/* Circular Category Monogram */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(253, 243, 245, 0.95)',
              border: isDark ? '1px solid rgba(249, 170, 173, 0.25)' : '1px solid rgba(199, 87, 124, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(70, 32, 55, 0.06)',
            }}
          >
            {renderCategoryIcon(activeNotif.category, activeNotif.type)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px',
                fontWeight: 600,
                color: isDark ? '#FFFFFF' : '#140E1C',
                margin: '0 0 3px 0',
                lineHeight: '1.35',
                letterSpacing: '-0.01em',
              }}
            >
              {activeNotif.title}
            </h4>
            <p
              style={{
                fontSize: '12.5px',
                lineHeight: '1.45',
                color: isDark ? '#D4A2AC' : '#683A46',
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {activeNotif.message}
            </p>
          </div>
        </div>

        {/* Bottom Action Footer if Target Route Exists */}
        {activeNotif.targetRoute && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              paddingTop: '4px',
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: isDark ? '#F9AAAD' : '#A1525F',
                letterSpacing: '0.02em',
              }}
            >
              Open details →
            </span>
          </div>
        )}

        {/* Tactile Minimalist Progress Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(70, 32, 55, 0.05)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #A1525F 0%, #C7577C 50%, #F9AAAD 100%)',
              transition: isHovered ? 'none' : 'width 0.04s linear',
              borderRadius: progress >= 99 ? '0 0 18px 18px' : '0 0 0 18px',
            }}
          />
        </div>
      </div>
    </aside>
  );
};
