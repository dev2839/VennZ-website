import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import { ELEVATE_SERVICES } from '../data/elevateServices';
import type { ElevateService, ElevateOrder } from '../types/elevate';
import {
  generateDynamicScorecard,
  generateDynamicMakeoverReport,
  generateDynamicConversationAudit,
} from '../utils/elevateTelemetry';

interface Page17ElevateScreenProps {
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: () => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

type ElevateNavTab = 'catalog' | 'scorecard' | 'makeover' | 'audit' | 'orders' | 'concierge';

export const Page17ElevateScreen: React.FC<Page17ElevateScreenProps> = ({
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
    sentRequests,
    conversations,
    elevateOrders,
    elevateMessages,
    createElevateOrder,
    requestElevateRefund,
    applyMakeoverBio,
    setConversationAuditConsent,
    sendElevateConciergeMessage,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  // Navigation sub-view
  const [activeTab, setActiveTab] = useState<ElevateNavTab>('catalog');
  const [selectedService, setSelectedService] = useState<ElevateService | null>(null);

  // Order creation modal options
  const [addVideoReview, setAddVideoReview] = useState(false);
  const [auditConsentAgreed, setAuditConsentAgreed] = useState(true);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Refund Modal state
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmittedMessage, setRefundSubmittedMessage] = useState<string | null>(null);

  // Makeover bio applied feedback
  const [appliedBioSuccess, setAppliedBioSuccess] = useState(false);

  // Concierge chat input
  const [conciergeInput, setConciergeInput] = useState('');
  const conciergeEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'concierge') {
      conciergeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, elevateMessages.length]);

  // Dynamic telemetry reports computed live from actual member profile and chat states
  const liveScorecard = generateDynamicScorecard(
    profile,
    matches || [],
    incomingRequests || [],
    sentRequests || [],
    conversations || {}
  );
  const liveMakeover = generateDynamicMakeoverReport(profile);
  const liveAudit = generateDynamicConversationAudit(conversations || {}, auditConsentAgreed);

  // Check if member already purchased or has access to particular services
  const hasIntelligenceOrder = elevateOrders.some((o) => o.serviceCategory === 'profile-intelligence');
  const hasMakeoverOrder = elevateOrders.some((o) => o.serviceCategory === 'profile-makeover');
  const hasAuditOrder = elevateOrders.some((o) => o.serviceCategory === 'conversation-audit');

  // Colors & styles matching VennZ luxury editorial palette
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#7A4D5B';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.2)';
  const themeCardBg = isDark ? 'rgba(42, 20, 34, 0.72)' : 'rgba(255, 255, 255, 0.85)';
  const themeAccentGrad = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';

  // Handle Order Creation
  const handleConfirmOrder = (service: ElevateService) => {
    const newOrder = createElevateOrder(service.id, {
      addVideoReview: addVideoReview && service.id !== 'video-review',
      conversationAuditConsent: service.category === 'conversation-audit' ? auditConsentAgreed : undefined,
    });

    setOrderSuccessMessage(`Order #${newOrder.id} confirmed for ${service.name}.`);
    setSelectedService(null);
    setAddVideoReview(false);

    // Navigate to the respective deliverable tab
    setTimeout(() => {
      setOrderSuccessMessage(null);
      if (service.category === 'profile-intelligence') {
        setActiveTab('scorecard');
      } else if (service.category === 'profile-makeover') {
        setActiveTab('makeover');
      } else if (service.category === 'conversation-audit') {
        setActiveTab('audit');
      } else {
        setActiveTab('orders');
      }
    }, 1200);
  };

  // Handle Refund Submission
  const handleProcessRefund = () => {
    if (!refundOrderId || !refundReason.trim()) return;
    requestElevateRefund(refundOrderId, refundReason.trim());
    setRefundSubmittedMessage(`Refund request for Order #${refundOrderId} recorded.`);
    setRefundReason('');
    setTimeout(() => {
      setRefundOrderId(null);
      setRefundSubmittedMessage(null);
    }, 1500);
  };

  // Handle Applying Suggested Makeover Bio
  const handleApplyBio = (bioText: string) => {
    applyMakeoverBio(bioText);
    setAppliedBioSuccess(true);
    setTimeout(() => setAppliedBioSuccess(false), 2800);
  };

  // Handle Concierge Message Send
  const handleSendConcierge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeInput.trim()) return;
    sendElevateConciergeMessage(conciergeInput.trim());
    setConciergeInput('');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        margin: '0 auto',
        backgroundColor: themeBgColor,
        color: themeTextColor,
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Background Ambience */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(161, 82, 95, 0.22) 0%, rgba(20, 14, 28, 0.98) 75%)'
            : 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(220, 150, 170, 0.18) 0%, rgba(250, 241, 243, 0.98) 75%)',
          zIndex: 0,
        }}
      />

      {/* Top Header & Navigation */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.88)' : 'rgba(250, 241, 243, 0.88)',
          borderBottom: `1px solid ${themeBorder}`,
        }}
      >
        {showStatusBar && <StatusBar />}
        <MemberTopBar onConciergeClick={onNavigateHelp} />

        {/* Elevate Sub-navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '10px 16px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {[
            { id: 'catalog', label: 'Offerings' },
            { id: 'scorecard', label: 'Profile Intelligence' },
            { id: 'makeover', label: 'Makeover Studio' },
            { id: 'audit', label: 'Conversation Audit' },
            { id: 'orders', label: `Orders (${elevateOrders.length})` },
            { id: 'concierge', label: 'Concierge Desk' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as ElevateNavTab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '7px 15px',
                  borderRadius: '999px',
                  border: isActive ? '1px solid rgba(199, 87, 124, 0.8)' : `1px solid ${themeBorder}`,
                  background: isActive
                    ? themeAccentGrad
                    : isDark
                    ? 'rgba(42, 20, 34, 0.45)'
                    : 'rgba(255, 255, 255, 0.65)',
                  color: isActive ? '#FFFFFF' : themeMulberry,
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          padding: '20px 18px 120px',
          maxWidth: '840px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Success Banner if order created */}
        {orderSuccessMessage && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 142, 60, 0.16)',
              border: '1px solid rgba(56, 142, 60, 0.4)',
              color: isDark ? '#A5D6A7' : '#2E7D32',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>✓</span> {orderSuccessMessage}
          </div>
        )}

        {/* =========================================================================
            TAB 1: CATALOG OF OFFERINGS
            ========================================================================= */}
        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Header / Editorial Tagline */}
            <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                }}
              >
                Private Editorial & Telemetry
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '26px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  margin: '8px 0 6px',
                  color: themeTextColor,
                }}
              >
                VennZ Elevate
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: themeMuted,
                  maxWidth: '560px',
                  margin: '0 auto',
                }}
              >
                Measurable member telemetry, discreet profile curation, and privacy-guarded conversation audits
                governed by strict least-privilege staff access.
              </p>
            </div>

            {/* Service Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ELEVATE_SERVICES.map((service) => {
                const isOrdered = elevateOrders.some((o) => o.serviceId === service.id);

                return (
                  <div
                    key={service.id}
                    style={{
                      padding: '22px',
                      borderRadius: '16px',
                      backgroundColor: themeCardBg,
                      border: `1px solid ${themeBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: isDark
                        ? '0 8px 30px rgba(0, 0, 0, 0.35)'
                        : '0 8px 30px rgba(161, 82, 95, 0.06)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              letterSpacing: '0.08em',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              backgroundColor: isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.1)',
                              color: themeMulberry,
                              fontWeight: 700,
                            }}
                          >
                            {service.number}
                          </span>
                          <h2
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '20px',
                              fontWeight: 600,
                              margin: 0,
                              color: themeTextColor,
                            }}
                          >
                            {service.name}
                          </h2>
                        </div>
                        <p
                          style={{
                            fontSize: '13px',
                            color: themeMuted,
                            margin: '6px 0 0',
                            lineHeight: '1.45',
                          }}
                        >
                          {service.tagline}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: themeTextColor }}>
                          ₹{service.startingPrice.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', color: themeMuted }}>{service.typicalDuration}</div>
                      </div>
                    </div>

                    {/* Least-Privilege Staff Access Scope Badge */}
                    <div
                      style={{
                        padding: '9px 12px',
                        borderRadius: '10px',
                        backgroundColor: isDark ? 'rgba(161, 82, 95, 0.12)' : 'rgba(161, 82, 95, 0.07)',
                        border: `1px solid ${themeBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11.5px',
                        color: themeMulberry,
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>🔒</span>
                      <span>
                        <strong>Least-Privilege Staff Scope:</strong> {service.privacyAccessScope}
                      </span>
                    </div>

                    {/* Feature Bullets */}
                    <ul
                      style={{
                        margin: '4px 0 0',
                        paddingLeft: '18px',
                        fontSize: '12.5px',
                        color: themeTextColor,
                        lineHeight: '1.6',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '4px 14px',
                      }}
                    >
                      {service.helpsWith.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>

                    {/* Action Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '12px',
                        paddingTop: '8px',
                        borderTop: `1px solid ${themeBorder}`,
                      }}
                    >
                      {isOrdered && (
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: isDark ? '#A5D6A7' : '#2E7D32',
                            marginRight: 'auto',
                          }}
                        >
                          ✓ Order Active on Account
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedService(service)}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: 'none',
                          background: themeAccentGrad,
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                      >
                        {isOrdered ? 'Re-order or Add Add-on' : `Order ${service.name} →`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PROFILE INTELLIGENCE (LIVE MEASURABLE SCORECARD)
            ========================================================================= */}
        {activeTab === 'scorecard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isDark ? '#F9AAAD' : '#A1525F',
                  }}
                >
                  Telemetry Scorecard
                </span>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 600,
                    margin: '4px 0 0',
                    color: themeTextColor,
                  }}
                >
                  Profile Intelligence
                </h1>
              </div>

              <div
                style={{
                  fontSize: '11.5px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.1)',
                  color: themeMulberry,
                  fontWeight: 600,
                }}
              >
                Top {100 - liveScorecard.cohortPercentile}% VennZ Cohort
              </div>
            </div>

            {/* Privacy Access Banner */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(255, 255, 255, 0.65)',
                border: `1px solid ${themeBorder}`,
                fontSize: '12px',
                color: themeMuted,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🔒</span>
              <span>
                <strong>Confidential Telemetry:</strong> Evaluated strictly on quantitative profile impressions,
                connection responses, and mutual match velocity. Reviewers have zero access to private messages.
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { label: 'Profile Views', value: liveScorecard.viewsTotal, sub: `${liveScorecard.viewsUnique} unique members` },
                { label: 'Connection Requests', value: liveScorecard.requestsReceived, sub: 'Received to date' },
                { label: 'Mutual Venn Matches', value: liveScorecard.matchesMutual, sub: 'Connected members' },
                { label: 'View → Request Rate', value: `${liveScorecard.viewToRequestRate}%`, sub: 'Benchmark: 11.2%' },
                { label: 'Request → Match Rate', value: `${liveScorecard.requestToMatchRate}%`, sub: 'Benchmark: 38.5%' },
                { label: 'Response Rate', value: `${liveScorecard.responseRate}%`, sub: `${liveScorecard.averageReplyTimeMinutes}m avg reply` },
              ].map((metric, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: themeCardBg,
                    border: `1px solid ${themeBorder}`,
                  }}
                >
                  <div style={{ fontSize: '11px', color: themeMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {metric.label}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, margin: '6px 0 2px', color: themeTextColor }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '11px', color: themeMulberry }}>{metric.sub}</div>
                </div>
              ))}
            </div>

            {/* Conversion Funnel */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 14px', color: themeTextColor }}>
                Conversion Funnel Dynamics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {liveScorecard.conversionFunnels.map((funnel, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                      <span>{funnel.stage}</span>
                      <span style={{ fontWeight: 600 }}>{funnel.count} ({funnel.conversionPercent}%)</span>
                    </div>
                    <div
                      style={{
                        height: '7px',
                        borderRadius: '999px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(70, 32, 55, 0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(10, funnel.conversionPercent))}%`,
                          borderRadius: '999px',
                          background: themeAccentGrad,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Week Performance Progression */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 14px', color: themeTextColor }}>
                Performance Over Time (Last 4 Weeks)
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  textAlign: 'center',
                }}
              >
                {liveScorecard.performanceTimeline.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px 8px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(70, 32, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                      border: `1px solid ${themeBorder}`,
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: themeMulberry }}>{item.week}</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0 2px' }}>{item.views}</div>
                    <div style={{ fontSize: '10.5px', color: themeMuted }}>Views</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, marginTop: '6px', color: themeTextColor }}>
                      {item.requests} reqs · {item.matches} match
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Key Takeaways */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 12px', color: themeTextColor }}>
                Actionable Telemetry Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {liveScorecard.keyTakeaways.map((takeaway, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: themeTextColor,
                    }}
                  >
                    <span style={{ color: isDark ? '#F9AAAD' : '#A1525F', fontWeight: 700 }}>•</span>
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {!hasIntelligenceOrder && (
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const svc = ELEVATE_SERVICES.find((s) => s.id === 'profile-intelligence');
                    if (svc) setSelectedService(svc);
                  }}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    background: themeAccentGrad,
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Order Official Scorecard Telemetry & Tracking (₹1,999)
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: PROFILE MAKEOVER STUDIO (5 PILLARS & BEFORE / AFTER)
            ========================================================================= */}
        {activeTab === 'makeover' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isDark ? '#F9AAAD' : '#A1525F',
                  }}
                >
                  Editorial Curation
                </span>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 600,
                    margin: '4px 0 0',
                    color: themeTextColor,
                  }}
                >
                  Profile Makeover Studio
                </h1>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: isDark ? 'rgba(161, 82, 95, 0.25)' : 'rgba(161, 82, 95, 0.1)',
                  color: themeMulberry,
                  fontWeight: 600,
                }}
              >
                Overall Score: {liveMakeover.overallScore}/10
              </div>
            </div>

            {/* Privacy Access Banner */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(255, 255, 255, 0.65)',
                border: `1px solid ${themeBorder}`,
                fontSize: '12px',
                color: themeMuted,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🔒</span>
              <span>
                <strong>Strict Presentation Scope:</strong> Editors review your public photo sequence, 240-char bio,
                and vibe synergy. They have zero access to private conversations, search history, or personal identity numbers.
              </span>
            </div>

            {/* Feedback toast when bio is applied */}
            {appliedBioSuccess && (
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 142, 60, 0.16)',
                  border: '1px solid rgba(56, 142, 60, 0.4)',
                  color: isDark ? '#A5D6A7' : '#2E7D32',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                ✓ Recommended bio has been applied to your public VennZ profile!
              </div>
            )}

            {/* The 5 Key Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', margin: '4px 0 0', color: themeTextColor }}>
                The 5 Editorial Pillars
              </h3>

              {Object.values(liveMakeover.pillars).map((pillar, i) => (
                <div
                  key={i}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    backgroundColor: themeCardBg,
                    border: `1px solid ${themeBorder}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: themeTextColor }}>{pillar.name}</div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        backgroundColor: isDark ? 'rgba(161, 82, 95, 0.3)' : 'rgba(161, 82, 95, 0.12)',
                        color: themeMulberry,
                      }}
                    >
                      {pillar.score}/10
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: themeMuted, margin: '0 0 6px', lineHeight: '1.45' }}>
                    <strong>Assessment:</strong> {pillar.currentAssessment}
                  </p>
                  <p style={{ fontSize: '12.5px', color: themeTextColor, margin: 0, lineHeight: '1.45' }}>
                    <strong>Actionable Recommendation:</strong> {pillar.recommendation}
                  </p>
                </div>
              ))}
            </div>

            {/* Actionable Before & After Comparisons */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 14px', color: themeTextColor }}>
                Actionable Before & After Transformations
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {liveMakeover.beforeAfterComparison.map((comp, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(20, 14, 28, 0.5)' : 'rgba(250, 241, 243, 0.7)',
                      border: `1px solid ${themeBorder}`,
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: themeMulberry, marginBottom: '8px' }}>
                      {comp.area}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      <div
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                          border: `1px solid ${themeBorder}`,
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#E06D6D', textTransform: 'uppercase' }}>
                          Current State
                        </span>
                        <p style={{ margin: '4px 0 0', color: themeMuted, lineHeight: '1.4' }}>{comp.before}</p>
                      </div>

                      <div
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? 'rgba(161, 82, 95, 0.15)' : 'rgba(161, 82, 95, 0.08)',
                          border: `1px solid rgba(199, 87, 124, 0.4)`,
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: isDark ? '#A5D6A7' : '#2E7D32', textTransform: 'uppercase' }}>
                          Editorial Recommendation
                        </span>
                        <p style={{ margin: '4px 0 0', color: themeTextColor, fontWeight: 500, lineHeight: '1.4' }}>{comp.after}</p>
                      </div>
                    </div>

                    <div style={{ fontSize: '11.5px', color: themeMuted, marginTop: '8px', fontStyle: 'italic' }}>
                      Rationale: {comp.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Bio Draft with One-Click Apply */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${themeBorder}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: themeTextColor }}>
                  Curated 240-Character Bio Draft
                </h3>
                <span style={{ fontSize: '11px', color: themeMuted }}>
                  {liveMakeover.suggestedBioDraft.length}/240 chars
                </span>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(20, 14, 28, 0.7)' : 'rgba(250, 241, 243, 0.9)',
                  border: `1px solid ${themeBorder}`,
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: themeTextColor,
                  margin: '10px 0 14px',
                }}
              >
                "{liveMakeover.suggestedBioDraft}"
              </div>

              <button
                type="button"
                onClick={() => handleApplyBio(liveMakeover.suggestedBioDraft)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: themeAccentGrad,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Apply This Bio to My Public Profile →
              </button>
            </div>

            {!hasMakeoverOrder && (
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const svc = ELEVATE_SERVICES.find((s) => s.id === 'profile-makeover');
                    if (svc) setSelectedService(svc);
                  }}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    background: themeAccentGrad,
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Order Bespoke Profile Makeover (₹3,499)
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: CONVERSATION AUDIT (PRIVACY-FIRST, NATIVE CHATS ONLY)
            ========================================================================= */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isDark ? '#F9AAAD' : '#A1525F',
                  }}
                >
                  Privacy-Guarded Diagnostic
                </span>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 600,
                    margin: '4px 0 0',
                    color: themeTextColor,
                  }}
                >
                  Conversation Audit
                </h1>
              </div>

              <div
                style={{
                  fontSize: '11px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(56, 142, 60, 0.15)',
                  color: isDark ? '#A5D6A7' : '#2E7D32',
                  fontWeight: 700,
                }}
              >
                ✓ Partner Data Redacted
              </div>
            </div>

            {/* Strict Privacy Notice */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                backgroundColor: isDark ? 'rgba(70, 32, 55, 0.45)' : 'rgba(255, 255, 255, 0.75)',
                border: `1px solid ${themeBorder}`,
                fontSize: '12.5px',
                lineHeight: '1.5',
                color: themeMuted,
              }}
            >
              <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: themeTextColor }}>
                🔒 VennZ Strict Conversation Privacy Architecture:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>
                  <strong>Native Analysis Only:</strong> Analyzes VennZ-native chats directly. No third-party chat uploads
                  (e.g. WhatsApp, iMessage) are supported or accepted.
                </li>
                <li>
                  <strong>Automated Partner Redaction:</strong> Because conversations contain another person's personal
                  data, partner names, phone numbers, handles, and locations are automatically tokenized and hidden from reviewers.
                </li>
                <li>
                  <strong>Configurable & Consent-Driven:</strong> This service is entirely optional. Staff reviewers access
                  only structural pacing and cadence metrics under explicit member consent.
                </li>
              </ul>
            </div>

            {/* Explicit Consent Control */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: themeTextColor }}>
                  Member Diagnostic Authorization
                </div>
                <div style={{ fontSize: '12px', color: themeMuted, marginTop: '2px' }}>
                  Authorize VennZ Communication Dynamics Specialist to review anonymized dialogue cadence
                </div>
              </div>

              <input
                type="checkbox"
                checked={auditConsentAgreed}
                onChange={(e) => {
                  const val = e.target.checked;
                  setAuditConsentAgreed(val);
                  const auditOrder = elevateOrders.find((o) => o.serviceCategory === 'conversation-audit');
                  if (auditOrder) {
                    setConversationAuditConsent(auditOrder.id, val);
                  }
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#C7577C',
                  cursor: 'pointer',
                }}
              />
            </div>

            {auditConsentAgreed ? (
              <>
                {/* Cadence & Momentum Scores */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: themeCardBg, border: `1px solid ${themeBorder}` }}>
                    <div style={{ fontSize: '11px', color: themeMuted, textTransform: 'uppercase' }}>Cadence Pacing Score</div>
                    <div style={{ fontSize: '26px', fontWeight: 700, margin: '6px 0 2px' }}>{liveAudit.cadenceScore}/100</div>
                    <div style={{ fontSize: '11px', color: themeMulberry }}>Balanced response velocity</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: themeCardBg, border: `1px solid ${themeBorder}` }}>
                    <div style={{ fontSize: '11px', color: themeMuted, textTransform: 'uppercase' }}>Momentum Score</div>
                    <div style={{ fontSize: '26px', fontWeight: 700, margin: '6px 0 2px' }}>{liveAudit.momentumScore}/100</div>
                    <div style={{ fontSize: '11px', color: themeMulberry }}>High conversational reciprocity</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: themeCardBg, border: `1px solid ${themeBorder}` }}>
                    <div style={{ fontSize: '11px', color: themeMuted, textTransform: 'uppercase' }}>Question Ratio</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0 2px' }}>{liveAudit.questionBalanceRatio}</div>
                    <div style={{ fontSize: '11px', color: themeMulberry }}>Healthy two-way dialogue</div>
                  </div>
                </div>

                {/* Invitation Timing Insight */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: themeCardBg,
                    border: `1px solid ${themeBorder}`,
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 10px', color: themeTextColor }}>
                    Date & Mixer Invitation Timing Insight
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: '1.55', color: themeTextColor, margin: 0 }}>
                    {liveAudit.invitationTimingInsight}
                  </p>
                </div>

                {/* Recommendations */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: themeCardBg,
                    border: `1px solid ${themeBorder}`,
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 12px', color: themeTextColor }}>
                    Key Recommendations
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {liveAudit.keyRecommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', lineHeight: '1.5' }}>
                        <span style={{ color: isDark ? '#F9AAAD' : '#A1525F', fontWeight: 700 }}>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '30px 20px',
                  borderRadius: '16px',
                  backgroundColor: themeCardBg,
                  border: `1px solid ${themeBorder}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛡️</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 6px' }}>
                  Conversation Audit Disabled
                </h3>
                <p style={{ fontSize: '13px', color: themeMuted, maxWidth: '420px', margin: '0 auto 16px' }}>
                  Member authorization is currently toggled off. VennZ staff and audit engines are blocked from analyzing
                  any chat telemetry until you explicitly check authorization above.
                </p>
                <button
                  type="button"
                  onClick={() => setAuditConsentAgreed(true)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: themeAccentGrad,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Grant Confidential Authorization
                </button>
              </div>
            )}

            {!hasAuditOrder && (
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const svc = ELEVATE_SERVICES.find((s) => s.id === 'conversation-audit');
                    if (svc) setSelectedService(svc);
                  }}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    background: themeAccentGrad,
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Order Conversation Audit Diagnostic (₹2,499)
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: ORDERS, DELIVERABLES & REFUND MANAGEMENT
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                }}
              >
                Backend Order State & Deliverables
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  fontWeight: 600,
                  margin: '4px 0 0',
                  color: themeTextColor,
                }}
              >
                My Elevate Orders ({elevateOrders.length})
              </h1>
            </div>

            {elevateOrders.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  borderRadius: '16px',
                  backgroundColor: themeCardBg,
                  border: `1px solid ${themeBorder}`,
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '14px', color: themeMuted, margin: '0 0 16px' }}>
                  You have not placed any Elevate orders yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: themeAccentGrad,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Explore Offerings
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {elevateOrders.map((order: ElevateOrder) => {
                  const isDeliverableReady = order.status === 'deliverable_ready' || order.status === 'completed';
                  const isRefundRequested = order.status === 'refund_requested' || order.refundState.status === 'requested';

                  return (
                    <div
                      key={order.id}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        backgroundColor: themeCardBg,
                        border: `1px solid ${themeBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      {/* Top Order Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: themeMulberry, fontWeight: 700 }}>
                              #{order.id}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: isRefundRequested
                                  ? 'rgba(230, 81, 0, 0.15)'
                                  : isDeliverableReady
                                  ? 'rgba(56, 142, 60, 0.15)'
                                  : 'rgba(161, 82, 95, 0.15)',
                                color: isRefundRequested
                                  ? '#FFB74D'
                                  : isDeliverableReady
                                  ? isDark ? '#A5D6A7' : '#2E7D32'
                                  : themeMulberry,
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            >
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '4px 0 0', color: themeTextColor }}>
                            {order.serviceName}
                          </h3>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 700 }}>₹{order.price.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '11px', color: themeMuted }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Reviewer Least-Privilege Access Section */}
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.55)' : 'rgba(250, 241, 243, 0.75)',
                          border: `1px solid ${themeBorder}`,
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>Assigned Staff Reviewer:</span>
                          <span style={{ color: themeMulberry, fontWeight: 700 }}>
                            {order.reviewerAccess.reviewerName} ({order.reviewerAccess.reviewerRole})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: themeMuted, marginTop: '4px' }}>
                          <span>🔒</span>
                          <span>
                            <strong>Enforced Access Scope:</strong>{' '}
                            <code style={{ fontSize: '11px', color: themeMulberry }}>
                              {order.reviewerAccess.accessScope}
                            </code>{' '}
                            · Zero access to unauthorized member assets.
                          </span>
                        </div>
                      </div>

                      {/* Deliverable Preview */}
                      {order.deliverable && (
                        <div
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            backgroundColor: isDark ? 'rgba(161, 82, 95, 0.12)' : 'rgba(161, 82, 95, 0.06)',
                            border: `1px solid rgba(199, 87, 124, 0.3)`,
                          }}
                        >
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: themeTextColor }}>
                            Deliverable: {order.deliverable.title}
                          </div>
                          <p style={{ fontSize: '12px', color: themeMuted, margin: '4px 0 0', lineHeight: '1.45' }}>
                            {order.deliverable.summary}
                          </p>
                          {order.deliverable.notesFromReviewer && (
                            <div style={{ fontSize: '11.5px', fontStyle: 'italic', marginTop: '6px', color: themeMulberry }}>
                              Reviewer Note: "{order.deliverable.notesFromReviewer}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions row: View Deliverable & Refund Request */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '6px',
                        }}
                      >
                        {order.refundState.status === 'requested' ? (
                          <span style={{ fontSize: '11.5px', color: '#FFB74D', fontWeight: 600 }}>
                            Refund Requested · Desk Review Pending
                          </span>
                        ) : order.refundState.status === 'processed' ? (
                          <span style={{ fontSize: '11.5px', color: isDark ? '#A5D6A7' : '#2E7D32', fontWeight: 600 }}>
                            Refund Processed (₹{order.price.toLocaleString('en-IN')})
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundOrderId(order.id);
                              setRefundReason('');
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: `1px solid ${themeBorder}`,
                              backgroundColor: 'transparent',
                              color: themeMuted,
                              fontSize: '11.5px',
                              cursor: 'pointer',
                            }}
                          >
                            Request Refund
                          </button>
                        )}

                        {isDeliverableReady && (
                          <button
                            type="button"
                            onClick={() => {
                              if (order.serviceCategory === 'profile-intelligence') setActiveTab('scorecard');
                              else if (order.serviceCategory === 'profile-makeover') setActiveTab('makeover');
                              else if (order.serviceCategory === 'conversation-audit') setActiveTab('audit');
                            }}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: 'none',
                              background: themeAccentGrad,
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Open Deliverable Studio →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 6: CONCIERGE DESK CHAT
            ========================================================================= */}
        {activeTab === 'concierge' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '65vh' }}>
            <div style={{ marginBottom: '14px' }}>
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isDark ? '#F9AAAD' : '#A1525F',
                }}
              >
                Confidential Communication
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  fontWeight: 600,
                  margin: '4px 0 0',
                  color: themeTextColor,
                }}
              >
                Elevate Concierge Desk
              </h1>
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: themeCardBg,
                border: `1px solid ${themeBorder}`,
              }}
            >
              {elevateMessages.map((msg) => {
                const isMember = msg.sender === 'member';

                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMember ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '12px 16px',
                      borderRadius: isMember ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isMember
                        ? themeAccentGrad
                        : isDark
                        ? 'rgba(70, 32, 55, 0.7)'
                        : 'rgba(255, 255, 255, 0.95)',
                      color: isMember ? '#FFFFFF' : themeTextColor,
                      border: isMember ? 'none' : `1px solid ${themeBorder}`,
                      fontSize: '13px',
                      lineHeight: '1.45',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: isMember ? 'rgba(255,255,255,0.7)' : themeMuted,
                        marginTop: '4px',
                        textAlign: 'right',
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={conciergeEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendConcierge} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <input
                type="text"
                value={conciergeInput}
                onChange={(e) => setConciergeInput(e.target.value)}
                placeholder="Ask the editorial desk a question..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${themeBorder}`,
                  backgroundColor: isDark ? 'rgba(42, 20, 34, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  color: themeTextColor,
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: themeAccentGrad,
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =========================================================================
          ORDER CONFIRMATION MODAL (SERVICE DETAILS, SCOPE & ADD-ONS)
          ========================================================================= */}
      {selectedService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#1C1224' : '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              padding: '26px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
              color: themeTextColor,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: themeMulberry, fontWeight: 700 }}>
                  SERVICE {selectedService.number}
                </span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '4px 0 0' }}>
                  {selectedService.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: themeMuted,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: themeMuted, margin: '12px 0 16px', lineHeight: '1.5' }}>
              {selectedService.description}
            </p>

            {/* Least-Privilege Scope Reminder */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(161, 82, 95, 0.15)' : 'rgba(161, 82, 95, 0.08)',
                border: `1px solid ${themeBorder}`,
                fontSize: '12px',
                color: themeMulberry,
                marginBottom: '16px',
              }}
            >
              🔒 <strong>Strict Staff Access Scope:</strong> {selectedService.privacyAccessScope}
            </div>

            {/* Add-ons: Personalized Video Review */}
            {selectedService.id !== 'video-review' && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1px solid ${themeBorder}`,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Personalized Video Review Add-on</div>
                  <div style={{ fontSize: '11.5px', color: themeMuted }}>
                    10-minute confidential screen recording by a Senior Membership Editor (+₹4,999)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={addVideoReview}
                  onChange={(e) => setAddVideoReview(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#C7577C', cursor: 'pointer' }}
                />
              </div>
            )}

            {/* Conversation Audit Consent Checkbox */}
            {selectedService.category === 'conversation-audit' && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1px solid ${themeBorder}`,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <input
                  type="checkbox"
                  id="modal-consent"
                  checked={auditConsentAgreed}
                  onChange={(e) => setAuditConsentAgreed(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#C7577C', cursor: 'pointer', marginTop: '2px' }}
                />
                <label htmlFor="modal-consent" style={{ fontSize: '12px', color: themeTextColor, lineHeight: '1.45', cursor: 'pointer' }}>
                  I authorize VennZ to perform privacy-redacted cadence analysis on VennZ-native chats. Partner identifiers will remain completely redacted.
                </label>
              </div>
            )}

            {/* Total Price and Confirmation */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '20px 0 16px',
                paddingTop: '14px',
                borderTop: `1px solid ${themeBorder}`,
              }}
            >
              <span style={{ fontSize: '13px', color: themeMuted }}>Order Total:</span>
              <span style={{ fontSize: '22px', fontWeight: 700 }}>
                ₹
                {(
                  selectedService.startingPrice +
                  (addVideoReview && selectedService.id !== 'video-review' ? 4999 : 0)
                ).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  border: `1px solid ${themeBorder}`,
                  backgroundColor: 'transparent',
                  color: themeTextColor,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmOrder(selectedService)}
                style={{
                  flex: 2,
                  padding: '11px',
                  borderRadius: '10px',
                  border: 'none',
                  background: themeAccentGrad,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm & Unlock Service →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REFUND REQUEST MODAL
          ========================================================================= */}
      {refundOrderId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
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
              borderRadius: '20px',
              backgroundColor: isDark ? '#1C1224' : '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
              color: themeTextColor,
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 8px' }}>
              Request Elevate Refund
            </h3>
            <p style={{ fontSize: '13px', color: themeMuted, margin: '0 0 16px', lineHeight: '1.45' }}>
              Order #{refundOrderId} · Please specify the reason for your refund request. Our member concierge desk reviews all requests within 24 hours.
            </p>

            {refundSubmittedMessage ? (
              <div style={{ color: isDark ? '#A5D6A7' : '#2E7D32', fontSize: '13px', fontWeight: 600, padding: '12px 0' }}>
                ✓ {refundSubmittedMessage}
              </div>
            ) : (
              <>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Share details regarding your refund request..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${themeBorder}`,
                    backgroundColor: isDark ? 'rgba(20, 14, 28, 0.7)' : 'rgba(250, 241, 243, 0.8)',
                    color: themeTextColor,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    marginBottom: '16px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRefundOrderId(null)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${themeBorder}`,
                      backgroundColor: 'transparent',
                      color: themeTextColor,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!refundReason.trim()}
                    onClick={handleProcessRefund}
                    style={{
                      flex: 2,
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: themeAccentGrad,
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: refundReason.trim() ? 'pointer' : 'not-allowed',
                      opacity: refundReason.trim() ? 1 : 0.6,
                    }}
                  >
                    Submit Refund Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <MemberBottomNav
        activeTab="elevate"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
