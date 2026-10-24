import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  MapPin,
  Copy,
  ChevronRight,
  LogOut,
  HelpCircle,
  Crop,
  CheckCheck,
  Info,
  EyeOff,
  Sparkles,
  Sliders,
  Globe,
  UserX,
} from 'lucide-react';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { MemberTopBar } from './MemberTopBar';
import { StatusBar } from './StatusBar';
import { ModalPortal } from './ModalPortal';
import { PhotoCropModal } from './PhotoCropModal';
import { ProfileElevateSuite } from './ProfileElevateSuite';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { calculateAgeFromISO } from '../utils/ageCalculation';
import {
  INTEREST_OPTIONS,
  VIBE_OPTIONS,
} from '../constants/profileOptions';
import { getPageBackground } from '../constants/themeGradients';

interface MyProfileScreenProps {
  onBack: () => void;
  onSelectTab: (tab: MemberTab) => void;
  initialSubTab?: 'profile' | 'elevate' | 'account';
  onManageMembership?: () => void;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
  onNavigateHelp?: () => void;
  onNavigateMatches?: (subTab: 'matches' | 'requests') => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

const MAX_PHOTOS = 6;
const INVITATIONS_STORAGE_KEY = 'inner_circle_user_invitations';
const MAX_MONTHLY_INVITATIONS = 4;


const PREFS_STORAGE_KEY = 'vennz_user_preferences';

interface UserPreferences {
  distanceKm: number;
  minAge: number;
  maxAge: number;
  blockedContacts: string[];
  language: string;
}

const DEFAULT_PREFS: UserPreferences = {
  distanceKm: 50,
  minAge: 22,
  maxAge: 35,
  blockedContacts: ['+91 98765 43210 (Karan M.)', '+91 98123 45678 (Anonymous)'],
  language: 'English (India)',
};

const LANGUAGE_OPTIONS = [
  'English (India)',
  'Hindi (हिन्दी)',
  'Marathi (मराठी)',
  'Bengali (বাংলা)',
  'Tamil (தமிழ்)',
  'Gujarati (ગુજરાતી)',
  'Kannada (ಕನ್ನಡ)',
];

export const MyProfileScreen: React.FC<MyProfileScreenProps> = ({
  onBack,
  onSelectTab,
  initialSubTab = 'profile',
  onManageMembership,
  onSignOut,
  onDeleteAccount,
  onNavigateHelp,
  onNavigateMatches,
  onUpgradeToMembership,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    profile,
    updateProfile,
    appearanceMode,
    email,
    isPhoneVerified,
    isIdentityVerified,
    isSelfieVerified,
    isDigiLockerVerified,
    matches,
    sentRequests,
    incomingRequests,
    isMember,
    isComplimentary,
    isTrialExpired,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  const [draft, setDraft] = useState<UserProfile>(() => ({
    ...profile,
    photos: [...(profile.photos || [])],
    interests: [...(profile.interests || [])],
    vibes: [...(profile.vibes || [])],
  }));

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'elevate' | 'account'>(initialSubTab);
  // Persistent Preferences (location, age, blocked contacts, language) - never revert on refresh or sign out
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_PREFS;
  });

  const [newBlockedContact, setNewBlockedContact] = useState('');
  const [prefsToast, setPrefsToast] = useState<string | null>(null);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleUnblockContact = (contact: string) => {
    const updated = preferences.blockedContacts.filter((c) => c !== contact);
    updatePreferences({ blockedContacts: updated });
    setPrefsToast(`Unblocked ${contact}`);
    setTimeout(() => setPrefsToast(null), 3000);
  };

