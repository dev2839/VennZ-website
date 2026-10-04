import React from 'react';
import { useAuth } from '../context/AuthContext';

export type MemberTab = 'discover' | 'matches' | 'elevate' | 'mixers' | 'you';

interface MemberBottomNavProps {
  activeTab: MemberTab;
  onSelectTab: (tab: MemberTab) => void;
  showHomeIndicator?: boolean;
}

const CrownIcon = ({ color, size = 10 }: { color: string; size?: number }) => (
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

export const MemberBottomNav: React.FC<MemberBottomNavProps> = ({
  activeTab,
  onSelectTab,
  showHomeIndicator = true,
}) => {
  const { appearanceMode, incomingRequests } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const hasIncomingRequests = Boolean(incomingRequests && incomingRequests.length > 0);

  const tabs: { id: MemberTab; label: string; hasNotification?: boolean; isExclusive?: boolean }[] = [
    { id: 'discover', label: 'DISCOVER' },
    { id: 'matches', label: 'MATCHES', hasNotification: hasIncomingRequests },
    { id: 'elevate', label: 'ELEVATE', isExclusive: true },
    { id: 'mixers', label: 'MIXERS' },
    { id: 'you', label: 'YOU' },
  ];

  const navBg = isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.96)';
  const borderTopColor = isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(199, 87, 124, 0.2)';
  const activeColor = isDark ? '#F9AAAD' : '#A1525F';
  const inactiveColor = isDark ? '#D4A2AC' : '#683A46';
  const indicatorColor = isDark ? 'rgba(249, 170, 173, 0.35)' : 'rgba(161, 82, 95, 0.25)';
  const crownColor = isDark ? '#DFB76C' : '#C7577C';

  return (
    <nav
      className="show-on-mobile-only"
      aria-label="Bottom Navigation"
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: navBg,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `1px solid ${borderTopColor}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'center',
          height: '52px',
          width: '100%',
          boxSizing: 'border-box',
          padding: '0 4px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
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
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                padding: '10px 2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  fontSize: '10.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.07em',
                  fontFamily: 'var(--font-sans)',
                  color: isActive ? activeColor : inactiveColor,
                  transition: 'color 0.15s ease',
                  borderBottom: isActive ? `1.5px solid ${activeColor}` : '1.5px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {tab.isExclusive && (
                  <CrownIcon
                    color={isActive ? (isDark ? '#F5D78E' : crownColor) : (isDark ? 'rgba(223, 183, 108, 0.7)' : 'rgba(138, 75, 110, 0.65)')}
                    size={10}
                  />
                )}
                <span>{tab.label}</span>

                {/* Red dot indicator for MATCHES tab */}
                {tab.hasNotification && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-7px',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#C94A4A',
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* iOS Home Indicator Bar */}
      {showHomeIndicator && (
        <div style={{ paddingBottom: '8px', paddingTop: '2px' }}>
          <div
            style={{
              width: '120px',
              height: '4px',
              backgroundColor: indicatorColor,
              borderRadius: '9999px',
              margin: '0 auto',
            }}
          />
        </div>
      )}
    </nav>
  );
};
