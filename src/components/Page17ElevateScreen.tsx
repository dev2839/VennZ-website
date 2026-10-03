import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import { ELEVATE_SERVICES } from '../data/elevateServices';
import type { ElevateService, ElevateBooking } from '../types/elevate';

interface Page17ElevateScreenProps {
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: () => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

type ElevateView =
  | 'home'
  | 'service-detail'
  | 'consultation-request'
  | 'request-received'
  | 'concierge'
  | 'my-bookings'
  | 'booking-details';

export const Page17ElevateScreen: React.FC<Page17ElevateScreenProps> = ({
  onSelectTab,
  onNavigateHelp,
  onUpgradeToMembership,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    appearanceMode,
    elevateBookings,
    elevateMessages,
    submitElevateRequest,
    sendElevateConciergeMessage,
    finalizeBookingProposal,
    payElevateBooking,
    isMember,
    setMembershipStatus,
  } = useAuth();

  const isDark = appearanceMode === 'after-dark';

  // Navigation sub-views
  const [currentView, setCurrentView] = useState<ElevateView>('home');
  const [selectedService, setSelectedService] = useState<ElevateService>(ELEVATE_SERVICES[0]);
  const [selectedBooking, setSelectedBooking] = useState<ElevateBooking | null>(null);
  const [bookingsTab, setBookingsTab] = useState<'upcoming' | 'past'>('upcoming');

  // Consultation Request Form state
  const [helpRequired, setHelpRequired] = useState('');
  const [availability, setAvailability] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Weekend' | 'Flexible'>('Evening');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Concierge chat input
  const [conciergeInput, setConciergeInput] = useState('');
  const conciergeEndRef = useRef<HTMLDivElement | null>(null);

  // Mock payment modal state
  const [paymentModalBooking, setPaymentModalBooking] = useState<ElevateBooking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Scroll to bottom of concierge when messages update
  useEffect(() => {
    if (currentView === 'concierge') {
      conciergeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentView, elevateMessages.length]);

  // Dynamic Theme Colors
  const themeBgColor = isDark ? '#050104' : '#F7F3EE';
  const themeTextColor = isDark ? '#F3EEE9' : 'var(--color-espresso)';
  const themeMulberry = isDark ? '#F3EEE9' : 'var(--color-mulberry)';
  const themeMuted = isDark ? '#D5C5CF' : '#6E5D68';
  const themeBorder = isDark ? 'rgba(243, 238, 233, 0.16)' : 'rgba(73, 40, 61, 0.12)';
  const themeCardBg = isDark ? 'rgba(10, 2, 9, 0.94)' : 'rgba(255, 255, 255, 0.65)';
  const themeCardBorder = isDark ? '1px solid rgba(243, 238, 233, 0.16)' : '1px solid rgba(73, 40, 61, 0.12)';
  const themeButtonBg = isDark ? '#F3EEE9' : 'var(--color-mulberry)';
  const themeButtonText = isDark ? '#050104' : '#FFFFFF';

  // Bookings partitioning
  const upcomingBookings = elevateBookings.filter((b) => b.bookingStatus !== 'Completed');
  const pastBookings = elevateBookings.filter((b) => b.bookingStatus === 'Completed');
  const featuredUpcoming = upcomingBookings[0] || null;

  // Handlers
  const handleOpenService = (service: ElevateService) => {
    setSelectedService(service);
    setCurrentView('service-detail');
  };

  const handleStartConsultation = () => {
    setHelpRequired('');
    setNotes('');
    setPreferredDate('');
    setFormError(null);
    setCurrentView('consultation-request');
  };

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpRequired.trim()) {
      setFormError('Please let us know what help you are looking for.');
      return;
    }
    setFormError(null);
    submitElevateRequest({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      helpRequired: helpRequired.trim(),
      availability,
      preferredDate: preferredDate || undefined,
      notes: notes.trim() || undefined,
    });
    setCurrentView('request-received');
  };

