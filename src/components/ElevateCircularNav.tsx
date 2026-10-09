import React, { useState, useEffect, useRef } from 'react';

export type ElevateNavTab = 'catalog' | 'scorecard' | 'makeover' | 'orders' | 'concierge';

export interface ElevateNavItem {
  id: ElevateNavTab;
  label: string;
}

export const ELEVATE_NAV_ITEMS: ElevateNavItem[] = [
  { id: 'catalog', label: 'Offerings' },
  { id: 'scorecard', label: 'Profile Intelligence' },
  { id: 'makeover', label: 'Makeover Studio' },
  { id: 'orders', label: 'My Orders' },
  { id: 'concierge', label: 'Concierge Desk' },
];

interface ElevateCircularNavProps {
  activeTab: ElevateNavTab;
  onSelectTab: (tab: ElevateNavTab) => void;
  isDark?: boolean;
}

export const ElevateCircularNav: React.FC<ElevateCircularNavProps> = ({
  activeTab,
  onSelectTab,
  isDark = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Responsive dimensions
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );
  const [hoveredId, setHoveredId] = useState<ElevateNavTab | null>(null);

  // Check reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mql.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const isSmallMobile = windowWidth < 365;
  const isMobile = windowWidth < 480;

  // Compact radii: elliptical path tailored to fit labels cleanly without overflow
  const rx = isSmallMobile ? 98 : isMobile ? 112 : 132;
  const ry = isSmallMobile ? 32 : isMobile ? 36 : 42;

  // 5 discrete orbit slots around the ellipse
  // Slot 0 is strictly at the Top (0° / 12 o'clock)
  const SLOT_COORDINATES = [
    // Slot 0 (Top / Active): 0 deg
    { x: 0, y: -ry },
    // Slot 1 (Upper-Right): 72 deg
    { x: Math.round(rx * 0.9511), y: Math.round(-ry * 0.3090) },
    // Slot 2 (Lower-Right): 144 deg
    { x: Math.round(rx * 0.5878), y: Math.round(ry * 0.8090) },
    // Slot 3 (Lower-Left): 216 deg
    { x: Math.round(-rx * 0.5878), y: Math.round(ry * 0.8090) },
    // Slot 4 (Upper-Left): 288 deg
    { x: Math.round(-rx * 0.9511), y: Math.round(-ry * 0.3090) },
  ];

  const activeIndex = ELEVATE_NAV_ITEMS.findIndex((item) => item.id === activeTab);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (index + 1) % ELEVATE_NAV_ITEMS.length;
      onSelectTab(ELEVATE_NAV_ITEMS[nextIdx].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (index - 1 + ELEVATE_NAV_ITEMS.length) % ELEVATE_NAV_ITEMS.length;
      onSelectTab(ELEVATE_NAV_ITEMS[prevIdx].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSelectTab(ELEVATE_NAV_ITEMS[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSelectTab(ELEVATE_NAV_ITEMS[ELEVATE_NAV_ITEMS.length - 1].id);
    }
  };

  return (
    <nav
      ref={containerRef}
      role="tablist"
      aria-label="Elevate navigation options"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: isMobile ? '360px' : '440px',
        margin: '0 auto',
        height: isSmallMobile ? '118px' : isMobile ? '128px' : '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'visible',
      }}
    >
      {ELEVATE_NAV_ITEMS.map((item, itemIdx) => {
        // Calculate cyclic slot offset: selected option is always slot 0 (Top)
        const slotIndex = (itemIdx - safeActiveIndex + ELEVATE_NAV_ITEMS.length) % ELEVATE_NAV_ITEMS.length;
        const coords = SLOT_COORDINATES[slotIndex];
        const isActive = slotIndex === 0;
        const isHovered = hoveredId === item.id;

        // Styling tokens
        const activeBg = isDark
          ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
          : 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
        const inactiveBg = isHovered
          ? isDark
            ? 'rgba(56, 25, 44, 0.88)'
            : 'rgba(255, 255, 255, 0.95)'
          : isDark
          ? 'rgba(38, 18, 30, 0.65)'
          : 'rgba(255, 255, 255, 0.78)';

        const activeBorder = '1px solid rgba(255, 255, 255, 0.35)';
        const inactiveBorder = isHovered
          ? isDark
            ? '1px solid rgba(161, 82, 95, 0.55)'
            : '1px solid rgba(161, 82, 95, 0.40)'
          : isDark
          ? '1px solid rgba(161, 82, 95, 0.22)'
          : '1px solid rgba(161, 82, 95, 0.18)';

        const activeColor = '#FFFFFF';
        const inactiveColor = isHovered
          ? isDark
            ? '#F9AAAD'
            : '#A1525F'
          : isDark
          ? 'rgba(243, 238, 233, 0.70)'
          : 'rgba(70, 32, 55, 0.72)';

        const activeFontSize = isSmallMobile ? '13.5px' : isMobile ? '14.5px' : '15.5px';
        const inactiveFontSize = isSmallMobile ? '10px' : isMobile ? '10.5px' : '11.5px';

        const activePadding = isSmallMobile ? '5px 14px' : isMobile ? '6px 16px' : '7px 20px';
        const inactivePadding = isSmallMobile ? '3px 8px' : isMobile ? '3.5px 10px' : '4px 12px';

        const activeShadow = isDark
          ? '0 4px 18px rgba(161, 82, 95, 0.45)'
          : '0 4px 16px rgba(161, 82, 95, 0.22)';
        const inactiveShadow = isHovered
          ? isDark
            ? '0 2px 10px rgba(0, 0, 0, 0.25)'
            : '0 2px 8px rgba(73, 40, 61, 0.08)'
          : 'none';

        return (
          <button
            key={item.id}
            id={`elevate-tab-${item.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`elevate-panel-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onSelectTab(item.id)}
            onKeyDown={(e) => handleKeyDown(e, itemIdx)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'absolute',
              left: '50%',
              top: '52%',
              transform: `translate3d(calc(-50% + ${coords.x}px), calc(-50% + ${coords.y}px), 0)`,
              zIndex: isActive ? 12 : isHovered ? 8 : 5,
              fontSize: isActive ? activeFontSize : inactiveFontSize,
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'var(--font-sans)',
              letterSpacing: isActive ? '-0.01em' : '0.01em',
              lineHeight: 1.25,
              color: isActive ? activeColor : inactiveColor,
              background: isActive ? activeBg : inactiveBg,
              border: isActive ? activeBorder : inactiveBorder,
              borderRadius: '999px',
              padding: isActive ? activePadding : inactivePadding,
              boxShadow: isActive ? activeShadow : inactiveShadow,
              backdropFilter: isActive ? 'none' : 'blur(8px)',
              WebkitBackdropFilter: isActive ? 'none' : 'blur(8px)',
              cursor: isActive ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
              outline: 'none',
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), font-size 0.3s ease, padding 0.3s ease, background 0.28s ease, color 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
