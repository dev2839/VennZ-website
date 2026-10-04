import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import type { MatchItem, ChatMessage } from '../types/matches';

interface Page16ChatScreenProps {
  match: MatchItem;
  onBack: () => void;
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: (prefilledCategory?: string) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page16ChatScreen: React.FC<Page16ChatScreenProps> = ({
  match,
  onBack,
  onSelectTab,
  onNavigateHelp,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    appearanceMode,
    conversations,
    sendChatMessage,
    unmatchUser,
    blockUser,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  const [messageInput, setMessageInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUnmatchConfirmOpen, setIsUnmatchConfirmOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Retrieve current conversation messages or default
  const conversationMessages: ChatMessage[] = (conversations && conversations[match.id]) || [
    {
      id: `msg-initial-${match.id}`,
      senderId: match.profileId,
      text: match.name === 'Meera'
        ? "Thank you for accepting — I'm Meera. How has your week been?"
        : `Hello! Great to connect with you on VennZ.`,
      timestamp: match.matchedAt || Date.now(),
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendChatMessage(match.id, trimmed);
    setMessageInput('');
  };

  const handleUnmatch = () => {
    setIsUnmatchConfirmOpen(false);
    setIsMenuOpen(false);
    unmatchUser(match.id);
    onBack();
  };

  const handleBlock = () => {
    setIsBlockConfirmOpen(false);
    setIsMenuOpen(false);
    blockUser(match.id);
    onBack();
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    if (onNavigateHelp) {
      onNavigateHelp('REPORT A MEMBER');
    } else {
      showToast(`Report filed for ${match.name}`);
    }
  };

  // Theme variables
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const themeBubbleBg = isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.82)';
  const themeBubbleBorder = isDark ? '1px solid rgba(161, 82, 95, 0.3)' : '1px solid rgba(161, 82, 95, 0.18)';

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
      {/* Subtle Scrim for Contrast & Depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.35)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* iOS Status Bar */}
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
      <MemberTopBar onConciergeClick={() => onNavigateHelp && onNavigateHelp()} />

      {/* CONVERSATION SUBHEADER (matches media_1788958476026.png) */}
      <div
        style={{
          position: 'relative',
          zIndex: 35,
          padding: '10px 18px',
          borderBottom: `1px solid ${themeBorder}`,
          backgroundColor: isDark ? 'rgba(6, 1, 5, 0.97)' : 'rgba(247, 243, 238, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: ← MATCHES */}
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: themeMulberry,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: '14px', lineHeight: 1 }}>←</span>
          <span>MATCHES</span>
        </button>

        {/* Center: Match Name & VERIFIED */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '19px',
              fontWeight: 600,
              color: themeMulberry,
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            {match.name}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isDark ? '#66BB6A' : '#2E7D32',
              marginTop: '1px',
            }}
          >
            VERIFIED
          </span>
        </div>

        {/* Right: Three-Dot Menu Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Conversation actions"
            style={{
              background: 'none',
              border: 'none',
              color: themeMulberry,
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1,
            }}
          >
            •••
          </button>

          {/* Three-Dot Dropdown Popup */}
          {isMenuOpen && (
            <>
              <div
                onClick={() => setIsMenuOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 60,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '32px',
                  right: 0,
                  zIndex: 70,
                  minWidth: '150px',
                  backgroundColor: isDark ? '#0A0209' : '#FFFFFF',
                  borderRadius: '14px',
                  border: `1px solid ${themeBorder}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  padding: '6px 0',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsUnmatchConfirmOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: themeMulberry,
                    cursor: 'pointer',
                  }}
                >
                  Unmatch
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: themeMulberry,
                    cursor: 'pointer',
                  }}
                >
                  Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsBlockConfirmOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#C94A4A',
                    cursor: 'pointer',
                  }}
                >
                  Block
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CHAT MESSAGES SCROLL VIEW */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '24px 20px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Eyebrow Microcopy: YOU MATCHED · BE KIND, BE DIRECT */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: themeMuted,
              marginBottom: '22px',
            }}
          >
            YOU MATCHED · BE KIND, BE DIRECT
          </div>

          {/* Messages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {conversationMessages.map((msg) => {
              const isMe = msg.senderId === 'me';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '14px 18px',
                      borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isMe
                        ? (isDark ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)')
                        : themeBubbleBg,
                      color: isMe
                        ? '#FDF3F5'
                        : themeTextColor,
                      border: isMe ? 'none' : themeBubbleBorder,
                      boxShadow: isDark
                        ? '0 4px 16px rgba(0,0,0,0.35)'
                        : '0 4px 14px rgba(161,82,95,0.12)',
                      fontFamily: isMe ? 'var(--font-sans)' : 'var(--font-serif)',
                      fontSize: isMe ? '14px' : '16px',
                      lineHeight: '1.5',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* BOTTOM CHAT INPUT BAR (matches media_1788958476026.png) */}
      <div
        style={{
          position: 'relative',
          zIndex: 35,
          padding: '12px 20px 14px 20px',
          borderTop: `1px solid ${themeBorder}`,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <form
          onSubmit={handleSend}
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${isDark ? 'rgba(243, 238, 233, 0.28)' : 'rgba(73, 40, 61, 0.28)'}`,
            paddingBottom: '6px',
          }}
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Write something"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-serif)',
              fontSize: '16.5px',
              color: themeTextColor,
              padding: '6px 4px',
            }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: messageInput.trim() ? themeMulberry : themeMuted,
              cursor: messageInput.trim() ? 'pointer' : 'default',
              padding: '6px 4px',
              transition: 'color 0.15s ease',
            }}
          >
            SEND
          </button>
        </form>
      </div>

      {/* UNMATCH CONFIRMATION MODAL */}
      {isUnmatchConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            backgroundColor: 'rgba(28, 22, 26, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsUnmatchConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#0A0209' : '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              borderRadius: '20px',
              padding: '24px 22px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: themeMulberry, margin: '0 0 8px 0' }}>
              Unmatch with {match.name}?
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: themeMuted, margin: '0 0 20px 0' }}>
              This conversation and match will be permanently removed for both of you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleUnmatch}
                style={{
                  height: '42px',
                  borderRadius: '21px',
                  backgroundColor: '#C94A4A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                UNMATCH
              </button>
              <button
                type="button"
                onClick={() => setIsUnmatchConfirmOpen(false)}
                style={{
                  height: '40px',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: themeMuted,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK CONFIRMATION MODAL */}
      {isBlockConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            backgroundColor: 'rgba(28, 22, 26, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsBlockConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#0A0209' : '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              borderRadius: '20px',
              padding: '24px 22px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: themeMulberry, margin: '0 0 8px 0' }}>
              Block {match.name}?
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: themeMuted, margin: '0 0 20px 0' }}>
              {match.name} will be removed and will never appear in your introductions again.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleBlock}
                style={{
                  height: '42px',
                  borderRadius: '21px',
                  backgroundColor: '#B91C1C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                BLOCK MEMBER
              </button>
              <button
                type="button"
                onClick={() => setIsBlockConfirmOpen(false)}
                style={{
                  height: '40px',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: themeMuted,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

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
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
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
