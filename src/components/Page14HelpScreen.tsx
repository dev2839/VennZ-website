import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import type { ComplaintCategory, ComplaintRecord } from '../types/you';

interface Page14HelpScreenProps {
  onBack: () => void;
  onSelectTab: (tab: MemberTab) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

const COMPLAINT_STORAGE_KEY = 'inner_circle_complaints';

export const Page14HelpScreen: React.FC<Page14HelpScreenProps> = ({
  onBack,
  onSelectTab,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('REPORT A MEMBER');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<ComplaintRecord | null>(null);

  const categories: ComplaintCategory[] = [
    'REPORT A MEMBER',
    'SAFETY CONCERN',
    'BILLING',
    'SOMETHING ELSE',
  ];

  // Validation: trimmed message must be MORE THAN 10 characters
  const trimmedMessage = message.trim();
  const isSubmitEnabled = trimmedMessage.length > 10 && !isSubmitting;
  const currentLength = message.length;
  const maxLength = 600;

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;

    setIsSubmitting(true);

    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let refId = '';
    for (let i = 0; i < 5; i++) {
      refId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newRecord: ComplaintRecord = {
      id: `IC-C${refId}`,
      category: selectedCategory,
      message: trimmedMessage,
      timestamp: Date.now(),
      status: 'received',
    };

    // Save to local storage
    try {
      const existing = localStorage.getItem(COMPLAINT_STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newRecord);
      localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }

    // Success confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRecord(newRecord);
      setMessage('');
    }, 400);
  };

  const handleDismissSuccess = () => {
    setSubmittedRecord(null);
  };

  // Theme styling
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const themeCardBg = isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)';

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

      {/* FIXED TOP BAR */}
      <MemberTopBar onConciergeClick={onBack} />

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
            maxWidth: '820px',
            margin: '0 auto',
            width: '100%',
            padding: '24px 24px 44px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Subheader: ← BACK on left, HELP & CONTACT US on right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: themeMulberry,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>BACK</span>
            </button>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: themeMuted,
              }}
            >
              HELP & CONTACT US
            </span>
          </div>

          {/* PAGE TITLE & SUBTEXT */}
          <div style={{ marginBottom: '24px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                lineHeight: '1.2',
                fontWeight: 400,
                color: themeMulberry,
                margin: '0 0 10px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Tell us what happened.
            </h1>

            <p
              style={{
                fontSize: '13.5px',
                lineHeight: '1.55',
                color: themeMuted,
                margin: 0,
              }}
            >
              Something wrong, someone behaving badly, or a question about billing? A real person replies within 24 hours.
            </p>
          </div>

          {/* WHAT IS THIS ABOUT? */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: themeMulberry,
                marginBottom: '10px',
              }}
            >
              WHAT IS THIS ABOUT?
            </div>

            {/* 4 SELECTABLE CATEGORY PILLS */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '1.5px solid #C7577C' : `1px solid ${themeBorder}`,
                      background: isSelected ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : themeCardBg,
                      color: isSelected ? '#FDF3F5' : themeMulberry,
                      fontSize: '11px',
                      fontWeight: isSelected ? 800 : 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 3px 10px rgba(161, 82, 95, 0.35)' : 'none',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPLAINT TEXT AREA */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
              }}
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                placeholder="Tell us what happened, with as much detail as you can."
                rows={7}
                style={{
                  width: '100%',
                  padding: '16px',
                  boxSizing: 'border-box',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  color: themeTextColor,
                  resize: 'none',
                }}
              />
            </div>

            {/* CHARACTER COUNTER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 4px 0 4px',
                fontSize: '11px',
                color: themeMuted,
              }}
            >
              <span>
                {trimmedMessage.length > 0 && trimmedMessage.length <= 10 && (
                  <span style={{ color: isDark ? '#FBBF24' : '#B45309' }}>Enter at least 11 characters</span>
                )}
              </span>
              <span>
                {currentLength}/{maxLength}
              </span>
            </div>
          </div>

          {/* SUBMIT COMPLAINT BUTTON (strictly disabled until >10 characters) */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isSubmitEnabled}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '24px',
              background: isSubmitEnabled ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : (isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(161, 82, 95, 0.16)'),
              color: isSubmitEnabled ? '#FDF3F5' : themeMuted,
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: isSubmitEnabled ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSubmitEnabled ? '0 6px 18px rgba(161, 82, 95, 0.4)' : 'none',
              transition: 'all 0.15s ease',
              marginBottom: '28px',
            }}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT COMPLAINT'}
          </button>

          {/* CONTACT INFORMATION */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingTop: '6px',
              borderTop: `1px solid ${themeBorder}`,
              marginBottom: '28px',
            }}
          >
            {/* EMAIL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                EMAIL
              </span>
              <a
                href="mailto:care@theinnercircle.in"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: themeMulberry,
                  textDecoration: 'none',
                }}
              >
                care@theinnercircle.in
              </a>
            </div>

            {/* HOURS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted }}>
                HOURS
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: themeTextColor }}>
                Mon–Sat, 10am–7pm IST
              </span>
            </div>
          </div>

          {/* BACK TO YOUR MEMBERSHIP BUTTON */}
          <button
            type="button"
            onClick={onBack}
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
            BACK TO YOUR MEMBERSHIP
          </button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {submittedRecord && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
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
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              border: `1px solid ${themeBorder}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                color: isDark ? '#4ADE80' : '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: themeMulberry,
                margin: '0 0 6px 0',
              }}
            >
              Complaint received.
            </h3>

            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: themeMuted,
                marginBottom: '14px',
              }}
            >
              REFERENCE #{submittedRecord.id}
            </span>

            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.55',
                color: themeMuted,
                margin: '0 0 20px 0',
              }}
            >
              Thank you for bringing this to our attention. Our safety and member relations team will review this and respond within 24 hours.
            </p>

            <button
              type="button"
              onClick={handleDismissSuccess}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                color: '#FDF3F5',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(161, 82, 95, 0.4)',
              }}
            >
              DONE
            </button>
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