  const handleAddBlockedContact = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBlockedContact.trim();
    if (!trimmed) return;
    if (preferences.blockedContacts.includes(trimmed)) {
      setPrefsToast('Contact is already in your blocked list');
      setTimeout(() => setPrefsToast(null), 3000);
      return;
    }
    const updated = [...preferences.blockedContacts, trimmed];
    updatePreferences({ blockedContacts: updated });
    setNewBlockedContact('');
    setPrefsToast(`Blocked ${trimmed}`);
    setTimeout(() => setPrefsToast(null), 3000);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [croppingPhoto, setCroppingPhoto] = useState<{ src: string; index?: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [latestGeneratedCode, setLatestGeneratedCode] = useState<string | null>(null);

  // Incognito Mode State
  const [isIncognitoInfoOpen, setIsIncognitoInfoOpen] = useState(false);
  const [incognitoToast, setIncognitoToast] = useState<string | null>(null);

  const isIncognitoActive = Boolean(draft.isIncognito ?? profile.isIncognito);

  const handleToggleIncognito = () => {
    const nextState = !isIncognitoActive;
    setDraft((prev) => ({ ...prev, isIncognito: nextState }));
    updateProfile({ isIncognito: nextState });
    setIncognitoToast(
      nextState
        ? 'Incognito Mode enabled — Only members you like can see you.'
        : 'Incognito Mode disabled — Standard profile visibility restored.'
    );
    setTimeout(() => {
      setIncognitoToast(null);
    }, 3500);
  };

  // Scroll to top on mount and when switching between Profile Details and Account tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [activeSubTab]);

  // Keep draft in sync with profile updates when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setDraft({
        ...profile,
        photos: [...(profile.photos || [])],
        interests: [...(profile.interests || [])],
        vibes: [...(profile.vibes || [])],
        isIncognito: profile.isIncognito || false,
      });
    }
  }, [profile, isEditing]);

  // Invitations
  const [invitations, setInvitations] = useState<{ code: string; createdAt: number }[]>(() => {
    try {
      const saved = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
    } catch {}
  }, [invitations]);

  const remainingInvites = Math.max(0, MAX_MONTHLY_INVITATIONS - invitations.length);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = {
    bg: getPageBackground(isDark),
    text: isDark ? '#FDF3F5' : '#462037',
    accent: isDark ? '#FDF3F5' : '#462037',
    muted: isDark ? 'rgba(253, 243, 245, 0.72)' : '#683A46',
    border: isDark ? 'rgba(161, 82, 95, 0.32)' : 'rgba(161, 82, 95, 0.18)',
    surface: isDark ? 'rgba(48, 27, 43, 0.84)' : 'rgba(255, 255, 255, 0.85)',
    field: isDark ? 'rgba(20, 14, 28, 0.72)' : 'rgba(255, 255, 255, 0.88)',
    rose: isDark ? '#F9AAAD' : '#A1525F',
  };

  const age = draft.dateOfBirth ? calculateAgeFromISO(draft.dateOfBirth) : null;
  const displayName = draft.vennzName?.trim() || draft.firstName?.trim() || 'Your Name';

  const completionItems = [
    ['Name', Boolean(draft.firstName?.trim() || draft.vennzName?.trim())],
    ['Photos', (draft.photos?.length || 0) >= 2],
    ['Introduction', Boolean(draft.introduction?.trim())],
    ['Location', Boolean(draft.city?.trim())],
    ['Work', Boolean(draft.designation?.trim() || draft.company?.trim())],
    ['Interests', Boolean(draft.interests?.length)],
    ['Vibes', Boolean(draft.vibes?.length)],
  ] as const;

  const completion = Math.round(
    (completionItems.filter(([, complete]) => complete).length / completionItems.length) * 100
  );

  const updateDraft = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setDraft((current: UserProfile) => ({ ...current, [key]: value }));
    setSaveMessage('');
  };

  const handleSave = () => {
    const updatedProfile = { ...draft, profileUpdatedAt: Date.now() };
    updateProfile(updatedProfile);
    setDraft(updatedProfile);
    setIsEditing(false);
    setSaveMessage('Your profile is saved.');
    try {
      const raw =
        sessionStorage.getItem('inner_circle_active_applicant_data') ||
        localStorage.getItem('inner_circle_active_applicant_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.profile) {
          parsed.profile = {
            ...parsed.profile,
            ...updatedProfile,
          };
          sessionStorage.setItem('inner_circle_active_applicant_data', JSON.stringify(parsed));
          localStorage.setItem('inner_circle_active_applicant_data', JSON.stringify(parsed));
        }
      }
    } catch {}
  };

  const handleCancel = () => {
    setDraft({
      ...profile,
      photos: [...(profile.photos || [])],
      interests: [...(profile.interests || [])],
      vibes: [...(profile.vibes || [])],
    });
    setPhotoError('');
    setIsEditing(false);
  };

  const handlePhotoFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - (draft.photos?.length || 0);
    if (remaining <= 0) {
      setPhotoError('You can add up to six photos.');
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = (e.target?.result as string) || '';
      if (src) {
        setCroppingPhoto({ src });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const toggleInterest = (interest: string) => {
    const current = draft.interests || [];
    updateDraft(
      'interests',
      current.includes(interest)
        ? current.filter((item: string) => item !== interest)
        : [...current, interest]
    );
  };

  const toggleVibe = (vibe: string) => {
    const current = draft.vibes || [];
    updateDraft(
      'vibes',
      current.includes(vibe)
        ? current.filter((item: string) => item !== vibe)
        : current.length < 5
        ? [...current, vibe]
        : current
    );
  };

  // Generate Invite Code
  const handleCreateInvitation = () => {
    if (remainingInvites <= 0) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomStr = '';
    for (let i = 0; i < 5; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `VZ-${randomStr}`;
    setInvitations((prev: { code: string; createdAt: number }[]) => [{ code: newCode, createdAt: Date.now() }, ...prev]);
    setLatestGeneratedCode(newCode);
    setCopySuccess(false);
  };

  const handleCopyCode = async (code: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2400);
    } catch {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2400);
    }
  };

  const planLabel = isTrialExpired
    ? 'Complimentary (Expired)'
    : isComplimentary
    ? '24-Hour Complimentary'
    : isMember
    ? 'Paid Member (₹1,499/mo)'
    : 'Waitlist Guest';

  const matchesCount = matches ? matches.length : 0;
  const requestsCount =
    (incomingRequests ? incomingRequests.length : 0) + (sentRequests ? sentRequests.length : 0);

  const verificationItems: [string, boolean][] = [
    [email ? 'Email address' : 'Account verification', Boolean(isPhoneVerified || email)],
    ['Identity (DigiLocker)', Boolean(isIdentityVerified || isDigiLockerVerified)],
    ['Biometric Selfie', Boolean(isSelfieVerified)],
  ];
  const verifiedCount = verificationItems.filter(([, verified]) => verified).length;

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: colors.muted,
    fontSize: '12.5px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '44px',
    boxSizing: 'border-box',
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    background: colors.field,
    color: colors.text,
    font: 'inherit',
    fontSize: '16px',
    outline: 'none',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '24px 0',
    borderTop: `1px solid ${colors.border}`,
  };

  // Convert draft into DiscoverProfile format for the authentic Discover Card Preview
  const previewPhotos =
    draft.photos && draft.photos.length > 0
      ? draft.photos
      : [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85',
        ];

  const currentPreviewPhoto = previewPhotos[previewPhotoIndex % previewPhotos.length];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: colors.bg,
        color: colors.text,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />
      {showStatusBar && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            background: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.92)',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <MemberTopBar onLogoClick={onBack} />
      </div>

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '920px',
            boxSizing: 'border-box',
            padding: '20px 24px 48px',
            margin: '0 auto',
          }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 0',
              border: 0,
              background: 'none',
              color: colors.muted,
              cursor: 'pointer',
              fontSize: '14.5px',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Discover
          </button>

          {/* Profile Header Lockup */}
          <header
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              margin: '14px 0 22px',
            }}
          >
            <div>
              <div
                style={{
                  color: colors.rose,
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                }}
              >
                MEMBER PROFILE & ACCOUNT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h1
                  style={{
                    margin: '6px 0 0',
                    color: colors.accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '38px',
                    fontWeight: 400,
                    lineHeight: 1.1,
                  }}
                >
                  {displayName}
                </h1>
                {isIncognitoActive && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.12)',
                      border: '1px solid rgba(161, 82, 95, 0.35)',
                      color: isDark ? '#F9AAAD' : '#A1525F',
                      textTransform: 'uppercase',
                      marginTop: '6px',
                    }}
                  >
                    <EyeOff size={13} /> Incognito Mode Active
                  </span>
                )}
              </div>
              <p style={{ margin: '8px 0 0', color: colors.muted, fontSize: '15.5px' }}>
                {[draft.designation, draft.company, draft.city].filter(Boolean).join(' · ') ||
                  'Complete your profile to unlock verified introductions.'}
              </p>
            </div>

            {/* Action Suite: Discover Preview & Edit Profile */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setPreviewPhotoIndex(0);
                  setIsPreviewOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '42px',
                  padding: '0 18px',
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: '999px',
                  background: isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                  color: colors.accent,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                <Eye size={16} /> Preview on Discover
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setSaveMessage('');
                    setIsEditing(true);
                    setActiveSubTab('profile');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: '42px',
                    padding: '0 18px',
                    border: 0,
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FFF8F8',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    boxShadow: '0 6px 18px rgba(161, 82, 95, 0.35)',
                  }}
                >
                  <Pencil size={15} /> Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      minHeight: '42px',
                      padding: '0 16px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '999px',
                      background: 'transparent',
                      color: colors.accent,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      minHeight: '42px',
                      padding: '0 20px',
                      border: 0,
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                      color: '#FFF8F8',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    <Check size={16} /> Save changes
                  </button>
                </>
              )}
            </div>
          </header>

          {saveMessage && (
            <div
              style={{
                margin: '0 0 16px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                color: isDark ? '#86EFAC' : '#2E7D32',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              {saveMessage}
            </div>
          )}

          {/* Incognito Mode Card (Tinder-style discreet browsing) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              borderRadius: '16px',
              backgroundColor: isIncognitoActive
                ? (isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(253, 240, 243, 0.95)')
                : (isDark ? 'rgba(40, 20, 34, 0.65)' : 'rgba(255, 255, 255, 0.9)'),
              border: `1.5px solid ${isIncognitoActive ? 'rgba(161, 82, 95, 0.5)' : colors.border}`,
              boxShadow: isIncognitoActive
                ? '0 6px 20px rgba(161, 82, 95, 0.15)'
                : '0 4px 14px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isIncognitoActive
                    ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)'
                    : (isDark ? 'rgba(70, 32, 55, 0.5)' : 'rgba(240, 230, 235, 0.8)'),
                  color: isIncognitoActive ? '#FFFFFF' : colors.muted,
                  flexShrink: 0,
                  boxShadow: isIncognitoActive ? '0 4px 12px rgba(161, 82, 95, 0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <EyeOff size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: colors.text,
                      letterSpacing: '0.01em',
                    }}
                  >
                    Incognito Mode
                  </span>

                  {/* Info Button */}
                  <button
                    type="button"
                    onClick={() => setIsIncognitoInfoOpen(true)}
                    title="Learn how Incognito Mode works"
                    aria-label="Incognito Mode Info"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(235, 220, 225, 0.7)',
                      color: colors.accent,
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Info size={12} />
                  </button>

                  {isIncognitoActive && (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#FFF8F8',
                        backgroundColor: '#A1525F',
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <p
                  style={{
                    margin: '3px 0 0',
                    fontSize: '14.5px',
                    color: colors.muted,
                    lineHeight: 1.4,
                  }}
                >
                  {isIncognitoActive
                    ? 'Only individuals you like / swipe right can view your profile in their feed.'
                    : 'Browse anonymously. Your profile is only visible to members you choose to like.'}
                </p>
              </div>
            </div>

            {/* iOS Style Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isIncognitoActive}
              aria-label="Toggle Incognito Mode"
              onClick={handleToggleIncognito}
              style={{
                position: 'relative',
                width: '52px',
                height: '30px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: isIncognitoActive ? '#A1525F' : (isDark ? 'rgba(255,255,255,0.18)' : '#D6CCD2'),
                cursor: 'pointer',
                padding: '3px',
                transition: 'background-color 0.25s ease',
                flexShrink: 0,
                outline: 'none',
                boxShadow: isIncognitoActive ? '0 2px 8px rgba(161, 82, 95, 0.4)' : 'none',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  transform: isIncognitoActive ? 'translateX(22px)' : 'translateX(0px)',
                  transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              />
            </button>
          </div>

          {/* Sub Navigation Pill Tabs (Profile Details vs Elevate Studio vs Account & Membership) */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '4px',
              marginBottom: '20px',
              backgroundColor: isDark ? 'rgba(40, 20, 34, 0.6)' : 'rgba(235, 220, 225, 0.5)',
              borderRadius: '999px',
              width: 'fit-content',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSubTab('profile')}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeSubTab === 'profile' ? (isDark ? '#462037' : '#FFFFFF') : 'transparent',
                color: activeSubTab === 'profile' ? colors.text : colors.muted,
                fontWeight: activeSubTab === 'profile' ? 700 : 500,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'profile' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Profile Details
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('elevate')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeSubTab === 'elevate' ? (isDark ? '#462037' : '#FFFFFF') : 'transparent',
                color: activeSubTab === 'elevate' ? (isDark ? '#F9AAAD' : '#A1525F') : colors.muted,
                fontWeight: activeSubTab === 'elevate' ? 700 : 500,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'elevate' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={14} color={activeSubTab === 'elevate' ? (isDark ? '#F9AAAD' : '#A1525F') : 'currentColor'} />
              Elevate Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('account')}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeSubTab === 'account' ? (isDark ? '#462037' : '#FFFFFF') : 'transparent',
                color: activeSubTab === 'account' ? colors.text : colors.muted,
                fontWeight: activeSubTab === 'account' ? 700 : 500,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'account' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Settings
            </button>
          </div>

          {activeSubTab === 'profile' ? (
            <>
              {/* Profile Completeness & Verification Card */}
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: '24px',
                  padding: '22px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '18px',
                  background: colors.surface,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={labelStyle}>PROFILE COMPLETENESS</span>
                    <strong style={{ color: colors.rose, fontSize: '16px', fontWeight: 700 }}>
                      {completion}%
                    </strong>
                  </div>
                  <progress
                    aria-label="Profile completeness"
                    max={100}
                    value={completion}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '6px',
                      margin: '6px 0 14px',
                      accentColor: '#A1525F',
                      borderRadius: '4px',
                    }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
                    {completionItems.map(([label, complete]) => (
                      <span
                        key={label}
                        style={{
                          color: complete ? colors.accent : colors.muted,
                          fontSize: '13.5px',
                          fontWeight: complete ? 600 : 400,
                        }}
                      >
                        {complete ? '✓' : '○'} {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ paddingLeft: '20px', borderLeft: `1px solid ${colors.border}` }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                      color: colors.accent,
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}
                  >
                    <ShieldCheck size={16} /> VERIFICATION PROTOCOL {verifiedCount}/{verificationItems.length}
                  </div>
                  {verificationItems.map(([label, verified]) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '4px 0',
                        color: colors.muted,
                        fontSize: '14px',
                      }}
                    >
                      <span>{label}</span>
                      <span
                        style={{
                          color: verified ? (isDark ? '#86EFAC' : '#2E7D32') : colors.muted,
                          fontWeight: verified ? 600 : 400,
                        }}
                      >
                        {verified ? '✓ Verified' : 'Incomplete'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Photos Grid with Crop / Adjust */}
              <section style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h2
                    style={{
                      margin: 0,
                      color: colors.accent,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '24px',
                      fontWeight: 400,
                    }}
                  >
                    Photographs
                  </h2>
                  <span style={{ fontSize: '14px', color: colors.muted }}>
                    {draft.photos?.length || 0} of {MAX_PHOTOS} photos
                  </span>
                </div>
                <p style={{ margin: '0 0 16px', color: colors.muted, fontSize: '15px' }}>
                  Your primary photo is the first thing other members see on Discover. Use the crop tool to adjust your framing to 3:4.
                </p>

                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoFiles} />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {(draft.photos || []).map((photo: string, index: number) => (
                    <div
                      key={`my-photo-${index}-${photo.length}-${photo.slice(-24)}`}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '3 / 4',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: '#000000',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Profile photo ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {index === 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(20, 14, 28, 0.85)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                          }}
                        >
                          MAIN
                        </span>
                      )}

                      {/* Crop / Adjust Framing Button */}
                      <button
                        type="button"
                        onClick={() => setCroppingPhoto({ src: photo, index })}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(20, 14, 28, 0.75)',
                          backdropFilter: 'blur(4px)',
                          color: '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                        title="Adjust framing"
                      >
                        <Crop size={11} />
                        <span>Crop</span>
                      </button>

                      {isEditing && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            display: 'flex',
                            gap: '4px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const nextPhotos = (draft.photos || []).filter((_: string, i: number) => i !== index);
                              updateDraft('photos', nextPhotos);
                            }}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(20, 14, 28, 0.75)',
                              backdropFilter: 'blur(4px)',
                              color: '#FFFFFF',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Remove photo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isEditing && (draft.photos?.length || 0) < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        aspectRatio: '3 / 4',
                        borderRadius: '12px',
                        border: `1.5px dashed ${colors.border}`,
                        backgroundColor: isDark ? 'rgba(70, 32, 55, 0.25)' : 'rgba(255, 255, 255, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: colors.rose,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={22} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Add Photo</span>
                    </button>
                  )}
                </div>

                {photoError && (
                  <p style={{ color: '#E06D6D', fontSize: '14px', marginTop: '8px' }}>{photoError}</p>
                )}
              </section>

              {/* Bio / Introduction */}
              <section style={sectionStyle}>
                <h2
                  style={{
                    margin: '0 0 10px',
                    color: colors.accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                  }}
                >
                  Introduction / Bio
                </h2>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={draft.introduction || ''}
                    onChange={(e) => updateDraft('introduction', e.target.value)}
                    placeholder="Tell other verified members who you are, what drives you, and what kind of conversations you enjoy..."
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  />
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18.5px',
                      lineHeight: 1.6,
                      color: colors.text,
                    }}
                  >
                    {draft.introduction || 'No introduction provided yet.'}
                  </p>
                )}
              </section>

              {/* Interests (strictly synced to INTEREST_OPTIONS) */}
              <section style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h2
                    style={{
                      margin: 0,
                      color: colors.accent,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '24px',
                      fontWeight: 400,
                    }}
                  >
                    Interests
                  </h2>
                  <span style={{ fontSize: '14px', color: colors.muted }}>
                    {(draft.interests || []).length} selected
                  </span>
                </div>
                <p style={{ margin: '0 0 14px', color: colors.muted, fontSize: '15px' }}>
                  Shared interests highlight natural alignment when other members view your card on Discover.
                </p>

                {isEditing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {INTEREST_OPTIONS.map((interest) => {
                      const selected = (draft.interests || []).includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '999px',
                            border: `1.5px solid ${selected ? '#A1525F' : colors.border}`,
                            background: selected
                              ? isDark
                                ? 'rgba(199, 87, 124, 0.4)'
                                : 'rgba(199, 87, 124, 0.15)'
                              : 'transparent',
                            color: selected ? colors.accent : colors.muted,
                            fontWeight: selected ? 700 : 500,
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {selected ? '✦ ' : ''}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                ) : (draft.interests || []).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {draft.interests?.map((interest: string) => (
                      <span
                        key={interest}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '999px',
                          border: `1px solid ${colors.border}`,
                          backgroundColor: isDark ? 'rgba(70, 32, 55, 0.35)' : 'rgba(255, 255, 255, 0.8)',
                          color: colors.accent,
                          fontSize: '14.5px',
                          fontWeight: 600,
                        }}
                      >
                        ✦ {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: colors.muted, fontSize: '15px' }}>No interests added yet.</p>
                )}
              </section>

              {/* Vibes (strictly synced to VIBE_OPTIONS) */}
              <section style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h2
                    style={{
                      margin: 0,
                      color: colors.accent,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '24px',
                      fontWeight: 400,
                    }}
                  >
                    Your Vibe
                  </h2>
                  <span style={{ fontSize: '14px', color: colors.muted }}>
                    {(draft.vibes || []).length} / 5 selected
                  </span>
                </div>
                <p style={{ margin: '0 0 14px', color: colors.muted, fontSize: '15px' }}>
                  Traits that capture your energy and disposition.
                </p>

                {isEditing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {VIBE_OPTIONS.map((vibe) => {
                      const selected = (draft.vibes || []).includes(vibe);
                      return (
                        <button
                          key={vibe}
                          type="button"
                          onClick={() => toggleVibe(vibe)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '999px',
                            border: `1.5px solid ${selected ? '#A1525F' : colors.border}`,
                            background: selected
                              ? isDark
                                ? 'rgba(199, 87, 124, 0.4)'
                                : 'rgba(199, 87, 124, 0.15)'
                              : 'transparent',
                            color: selected ? colors.accent : colors.muted,
                            fontWeight: selected ? 700 : 500,
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {selected ? '✨ ' : ''}
                          {vibe}
                        </button>
                      );
                    })}
                  </div>
                ) : (draft.vibes || []).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {draft.vibes?.map((vibe: string) => (
                      <span
                        key={vibe}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '999px',
                          border: `1px solid ${colors.border}`,
                          backgroundColor: isDark ? 'rgba(199, 87, 124, 0.22)' : 'rgba(161, 82, 95, 0.1)',
                          color: colors.accent,
                          fontSize: '14.5px',
                          fontWeight: 600,
                        }}
                      >
                        ✨ {vibe}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: colors.muted, fontSize: '15px' }}>No vibes selected yet.</p>
                )}
              </section>

              {/* Details & Location */}
              <section style={sectionStyle}>
                <h2
                  style={{
                    margin: '0 0 16px',
                    color: colors.accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                  }}
                >
                  Personal & Professional Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <span style={labelStyle}>City</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.city || ''}
                        onChange={(e) => updateDraft('city', e.target.value)}
                        placeholder="e.g. Bengaluru, India"
                        style={inputStyle}
                      />
                    ) : (
                      <p style={{ margin: 0, fontSize: '16px' }}>{draft.city || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <span style={labelStyle}>Designation / Role</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.designation || ''}
                        onChange={(e) => updateDraft('designation', e.target.value)}
                        placeholder="e.g. Product Lead"
                        style={inputStyle}
                      />
                    ) : (
                      <p style={{ margin: 0, fontSize: '16px' }}>{draft.designation || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <span style={labelStyle}>Company / Studio</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.company || ''}
                        onChange={(e) => updateDraft('company', e.target.value)}
                        placeholder="e.g. Studio Marigold"
                        style={inputStyle}
                      />
                    ) : (
                      <p style={{ margin: 0, fontSize: '16px' }}>{draft.company || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <span style={labelStyle}>Dating Preference</span>
                    <p style={{ margin: 0, fontSize: '16px' }}>{draft.datingPreference || 'Everyone'}</p>
                  </div>
                </div>
              </section>

              {/* Elevate & Intelligence Quick Link Banner */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(70, 32, 55, 0.45) 0%, rgba(40, 20, 34, 0.7) 100%)'
                    : 'linear-gradient(135deg, rgba(253, 240, 243, 0.95) 0%, rgba(244, 230, 234, 0.8) 100%)',
                  border: `1.5px solid ${isDark ? 'rgba(161, 82, 95, 0.35)' : 'rgba(161, 82, 95, 0.22)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: '18px',
                        color: colors.text,
                        fontWeight: 600,
                      }}
                    >
                      Profile Intelligence & Makeover Studio
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '14.5px', color: colors.muted }}>
                      Review live profile telemetry, AI makeover draft suggestions, and custom styling services.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('elevate')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '999px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(161, 82, 95, 0.25)',
                  }}
                >
                  Open Elevate Studio →
                </button>
              </div>
            </>
          ) : activeSubTab === 'elevate' ? (
            /* ELEVATE INTELLIGENCE & CONCIERGE SUITE */
            <ProfileElevateSuite
              onApplyBioDraft={(newBio) => {
                setDraft((prev) => ({ ...prev, introduction: newBio }));
                setSaveMessage('Suggested bio draft successfully applied to your profile.');
                setTimeout(() => setSaveMessage(''), 4000);
              }}
              onUpgradeToMembership={onUpgradeToMembership}
              onNavigateHelp={onNavigateHelp}
            />
          ) : (
            /* SETTINGS TAB */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Toast for settings updates */}
              {prefsToast && (
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: isDark ? '#A7F3D0' : '#065F46',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check size={16} />
                  <span>{prefsToast}</span>
                </div>
              )}

              {/* 1. DISCOVERY & MATCHING PREFERENCES */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sliders size={18} color={colors.accent} />
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        fontWeight: 600,
                        margin: 0,
                        color: colors.text,
                      }}
                    >
                      Discovery Preferences
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '14.5px', color: colors.muted }}>
                      Tailor the profiles you encounter on Discover
                    </p>
                  </div>
                </div>

                {/* Location Distance Slider */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(70, 32, 55, 0.35)' : 'rgba(244, 230, 234, 0.45)', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color={colors.rose} />
                      <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', color: colors.rose, textTransform: 'uppercase' }}>
                        Maximum Distance
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', fontWeight: 700, color: colors.text }}>
                      {preferences.distanceKm} km
                    </span>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={150}
                    step={5}
                    value={preferences.distanceKm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updatePreferences({ distanceKm: val });
                    }}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '4px',
                      accentColor: '#A1525F',
                      cursor: 'pointer',
                      margin: '10px 0',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {[15, 30, 50, 100].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => {
                          updatePreferences({ distanceKm: km });
                          setPrefsToast(`Distance radius set to ${km} km`);
                          setTimeout(() => setPrefsToast(null), 2500);
                        }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '999px',
                          border: `1px solid ${preferences.distanceKm === km ? colors.accent : colors.border}`,
                          backgroundColor: preferences.distanceKm === km ? (isDark ? 'rgba(161, 82, 95, 0.35)' : 'rgba(161, 82, 95, 0.12)') : 'transparent',
                          color: preferences.distanceKm === km ? colors.text : colors.muted,
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Preference Range */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(70, 32, 55, 0.35)' : 'rgba(244, 230, 234, 0.45)', border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', color: colors.rose, textTransform: 'uppercase' }}>
                      Age Range Preference
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', fontWeight: 700, color: colors.text }}>
                      {preferences.minAge} – {preferences.maxAge} years
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: colors.muted, display: 'block', marginBottom: '4px' }}>Minimum Age</span>
                      <input
                        type="range"
                        min={18}
                        max={Math.min(preferences.maxAge - 1, 55)}
                        value={preferences.minAge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updatePreferences({ minAge: val });
                        }}
                        style={{ width: '100%', height: '6px', borderRadius: '4px', accentColor: '#A1525F', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', color: colors.muted, display: 'block', marginBottom: '4px' }}>Maximum Age</span>
                      <input
                        type="range"
                        min={Math.max(preferences.minAge + 1, 21)}
                        max={65}
                        value={preferences.maxAge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updatePreferences({ maxAge: val });
                        }}
                        style={{ width: '100%', height: '6px', borderRadius: '4px', accentColor: '#A1525F', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. LANGUAGE PREFERENCE */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={18} color={colors.accent} />
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        fontWeight: 600,
                        margin: 0,
                        color: colors.text,
                      }}
                    >
                      Language & Region
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '14.5px', color: colors.muted }}>
                      Preferred language for app interface, concierge, and communication
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = preferences.language === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          updatePreferences({ language: lang });
                          setPrefsToast(`Language changed to ${lang}`);
                          setTimeout(() => setPrefsToast(null), 2500);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: `1.5px solid ${isSelected ? (isDark ? '#F9AAAD' : '#A1525F') : colors.border}`,
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.1)')
                            : (isDark ? 'rgba(70, 32, 55, 0.25)' : 'rgba(255, 255, 255, 0.6)'),
                          color: isSelected ? colors.text : colors.muted,
                          fontSize: '15px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{lang}</span>
                        {isSelected && <Check size={14} color={isDark ? '#F9AAAD' : '#A1525F'} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. BLOCKED CONTACTS & PRIVACY */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserX size={18} color="#E06D6D" />
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        fontWeight: 600,
                        margin: 0,
                        color: colors.text,
                      }}
                    >
                      Blocked Contacts & Privacy
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '14.5px', color: colors.muted }}>
                      Contacts who cannot see your profile, send requests, or discover you
                    </p>
                  </div>
                </div>

                {/* Add blocked contact form */}
                <form onSubmit={handleAddBlockedContact} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newBlockedContact}
                    onChange={(e) => setNewBlockedContact(e.target.value)}
                    placeholder="Enter phone number or contact name..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDark ? 'rgba(70, 32, 55, 0.35)' : '#FFFFFF',
                      color: colors.text,
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Block Contact
                  </button>
                </form>

                {/* Blocked contacts list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {preferences.blockedContacts.length === 0 ? (
                    <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', color: colors.muted, fontSize: '15px', backgroundColor: isDark ? 'rgba(70, 32, 55, 0.2)' : 'rgba(0,0,0,0.02)' }}>
                      No blocked contacts. You have not blocked anyone yet.
                    </div>
                  ) : (
                    preferences.blockedContacts.map((contact) => (
                      <div
                        key={contact}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: isDark ? 'rgba(70, 32, 55, 0.35)' : 'rgba(244, 230, 234, 0.35)',
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UserX size={15} color="#E06D6D" />
                          <span style={{ fontSize: '15px', fontWeight: 600, color: colors.text }}>{contact}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockContact(contact)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'transparent',
                            color: colors.muted,
                            fontSize: '13.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#E06D6D';
                            e.currentTarget.style.borderColor = '#E06D6D';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.muted;
                            e.currentTarget.style.borderColor = colors.border;
                          }}
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Membership Plan Card */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <span style={labelStyle}>MEMBERSHIP TIER</span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '26px',
                      fontWeight: 500,
                      margin: '2px 0 4px',
                      color: colors.text,
                    }}
                  >
                    {planLabel}
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isMember ? '#86EFAC' : '#FBBF24',
                    }}
                  >
                    ● {isMember ? 'Active Private Membership' : 'Complimentary Preview Active'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {onManageMembership && (
                    <button
                      type="button"
                      onClick={onManageMembership}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '999px',
                        border: `1.5px solid ${colors.border}`,
                        background: 'transparent',
                        color: colors.text,
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Manage Plan
                    </button>
                  )}
                  {!isMember && onUpgradeToMembership && (
                    <button
                      type="button"
                      onClick={onUpgradeToMembership}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Upgrade to Full Membership
                    </button>
                  )}
                </div>
              </div>

              {/* Statistics Overview */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '20px',
                  borderRadius: '18px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  onClick={() => onNavigateMatches?.('matches')}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '30px',
                      fontWeight: 600,
                      color: colors.rose,
                      display: 'block',
                    }}
                  >
                    {matchesCount}
                  </span>
                  <span style={labelStyle}>Matches</span>
                </div>

                <div
                  onClick={() => onNavigateMatches?.('requests')}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderLeft: `1px solid ${colors.border}`,
                    borderRight: `1px solid ${colors.border}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '30px',
                      fontWeight: 600,
                      color: colors.rose,
                      display: 'block',
                    }}
                  >
                    {requestsCount}
                  </span>
                  <span style={labelStyle}>Requests</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '30px',
                      fontWeight: 600,
                      color: colors.rose,
                      display: 'block',
                    }}
                  >
                    {invitations.length}
                  </span>
                  <span style={labelStyle}>Invites Shared</span>
                </div>
              </div>

              {/* Exclusive Invitation Code Generator */}
              <div
                style={{
                  padding: '22px',
                  borderRadius: '18px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={labelStyle}>PEER REFERRAL PRIVILEGE</span>
                  <span style={{ fontSize: '13px', color: colors.muted }}>
                    {remainingInvites} of {MAX_MONTHLY_INVITATIONS} invitations remaining this month
                  </span>
                </div>
                <h4
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '20px',
                    margin: '0 0 6px',
                    color: colors.text,
                  }}
                >
                  Invite an Ambitious Peer
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '14.5px', color: colors.muted, lineHeight: 1.5 }}>
                  Membership to VennZ is strictly curated. Peers applying with your code receive expedited committee review.
                </p>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCreateInvitation}
                    disabled={remainingInvites <= 0}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '999px',
                      border: 'none',
                      background: remainingInvites > 0 ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : '#666',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: remainingInvites > 0 ? 'pointer' : 'not-allowed',
                      opacity: remainingInvites > 0 ? 1 : 0.6,
                    }}
                  >
                    + Generate Invite Code
                  </button>

                  {latestGeneratedCode && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        backgroundColor: isDark ? 'rgba(70, 32, 55, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', letterSpacing: '0.08em' }}>
                        {latestGeneratedCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(latestGeneratedCode)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.rose,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                        title="Copy code"
                      >
                        {copySuccess ? <CheckCheck size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Management & Security Actions */}
              <div
                style={{
                  padding: '20px 22px',
                  borderRadius: '18px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span style={labelStyle}>ACCOUNT & SECURITY</span>

                {onNavigateHelp && (
                  <button
                    type="button"
                    onClick={onNavigateHelp}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      border: 'none',
                      borderBottom: `1px solid ${colors.border}`,
                      background: 'none',
                      color: colors.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <HelpCircle size={16} color={colors.muted} />
                      <span style={{ fontSize: '15.5px', fontWeight: 500 }}>Concierge Support & Standards</span>
                    </div>
                    <ChevronRight size={16} color={colors.muted} />
                  </button>
                )}

                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      border: 'none',
                      borderBottom: `1px solid ${colors.border}`,
                      background: 'none',
                      color: colors.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <LogOut size={16} color={colors.muted} />
                      <span style={{ fontSize: '15.5px', fontWeight: 500 }}>Sign Out</span>
                    </div>
                    <ChevronRight size={16} color={colors.muted} />
                  </button>
                )}

                {onDeleteAccount && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0 4px',
                      border: 'none',
                      background: 'none',
                      color: '#E06D6D',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Trash2 size={16} />
                      <span style={{ fontSize: '15.5px', fontWeight: 500 }}>Delete Account & Data</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* App Version & Build Information Card */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: isDark ? 'rgba(30, 18, 38, 0.5)' : 'rgba(250, 241, 243, 0.6)',
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: colors.text }}>
                      VennZ Web Edition
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        color: isDark ? '#A7F3D0' : '#065F46',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={10} /> Up to Date
                    </span>
                  </div>
                  <span style={{ fontSize: '13.5px', color: colors.muted, display: 'block', marginTop: '3px' }}>
                    Version 2.4.1 (Build 2026.10.23) · End-to-End Encrypted
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: colors.muted }}>
                  © {new Date().getFullYear()} VennZ Private Club
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <MemberBottomNav
        activeTab="profile"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />

      {/* PHOTO CROP & ADJUST VIEWPORT MODAL */}
      <PhotoCropModal
        isOpen={Boolean(croppingPhoto)}
        imageSrc={croppingPhoto?.src || ''}
        isDark={isDark}
        onClose={() => setCroppingPhoto(null)}
        onSave={(croppedDataUrl) => {
          let nextPhotos: string[];
          if (croppingPhoto?.index !== undefined) {
            const next = [...(draft.photos || [])];
            next[croppingPhoto.index] = croppedDataUrl;
            nextPhotos = next;
          } else {
            const next = [...(draft.photos || []), croppedDataUrl];
            nextPhotos = next.slice(0, MAX_PHOTOS);
          }
          updateDraft('photos', nextPhotos);
          updateProfile({ photos: nextPhotos });
          try {
            const raw =
              sessionStorage.getItem('inner_circle_active_applicant_data') ||
              localStorage.getItem('inner_circle_active_applicant_data');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.profile) {
                parsed.profile.photos = nextPhotos;
                sessionStorage.setItem('inner_circle_active_applicant_data', JSON.stringify(parsed));
                localStorage.setItem('inner_circle_active_applicant_data', JSON.stringify(parsed));
              }
            }
          } catch {}
          setCroppingPhoto(null);
        }}
      />

      {/* DISCOVER PROFILE PREVIEW MODAL (Authentic Discover Page View) */}
      {isPreviewOpen && (
        <ModalPortal>
          <div
            role="presentation"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(10, 5, 10, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
              padding: '16px',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Preview Control Bar */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0 14px',
                zIndex: 20,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <Eye size={12} />
                <span>DISCOVER PREVIEW</span>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <X size={14} />
                <span>Close</span>
              </button>
            </div>

            {/* Discover Card Container (3:4 ratio, exactly matching Discover Deck) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
                height: 'calc(100vh - 120px)',
                maxHeight: '620px',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#1E121C',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                userSelect: 'none',
              }}
            >
              {/* Photo Image */}
              <img
                src={currentPreviewPhoto}
                alt="Your preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Top Segmented Progress Bar */}
              {previewPhotos.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    right: '16px',
                    display: 'flex',
                    gap: '5px',
                    zIndex: 25,
                    pointerEvents: 'none',
                  }}
                >
                  {previewPhotos.map((_, segIdx) => (
                    <div
                      key={segIdx}
                      style={{
                        height: '3px',
                        flex: 1,
                        borderRadius: '2px',
                        backgroundColor:
                          segIdx === previewPhotoIndex % previewPhotos.length
                            ? '#FFFFFF'
                            : 'rgba(255, 255, 255, 0.35)',
                        boxShadow:
                          segIdx === previewPhotoIndex % previewPhotos.length
                            ? '0 0 6px rgba(255, 255, 255, 0.8)'
                            : 'none',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Activity Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: previewPhotos.length > 1 ? '24px' : '14px',
                  left: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(16, 10, 18, 0.72)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  zIndex: 25,
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#34D399',
                    boxShadow: '0 0 8px #34D399',
                  }}
                />
                <span>Active now</span>
              </div>

              {/* Tap navigation zones to cycle through preview photos */}
              <div
                onClick={() =>
                  setPreviewPhotoIndex((idx) =>
                    idx === 0 ? previewPhotos.length - 1 : idx - 1
                  )
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: '120px',
                  left: 0,
                  width: '40%',
                  zIndex: 10,
                  cursor: 'pointer',
                }}
              />
              <div
                onClick={() =>
                  setPreviewPhotoIndex((idx) => (idx + 1) % previewPhotos.length)
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: '120px',
                  right: 0,
                  width: '60%',
                  zIndex: 10,
                  cursor: 'pointer',
                }}
              />

              {/* Gradient Scrim */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '62%',
                  background:
                    'linear-gradient(to top, rgba(14, 8, 14, 0.98) 0%, rgba(14, 8, 14, 0.72) 42%, rgba(14, 8, 14, 0.15) 75%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Overlay Details on Card based on current photo index */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  zIndex: 15,
                  pointerEvents: 'none',
                }}
              >
                {/* 1st Photo: Name, Age, Verified, Location, Role */}
                {previewPhotoIndex % previewPhotos.length === 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h2
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '34px',
                          fontWeight: 400,
                          color: '#FFFFFF',
                          margin: 0,
                        }}
                      >
                        {displayName}
                        {age && age > 0 ? `, ${age}` : ''}
                      </h2>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#86EFAC',
                          backgroundColor: 'rgba(34, 197, 94, 0.22)',
                          border: '1px solid rgba(74, 222, 128, 0.35)',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        ✦ VERIFIED
                      </span>
                    </div>

                    {draft.city && (
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'rgba(255, 255, 255, 0.85)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <MapPin size={12} />
                        <span>{draft.city}</span>
                      </div>
                    )}

                    {(draft.designation || draft.company) && (
                      <div
                        style={{
                          fontSize: '16px',
                          fontFamily: 'var(--font-serif)',
                          color: 'rgba(255, 255, 255, 0.95)',
                          lineHeight: '1.3',
                        }}
                      >
                        {[draft.designation, draft.company].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </>
                )}

                {/* 2nd Photo: Bio overlay */}
                {previewPhotoIndex % previewPhotos.length === 1 && (
                  <>
                    <div style={{ marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#F9AAAD',
                          backgroundColor: 'rgba(161, 82, 95, 0.32)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                        }}
                      >
                        BIO
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '17.5px',
                        lineHeight: '1.45',
                        color: '#FFFFFF',
                        margin: 0,
                      }}
                    >
                      "{draft.introduction || 'Introducing myself on VennZ...'}"
                    </p>
                  </>
                )}

                {/* 3rd Photo: Interests tags */}
                {previewPhotoIndex % previewPhotos.length === 2 && (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#F9AAAD',
                          backgroundColor: 'rgba(161, 82, 95, 0.32)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                        }}
                      >
                        INTERESTS
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(draft.interests || []).slice(0, 5).map((interest, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.95)',
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                            border: '1px solid rgba(255, 255, 255, 0.22)',
                            padding: '3px 9px',
                            borderRadius: '999px',
                          }}
                        >
                          ✦ {interest}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* 4th Photo onwards: Vibes */}
                {previewPhotoIndex % previewPhotos.length >= 3 && (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#F9AAAD',
                          backgroundColor: 'rgba(161, 82, 95, 0.32)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                        }}
                      >
                        VIBES
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(draft.vibes || []).map((vibe, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.95)',
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                            border: '1px solid rgba(255, 255, 255, 0.22)',
                            padding: '3px 9px',
                            borderRadius: '999px',
                          }}
                        >
                          ✨ {vibe}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tap instruction */}
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.65)',
                marginTop: '10px',
                letterSpacing: '0.04em',
              }}
            >
              Tap card to flip photos & details as members experience it on Discover
            </span>
          </div>
        </ModalPortal>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(10, 5, 9, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '28px 24px',
                maxWidth: '380px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: colors.text, margin: '0 0 8px 0' }}>
                Delete Account & Membership?
              </h3>
              <p style={{ fontSize: '15px', lineHeight: '1.5', color: colors.muted, margin: '0 0 20px 0' }}>
                All your verified credentials, matches, conversations, and membership privileges will be permanently purged.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    if (onDeleteAccount) onDeleteAccount();
                  }}
                  style={{
                    height: '44px',
                    borderRadius: '999px',
                    backgroundColor: '#B91C1C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Permanently Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    height: '42px',
                    borderRadius: '999px',
                    background: 'transparent',
                    color: colors.muted,
                    border: 'none',
                    fontSize: '14.5px',
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

      {/* INCOGNITO INFO MODAL */}
      {isIncognitoInfoOpen && (
        <ModalPortal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(10, 5, 9, 0.78)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setIsIncognitoInfoOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isDark ? '#1C0F19' : '#FFFFFF',
                border: `1.5px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '28px 24px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setIsIncognitoInfoOpen(false)}
                aria-label="Close Modal"
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  color: colors.muted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>

              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(161, 82, 95, 0.35)',
                }}
              >
                <EyeOff size={26} />
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '25px',
                  color: colors.text,
                  margin: '0 0 8px 0',
                  lineHeight: 1.2,
                }}
              >
                How Incognito Mode Works
              </h3>

              <p
                style={{
                  fontSize: '15.5px',
                  lineHeight: '1.6',
                  color: colors.muted,
                  margin: '0 0 18px 0',
                }}
              >
                Incognito Mode gives you complete discretion over who sees your presence on VennZ.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? 'rgba(40, 20, 34, 0.55)' : 'rgba(247, 240, 243, 0.8)',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>✨</span>
                  <div style={{ fontSize: '14.5px', color: colors.text, lineHeight: 1.45 }}>
                    <strong>Visible Only to Right-Swipes:</strong> Only people you like or swipe right on will see your profile in their Discover queue or request list.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? 'rgba(40, 20, 34, 0.55)' : 'rgba(247, 240, 243, 0.8)',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>🛡️</span>
                  <div style={{ fontSize: '14.5px', color: colors.text, lineHeight: 1.45 }}>
                    <strong>Completely Hidden from Public Browse:</strong> You will never appear on anyone else's screen randomly. Friends, colleagues, or strangers cannot stumble across your profile.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? 'rgba(40, 20, 34, 0.55)' : 'rgba(247, 240, 243, 0.8)',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>⚡</span>
                  <div style={{ fontSize: '14.5px', color: colors.text, lineHeight: 1.45 }}>
                    <strong>Uninterrupted Matching:</strong> You can continue exploring profiles freely. When someone you liked swipes back, it forms a mutual match immediately.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isIncognitoActive) {
                      handleToggleIncognito();
                    }
                    setIsIncognitoInfoOpen(false);
                  }}
                  style={{
                    height: '46px',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(161, 82, 95, 0.35)',
                  }}
                >
                  {isIncognitoActive ? 'Got It, Keep Active' : 'Turn On Incognito Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncognitoInfoOpen(false)}
                  style={{
                    height: '38px',
                    borderRadius: '999px',
                    background: 'transparent',
                    color: colors.muted,
                    border: 'none',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Floating Incognito Toast Notification */}
      {incognitoToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '86px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            backgroundColor: isDark ? 'rgba(30, 15, 26, 0.95)' : 'rgba(56, 28, 48, 0.95)',
            color: '#FFFFFF',
            border: '1px solid rgba(249, 170, 173, 0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            padding: '12px 22px',
            borderRadius: '999px',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          <EyeOff size={16} color="#F9AAAD" />
          <span>{incognitoToast}</span>
        </div>
      )}
    </div>
  );
};