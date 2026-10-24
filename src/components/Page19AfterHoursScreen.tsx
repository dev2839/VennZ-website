import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { ModalPortal } from './ModalPortal';
import { useAuth } from '../context/AuthContext';
import { DUMMY_DISCOVER_PROFILES } from '../data/dummyProfiles';
import type { DiscoverProfile } from '../types/discover';
import type { ChatMessage } from '../types/matches';
import { DEFAULT_AFTER_HOURS_CONFIG } from '../constants/afterHoursConfig';
import { calculateAgeFromISO } from '../utils/ageCalculation';
import { getPageBackground } from '../constants/themeGradients';

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


const UserSilhouetteIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const ExpandIcon = ({ color = '#FFFFFF', size = 12 }: { color?: string; size?: number }) => (
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
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const Page19AfterHoursScreen: React.FC<Page19AfterHoursScreenProps> = ({
  onSelectTab,
  onNavigateHelp: _onNavigateHelp,
  onUpgradeToMembership,
  onNavigateToChat: _onNavigateToChat,
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
  // Demo toggle defaults to false — real 10 PM–11 PM window enforced
  const [demoForceActiveWindow, setDemoForceActiveWindow] = useState<boolean>(false);

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
  const [_partnerRequestedReveal, setPartnerRequestedReveal] = useState<boolean>(false);
  const [isMutualMatchRevealed, setIsMutualMatchRevealed] = useState<boolean>(false);
  const [isRevealingAnimation, setIsRevealingAnimation] = useState<boolean>(false);

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
  // Ephemeral Room & Video Reference States
  const [roomCode, setRoomCode] = useState<string>('ROOM D7CFE3D0');
  const [isPhotoExpanded, setIsPhotoExpanded] = useState<boolean>(false);
  const [skipsRemaining, setSkipsRemaining] = useState<number>(10);
  const [showShareSocialsModal, setShowShareSocialsModal] = useState<boolean>(false);
  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'whatsapp' | 'vennz'>('instagram');
  const [socialHandleInput, setSocialHandleInput] = useState<string>('');
  const [socialSharedToast, setSocialSharedToast] = useState<string | null>(null);

  // Derived Partner Persona (matching video: "Easygoing Planner", "Low Maintenance, High Warmth", quote)
  const partnerPersona = React.useMemo(() => {
    if (!partner) {
      return {
        archetype: 'Easygoing Planner',
        tagline: 'Low Maintenance, High Warmth',
        quote: '“bts girl”',
      };
    }
    const archetypes = [
      'Easygoing Planner',
      'Curious Explorer',
      'Creative Strategist',
      'Thoughtful Architect',
      'Quiet Ambitious',
    ];
    const taglines = [
      'Low Maintenance, High Warmth',
      'Deep conversations over black coffee',
      'Art lover with an observant edge',
      'Spontaneous traveler & weekend chef',
    ];
    const quotes = [
      '“bts girl”',
      '“i love to eat & late-night walks”',
      '“curious mind, grounded heart”',
      '“music, architecture & honest talks”',
    ];
    const sum = partner.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return {
      archetype: archetypes[sum % archetypes.length],
      tagline: taglines[sum % taglines.length],
      quote: quotes[sum % quotes.length],
    };
  }, [partner]);

  const handleSkipPartner = () => {
    if (skipsRemaining > 0) {
      setSkipsRemaining((prev) => prev - 1);
    }
    const eligiblePool = DUMMY_DISCOVER_PROFILES.filter((cand) => {
      if (blockedProfileIds && blockedProfileIds.includes(cand.id)) return false;
      if (partner && cand.id === partner.id) return false;
      return true;
    });
    const nextCandidate =
      eligiblePool.length > 0
        ? eligiblePool[Math.floor(Math.random() * eligiblePool.length)]
        : DUMMY_DISCOVER_PROFILES[0];

    setPartner(nextCandidate);
    setRemainingSeconds(config.conversationDurationSeconds);
    setUserRequestedReveal(false);
    setPartnerRequestedReveal(false);
    setIsMutualMatchRevealed(false);
    setIsPhotoExpanded(false);
    setRoomCode('ROOM ' + Math.random().toString(16).substring(2, 10).toUpperCase());
    setMessages([
      {
        id: `msg-sys-${Date.now()}`,
        sender: 'partner',
        text: `Hello! I'm in the room too. How is your night going?`,
        timestamp: Date.now(),
      },
    ]);
  };


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
      setRoomCode('ROOM ' + Math.random().toString(16).substring(2, 10).toUpperCase());
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
    // Partner reciprocates after a brief pause
    setTimeout(() => {
      setIsRevealingAnimation(true);
      setPartnerRequestedReveal(true);

      // Revealing animation (video reference: Loading photo... ✦ REVEALED ✦)
      setTimeout(() => {
        setIsRevealingAnimation(false);
        setIsMutualMatchRevealed(true);
        setWeeklyMatchesCount((prev) => prev + 1);

        // Automatically add to permanent matches so they appear on Matches page for chat
        if (partner) {
          const ahChatHistory: ChatMessage[] = messages.map((m) => ({
            id: m.id,
            senderId: m.sender === 'me' ? 'me' : partner.id,
            text: m.text,
            timestamp: m.timestamp,
          }));

          addDirectMatch(
            {
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
              lastMessage: ahChatHistory.length > 0
                ? ahChatHistory[ahChatHistory.length - 1].text
                : `Connected intentionally via VennZ After Hours! We both mutually agreed to reveal our profiles.`,
              lastMessageTime: Date.now(),
            },
            ahChatHistory
          );
        }
      }, 1400);
    }, 1500);
  };

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
  const bgMain = getPageBackground(isDark);
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
        background: bgMain,
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: textPrimary,
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: activeView === 'chat' ? 'hidden' : undefined,
      }}
    >
      {/* Background Ambience just like Elevate page */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(161, 82, 95, 0.24) 0%, transparent 75%)'
            : 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(220, 150, 170, 0.20) 0%, transparent 75%)',
          zIndex: 0,
        }}
      />
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
                fontSize: '13px',
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
                fontSize: '30px',
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
                fontSize: '16px',
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
                    fontSize: '14px',
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
                  fontSize: '13px',
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
                <div style={{ fontSize: '14px', color: textMuted, marginBottom: '6px' }}>DOORS OPEN IN</div>
                <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'monospace', color: textPrimary }}>
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
                <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px', letterSpacing: '0.05em' }}>
                  BLIND CHATS TONIGHT
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: textPrimary }}>
                  {chatsUsedTonight} / {maxChatsTonight} used
                  <span style={{ fontSize: '13px', color: accentRose, marginLeft: '6px' }}>
                    ({isPremium ? 'Premium' : 'Free'})
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px', letterSpacing: '0.05em' }}>
                  WEEKLY MUTUAL MATCHES
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: textPrimary }}>
                  {maxWeeklyMatches === -1 ? 'Unlimited' : `${weeklyMatchesCount} / ${maxWeeklyMatches} used`}
                  <span style={{ fontSize: '13px', color: accentRose, marginLeft: '6px' }}>
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
                <span style={{ fontSize: '14px', color: textMuted }}>
                  Upgrade for 7 chats/night & unlimited weekly matches
                </span>
                <button
                  type="button"
                  onClick={onUpgradeToMembership}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: accentRose,
                    fontSize: '14px',
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
            <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '14px', color: accentRose }}>
              AFTER HOURS PROTOCOL
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <ShieldLockIcon color={accentRose} size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: textPrimary }}>Protected Anonymity</div>
                  <div style={{ fontSize: '14px', color: textMuted, marginTop: '2px' }}>
                    Only your first name/initial and age are visible (e.g. M., 27). No photos, bios, company, or handles.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <SparkleIcon color={accentRose} size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: textPrimary }}>8-Minute Window & Mutual Reveal</div>
                  <div style={{ fontSize: '14px', color: textMuted, marginTop: '2px' }}>
                    Both participants must explicitly click Reveal & Match to convert into permanent matches. If either passes, neither profile is ever revealed.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  <MoonIcon color={accentRose} size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: textPrimary }}>Pure Conversation</div>
                  <div style={{ fontSize: '14px', color: textMuted, marginTop: '2px' }}>
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
                fontSize: '13px',
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
                fontSize: '17px',
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
              fontSize: '26px',
              margin: '0 0 8px',
              color: textPrimary,
            }}
          >
            Entering After Hours Queue...
          </h2>

          <p style={{ fontSize: '15px', color: textMuted, maxWidth: '400px', lineHeight: 1.5, margin: '0 0 16px' }}>
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
              fontSize: '14px',
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
              fontSize: '15px',
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
          {/* Top Room Header Bar (Timer / Connected | Room Code | Skip & Report) */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: cardBorder,
              backgroundColor: isDark ? 'rgba(20, 14, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              zIndex: 10,
            }}
          >
            {/* Left: Timer or Connected status */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: isMutualMatchRevealed
                  ? 'rgba(16, 185, 129, 0.16)'
                  : remainingSeconds < 60
                  ? 'rgba(239, 68, 68, 0.15)'
                  : remainingSeconds < 180
                  ? 'rgba(245, 158, 11, 0.15)'
                  : isDark
                  ? 'rgba(161, 82, 95, 0.22)'
                  : 'rgba(161, 82, 95, 0.12)',
                color: isMutualMatchRevealed
                  ? '#10B981'
                  : remainingSeconds < 60
                  ? '#EF4444'
                  : remainingSeconds < 180
                  ? '#F59E0B'
                  : accentRose,
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
            >
              {isMutualMatchRevealed ? (
                <>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 8px #10B981',
                    }}
                  />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <MoonIcon
                    color={
                      remainingSeconds < 60
                        ? '#EF4444'
                        : remainingSeconds < 180
                        ? '#F59E0B'
                        : accentRose
                    }
                    size={13}
                  />
                  <span>{formatTimer(remainingSeconds)}</span>
                </>
              )}
            </div>

            {/* Center: Room Code */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                fontFamily: 'monospace',
                color: textMuted,
                textTransform: 'uppercase',
              }}
            >
              {roomCode}
            </div>

            {/* Right: Skip and Report Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSkipPartner}
                style={{
                  background: 'none',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '999px',
                  padding: '4px 12px',
                  color: textMuted,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                style={{
                  background: 'none',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '999px',
                  padding: '4px 12px',
                  color: textMuted,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Report
              </button>
            </div>
          </div>

          {/* Social Shared Notification Toast */}
          {socialSharedToast && (
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 15,
              }}
            >
              {socialSharedToast}
            </div>
          )}

          {/* Messages Feed - Scrolls independently */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '580px',
              margin: '0 auto',
            }}
          >
            {/* Partner Profile Card (Pinned at Top of conversation - Video Reference) */}
            <div
              style={{
                width: '100%',
                backgroundColor: cardBg,
                border: cardBorder,
                borderRadius: '20px',
                padding: '14px',
                marginBottom: '14px',
                boxSizing: 'border-box',
                boxShadow: isDark
                  ? '0 8px 30px rgba(0, 0, 0, 0.35)'
                  : '0 8px 24px rgba(161, 82, 95, 0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Photo Canvas with Smooth Blur / Reveal (Video Reference) */}
              <div
                onClick={() => {
                  if (isMutualMatchRevealed) {
                    setIsPhotoExpanded(true);
                  }
                }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '190px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: isMutualMatchRevealed ? 'pointer' : 'default',
                  backgroundColor: '#1E161C',
                }}
                title={isMutualMatchRevealed ? 'Tap to view full photograph' : 'Photo remains hidden until mutual unblur'}
              >
                <img
                  src={partner.photos[0]}
                  alt={isMutualMatchRevealed ? partner.firstName : 'Blind participant'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: isMutualMatchRevealed ? 'none' : 'blur(28px) brightness(0.72)',
                    transform: isMutualMatchRevealed ? 'scale(1)' : 'scale(1.15)',
                    transition: 'filter 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s ease',
                  }}
                />

                {/* Over photo when blurred: "Photo hidden" silhouette badge */}
                {!isMutualMatchRevealed && !isRevealingAnimation && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(20, 14, 28, 0.35)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        border: '1.5px solid rgba(255, 255, 255, 0.35)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '6px',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <UserSilhouetteIcon color="#FFFFFF" size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: '#FFFFFF',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      Photo hidden
                    </span>
                  </div>
                )}

                {/* Revealing transition overlay (matching reference video exact_46.0s.jpg) */}
                {isRevealingAnimation && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(20, 14, 28, 0.65)',
                      background: 'radial-gradient(circle at center, rgba(235, 175, 75, 0.32) 0%, rgba(20, 14, 28, 0.75) 65%)',
                      zIndex: 4,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.85)',
                        letterSpacing: '0.04em',
                        marginBottom: '6px',
                      }}
                    >
                      Loading photo...
                    </span>
                    <span
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 800,
                        color: '#F7C873',
                        letterSpacing: '0.18em',
                        textShadow: '0 0 12px rgba(247, 200, 115, 0.6)',
                        textTransform: 'uppercase',
                      }}
                    >
                      ✦ REVEALED ✦
                    </span>
                  </div>
                )}

                {/* Over photo when unblurred: "tap to expand" pill button */}
                {isMutualMatchRevealed && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(20, 14, 28, 0.78)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <ExpandIcon color="#FFFFFF" size={11} />
                    <span>tap to expand</span>
                  </div>
                )}
              </div>

              {/* Persona, Tagline & Quote Details */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: textPrimary,
                    }}
                  >
                    {isMutualMatchRevealed ? `${partner.firstName}, ${partner.age}` : partnerPersona.archetype}
                  </span>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.1)',
                      color: accentRose,
                      textTransform: 'uppercase',
                    }}
                  >
                    {partner.gender === 'woman' ? 'FEMALE' : 'MALE'}
                  </span>
                </div>

                <div style={{ fontSize: '14px', color: textMuted, marginTop: '2px' }}>
                  {isMutualMatchRevealed ? `${partner.city} · ${partner.designation}` : partnerPersona.tagline}
                </div>

                {/* Quote Box (Matching video reference) */}
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? 'rgba(30, 18, 38, 0.45)' : 'rgba(250, 241, 243, 0.65)',
                    border: `1px solid ${cardBorder}`,
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: textPrimary,
                    lineHeight: 1.4,
                  }}
                >
                  {partnerPersona.quote}
                </div>
              </div>
            </div>

            {/* Skips allowance note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4px 10px',
                fontSize: '13px',
                color: textMuted,
              }}
            >
              <span>{skipsRemaining} skips left today</span>
              <span>Mutual unblur reveals photographs</span>
            </div>

            {/* Icebreaker Prompt */}
            <div
              style={{
                textAlign: 'center',
                padding: '8px 14px',
                marginBottom: '12px',
                fontSize: '14px',
                color: textMuted,
                fontStyle: 'italic',
              }}
            >
              Say something kind to break the ice.
            </div>

            {/* Conversation Bubbles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      backgroundColor: isMe
                        ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
                        : cardBg,
                      background: isMe
                        ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
                        : cardBg,
                      color: isMe ? '#FFFFFF' : textPrimary,
                      border: isMe ? 'none' : cardBorder,
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      fontSize: '15.5px',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: isMe ? 'rgba(255,255,255,0.7)' : textMuted,
                        marginTop: '3px',
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
          </div>

          {/* Bottom Controls Suite (Pinned above composer) */}
          <div
            style={{
              flexShrink: 0,
              marginTop: 'auto',
              backgroundColor: cardBg,
              borderTop: cardBorder,
              backdropFilter: 'blur(12px)',
              zIndex: 10,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ maxWidth: '580px', margin: '0 auto', width: '100%', padding: '10px 16px 14px' }}>
              {/* Mutual Reveal Action Button (Video Reference) */}
              <div style={{ marginBottom: '10px' }}>
                {!userRequestedReveal && !isMutualMatchRevealed && (
                  <button
                    type="button"
                    onClick={handleUserRequestReveal}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(161, 82, 95, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <SparkleIcon color="#FFFFFF" size={13} />
                    <span>Unblur / Reveal Each Other</span>
                  </button>
                )}

                {userRequestedReveal && !isMutualMatchRevealed && (
                  <div
                    style={{
                      width: '100%',
                      padding: '11px 18px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(244, 230, 234, 0.7)',
                      border: '1.5px solid rgba(245, 158, 11, 0.5)',
                      color: isDark ? '#FBBF24' : '#D97706',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#F59E0B',
                        boxShadow: '0 0 8px #F59E0B',
                        display: 'inline-block',
                      }}
                    />
                    <span>Waiting for them to unblur...</span>
                  </div>
                )}

                {isMutualMatchRevealed && (
                  <button
                    type="button"
                    onClick={() => setShowShareSocialsModal(true)}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.88) 0%, rgba(5, 150, 105, 0.95) 100%)',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Share Socials with Your Match</span>
                  </button>
                )}
              </div>

              {/* Composer Input Area */}
              {inputWarning && (
                <div
                  style={{
                    fontSize: '13px',
                    color: '#EF4444',
                    marginBottom: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '6px',
                  }}
                >
                  {inputWarning}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleSkipPartner}
                  style={{
                    background: 'none',
                    border: `1px solid ${cardBorder}`,
                    color: textMuted,
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="Skip to next candidate"
                >
                  → Skip
                </button>

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
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: cardBorder,
                    backgroundColor: isDark ? 'rgba(20, 14, 28, 0.85)' : '#FFFFFF',
                    color: textPrimary,
                    fontSize: '15.5px',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                  }}
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  style={{
                    width: '38px',
                    height: '38px',
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
                    cursor: inputMessage.trim() ? 'pointer' : 'default',
                    flexShrink: 0,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHOTO LIGHTBOX EXPAND (Video Reference) */}
      {isPhotoExpanded && partner && (
        <ModalPortal>
          <div
            onClick={() => setIsPhotoExpanded(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '420px',
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: isDark ? '#140E1C' : '#FFFFFF',
                boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <img
                src={partner.photos[0]}
                alt={partner.firstName}
                style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <button
                type="button"
                onClick={() => setIsPhotoExpanded(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: isDark ? '#140E1C' : '#FFFFFF',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 600, color: textPrimary }}>
                  {partner.firstName}, {partner.age}
                </div>
                <div style={{ fontSize: '14.5px', color: textMuted, marginTop: '2px' }}>
                  {partner.city} · {partner.designation}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: SHARE SOCIALS (Video Reference) */}
      {showShareSocialsModal && partner && (
        <ModalPortal>
          <div
            onClick={() => setShowShareSocialsModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 310,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                borderRadius: '22px',
                padding: '24px',
                border: cardBorder,
                boxShadow: '0 16px 45px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 6px', color: textPrimary }}>
                Share Socials
              </h3>
              <p style={{ fontSize: '14.5px', color: textMuted, margin: '0 0 16px', lineHeight: 1.45 }}>
                You and {partner.firstName} mutually unblurred! Pick a handle to exchange:
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['instagram', 'whatsapp', 'vennz'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setSocialPlatform(plat)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${socialPlatform === plat ? accentRose : cardBorder}`,
                      backgroundColor: socialPlatform === plat ? (isDark ? 'rgba(161,82,95,0.3)' : 'rgba(161,82,95,0.12)') : 'transparent',
                      color: socialPlatform === plat ? textPrimary : textMuted,
                      fontSize: '14px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {plat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={socialHandleInput}
                onChange={(e) => setSocialHandleInput(e.target.value)}
                placeholder={socialPlatform === 'whatsapp' ? '+91 Phone number...' : '@handle...'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: cardBorder,
                  backgroundColor: isDark ? 'rgba(70,32,55,0.3)' : '#F9F5F6',
                  color: textPrimary,
                  fontSize: '15.5px',
                  marginBottom: '18px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowShareSocialsModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '999px',
                    border: cardBorder,
                    background: 'transparent',
                    color: textMuted,
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareSocialsModal(false);
                    setSocialSharedToast(`Sent your ${socialPlatform} to ${partner.firstName}!`);
                    setTimeout(() => setSocialSharedToast(null), 3500);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '999px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Send Handle
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
                  fontSize: '24px',
                  margin: '12px 0 8px',
                  color: textPrimary,
                }}
              >
                8-Minute Window Concluded
              </h3>

              <p style={{ fontSize: '15px', color: textMuted, margin: '0 0 20px', lineHeight: 1.5 }}>
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
                  fontSize: '16px',
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
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 6px', color: textPrimary }}>
                Report Participant
              </h3>
              <p style={{ fontSize: '14px', color: textMuted, margin: '0 0 16px' }}>
                Reports are encrypted and reviewed confidentially by VennZ Trust & Safety.
              </p>

              {reportSuccessMessage ? (
                <div style={{ color: '#10B981', fontSize: '15px', padding: '16px 0', textAlign: 'center' }}>
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
                          fontSize: '15px',
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
                      fontSize: '14px',
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
                        fontSize: '15px',
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
                        fontSize: '15px',
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
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px', color: textPrimary }}>
                Block Participant?
              </h3>
              <p style={{ fontSize: '15px', color: textMuted, margin: '0 0 20px', lineHeight: 1.5 }}>
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
                    fontSize: '15px',
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
                    fontSize: '15px',
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
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 6px', color: textPrimary }}>
                Data Retention by Category
              </h3>
              <p style={{ fontSize: '14px', color: textMuted, margin: '0 0 16px' }}>
                VennZ stores only data necessary for safety, legal compliance, and community trust.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: cardBg, border: cardBorder }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: accentRose }}>1. Ephemeral Conversation Logs</div>
                  <div style={{ fontSize: '14px', color: textMuted, marginTop: '4px', lineHeight: 1.45 }}>
                    Blind conversation messages are held in ephemeral browser memory during the 8-minute window. If no mutual match is reached, logs are discarded upon session close.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: cardBg, border: cardBorder }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: accentRose }}>2. Trust & Safety Reports</div>
                  <div style={{ fontSize: '14px', color: textMuted, marginTop: '4px', lineHeight: 1.45 }}>
                    Reports of harassment or code-of-conduct violations are retained encrypted for 180 days to support safety investigations and legal compliance.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: cardBg, border: cardBorder }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: accentRose }}>3. Mutual Match Records</div>
                  <div style={{ fontSize: '14px', color: textMuted, marginTop: '4px', lineHeight: 1.45 }}>
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
                  fontSize: '15px',
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
