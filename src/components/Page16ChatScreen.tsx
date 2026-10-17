import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { ModalPortal } from './ModalPortal';
import { useAuth } from '../context/AuthContext';
import type { MatchItem, ChatMessage } from '../types/matches';
import { ArrowLeft, CheckCheck, MoreVertical, Send, ShieldCheck, Sparkles, UserX, AlertTriangle, Ban } from 'lucide-react';

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
    markConversationRead,
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
      text: match.name === 'Meera' || match.name.startsWith('Meera')
        ? "Thank you for accepting — I'm Meera. How has your week been?"
        : `Hello! Happy to connect with you on VennZ.`,
      timestamp: match.matchedAt || Date.now(),
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages.length]);

  useEffect(() => {
    markConversationRead(match.id);
  }, [match.id, markConversationRead]);

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

  const openingPrompts = conversationMessages.some((message) => message.senderId === 'me')
    ? []
    : [
        'What are you looking forward to lately?',
        'What does a perfect weekend look like for you?',
        'What have you been enjoying outside work?',
      ];

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

  // Luxury Minimalist Theme Palette
  const colors = {
    bg: isDark ? '#140E1C' : '#FAF1F3',
    text: isDark ? '#FDF3F5' : '#462037',
    muted: isDark ? 'rgba(253, 243, 245, 0.65)' : '#683A46',
    border: isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.16)',
    headerBg: isDark ? 'rgba(20, 14, 28, 0.88)' : 'rgba(255, 255, 255, 0.86)',
    cardBg: isDark ? 'rgba(48, 27, 43, 0.72)' : 'rgba(255, 255, 255, 0.82)',
    inputBg: isDark ? 'rgba(32, 17, 28, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    myBubbleBg: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
    theirBubbleBg: isDark ? 'rgba(48, 27, 43, 0.85)' : 'rgba(255, 255, 255, 0.92)',
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* Background Wallpaper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.96 : 0.94,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
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
            backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.94)',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Global Fixed Member Top Bar */}
      <MemberTopBar onConciergeClick={() => onNavigateHelp && onNavigateHelp()} />

      {/* STREAMLINED LUXURY CHAT HEADER */}
      <div
        style={{
          position: 'relative',
          zIndex: 35,
          padding: '12px 20px',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.headerBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left: Back button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '999px',
            transition: 'background-color 0.15s ease',
          }}
          aria-label="Back to matches"
        >
          <ArrowLeft size={16} />
          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Matches</span>
        </button>

        {/* Center: Match identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '38px', height: '38px' }}>
            <img
              src={match.photo}
              alt={match.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: isDark ? '1.5px solid rgba(199, 87, 124, 0.5)' : '1.5px solid rgba(161, 82, 95, 0.4)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#34D399',
                boxShadow: '0 0 6px #34D399',
                border: '1.5px solid #fff',
              }}
              title="Active now"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '17px',
                  fontWeight: 600,
                  color: colors.text,
                  lineHeight: 1.15,
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
                    color: '#86EFAC',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <ShieldCheck size={9} />
                  VERIFIED
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', color: colors.muted, lineHeight: 1.2 }}>
              {[match.designation, match.city].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>

        {/* Right: Actions menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Conversation actions"
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
          >
            <MoreVertical size={18} />
          </button>

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
                  top: '42px',
                  right: 0,
                  zIndex: 70,
                  minWidth: '180px',
                  backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
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
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: colors.text,
                    cursor: 'pointer',
                  }}
                >
                  <UserX size={14} />
                  <span>Unmatch</span>
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: colors.text,
                    cursor: 'pointer',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>Report member</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsBlockConfirmOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#E06D6D',
                    cursor: 'pointer',
                  }}
                >
                  <Ban size={14} />
                  <span>Block member</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CONVERSATION FEED */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 20px 100px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Match Introduction Card */}
          <div
            style={{
              margin: '12px auto 28px',
              padding: '20px 24px',
              borderRadius: '20px',
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(16px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '440px',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 12px',
                border: '2px solid rgba(199, 87, 124, 0.4)',
                boxShadow: '0 4px 16px rgba(161, 82, 95, 0.25)',
              }}
            >
              <img src={match.photo} alt={match.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: isDark ? 'rgba(199, 87, 124, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                color: isDark ? '#F9AAAD' : '#A1525F',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              <Sparkles size={11} />
              <span>CURATED INTRODUCTION</span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 400,
                margin: '0 0 6px',
                color: colors.text,
              }}
            >
              You and {match.name}
            </h3>

            <p style={{ margin: 0, fontSize: '12.5px', color: colors.muted, lineHeight: 1.5 }}>
              Connected intentionally through VennZ. Direct, verified conversation.
            </p>
          </div>

          {/* Icebreaker Prompts */}
          {openingPrompts.length > 0 && (
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.muted }}>
                SUGGESTED ICEBREAKERS
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                {openingPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessageInput(prompt)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDark ? 'rgba(48, 27, 43, 0.65)' : 'rgba(255, 255, 255, 0.8)',
                      color: colors.text,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {conversationMessages.map((msg) => {
              const isMe = msg.senderId === 'me';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '13px 18px',
                      borderRadius: isMe ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
                      background: isMe ? colors.myBubbleBg : colors.theirBubbleBg,
                      color: isMe ? '#FFFFFF' : colors.text,
                      border: isMe ? 'none' : `1px solid ${colors.border}`,
                      boxShadow: isDark
                        ? '0 6px 20px rgba(0, 0, 0, 0.25)'
                        : '0 6px 18px rgba(161, 82, 95, 0.08)',
                      fontFamily: isMe ? 'var(--font-sans)' : 'var(--font-serif)',
                      fontSize: isMe ? '14px' : '16px',
                      lineHeight: '1.5',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                      padding: isMe ? '0 4px 0 0' : '0 0 0 4px',
                      fontSize: '10.5px',
                      color: colors.muted,
                    }}
                  >
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck size={12} color={isDark ? '#86EFAC' : '#2E7D32'} />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* MINIMALIST FLOATING INPUT DOCK */}
      <div
        style={{
          position: 'absolute',
          bottom: '68px',
          left: 0,
          right: 0,
          zIndex: 40,
          padding: '10px 20px',
          pointerEvents: 'none',
        }}
      >
        <form
          onSubmit={handleSend}
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 8px 6px 18px',
            borderRadius: '999px',
            backgroundColor: colors.inputBg,
            border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: isDark
              ? '0 12px 36px rgba(0, 0, 0, 0.45)'
              : '0 12px 32px rgba(161, 82, 95, 0.15)',
          }}
        >
          <input
            type="text"
            aria-label="Message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${match.name}...`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: colors.text,
              padding: '8px 0',
            }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: messageInput.trim()
                ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
                : (isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(240, 230, 233, 0.8)'),
              color: messageInput.trim() ? '#FFFFFF' : colors.muted,
              cursor: messageInput.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: messageInput.trim() ? '0 4px 12px rgba(161, 82, 95, 0.4)' : 'none',
            }}
            aria-label="Send message"
          >
            <Send size={15} style={{ transform: 'translateX(1px)' }} />
          </button>
        </form>
      </div>

      {/* UNMATCH CONFIRMATION MODAL */}
      {isUnmatchConfirmOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(28, 22, 26, 0.72)',
              backdropFilter: 'blur(8px)',
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
                backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '26px 24px',
                maxWidth: '360px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: colors.text, margin: '0 0 8px 0' }}>
                Unmatch with {match.name}?
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: colors.muted, margin: '0 0 20px 0' }}>
                This conversation and match will be permanently removed for both of you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleUnmatch}
                  style={{
                    height: '44px',
                    borderRadius: '999px',
                    backgroundColor: '#C94A4A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
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
                    height: '42px',
                    borderRadius: '999px',
                    background: 'transparent',
                    color: colors.muted,
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* BLOCK CONFIRMATION MODAL */}
      {isBlockConfirmOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(28, 22, 26, 0.72)',
              backdropFilter: 'blur(8px)',
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
                backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '26px 24px',
                maxWidth: '360px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: colors.text, margin: '0 0 8px 0' }}>
                Block {match.name}?
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: colors.muted, margin: '0 0 20px 0' }}>
                {match.name} will be removed and will never appear in your introductions again.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleBlock}
                  style={{
                    height: '44px',
                    borderRadius: '999px',
                    backgroundColor: '#B91C1C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
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
                    height: '42px',
                    borderRadius: '999px',
                    background: 'transparent',
                    color: colors.muted,
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
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