  const handleSendConcierge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = conciergeInput.trim();
    if (!trimmed) return;
    sendElevateConciergeMessage(trimmed);
    setConciergeInput('');
  };

  const handleOpenBookingDetails = (booking: ElevateBooking) => {
    setSelectedBooking(booking);
    setCurrentView('booking-details');
  };

  const handleInitiatePayment = (booking: ElevateBooking) => {
    setPaymentModalBooking(booking);
    setPaymentSuccess(false);
    setIsProcessingPayment(false);
  };

  const handleExecutePayment = () => {
    if (!paymentModalBooking) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      payElevateBooking(paymentModalBooking.id);
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      if (selectedBooking && selectedBooking.id === paymentModalBooking.id) {
        setSelectedBooking({
          ...selectedBooking,
          bookingStatus: 'Confirmed',
          paymentStatus: 'Paid',
        });
      }
    }, 1200);
  };

  const handleFinishPaymentModal = () => {
    setPaymentModalBooking(null);
    setPaymentSuccess(false);
    setCurrentView('my-bookings');
    setBookingsTab('upcoming');
  };

  const handleDemoProposeSession = () => {
    const newBooking = finalizeBookingProposal(undefined, selectedService.id);
    setSelectedBooking(newBooking);
  };

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
      {/* Exact Botanical Background Wallpaper */}
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

      {/* Atmospheric Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(3, 0, 3, 0.12)' : 'rgba(247, 243, 238, 0.35)',
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
            backgroundColor: isDark ? 'rgba(5, 1, 4, 0.98)' : 'rgba(247, 243, 238, 0.92)',
            transition: 'background-color 0.25s ease',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Global Fixed Member Top Bar */}
      <MemberTopBar onConciergeClick={onNavigateHelp} />

      {/* MAIN SCROLLABLE CONTENT */}
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
            maxWidth: '1120px',
            margin: '0 auto',
            width: '100%',
            padding: '24px 24px 44px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!isMember ? (
            /* ========================================================= */
            /* MEMBER-ONLY ELEVATE CONCIERGE LOCK SCREEN                 */
            /* ========================================================= */
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '380px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Crown Emblem */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '32px',
                  backgroundColor: isDark ? 'rgba(223, 183, 108, 0.12)' : 'rgba(73, 40, 61, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '22px',
                  color: isDark ? '#DFB76C' : 'var(--color-mulberry)',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.5 19h19a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H2.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1zm19-14a1 1 0 0 0-1 .62l-3.24 7.42-3.8-9.04a1 1 0 0 0-1.92 0l-3.8 9.04-3.24-7.42a1 1 0 0 0-1.78.38l-1.72 9a1 1 0 0 0 .98 1.18h19a1 1 0 0 0 .98-1.18l-1.72-9a1 1 0 0 0-.46-.38z" />
                </svg>
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isDark ? '#DFB76C' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                MEMBER-ONLY SERVICE
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '30px',
                  lineHeight: '1.2',
                  color: themeMulberry,
                  margin: '0 0 14px 0',
                  fontWeight: 400,
                }}
              >
                Elevate Private Concierge
              </h1>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: themeMuted,
                  margin: '0 0 24px 0',
                }}
              >
                Elevate is a private concierge service reserved exclusively for verified members. Upgrade to Full Membership to unlock bespoke date curations, executive styling, and priority venue reservations.
              </p>

              {/* Service Highlights */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  width: '100%',
                  marginBottom: '26px',
                  textAlign: 'left',
                }}
              >
                {[
                  'Bespoke Date Planning & Priority Venue Reservations',
                  '1-on-1 Editorial Profile & Style Advisory',
                  'Discreet Introductions & Member Consultations',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(73, 40, 61, 0.05)',
                      border: `1px solid ${themeBorder}`,
                      fontSize: '12.5px',
                      color: themeMulberry,
                    }}
                  >
                    <span style={{ color: isDark ? '#DFB76C' : 'var(--color-mulberry)', fontSize: '14px' }}>✦</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  color: themeMulberry,
                  marginBottom: '18px',
                }}
              >
                ₹1,499 / month
              </div>

              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: isDark ? '#C7B9C2' : '#7A6B74',
                  textAlign: 'center',
                  marginBottom: '10px',
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
                  height: '52px',
                  borderRadius: '26px',
                  backgroundColor: 'var(--color-mulberry)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(73, 40, 61, 0.28)',
                  transition: 'background-color 0.2s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3B1F31';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-mulberry)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>UPGRADE TO MEMBERSHIP</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* VIEW 1: ELEVATE HOME */}
              {/* ========================================================= */}
              {currentView === 'home' && (
            <div>
              {/* Editorial Header - Left aligned, ultra-refined luxury typography */}
              <div style={{ textAlign: 'left', padding: '16px 2px 24px 2px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '8px',
                  }}
                >
                  ELEVATE
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '28px',
                    fontWeight: 400,
                    color: themeMulberry,
                    letterSpacing: '0.01em',
                    lineHeight: '1.25',
                    margin: '0 0 10px 0',
                  }}
                >
                  Become the best version of yourself.
                </h1>
                <p
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 300,
                    lineHeight: '1.6',
                    color: themeMuted,
                    letterSpacing: '0.01em',
                    margin: 0,
                    maxWidth: '100%',
                  }}
                >
                  Private guidance for confidence, dating, personal presentation and more — curated around you by VennZ team.
                </p>
              </div>

              {/* SECTION: MY BOOKINGS ON ELEVATE HOME */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '0 2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: isDark ? '#D88A9F' : '#9B4D6E',
                    }}
                  >
                    MY BOOKINGS
                  </span>

                  {elevateBookings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('my-bookings');
                        setBookingsTab('upcoming');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.06em',
                        color: themeMuted,
                        cursor: 'pointer',
                        padding: '2px 0',
                      }}
                    >
                      View all bookings →
                    </button>
                  )}
                </div>

                {/* Booking Preview Panel */}
                {!featuredUpcoming ? (
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: themeCardBg,
                      border: themeCardBorder,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 400, color: themeTextColor, marginBottom: '4px' }}>
                      No upcoming bookings
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, lineHeight: '1.45' }}>
                      Your confirmed Elevate sessions will appear here.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '16px 18px',
                      borderRadius: '18px',
                      backgroundColor: themeCardBg,
                      border: themeCardBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.35)' : '0 4px 14px rgba(73,40,61,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, letterSpacing: '0.01em', color: themeMulberry, marginBottom: '4px' }}>
                        {featuredUpcoming.serviceName}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, marginBottom: '2px' }}>
                        {featuredUpcoming.date} · {featuredUpcoming.time}
                      </div>
                      <div style={{ fontSize: '11.5px', fontWeight: 300, color: isDark ? '#D5C5CF' : '#6E5D68' }}>
                        {featuredUpcoming.duration} · {featuredUpcoming.format} · ₹{featuredUpcoming.price.toLocaleString('en-IN')} ·{' '}
                        <span
                          style={{
                            fontWeight: 400,
                            letterSpacing: '0.04em',
                            color: featuredUpcoming.bookingStatus === 'Confirmed' ? (isDark ? '#81C784' : '#2E7D32') : (isDark ? '#FFB74D' : '#D97706'),
                          }}
                        >
                          {featuredUpcoming.bookingStatus}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBookingDetails(featuredUpcoming)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '16px',
                        border: `1px solid ${isDark ? 'rgba(243, 238, 233, 0.28)' : 'rgba(73, 40, 61, 0.22)'}`,
                        backgroundColor: 'transparent',
                        color: themeMulberry,
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      VIEW
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION: SERVICES LIST (6 Services) */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '14px',
                    padding: '0 2px',
                  }}
                >
                  SERVICES
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {ELEVATE_SERVICES.map((service) => (
                    <div
                      key={service.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '20px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'transform 0.15s ease, background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 400,
                            letterSpacing: '0.08em',
                            color: isDark ? '#D88A9F' : '#9B4D6E',
                          }}
                        >
                          {service.number}
                        </span>
                        <span style={{ fontSize: '11px', color: themeMuted }}>—</span>
                        <h2
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '19px',
                            fontWeight: 400,
                            color: themeMulberry,
                            margin: 0,
                            letterSpacing: '0.01em',
                          }}
                        >
                          {service.name}
                        </h2>
                      </div>

                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 300,
                          lineHeight: '1.55',
                          letterSpacing: '0.01em',
                          color: themeMuted,
                          margin: 0,
                        }}
                      >
                        {service.tagline}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '4px',
                          paddingTop: '10px',
                          borderTop: `1px solid ${themeBorder}`,
                        }}
                      >
                        <span style={{ fontSize: '11.5px', color: themeMuted, fontWeight: 300, letterSpacing: '0.02em' }}>
                          {service.format} · From ₹{service.startingPrice.toLocaleString('en-IN')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenService(service)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '18px',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                            border: `1px solid ${isDark ? 'rgba(243, 238, 233, 0.22)' : 'rgba(73, 40, 61, 0.18)'}`,
                            color: themeMulberry,
                            fontSize: '11px',
                            fontWeight: 400,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          EXPLORE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: SERVICE DETAIL PAGE */}
          {/* ========================================================= */}
          {currentView === 'service-detail' && (
            <div>
              {/* Back navigation */}
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: themeMulberry,
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '4px 0 16px 0',
                }}
              >
                <span>←</span>
                <span>ELEVATE</span>
              </button>

              {/* Service Title & Narrative Description */}
              <div style={{ marginBottom: '22px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '8px',
                  }}
                >
                  SERVICE {selectedService.number}
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '27px',
                    fontWeight: 400,
                    color: themeMulberry,
                    letterSpacing: '0.01em',
                    margin: '0 0 10px 0',
                    lineHeight: '1.25',
                  }}
                >
                  {selectedService.name}
                </h1>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 300,
                    lineHeight: '1.65',
                    letterSpacing: '0.01em',
                    color: themeTextColor,
                    margin: 0,
                  }}
                >
                  {selectedService.description}
                </p>
              </div>

              {/* WHAT THIS CAN HELP WITH Section */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '12px',
                  }}
                >
                  WHAT THIS CAN HELP WITH
                </div>
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '18px',
                    backgroundColor: themeCardBg,
                    border: themeCardBorder,
                  }}
                >
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {selectedService.helpsWith.map((item, i) => (
                      <li key={i} style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.5', letterSpacing: '0.01em', color: themeTextColor }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* METADATA PANEL: FORMAT, TYPICAL DURATION, STARTING FROM */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  padding: '16px 10px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '28px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ minHeight: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: themeMuted, whiteSpace: 'nowrap' }}>
                    FORMAT
                  </div>
                  <div style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', fontWeight: 400, color: themeMulberry }}>
                    {selectedService.format}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', borderLeft: `1px solid ${themeBorder}`, borderRight: `1px solid ${themeBorder}`, padding: '0 4px' }}>
                  <div style={{ minHeight: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: themeMuted, whiteSpace: 'nowrap' }}>
                    DURATION
                  </div>
                  <div style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', fontWeight: 400, color: themeMulberry }}>
                    {selectedService.typicalDuration}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ minHeight: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: themeMuted, whiteSpace: 'nowrap' }}>
                    STARTING FROM
                  </div>
                  <div style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', fontWeight: 400, color: themeMulberry }}>
                    ₹{selectedService.startingPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Concierge Assurance Microcopy */}
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 300,
                  lineHeight: '1.5',
                  letterSpacing: '0.01em',
                  color: themeMuted,
                  textAlign: 'center',
                  marginBottom: '16px',
                  padding: '0 8px',
                }}
              >
                All sessions are coordinated and overseen exclusively by VennZ Elevate Team under strict confidentiality.
              </div>

              {/* CTA: REQUEST A CONSULTATION */}
              <button
                type="button"
                onClick={handleStartConsultation}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '24px',
                  backgroundColor: themeButtonBg,
                  color: themeButtonText,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(73,40,61,0.22)',
                  transition: 'transform 0.1s ease',
                }}
              >
                REQUEST A CONSULTATION
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: CONSULTATION REQUEST FORM */}
          {/* ========================================================= */}
          {currentView === 'consultation-request' && (
            <div>
              <button
                type="button"
                onClick={() => setCurrentView('service-detail')}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: themeMulberry,
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '4px 0 14px 0',
                }}
              >
                <span>←</span>
                <span>SERVICE DETAILS</span>
              </button>

              <div style={{ marginBottom: '20px' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    color: themeMulberry,
                    margin: '0 0 6px 0',
                  }}
                >
                  Tell us what you need.
                </h1>
                <p style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.55', letterSpacing: '0.01em', color: themeMuted, margin: 0 }}>
                  Share a little about what you're looking for. Our Elevate team will review it and get back to you.
                </p>
              </div>

              <form onSubmit={handleSubmitConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Field 1: SELECTED SERVICE (Read-only display) */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '10.5px',
                      fontWeight: 400,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isDark ? '#D88A9F' : '#9B4D6E',
                      marginBottom: '6px',
                    }}
                  >
                    SELECTED SERVICE
                  </label>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '14px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(73, 40, 61, 0.04)',
                      border: `1px solid ${themeBorder}`,
                      fontSize: '13.5px',
                      fontWeight: 400,
                      color: themeMulberry,
                    }}
                  >
                    {selectedService.name} · From ₹{selectedService.startingPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Field 2: WHAT HELP DO YOU NEED? (Required) */}
                <div>
                  <label
                    htmlFor="helpRequired"
                    style={{
                      display: 'block',
                      fontSize: '10.5px',
                      fontWeight: 400,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isDark ? '#D88A9F' : '#9B4D6E',
                      marginBottom: '6px',
                    }}
                  >
                    WHAT HELP DO YOU NEED? *
                  </label>
                  <textarea
                    id="helpRequired"
                    rows={4}
                    value={helpRequired}
                    onChange={(e) => setHelpRequired(e.target.value)}
                    placeholder="e.g. I have an upcoming mixer next week and want guidance on conversation pacing and overcoming first-encounter hesitation..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                      border: `1px solid ${formError ? '#E57373' : themeBorder}`,
                      color: themeTextColor,
                      fontSize: '13px',
                      fontWeight: 300,
                      lineHeight: '1.55',
                      outline: 'none',
                      fontFamily: 'var(--font-sans)',
                      resize: 'vertical',
                    }}
                  />
                  {formError && (
                    <div style={{ fontSize: '11.5px', color: '#E57373', marginTop: '4px' }}>
                      {formError}
                    </div>
                  )}
                </div>

                {/* Field 3: PREFERRED AVAILABILITY (Pills) */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '10.5px',
                      fontWeight: 400,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isDark ? '#D88A9F' : '#9B4D6E',
                      marginBottom: '8px',
                    }}
                  >
                    PREFERRED AVAILABILITY
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(['Morning', 'Afternoon', 'Evening', 'Weekend', 'Flexible'] as const).map((slot) => {
                      const isSelected = availability === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setAvailability(slot)}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '16px',
                            fontSize: '11.5px',
                            fontWeight: 400,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            border: isSelected ? 'none' : `1px solid ${themeBorder}`,
                            backgroundColor: isSelected ? (isDark ? '#F3EEE9' : 'var(--color-mulberry)') : 'transparent',
                            color: isSelected ? (isDark ? '#050104' : '#FFFFFF') : themeMuted,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 4: PREFERRED DATE (Optional, min today) */}
                <div>
                  <label
                    htmlFor="preferredDate"
                    style={{
                      display: 'block',
                      fontSize: '10.5px',
                      fontWeight: 400,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isDark ? '#D88A9F' : '#9B4D6E',
                      marginBottom: '6px',
                    }}
                  >
                    PREFERRED DATE (OPTIONAL)
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                      border: `1px solid ${themeBorder}`,
                      color: themeTextColor,
                      fontSize: '13px',
                      fontWeight: 300,
                      outline: 'none',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </div>

                {/* Field 5: NOTES (Optional) */}
                <div>
                  <label
                    htmlFor="notes"
                    style={{
                      display: 'block',
                      fontSize: '10.5px',
                      fontWeight: 400,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isDark ? '#D88A9F' : '#9B4D6E',
                      marginBottom: '6px',
                    }}
                  >
                    NOTES (OPTIONAL)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific preference or context..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                      border: `1px solid ${themeBorder}`,
                      color: themeTextColor,
                      fontSize: '13px',
                      fontWeight: 300,
                      outline: 'none',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    height: '48px',
                    borderRadius: '24px',
                    backgroundColor: themeButtonBg,
                    color: themeButtonText,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(73,40,61,0.22)',
                  }}
                >
                  SUBMIT REQUEST
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: REQUEST RECEIVED CONFIRMATION */}
          {/* ========================================================= */}
          {currentView === 'request-received' && (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(73, 40, 61, 0.08)',
                  color: isDark ? '#81C784' : '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 18px auto',
                  border: `1px solid ${isDark ? 'rgba(129, 199, 132, 0.4)' : 'rgba(46, 125, 50, 0.3)'}`,
                }}
              >
                ✓
              </div>

              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(129, 199, 132, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                  color: isDark ? '#81C784' : '#2E7D32',
                  fontSize: '10.5px',
                  fontWeight: 400,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                }}
              >
                REQUEST RECEIVED
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '26px',
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  color: themeMulberry,
                  margin: '0 0 12px 0',
                }}
              >
                Request Received
              </h1>

              <p
                style={{
                  fontSize: '13.5px',
                  fontWeight: 300,
                  lineHeight: '1.6',
                  letterSpacing: '0.01em',
                  color: themeMuted,
                  maxWidth: '340px',
                  margin: '0 auto 24px auto',
                }}
              >
                Our Elevate team will review your request and get back to you shortly to understand your requirements and arrange a suitable session.
              </p>

              {/* Consultation Summary Panel */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  textAlign: 'left',
                  marginBottom: '28px',
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted, marginBottom: '4px' }}>
                  SERVICE
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: themeMulberry, marginBottom: '10px' }}>
                  {selectedService.name}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                  Availability: <span style={{ color: themeTextColor, fontWeight: 400 }}>{availability}</span>
                  {preferredDate && ` · Preferred: ${preferredDate}`}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentView('concierge')}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '24px',
                    backgroundColor: themeButtonBg,
                    color: themeButtonText,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  OPEN ELEVATE CONCIERGE
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '22px',
                    backgroundColor: 'transparent',
                    color: themeMuted,
                    border: `1px solid ${themeBorder}`,
                    fontSize: '11.5px',
                    fontWeight: 400,
                    cursor: 'pointer',
                  }}
                >
                  BACK TO ELEVATE
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: ELEVATE CONCIERGE CHAT */}
          {/* ========================================================= */}
          {currentView === 'concierge' && (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '440px' }}>
              {/* Header */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${themeBorder}`,
                  marginBottom: '16px',
                  minHeight: '44px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: themeMulberry,
                    cursor: 'pointer',
                    padding: '6px 8px 6px 0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ← ELEVATE
                </button>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 400, color: themeMulberry }}>
                    VennZ Elevate Team
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? '#81C784' : '#2E7D32' }}>
                    CONCIERGE DESK · ACTIVE
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '16px',
                }}
              >
                {elevateMessages.map((msg) => {
                  const isMember = msg.sender === 'member';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMember ? 'flex-end' : 'flex-start',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 400,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: themeMuted,
                          marginBottom: '4px',
                          padding: '0 4px',
                        }}
                      >
                        {isMember ? 'YOU' : 'ELEVATE TEAM'}
                      </span>
                      <div
                        style={{
                          maxWidth: '84%',
                          padding: '12px 16px',
                          borderRadius: isMember ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          backgroundColor: isMember
                            ? (isDark ? '#F3EEE9' : 'var(--color-mulberry)')
                            : (isDark ? 'rgba(20, 8, 18, 0.94)' : 'rgba(255, 255, 255, 0.85)'),
                          color: isMember
                            ? (isDark ? '#050104' : '#FFFFFF')
                            : themeTextColor,
                          border: isMember ? 'none' : themeCardBorder,
                          fontSize: '13.5px',
                          fontWeight: 300,
                          lineHeight: '1.55',
                          letterSpacing: '0.01em',
                          boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 8px rgba(73,40,61,0.06)',
                        }}
                      >
                        {msg.text}

                        {/* Proposal Card payload if team sent a proposed booking */}
                        {msg.proposedBooking && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '12px',
                              borderRadius: '12px',
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                              border: `1px solid ${themeBorder}`,
                            }}
                          >
                            <div style={{ fontSize: '10.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#D88A9F' : '#9B4D6E', marginBottom: '2px' }}>
                              SESSION PROPOSAL
                            </div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '15px', color: themeMulberry, marginBottom: '2px' }}>
                              {msg.proposedBooking.serviceName}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, marginBottom: '8px' }}>
                              {msg.proposedBooking.date} · {msg.proposedBooking.time} · ₹{msg.proposedBooking.price.toLocaleString('en-IN')}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenBookingDetails(msg.proposedBooking!)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '16px',
                                backgroundColor: isDark ? '#F3EEE9' : 'var(--color-mulberry)',
                                color: isDark ? '#050104' : '#FFFFFF',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 500,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                              }}
                            >
                              REVIEW & CONFIRM BOOKING
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={conciergeEndRef} />
              </div>

              {/* Demo Concierge Scheduling Trigger */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(73, 40, 61, 0.03)',
                  border: `1px dashed ${themeBorder}`,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 300, color: themeMuted }}>
                  Demo Flow: Team proposal finalized
                </span>
                <button
                  type="button"
                  onClick={handleDemoProposeSession}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    fontSize: '11px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  Issue Proposal →
                </button>
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSendConcierge}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '24px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${themeBorder}`,
                }}
              >
                <input
                  type="text"
                  value={conciergeInput}
                  onChange={(e) => setConciergeInput(e.target.value)}
                  placeholder="Write a message to the Elevate team..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: themeTextColor,
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!conciergeInput.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: conciergeInput.trim() ? themeMulberry : themeMuted,
                    fontSize: '11.5px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: conciergeInput.trim() ? 'pointer' : 'default',
                    padding: '4px 8px',
                  }}
                >
                  SEND
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: BOOKING DETAILS */}
          {/* ========================================================= */}
          {currentView === 'booking-details' && selectedBooking && (
            <div>
              <button
                type="button"
                onClick={() => setCurrentView('my-bookings')}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: themeMulberry,
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '4px 0 14px 0',
                }}
              >
                <span>←</span>
                <span>MY BOOKINGS</span>
              </button>

              <div style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 400,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '4px',
                  }}
                >
                  ELEVATE BOOKING
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '24px',
                        fontWeight: 400,
                        color: themeMulberry,
                        margin: '0 0 4px 0',
                      }}
                    >
                      {selectedBooking.serviceName}
                    </h1>
                    <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                      Reference ID: {selectedBooking.id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('concierge')}
                    style={{
                      flexShrink: 0,
                      height: '36px',
                      padding: '0 16px',
                      borderRadius: '18px',
                      backgroundColor: 'transparent',
                      color: themeMulberry,
                      border: `1px solid ${themeBorder}`,
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    OPEN CONCIERGE
                  </button>
                </div>
              </div>

              {/* Status Timeline Box (Restrained Editorial Stepper) */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 400,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: themeMuted,
                    marginBottom: '12px',
                  }}
                >
                  BOOKING PROGRESS
                </div>

                {/* Vertical status stages */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Request Received', desc: 'Member requirements submitted' },
                    { label: 'Reviewing', desc: 'Team evaluating schedule and alignment' },
                    { label: 'Scheduling', desc: 'Session date & time coordinated' },
                    { label: 'Awaiting Payment', desc: 'Slot reserved pending member confirmation' },
                    { label: 'Confirmed', desc: 'Session officially booked with Elevate team' },
                    { label: 'Completed', desc: 'Session delivered' },
                  ].map((stage, idx) => {
                    const statusOrder: Record<string, number> = {
                      'Request Received': 0,
                      'Reviewing': 1,
                      'Scheduling': 2,
                      'Awaiting Payment': 3,
                      'Confirmed': 4,
                      'Completed': 5,
                    };

                    const currentOrder = statusOrder[selectedBooking.bookingStatus] ?? 0;
                    const stageOrder = idx;
                    const isDone = stageOrder <= currentOrder;
                    const isCurrent = stageOrder === currentOrder;

                    return (
                      <div key={stage.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: isDone
                              ? (isCurrent ? (isDark ? '#F3EEE9' : 'var(--color-mulberry)') : (isDark ? 'rgba(129, 199, 132, 0.4)' : 'rgba(46, 125, 50, 0.3)'))
                              : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(73, 40, 61, 0.1)'),
                            color: isDone ? (isCurrent ? (isDark ? '#050104' : '#FFFFFF') : (isDark ? '#81C784' : '#2E7D32')) : themeMuted,
                            fontSize: '10px',
                            fontWeight: 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                            flexShrink: 0,
                          }}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '12.5px',
                              fontWeight: isCurrent ? 500 : 400,
                              color: isDone ? themeTextColor : themeMuted,
                            }}
                          >
                            {stage.label}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 300, color: themeMuted }}>
                            {stage.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Specifications Panel */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      DATE
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor }}>
                      {selectedBooking.date}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      TIME
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor }}>
                      {selectedBooking.time}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      DURATION
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor }}>
                      {selectedBooking.duration}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      FORMAT
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor }}>
                      {selectedBooking.format}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      FEE
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: themeMulberry }}>
                      ₹{selectedBooking.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      PAYMENT
                    </div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 400,
                        color: selectedBooking.paymentStatus === 'Paid' ? (isDark ? '#81C784' : '#2E7D32') : (isDark ? '#FFB74D' : '#D97706'),
                      }}
                    >
                      {selectedBooking.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedBooking.paymentStatus === 'Awaiting Payment' && (
                  <button
                    type="button"
                    onClick={() => handleInitiatePayment(selectedBooking)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '24px',
                      backgroundColor: themeButtonBg,
                      color: themeButtonText,
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(73,40,61,0.22)',
                    }}
                  >
                    PAY & CONFIRM ₹{selectedBooking.price.toLocaleString('en-IN')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 7: MY BOOKINGS SCREEN */}
          {/* ========================================================= */}
          {currentView === 'my-bookings' && (
            <div>
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: themeMulberry,
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '4px 0 14px 0',
                }}
              >
                <span>←</span>
                <span>ELEVATE</span>
              </button>

              <div style={{ marginBottom: '18px' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                    color: themeMulberry,
                    margin: '0 0 6px 0',
                  }}
                >
                  My Bookings
                </h1>
                <p style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.55', color: themeMuted, margin: 0 }}>
                  Track your private consultations, confirmed sessions, and past reservations.
                </p>
              </div>

              {/* Segmented Control: UPCOMING vs PAST */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '4px',
                  borderRadius: '26px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                  border: `1px solid ${themeBorder}`,
                  marginBottom: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setBookingsTab('upcoming')}
                  style={{
                    height: '38px',
                    borderRadius: '20px',
                    border: bookingsTab === 'upcoming' ? 'none' : 'transparent',
                    backgroundColor: bookingsTab === 'upcoming' ? (isDark ? '#F3EEE9' : '#FFFFFF') : 'transparent',
                    color: bookingsTab === 'upcoming' ? (isDark ? '#050104' : 'var(--color-mulberry)') : themeMuted,
                    fontSize: '11.5px',
                    fontWeight: bookingsTab === 'upcoming' ? 500 : 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  UPCOMING ({upcomingBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingsTab('past')}
                  style={{
                    height: '38px',
                    borderRadius: '20px',
                    border: bookingsTab === 'past' ? 'none' : 'transparent',
                    backgroundColor: bookingsTab === 'past' ? (isDark ? '#F3EEE9' : '#FFFFFF') : 'transparent',
                    color: bookingsTab === 'past' ? (isDark ? '#050104' : 'var(--color-mulberry)') : themeMuted,
                    fontSize: '11.5px',
                    fontWeight: bookingsTab === 'past' ? 500 : 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  PAST ({pastBookings.length})
                </button>
              </div>

              {/* Bookings List */}
              {bookingsTab === 'upcoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingBookings.length === 0 ? (
                    <div
                      style={{
                        padding: '30px 20px',
                        borderRadius: '18px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeTextColor, marginBottom: '6px' }}>
                        No upcoming sessions
                      </div>
                      <p style={{ fontSize: '12.5px', fontWeight: 300, color: themeMuted, lineHeight: '1.45', margin: '0 0 16px 0' }}>
                        Explore the Elevate services to request a personalized consultation.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentView('home')}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '20px',
                          backgroundColor: themeButtonBg,
                          color: themeButtonText,
                          border: 'none',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        EXPLORE SERVICES
                      </button>
                    </div>
                  ) : (
                    upcomingBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleOpenBookingDetails(b)}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '18px',
                          backgroundColor: themeCardBg,
                          border: themeCardBorder,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.35)' : '0 4px 14px rgba(73,40,61,0.06)',
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: themeMulberry, marginBottom: '3px' }}>
                            {b.serviceName}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, marginBottom: '4px' }}>
                            {b.date} · {b.time}
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: 300, color: isDark ? '#D5C5CF' : '#6E5D68' }}>
                            {b.duration} · {b.format} · ₹{b.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: b.bookingStatus === 'Confirmed'
                                ? (isDark ? 'rgba(129, 199, 132, 0.15)' : 'rgba(46, 125, 50, 0.1)')
                                : (isDark ? 'rgba(255, 183, 77, 0.15)' : 'rgba(217, 119, 6, 0.1)'),
                              color: b.bookingStatus === 'Confirmed'
                                ? (isDark ? '#81C784' : '#2E7D32')
                                : (isDark ? '#FFB74D' : '#D97706'),
                              fontSize: '10.5px',
                              fontWeight: 400,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              marginBottom: '6px',
                            }}
                          >
                            {b.bookingStatus}
                          </span>
                          <div style={{ fontSize: '11px', color: themeMuted, fontWeight: 400 }}>
                            Details →
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {bookingsTab === 'past' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pastBookings.length === 0 ? (
                    <div
                      style={{
                        padding: '30px 20px',
                        borderRadius: '18px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeTextColor, marginBottom: '4px' }}>
                        No past sessions yet
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                        Completed sessions will be archived here.
                      </div>
                    </div>
                  ) : (
                    pastBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleOpenBookingDetails(b)}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '18px',
                          backgroundColor: themeCardBg,
                          border: themeCardBorder,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          opacity: 0.9,
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: themeMulberry, marginBottom: '3px' }}>
                            {b.serviceName}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, marginBottom: '4px' }}>
                            {b.date} · {b.time}
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: 300, color: isDark ? '#D5C5CF' : '#6E5D68' }}>
                            {b.duration} · {b.format} · ₹{b.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                              color: themeMuted,
                              fontSize: '10.5px',
                              fontWeight: 400,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              marginBottom: '6px',
                            }}
                          >
                            COMPLETED
                          </span>
                          <div style={{ fontSize: '11px', color: themeMuted, fontWeight: 400 }}>
                            View →
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  </div>

      {/* ========================================================= */}
      {/* MOCK PAYMENT MODAL */}
      {/* ========================================================= */}
      {paymentModalBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            backgroundColor: 'rgba(5, 1, 4, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => !isProcessingPayment && setPaymentModalBooking(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#0A0209' : '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              borderRadius: '24px',
              padding: '26px 24px',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            }}
          >
            {!paymentSuccess ? (
              <>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 400,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '6px',
                  }}
                >
                  SECURE CHECKOUT
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '22px',
                    fontWeight: 400,
                    color: themeMulberry,
                    margin: '0 0 10px 0',
                  }}
                >
                  Confirm & Reserve
                </h3>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(73, 40, 61, 0.04)',
                    border: `1px solid ${themeBorder}`,
                    textAlign: 'left',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ fontWeight: 400, fontSize: '14px', color: themeMulberry, marginBottom: '4px' }}>
                    {paymentModalBooking.serviceName}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, marginBottom: '8px' }}>
                    {paymentModalBooking.date} · {paymentModalBooking.time} ({paymentModalBooking.duration})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${themeBorder}`, paddingTop: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>Total Payable</span>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: themeMulberry }}>
                      ₹{paymentModalBooking.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 300, color: themeMuted, marginBottom: '18px' }}>
                  Simulated payment for VennZ member demo.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleExecutePayment}
                    style={{
                      height: '46px',
                      borderRadius: '23px',
                      backgroundColor: themeButtonBg,
                      color: themeButtonText,
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isProcessingPayment ? 'PROCESSING PAYMENT...' : `PAY & CONFIRM ₹${paymentModalBooking.price.toLocaleString('en-IN')}`}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => setPaymentModalBooking(null)}
                    style={{
                      height: '38px',
                      borderRadius: '19px',
                      background: 'transparent',
                      color: themeMuted,
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 400,
                      cursor: 'pointer',
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(129, 199, 132, 0.2)' : 'rgba(46, 125, 50, 0.12)',
                    color: isDark ? '#81C784' : '#2E7D32',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: themeMulberry, margin: '0 0 8px 0' }}>
                  Payment Successful
                </h3>
                <p style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.5', color: themeMuted, margin: '0 0 20px 0' }}>
                  Your Elevate session for {paymentModalBooking.serviceName} is confirmed.
                </p>
                <button
                  type="button"
                  onClick={handleFinishPaymentModal}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '22px',
                    backgroundColor: themeButtonBg,
                    color: themeButtonText,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  VIEW IN MY BOOKINGS
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5-Button Bottom Navigation with ELEVATE active */}
      <MemberBottomNav
        activeTab="elevate"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
