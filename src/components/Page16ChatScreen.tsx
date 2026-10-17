import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { ModalPortal } from './ModalPortal';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MATCHES } from '../context/AuthContext';
import type { MatchItem, ChatMessage } from '../types/matches';
import {
  ArrowLeft,
  CheckCheck,
  Send,
  ShieldCheck,
  UserX,
  AlertTriangle,
  Ban,
  Search,
  SquarePen,
  ChevronDown,
  Phone,
  Video,
  Info,
  Smile,
  Mic,
  Image as ImageIcon,
} from 'lucide-react';

interface Page16ChatScreenProps {
  match: MatchItem;
  onBack: () => void;
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: (prefilledCategory?: string) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page16ChatScreen: React.FC<Page16ChatScreenProps> = ({
  match: initialMatch,
  onBack,
  onSelectTab,
  onNavigateHelp,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    appearanceMode,
    profile,
    matches,
    incomingRequests,
    conversations,
    sendChatMessage,
    markConversationRead,
    unmatchUser,
    blockUser,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  // Connected people available for chat
  const connectedList: MatchItem[] = matches && matches.length > 0 ? matches : INITIAL_MATCHES;

  // Active chat match ID state
  const [activeMatchId, setActiveMatchId] = useState<string>(
    initialMatch?.id || connectedList[0]?.id || 'match-meera-30'
  );

  // Sync if initialMatch prop changes externally
  useEffect(() => {
    if (initialMatch?.id) {
      setActiveMatchId(initialMatch.id);
    }
  }, [initialMatch?.id]);

  const activeMatch = connectedList.find((m) => m.id === activeMatchId) || initialMatch || connectedList[0];

  // Mobile view toggle: 'list' (conversations list) vs 'chat' (active conversation)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUnmatchConfirmOpen, setIsUnmatchConfirmOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Retrieve current conversation messages or default
  const conversationMessages: ChatMessage[] = (conversations && conversations[activeMatch.id]) || [
    {
      id: `msg-initial-${activeMatch.id}`,
      senderId: activeMatch.profileId,
      text:
        activeMatch.name === 'Meera' || activeMatch.name.startsWith('Meera')
          ? "Thank you for accepting — I'm Meera. How has your week been?"
          : `Hello! Happy to connect with you on VennZ.`,
      timestamp: activeMatch.matchedAt || Date.now() - 3600000,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages.length, activeMatchId]);

  useEffect(() => {
    if (activeMatch?.id) {
      markConversationRead(activeMatch.id);
    }
  }, [activeMatch?.id, markConversationRead]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendChatMessage(activeMatch.id, trimmed);
    setMessageInput('');
  };

  const handleUnmatch = () => {
    setIsUnmatchConfirmOpen(false);
    setIsMenuOpen(false);
    unmatchUser(activeMatch.id);
    const remaining = connectedList.filter((m) => m.id !== activeMatch.id);
    if (remaining.length > 0) {
      setActiveMatchId(remaining[0].id);
    } else {
      onBack();
    }
  };

  const handleBlock = () => {
    setIsBlockConfirmOpen(false);
    setIsMenuOpen(false);
    blockUser(activeMatch.id);
    const remaining = connectedList.filter((m) => m.id !== activeMatch.id);
    if (remaining.length > 0) {
      setActiveMatchId(remaining[0].id);
    } else {
      onBack();
    }
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    if (onNavigateHelp) {
      onNavigateHelp('REPORT A MEMBER');
    } else {
      showToast(`Report filed for ${activeMatch.name}`);
    }
  };

  // Filter connected matches by search
  const filteredMatches = connectedList.filter((m) =>
    `${m.name} ${m.designation || ''} ${m.city || ''}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  // User handle for the sidebar header
  const userHandle = profile.vennzName
    ? profile.vennzName.toLowerCase().replace(/\s+/g, '_')
    : profile.firstName
    ? `${profile.firstName.toLowerCase()}_vennz`
    : 'vennz_member';

  // Luxury Minimalist Theme Palette sticking strictly to VennZ identity
  const colors = {
    bg: isDark ? '#140E1C' : '#FAF1F3',
    sidebarBg: isDark ? 'rgba(23, 13, 23, 0.96)' : 'rgba(255, 255, 255, 0.95)',
    text: isDark ? '#FDF3F5' : '#462037',
    muted: isDark ? 'rgba(253, 243, 245, 0.65)' : '#683A46',
    border: isDark ? 'rgba(161, 82, 95, 0.24)' : 'rgba(161, 82, 95, 0.16)',
    headerBg: isDark ? 'rgba(20, 14, 28, 0.94)' : 'rgba(255, 255, 255, 0.92)',
    inputBg: isDark ? 'rgba(38, 20, 34, 0.82)' : 'rgba(255, 255, 255, 0.95)',
    activeItemBg: isDark ? 'rgba(199, 87, 124, 0.18)' : 'rgba(161, 82, 95, 0.12)',
    hoverItemBg: isDark ? 'rgba(199, 87, 124, 0.08)' : 'rgba(161, 82, 95, 0.06)',
    myBubbleBg: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
    theirBubbleBg: isDark ? 'rgba(46, 24, 40, 0.9)' : 'rgba(255, 255, 255, 0.95)',
  };

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d';
    return `${diffDays}d`;
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
          opacity: isDark ? 0.94 : 0.92,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.52)' : 'rgba(250, 241, 243, 0.4)',
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
            backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.96)',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Global Fixed Member Top Bar */}
      <MemberTopBar onConciergeClick={() => onNavigateHelp && onNavigateHelp()} />

      {/* TWO-COLUMN DIRECT MESSAGING INTERFACE */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          width: '100%',
          height: 'calc(100% - 64px)',
          overflow: 'hidden',
        }}
      >
        {/* ======================================================== */}
        {/* LEFT SIDEBAR: Connected People & Conversations List      */}
        {/* ======================================================== */}
        <div
          className={`chat-sidebar ${mobileView === 'list' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{
            width: '360px',
            minWidth: '310px',
            maxWidth: '400px',
            height: '100%',
            backgroundColor: colors.sidebarBg,
            borderRight: `1px solid ${colors.border}`,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            transition: 'transform 0.25s ease',
          }}
        >
          {/* 1. Sidebar Top Header */}
          <div
            style={{
              padding: '16px 20px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: colors.text,
                }}
              >
                {userHandle}
              </span>
              <ChevronDown size={14} color={colors.muted} />
            </div>

            <button
              type="button"
              onClick={() => showToast('New direct intros available in Discover')}
              aria-label="New conversation"
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text,
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.15s ease',
              }}
            >
              <SquarePen size={19} />
            </button>
          </div>

          {/* 2. Search Bar */}
          <div style={{ padding: '12px 18px 8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: isDark ? 'rgba(46, 24, 40, 0.65)' : 'rgba(161, 82, 95, 0.08)',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '8px 14px',
              }}
            >
              <Search size={15} color={colors.muted} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13.5px',
                  color: colors.text,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>
          </div>

          {/* 3. Notes / Connected Circle Avatars Strip (As seen in Reference Image) */}
          <div
            style={{
              padding: '10px 18px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            {/* User's Note Avatar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                cursor: 'pointer',
              }}
              onClick={() => showToast('Note updated: Exploring intentional connections')}
            >
              <div
                style={{
                  position: 'relative',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: isDark ? '1.5px dashed #F9AAAD' : '1.5px dashed #A1525F',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={
                    profile.photos?.[0] ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85'
                  }
                  alt="Your profile"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-4px',
                    backgroundColor: isDark ? '#C7577C' : '#A1525F',
                    color: '#FFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '999px',
                  }}
                >
                  note
                </span>
              </div>
              <span style={{ fontSize: '11px', color: colors.muted, maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Your note
              </span>
            </div>

            {/* Connected Members in Strip */}
            {connectedList.map((cMatch) => (
              <div
                key={`story-${cMatch.id}`}
                onClick={() => {
                  setActiveMatchId(cMatch.id);
                  setMobileView('chat');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  opacity: cMatch.id === activeMatch.id ? 1 : 0.85,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    border:
                      cMatch.id === activeMatch.id
                        ? '2px solid #C7577C'
                        : isDark
                        ? '1.5px solid rgba(199, 87, 124, 0.4)'
                        : '1.5px solid rgba(161, 82, 95, 0.3)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={cMatch.photo}
                    alt={cMatch.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: '#34D399',
                      border: '1.5px solid #fff',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: cMatch.id === activeMatch.id ? 600 : 400,
                    color: cMatch.id === activeMatch.id ? colors.text : colors.muted,
                    maxWidth: '62px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cMatch.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* 4. Section Subheader: Messages / Requests Tabs */}
          <div
            style={{
              padding: '12px 20px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: colors.text,
              }}
            >
              Messages
            </span>

            {incomingRequests && incomingRequests.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectTab('matches')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Requests</span>
                <span
                  style={{
                    backgroundColor: isDark ? '#C7577C' : '#A1525F',
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '999px',
                  }}
                >
                  {incomingRequests.length}
                </span>
              </button>
            )}
          </div>

          {/* 5. List of Connected People (Only people we are connected to) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '4px 10px 100px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {filteredMatches.length === 0 ? (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  color: colors.muted,
                  fontSize: '13px',
                }}
              >
                No matching connections found.
              </div>
            ) : (
              filteredMatches.map((cMatch) => {
                const isSelected = cMatch.id === activeMatch.id;
                const matchConvo = conversations[cMatch.id];
                const lastMsg =
                  matchConvo && matchConvo.length > 0
                    ? matchConvo[matchConvo.length - 1]
                    : null;
                const previewText =
                  lastMsg?.text || cMatch.lastMessage || 'Connected intentionally on VennZ';
                const timeText = formatMessageTime(lastMsg?.timestamp || cMatch.lastMessageTime || cMatch.matchedAt);

                return (
                  <button
                    key={cMatch.id}
                    type="button"
                    onClick={() => {
                      setActiveMatchId(cMatch.id);
                      setMobileView('chat');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRadius: '16px',
                      border: isSelected
                        ? isDark
                          ? '1px solid rgba(199, 87, 124, 0.45)'
                          : '1px solid rgba(161, 82, 95, 0.35)'
                        : '1px solid transparent',
                      backgroundColor: isSelected ? colors.activeItemBg : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = colors.hoverItemBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* Person Avatar with Status Indicator */}
                    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                      <img
                        src={cMatch.photo}
                        alt={cMatch.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isDark
                            ? '1.5px solid rgba(199, 87, 124, 0.4)'
                            : '1.5px solid rgba(161, 82, 95, 0.3)',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '1px',
                          right: '1px',
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          backgroundColor: '#34D399',
                          border: '1.5px solid #fff',
                        }}
                      />
                    </div>

                    {/* Person Details & Latest Message Preview */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '15.5px',
                            fontWeight: isSelected ? 600 : 500,
                            color: colors.text,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cMatch.name}
                        </span>
                        {timeText && (
                          <span style={{ fontSize: '11px', color: colors.muted, flexShrink: 0 }}>
                            {timeText}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '12.5px',
                          color: colors.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.3,
                        }}
                      >
                        {previewText}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: Active Chat Conversation View                */}
        {/* ======================================================== */}
        <div
          className={`chat-main-pane ${mobileView === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Active Chat Header */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.headerBg,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              zIndex: 30,
            }}
          >
            {/* Left: Avatar, Name & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Mobile Back to List button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setMobileView('list');
                  } else {
                    onBack();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={18} />
              </button>

              <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                <img
                  src={activeMatch.photo}
                  alt={activeMatch.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: isDark
                      ? '1.5px solid rgba(199, 87, 124, 0.5)'
                      : '1.5px solid rgba(161, 82, 95, 0.4)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '9px',
                    height: '9px',
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
                    {activeMatch.name}
                  </span>
                  {activeMatch.isVerified && (
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
                  {[activeMatch.designation, activeMatch.city].filter(Boolean).join(' · ')}
                </span>
              </div>
            </div>

            {/* Right: Phone, Video & Info Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={() => showToast(`Calling ${activeMatch.name} via VennZ Encrypted Voice...`)}
                aria-label="Audio call"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Phone size={19} />
              </button>

              <button
                type="button"
                onClick={() => showToast(`Starting secure VennZ video room with ${activeMatch.name}...`)}
                aria-label="Video call"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Video size={21} />
              </button>

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
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Info size={19} />
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
                        minWidth: '190px',
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
          </div>

          {/* Conversation Feed */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '20px 24px 100px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Subtle Date Timestamp Pill */}
              <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: colors.muted,
                    backgroundColor: isDark ? 'rgba(46, 24, 40, 0.6)' : 'rgba(161, 82, 95, 0.08)',
                    padding: '4px 12px',
                    borderRadius: '999px',
                  }}
                >
                  Intentional VennZ Connection · Verified
                </span>
              </div>

              {/* Message Bubbles Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conversationMessages.map((msg, index) => {
                  const isMe = msg.senderId === 'me';
                  const isLastInGroup =
                    index === conversationMessages.length - 1 ||
                    conversationMessages[index + 1]?.senderId !== msg.senderId;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      {/* Avatar next to incoming messages from the other person (As seen in Reference Image) */}
                      {!isMe && (
                        <div style={{ width: '28px', height: '28px', flexShrink: 0, marginBottom: '2px' }}>
                          {isLastInGroup ? (
                            <img
                              src={activeMatch.photo}
                              alt={activeMatch.name}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: isDark
                                  ? '1px solid rgba(199, 87, 124, 0.4)'
                                  : '1px solid rgba(161, 82, 95, 0.3)',
                              }}
                            />
                          ) : (
                            <div style={{ width: '28px', height: '28px' }} />
                          )}
                        </div>
                      )}

                      {/* Bubble Container */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '72%',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 18px',
                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            background: isMe ? colors.myBubbleBg : colors.theirBubbleBg,
                            color: isMe ? '#FFFFFF' : colors.text,
                            border: isMe ? 'none' : `1px solid ${colors.border}`,
                            boxShadow: isDark
                              ? '0 4px 18px rgba(0, 0, 0, 0.25)'
                              : '0 4px 14px rgba(161, 82, 95, 0.08)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14.5px',
                            lineHeight: '1.45',
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.text}
                        </div>

                        {/* Timestamp & Delivery status */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '3px',
                            padding: isMe ? '0 4px 0 0' : '0 0 0 4px',
                            fontSize: '10.5px',
                            color: colors.muted,
                          }}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck size={12} color={isDark ? '#86EFAC' : '#2E7D32'} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Minimalist Floating Input Dock (Matching Reference Image Layout) */}
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
                maxWidth: '780px',
                margin: '0 auto',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px 6px 14px',
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
              {/* Left: Emoji Icon */}
              <button
                type="button"
                onClick={() => setMessageInput((prev) => `${prev}✨ `)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Add emoji"
              >
                <Smile size={20} />
              </button>

              {/* Message Input */}
              <input
                type="text"
                aria-label="Message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14.5px',
                  color: colors.text,
                  padding: '8px 4px',
                }}
              />

              {/* Right: Mic, Image & Send */}
              <button
                type="button"
                onClick={() => showToast('Voice messages enabled for Circle members')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Record voice note"
              >
                <Mic size={19} />
              </button>

              <button
                type="button"
                onClick={() => showToast('Photo sharing enabled in mixer groups')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Attach photo"
              >
                <ImageIcon size={19} />
              </button>

              <button
                type="submit"
                disabled={!messageInput.trim()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: messageInput.trim()
                    ? colors.myBubbleBg
                    : isDark
                    ? 'rgba(70, 32, 55, 0.4)'
                    : 'rgba(161, 82, 95, 0.15)',
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
        </div>
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
                Unmatch with {activeMatch.name}?
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
                Block {activeMatch.name}?
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: colors.muted, margin: '0 0 20px 0' }}>
                {activeMatch.name} will be removed and will never appear in your introductions again.
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

      {/* Responsive Styles for Desktop / Mobile */}
      <style>{`
        @media (max-width: 767px) {
          .chat-sidebar.mobile-hidden {
            display: none !important;
          }
          .chat-sidebar.mobile-visible {
            width: 100% !important;
            max-width: 100% !important;
            border-right: none !important;
          }
          .chat-main-pane.mobile-hidden {
            display: none !important;
          }
          .chat-main-pane.mobile-visible {
            width: 100% !important;
            flex: 1 !important;
          }
        }
        @media (min-width: 768px) {
          .chat-sidebar {
            display: flex !important;
          }
          .chat-main-pane {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
