import React from 'react';
import { useAuth } from '../context/AuthContext';

interface WebFooterProps {
  onNavigate?: (path: string) => void;
}

export const WebFooter: React.FC<WebFooterProps> = ({ onNavigate }) => {
  const { appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const footerBg = isDark ? '#050205' : '#F4EEE7';
  const borderTop = isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.08)';
  const textColor = isDark ? 'rgba(243, 238, 233, 0.6)' : '#7A6B74';
  const headingColor = isDark ? '#F3EEE9' : 'var(--color-mulberry)';

  return (
    <footer
      style={{
        width: '100%',
        backgroundColor: footerBg,
        borderTop: `1px solid ${borderTop}`,
        padding: '48px 24px 36px',
        boxSizing: 'border-box',
        marginTop: 'auto',
        fontFamily: 'var(--font-sans)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          paddingBottom: '36px',
          borderBottom: `1px solid ${borderTop}`,
        }}
      >
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                color: isDark ? 'var(--color-mulberry)' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
              }}
            >
              IC
            </div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: headingColor,
              }}
            >
              The Inner Circle
            </span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: textColor, margin: 0 }}>
            An exclusive, verified community connecting ambitious individuals through rigorous standards, intentional matchmaking, and private mixer gatherings.
          </p>
        </div>

        {/* Community Pillars */}
        <div>
          <h5
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: headingColor,
              marginBottom: '14px',
            }}
          >
            Community
          </h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Curated Introductions', 'Identity Verification', 'Private Mixers', 'Elevate Concierge'].map((item) => (
              <li key={item} style={{ fontSize: '13px', color: textColor }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Member Standards & Safety */}
        <div>
          <h5
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: headingColor,
              marginBottom: '14px',
            }}
          >
            Standards & Safety
          </h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Community Standards', path: '/join/standards' },
              { label: 'Help & Concierge Desk', path: '/member/help' },
              { label: 'Verification Protocol', path: '/join/identity-verification' },
              { label: 'Waitlist & Review', path: '/join/waitlist' },
            ].map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(link.path)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13px',
                    color: textColor,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = headingColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Membership & Security */}
        <div>
          <h5
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: headingColor,
              marginBottom: '14px',
            }}
          >
            Membership
          </h5>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: textColor, margin: '0 0 10px' }}>
            Membership is strictly by application review or peer referral. All members are verified with live biometric confirmation.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-peach-blush)' }}>
            <span>●</span>
            <span>256-bit Encrypted Identity Verification</span>
          </div>
        </div>
      </div>

      {/* Copyright Sub-bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '24px auto 0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          fontSize: '12px',
          color: textColor,
        }}
      >
        <div>© {new Date().getFullYear()} The Inner Circle Club. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Code of Conduct</span>
        </div>
      </div>
    </footer>
  );
};
