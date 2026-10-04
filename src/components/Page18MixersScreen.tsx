import React, { useState, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { MemberTopBar } from './MemberTopBar';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { useAuth } from '../context/AuthContext';
import type { MixerEvent, MixerBooking } from '../types/mixers';
import { useLightbox } from '../context/LightboxContext';

interface Page18MixersScreenProps {
  onSelectTab: (tab: MemberTab) => void;
  onNavigateHelp?: () => void;
  onUpgradeToMembership?: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

type MixersView =
  | 'home'
  | 'event-detail'
  | 'booking-confirm'
  | 'my-events'
  | 'event-pass';

export const Page18MixersScreen: React.FC<Page18MixersScreenProps> = ({
  onSelectTab,
  onNavigateHelp,
  onUpgradeToMembership,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    appearanceMode,
    membershipStatus,
    profile,
    mixerEvents,
    mixerBookings,
    mixerInterestedEventIds,
    expressMixerInterest,
    bookMixerTicket,
    setMembershipStatus,
  } = useAuth();
  const { openLightbox } = useLightbox();

  const isDark = appearanceMode === 'after-dark';
  const isMember = membershipStatus === 'member';

  // Navigation sub-views
  const [currentView, setCurrentView] = useState<MixersView>('home');
  const [selectedEvent, setSelectedEvent] = useState<MixerEvent>(mixerEvents[0]);
  const [selectedBooking, setSelectedBooking] = useState<MixerBooking | null>(null);
  const [myEventsTab, setMyEventsTab] = useState<'upcoming' | 'interested' | 'past'>('upcoming');
  const [bookingSource, setBookingSource] = useState<'home' | 'event-detail'>('home');
  const [passReturnView, setPassReturnView] = useState<'my-events' | 'home' | 'event-detail'>('my-events');

  // Scroll position tracking & management
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const listScrollPosRef = useRef<number>(0);

  const restoreListScroll = () => {
    const savedPos = listScrollPosRef.current;
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = savedPos;
      }
    });
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = savedPos;
      }
    }, 50);
  };

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    });
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 50);
  };

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<MixerBooking | null>(null);

  // Dynamic Theme Colors
  const themeBgColor = isDark ? '#140E1C' : '#FAF1F3';
  const themeTextColor = isDark ? '#FDF3F5' : '#462037';
  const themeMulberry = isDark ? '#F9AAAD' : '#462037';
  const themeMuted = isDark ? '#D4A2AC' : '#683A46';
  const themeBorder = isDark ? 'rgba(161, 82, 95, 0.28)' : 'rgba(161, 82, 95, 0.18)';
  const themeCardBg = isDark ? 'rgba(70, 32, 55, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  const themeCardBorder = isDark
    ? '1px solid rgba(161, 82, 95, 0.3)'
    : '1px solid rgba(161, 82, 95, 0.18)';
  const themeButtonBg = 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)';
  const themeButtonText = '#FDF3F5';

  // Partition bookings
  const upcomingBookings = mixerBookings.filter((b) => b.bookingStatus === 'Confirmed');
  const pastBookings = mixerBookings.filter((b) => b.bookingStatus === 'Attended');
  const interestedEvents = mixerEvents.filter((e) => mixerInterestedEventIds.includes(e.id));
  const existingBookingForSelected = selectedEvent
    ? mixerBookings.find(
        (b) => b.eventId === selectedEvent.id && (b.bookingStatus === 'Confirmed' || b.paymentStatus === 'Paid')
      )
    : null;

  // Handlers
  const handleOpenEvent = (event: MixerEvent) => {
    if (scrollContainerRef.current) {
      listScrollPosRef.current = scrollContainerRef.current.scrollTop;
    }
    setSelectedEvent(event);
    setCurrentView('event-detail');
    scrollToTop();
  };

  const handleBackFromEventDetail = () => {
    setCurrentView('home');
    restoreListScroll();
  };

  const handleOpenBookingConfirm = (event: MixerEvent, source: 'home' | 'event-detail' = 'home') => {
    if (source === 'home' && scrollContainerRef.current) {
      listScrollPosRef.current = scrollContainerRef.current.scrollTop;
    }
    setBookingSource(source);
    setSelectedEvent(event);
    setCurrentView('booking-confirm');
    scrollToTop();
  };

  const handleBackFromBookingConfirm = () => {
    if (bookingSource === 'home') {
      setCurrentView('home');
      restoreListScroll();
    } else {
      setCurrentView('event-detail');
      scrollToTop();
    }
  };

  const handleStartPayment = () => {
    setIsPaymentModalOpen(true);
    setIsProcessingPayment(true);

    setTimeout(() => {
      const price = isMember ? selectedEvent.memberPrice : selectedEvent.regularPrice;
      const priceType = isMember ? 'member' : 'first_look';
      const booking = bookMixerTicket(selectedEvent.id, price, priceType);
      setConfirmedBooking(booking);
      setIsProcessingPayment(false);
    }, 1500);
  };

  const handleViewPassFromBooking = (booking: MixerBooking, returnView: 'my-events' | 'home' | 'event-detail' = 'my-events') => {
    if (returnView === 'home' && scrollContainerRef.current) {
      listScrollPosRef.current = scrollContainerRef.current.scrollTop;
    }
    setSelectedBooking(booking);
    setPassReturnView(returnView);
    setIsPaymentModalOpen(false);
    setConfirmedBooking(null);
    setCurrentView('event-pass');
    scrollToTop();
  };

  const handleBackFromPass = () => {
    if (passReturnView === 'home') {
      setCurrentView('home');
      restoreListScroll();
    } else if (passReturnView === 'event-detail') {
      setCurrentView('event-detail');
      scrollToTop();
    } else {
      setMyEventsTab('upcoming');
      setCurrentView('my-events');
      scrollToTop();
    }
  };

  const handleShowInterest = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    expressMixerInterest(eventId);
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
        overflow: 'hidden',
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

      {/* Subtle Luminous Parchment Glow & Dark Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDark ? 'rgba(20, 14, 28, 0.45)' : 'rgba(250, 241, 243, 0.35)',
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
            backgroundColor: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.92)',
            transition: 'background-color 0.25s ease',
          }}
        >
          <StatusBar variant={isDark ? 'light' : 'dark'} />
        </div>
      )}

      {/* Global Fixed Member Top Bar */}
      <MemberTopBar onConciergeClick={onNavigateHelp} />

      {/* Main Scrollable Content */}
      <div
        ref={scrollContainerRef}
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
            /* MEMBER-ONLY MIXERS LOCK SCREEN                            */
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
                MEMBER-ONLY ACCESS
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
                Curated Mixers & Dinners
              </h1>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: themeMuted,
                  margin: '0 0 24px 0',
                }}
              >
                VennZ Mixers and private member dinners are reserved exclusively for verified members. Upgrade to Full Membership to view private venues, RSVP to upcoming gatherings, and unlock preferred member pricing.
              </p>

              {/* Event Highlights */}
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
                  'Intimate member dinners in Mumbai, Delhi & Bengaluru',
                  'Discreet addresses revealed 24h prior to entry',
                  'Curated guest ratios and hosted private rooms',
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
                  background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
                  color: '#FDF3F5',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(161, 82, 95, 0.4)',
                  transition: 'filter 0.2s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
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
              {/* VIEW 1: MIXERS HOME */}
              {/* ========================================================= */}
              {currentView === 'home' && (
            <div>
              {/* Editorial Header - Left aligned */}
              <div style={{ textAlign: 'left', padding: '16px 2px 20px 2px' }}>
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
                  MIXERS
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
                  Curated evenings. Real connections.
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
                  Private gatherings created for VennZ members to meet, connect and experience something beyond the screen.
                </p>
              </div>

              {/* My Events Link Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '26px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setMyEventsTab('upcoming');
                  setCurrentView('my-events');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                    }}
                  >
                    🎫
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 400, color: themeTextColor }}>
                      My Events Hub
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 300, color: themeMuted }}>
                      {upcomingBookings.length} confirmed · {interestedEvents.length} interested
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: themeMuted, fontWeight: 400 }}>
                  View →
                </span>
              </div>

              {/* Section Header: UPCOMING */}
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
                UPCOMING
              </div>

              {/* Events Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mixerEvents
                  .filter((e) => e.status !== 'COMPLETED')
                  .map((event) => {
                    const isInterested = mixerInterestedEventIds.includes(event.id);
                    const isPlanning = event.status === 'PLANNING';
                    const isSoldOut = event.status === 'SOLD OUT';
                    const existingBooking = mixerBookings.find(
                      (b) => b.eventId === event.id && (b.bookingStatus === 'Confirmed' || b.paymentStatus === 'Paid')
                    );

                    return (
                      <div
                        key={event.id}
                        style={{
                          borderRadius: '20px',
                          backgroundColor: themeCardBg,
                          border: themeCardBorder,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 16px rgba(73,40,61,0.06)',
                        }}
                      >
                        {/* Event Hero Image */}
                        <div
                          style={{ position: 'relative', width: '100%', height: '190px', cursor: 'zoom-in' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox([event.image], 0, event.eventName);
                          }}
                          title="Click to view full-size photograph"
                        >
                          <img
                            src={event.image}
                            alt={event.eventName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                            }}
                          />

                          {/* Top Status Pill */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor:
                                event.status === 'FINALIZED'
                                  ? 'rgba(46, 125, 50, 0.88)'
                                  : event.status === 'PLANNING'
                                  ? 'rgba(217, 119, 6, 0.88)'
                                  : 'rgba(50, 50, 50, 0.88)',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 400,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              backdropFilter: 'blur(6px)',
                            }}
                          >
                            {event.status}
                          </div>

                          {/* Spots indicator */}
                          {event.spotsAvailable > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                color: '#F3EEE9',
                                fontSize: '10px',
                                fontWeight: 300,
                                letterSpacing: '0.04em',
                                backdropFilter: 'blur(6px)',
                              }}
                            >
                              {event.spotsAvailable} spots remaining
                            </div>
                          )}

                          {/* Event City overlay on image */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '12px',
                              left: '14px',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 400,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                            }}
                          >
                            {event.city} · {event.area}
                          </div>
                        </div>

                        {/* Event Content Details */}
                        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <h2
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '20px',
                                fontWeight: 400,
                                color: themeMulberry,
                                margin: '0 0 4px 0',
                                letterSpacing: '0.01em',
                              }}
                            >
                              {event.eventName}
                            </h2>

                            <div style={{ fontSize: '12.5px', fontWeight: 300, color: themeTextColor, marginBottom: '2px' }}>
                              {event.date} · {event.startTime} – {event.endTime}
                            </div>
                            <div style={{ fontSize: '11.5px', fontWeight: 300, color: themeMuted }}>
                              {event.area} · {event.venue}
                            </div>
                          </div>

                          {/* Pricing Box - Editorial & Restrained */}
                          <div
                            style={{
                              padding: '12px 14px',
                              borderRadius: '14px',
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                              border: `1px solid ${themeBorder}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            {isMember ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                  <span style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: themeMuted, marginRight: '6px' }}>
                                    REGULAR
                                  </span>
                                  <span style={{ fontSize: '12.5px', fontWeight: 300, textDecoration: 'line-through', color: themeMuted }}>
                                    ₹{event.regularPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: themeMuted, marginRight: '6px' }}>
                                    MEMBER
                                  </span>
                                  <span style={{ fontSize: '17px', fontWeight: 500, color: themeMulberry }}>
                                    ₹{event.memberPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                  <span style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: themeMuted, marginRight: '6px' }}>
                                    FIRST LOOK
                                  </span>
                                  <span style={{ fontSize: '16px', fontWeight: 500, color: themeTextColor }}>
                                    ₹{event.regularPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: themeMuted, marginRight: '6px' }}>
                                    MEMBER
                                  </span>
                                  <span style={{ fontSize: '13.5px', fontWeight: 400, color: themeMuted }}>
                                    ₹{event.memberPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Savings callout */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${themeBorder}`, paddingTop: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 400, color: isDark ? '#81C784' : '#2E7D32' }}>
                                Members save ₹{(event.regularPrice - event.memberPrice).toLocaleString('en-IN')}
                              </span>
                              {!isMember && (
                                <span style={{ fontSize: '10.5px', fontWeight: 300, color: themeMuted }}>
                                  Unlock member pricing
                                </span>
                              )}
                            </div>
                          </div>

                          {/* First Look Subtle Note */}
                          {!isMember && (
                            <div style={{ fontSize: '11px', fontWeight: 300, color: themeMuted, lineHeight: '1.4' }}>
                              Become a member and unlock exclusive event pricing.
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEvent(event)}
                              style={{
                                flex: 1,
                                height: '42px',
                                borderRadius: '21px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${themeBorder}`,
                                color: themeMulberry,
                                fontSize: '11.5px',
                                fontWeight: 400,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                              }}
                            >
                              VIEW EVENT
                            </button>

                            {isPlanning ? (
                              <button
                                type="button"
                                onClick={(e) => handleShowInterest(e, event.id)}
                                disabled={isInterested}
                                style={{
                                  flex: 1.2,
                                  height: '42px',
                                  borderRadius: '21px',
                                  backgroundColor: isInterested
                                    ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.08)')
                                    : themeButtonBg,
                                  color: isInterested ? themeMuted : themeButtonText,
                                  border: isInterested ? `1px solid ${themeBorder}` : 'none',
                                  fontSize: '11.5px',
                                  fontWeight: 500,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  cursor: isInterested ? 'default' : 'pointer',
                                }}
                              >
                                {isInterested ? 'INTERESTED ✓' : 'SHOW INTEREST'}
                              </button>
                            ) : isSoldOut ? (
                              <button
                                type="button"
                                disabled
                                style={{
                                  flex: 1.2,
                                  height: '42px',
                                  borderRadius: '21px',
                                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.06)',
                                  color: themeMuted,
                                  border: `1px solid ${themeBorder}`,
                                  fontSize: '11.5px',
                                  fontWeight: 400,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  cursor: 'not-allowed',
                                }}
                              >
                                SOLD OUT
                              </button>
                            ) : existingBooking ? (
                              <button
                                type="button"
                                onClick={() => handleViewPassFromBooking(existingBooking, 'home')}
                                style={{
                                  flex: 1.2,
                                  height: '42px',
                                  borderRadius: '21px',
                                  backgroundColor: isDark ? 'rgba(129, 199, 132, 0.18)' : 'rgba(46, 125, 50, 0.12)',
                                  color: isDark ? '#81C784' : '#2E7D32',
                                  border: `1px solid ${isDark ? 'rgba(129, 199, 132, 0.35)' : 'rgba(46, 125, 50, 0.3)'}`,
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                }}
                              >
                                BOOKING IS DONE
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenBookingConfirm(event, 'home')}
                                style={{
                                  flex: 1.2,
                                  height: '42px',
                                  borderRadius: '21px',
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
                                BOOK TICKET
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: EVENT DETAILS */}
          {/* ========================================================= */}
          {currentView === 'event-detail' && selectedEvent && (
            <div>
              {/* Back navigation */}
              <button
                type="button"
                onClick={handleBackFromEventDetail}
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
                <span>MIXERS</span>
              </button>

              {/* Event Hero Showcase */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: '22px',
                  overflow: 'hidden',
                  marginBottom: '18px',
                  cursor: 'zoom-in',
                }}
                onClick={() => openLightbox([selectedEvent.image], 0, selectedEvent.eventName)}
                title="Click to view full photograph"
              >
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.eventName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '18px',
                    right: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor:
                        selectedEvent.status === 'FINALIZED'
                          ? 'rgba(46, 125, 50, 0.88)'
                          : selectedEvent.status === 'PLANNING'
                          ? 'rgba(217, 119, 6, 0.88)'
                          : 'rgba(50, 50, 50, 0.88)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    {selectedEvent.status}
                  </div>
                  <h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '24px',
                      fontWeight: 400,
                      color: '#FFFFFF',
                      margin: 0,
                      textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                    }}
                  >
                    {selectedEvent.eventName}
                  </h1>
                </div>
              </div>

              {/* Date & Time Specs Panel */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                      DATE & TIME
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 400, color: themeTextColor }}>
                      {selectedEvent.date}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                      {selectedEvent.startTime} – {selectedEvent.endTime}
                    </div>
                  </div>
                  {selectedEvent.spotsAvailable > 0 && (
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '14px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.05)',
                        border: `1px solid ${themeBorder}`,
                        fontSize: '11px',
                        fontWeight: 300,
                        color: themeTextColor,
                        textAlign: 'right',
                      }}
                    >
                      {selectedEvent.spotsAvailable} spots remaining
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${themeBorder}`, paddingTop: '10px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                    LOCATION & VENUE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor }}>
                    {selectedEvent.city} · {selectedEvent.area}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                    {selectedEvent.venue}
                  </div>
                </div>
              </div>

              {/* ABOUT THE EVENING */}
              <div style={{ marginBottom: '20px', padding: '0 2px' }}>
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
                  ABOUT THE EVENING
                </div>
                <p
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 300,
                    lineHeight: '1.6',
                    color: themeTextColor,
                    letterSpacing: '0.01em',
                    margin: 0,
                  }}
                >
                  {selectedEvent.description}
                </p>
              </div>

              {/* WHAT TO EXPECT */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '20px',
                }}
              >
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
                  WHAT TO EXPECT
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {selectedEvent.whatToExpect.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px',
                        fontSize: '13px',
                        fontWeight: 300,
                        lineHeight: '1.5',
                        color: themeTextColor,
                      }}
                    >
                      <span style={{ color: isDark ? '#D88A9F' : '#9B4D6E', fontSize: '12px' }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* VENUE NOTE */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(73, 40, 61, 0.03)',
                  border: `1px dashed ${themeBorder}`,
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted, marginBottom: '4px' }}>
                  VENUE ADVISORY
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 300, color: themeTextColor, lineHeight: '1.45' }}>
                  {selectedEvent.isVenueAnnounced
                    ? `Hosted at ${selectedEvent.venue}. Private entrance details and valet options will be sent with your event pass.`
                    : 'The precise address in South Mumbai will be revealed exclusively to ticket holders 48 hours before the mixer to preserve an intimate, private room.'}
                </div>
              </div>

              {/* PRICING & MEMBER BENEFIT CARD */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: isDark ? '#D88A9F' : '#9B4D6E', marginBottom: '8px' }}>
                  MEMBER BENEFIT
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>Regular Price</span>
                  <span style={{ fontSize: '13px', fontWeight: 300, textDecoration: 'line-through', color: themeMuted }}>
                    ₹{selectedEvent.regularPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${themeBorder}`, paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor }}>
                    {isMember ? 'Your Member Price' : 'Member Price'}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 500, color: themeMulberry }}>
                    ₹{selectedEvent.memberPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 400, color: isDark ? '#81C784' : '#2E7D32' }}>
                    {isMember ? 'You save ₹1,000 as a verified member' : 'Members save ₹1,000'}
                  </span>
                  {!isMember && (
                    <span style={{ fontSize: '11px', fontWeight: 300, color: themeMuted }}>
                      First Look: ₹{selectedEvent.regularPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Action Bar */}
              <div>
                {selectedEvent.status === 'PLANNING' ? (
                  <button
                    type="button"
                    onClick={(e) => handleShowInterest(e, selectedEvent.id)}
                    disabled={mixerInterestedEventIds.includes(selectedEvent.id)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '24px',
                      backgroundColor: mixerInterestedEventIds.includes(selectedEvent.id)
                        ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.08)')
                        : themeButtonBg,
                      color: mixerInterestedEventIds.includes(selectedEvent.id) ? themeMuted : themeButtonText,
                      border: mixerInterestedEventIds.includes(selectedEvent.id) ? `1px solid ${themeBorder}` : 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: mixerInterestedEventIds.includes(selectedEvent.id) ? 'default' : 'pointer',
                    }}
                  >
                    {mixerInterestedEventIds.includes(selectedEvent.id) ? 'YOU ARE ON THE INTEREST LIST ✓' : 'SHOW INTEREST'}
                  </button>
                ) : selectedEvent.status === 'SOLD OUT' ? (
                  <button
                    type="button"
                    disabled
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '24px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.06)',
                      color: themeMuted,
                      border: `1px solid ${themeBorder}`,
                      fontSize: '12px',
                      fontWeight: 400,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'not-allowed',
                    }}
                  >
                    EVENT SOLD OUT
                  </button>
                ) : existingBookingForSelected ? (
                  <button
                    type="button"
                    onClick={() => handleViewPassFromBooking(existingBookingForSelected, 'event-detail')}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '24px',
                      backgroundColor: isDark ? 'rgba(129, 199, 132, 0.22)' : 'rgba(46, 125, 50, 0.15)',
                      color: isDark ? '#81C784' : '#2E7D32',
                      border: `1px solid ${isDark ? 'rgba(129, 199, 132, 0.4)' : 'rgba(46, 125, 50, 0.35)'}`,
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    BOOKING IS DONE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenBookingConfirm(selectedEvent, 'event-detail')}
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
                      boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 18px rgba(73,40,61,0.2)',
                    }}
                  >
                    BOOK YOUR TICKET · ₹{(isMember ? selectedEvent.memberPrice : selectedEvent.regularPrice).toLocaleString('en-IN')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: BOOKING CONFIRMATION SCREEN */}
          {/* ========================================================= */}
          {currentView === 'booking-confirm' && selectedEvent && (
            <div>
              {/* Back navigation */}
              <button
                type="button"
                onClick={handleBackFromBookingConfirm}
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
                <span>{bookingSource === 'home' ? 'MIXERS' : 'EVENT DETAILS'}</span>
              </button>

              <div style={{ marginBottom: '20px' }}>
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
                  RESERVATION REVIEW
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                    color: themeMulberry,
                    margin: 0,
                  }}
                >
                  Confirm Your Ticket
                </h1>
              </div>

              {/* Event card summary */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                }}
              >
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.eventName}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    cursor: 'zoom-in',
                  }}
                  onClick={() => openLightbox([selectedEvent.image], 0, selectedEvent.eventName)}
                  title="Click to view full photograph"
                />
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '16.5px',
                      fontWeight: 400,
                      color: themeMulberry,
                      margin: '0 0 2px 0',
                    }}
                  >
                    {selectedEvent.eventName}
                  </h3>
                  <div style={{ fontSize: '12px', fontWeight: 300, color: themeTextColor }}>
                    {selectedEvent.date}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 300, color: themeMuted }}>
                    {selectedEvent.startTime} – {selectedEvent.endTime} · {selectedEvent.area}
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown Panel */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '18px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: themeMuted, marginBottom: '12px' }}>
                  YOUR PRICE
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 300, color: themeMuted }}>
                      Regular Event Price
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 300, color: themeMuted }}>
                      ₹{selectedEvent.regularPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {isMember ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 400, color: isDark ? '#81C784' : '#2E7D32' }}>
                        Member Privilege (-₹1,000)
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: 400, color: isDark ? '#81C784' : '#2E7D32' }}>
                        -₹1,000
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                        First Look Rate
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                        Standard
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: `1px solid ${themeBorder}`,
                      paddingTop: '10px',
                      marginTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: 400, color: themeTextColor }}>
                      Total Amount Payable
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 500, color: themeMulberry }}>
                      ₹{(isMember ? selectedEvent.memberPrice : selectedEvent.regularPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notice for First Look User */}
              {!isMember && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(73, 40, 61, 0.04)',
                    border: `1px solid ${themeBorder}`,
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 400, color: isDark ? '#D88A9F' : '#9B4D6E', marginBottom: '2px' }}>
                    MEMBERSHIP PRIVILEGE
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 300, color: themeTextColor, lineHeight: '1.45' }}>
                    You are reserving under complimentary First Look access. Full circle members save ₹1,000 on every private gathering.
                  </div>
                </div>
              )}

              {/* Pay & Book Button / Already Booked */}
              {existingBookingForSelected ? (
                <button
                  type="button"
                  onClick={() => handleViewPassFromBooking(existingBookingForSelected, 'home')}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '24px',
                    backgroundColor: isDark ? 'rgba(129, 199, 132, 0.22)' : 'rgba(46, 125, 50, 0.15)',
                    color: isDark ? '#81C784' : '#2E7D32',
                    border: `1px solid ${isDark ? 'rgba(129, 199, 132, 0.4)' : 'rgba(46, 125, 50, 0.35)'}`,
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  BOOKING IS DONE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartPayment}
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
                    boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 18px rgba(73,40,61,0.2)',
                  }}
                >
                  PAY ₹{(isMember ? selectedEvent.memberPrice : selectedEvent.regularPrice).toLocaleString('en-IN')} & BOOK
                </button>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: MY EVENTS HUB */}
          {/* ========================================================= */}
          {currentView === 'my-events' && (
            <div>
              {/* Back navigation */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  restoreListScroll();
                }}
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
                <span>MIXERS</span>
              </button>

              <div style={{ marginBottom: '18px' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                    color: themeMulberry,
                    margin: '0 0 4px 0',
                  }}
                >
                  My Events
                </h1>
                <p style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.5', color: themeMuted, margin: 0 }}>
                  Manage your confirmed mixer reservations, interest lists, and past gatherings.
                </p>
              </div>

              {/* Segmented Sub-Tabs: UPCOMING | INTERESTED | PAST */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  padding: '4px',
                  borderRadius: '24px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(73, 40, 61, 0.06)',
                  border: `1px solid ${themeBorder}`,
                  marginBottom: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMyEventsTab('upcoming')}
                  style={{
                    height: '36px',
                    borderRadius: '18px',
                    border: myEventsTab === 'upcoming' ? 'none' : 'transparent',
                    backgroundColor: myEventsTab === 'upcoming' ? (isDark ? '#F3EEE9' : '#FFFFFF') : 'transparent',
                    color: myEventsTab === 'upcoming' ? (isDark ? '#140E1C' : 'var(--color-mulberry)') : themeMuted,
                    fontSize: '11px',
                    fontWeight: myEventsTab === 'upcoming' ? 500 : 400,
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
                  onClick={() => setMyEventsTab('interested')}
                  style={{
                    height: '36px',
                    borderRadius: '18px',
                    border: myEventsTab === 'interested' ? 'none' : 'transparent',
                    backgroundColor: myEventsTab === 'interested' ? (isDark ? '#F3EEE9' : '#FFFFFF') : 'transparent',
                    color: myEventsTab === 'interested' ? (isDark ? '#140E1C' : 'var(--color-mulberry)') : themeMuted,
                    fontSize: '11px',
                    fontWeight: myEventsTab === 'interested' ? 500 : 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  INTERESTED ({interestedEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMyEventsTab('past')}
                  style={{
                    height: '36px',
                    borderRadius: '18px',
                    border: myEventsTab === 'past' ? 'none' : 'transparent',
                    backgroundColor: myEventsTab === 'past' ? (isDark ? '#F3EEE9' : '#FFFFFF') : 'transparent',
                    color: myEventsTab === 'past' ? (isDark ? '#140E1C' : 'var(--color-mulberry)') : themeMuted,
                    fontSize: '11px',
                    fontWeight: myEventsTab === 'past' ? 500 : 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  PAST ({pastBookings.length})
                </button>
              </div>

              {/* Sub-tab 1: UPCOMING */}
              {myEventsTab === 'upcoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {upcomingBookings.length === 0 ? (
                    <div
                      style={{
                        padding: '36px 20px',
                        borderRadius: '18px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeTextColor, marginBottom: '6px' }}>
                        No upcoming bookings
                      </div>
                      <p style={{ fontSize: '12.5px', fontWeight: 300, color: themeMuted, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                        Browse our upcoming calendar to reserve a seat at an intimate gathering.
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
                        EXPLORE MIXERS
                      </button>
                    </div>
                  ) : (
                    upcomingBookings.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '18px',
                          backgroundColor: themeCardBg,
                          border: themeCardBorder,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.35)' : '0 4px 14px rgba(73,40,61,0.06)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: themeMulberry, marginBottom: '2px' }}>
                              {b.eventName}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 300, color: themeTextColor }}>
                              {b.date} · {b.startTime}
                            </div>
                            <div style={{ fontSize: '11.5px', fontWeight: 300, color: themeMuted }}>
                              {b.area} · {b.venue}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '10px',
                              backgroundColor: isDark ? 'rgba(129, 199, 132, 0.18)' : 'rgba(46, 125, 50, 0.12)',
                              color: isDark ? '#81C784' : '#2E7D32',
                              fontSize: '10px',
                              fontWeight: 400,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                            }}
                          >
                            CONFIRMED
                          </span>
                        </div>

                        <div
                          style={{
                            borderTop: `1px solid ${themeBorder}`,
                            paddingTop: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 400, color: themeMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              BOOKING ID
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 400, color: themeMulberry }}>
                              {b.id}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewPassFromBooking(b)}
                            style={{
                              padding: '7px 16px',
                              borderRadius: '16px',
                              backgroundColor: themeButtonBg,
                              color: themeButtonText,
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 500,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                            }}
                          >
                            VIEW EVENT PASS
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sub-tab 2: INTERESTED */}
              {myEventsTab === 'interested' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {interestedEvents.length === 0 ? (
                    <div
                      style={{
                        padding: '36px 20px',
                        borderRadius: '18px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeTextColor, marginBottom: '6px' }}>
                        No events on interest list
                      </div>
                      <p style={{ fontSize: '12.5px', fontWeight: 300, color: themeMuted, lineHeight: '1.5', margin: 0 }}>
                        When you click "Show Interest" on an event in planning, it will appear here.
                      </p>
                    </div>
                  ) : (
                    interestedEvents.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '18px',
                          backgroundColor: themeCardBg,
                          border: themeCardBorder,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: themeMulberry, marginBottom: '2px' }}>
                            {event.eventName}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 300, color: themeTextColor }}>
                            {event.date} · {event.startTime}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 400, color: isDark ? '#FFB74D' : '#D97706', marginTop: '2px' }}>
                            On interest list · We will notify you
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEvent(event)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${themeBorder}`,
                            color: themeMulberry,
                            fontSize: '11px',
                            fontWeight: 400,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                          }}
                        >
                          DETAILS
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sub-tab 3: PAST */}
              {myEventsTab === 'past' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {pastBookings.length === 0 ? (
                    <div
                      style={{
                        padding: '36px 20px',
                        borderRadius: '18px',
                        backgroundColor: themeCardBg,
                        border: themeCardBorder,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeTextColor, marginBottom: '4px' }}>
                        No past events yet
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: 300, color: themeMuted, margin: 0 }}>
                        Completed gatherings will be archived here.
                      </p>
                    </div>
                  ) : (
                    pastBookings.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '18px',
                          backgroundColor: themeCardBg,
                          border: themeCardBorder,
                          opacity: 0.9,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: themeMulberry, marginBottom: '2px' }}>
                            {b.eventName}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                            {b.date} · {b.area}
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: 300, color: themeMuted }}>
                            Booking ID: {b.id}
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(73, 40, 61, 0.05)',
                            color: themeMuted,
                            fontSize: '10.5px',
                            fontWeight: 400,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          ATTENDED
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: LUXURY DIGITAL EVENT PASS */}
          {/* ========================================================= */}
          {currentView === 'event-pass' && selectedBooking && (
            <div>
              {/* Back navigation */}
              <button
                type="button"
                onClick={handleBackFromPass}
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
                <span>{passReturnView === 'home' ? 'MIXERS' : passReturnView === 'event-detail' ? 'EVENT DETAILS' : 'MY EVENTS'}</span>
              </button>

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 400,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isDark ? '#D88A9F' : '#9B4D6E',
                    marginBottom: '4px',
                  }}
                >
                  VENNZ
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: 400,
                    color: themeMulberry,
                    margin: 0,
                  }}
                >
                  Official Event Pass
                </h1>
              </div>

              {/* Digital Boarding Pass Ticket Container */}
              <div
                style={{
                  borderRadius: '24px',
                  backgroundColor: themeCardBg,
                  border: themeCardBorder,
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '0 16px 36px rgba(73,40,61,0.12)',
                  marginBottom: '20px',
                }}
              >
                {/* Top Section */}
                <div style={{ padding: '22px 20px 18px 20px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: themeMuted }}>
                      MEMBER PASS
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 400,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        backgroundColor: isDark ? 'rgba(129, 199, 132, 0.2)' : 'rgba(46, 125, 50, 0.1)',
                        color: isDark ? '#81C784' : '#2E7D32',
                      }}
                    >
                      VERIFIED GUEST
                    </span>
                  </div>

                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '22px',
                      fontWeight: 400,
                      color: themeMulberry,
                      margin: '0 0 6px 0',
                    }}
                  >
                    {selectedBooking.eventName}
                  </h2>

                  <div style={{ fontSize: '13px', fontWeight: 400, color: themeTextColor, marginBottom: '2px' }}>
                    {selectedBooking.date}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 300, color: themeMuted }}>
                    {selectedBooking.startTime} – {selectedBooking.endTime} · {selectedBooking.area}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 300, color: isDark ? '#D5C5CF' : '#8A7A84', marginTop: '4px' }}>
                    Venue: {selectedBooking.venue}
                  </div>
                </div>

                {/* Perforated Divider Strip with Notch */}
                <div
                  style={{
                    position: 'relative',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {/* Left Notch */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: themeBgColor,
                    }}
                  />
                  {/* Dashed Line */}
                  <div
                    style={{
                      flex: 1,
                      borderBottom: `1px dashed ${themeBorder}`,
                      margin: '0 16px',
                    }}
                  />
                  {/* Right Notch */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: themeBgColor,
                    }}
                  />
                </div>

                {/* Bottom Pass Details & QR Code */}
                <div style={{ padding: '16px 20px 22px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                        MEMBER
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeTextColor }}>
                        {profile.firstName ? `${profile.firstName} (Member)` : 'VennZ Member'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeMuted, marginBottom: '2px' }}>
                        BOOKING ID
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 400, color: themeMulberry }}>
                        {selectedBooking.id}
                      </div>
                    </div>
                  </div>

                  {/* Clean Geometric QR Placeholder */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '16px',
                      backgroundColor: isDark ? '#FFFFFF' : '#F9F6F2',
                      border: `1px solid ${themeBorder}`,
                    }}
                  >
                    {/* SVG Geometric QR code simulation */}
                    <svg
                      width="130"
                      height="130"
                      viewBox="0 0 130 130"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block', margin: '0 auto 10px auto' }}
                    >
                      {/* Outer Frame Corners */}
                      <rect x="10" y="10" width="32" height="32" stroke="#272124" strokeWidth="4" fill="none" />
                      <rect x="18" y="18" width="16" height="16" fill="#272124" />

                      <rect x="88" y="10" width="32" height="32" stroke="#272124" strokeWidth="4" fill="none" />
                      <rect x="96" y="18" width="16" height="16" fill="#272124" />

                      <rect x="10" y="88" width="32" height="32" stroke="#272124" strokeWidth="4" fill="none" />
                      <rect x="18" y="96" width="16" height="16" fill="#272124" />

                      {/* Internal Data Matrix Blocks */}
                      <rect x="52" y="14" width="8" height="8" fill="#272124" />
                      <rect x="68" y="14" width="8" height="8" fill="#272124" />
                      <rect x="52" y="30" width="8" height="8" fill="#272124" />
                      <rect x="68" y="30" width="8" height="8" fill="#272124" />
                      <rect x="14" y="52" width="8" height="8" fill="#272124" />
                      <rect x="30" y="52" width="8" height="8" fill="#272124" />
                      <rect x="46" y="46" width="12" height="12" fill="#272124" />
                      <rect x="66" y="46" width="12" height="12" fill="#272124" />
                      <rect x="86" y="52" width="8" height="8" fill="#272124" />
                      <rect x="102" y="52" width="8" height="8" fill="#272124" />
                      <rect x="52" y="68" width="8" height="8" fill="#272124" />
                      <rect x="68" y="68" width="8" height="8" fill="#272124" />
                      <rect x="52" y="88" width="8" height="8" fill="#272124" />
                      <rect x="68" y="88" width="8" height="8" fill="#272124" />
                      <rect x="88" y="88" width="12" height="12" fill="#272124" />
                      <rect x="106" y="88" width="12" height="12" fill="#272124" />
                      <rect x="88" y="106" width="12" height="12" fill="#272124" />
                      <rect x="106" y="106" width="12" height="12" fill="#272124" />
                    </svg>

                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 400,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#272124',
                      }}
                    >
                      SCAN AT ENTRY
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11px', fontWeight: 300, color: themeMuted }}>
                    Please display this digital pass at the private door host desk.
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleBackFromPass}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '22px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${themeBorder}`,
                  color: themeMulberry,
                  fontSize: '11.5px',
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {passReturnView === 'home' ? 'RETURN TO MIXERS' : passReturnView === 'event-detail' ? 'RETURN TO EVENT DETAILS' : 'RETURN TO MY EVENTS'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>

      {/* ========================================================= */}
      {/* MOCK PAYMENT MODAL OVERLAY */}
      {/* ========================================================= */}
      {isPaymentModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            backgroundColor: 'rgba(5, 1, 4, 0.72)',
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
              backgroundColor: isDark ? '#0A0209' : '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              borderRadius: '24px',
              padding: '28px 24px',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            }}
          >
            {isProcessingPayment ? (
              <div style={{ padding: '24px 0' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: `2px solid ${isDark ? '#F3EEE9' : 'var(--color-mulberry)'}`,
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 16px auto',
                  }}
                />
                <style>
                  {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
                <div style={{ fontSize: '13.5px', fontWeight: 400, color: themeTextColor, marginBottom: '4px' }}>
                  Confirming Reservation...
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 300, color: themeMuted }}>
                  Securing your seat in the room
                </div>
              </div>
            ) : confirmedBooking ? (
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

                <div style={{ fontSize: '10.5px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? '#81C784' : '#2E7D32', marginBottom: '4px' }}>
                  BOOKING CONFIRMED
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
                  {confirmedBooking.eventName}
                </h3>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(73, 40, 61, 0.04)',
                    border: `1px solid ${themeBorder}`,
                    textAlign: 'left',
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 400, color: themeTextColor }}>
                    {confirmedBooking.date} · {confirmedBooking.startTime}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 300, color: themeMuted }}>
                    {confirmedBooking.area} · ₹{confirmedBooking.amountPaid.toLocaleString('en-IN')} Paid
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 400, color: themeMulberry, borderTop: `1px solid ${themeBorder}`, paddingTop: '6px', marginTop: '2px' }}>
                    Booking ID: {confirmedBooking.id}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleViewPassFromBooking(confirmedBooking, 'home')}
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
                      cursor: 'pointer',
                    }}
                  >
                    VIEW EVENT PASS
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setConfirmedBooking(null);
                      setMyEventsTab('upcoming');
                      setCurrentView('my-events');
                    }}
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
                    GO TO MY EVENTS
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* 5-Button Bottom Navigation with MIXERS active */}
      <MemberBottomNav
        activeTab="mixers"
        onSelectTab={onSelectTab}
        showHomeIndicator={showHomeIndicator}
      />
    </div>
  );
};
