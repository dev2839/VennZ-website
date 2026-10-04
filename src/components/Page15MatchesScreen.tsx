import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import type { MatchItem } from '../types/matches';

interface Page15MatchesScreenProps {
  onOpenChat: (match: MatchItem) => void;
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: () => void;
  initialSubTab?: 'matches' | 'requests';
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page15MatchesScreen: React.FC<Page15MatchesScreenProps> = ({
  onOpenChat,
  onSelectTab,
  onNavigateHelp,
  initialSubTab = 'matches',
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    appearanceMode,
    incomingRequests,
    sentRequests,
    matches,
    acceptRequest,
    declineRequest,
    declineAllQuietly,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  // Sub-tabs: 'matches' vs 'requests'
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'requests'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Theme variables
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const themeCardBg = isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  const themeCardBorder = isDark ? '1px solid rgba(161, 82, 95, 0.3)' : '1px solid rgba(161, 82, 95, 0.18)';

  const handleAccept = (requestId: string, name: string) => {
    acceptRequest(requestId);
    showToast(`Connected with ${name}`);
  };

  const handleDecline = (requestId: string, name: string) => {
    declineRequest(requestId);
    showToast(`Declined request from ${name}`);
  };

  const handleDeclineAll = () => {
    if (incomingRequests.length === 0) return;
    declineAllQuietly();
    showToast('All pending requests declined quietly');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: themeBgColor,
        color: themeTextColor,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* Exact Botanical Background Wallpaper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.98 : 0.96,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background-image 0.25s ease, opacity 0.25s ease',
        }}
      />

      {/* Subtle Luminous Parchment Glow & Dark Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.35)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* iOS Status Bar (44px height for exact Discover screen top alignment) */}
      {showStatusBar && (
        <div
          style={{
            position: 'relative',
            zIndex: 45,
            backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.92)',
            transition: 'background-color 0.25s ease',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Global Fixed Member Top Bar */}
      <MemberTopBar onConciergeClick={onNavigateHelp} />

      {/* Main Scrollable Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            width: '100%',
            padding: '24px 24px 44px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* SEGMENTED CONTROL: MATCHES · X | REQUESTS · Y */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              padding: '4px',
              borderRadius: '26px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
              border: `1px solid ${themeBorder}`,
              marginBottom: '20px',
            }}
          >
            {/* MATCHES SUB-TAB */}
            <button
              type="button"
              onClick={() => setActiveSubTab('matches')}
              style={{
                height: '40px',
                borderRadius: '22px',
                border: activeSubTab === 'matches' ? 'none' : `1px solid ${isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.2)'}`,
                background: activeSubTab === 'matches'
                  ? (isDark ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : '#FFFFFF')
                  : 'transparent',
                color: activeSubTab === 'matches'
                  ? (isDark ? '#FDF3F5' : 'var(--color-mulberry)')
                  : themeMuted,
                fontSize: '11.5px',
                fontWeight: activeSubTab === 'matches' ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'matches'
                  ? (isDark ? '0 2px 10px rgba(161, 82, 95, 0.4)' : '0 2px 8px rgba(161, 82, 95, 0.15)')
                  : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              MATCHES · {matches.length}
            </button>

            {/* REQUESTS SUB-TAB */}
            <button
              type="button"
              onClick={() => setActiveSubTab('requests')}
              style={{
                height: '40px',
                borderRadius: '22px',
                border: activeSubTab === 'requests' ? 'none' : `1px solid ${isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.2)'}`,
                background: activeSubTab === 'requests'
                  ? (isDark ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : '#FFFFFF')
                  : 'transparent',
                color: activeSubTab === 'requests'
                  ? (isDark ? '#FDF3F5' : 'var(--color-mulberry)')
                  : themeMuted,
                fontSize: '11.5px',
                fontWeight: activeSubTab === 'requests' ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'requests'
                  ? (isDark ? '0 2px 10px rgba(161, 82, 95, 0.4)' : '0 2px 8px rgba(161, 82, 95, 0.15)')
                  : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              REQUESTS · {incomingRequests.length}
            </button>
          </div>

          {/* TAB 1: REQUESTS VIEW */}
          {activeSubTab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* INCOMING REQUESTS CARDS */}
              {incomingRequests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '14px',
                        borderRadius: '16px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.25)' : '0 4px 14px rgba(73, 40, 61, 0.06)',
                        alignItems: 'center',
                      }}
                    >
                      {/* Square Photo Thumbnail */}
                      <img
                        src={req.photo}
                        alt={req.name}
                        style={{
                          width: '92px',
                          height: '92px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          backgroundColor: '#1E161C',
                        }}
                      />

                      {/* Right Details & Actions */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <h3
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: themeMulberry,
                            margin: '0 0 3px 0',
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {req.name}, {req.age}
                        </h3>

                        <div
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: themeMuted,
                            marginBottom: '3px',
                          }}
                        >
                          {req.city}
                        </div>

                        <div
                          style={{
                            fontSize: '13px',
                            color: isDark ? '#E5D8DF' : '#4A3B45',
                            marginBottom: '10px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {req.designation}
                        </div>

                        {/* Action Buttons: DECLINE / ACCEPT */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDecline(req.id, req.name)}
                            style={{
                              flex: 1,
                              height: '34px',
                              borderRadius: '17px',
                              backgroundColor: 'transparent',
                              border: `1.5px solid ${isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.35)'}`,
                              color: themeMulberry,
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            DECLINE
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAccept(req.id, req.name)}
                            style={{
                              flex: 1.15,
                              height: '34px',
                              borderRadius: '17px',
                              background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                              color: '#FDF3F5',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(161, 82, 95, 0.4)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            ACCEPT
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    borderRadius: '16px',
                    backgroundColor: themeCardBg,
                    border: themeCardBorder,
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: themeMulberry }}>
                    No pending incoming requests.
                  </p>
                  <span style={{ fontSize: '12.5px', color: themeMuted }}>
                    New handpicked introductions arrive daily.
                  </span>
                </div>
              )}

              {/* SECTION DIVIDER */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: themeBorder,
                  marginTop: '10px',
                  marginBottom: '10px',
                }}
              />

              {/* SENT · X SECTION */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                    marginBottom: '14px',
                  }}
                >
                  SENT · {sentRequests.length}
                </div>

                {sentRequests.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {sentRequests.map((sent, index) => (
                      <div
                        key={sent.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 0',
                          borderBottom: index < sentRequests.length - 1 ? `1px solid ${themeBorder}` : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '17px',
                              fontWeight: 600,
                              color: themeMulberry,
                              marginBottom: '3px',
                            }}
                          >
                            {sent.name}
                          </span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: themeMuted,
                            }}
                          >
                            {sent.city}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            letterSpacing: '0.09em',
                            textTransform: 'uppercase',
                            color: themeMuted,
                          }}
                        >
                          {sent.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px 0', color: themeMuted, fontSize: '13px' }}>
                    No outgoing requests sent yet.
                  </div>
                )}
              </div>

              {/* DECLINE ALL QUIETLY BUTTON */}
              {incomingRequests.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDeclineAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: themeMuted,
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeMulberry;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = themeMuted;
                    }}
                  >
                    DECLINE ALL QUIETLY
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATCHES VIEW */}
          {activeSubTab === 'matches' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {matches.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {matches.map((match, index) => (
                    <div
                      key={match.id}
                      onClick={() => onOpenChat(match)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        padding: '14px 0',
                        borderBottom: index < matches.length - 1 ? `1px solid ${themeBorder}` : 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.85';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {/* Left: Square Profile Image */}
                      <img
                        src={match.photo}
                        alt={match.name}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          backgroundColor: '#1E161C',
                        }}
                      />

                      {/* Middle: Name & Latest Message Preview */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '18px',
                              fontWeight: 600,
                              color: themeMulberry,
                            }}
                          >
                            {match.name}
                          </span>
                          {match.isVerified && (
                            <span
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: isDark ? '#66BB6A' : '#2E7D32',
                              }}
                            >
                              VERIFIED
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: themeMuted,
                            lineHeight: '1.35',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {match.lastMessage || "Thank you for accepting — I'm Meera. How has your week been?"}
                        </p>
                      </div>

                      {/* Right: OPEN Action */}
                      <div style={{ paddingLeft: '8px', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: themeMulberry,
                          }}
                        >
                          OPEN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '36px 20px',
                    textAlign: 'center',
                    borderRadius: '16px',
                    backgroundColor: themeCardBg,
                    border: themeCardBorder,
                    marginTop: '8px',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '20px',
                      fontWeight: 400,
                      color: themeMulberry,
                      margin: '0 0 8px 0',
                    }}
                  >
                    No mutual matches yet.
                  </h4>
                  <p
                    style={{
                      fontSize: '13.5px',
                      lineHeight: '1.5',
                      color: themeMuted,
                      margin: '0 0 18px 0',
                    }}
                  >
                    When you accept an introduction or someone accepts your request, your private conversation opens here.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectTab('discover')}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                      color: '#FDF3F5',
                      border: 'none',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(161, 82, 95, 0.4)',
                    }}
                  >
                    DISCOVER INTRODUCTIONS
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
            backgroundColor: isDark ? '#462037' : 'rgba(70, 32, 55, 0.95)',
            color: '#FDF3F5',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: '9999px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 5-Button Bottom Navigation with MATCHES active */}
      <MemberBottomNav
        activeTab="matches"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
