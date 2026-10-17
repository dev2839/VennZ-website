import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { ModalPortal } from './ModalPortal';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MATCHES } from '../context/AuthContext';
import type { MatchItem, ChatMessage } from '../types/matches';
import type { MemberTab } from './MemberBottomNav';
import {
  ArrowLeft,
  CheckCheck,
  Send,
  ShieldCheck,
  UserX,
  AlertTriangle,
  Ban,
  Search,
  Phone,
  Video,
  Info,
  Smile,
  X,
} from 'lucide-react';

interface Page16ChatScreenProps {
  match: MatchItem;
  onBack: () => void;
  onSelectTab?: (tab: MemberTab) => void;
  onNavigateHelp?: (prefilledCategory?: string) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

// Categorized rich emoji library with search keywords (matching WhatsApp/Instagram experience)
interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  items: { emoji: string; keywords: string }[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😊',
    items: [
      { emoji: '😀', keywords: 'grinning face happy smile' },
      { emoji: '😃', keywords: 'smiling big eyes happy joy' },
      { emoji: '😄', keywords: 'grinning smiling laughing' },
      { emoji: '😁', keywords: 'beaming smiling grin' },
      { emoji: '😆', keywords: 'laughing closed eyes funny' },
      { emoji: '🥹', keywords: 'holding back tears emotional touched' },
      { emoji: '😅', keywords: 'sweat smile nervous relief' },
      { emoji: '😂', keywords: 'tears of joy laughing lol lmao' },
      { emoji: '🤣', keywords: 'rofl rolling on the floor laughing' },
      { emoji: '🥲', keywords: 'smiling tear bittersweet happy sad' },
      { emoji: '☺️', keywords: 'smiling relaxed peaceful content' },
      { emoji: '😊', keywords: 'blushing smile warm happy' },
      { emoji: '😇', keywords: 'angel halo innocent good' },
      { emoji: '🙂', keywords: 'slightly smiling calm polite' },
      { emoji: '🙃', keywords: 'upside down silly sarcasm playful' },
      { emoji: '😉', keywords: 'winking flirt joke tease' },
      { emoji: '😌', keywords: 'relieved calm serene peaceful' },
      { emoji: '😍', keywords: 'heart eyes in love adoration crush' },
      { emoji: '🥰', keywords: 'smiling hearts loving tender sweet' },
      { emoji: '😘', keywords: 'kiss heart blowing kiss flirt' },
      { emoji: '😗', keywords: 'kissing face neutral affection' },
      { emoji: '😙', keywords: 'kissing smiling eyes cute' },
      { emoji: '😚', keywords: 'kissing closed eyes shy romantic' },
      { emoji: '😋', keywords: 'yum delicious tongue tasty food' },
      { emoji: '😛', keywords: 'tongue playful tease silly' },
      { emoji: '😝', keywords: 'squinting tongue joke funny' },
      { emoji: '😜', keywords: 'winking tongue playful crazy' },
      { emoji: '🤪', keywords: 'zany goofy wild eccentric' },
      { emoji: '🤨', keywords: 'raised eyebrow skeptical doubt' },
      { emoji: '🧐', keywords: 'monocle classy analyzing curious' },
      { emoji: '🤓', keywords: 'nerd smart studious glasses' },
      { emoji: '😎', keywords: 'cool sunglasses chill boss' },
      { emoji: '🥸', keywords: 'disguise incognito mustache glasses' },
      { emoji: '🤩', keywords: 'star struck amazed excited star' },
      { emoji: '🥳', keywords: 'party celebrating horn confetti' },
      { emoji: '😏', keywords: 'smirking sly suggestive flirt' },
      { emoji: '😒', keywords: 'unamused annoyed displeased' },
      { emoji: '😞', keywords: 'disappointed sad bummed down' },
      { emoji: '😔', keywords: 'pensive thoughtful sad remorse' },
      { emoji: '😟', keywords: 'worried concerned anxious' },
      { emoji: '😕', keywords: 'confused puzzled unsure' },
      { emoji: '🙁', keywords: 'slightly frowning unhappy' },
      { emoji: '☹️', keywords: 'frowning sad sorrowful' },
      { emoji: '😣', keywords: 'persevering struggling tight' },
      { emoji: '😖', keywords: 'confounded overwhelmed helpless' },
      { emoji: '😫', keywords: 'tired exhausted stressed' },
      { emoji: '😩', keywords: 'weary distraught done' },
      { emoji: '🥺', keywords: 'pleading puppy eyes cute please' },
      { emoji: '😢', keywords: 'crying sad tear upset' },
      { emoji: '😭', keywords: 'loudly crying sobbing brokenhearted' },
      { emoji: '😮‍💨', keywords: 'face exhaling sigh relief panting' },
      { emoji: '😤', keywords: 'huffing steam triumph determined' },
      { emoji: '😠', keywords: 'angry mad annoyed irritated' },
      { emoji: '😡', keywords: 'pouting red angry furious rage' },
      { emoji: '🤬', keywords: 'cursing swearing symbols furious' },
      { emoji: '🤯', keywords: 'exploding head mind blown shock' },
      { emoji: '😳', keywords: 'flushed blushing surprised embarrassed' },
      { emoji: '🥵', keywords: 'hot overheating sweating fever' },
      { emoji: '🥶', keywords: 'cold freezing shivering icy' },
      { emoji: '😱', keywords: 'screaming fear shock horrified' },
      { emoji: '😨', keywords: 'fearful scared worried alarmed' },
      { emoji: '😰', keywords: 'anxious blue sweat nervous' },
      { emoji: '😥', keywords: 'sad relieved sweat whew' },
      { emoji: '😓', keywords: 'downcast sweat guilty stressed' },
      { emoji: '🫣', keywords: 'peeking eye shy hiding curious' },
      { emoji: '🤫', keywords: 'shushing secret quiet whisper hush' },
      { emoji: '🫠', keywords: 'melting awkward dissolved' },
      { emoji: '🫢', keywords: 'hand over mouth gasp surprised' },
      { emoji: '🫡', keywords: 'saluting respect acknowledge yes' },
      { emoji: '🤔', keywords: 'thinking ponder wondering hmm' },
      { emoji: '🤭', keywords: 'giggling hand over mouth sneaky' },
      { emoji: '🥱', keywords: 'yawning sleepy bored tired' },
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures & People',
    icon: '👋',
    items: [
      { emoji: '👋', keywords: 'wave waving hello goodbye hi' },
      { emoji: '🤚', keywords: 'raised back of hand stop high five' },
      { emoji: '🖐️', keywords: 'fingers splayed five hand' },
      { emoji: '✋', keywords: 'raised hand stop high five' },
      { emoji: '🖖', keywords: 'vulcan spock live long prosper' },
      { emoji: '🫱', keywords: 'rightwards hand gesture reaching' },
      { emoji: '🫲', keywords: 'leftwards hand gesture reaching' },
      { emoji: '🫳', keywords: 'palm down hand dropped drop' },
      { emoji: '🫴', keywords: 'palm up hand offering hold' },
      { emoji: '👌', keywords: 'ok okay perfect fine agreed' },
      { emoji: '🤌', keywords: 'pinched fingers italian chef what' },
      { emoji: '🤏', keywords: 'pinching little tiny bit small' },
      { emoji: '✌️', keywords: 'peace sign victory two deuces' },
      { emoji: '🤞', keywords: 'crossed fingers hope luck wish' },
      { emoji: '🫰', keywords: 'hand with index and thumb crossed heart love kpop' },
      { emoji: '🤟', keywords: 'love you gesture sign language' },
      { emoji: '🤘', keywords: 'rock on horns metal cool' },
      { emoji: '🤙', keywords: 'call me shaka chill surf' },
      { emoji: '👈', keywords: 'point left back direction' },
      { emoji: '👉', keywords: 'point right next direction' },
      { emoji: '👆', keywords: 'point up this above' },
      { emoji: '👇', keywords: 'point down see below look' },
      { emoji: '☝️', keywords: 'index pointing up one first' },
      { emoji: '🫵', keywords: 'pointing at you index finger' },
      { emoji: '👍', keywords: 'thumbs up like approve good yes' },
      { emoji: '👎', keywords: 'thumbs down dislike bad no' },
      { emoji: '✊', keywords: 'raised fist power strength solid' },
      { emoji: '👊', keywords: 'fist bump punch bro bump' },
      { emoji: '🤛', keywords: 'left fist bump respect' },
      { emoji: '🤜', keywords: 'right fist bump respect' },
      { emoji: '👏', keywords: 'clapping hands applause bravo congrats' },
      { emoji: '🙌', keywords: 'raising hands celebrate praise cheer' },
      { emoji: '🫶', keywords: 'heart hands love care affection' },
      { emoji: '👐', keywords: 'open hands hug welcome honesty' },
      { emoji: '🤲', keywords: 'palms together prayer holding blessing' },
      { emoji: '🤝', keywords: 'handshake deal agreed partner meetup' },
      { emoji: '🙏', keywords: 'folded hands pray thank you please namaste' },
      { emoji: '✍️', keywords: 'writing hand note signing author' },
      { emoji: '💅', keywords: 'nail polish sassy luxury glamorous' },
      { emoji: '🤳', keywords: 'selfie camera photo portrait' },
      { emoji: '💃', keywords: 'woman dancing salsa tango party' },
      { emoji: '🕺', keywords: 'man dancing groove party celebrate' },
      { emoji: '🫂', keywords: 'people hugging comfort warmth care' },
      { emoji: '💪', keywords: 'flexed biceps muscle strong fitness workout' },
    ],
  },
  {
    id: 'hearts',
    name: 'Love & Hearts',
    icon: '❤️',
    items: [
      { emoji: '❤️', keywords: 'red heart love romance true' },
      { emoji: '🩷', keywords: 'pink heart cute love sweet' },
      { emoji: '🧡', keywords: 'orange heart warm care creative' },
      { emoji: '💛', keywords: 'yellow heart friendship joy golden' },
      { emoji: '💚', keywords: 'green heart nature organic vitality' },
      { emoji: '💙', keywords: 'blue heart calm trust loyalty' },
      { emoji: '🩵', keywords: 'light blue heart serene peace' },
      { emoji: '💜', keywords: 'purple heart luxury elegance royal' },
      { emoji: '🤎', keywords: 'brown heart cozy chocolate warm' },
      { emoji: '🖤', keywords: 'black heart dark chic modern' },
      { emoji: '🩶', keywords: 'grey heart neutral silver minimal' },
      { emoji: '🤍', keywords: 'white heart pure clean peace' },
      { emoji: '💔', keywords: 'broken heart heartbreak sorrow' },
      { emoji: '❤️‍🔥', keywords: 'heart on fire burning passion desire' },
      { emoji: '❤️‍🩹', keywords: 'mending heart healing recovery' },
      { emoji: '❣️', keywords: 'heart exclamation emphasis love' },
      { emoji: '💕', keywords: 'two hearts floating love sweet' },
      { emoji: '💞', keywords: 'revolving hearts revolving romance' },
      { emoji: '💓', keywords: 'beating heart pulse heartbeat alive' },
      { emoji: '💗', keywords: 'growing heart emotion adoration' },
      { emoji: '💖', keywords: 'sparkling heart magical love precious' },
      { emoji: '💘', keywords: 'heart with arrow cupid struck romance' },
      { emoji: '💝', keywords: 'heart with ribbon gift present love' },
      { emoji: '💟', keywords: 'heart decoration purple icon' },
      { emoji: '💌', keywords: 'love letter envelope note romantic' },
      { emoji: '💍', keywords: 'ring diamond proposal commitment' },
      { emoji: '💐', keywords: 'bouquet flowers celebration floral' },
      { emoji: '🌹', keywords: 'rose red romantic flower classic' },
      { emoji: '🥀', keywords: 'wilted rose melancholic poetic' },
      { emoji: '🌸', keywords: 'cherry blossom sakura spring bloom' },
      { emoji: '🌺', keywords: 'hibiscus tropical floral elegant' },
      { emoji: '🌷', keywords: 'tulip flower beauty gentle' },
      { emoji: '🪷', keywords: 'lotus flower serenity calm pure' },
      { emoji: '🥂', keywords: 'clinking glasses toast cheers celebrate' },
      { emoji: '🍾', keywords: 'champagne bottle popping party success' },
      { emoji: '🍷', keywords: 'wine glass red vineyard luxury' },
    ],
  },
  {
    id: 'sparkles',
    name: 'Sparkles & Aesthetics',
    icon: '✨',
    items: [
      { emoji: '✨', keywords: 'sparkles shining glitter aesthetic magic clean' },
      { emoji: '🌟', keywords: 'glowing star bright shining star' },
      { emoji: '💫', keywords: 'dizzy star swirl cosmic whimsical' },
      { emoji: '⭐', keywords: 'star favorite golden premium rating' },
      { emoji: '🌙', keywords: 'crescent moon night evening dreamy' },
      { emoji: '☀️', keywords: 'sun sunny bright morning warm' },
      { emoji: '⚡', keywords: 'high voltage lightning energy power instant' },
      { emoji: '🔥', keywords: 'fire hot lit trending amazing flame' },
      { emoji: '💥', keywords: 'collision boom impact wow' },
      { emoji: '🌈', keywords: 'rainbow colorful pride vibrant hope' },
      { emoji: '🪐', keywords: 'ringed planet saturn space cosmic' },
      { emoji: '🪄', keywords: 'magic wand spell create enchant' },
      { emoji: '🕯️', keywords: 'candle ambient cozy candlelight evening' },
      { emoji: '☕', keywords: 'coffee hot filter espresso latte morning' },
      { emoji: '🍵', keywords: 'tea matcha green cup calming herbal' },
      { emoji: '🍫', keywords: 'chocolate bar sweet dessert cocoa' },
      { emoji: '🍰', keywords: 'shortcake pastry bakery dessert sweet' },
      { emoji: '🍓', keywords: 'strawberry fruit sweet fresh red' },
      { emoji: '🍇', keywords: 'grapes wine fruit purple rich' },
      { emoji: '🍸', keywords: 'cocktail martini olive lounge sophisticated' },
      { emoji: '🧁', keywords: 'cupcake sweet baking treat party' },
      { emoji: '🎨', keywords: 'artist palette painting creative design art' },
      { emoji: '🎭', keywords: 'performing arts drama theatre masks stage' },
      { emoji: '🎬', keywords: 'clapper board film cinema movie director' },
      { emoji: '🎧', keywords: 'headphones music listening audio podcast' },
      { emoji: '🎵', keywords: 'musical note tune song sound' },
      { emoji: '🎶', keywords: 'musical notes melody harmony song' },
      { emoji: '🎷', keywords: 'saxophone jazz brass smooth sound' },
      { emoji: '🎸', keywords: 'guitar acoustic electric rock music' },
      { emoji: '🎹', keywords: 'musical keyboard piano classical keys' },
      { emoji: '🪘', keywords: 'long drum rhythm percussion beat' },
      { emoji: '📷', keywords: 'camera photography photo snapshot portrait' },
      { emoji: '📸', keywords: 'camera with flash capture memories frame' },
      { emoji: '📽️', keywords: 'film projector vintage cinema movie' },
      { emoji: '📖', keywords: 'open book reading study literature novel' },
      { emoji: '📚', keywords: 'books library knowledge education reading' },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Travel & Lifestyle',
    icon: '✈️',
    items: [
      { emoji: '✈️', keywords: 'airplane travel flight departure vacation' },
      { emoji: '🚀', keywords: 'rocket startup launch ambitious speed' },
      { emoji: '🏖️', keywords: 'beach with umbrella seaside ocean coast' },
      { emoji: '🏝️', keywords: 'desert island paradise tropical retreat' },
      { emoji: '⛰️', keywords: 'mountain trekking peak nature outdoor' },
      { emoji: '🏔️', keywords: 'snow capped mountain alps serene climb' },
      { emoji: '🏕️', keywords: 'camping tent campfire wilderness escape' },
      { emoji: '🏙️', keywords: 'cityscape metropolis skyline buildings' },
      { emoji: '🌃', keywords: 'night with stars skyline evening urban' },
      { emoji: '🚗', keywords: 'automobile car road trip drive travel' },
      { emoji: '🏎️', keywords: 'racing car speed fast luxury drive' },
      { emoji: '🚲', keywords: 'bicycle cycling bike ride eco trail' },
      { emoji: '🛵', keywords: 'motor scooter vespa city ride tour' },
      { emoji: '🚤', keywords: 'speedboat watersports lake ocean' },
      { emoji: '🛳️', keywords: 'passenger ship cruise ocean liner vacation' },
      { emoji: '🏰', keywords: 'castle heritage luxury historic estate' },
      { emoji: '🗽', keywords: 'statue of liberty travel landmark' },
      { emoji: '🎡', keywords: 'ferris wheel amusement park carnival view' },
      { emoji: '🎢', keywords: 'roller coaster thrills theme park excitement' },
      { emoji: '🧳', keywords: 'luggage suitcase packing travel journey' },
      { emoji: '🌆', keywords: 'cityscape at dusk sunset golden hour' },
      { emoji: '🌅', keywords: 'sunrise morning dawn hope rise' },
      { emoji: '🌇', keywords: 'sunset evening skyline warm golden' },
      { emoji: '🎾', keywords: 'tennis racket ball sports match court' },
      { emoji: '🏀', keywords: 'basketball game hoop athlete court' },
      { emoji: '⚽', keywords: 'soccer football match goal kick' },
      { emoji: '🏸', keywords: 'badminton racket shuttlecock rally' },
      { emoji: '🏊', keywords: 'swimmer swimming pool workout lap' },
      { emoji: '🧘', keywords: 'person in lotus position yoga meditation zen mind' },
      { emoji: '🏄', keywords: 'surfer surfing ocean waves thrill' },
      { emoji: '🧗', keywords: 'person climbing bouldering adventure summit' },
      { emoji: '🏃', keywords: 'runner running sprint marathon fitness' },
      { emoji: '🏋️', keywords: 'weightlifter gym training barbell strength' },
    ],
  },
];

export const Page16ChatScreen: React.FC<Page16ChatScreenProps> = ({
  match: initialMatch,
  onBack,
  onSelectTab,
  onNavigateHelp,
  showStatusBar = true,
}) => {
  const {
    appearanceMode,
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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>('smileys');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [isUnmatchConfirmOpen, setIsUnmatchConfirmOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiDrawerRef = useRef<HTMLDivElement | null>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiDrawerRef.current &&
        !emojiDrawerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };
    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

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
    setIsEmojiPickerOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectEmoji = (emoji: string) => {
    setMessageInput((prev) => `${prev}${emoji}`);
    inputRef.current?.focus();
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

  // Real-time dynamic search filter for connected matches
  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return connectedList;
    return connectedList.filter((m) => {
      const matchConvo = conversations[m.id] || [];
      const hasInConvo = matchConvo.some((msg) => msg.text.toLowerCase().includes(q));
      return (
        m.name.toLowerCase().includes(q) ||
        (m.designation && m.designation.toLowerCase().includes(q)) ||
        (m.city && m.city.toLowerCase().includes(q)) ||
        (m.lastMessage && m.lastMessage.toLowerCase().includes(q)) ||
        hasInConvo
      );
    });
  }, [connectedList, searchQuery, conversations]);

  // Dynamic emoji search / category filter
  const displayedEmojis = useMemo(() => {
    const q = emojiSearchQuery.trim().toLowerCase();
    if (q) {
      const all: string[] = [];
      EMOJI_CATEGORIES.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.keywords.toLowerCase().includes(q) || item.emoji.includes(q)) {
            all.push(item.emoji);
          }
        });
      });
      return all;
    }
    const cat = EMOJI_CATEGORIES.find((c) => c.id === activeEmojiCategory);
    return cat ? cat.items.map((i) => i.emoji) : [];
  }, [activeEmojiCategory, emojiSearchQuery]);

  // Luxury Theme Colors sticking strictly to VennZ identity
  const colors = {
    bg: isDark ? '#140E1C' : '#FAF1F3',
    sidebarBg: isDark ? '#1C0F19' : '#FFFFFF',
    text: isDark ? '#FDF3F5' : '#462037',
    muted: isDark ? 'rgba(253, 243, 245, 0.65)' : '#683A46',
    border: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(161, 82, 95, 0.16)',
    headerBg: isDark ? 'rgba(28, 15, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    inputBg: isDark ? 'rgba(46, 24, 40, 0.85)' : '#F5EBEF',
    activeItemBg: isDark ? 'rgba(199, 87, 124, 0.2)' : 'rgba(161, 82, 95, 0.12)',
    hoverItemBg: isDark ? 'rgba(199, 87, 124, 0.08)' : 'rgba(161, 82, 95, 0.05)',
    myBubbleBg: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
    theirBubbleBg: isDark ? 'rgba(46, 24, 40, 0.92)' : '#FFFFFF',
    pickerBg: isDark ? '#231220' : '#FFFFFF',
  };

  const iconColor = isDark ? '#FDF3F5' : '#462037';
  const iconMutedColor = isDark ? '#D4A2AC' : '#683A46';
  const iconAccentColor = isDark ? '#F9AAAD' : '#A1525F';

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
        minHeight: 'calc(100vh - 68px)',
        maxHeight: 'calc(100vh - 68px)',
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

      {/* FULL-HEIGHT TWO-COLUMN DIRECT MESSAGING INTERFACE */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* ======================================================== */}
        {/* LEFT SIDEBAR: Connected People & Real-Time Search Box    */}
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
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            transition: 'transform 0.25s ease',
          }}
        >
          {/* Clean Top Header: Messages Title & Requests Badge */}
          <div
            style={{
              padding: '18px 20px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '21px',
                  fontWeight: 600,
                  color: colors.text,
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                Messages
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isDark ? '#F9AAAD' : '#A1525F',
                  backgroundColor: isDark ? 'rgba(199, 87, 124, 0.22)' : 'rgba(161, 82, 95, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {connectedList.length}
              </span>
            </div>

            {incomingRequests && incomingRequests.length > 0 && onSelectTab && (
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
                  gap: '5px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                }}
                title="View pending connection requests"
              >
                <span>Requests</span>
                <span
                  style={{
                    backgroundColor: isDark ? '#C7577C' : '#A1525F',
                    color: '#FFF',
                    fontSize: '10.5px',
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

          {/* Real-Time Search Box */}
          <div style={{ padding: '14px 18px 10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: isDark ? 'rgba(46, 24, 40, 0.65)' : 'rgba(161, 82, 95, 0.08)',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '9px 14px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <Search size={15} color={iconMutedColor} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
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
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: iconMutedColor,
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} color={iconMutedColor} />
                </button>
              )}
            </div>
          </div>

          {/* Connected Conversations List (Extends All The Way Down To The Bottom) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '4px 10px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {filteredMatches.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: colors.muted,
                  fontSize: '13px',
                }}
              >
                No conversations match &ldquo;{searchQuery}&rdquo;.
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
                const timeText = formatMessageTime(
                  lastMsg?.timestamp || cMatch.lastMessageTime || cMatch.matchedAt
                );

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
                      padding: '11px 14px',
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
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
            minWidth: 0,
            minHeight: 0,
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
              flexShrink: 0,
            }}
          >
            {/* Left: Avatar, Name & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={18} color={iconColor} />
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
                      <ShieldCheck size={9} color="#86EFAC" />
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
                  color: iconColor,
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Phone size={19} color={iconColor} />
              </button>

              <button
                type="button"
                onClick={() => showToast(`Starting secure VennZ video room with ${activeMatch.name}...`)}
                aria-label="Video call"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: iconColor,
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Video size={21} color={iconColor} />
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="Conversation actions"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: iconColor,
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Info size={19} color={iconColor} />
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
                        <UserX size={14} color={iconColor} />
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
                        <AlertTriangle size={14} color={iconAccentColor} />
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
                        <Ban size={14} color="#E06D6D" />
                        <span>Block member</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Messages Feed */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '24px 24px 28px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Subtle Date Divider */}
              <div style={{ textAlign: 'center', margin: '8px 0 24px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      {/* Avatar next to incoming messages from the other person */}
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

          {/* DOCKED BOTTOM MESSAGE INPUT BOX (Sitting at the bottom with comfortable breathing room) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              flexShrink: 0,
              padding: '14px 20px 18px',
              backgroundColor: colors.headerBg,
              borderTop: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxSizing: 'border-box',
              zIndex: 30,
            }}
          >
            {/* RICH EMOJI & ICON PICKER DRAWER (WhatsApp / Instagram Style) */}
            {isEmojiPickerOpen && (
              <div
                ref={emojiDrawerRef}
                style={{
                  position: 'absolute',
                  bottom: '72px',
                  left: '20px',
                  width: '360px',
                  maxWidth: 'calc(100vw - 40px)',
                  maxHeight: '340px',
                  backgroundColor: colors.pickerBg,
                  borderRadius: '20px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: isDark
                    ? '0 16px 40px rgba(0, 0, 0, 0.65)'
                    : '0 16px 40px rgba(70, 32, 55, 0.16)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 80,
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Search Bar inside Emoji Picker */}
                <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${colors.border}` }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: isDark ? 'rgba(70, 32, 55, 0.4)' : '#F5EBEF',
                      borderRadius: '10px',
                      padding: '6px 10px',
                    }}
                  >
                    <Search size={14} color={iconMutedColor} />
                    <input
                      type="text"
                      value={emojiSearchQuery}
                      onChange={(e) => setEmojiSearchQuery(e.target.value)}
                      placeholder="Search emojis..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '12.5px',
                        color: colors.text,
                        fontFamily: 'var(--font-sans)',
                      }}
                    />
                    {emojiSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEmojiSearchQuery('')}
                        style={{ background: 'none', border: 'none', color: iconMutedColor, cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} color={iconMutedColor} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Navigation Pills */}
                {!emojiSearchQuery && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${colors.border}`,
                      overflowX: 'auto',
                    }}
                  >
                    {EMOJI_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveEmojiCategory(cat.id)}
                        style={{
                          background:
                            activeEmojiCategory === cat.id
                              ? isDark
                                ? 'rgba(199, 87, 124, 0.28)'
                                : 'rgba(161, 82, 95, 0.15)'
                              : 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          fontSize: '15px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        title={cat.name}
                      >
                        {cat.icon}
                      </button>
                    ))}
                  </div>
                )}

                {/* Emojis Grid */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px 12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '6px',
                  }}
                >
                  {displayedEmojis.length === 0 ? (
                    <div style={{ gridColumn: 'span 8', textAlign: 'center', color: colors.muted, fontSize: '12px', padding: '20px 0' }}>
                      No matching emojis found
                    </div>
                  ) : (
                    displayedEmojis.map((emoji, idx) => (
                      <button
                        key={`${emoji}-${idx}`}
                        type="button"
                        onClick={() => handleSelectEmoji(emoji)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          lineHeight: '1',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.1s ease, background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
                          e.currentTarget.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {emoji}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Input Form with ONLY Smile Button + Text Field + Send Arrow */}
            <form
              onSubmit={handleSend}
              style={{
                maxWidth: '820px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 8px 6px 14px',
                borderRadius: '999px',
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.border}`,
                boxShadow: isDark
                  ? '0 6px 20px rgba(0, 0, 0, 0.35)'
                  : '0 6px 18px rgba(161, 82, 95, 0.08)',
              }}
            >
              {/* Left: Smile Icon for Emojis */}
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isEmojiPickerOpen ? iconAccentColor : iconColor,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                aria-label="Insert emoji"
                title="Choose emojis & icons"
              >
                <Smile size={21} color={isEmojiPickerOpen ? iconAccentColor : iconColor} />
              </button>

              {/* Message Input with generous spacing */}
              <input
                ref={inputRef}
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
                  fontSize: '15px',
                  color: colors.text,
                  padding: '8px 6px',
                }}
              />

              {/* Right: ONLY Sent Arrow Button */}
              <button
                type="submit"
                disabled={!messageInput.trim()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  background: messageInput.trim()
                    ? colors.myBubbleBg
                    : isDark
                    ? 'rgba(70, 32, 55, 0.4)'
                    : 'rgba(161, 82, 95, 0.18)',
                  color: messageInput.trim() ? '#FFFFFF' : iconMutedColor,
                  cursor: messageInput.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: messageInput.trim() ? '0 4px 14px rgba(161, 82, 95, 0.45)' : 'none',
                  flexShrink: 0,
                }}
                aria-label="Send message"
                title="Send message"
              >
                <Send size={16} color={messageInput.trim() ? '#FFFFFF' : iconMutedColor} style={{ transform: 'translateX(1px)' }} />
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
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
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
