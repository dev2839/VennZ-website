import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { ModalPortal } from './ModalPortal';
import { useAuth } from '../context/AuthContext';
import { DUMMY_DISCOVER_PROFILES } from '../data/dummyProfiles';
import type { DiscoverProfile } from '../types/discover';
import { DEFAULT_AFTER_HOURS_CONFIG } from '../constants/afterHoursConfig';
import { calculateAgeFromISO } from '../utils/ageCalculation';

interface Page19AfterHoursScreenProps {
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: () => void;
  onUpgradeToMembership?: () => void;
  onNavigateToChat?: () => void;
  onChatViewChange?: (isChatOrQueue: boolean) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

interface EphemeralMessage {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: number;
}

const MoonIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ShieldLockIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="2" />
    <path d="M12 13v3" />
  </svg>
);

const SparkleIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke="none"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

export const Page19AfterHoursScreen: React.FC<Page19AfterHoursScreenProps> = ({
  onSelectTab,
  onNavigateHelp: _onNavigateHelp,
  onUpgradeToMembership,
  onNavigateToChat,
  onChatViewChange,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    profile,
    appearanceMode,
    membershipStatus,
    blockedProfileIds,
    blockUser,
    addDirectMatch,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';
  const isPremium = membershipStatus === 'member';

  // Config parameters
  const config = DEFAULT_AFTER_HOURS_CONFIG;
  const maxChatsTonight = isPremium ? config.premiumBlindChatsPerNight : config.freeBlindChatsPerNight;
  const maxWeeklyMatches = isPremium ? config.premiumMatchesPerWeek : config.freeMatchesPerWeek;

  // Track session usage
  const [chatsUsedTonight, setChatsUsedTonight] = useState<number>(0);
  const [weeklyMatchesCount, setWeeklyMatchesCount] = useState<number>(0);

  // Simulation mode for testing live window anytime
  const [demoForceActiveWindow, setDemoForceActiveWindow] = useState<boolean>(true);

  // Active view: 'lobby' | 'queue' | 'chat'
  const [activeView, setActiveView] = useState<'lobby' | 'queue' | 'chat'>('lobby');

  // Match partner in current chat
  const [partner, setPartner] = useState<DiscoverProfile | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<EphemeralMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [inputWarning, setInputWarning] = useState<string | null>(null);

  // Countdown timer in seconds (8 minutes default)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(config.conversationDurationSeconds);

  // Mutual Consent Reveal state
  const [userRequestedReveal, setUserRequestedReveal] = useState<boolean>(false);
  const [partnerRequestedReveal, setPartnerRequestedReveal] = useState<boolean>(false);
  const [isMutualMatchRevealed, setIsMutualMatchRevealed] = useState<boolean>(false);

  // Modals
  const [showTimesUpModal, setShowTimesUpModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [showRetentionModal, setShowRetentionModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Inappropriate or unsolicited conduct');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  // Queue state
  const [queueElapsedSeconds, setQueueElapsedSeconds] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notify parent of chat/queue view state to manage full-height and footer
  useEffect(() => {
    onChatViewChange?.(activeView === 'chat' || activeView === 'queue');
  }, [activeView, onChatViewChange]);

  // Always reset scroll to the top whenever switching between lobby, queue, and chat
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [activeView]);

  // Calculate current user's age
  const userAge = profile.dateOfBirth ? calculateAgeFromISO(profile.dateOfBirth) : 27;

  // Window check: is current time between 10 PM and 11 PM?
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const isRealWindowActive =
    (currentHour === config.windowStartHour && currentMinute >= config.windowStartMinute) ||
    (currentHour > config.windowStartHour && currentHour < config.windowEndHour);

  const isWindowActive = demoForceActiveWindow || isRealWindowActive;

  // Countdown to next 10:00 PM window
  const getNextWindowRemaining = () => {
    const now = currentTime;
    const target = new Date(now);
    if (now.getHours() >= config.windowEndHour) {
      target.setDate(target.getDate() + 1);
    }
    target.setHours(config.windowStartHour, config.windowStartMinute, 0, 0);
    const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // FIFO Queue matchmaking timer
  useEffect(() => {
    if (activeView !== 'queue') return;

    const queueInterval = setInterval(() => {
      setQueueElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const matchTimeout = setTimeout(() => {
      // Find candidate matching age criteria (±4 years) and not blocked
      const userPref = (profile.datingPreference || '').toUpperCase();
      const eligiblePool = DUMMY_DISCOVER_PROFILES.filter((cand) => {
        if (blockedProfileIds && blockedProfileIds.includes(cand.id)) return false;
        const ageDiff = Math.abs(cand.age - userAge);
        if (ageDiff > config.maxAgeDifference) return false;
        if (userPref.includes('WOMEN') && cand.gender !== 'woman') return false;
        if (userPref.includes('MEN') && cand.gender !== 'man') return false;
        return true;
      });

      const chosenCandidate =
        eligiblePool.length > 0
          ? eligiblePool[Math.floor(Math.random() * eligiblePool.length)]
          : DUMMY_DISCOVER_PROFILES[0];

      setPartner(chosenCandidate);
      setRemainingSeconds(config.conversationDurationSeconds);
      setUserRequestedReveal(false);
      setPartnerRequestedReveal(false);
      setIsMutualMatchRevealed(false);

      // Seed initial mystery blind opening
      setMessages([
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'partner',
          text: `Good evening! I just joined the 8-minute After Hours window. How has your night been?`,
          timestamp: Date.now(),
        },
      ]);

      setChatsUsedTonight((prev) => prev + 1);
      setActiveView('chat');
    }, Math.floor(config.fifoQueueTimeoutSeconds * 1000));

    return () => {
      clearInterval(queueInterval);
      clearTimeout(matchTimeout);
    };
  }, [activeView, userAge, blockedProfileIds, config, profile.datingPreference]);

  // Chat Countdown Timer (8 minutes)
  useEffect(() => {
    if (activeView !== 'chat') return;

    const chatTimer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(chatTimer);
          if (!isMutualMatchRevealed) {
            setShowTimesUpModal(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(chatTimer);
  }, [activeView, isMutualMatchRevealed]);

  // Auto-scroll messages
  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  // Format seconds into MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Anti-leak validation for URLs, social handles, or phone numbers
  const checkForbiddenContent = (text: string): boolean => {
    const urlPattern = /(https?:\/\/|www\.|\.com|\.in|\.org|\.co|\.net|\.io|instagram\.com|t\.me|wa\.me|\+?\d{10})/i;
    return urlPattern.test(text);
  };

  // Handle message sending
  const handleSendMessage = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    if (checkForbiddenContent(trimmed)) {
      setInputWarning('Links, phone numbers, and external handles are blocked during After Hours.');
      return;
    }

    const newMsg: EphemeralMessage = {
      id: `msg-me-${Date.now()}`,
      sender: 'me',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setInputWarning(null);

    // Natural simulated reply from partner after a brief pause
    if (messages.length < 5 && partner) {
      setTimeout(() => {
        const partnerReplies = [
          "I appreciate that thought. That's actually quite rare to hear.",
          "That sounds wonderful. I was hoping for a genuine conversation tonight.",
          "I love how candid this is without profile photos getting in the way first.",
          "Couldn't agree more. What's something that made you smile today?",
        ];
        const replyText = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-partner-${Date.now()}`,
            sender: 'partner',
            text: replyText,
            timestamp: Date.now(),
          },
        ]);
      }, 1800);
    }
  };

  // User initiates Reveal & Match
  const handleUserRequestReveal = () => {
    setUserRequestedReveal(true);
    // Partner reciprocates after a thoughtful 2.5s pause
    setTimeout(() => {
      setPartnerRequestedReveal(true);
      setIsMutualMatchRevealed(true);
      setWeeklyMatchesCount((prev) => prev + 1);

      // Add to permanent matches
      if (partner) {
        addDirectMatch({
          id: `match-ah-${partner.id}`,
          profileId: partner.id,
          name: partner.firstName,
          age: partner.age,
          city: partner.city,
          designation: partner.designation,
          company: partner.company,
          photo: partner.photos[0],
          isVerified: partner.isVerified,
          matchedAt: Date.now(),
          lastMessage: `Connected intentionally via VennZ After Hours! We both mutually agreed to reveal our profiles.`,
          lastMessageTime: Date.now(),
        });
      }
    }, 2400);
  };

  // Partner initiated Reveal, user agrees
  const handleUserAcceptReveal = () => {
    setUserRequestedReveal(true);
    setIsMutualMatchRevealed(true);
    setWeeklyMatchesCount((prev) => prev + 1);

    if (partner) {
      addDirectMatch({
        id: `match-ah-${partner.id}`,
        profileId: partner.id,
        name: partner.firstName,
        age: partner.age,
        city: partner.city,
        designation: partner.designation,
        company: partner.company,
        photo: partner.photos[0],
        isVerified: partner.isVerified,
        matchedAt: Date.now(),
        lastMessage: `Connected intentionally via VennZ After Hours! We both mutually agreed to reveal our profiles.`,
        lastMessageTime: Date.now(),
      });
    }
  };

  // End conversation quietly
  const handleEndConversation = () => {
    setActiveView('lobby');
    setPartner(null);
    setMessages([]);
    setUserRequestedReveal(false);
    setPartnerRequestedReveal(false);
    setIsMutualMatchRevealed(false);
  };

  // Submit Safety Report
  const handleSubmitReport = () => {
    setReportSuccessMessage('Report logged securely for Trust & Safety review. Thank you for protecting the community.');
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccessMessage(null);
      handleEndConversation();
    }, 1600);
  };

  // Submit Block
  const handleConfirmBlock = () => {
    if (partner) {
      blockUser(partner.id);
    }
    setShowBlockModal(false);
    handleEndConversation();
  };

  // Theme palettes
  const bgMain = isDark ? '#140E1C' : '#FAF1F3';
  const textPrimary = isDark ? '#FDF3F5' : '#462037';
  const textMuted = isDark ? '#B3A1A8' : '#8A7A84';
  const cardBg = isDark ? 'rgba(32, 22, 44, 0.72)' : 'rgba(255, 255, 255, 0.85)';
  const cardBorder = isDark ? '1px solid rgba(161, 82, 95, 0.3)' : '1px solid rgba(199, 87, 124, 0.2)';
  const accentRose = isDark ? '#F9AAAD' : '#A1525F';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: activeView === 'chat' || activeView === 'queue' ? '100%' : undefined,
        minHeight: activeView === 'chat' || activeView === 'queue' ? '100%' : '100%',
        flex: 1,
        width: '100%',
        backgroundColor: bgMain,
        color: textPrimary,
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: activeView === 'chat' ? 'hidden' : undefined,
      }}
    >
      {showStatusBar && <StatusBar />}

      {/* VIEW: LOBBY */}
      {activeView === 'lobby' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px 40px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '999px',
                backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(199, 87, 124, 0.12)',
                color: accentRose,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              <MoonIcon color={accentRose} size={13} />
              <span>NIGHTLY BLIND CHATS</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                margin: '0 0 10px',
                color: textPrimary,
                lineHeight: 1.25,
              }}
            >
              Welcome to Vennz after hours
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: textMuted,
                margin: '0 auto',
                maxWidth: '460px',
                lineHeight: 1.5,
              }}
            >
              An intentional 8-minute blind conversation window every night from 10 PM to 11 PM.
              No photos, handles, or bios—connect purely through words before mutual reveal.
            </p>
          </div>

          {/* Window Status Card */}
          <div
            style={{
              width: '100%',
              backgroundColor: cardBg,
              border: cardBorder,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxSizing: 'border-box',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 30px rgba(161, 82, 95, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isWindowActive ? '#10B981' : '#F59E0B',
                    boxShadow: isWindowActive ? '0 0 10px #10B981' : '0 0 8px #F59E0B',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: isWindowActive ? '#10B981' : '#F59E0B',
                  }}
                >
                  {isWindowActive ? 'WINDOW LIVE · 10:00 PM – 11:00 PM' : 'OPENS TONIGHT AT 10:00 PM'}
                </span>
              </div>

              {/* Demo Mode Toggle */}
              <button
                type="button"
                onClick={() => setDemoForceActiveWindow(!demoForceActiveWindow)}
                style={{
                  background: 'none',
                  border: isDark ? '1px solid rgba(249,170,173,0.3)' : '1px solid rgba(161,82,95,0.25)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: accentRose,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {demoForceActiveWindow ? 'Demo Active: On' : 'Demo Active: Off'}
              </button>
            </div>

            {!isWindowActive && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '12px', color: textMuted, marginBottom: '6px' }}>DOORS OPEN IN</div>
                <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'monospace', color: textPrimary }}>
                  {getNextWindowRemaining()}
                </div>
              </div>
            )}

            {/* Quota Trackers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginTop: '12px',
                paddingTop: '14px',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', letterSpacing: '0.05em' }}>
                  BLIND CHATS TONIGHT
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary }}>
                  {chatsUsedTonight} / {maxChatsTonight} used
                  <span style={{ fontSize: '11px', color: accentRose, marginLeft: '6px' }}>
                    ({isPremium ? 'Premium' : 'Free'})
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', letterSpacing: '0.05em' }}>
                  WEEKLY MUTUAL MATCHES
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: textPrimary }}>
                  {maxWeeklyMatches === -1 ? 'Unlimited' : `${weeklyMatchesCount} / ${maxWeeklyMatches} used`}
                  <span style={{ fontSize: '11px', color: accentRose, marginLeft: '6px' }}>
                    ({isPremium ? 'Premium' : 'Free'})
                  </span>
                </div>
              </div>
            </div>

            {!isPremium && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(199, 87, 124, 0.12)' : 'rgba(161, 82, 95, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', color: textMuted }}>
                  Upgrade for 7 chats/night & unlimited weekly matches
                </span>
                <button
                  type="button"
                  onClick={onUpgradeToMembership}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: accentRose,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>

          {/* Rules & Privacy Highlights */}
          <div
            style={{
              width: '100%',
              backgroundColor: cardBg,
              border: cardBorder,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '14px', color: accentRose }}>
              AFTER HOURS PROTOCOL
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <ShieldLockIcon color={accentRose} size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>Protected Anonymity</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '2px' }}>
                    Only your first name/initial and age are visible (e.g. M., 27). No photos, bios, company, or handles.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <SparkleIcon color={accentRose} size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>8-Minute Window & Mutual Reveal</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '2px' }}>
                    Both participants must explicitly click Reveal & Match to convert into permanent matches. If either passes, neither profile is ever revealed.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <MoonIcon color={accentRose} size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>Pure Conversation</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '2px' }}>
                    No photos, URLs, files, or copy/paste. First-in-first-out pairing with up to 4 years age difference.
                  </div>
                </div>
              </div>
            </div>

            {/* Retention notice link */}
            <button
              type="button"
              onClick={() => setShowRetentionModal(true)}
              style={{
                marginTop: '16px',
                background: 'none',
                border: 'none',
                color: textMuted,
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              How VennZ retains & purges data by category →
            </button>
          </div>

          {/* Action CTA */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <button
              type="button"
              disabled={!isWindowActive || chatsUsedTonight >= maxChatsTonight}
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                if (document.documentElement) document.documentElement.scrollTop = 0;
                if (document.body) document.body.scrollTop = 0;
                setQueueElapsedSeconds(0);
                setActiveView('queue');
              }}
              style={{
                width: '100%',
                maxWidth: '380px',
                padding: '16px 28px',
                borderRadius: '999px',
                border: 'none',
                background: !isWindowActive || chatsUsedTonight >= maxChatsTonight
                  ? 'rgba(161, 82, 95, 0.3)'
                  : 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FFF',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: !isWindowActive || chatsUsedTonight >= maxChatsTonight ? 'not-allowed' : 'pointer',
                boxShadow: isWindowActive && chatsUsedTonight < maxChatsTonight ? '0 8px 24px rgba(161, 82, 95, 0.4)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            >
              {chatsUsedTonight >= maxChatsTonight
                ? "Tonight's Limit Reached"
                : isWindowActive
                ? 'Enter After Hours Queue →'
                : 'Window Opens at 10:00 PM'}
            </button>
          </div>
        </div>
      )}

      {/* VIEW: FIFO QUEUE */}
      {activeView === 'queue' && (
        <div
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Radar animation circle */}
          <div
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: isDark ? '2px solid rgba(249,170,173,0.3)' : '2px solid rgba(161,82,95,0.25)',
                animation: 'pulse 2s infinite ease-in-out',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(161,82,95,0.2)' : 'rgba(199,87,124,0.12)',
              }}
            />
            <MoonIcon color={accentRose} size={36} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              margin: '0 0 8px',
              color: textPrimary,
            }}
          >
            Entering After Hours Queue...
          </h2>

          <p style={{ fontSize: '13px', color: textMuted, maxWidth: '400px', lineHeight: 1.5, margin: '0 0 16px' }}>
            First-In-First-Out pairing with verified members within ±4 years age gap.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: cardBg,
              border: cardBorder,
              fontSize: '12px',
              color: accentRose,
              marginBottom: '28px',
            }}
          >
            <span>Queue Time: {queueElapsedSeconds}s · Pairing partner...</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('lobby')}
            style={{
              background: 'none',
              border: 'none',
              color: textMuted,
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Cancel and Return to Lobby
          </button>
        </div>
      )}

      {/* VIEW: 8-MINUTE BLIND CHAT */}
      {activeView === 'chat' && partner && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Conversation Header - Fixed at Top */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              backgroundColor: cardBg,
              backdropFilter: 'blur(12px)',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Silhouette Avatar */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isDark
                    ? 'linear-gradient(135deg, #381A2D 0%, #52273D 100%)'
                    : 'linear-gradient(135deg, #EAD7DD 0%, #D8B7C2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${accentRose}`,
                }}
              >
                <MoonIcon color={accentRose} size={18} />
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: textPrimary }}>
                  {partner.firstName.charAt(0)}., {partner.age}
                </div>
                <div style={{ fontSize: '11px', color: textMuted }}>
                  Anonymous Blind Participant · Profile Hidden
                </div>
              </div>
            </div>

            {/* Timer Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor:
                  remainingSeconds < 60
                    ? 'rgba(239, 68, 68, 0.15)'
                    : remainingSeconds < 180
                    ? 'rgba(245, 158, 11, 0.15)'
                    : isDark
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(16, 185, 129, 0.12)',
                color:
                  remainingSeconds < 60
                    ? '#EF4444'
                    : remainingSeconds < 180
                    ? '#F59E0B'
                    : '#10B981',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              <MoonIcon
                color={
                  remainingSeconds < 60
                    ? '#EF4444'
                    : remainingSeconds < 180
                    ? '#F59E0B'
                    : '#10B981'
                }
                size={13}
              />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          </div>

          {/* Privacy Banner - Fixed under Header */}
          <div
            style={{
              flexShrink: 0,
              padding: '8px 20px',
              backgroundColor: isDark ? 'rgba(161,82,95,0.14)' : 'rgba(199,87,124,0.08)',
              borderBottom: isDark ? '1px solid rgba(161,82,95,0.2)' : '1px solid rgba(199,87,124,0.12)',
              fontSize: '11px',
              color: textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 9,
            }}
          >
            <span>🔒 Anti-leak active: external links, files, and paste are blocked.</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textMuted,
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Report
              </button>
              <button
                type="button"
                onClick={() => setShowBlockModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textMuted,
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Block
              </button>
              <button
                type="button"
                onClick={handleEndConversation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: accentRose,
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                End Chat
              </button>
            </div>
          </div>

          {/* Messages Feed - Scrolls independently */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '820px',
              margin: '0 auto',
            }}
          >
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '78%',
                    backgroundColor: isMe
                      ? isDark
                        ? '#A1525F'
                        : '#C7577C'
                      : cardBg,
                    color: isMe ? '#FFFFFF' : textPrimary,
                    border: isMe ? 'none' : cardBorder,
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: 1.45,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>{msg.text}</div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isMe ? 'rgba(255,255,255,0.7)' : textMuted,
                      marginTop: '4px',
                      textAlign: isMe ? 'right' : 'left',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Controls Suite - Pinned to the Bottom */}
          <div
            style={{
              flexShrink: 0,
              marginTop: 'auto',
              backgroundColor: cardBg,
              borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)',
              zIndex: 10,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
              {/* Mutual Reveal Banner */}
              <div
                style={{
                  padding: '10px 20px',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>
                    {isMutualMatchRevealed
                      ? 'Mutual Match Agreed!'
                      : userRequestedReveal
                      ? `Waiting for ${partner.firstName.charAt(0)}. to agree...`
                      : partnerRequestedReveal
                      ? `${partner.firstName.charAt(0)}. requested to Reveal & Match!`
                      : 'Convert to Permanent Match?'}
                  </div>
                  <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                    {isMutualMatchRevealed
                      ? 'Both profiles unlocked! Conversation is now permanent.'
                      : 'Both must consent. If neither or only one agrees, profiles stay private.'}
                  </div>
                </div>

                <div>
                  {!userRequestedReveal && !partnerRequestedReveal && (
                    <button
                      type="button"
                      onClick={handleUserRequestReveal}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(161,82,95,0.3)',
                      }}
                    >
                      <SparkleIcon color="#FFF" size={12} />
                      <span>Reveal & Match</span>
                    </button>
                  )}

                  {userRequestedReveal && !isMutualMatchRevealed && (
                    <span style={{ fontSize: '12px', color: accentRose, fontWeight: 600 }}>
                      Consent Sent ⏳
                    </span>
                  )}

                  {partnerRequestedReveal && !userRequestedReveal && (
                    <button
                      type="button"
                      onClick={handleUserAcceptReveal}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#10B981',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      }}
                    >
                      Agree & Reveal
                    </button>
                  )}
                </div>
              </div>

              {/* Composer Input Area */}
              <div style={{ padding: '12px 20px 16px' }}>
                {inputWarning && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#EF4444',
                      marginBottom: '8px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '6px',
                    }}
                  >
                    {inputWarning}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      if (inputWarning) setInputWarning(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      setInputWarning('Pasting text is disabled to encourage natural, live conversation.');
                    }}
                    placeholder="Type your message (URLs and paste disabled)..."
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      borderRadius: '999px',
                      border: cardBorder,
                      backgroundColor: isDark ? 'rgba(20, 14, 28, 0.85)' : '#FFFFFF',
                      color: textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      border: 'none',
                      background: inputMessage.trim()
                        ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
                        : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MUTUAL MATCH CELEBRATION */}
      {isMutualMatchRevealed && partner && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: isDark ? '#1C1324' : '#FFFFFF',
                borderRadius: '24px',
                padding: '30px 24px',
                textAlign: 'center',
                border: cardBorder,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <SparkleIcon color="#10B981" size={28} />
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '26px',
                  margin: '0 0 8px',
                  color: textPrimary,
                }}
              >
                Mutual Match Unlocked!
              </h2>

              <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 20px', lineHeight: 1.5 }}>
                Both of you agreed to reveal your identities. You are now permanent matches on VennZ!
              </p>

              {/* Partner Profile Reveal Card */}
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: '16px',
                  padding: '16px',
                  border: cardBorder,
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                }}
              >
                <img
                  src={partner.photos[0]}
                  alt={partner.firstName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${accentRose}`,
                  }}
                />
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 600, color: textPrimary }}>
                    {partner.firstName}, {partner.age}
                  </div>
                  <div style={{ fontSize: '12px', color: accentRose, marginTop: '2px' }}>
                    {partner.designation} · {partner.company}
                  </div>
                  <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                    {partner.city}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMutualMatchRevealed(false);
                    if (onNavigateToChat) {
                      onNavigateToChat();
                    } else {
                      onSelectTab('matches');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '999px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Open Chat with {partner.firstName} →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMutualMatchRevealed(false);
                    setActiveView('lobby');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: textMuted,
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                >
                  Return to After Hours Lobby
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: TIME'S UP */}
      {showTimesUpModal && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '380px',
                backgroundColor: isDark ? '#1C1324' : '#FFFFFF',
                borderRadius: '20px',
                padding: '26px 20px',
                textAlign: 'center',
                border: cardBorder,
              }}
            >
              <MoonIcon color={accentRose} size={32} />

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  margin: '12px 0 8px',
                  color: textPrimary,
                }}
              >
                8-Minute Window Concluded
              </h3>

              <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 20px', lineHeight: 1.5 }}>
                Without mutual consent, the conversation dissolves into the night. Neither profile was revealed, ensuring complete privacy.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowTimesUpModal(false);
                  handleEndConversation();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Return to Lobby
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: REPORT */}
      {showReportModal && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: isDark ? '#1C1324' : '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: cardBorder,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 6px', color: textPrimary }}>
                Report Participant
              </h3>
              <p style={{ fontSize: '12px', color: textMuted, margin: '0 0 16px' }}>
                Reports are encrypted and reviewed confidentially by VennZ Trust & Safety.
              </p>

              {reportSuccessMessage ? (
                <div style={{ color: '#10B981', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
                  {reportSuccessMessage}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {[
                      'Inappropriate or unsolicited conduct',
                      'Attempting to share external contact/handles',
                      'Harassment or disrespectful behavior',
                      'Suspected bot or commercial intent',
                      'Other safety concern',
                    ].map((reason) => (
                      <label
                        key={reason}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          color: textPrimary,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          checked={reportReason === reason}
                          onChange={() => setReportReason(reason)}
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Optional additional context..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: cardBorder,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#FAF1F3',
                      color: textPrimary,
                      fontSize: '12px',
                      marginBottom: '16px',
                      outline: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '999px',
                        border: cardBorder,
                        background: 'none',
                        color: textMuted,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReport}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#EF4444',
                        color: '#FFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Submit Report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: BLOCK */}
      {showBlockModal && partner && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '360px',
                backgroundColor: isDark ? '#1C1324' : '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center',
                border: cardBorder,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 8px', color: textPrimary }}>
                Block Participant?
              </h3>
              <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 20px', lineHeight: 1.5 }}>
                You will not be paired with this participant in any future After Hours session or Discover queue.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '999px',
                    border: cardBorder,
                    background: 'none',
                    color: textMuted,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#EF4444',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: DATA RETENTION BY CATEGORY */}
      {showRetentionModal && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: isDark ? '#1C1324' : '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: cardBorder,
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 6px', color: textPrimary }}>
                Data Retention by Category
              </h3>
              <p style={{ fontSize: '12px', color: textMuted, margin: '0 0 16px' }}>
                VennZ stores only data necessary for safety, legal compliance, and community trust.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: cardBg, border: cardBorder }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: accentRose }}>1. Ephemeral Conversation Logs</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '4px', lineHeight: 1.45 }}>
                    Blind conversation messages are held in ephemeral browser memory during the 8-minute window. If no mutual match is reached, logs are discarded upon session close.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: cardBg, border: cardBorder }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: accentRose }}>2. Trust & Safety Reports</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '4px', lineHeight: 1.45 }}>
                    Reports of harassment or code-of-conduct violations are retained encrypted for 180 days to support safety investigations and legal compliance.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: cardBg, border: cardBorder }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: accentRose }}>3. Mutual Match Records</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '4px', lineHeight: 1.45 }}>
                    Profiles and permanent conversation threads are stored only after bilateral mutual consent is confirmed by both parties.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRetentionModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Notice
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Bottom Nav for mobile views — Only on Lobby */}
      {activeView === 'lobby' && (
        <MemberBottomNav
          activeTab="afterhours"
          onSelectTab={onSelectTab}
          showHomeIndicator={showHomeIndicator}
        />
      )}
    </div>
  );
};
