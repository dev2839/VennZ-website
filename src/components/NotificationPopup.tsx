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

  const durationMs = 5000;
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
    }, 280);
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

  // Render compact contextual icon matching category
  const renderCategoryIcon = (category?: string, type?: string) => {
    const cat = (category || type || '').toUpperCase();

    if (cat.includes('MATCH')) {
      // Overlapping Venn circles
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="12" r="6" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.8" />
          <circle cx="15" cy="12" r="6" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.8" />
        </svg>
      );
    }

    if (cat.includes('ELEVATE') || cat.includes('MEMBERSHIP')) {
      // Minimalist crown
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 17L3 7L8 11L12 5L16 11L21 7L20 17H4Z"
            stroke={isDark ? '#F9AAAD' : '#A1525F'}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (cat.includes('MIXER')) {
      // Minimalist cocktail / gathering glass
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M6 5L12 12L18 5H6Z" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="12" y1="12" x2="12" y2="19" stroke={isDark ? '#F9AAAD' : '#A1525F'} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (cat.includes('REQUEST')) {
      // Heart silhouette
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke={isDark ? '#F9AAAD' : '#A1525F'}
            strokeWidth="1.8"
            fill={isDark ? 'rgba(249, 170, 173, 0.15)' : 'rgba(161, 82, 95, 0.1)'}
          />
        </svg>
      );
    }

    // Default: VennZ luxury 4-point sparkle star
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill={isDark ? '#F9AAAD' : '#A1525F'}>
        <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
      </svg>
    );
  };

  const categoryLabel = (activeNotif.category || activeNotif.type || 'VENNZ').toUpperCase();

  return (
    <aside
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        top: '76px',
        right: '20px',
        zIndex: 1500,
        maxWidth: '320px',
        width: 'calc(100vw - 36px)',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        cursor: activeNotif.targetRoute ? 'pointer' : 'default',
        boxSizing: 'border-box',
      }}
      onClick={handleClickCard}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '14px',
          backgroundColor: isDark ? 'rgba(22, 13, 28, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isDark ? '1px solid rgba(249, 170, 173, 0.2)' : '1px solid rgba(161, 82, 95, 0.16)',
          boxShadow: isDark
            ? '0 12px 32px -6px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(161, 82, 95, 0.15)'
            : '0 12px 32px -6px rgba(70, 32, 55, 0.12), 0 0 0 1px rgba(161, 82, 95, 0.08)',
          padding: '10px 12px 11px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Compact Circular Icon Badge */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(253, 243, 245, 0.95)',
            border: isDark ? '1px solid rgba(249, 170, 173, 0.22)' : '1px solid rgba(199, 87, 124, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {renderCategoryIcon(activeNotif.category, activeNotif.type)}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Micro Category Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isDark ? '#F9AAAD' : '#A1525F',
              }}
            >
              {categoryLabel}
            </span>
            <span style={{ fontSize: '9px', color: isDark ? '#8A7A84' : '#A38E9B' }}>•</span>
            <span style={{ fontSize: '9.5px', color: isDark ? '#D4A2AC' : '#8A7A84' }}>
              {activeNotif.timestamp || 'Just now'}
            </span>
          </div>

          {/* Title */}
          <h4
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#140E1C',
              margin: 0,
              lineHeight: '1.25',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeNotif.title}
          </h4>

          {/* Message (single line or tight two lines) */}
          <p
            style={{
              fontSize: '11px',
              lineHeight: '1.3',
              color: isDark ? '#D4A2AC' : '#683A46',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {activeNotif.message}
          </p>
        </div>

        {/* Minimalist Close Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          aria-label="Dismiss notification"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            color: isDark ? '#B3A1A8' : '#8A7A84',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            flexShrink: 0,
            padding: 0,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDark ? '#FFFFFF' : '#140E1C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? '#B3A1A8' : '#8A7A84';
          }}
        >
          ✕
        </button>

        {/* Tactile Razor-thin Progress Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '1.5px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(70, 32, 55, 0.04)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #A1525F 0%, #C7577C 50%, #F9AAAD 100%)',
              transition: isHovered ? 'none' : 'width 0.04s linear',
              borderRadius: progress >= 99 ? '0 0 14px 14px' : '0 0 0 14px',
            }}
          />
        </div>
      </div>
    </aside>
  );
};
