import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export type RoutePath =
  | '/'
  | '/join'
  | '/login'
  | '/join/verify-code'
  | '/join/profile'
  | '/join/identity-verification'
  | '/join/context'
  | '/join/standards'
  | '/join/waitlist'
  | '/join/membership'
  | '/join/submitted'
  | '/overview'
  | '/discover'
  | '/member/profile'
  | '/member/you'
  | '/member/help'
  | '/member/matches'
  | '/member/chat'
  | '/member/elevate'
  | '/member/mixers';

interface WebNavbarProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
}

const CrownIcon = ({ color, size = 11 }: { color: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke="none"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M2.5 19h19a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H2.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1zm19-14a1 1 0 0 0-1 .62l-3.24 7.42-3.8-9.04a1 1 0 0 0-1.92 0l-3.8 9.04-3.24-7.42a1 1 0 0 0-1.78.38l-1.72 9a1 1 0 0 0 .98 1.18h19a1 1 0 0 0 .98-1.18l-1.72-9a1 1 0 0 0-.46-.38z" />
  </svg>
);

export const WebNavbar: React.FC<WebNavbarProps> = ({ currentPath, onNavigate }) => {
  const {
    profile,
    membershipStatus,
    appearanceMode,
    setAppearanceMode,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    incomingRequests,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';
  const isMember = membershipStatus === 'member' || membershipStatus === 'complimentary';
  const hasIncomingRequests = Boolean(incomingRequests && incomingRequests.length > 0);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [screensMenuOpen, setScreensMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);
  const screensRef = useRef<HTMLDivElement | null>(null);

  // Outside click listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        notifRef.current &&
        !notifRef.current.contains(target) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
      if (screensRef.current && !screensRef.current.contains(target)) {
        setScreensMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
    };
  }, []);

  const handleToggleNotifications = () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next && unreadNotificationsCount > 0) {
      markNotificationsAsRead();
    }
  };

  const isMemberArea =
    currentPath === '/discover' ||
    currentPath === '/member/profile' ||
    currentPath === '/member/you' ||
    currentPath === '/member/help' ||
    currentPath === '/member/matches' ||
    currentPath === '/member/chat' ||
    currentPath === '/member/elevate' ||
    currentPath === '/member/mixers';

  const navItems = [
    { path: '/discover' as RoutePath, label: 'DISCOVER' },
    { path: '/member/matches' as RoutePath, label: 'MATCHES', hasBadge: hasIncomingRequests },
    { path: '/member/elevate' as RoutePath, label: 'ELEVATE', hasCrown: true },
    { path: '/member/mixers' as RoutePath, label: 'MIXERS' },
    { path: '/member/you' as RoutePath, label: 'YOU' },
  ];

  const allScreens = [
    { path: '/' as RoutePath, label: '1. Splash Welcome' },
    { path: '/login' as RoutePath, label: '2. Sign Up / Log In' },
    { path: '/join/verify-code' as RoutePath, label: '3. Verify OTP' },
    { path: '/join/profile' as RoutePath, label: '4. Profile Setup' },
    { path: '/join/identity-verification' as RoutePath, label: '5. Verify Identity' },
    { path: '/join/context' as RoutePath, label: '6. Social Context' },
    { path: '/join/standards' as RoutePath, label: '7. Community Standards' },
    { path: '/join/waitlist' as RoutePath, label: '8. Application Waitlist' },
    { path: '/join/membership' as RoutePath, label: '9. Membership Tiers' },
    { path: '/overview' as RoutePath, label: '10. Welcome Overview' },
    { path: '/discover' as RoutePath, label: '11. Discover Introductions' },
    { path: '/member/profile' as RoutePath, label: '12. Full Profile View' },
    { path: '/member/you' as RoutePath, label: '13. You / Membership' },
    { path: '/member/help' as RoutePath, label: '14. Help & Support' },
    { path: '/member/matches' as RoutePath, label: '15. Matches & Requests' },
    { path: '/member/chat' as RoutePath, label: '16. Member Chat' },
    { path: '/member/elevate' as RoutePath, label: '17. Elevate Concierge' },
    { path: '/member/mixers' as RoutePath, label: '18. Private Mixers' },
  ];

  const currentScreenTitle = allScreens.find((s) => s.path === currentPath)?.label || 'VennZ';

  const navBg = isDark ? 'rgba(20, 8, 19, 0.94)' : 'rgba(250, 246, 242, 0.94)';
  const borderBottom = isDark ? 'rgba(215, 175, 210, 0.14)' : 'rgba(73, 40, 61, 0.1)';
  const textColor = isDark ? '#F3EEE9' : 'var(--color-espresso)';
  const activeColor = isDark ? '#F3EEE9' : 'var(--color-mulberry)';
  const inactiveColor = isDark ? 'rgba(243, 238, 233, 0.65)' : '#7A6A74';
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.05)';
  const buttonBorder = isDark ? 'rgba(243, 238, 233, 0.2)' : 'rgba(73, 40, 61, 0.15)';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${borderBottom}`,
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        {/* Brand Lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            onClick={() => onNavigate(isMember ? '/discover' : '/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {/* VennZ Logo */}
            <img
              src="/vennz-logo.png"
              alt="VennZ"
              style={{
                height: '34px',
                width: 'auto',
                maxWidth: '130px',
                objectFit: 'contain',
                filter: isDark
                  ? 'drop-shadow(0 -1px 0.5px rgba(255, 230, 255, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7)) drop-shadow(0 4px 12px rgba(139, 44, 116, 0.45))'
                  : 'drop-shadow(0 1px 3px rgba(73, 40, 61, 0.2))',
              }}
            />

            {isMemberArea && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(243, 238, 233, 0.7)' : '#7A6B74',
                    marginTop: '1px',
                  }}
                >
                  MEMBER PORTAL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Member Navigation Links */}
        {isMemberArea && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            className="hidden-on-mobile"
          >
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  style={{
                    position: 'relative',
                    background: isActive
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(73, 40, 61, 0.08)'
                      : 'transparent',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 18px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.08em',
                    color: isActive ? activeColor : inactiveColor,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = textColor;
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(73, 40, 61, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = inactiveColor;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.hasCrown && (
                    <CrownIcon color={isActive ? '#E0B56A' : isDark ? '#D5A85A' : '#8A4B6E'} size={12} />
                  )}
                  <span>{item.label}</span>
                  {item.hasBadge && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#C94A4A',
                        boxShadow: '0 0 6px rgba(201, 74, 74, 0.6)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Action Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Screen Switcher Menu for full product evaluation */}
          <div ref={screensRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setScreensMenuOpen(!screensMenuOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '9999px',
                backgroundColor: buttonBg,
                border: `1px solid ${buttonBorder}`,
                color: textColor,
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s ease',
              }}
              title="Jump directly to any application screen"
            >
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentScreenTitle}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {screensMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backgroundColor: isDark ? '#120a10' : '#FFFFFF',
                  borderRadius: '16px',
                  border: `1px solid ${borderBottom}`,
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                  padding: '8px 0',
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: '8px 16px 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(243, 238, 233, 0.5)' : '#8A7A84',
                    borderBottom: `1px solid ${borderBottom}`,
                  }}
                >
                  All 18 Product Screens
                </div>
                {allScreens.map((screen) => {
                  const isCur = currentPath === screen.path;
                  return (
                    <button
                      key={screen.path}
                      type="button"
                      onClick={() => {
                        onNavigate(screen.path);
                        setScreensMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: isCur
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(73, 40, 61, 0.06)'
                          : 'transparent',
                        border: 'none',
                        color: isCur ? activeColor : textColor,
                        fontWeight: isCur ? 600 : 400,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCur) {
                          e.currentTarget.style.backgroundColor = isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(73, 40, 61, 0.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCur) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span>{screen.label}</span>
                      {isCur && (
                        <span style={{ fontSize: '11px', color: 'var(--color-peach-blush)' }}>●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              ref={notifButtonRef}
              type="button"
              onClick={handleToggleNotifications}
              aria-label="View notifications"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: notificationsOpen
                  ? isDark
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(73, 40, 61, 0.12)'
                  : buttonBg,
                border: `1px solid ${buttonBorder}`,
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>

              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '7px',
                    right: '7px',
                    width: '7.5px',
                    height: '7.5px',
                    borderRadius: '50%',
                    backgroundColor: '#C94A4A',
                    border: `1.5px solid ${isDark ? '#080307' : '#FAF6F2'}`,
                    boxShadow: '0 0 4px rgba(201, 74, 74, 0.6)',
                  }}
                />
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {notificationsOpen && (
              <div
                ref={notifRef}
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '360px',
                  maxHeight: '440px',
                  backgroundColor: isDark ? '#0e060d' : '#FFFFFF',
                  borderRadius: '18px',
                  border: `1px solid ${borderBottom}`,
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: `1px solid ${borderBottom}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isDark ? 'rgba(243, 238, 233, 0.7)' : '#7A6A74',
                    }}
                  >
                    NOTIFICATIONS
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: isDark ? 'rgba(243, 238, 233, 0.5)' : '#998A94',
                    }}
                  >
                    {notifications.length} updates
                  </span>
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '360px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: inactiveColor, fontSize: '13px' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.targetRoute) {
                            onNavigate(notif.targetRoute as RoutePath);
                          }
                          setNotificationsOpen(false);
                        }}
                        style={{
                          padding: '14px 18px',
                          borderBottom: idx < notifications.length - 1 ? `1px solid ${borderBottom}` : 'none',
                          cursor: notif.targetRoute ? 'pointer' : 'default',
                          backgroundColor: !notif.isRead
                            ? isDark
                              ? 'rgba(255, 255, 255, 0.03)'
                              : 'rgba(73, 40, 61, 0.03)'
                            : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = !notif.isRead
                            ? isDark
                              ? 'rgba(255, 255, 255, 0.03)'
                              : 'rgba(73, 40, 61, 0.03)'
                            : 'transparent';
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: isDark ? '#E8A99B' : '#9B4D6E',
                            marginBottom: '3px',
                          }}
                        >
                          {notif.sourcePage ? `${notif.category || notif.type} · ${notif.sourcePage}` : (notif.category || notif.type)}
                        </div>
                        <h4
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '15.5px',
                            color: textColor,
                            margin: '0 0 3px',
                            fontWeight: 400,
                          }}
                        >
                          {notif.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: inactiveColor, lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setAppearanceMode(isDark ? 'ivory' : 'after-dark')}
            aria-label={isDark ? 'Switch to Ivory theme' : 'Switch to Dark theme'}
            title={isDark ? 'Switch to Ivory theme' : 'Switch to Dark theme'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: buttonBg,
              border: `1px solid ${buttonBorder}`,
              color: textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isDark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          {isMemberArea && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="show-on-mobile-only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: buttonBg,
                border: `1px solid ${buttonBorder}`,
                color: textColor,
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Toggle navigation menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 12h16M4 6h16M4 18h16" />}
              </svg>
            </button>
          )}

          {/* Member Profile Avatar or Sign In button */}
          {isMemberArea ? (
            <button
              type="button"
              onClick={() => onNavigate('/member/you')}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px',
                cursor: 'pointer',
              }}
              title="View account"
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid var(--color-peach-blush)',
                  backgroundColor: 'var(--color-mulberry)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profile.photos && profile.photos[0] ? (
                  <img src={profile.photos[0]} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>
                    {(profile.firstName || 'U')[0]}
                  </span>
                )}
              </div>
            </button>
          ) : (
            currentPath === '/' && (
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                style={{
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-warm-porcelain)',
                  color: 'var(--color-espresso)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Log in
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && isMemberArea && (
        <div
          style={{
            borderTop: `1px solid ${borderBottom}`,
            backgroundColor: navBg,
            padding: '12px 20px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  onNavigate(item.path);
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(73, 40, 61, 0.08)') : 'transparent',
                  color: isActive ? activeColor : textColor,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.hasCrown && <CrownIcon color="#DFB76C" size={12} />}
                  <span>{item.label}</span>
                </span>
                {item.hasBadge && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C94A4A' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
