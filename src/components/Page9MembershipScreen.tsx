import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

export type MembershipViewMode = 'all' | 'membership_only' | 'complimentary_only';

interface Page9MembershipScreenProps {
  onBack: () => void;
  onPaymentSuccess?: () => void;
  onComplimentarySuccess?: () => void;
  viewMode?: MembershipViewMode;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page9MembershipScreen: React.FC<Page9MembershipScreenProps> = ({
  onBack,
  onPaymentSuccess,
  onComplimentarySuccess,
  viewMode = 'all',
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { setMembershipStatus, startComplimentaryFirstLook, appearanceMode } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
    setIsProcessing(false);
    setIsSuccess(false);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setMembershipStatus('member');
      setTimeout(() => {
        setShowPaymentModal(false);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 1000);
    }, 1200);
  };

  const handleStartComplimentary = () => {
    startComplimentaryFirstLook();
    if (onComplimentarySuccess) {
      onComplimentarySuccess();
    } else if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: isDark ? '#FDF3F5' : '#462037',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Background: Botanical Parchment Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark ? 'url(/profile-bg-dark.png)' : 'url(/profile-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.98 : 0.94,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Luminous Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.42)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Fixed Top Header (Status Bar + Navigation) */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          flexShrink: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.92)' : 'rgba(250, 241, 243, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: isDark ? '1px solid rgba(161, 82, 95, 0.2)' : '1px solid rgba(161, 82, 95, 0.12)',
        }}
      >
        {showStatusBar && <StatusBar variant={isDark ? 'light' : 'dark'} />}

        {/* Top Navigation Bar */}
        <div
          style={{
            padding: '8px 24px 6px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back to application status"
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
              cursor: 'pointer',
              padding: '6px 8px',
              marginLeft: '-8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '8px',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </button>

          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#2E7D32',
              backgroundColor: 'rgba(46, 125, 50, 0.12)',
              padding: '3px 10px',
              borderRadius: '10px',
            }}
          >
            APPROVED ✓
          </span>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '24px 24px 44px 24px',
            textAlign: 'left',
            maxWidth: '920px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Editorial Kicker */}
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
              marginBottom: '8px',
            }}
          >
            MEMBERSHIP
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 3.8vw, 42px)',
              lineHeight: '1.15',
              fontWeight: 400,
              color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
              margin: '0 0 10px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Welcome to VennZ.
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 24px 0',
            }}
          >
            {viewMode === 'complimentary_only'
              ? 'Your complimentary First Look awaits. Experience curated introductions for 24 hours.'
              : 'One membership, everything included. Cancel any time.'}
          </p>

          {/* BOX 1 — MONTHLY MEMBERSHIP */}
          {viewMode !== 'complimentary_only' && (
            <>
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '18px',
                  border: isDark ? '1.5px solid rgba(243, 238, 233, 0.16)' : '1.5px solid rgba(73, 40, 61, 0.22)',
                  padding: '24px 22px 22px 22px',
                  boxShadow: isDark ? 'none' : '0 4px 20px rgba(73, 40, 61, 0.05)',
                  marginBottom: '22px',
                }}
              >
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '34px',
                        fontWeight: 700,
                        color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      ₹1,499
                    </span>
                    <span
                      style={{
                        fontSize: '16.5px',
                        fontWeight: 500,
                        color: isDark ? '#B3A1A8' : '#7A6B74',
                      }}
                    >
                      / month
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '19px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Your membership includes
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '22px',
                  }}
                >
                  {[
                    { bold: 'Unlimited', desc: 'Curated introductions' },
                    { bold: 'Unlimited', desc: 'Connection requests' },
                    { bold: 'Unlimited', desc: 'Matches' },
                    { bold: 'Full Access', desc: 'Elevate' },
                    { bold: 'Member Pricing', desc: 'Mixers & Events' },
                    { bold: '4 Every Month', desc: 'Member referrals' },
                    { bold: 'Priority', desc: 'Access to the community' },
                    { bold: 'Verified', desc: 'Hand-reviewed members' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '15.5px',
                        lineHeight: '1.45',
                        color: isDark ? '#F3EEE9' : '#272124',
                      }}
                    >
                      <strong style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--color-mulberry)' }}>
                        {item.bold}
                      </strong>
                      <span style={{ margin: '0 6px', color: isDark ? '#B3A1A8' : '#8A7A84' }}>—</span>
                      <span style={{ fontWeight: 400, color: isDark ? '#E2D6DC' : '#3E343A' }}>
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.1)' }}>
                  <div
                    style={{
                      borderLeft: `2.5px solid ${isDark ? '#F9AAAD' : 'var(--color-mulberry)'}`,
                      paddingLeft: '12px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '15.5px',
                        lineHeight: '1.45',
                        color: isDark ? '#F3EEE9' : '#272124',
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      A more intentional way to meet, connect and grow.
                    </p>
                  </div>
                </div>
              </div>

              {/* TERMS SECTION */}
              <div style={{ marginBottom: '22px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                    marginBottom: '8px',
                  }}
                >
                  TERMS
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.55',
                    color: isDark ? '#BDB0B6' : '#6E5E68',
                    margin: '0 0 16px 0',
                  }}
                >
                  Billed monthly and renews automatically on the same date each month. Cancel any time — your membership stays active until the end of the paid period. Payments are processed securely; we never store your card details.
                </p>

                <div
                  style={{
                    height: '1px',
                    backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.14)',
                    width: '100%',
                  }}
                />
              </div>
            </>
          )}

          {/* BOX 2 — COMPLIMENTARY FIRST LOOK */}
          {viewMode !== 'membership_only' && (
            <div
              style={{
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255, 255, 255, 0.76)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '18px',
                border: isDark ? '1.5px solid rgba(243, 238, 233, 0.14)' : '1.5px solid rgba(73, 40, 61, 0.22)',
                padding: '22px 20px 20px 20px',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(73, 40, 61, 0.05)',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  paddingBottom: '12px',
                  borderBottom: isDark ? '1px solid rgba(243, 238, 233, 0.08)' : '1px solid rgba(73, 40, 61, 0.12)',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                  }}
                >
                  COMPLIMENTARY FIRST LOOK
                </span>

                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
                    letterSpacing: '0.04em',
                  }}
                >
                  24 HOURS
                </span>
              </div>

              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: isDark ? '#D9CFD5' : '#5E4E58',
                  margin: '0 0 14px 0',
                }}
              >
                Enter for a day as our guest — no card needed.
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 18px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {[
                  '20 curated introductions',
                  '5 connection requests',
                  'Unlimited passes & matches',
                  'Access to member mixers',
                  'Verified, hand-reviewed members',
                ].map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '15px',
                      lineHeight: '1.45',
                      color: isDark ? '#F3EEE9' : '#272124',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        color: isDark ? '#F9AAAD' : 'var(--color-mulberry)',
                        fontSize: '15px',
                        lineHeight: '1.45',
                        flexShrink: 0,
                      }}
                    >
                      •
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                style={{
                  borderTop: isDark ? '1px dashed rgba(243, 238, 233, 0.15)' : '1px dashed rgba(73, 40, 61, 0.16)',
                  paddingTop: '12px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isDark ? '#B3A1A8' : '#8A7A84',
                  fontWeight: 600,
                }}
              >
                AFTER 24 HOURS, NEW INTRODUCTIONS AND REQUESTS CLOSE. MATCHES YOU’VE ALREADY MADE, AND THEIR CONVERSATIONS, STAY OPEN.
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {viewMode !== 'complimentary_only' && (
              <>
                <div
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 500,
                    color: isDark ? '#D9CFD5' : '#6E5E68',
                    textAlign: 'center',
                    marginBottom: '4px',
                  }}
                >
                  A more intentional way to meet, connect and grow!
                </div>
                <button
                  type="button"
                  onClick={handleOpenPaymentModal}
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '28px',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FDF3F5',
                    border: 'none',
                    fontSize: '16.5px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 22px rgba(161, 82, 95, 0.4)',
                    transition: 'filter 0.2s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #C7577C 0%, #F9AAAD 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>BECOME A MEMBER</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {viewMode !== 'membership_only' && (
              <button
                type="button"
                onClick={handleStartComplimentary}
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '27px',
                  background: viewMode === 'complimentary_only' ? 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)' : 'transparent',
                  color: viewMode === 'complimentary_only' ? '#FDF3F5' : (isDark ? '#F9AAAD' : '#462037'),
                  border: viewMode === 'complimentary_only' ? 'none' : (isDark ? '1.5px solid rgba(161, 82, 95, 0.45)' : '1.5px solid rgba(161, 82, 95, 0.35)'),
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: viewMode === 'complimentary_only' ? '0 6px 22px rgba(161, 82, 95, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>START 24-HOUR COMPLIMENTARY ACCESS</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {showHomeIndicator && (
            <div style={{ paddingBottom: '16px', marginTop: 'auto' }}>
              <div
                style={{
                  width: '134px',
                  height: '5px',
                  backgroundColor: isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.3)',
                  borderRadius: '9999px',
                  margin: '0 auto',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* INTERACTIVE PAYMENT DEMO POPUP MODAL                       */}
      {/* ========================================================== */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(20, 14, 28, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => !isProcessing && setShowPaymentModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: isDark ? '#462037' : '#FAF6F0',
              border: isDark ? '1.5px solid rgba(243, 238, 233, 0.2)' : '1.5px solid rgba(73, 40, 61, 0.25)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              color: isDark ? '#F3EEE9' : 'var(--color-espresso)',
              textAlign: 'left',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!isProcessing && !isSuccess && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: isDark ? '#B3A1A8' : '#8A7A84',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}

            {isSuccess ? (
              /* SUCCESS STATE OVERLAY */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 125, 50, 0.15)',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontSize: '28px',
                  }}
                >
                  ✓
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '22px',
                    margin: '0 0 8px 0',
                    color: isDark ? '#FFFFFF' : 'var(--color-mulberry)',
                  }}
                >
                  Payment Successful!
                </h3>
                <p style={{ fontSize: '13.5px', color: isDark ? '#BDB0B6' : '#6E5E68', margin: 0 }}>
                  Welcome to VennZ. Redirecting to Discover...
                </p>
              </div>
            ) : isProcessing ? (
              /* PROCESSING STATE OVERLAY */
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: `3px solid ${isDark ? 'rgba(243, 238, 233, 0.2)' : 'rgba(73, 40, 61, 0.2)'}`,
                    borderTop: `3px solid ${isDark ? '#F9AAAD' : 'var(--color-mulberry)'}`,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 16px auto',
                  }}
                />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>
                  Processing Payment...
                </h4>
                <p style={{ fontSize: '12px', color: isDark ? '#B3A1A8' : '#8A7A84', margin: 0 }}>
                  Authorizing test transaction securely.
                </p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              /* NORMAL CHECKOUT FORM */
              <>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isDark ? '#F9AAAD' : 'var(--color-mulberry)', marginBottom: '4px' }}>
                  DEMO CHECKOUT
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 16px 0', color: isDark ? '#FFFFFF' : 'var(--color-mulberry)' }}>
                  Complete Membership
                </h3>

                {/* Plan Summary Box */}
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(73, 40, 61, 0.06)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>Circle Monthly Access</div>
                    <div style={{ fontSize: '11px', color: isDark ? '#B3A1A8' : '#8A7A84' }}>Billed monthly · Cancel anytime</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: isDark ? '#FBF7F2' : 'var(--color-mulberry)' }}>
                    ₹1,499
                  </div>
                </div>

                {/* Payment Method Switcher */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: paymentMethod === 'card' ? '1.5px solid var(--color-mulberry)' : '1px solid rgba(120, 120, 120, 0.3)',
                      backgroundColor: paymentMethod === 'card' ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(73, 40, 61, 0.08)') : 'transparent',
                      color: isDark ? '#F3EEE9' : 'var(--color-espresso)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: paymentMethod === 'upi' ? '1.5px solid var(--color-mulberry)' : '1px solid rgba(120, 120, 120, 0.3)',
                      backgroundColor: paymentMethod === 'upi' ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(73, 40, 61, 0.08)') : 'transparent',
                      color: isDark ? '#F3EEE9' : 'var(--color-espresso)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📱 UPI / GPay
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '18px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#B3A1A8' : '#8A7A84', marginBottom: '3px' }}>CARD NUMBER</label>
                      <input
                        type="text"
                        readOnly
                        value="4242 •••• •••• 4242"
                        style={{
                          width: '100%',
                          height: '38px',
                          borderRadius: '8px',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(73, 40, 61, 0.2)',
                          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF',
                          padding: '0 10px',
                          fontSize: '12px',
                          color: isDark ? '#FFFFFF' : '#272124',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#B3A1A8' : '#8A7A84', marginBottom: '3px' }}>EXPIRES</label>
                        <input
                          type="text"
                          readOnly
                          value="12 / 28"
                          style={{
                            width: '100%',
                            height: '38px',
                            borderRadius: '8px',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(73, 40, 61, 0.2)',
                            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF',
                            padding: '0 10px',
                            fontSize: '12px',
                            color: isDark ? '#FFFFFF' : '#272124',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#B3A1A8' : '#8A7A84', marginBottom: '3px' }}>CVV</label>
                        <input
                          type="text"
                          readOnly
                          value="888"
                          style={{
                            width: '100%',
                            height: '38px',
                            borderRadius: '8px',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(73, 40, 61, 0.2)',
                            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF',
                            padding: '0 10px',
                            fontSize: '12px',
                            color: isDark ? '#FFFFFF' : '#272124',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#B3A1A8' : '#8A7A84', marginBottom: '3px' }}>VPA / UPI ID</label>
                    <input
                      type="text"
                      readOnly
                      value="innercircle@upi"
                      style={{
                        width: '100%',
                        height: '38px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(73, 40, 61, 0.2)',
                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF',
                        padding: '0 10px',
                        fontSize: '12px',
                        color: isDark ? '#FFFFFF' : '#272124',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                <div style={{ fontSize: '11px', color: isDark ? '#86EFAC' : '#2E7D32', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>
                  ✓ Demo Environment: Click below to authorize membership payment.
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                    color: '#FDF3F5',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(161, 82, 95, 0.45)',
                  }}
                >
                  PAY ₹1,499 & JOIN NOW →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
