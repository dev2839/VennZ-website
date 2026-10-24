import React from 'react';
import { useAuth } from '../context/AuthContext';

export type MemberTab = 'discover' | 'matches' | 'blinddate' | 'mixers' | 'afterhours' | 'you' | 'profile' | 'elevate';

interface MemberBottomNavProps {
  activeTab: MemberTab;
  onSelectTab: (tab: MemberTab) => void;
  showHomeIndicator?: boolean;
}

// 1. Discover Icon (Compass)
const DiscoverIcon = ({ color, isActive, size = 22 }: { color: string; isActive: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={isActive ? '2.3' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', transition: 'all 0.2s ease' }}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={isActive ? color : 'none'} />
  </svg>
);

// 2. Matches Icon (Interlocking Hearts)
const MatchesIcon = ({ color, isActive, size = 22 }: { color: string; isActive: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={isActive ? color : 'none'}
    stroke={color}
    strokeWidth={isActive ? '2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', transition: 'all 0.2s ease' }}
  >
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </svg>
);

// 3. PickForMe Icon (Magic Sparkle / Stars)
const PickForMeIcon = ({ color, isActive, size = 22 }: { color: string; isActive: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={isActive ? color : 'none'}
    stroke={color}
    strokeWidth={isActive ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', transition: 'all 0.2s ease' }}
  >
    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
    <path d="m19 16 1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2L19 16z" />
  </svg>
);

// 4. Mixers Icon (Cocktail Glass / Social Gathering)
const MixersIcon = ({ color, isActive, size = 22 }: { color: string; isActive: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={isActive ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', transition: 'all 0.2s ease' }}
  >
    <path d="m8 22 8 0" />
    <path d="m12 15 0 7" />
    <path
      d="m2 4 20 0l-10 11z"
      fill={isActive ? (color === '#F9AAAD' ? 'rgba(249, 170, 173, 0.25)' : 'rgba(161, 82, 95, 0.25)') : 'none'}
    />
    <path d="M6 8h12" />
  </svg>
);

// 5. afterHOURS Icon (Crescent Moon & Star)
const AfterHoursIcon = ({ color, isActive, size = 22 }: { color: string; isActive: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={isActive ? color : 'none'}
    stroke={color}
    strokeWidth={isActive ? '2.2' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', transition: 'all 0.2s ease' }}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    <circle cx="19" cy="5" r="1.2" fill={color} stroke="none" />
  </svg>
);

export const MemberBottomNav: React.FC<MemberBottomNavProps> = ({
  activeTab,
  onSelectTab,
  showHomeIndicator = true,
}) => {
  const { appearanceMode, incomingRequests } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const hasIncomingRequests = Boolean(incomingRequests && incomingRequests.length > 0);

  const tabs: {
    id: MemberTab;
    label: string;
    hasNotification?: boolean;
    renderIcon: (color: string, isActive: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'discover',
      label: 'Discover',
      renderIcon: (color, isActive) => <DiscoverIcon color={color} isActive={isActive} size={21} />,
    },
    {
      id: 'matches',
      label: 'Matches',
      hasNotification: hasIncomingRequests,
      renderIcon: (color, isActive) => <MatchesIcon color={color} isActive={isActive} size={21} />,
    },
    {
      id: 'blinddate',
      label: 'PickForMe',
      renderIcon: (color, isActive) => <PickForMeIcon color={color} isActive={isActive} size={21} />,
    },
    {
      id: 'mixers',
      label: 'Mixers',
      renderIcon: (color, isActive) => <MixersIcon color={color} isActive={isActive} size={21} />,
    },
    {
      id: 'afterhours',
      label: 'afterHOURS',
      renderIcon: (color, isActive) => <AfterHoursIcon color={color} isActive={isActive} size={21} />,
    },
  ];

  const navBg = isDark ? 'rgba(20, 14, 28, 0.95)' : 'rgba(250, 241, 243, 0.95)';
  const borderTopColor = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(199, 87, 124, 0.22)';
  const activeColor = isDark ? '#F9AAAD' : '#A1525F';
  const inactiveColor = isDark ? '#B3A1A8' : '#8A7A84';
  const indicatorColor = isDark ? 'rgba(249, 170, 173, 0.35)' : 'rgba(161, 82, 95, 0.25)';

  return (
    <>
      {/* Spacer in document flow to prevent page content from being obscured by the fixed bottom bar */}
      <div
        className="show-on-mobile-only"
        style={{
          height: 'calc(68px + env(safe-area-inset-bottom, 0px))',
          width: '100%',
          flexShrink: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Persistent Fixed Mobile Bottom Tab Bar */}
      <nav
        className="show-on-mobile-only"
        aria-label="Bottom Navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${borderTopColor}`,
          boxShadow: isDark ? '0 -6px 24px rgba(0, 0, 0, 0.55)' : '0 -6px 20px rgba(73, 40, 61, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            alignItems: 'center',
            height: '60px',
            width: '100%',
            boxSizing: 'border-box',
            padding: '2px 4px 0',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'blinddate' && activeTab === 'elevate');
            const currentColor = isActive ? activeColor : inactiveColor;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                aria-label={tab.label}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px 2px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  boxSizing: 'border-box',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Icon Wrapper with notification badge */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tab.renderIcon(currentColor, isActive)}

                  {/* Red notification dot for MATCHES */}
                  {tab.hasNotification && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-4px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#C94A4A',
                        boxShadow: '0 0 6px rgba(201, 74, 74, 0.8)',
                      }}
                    />
                  )}
                </div>

                {/* Tab Label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.04em',
                    fontFamily: 'var(--font-sans)',
                    color: currentColor,
                    transition: 'color 0.15s ease',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>

                {/* Subtle active pill indicator */}
                <span
                  style={{
                    width: isActive ? '12px' : '0px',
                    height: '2px',
                    borderRadius: '1px',
                    backgroundColor: activeColor,
                    transition: 'width 0.2s ease, opacity 0.2s ease',
                    opacity: isActive ? 1 : 0,
                    marginTop: '1px',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Home Indicator */}
        {showHomeIndicator && (
          <div style={{ paddingBottom: '4px', paddingTop: '1px' }}>
            <div
              style={{
                width: '100px',
                height: '3.5px',
                backgroundColor: indicatorColor,
                borderRadius: '9999px',
                margin: '0 auto',
              }}
            />
          </div>
        )}
      </nav>
    </>
  );
};
