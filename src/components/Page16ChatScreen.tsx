import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Send,
  MessageCircle,
  Compass,
  Sparkles,
  Wine,
  User,
  ArrowLeft,
  MoreVertical,
  CheckCheck,
  Paperclip,
  Smile,
  ShieldCheck,
  Phone,
  Video,
  X,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { ModalPortal } from './ModalPortal';
import { useAuth } from '../context/AuthContext';
import type { MatchItem, ChatMessage } from '../types/matches';
import type { MemberTab } from './MemberBottomNav';

interface Page16ChatScreenProps {
  match: MatchItem;
  onBack: () => void;
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: (prefilledCategory?: string) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

const formatConversationTime = (timestamp?: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMessageTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
};

export const Page16ChatScreen: React.FC<Page16ChatScreenProps> = ({
  match: initialMatch,
  onBack,
  onSelectTab,
  onNavigateHelp,
  showStatusBar = true,
}) => {
  const {
    appearanceMode,
    profile,
    matches,
    conversations,
    unreadMatchIds,
    sendChatMessage,
    markConversationRead,
    unmatchUser,
    blockUser,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  // Responsive mobile vs desktop tracking
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 860;

  // Active match selection
  const [activeMatch, setActiveMatch] = useState<MatchItem>(initialMatch);
  // On mobile: 'list' (conversation selection) or 'chat' (active message thread)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  // Search filter for conversation list
  const [searchQuery, setSearchQuery] = useState('');

  // Input composer
  const [messageInput, setMessageInput] = useState('');

  // Modals & Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUnmatchConfirmOpen, setIsUnmatchConfirmOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [callModalInfo, setCallModalInfo] = useState<'audio' | 'video' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Keep active match updated if initialMatch changes externally
  useEffect(() => {
    if (initialMatch && initialMatch.id !== activeMatch.id) {
      setActiveMatch(initialMatch);
      if (isMobile) setMobileView('chat');
    }
  }, [initialMatch]);

  // Aggregate conversation list: user's matches + ensuring active match is always included
  const conversationList: MatchItem[] = useMemo(() => {
    const map = new Map<string, MatchItem>();
    if (initialMatch) {
      map.set(initialMatch.id, initialMatch);
    }
    if (matches && matches.length > 0) {
      matches.forEach((m) => map.set(m.id, m));
    }
    if (activeMatch) {
      map.set(activeMatch.id, activeMatch);
    }

    const list = Array.from(map.values());
    return list.sort(
      (a, b) => (b.lastMessageTime || b.matchedAt || 0) - (a.lastMessageTime || a.matchedAt || 0)
    );
  }, [matches, initialMatch, activeMatch]);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversationList;
    const q = searchQuery.toLowerCase().trim();
    return conversationList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.designation && c.designation.toLowerCase().includes(q))
    );
  }, [conversationList, searchQuery]);

  // Mark conversation read whenever activeMatch changes
  useEffect(() => {
    if (activeMatch?.id) {
      markConversationRead(activeMatch.id);
    }
  }, [activeMatch?.id, markConversationRead]);

  // Retrieve current active conversation messages
  const activeMessages: ChatMessage[] = useMemo(() => {
    if (conversations && conversations[activeMatch.id] && conversations[activeMatch.id].length > 0) {
      return conversations[activeMatch.id];
    }
    return [
      {
        id: `msg-initial-${activeMatch.id}`,
        senderId: activeMatch.profileId,
        text:
          activeMatch.lastMessage ||
          (activeMatch.name.startsWith('Meera')
            ? "Thank you for accepting — I'm Meera. How has your week been?"
            : `Hello! Happy to connect with you on VennZ.`),
        timestamp: activeMatch.matchedAt || Date.now(),
      },
    ];
  }, [conversations, activeMatch]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeMatch.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendChatMessage(activeMatch.id, trimmed);
    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (item: MatchItem) => {
    setActiveMatch(item);
    if (isMobile) {
      setMobileView('chat');
    }
  };

  const handleUnmatch = () => {
    setIsUnmatchConfirmOpen(false);
    setIsMenuOpen(false);
    unmatchUser(activeMatch.id);
    const remaining = conversationList.filter((c) => c.id !== activeMatch.id);
    if (remaining.length > 0) {
      setActiveMatch(remaining[0]);
      showToast(`Unmatched from ${activeMatch.name}`);
    } else {
      onBack();
    }
  };

  const handleBlock = () => {
    setIsBlockConfirmOpen(false);
    setIsMenuOpen(false);
    blockUser(activeMatch.id);
    onBack();
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    if (onNavigateHelp) {
      onNavigateHelp('REPORT A MEMBER');
    } else {
      showToast(`Report submitted for ${activeMatch.name}`);
    }
  };

  const openingPrompts = activeMessages.some((m) => m.senderId === 'me')
    ? []
    : [
        'What are you looking forward to lately?',
        'What does a perfect weekend look like for you?',
        'What have you been enjoying outside work?',
      ];

  // VennZ Design System Palette
  const colors = {
    bgDark: '#140E1C',
    bgLight: '#FAF1F3',
    plum: '#462037',
    mauve: '#683A46',
    dustyRose: '#A1525F',
    roseAccent: '#C7577C',
    softBlush: '#F9AAAD',
    textMain: isDark ? '#FDF3F5' : '#462037',
    textMuted: isDark ? 'rgba(253, 243, 245, 0.65)' : '#683A46',
    border: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(161, 82, 95, 0.16)',
    cardBg: isDark ? 'rgba(46, 22, 38, 0.55)' : 'rgba(255, 255, 255, 0.65)',
    cardBgActive: isDark ? 'rgba(161, 82, 95, 0.24)' : 'rgba(199, 87, 124, 0.12)',
    cardBorderActive: isDark ? 'rgba(199, 87, 124, 0.45)' : 'rgba(199, 87, 124, 0.35)',
    incomingBubble: isDark ? 'rgba(70, 32, 55, 0.62)' : 'rgba(255, 255, 255, 0.92)',
    incomingBorder: isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)',
    outgoingBubble: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
    composerBg: isDark ? 'rgba(28, 16, 26, 0.85)' : 'rgba(255, 255, 255, 0.92)',
    glassSurface: isDark ? 'rgba(20, 14, 28, 0.76)' : 'rgba(255, 255, 255, 0.78)',
  };

  const userAvatar =
    profile?.photos && profile.photos.length > 0
      ? profile.photos[0]
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? colors.bgDark : colors.bgLight,
        color: colors.textMain,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient Botanical Backdrop Wallpaper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.92 : 0.85,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* Restrained Depth Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.55)' : 'rgba(250, 241, 243, 0.35)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Optional iOS Status Bar for standalone viewports */}
      {showStatusBar && (
        <div
          style={{
            position: 'relative',
            zIndex: 40,
            backgroundColor: isDark ? 'rgba(20, 14, 28, 0.95)' : 'rgba(250, 241, 243, 0.9)',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Main Chat Interface Container (Layered Glass Shell) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '0' : '16px 24px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          height: isMobile ? '100vh' : 'calc(100vh - 84px)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundColor: colors.glassSurface,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: isMobile ? '0' : '24px',
            border: isMobile ? 'none' : `1px solid ${colors.border}`,
            boxShadow: isDark
              ? '0 24px 64px rgba(0, 0, 0, 0.55)'
              : '0 20px 50px rgba(70, 32, 55, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* ============================================================== */}
          {/* 1. SLIM LEFT NAVIGATION RAIL (Desktop only or icon rail) */}
          {/* ============================================================== */}
          {!isMobile && (
            <aside
              aria-label="VennZ Navigation Rail"
              style={{
                width: '68px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 0',
                borderRight: `1px solid ${colors.border}`,
                backgroundColor: isDark ? 'rgba(20, 14, 28, 0.65)' : 'rgba(255, 255, 255, 0.5)',
                boxSizing: 'border-box',
                zIndex: 2,
              }}
            >
              {/* Top: Current User Profile / Avatar */}
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => onSelectTab('you')}
                  aria-label="View Your Profile"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: `1.5px solid ${colors.dustyRose}`,
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  <img
                    src={userAvatar}
                    alt={profile?.vennzName || 'You'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
                {/* Active Online Indicator Ring */}
                <span
                  title="Active Session"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    border: `2px solid ${isDark ? colors.bgDark : '#FFFFFF'}`,
                  }}
                />
              </div>

              {/* Middle: Primary Navigation Icons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {/* Discover Tab */}
                <button
                  type="button"
                  onClick={() => onSelectTab('discover')}
                  title="Curated Introductions"
                  aria-label="Discover"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.softBlush)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                >
                  <Compass size={22} strokeWidth={1.75} />
                </button>

                {/* Messages / Matches Tab (Active Layered Pill Indicator) */}
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isMobile) setMobileView('list');
                    }}
                    title="Active Messages"
                    aria-label="Active Messages"
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: colors.outgoingBubble,
                      border: 'none',
                      color: '#FDF3F5',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(161, 82, 95, 0.42)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <MessageCircle size={22} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Elevate Concierge Tab */}
                <button
                  type="button"
                  onClick={() => onSelectTab('elevate')}
                  title="Elevate Concierge"
                  aria-label="Elevate Concierge"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.softBlush)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                >
                  <Sparkles size={21} strokeWidth={1.75} />
                </button>

                {/* Mixers Tab */}
                <button
                  type="button"
                  onClick={() => onSelectTab('mixers')}
                  title="Private Mixers"
                  aria-label="Private Mixers"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.softBlush)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                >
                  <Wine size={21} strokeWidth={1.75} />
                </button>

                {/* Profile / You Tab */}
                <button
                  type="button"
                  onClick={() => onSelectTab('you')}
                  title="Account Standards"
                  aria-label="Account Standards"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.softBlush)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                >
                  <User size={21} strokeWidth={1.75} />
                </button>
              </div>

              {/* Bottom: Exit / Return to Matches Screen */}
              <button
                type="button"
                onClick={onBack}
                title="Return to Matches"
                aria-label="Return to Matches"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.roseAccent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
              >
                <ArrowLeft size={21} strokeWidth={2} />
              </button>
            </aside>
          )}

          {/* ============================================================== */}
          {/* 2. CONVERSATION LIST PANEL (Individual matches only - No groups) */}
          {/* ============================================================== */}
          {(!isMobile || mobileView === 'list') && (
            <section
              aria-label="Conversation List"
              style={{
                width: isMobile ? '100%' : '320px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: isMobile ? 'none' : `1px solid ${colors.border}`,
                backgroundColor: isDark ? 'rgba(26, 14, 25, 0.45)' : 'rgba(255, 255, 255, 0.45)',
                boxSizing: 'border-box',
                height: '100%',
              }}
            >
              {/* Header with Search */}
              <div
                style={{
                  padding: '20px 18px 14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {/* Search Capsule Input */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: isDark ? 'rgba(46, 22, 38, 0.6)' : 'rgba(255, 255, 255, 0.75)',
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    padding: '0 12px',
                    height: '42px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Search size={16} style={{ color: colors.textMuted, marginRight: '8px', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: colors.textMain,
                      fontSize: '13.5px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear Search"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Section Header: Direct Connections (No Groups) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: colors.textMuted,
                    }}
                  >
                    Conversations
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(199, 87, 124, 0.15)',
                      color: colors.softBlush,
                    }}
                  >
                    {filteredConversations.length}
                  </span>
                </div>
              </div>

              {/* Scrollable Conversation Cards */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((item) => {
                    const isSelected = activeMatch?.id === item.id;
                    const isUnread = unreadMatchIds.includes(item.id);

                    // Latest message snippet
                    const convoMsgs = conversations?.[item.id] || [];
                    const lastMsg =
                      convoMsgs.length > 0
                        ? convoMsgs[convoMsgs.length - 1].text
                        : item.lastMessage || 'Connected on VennZ';
                    const timeLabel = formatConversationTime(
                      convoMsgs.length > 0
                        ? convoMsgs[convoMsgs.length - 1].timestamp
                        : item.lastMessageTime || item.matchedAt
                    );

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectConversation(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectConversation(item);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '16px',
                          backgroundColor: isSelected ? colors.cardBgActive : colors.cardBg,
                          border: `1px solid ${isSelected ? colors.cardBorderActive : colors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected
                            ? '0 6px 20px rgba(161, 82, 95, 0.18)'
                            : 'none',
                          outline: 'none',
                        }}
                      >
                        {/* Recipient Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img
                            src={item.photo}
                            alt={item.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '14px',
                              objectFit: 'cover',
                              backgroundColor: isDark ? '#2B1423' : '#F1E5E8',
                              border: `1px solid ${isSelected ? colors.dustyRose : colors.border}`,
                            }}
                          />
                          {item.isVerified && (
                            <span
                              title="Verified by DigiLocker"
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                width: '15px',
                                height: '15px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? '#140E1C' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              }}
                            >
                              <ShieldCheck size={12} style={{ color: '#4CAF50' }} />
                            </span>
                          )}
                        </div>

                        {/* Middle Text: Name & Last Message */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '3px',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '15.5px',
                                fontWeight: isSelected ? 700 : 600,
                                color: isSelected ? (isDark ? '#FFFFFF' : colors.plum) : colors.textMain,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.name}
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                color: isSelected ? colors.softBlush : colors.textMuted,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                marginLeft: '6px',
                              }}
                            >
                              {timeLabel}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '12px',
                                color: isSelected
                                  ? (isDark ? '#FDF3F5' : '#462037')
                                  : colors.textMuted,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '180px',
                                lineHeight: 1.3,
                              }}
                            >
                              {lastMsg}
                            </p>

                            {/* Unread dot or read status */}
                            {isUnread ? (
                              <span
                                aria-label="Unread message"
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: colors.roseAccent,
                                  boxShadow: '0 0 8px rgba(199, 87, 124, 0.7)',
                                  flexShrink: 0,
                                  marginLeft: '6px',
                                }}
                              />
                            ) : (
                              <CheckCheck
                                size={13}
                                style={{
                                  color: colors.textMuted,
                                  opacity: 0.65,
                                  flexShrink: 0,
                                  marginLeft: '6px',
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: colors.textMuted,
                      fontSize: '13px',
                    }}
                  >
                    No matching conversations found.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* 3. ACTIVE CONVERSATION PANEL (Right panel) */}
          {/* ============================================================== */}
          {(!isMobile || mobileView === 'chat') && (
            <main
              aria-label={`Conversation with ${activeMatch.name}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: isDark ? 'rgba(18, 10, 22, 0.35)' : 'rgba(255, 255, 255, 0.25)',
                minWidth: 0,
                position: 'relative',
              }}
            >
              {/* Active Conversation Header */}
              <header
                style={{
                  height: '68px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 22px',
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? 'rgba(22, 12, 24, 0.75)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  zIndex: 10,
                }}
              >
                {/* Left: Mobile back button + Recipient Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      aria-label="Back to conversations"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: colors.textMain,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        marginLeft: '-6px',
                      }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}

                  {/* Recipient Photo with Active Glow */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={activeMatch.photo}
                      alt={activeMatch.name}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: `1.5px solid ${colors.dustyRose}`,
                      }}
                    />
                    {activeMatch.isVerified && (
                      <span
                        title="Identity Verified"
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          backgroundColor: '#4CAF50',
                          border: `2px solid ${isDark ? colors.bgDark : '#FFFFFF'}`,
                        }}
                      />
                    )}
                  </div>

                  {/* Recipient Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-serif)',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: colors.textMain,
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {activeMatch.name}
                      </h2>
                      {activeMatch.isVerified && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: isDark ? '#81C784' : '#2E7D32',
                            backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Verified
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '11.5px',
                        color: colors.textMuted,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '1px',
                      }}
                    >
                      {activeMatch.designation ? `${activeMatch.designation} · ` : ''}
                      {activeMatch.city || 'Verified Member'}
                    </span>
                  </div>
                </div>

                {/* Right: Actions (Subtle audio/video concierge call info & conversation settings menu) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Audio Call Action */}
                  <button
                    type="button"
                    onClick={() => setCallModalInfo('audio')}
                    title="Audio Connection"
                    aria-label="Start Voice Call"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.softBlush;
                      e.currentTarget.style.backgroundColor = isDark
                        ? 'rgba(161, 82, 95, 0.18)'
                        : 'rgba(199, 87, 124, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.textMuted;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Phone size={18} strokeWidth={1.8} />
                  </button>

                  {/* Video Call Action */}
                  <button
                    type="button"
                    onClick={() => setCallModalInfo('video')}
                    title="Video Connection"
                    aria-label="Start Video Call"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.softBlush;
                      e.currentTarget.style.backgroundColor = isDark
                        ? 'rgba(161, 82, 95, 0.18)'
                        : 'rgba(199, 87, 124, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.textMuted;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Video size={19} strokeWidth={1.8} />
                  </button>

                  {/* Three-Dot Menu */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      aria-label="Conversation Actions Menu"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.softBlush;
                        e.currentTarget.style.backgroundColor = isDark
                          ? 'rgba(161, 82, 95, 0.18)'
                          : 'rgba(199, 87, 124, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.textMuted;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <MoreVertical size={19} />
                    </button>

                    {/* Dropdown Menu Portal */}
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
                            top: '44px',
                            right: 0,
                            zIndex: 70,
                            minWidth: '170px',
                            backgroundColor: isDark ? '#1C1020' : '#FFFFFF',
                            borderRadius: '14px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
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
                              color: colors.textMain,
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = isDark
                                ? 'rgba(161, 82, 95, 0.2)'
                                : 'rgba(199, 87, 124, 0.1)')
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                              color: colors.textMain,
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = isDark
                                ? 'rgba(161, 82, 95, 0.2)'
                                : 'rgba(199, 87, 124, 0.1)')
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Report Member
                          </button>
                          <div
                            style={{
                              height: '1px',
                              backgroundColor: colors.border,
                              margin: '4px 0',
                            }}
                          />
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
                              color: '#E06D6D',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = 'rgba(224, 109, 109, 0.12)')
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Block & Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {/* Message Stream Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: '24px 22px 14px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Center Date Pill: "Today" */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <span
                    style={{
                      padding: '4px 14px',
                      borderRadius: '16px',
                      backgroundColor: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(255, 255, 255, 0.75)',
                      border: `1px solid ${colors.border}`,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: colors.textMuted,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    Today
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: colors.textMuted,
                      marginTop: '8px',
                    }}
                  >
                    YOU MATCHED · BE KIND, BE INTENTIONAL
                  </span>
                </div>

                {/* Messages List */}
                {activeMessages.map((msg) => {
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
                          maxWidth: '74%',
                          padding: '12px 16px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? colors.outgoingBubble : colors.incomingBubble,
                          border: isMe ? 'none' : `1px solid ${colors.incomingBorder}`,
                          color: isMe ? '#FDF3F5' : colors.textMain,
                          boxShadow: isMe
                            ? '0 6px 20px rgba(161, 82, 95, 0.32)'
                            : isDark
                            ? '0 4px 14px rgba(0,0,0,0.3)'
                            : '0 4px 12px rgba(161, 82, 95, 0.08)',
                          backdropFilter: isMe ? 'none' : 'blur(12px)',
                          WebkitBackdropFilter: isMe ? 'none' : 'blur(12px)',
                          fontSize: '14.5px',
                          lineHeight: '1.5',
                          wordBreak: 'break-word',
                          position: 'relative',
                        }}
                      >
                        {msg.text}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                            marginTop: '4px',
                          }}
                        >
                          <time
                            dateTime={new Date(msg.timestamp).toISOString()}
                            style={{
                              fontSize: '10px',
                              color: isMe ? 'rgba(253, 243, 245, 0.75)' : colors.textMuted,
                              fontFamily: 'var(--font-sans)',
                            }}
                          >
                            {formatMessageTime(msg.timestamp)}
                          </time>
                          {isMe && (
                            <CheckCheck
                              size={12}
                              style={{ color: '#FDF3F5', opacity: 0.85 }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Starter Prompt Chips for Uninitiated Conversations */}
              {openingPrompts.length > 0 && (
                <div
                  style={{
                    padding: '0 22px 8px 22px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  {openingPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setMessageInput(prompt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? 'rgba(46, 22, 38, 0.5)' : 'rgba(255, 255, 255, 0.75)',
                        color: colors.softBlush,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? 'rgba(161, 82, 95, 0.25)'
                          : 'rgba(199, 87, 124, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? 'rgba(46, 22, 38, 0.5)'
                          : 'rgba(255, 255, 255, 0.75)';
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Persistent Message Composer Capsule */}
              <div
                style={{
                  padding: '12px 20px 18px 20px',
                  boxSizing: 'border-box',
                }}
              >
                <form
                  onSubmit={handleSend}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: colors.composerBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '24px',
                    padding: '6px 10px 6px 16px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0, 0, 0, 0.35)'
                      : '0 8px 24px rgba(70, 32, 55, 0.08)',
                  }}
                >
                  {/* Subtle Attachment / Media Action */}
                  <button
                    type="button"
                    onClick={() => showToast('Photo sharing is enabled during active dates')}
                    title="Share Photograph"
                    aria-label="Add attachment"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.softBlush)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                  >
                    <Paperclip size={18} />
                  </button>

                  {/* Main Text Input */}
                  <input
                    type="text"
                    aria-label="Write a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: colors.textMain,
                      fontSize: '14.5px',
                      fontFamily: 'var(--font-sans)',
                      padding: '8px 2px',
                    }}
                  />

                  {/* Emoji Picker Action */}
                  <button
                    type="button"
                    onClick={() => setMessageInput((prev) => prev + ' ✨')}
                    title="Insert Sparkle"
                    aria-label="Insert Sparkle Emoji"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.softBlush)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                  >
                    <Smile size={18} />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    aria-label="Send Message"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: messageInput.trim()
                        ? colors.outgoingBubble
                        : isDark
                        ? 'rgba(70, 32, 55, 0.4)'
                        : 'rgba(200, 180, 190, 0.4)',
                      border: 'none',
                      color: '#FDF3F5',
                      cursor: messageInput.trim() ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: messageInput.trim()
                        ? '0 4px 16px rgba(161, 82, 95, 0.45)'
                        : 'none',
                      transform: messageInput.trim() ? 'scale(1)' : 'scale(0.95)',
                      opacity: messageInput.trim() ? 1 : 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <Send size={16} style={{ marginLeft: '1px' }} />
                  </button>
                </form>
              </div>
            </main>
          )}
        </div>
      </div>

      {/* CALL CONCIERGE INFORMATION MODAL */}
      {callModalInfo && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(20, 14, 28, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setCallModalInfo(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isDark ? '#1C1020' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '28px 24px',
                maxWidth: '380px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: colors.outgoingBubble,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#FFFFFF',
                }}
              >
                {callModalInfo === 'audio' ? <Phone size={24} /> : <Video size={24} />}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  color: colors.textMain,
                  margin: '0 0 8px 0',
                }}
              >
                {callModalInfo === 'audio' ? 'Private Voice Call' : 'Private Video Session'}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: colors.textMuted,
                  margin: '0 0 24px 0',
                }}
              >
                Direct calls with {activeMatch.name} can be initiated once both members have exchanged introduction messages, or coordinated through the Elevate Concierge desk.
              </p>
              <button
                type="button"
                onClick={() => setCallModalInfo(null)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '22px',
                  background: colors.outgoingBubble,
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(161, 82, 95, 0.35)',
                }}
              >
                Understood
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* UNMATCH CONFIRMATION MODAL */}
      {isUnmatchConfirmOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(20, 14, 28, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
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
                backgroundColor: isDark ? '#1C1020' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '22px',
                padding: '26px 22px',
                maxWidth: '340px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  color: colors.textMain,
                  margin: '0 0 8px 0',
                }}
              >
                Unmatch with {activeMatch.name}?
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: colors.textMuted,
                  margin: '0 0 20px 0',
                }}
              >
                This conversation and match will be quietly removed for both members.
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
                    cursor: 'pointer',
                  }}
                >
                  Confirm Unmatch
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnmatchConfirmOpen(false)}
                  style={{
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: 'transparent',
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
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
              backgroundColor: 'rgba(20, 14, 28, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
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
                backgroundColor: isDark ? '#1C1020' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '22px',
                padding: '26px 22px',
                maxWidth: '340px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  color: '#C94A4A',
                  margin: '0 0 8px 0',
                }}
              >
                Block {activeMatch.name}?
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: colors.textMuted,
                  margin: '0 0 20px 0',
                }}
              >
                They will not be able to message you or view your profile anywhere on VennZ.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleBlock}
                  style={{
                    height: '42px',
                    borderRadius: '21px',
                    backgroundColor: '#C94A4A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Block Member
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockConfirmOpen(false)}
                  style={{
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: 'transparent',
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: isDark ? 'rgba(46, 22, 38, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${colors.dustyRose}`,
            borderRadius: '24px',
            padding: '10px 22px',
            color: colors.textMain,
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
