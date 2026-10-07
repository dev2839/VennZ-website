import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import type { UserInvitation } from '../types/you';

interface Page13YouScreenProps {
  onNavigateHelp: () => void;
  onNavigateProfile: () => void;
  onManageMembership: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onSelectTab: (tab: MemberTab) => void;
  onNavigateMatches?: (subTab: 'matches' | 'requests') => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

const INVITATIONS_STORAGE_KEY = 'inner_circle_user_invitations';
const MAX_MONTHLY_INVITATIONS = 4;

export const Page13YouScreen: React.FC<Page13YouScreenProps> = ({
  onNavigateHelp,
  onNavigateProfile,
  onManageMembership,
  onSignOut,
  onDeleteAccount,
  onSelectTab,
  onNavigateMatches,
  onUpgradeToMembership,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    profile,
    matches,
    sentRequests,
    incomingRequests,
    blockedProfileIds,
    appearanceMode,
    isMember,
    isComplimentary,
    isTrialExpired,
    expireTrialForTesting,
    resetTrialForTesting,
    setMembershipStatus,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Stored invitations from localStorage
  const [invitations, setInvitations] = useState<UserInvitation[]>(() => {
    try {
      const saved = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // Current newly generated code to display (initially null - not shown on page load!)
  const [latestGeneratedCode, setLatestGeneratedCode] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Modal confirmation for Delete Account
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Sync invitations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
    } catch {
      // Ignore
    }
  }, [invitations]);

  // Invitations left calculation
  const remainingInvites = Math.max(0, MAX_MONTHLY_INVITATIONS - invitations.length);

  // Dynamic user details
  const userFirstName = (profile.firstName && profile.firstName.trim().length > 0)
    ? profile.firstName.trim()
    : 'jdy';

  // Format: designation · location (no random dummy strings like fhf or kfvk)
  const designation = (profile.designation && profile.designation.trim().length > 0)
    ? profile.designation.trim()
    : 'Product Lead';

  const location = (profile.city && profile.city.trim().length > 0)
    ? profile.city.trim()
    : 'Bengaluru, India';

  const userSubtext = `${designation} · ${location}`;

  // Statistics (Purely dynamic from live state)
  const matchesCount = matches ? matches.length : 0;
  const requestsCount = (incomingRequests ? incomingRequests.length : 0) + (sentRequests ? sentRequests.length : 0);
  const invitesSentCount = invitations.length;
  const blockedCount = blockedProfileIds ? blockedProfileIds.length : 0;

  // Dynamic membership plan & status
  const planLabel = isTrialExpired
    ? 'Complimentary (Expired)'
    : isComplimentary
      ? '24-Hour Complimentary'
      : isMember
        ? 'Paid Member (₹1,499/mo)'
        : 'Waitlist Guest';

  const statusLabel = isTrialExpired
    ? 'Expired'
    : isComplimentary
      ? 'Complimentary (Active)'
      : isMember
        ? 'Active Member'
        : 'Pending';

  const statusColor = isTrialExpired
    ? '#EF4444'
    : isComplimentary
      ? '#D97706'
      : isMember
        ? '#4ADE80'
        : '#F59E0B';

  // Generate unique demo invitation code
  const handleCreateInvitation = () => {
    if (remainingInvites <= 0) return;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomStr = '';
    for (let i = 0; i < 5; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `IC-${randomStr}`;

    const newInv: UserInvitation = {
      code: newCode,
      createdAt: Date.now(),
    };

    setInvitations((prev) => [newInv, ...prev]);
    setLatestGeneratedCode(newCode);
    setCopySuccess(false);
  };

  // Copy code to clipboard
  const handleCopyCode = async (code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Dynamic theme styling
  // In After Dark: Deep cinematic palette (#140E1C) and blush (#FDF3F5 / #F9AAAD)
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const themeCardBg = isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  const themeButtonBg = isDark ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
  const themeButtonText = '#FDF3F5';

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
      {/* Botanical Background Asset (Dynamic: Darkened Botanical wallpaper in After Dark) */}
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

      {/* Subtle Luminous Parchment Glow & Dark Atmospheric Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.35)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* iOS Status Bar (matches Discover Screen top alignment) */}
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

      {/* TOP BAR: IC · VennZ · MEMBER */}
      <MemberTopBar onConciergeClick={onNavigateHelp} />

      {/* SCROLLABLE CONTENT VIEWPORT */}
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
            maxWidth: '960px',
            margin: '0 auto',
            width: '100%',
            padding: '24px 24px 44px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* SECTION 1: MEMBERSHIP HEADER */}
          <div style={{ marginBottom: '22px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: themeMulberry,
                display: 'block',
                marginBottom: '6px',
              }}
            >
              YOUR MEMBERSHIP
            </span>

            {/* Dynamic First Name */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '34px',
                fontWeight: 400,
                lineHeight: '1.15',
                color: themeMulberry,
                margin: '0 0 4px 0',
                letterSpacing: '-0.02em',
              }}
            >
              {userFirstName}
            </h1>

            {/* Subtext: designation · location */}
            <div
              style={{
                fontSize: '13px',
                color: themeMuted,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {userSubtext}
            </div>
            {/* Public Social Links Bar (shown when opted in) */}
            {((profile.showLinkedinPublicly && profile.linkedinUrl) || (profile.showInstagramPublicly && profile.instagramUsername)) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {profile.showLinkedinPublicly && profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      backgroundColor: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(161, 82, 95, 0.1)',
                      border: `1px solid ${themeBorder}`,
                      color: themeMulberry,
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    <span>LinkedIn ↗</span>
                  </a>
                )}
                {profile.showInstagramPublicly && profile.instagramUsername && (
                  <a
                    href={`https://instagram.com/${profile.instagramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      backgroundColor: isDark ? 'rgba(161, 82, 95, 0.22)' : 'rgba(161, 82, 95, 0.1)',
                      border: `1px solid ${themeBorder}`,
                      color: themeMulberry,
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                    <span>{profile.instagramUsername.startsWith('@') ? profile.instagramUsername : `@${profile.instagramUsername}`} ↗</span>
                  </a>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onNavigateProfile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                marginTop: '12px',
                padding: '8px 0',
                border: 'none',
                background: 'transparent',
                color: themeMulberry,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              VIEW & EDIT MY PROFILE
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          {/* 3 STATISTICS HORIZONTALLY */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: `1px solid ${themeBorder}`,
              borderBottom: `1px solid ${themeBorder}`,
              padding: '16px 0',
              marginBottom: '26px',
              textAlign: 'left',
            }}
          >
            {/* Matches */}
            <button
              type="button"
              onClick={() => (onNavigateMatches ? onNavigateMatches('matches') : onSelectTab('matches'))}
              aria-label={`View ${matchesCount} matches`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  lineHeight: '1.1',
                  color: themeMulberry,
                  fontWeight: 400,
                }}
              >
                {matchesCount}
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                  marginTop: '4px',
                }}
              >
                MATCHES
              </span>
            </button>

            {/* Requests */}
            <button
              type="button"
              onClick={() => (onNavigateMatches ? onNavigateMatches('requests') : onSelectTab('matches'))}
              aria-label={`View ${requestsCount} requests`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  lineHeight: '1.1',
                  color: themeMulberry,
                  fontWeight: 400,
                }}
              >
                {requestsCount}
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                  marginTop: '4px',
                }}
              >
                REQUESTS
              </span>
            </button>

            {/* Invites Sent */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  lineHeight: '1.1',
                  color: themeMulberry,
                  fontWeight: 400,
                }}
              >
                {invitesSentCount}
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: themeMuted,
                  marginTop: '4px',
                }}
              >
                INVITES SENT
              </span>
            </div>
          </div>

          {/* SECTION 2: INVITATIONS */}
          <div style={{ marginBottom: '28px' }}>
            {!isMember ? (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: themeMulberry,
                    marginBottom: '8px',
                  }}
                >
                  INVITATIONS · 🔒 MEMBER-ONLY
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.55',
                    color: themeMuted,
                    margin: '0 0 16px 0',
                  }}
                >
                  Guest invitations and member referrals are reserved for Full Members (4 referrals per month). Unlock invitations by activating your membership.
                </p>

                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: themeMuted,
                    textAlign: 'center',
                    marginBottom: '8px',
                  }}
                >
                  A more intentional way to meet, connect and grow!
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onUpgradeToMembership) {
                      onUpgradeToMembership();
                    } else {
                      setMembershipStatus('member');
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FDF3F5',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(161, 82, 95, 0.4)',
                  }}
                >
                  UPGRADE FOR 4 INVITATIONS/MONTH →
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: themeMulberry,
                    marginBottom: '8px',
                  }}
                >
                  INVITATIONS · {remainingInvites} LEFT THIS MONTH
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.55',
                    color: themeMuted,
                    margin: '0 0 16px 0',
                  }}
                >
                  The community grows only by invitation. Each code can be used once, and we still review the application by hand.
                </p>

                {/* Create Invitation Button */}
                <button
                  type="button"
                  onClick={handleCreateInvitation}
                  disabled={remainingInvites <= 0}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '24px',
                    backgroundColor: remainingInvites <= 0 ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(73, 40, 61, 0.15)') : themeButtonBg,
                    color: remainingInvites <= 0 ? themeMuted : themeButtonText,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: remainingInvites <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: remainingInvites <= 0 ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>GENERATE INVITATION CODE</span>
                </button>

                {/* Newly Generated Code Box */}
                {latestGeneratedCode && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      backgroundColor: themeCardBg,
                      border: `1px solid ${themeBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: themeMuted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Your One-Time Code
                      </span>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '17px',
                          fontWeight: 700,
                          color: themeMulberry,
                          letterSpacing: '0.12em',
                          marginTop: '2px',
                        }}
                      >
                        {latestGeneratedCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(latestGeneratedCode)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '16px',
                        backgroundColor: copySuccess ? '#2E7D32' : themeButtonBg,
                        color: copySuccess ? '#FFFFFF' : themeButtonText,
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copySuccess ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>COPIED</span>
                        </>
                      ) : (
                        <span>COPY</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: themeBorder, marginBottom: '26px' }} />


          {/* SECTION 4: ACCOUNT / MEMBERSHIP INFORMATION (TWO COLUMN LAYOUT) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* PLAN */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                  PLAN
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeMulberry }}>
                  {planLabel}
                </span>
              </div>

              {/* STATUS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                  STATUS
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: statusColor }}>
                  {statusLabel}
                </span>
              </div>

              {/* IDENTITY */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                  IDENTITY
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeMulberry }}>
                  Verified
                </span>
              </div>

              {/* ENTRY */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                  ENTRY
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeMulberry }}>
                  Waitlist
                </span>
              </div>

              {/* BLOCKED */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                  BLOCKED
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: themeMulberry }}>
                  {blockedCount} member(s)
                </span>
              </div>

              {/* PUBLIC LINKEDIN (if opted in) */}
              {profile.showLinkedinPublicly && profile.linkedinUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                    LINKEDIN (PUBLIC)
                  </span>
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', fontWeight: 600, color: themeMulberry, textDecoration: 'none' }}
                  >
                    View Profile ↗
                  </a>
                </div>
              )}

              {/* PUBLIC INSTAGRAM (if opted in) */}
              {profile.showInstagramPublicly && profile.instagramUsername && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                    INSTAGRAM (PUBLIC)
                  </span>
                  <a
                    href={`https://instagram.com/${profile.instagramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', fontWeight: 600, color: themeMulberry, textDecoration: 'none' }}
                  >
                    {profile.instagramUsername} ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ACCESS MODE DEMO SWITCHER */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: themeMulberry,
                marginBottom: '8px',
              }}
            >
              ACCESS MODE DEMO SWITCHER
            </div>

            <p style={{ fontSize: '12.5px', color: themeMuted, margin: '0 0 12px 0', lineHeight: 1.5 }}>
              Switch instantly to explore the app across different membership tiers:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMembershipStatus('member')}
                style={{
                  padding: '10px 4px',
                  borderRadius: '12px',
                  background: isMember ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : (isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(161, 82, 95, 0.08)'),
                  color: isMember ? '#FDF3F5' : themeMulberry,
                  border: `1px solid ${isMember ? '#C7577C' : themeBorder}`,
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isMember ? '0 3px 10px rgba(161, 82, 95, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Paid Member
              </button>

              <button
                type="button"
                onClick={resetTrialForTesting}
                style={{
                  padding: '10px 4px',
                  borderRadius: '12px',
                  background: (isComplimentary && !isTrialExpired) ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : (isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(161, 82, 95, 0.08)'),
                  color: (isComplimentary && !isTrialExpired) ? '#FDF3F5' : themeMulberry,
                  border: `1px solid ${(isComplimentary && !isTrialExpired) ? '#C7577C' : themeBorder}`,
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: (isComplimentary && !isTrialExpired) ? '0 3px 10px rgba(161, 82, 95, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Active 24h Trial
              </button>

              <button
                type="button"
                onClick={expireTrialForTesting}
                style={{
                  padding: '10px 4px',
                  borderRadius: '12px',
                  background: isTrialExpired ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : (isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(161, 82, 95, 0.08)'),
                  color: isTrialExpired ? '#FDF3F5' : themeMulberry,
                  border: `1px solid ${isTrialExpired ? '#C7577C' : themeBorder}`,
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isTrialExpired ? '0 3px 10px rgba(161, 82, 95, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Expired Trial
              </button>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: themeBorder, marginBottom: '26px' }} />

          {/* SECTION 5: HELP & CONTACT US */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: themeMulberry,
                marginBottom: '8px',
              }}
            >
              HELP & CONTACT US
            </div>

            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.55',
                color: themeMuted,
                margin: '0 0 16px 0',
              }}
            >
              Report a member, raise a safety or billing concern, and VennZ team member replies within 24 hours.
            </p>

            <button
              type="button"
              onClick={onNavigateHelp}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '24px',
                backgroundColor: 'transparent',
                border: `1.5px solid ${isDark ? 'rgba(243, 238, 233, 0.4)' : 'rgba(73, 40, 61, 0.35)'}`,
                color: themeMulberry,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              HELP & CONTACT US
            </button>
          </div>

          {/* SECTION 6: OTHER ACCOUNT ACTIONS (MANAGE MEMBERSHIP, SIGN OUT, DELETE MY ACCOUNT) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {/* MANAGE MEMBERSHIP */}
            <button
              type="button"
              onClick={onManageMembership}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '24px',
                backgroundColor: 'transparent',
                border: `1.5px solid ${isDark ? 'rgba(243, 238, 233, 0.4)' : 'rgba(73, 40, 61, 0.35)'}`,
                color: themeMulberry,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              MANAGE MEMBERSHIP
            </button>

            {/* SIGN OUT */}
            <button
              type="button"
              onClick={onSignOut}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '24px',
                backgroundColor: 'transparent',
                border: `1.5px solid ${isDark ? 'rgba(243, 238, 233, 0.4)' : 'rgba(73, 40, 61, 0.35)'}`,
                color: themeMulberry,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              SIGN OUT
            </button>

            {/* DELETE MY ACCOUNT */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '24px',
                backgroundColor: 'transparent',
                border: `1.5px solid ${isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(185, 28, 28, 0.4)'}`,
                color: isDark ? '#FCA5A5' : '#B91C1C',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              DELETE MY ACCOUNT
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG FOR DELETE ACCOUNT */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(23, 17, 21, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: isDark ? '#210D1D' : '#FFFFFF',
              borderRadius: '20px',
              padding: '28px 22px 22px 22px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: `1px solid ${themeBorder}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(185, 28, 28, 0.15)',
                color: isDark ? '#FCA5A5' : '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: themeMulberry,
                margin: '0 0 8px 0',
              }}
            >
              Delete your account?
            </h3>

            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: themeMuted,
                margin: '0 0 22px 0',
              }}
            >
              This action is permanent and cannot be undone. All your membership history, verifications, and private connections will be immediately erased.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={onDeleteAccount}
                style={{
                  height: '44px',
                  borderRadius: '22px',
                  backgroundColor: '#B91C1C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(185, 28, 28, 0.28)',
                }}
              >
                PERMANENTLY DELETE
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  height: '44px',
                  borderRadius: '22px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${themeBorder}`,
                  color: themeMulberry,
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION: MemberBottomNav with YOU selected */}
      <MemberBottomNav
        activeTab="you"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
