import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppNotification } from '../types/discover';
import type { MatchItem, IncomingRequest, SentRequest, ChatMessage } from '../types/matches';
import type { ElevateRequest, ElevateBooking, ElevateConciergeMessage } from '../types/elevate';
import type { MixerEvent, MixerBooking } from '../types/mixers';
import { INITIAL_MIXER_EVENTS, INITIAL_PAST_BOOKINGS } from '../data/mixerEvents';
import { DUMMY_DISCOVER_PROFILES } from '../data/dummyProfiles';

export interface UserProfile {
  firstName: string;
  dateOfBirth: string;
  city: string;
  genderIdentity: string;
  selfDescribeGender?: string;
  datingPreference: string;
  currentStatus: string;
  designation: string;
  company: string;
  photos: string[];
  invitationCode: string;
  introduction: string;
  linkedinUrl?: string;
  instagramUsername?: string;
}

export interface PhoneRecord {
  profile: UserProfile;
  isApplicationSubmitted?: boolean;
  isApplicationApproved?: boolean;
  applicationDecision?: 'approved' | 'declined' | 'more_info' | null;
  decisionTimestamp?: number | null;
  membershipStatus?: 'none' | 'member' | 'complimentary' | null;
  complimentaryStartDate?: number | null;
  isPhoneVerified?: boolean;
  isIdentityVerified?: boolean;
  isSelfieVerified?: boolean;
  selfieImage?: string | null;
}

export interface AuthState {
  phoneNumber: string;
  countryCode: string;
  authMethod: 'phone' | 'google' | 'apple' | null;
  isAuthenticated: boolean;
  isPhoneVerified?: boolean;
  isIdentityVerified?: boolean;
  isSelfieVerified?: boolean;
  selfieImage?: string | null;
  isApplicationSubmitted?: boolean;
  isApplicationApproved?: boolean;
  applicationDecision?: 'approved' | 'declined' | 'more_info' | null;
  decisionTimestamp?: number | null;
  membershipStatus?: 'none' | 'member' | 'complimentary' | null;
  complimentaryStartDate?: number | null;
  complimentaryExpiredOverride?: boolean | null;
  passedProfileIds?: string[];
  sentRequestProfileIds?: string[];
  notifications?: AppNotification[];
  phoneRecords?: { [phone: string]: PhoneRecord };
  googleUser?: {
    email?: string;
    name?: string;
    picture?: string;
  };
  profile: UserProfile;
  appearanceMode?: 'ivory' | 'after-dark';
  // Matches & Chat state
  incomingRequests?: IncomingRequest[];
  sentRequests?: SentRequest[];
  matches?: MatchItem[];
  conversations?: Record<string, ChatMessage[]>;
  blockedProfileIds?: string[];
  // Elevate Concierge state
  elevateRequests?: ElevateRequest[];
  elevateBookings?: ElevateBooking[];
  elevateMessages?: ElevateConciergeMessage[];
  // Mixers state
  mixerEvents?: MixerEvent[];
  mixerBookings?: MixerBooking[];
  mixerInterestedEventIds?: string[];
}

interface AuthContextType extends AuthState {
  appearanceMode: 'ivory' | 'after-dark';
  isComplimentary: boolean;
  isMember: boolean;
  isTrialExpired: boolean;
  complimentaryProfilesRemaining: number;
  complimentaryRequestsRemaining: number;
  maxComplimentaryProfiles: number;
  maxComplimentaryRequests: number;
  canDiscoverMore: boolean;
  canSendMoreRequests: boolean;
  expireTrialForTesting: () => void;
  resetTrialForTesting: () => void;
  setAppearanceMode: (mode: 'ivory' | 'after-dark') => void;
  setPhoneAuth: (phoneNumber: string) => void;
  setGoogleAuth: (googleUser?: AuthState['googleUser']) => void;
  setAppleAuth: () => void;
  setPhoneVerified: (verified: boolean) => void;
  setIdentityVerified: (verified: boolean) => void;
  setSelfieVerified: (verified: boolean, selfieImage?: string | null) => void;
  setApplicationSubmitted: (submitted: boolean) => void;
  setApplicationApproved: (approved: boolean) => void;
  setApplicationDecision: (decision: 'approved' | 'declined' | 'more_info' | null) => void;
  setMembershipStatus: (status: 'none' | 'member' | 'complimentary') => void;
  startComplimentaryFirstLook: () => void;
  simulate90DaysPassed: () => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
  resetAuth: () => void;
  // Discover & Notification methods
  passedProfileIds: string[];
  sentRequestProfileIds: string[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  passProfile: (profileId: string) => void;
  sendConnectionRequest: (profileId: string) => void;
  markNotificationsAsRead: () => void;
  resetDiscoverQueue: () => void;
  // Matches & Chat methods
  incomingRequests: IncomingRequest[];
  sentRequests: SentRequest[];
  matches: MatchItem[];
  conversations: Record<string, ChatMessage[]>;
  blockedProfileIds: string[];
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  declineAllQuietly: () => void;
  sendChatMessage: (matchId: string, text: string) => void;
  unmatchUser: (matchId: string) => void;
  blockUser: (matchId: string) => void;
  // Elevate Concierge methods
  elevateRequests: ElevateRequest[];
  elevateBookings: ElevateBooking[];
  elevateMessages: ElevateConciergeMessage[];
  submitElevateRequest: (req: Omit<ElevateRequest, 'id' | 'status' | 'createdAt'>) => ElevateRequest;
  sendElevateConciergeMessage: (text: string) => void;
  finalizeBookingProposal: (requestId?: string, serviceId?: string) => ElevateBooking;
  payElevateBooking: (bookingId: string) => void;
  // Mixers methods
  mixerEvents: MixerEvent[];
  mixerBookings: MixerBooking[];
  mixerInterestedEventIds: string[];
  expressMixerInterest: (eventId: string) => void;
  bookMixerTicket: (eventId: string, price: number, priceType: 'member' | 'first_look') => MixerBooking;
}

const STORAGE_KEY = 'inner_circle_auth_state';

const defaultProfile: UserProfile = {
  firstName: '',
  dateOfBirth: '',
  city: '',
  genderIdentity: '',
  selfDescribeGender: '',
  datingPreference: '',
  currentStatus: '',
  designation: '',
  company: '',
  photos: [],
  invitationCode: '',
  introduction: '',
  linkedinUrl: '',
  instagramUsername: '',
};

export const INITIAL_INCOMING_REQUESTS: IncomingRequest[] = [
  {
    id: 'req-meera',
    profileId: 'meera-30',
    name: 'Meera',
    age: 30,
    city: 'PUNE, INDIA',
    designation: 'Corporate Counsel',
    company: 'Shardul Amarchand Mangaldas',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=85',
    isVerified: true,
    timestamp: Date.now() - 3600000 * 3,
  },
  {
    id: 'req-kabir',
    profileId: 'kabir-33',
    name: 'Kabir',
    age: 33,
    city: 'NEW DELHI, INDIA',
    designation: 'Architect',
    company: 'Studio V',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=85',
    isVerified: true,
    timestamp: Date.now() - 3600000 * 7,
  },
];

export const INITIAL_SENT_REQUESTS: SentRequest[] = [
  {
    id: 'sent-rohan',
    profileId: 'rohan-29',
    name: 'Rohan',
    city: 'MUMBAI, INDIA',
    designation: 'Private Equity Associate',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=85',
    status: 'AWAITING REPLY',
    timestamp: Date.now() - 3600000 * 12,
  },
  {
    id: 'sent-ananya',
    profileId: 'ananya-28',
    name: 'Ananya',
    city: 'BENGALURU, INDIA',
    designation: 'Product Design Lead',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85',
    status: 'AWAITING REPLY',
    timestamp: Date.now() - 3600000 * 24,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-request-kabir',
    category: 'REQUEST',
    sourcePage: 'MATCHES',
    title: 'Kabir would like an introduction',
    message: 'Architect · New Delhi, India',
    timestamp: 'Just now',
    isRead: false,
    type: 'request',
    targetRoute: '/member/matches',
  },
  {
    id: 'notif-match-meera',
    category: 'MATCH',
    sourcePage: 'CHAT',
    title: 'You matched with Meera',
    message: "Thank you for accepting — I'm Meera. How has your week been?",
    timestamp: '2h ago',
    isRead: false,
    type: 'match',
    targetRoute: '/member/chat',
  },
  {
    id: 'notif-intros-discover',
    category: 'INTRODUCTIONS',
    sourcePage: 'DISCOVER',
    title: "Today's Curated Introductions",
    message: 'New verified profiles tailored to your preferences are ready.',
    timestamp: '5h ago',
    isRead: false,
    type: 'discover',
    targetRoute: '/discover',
  },
  {
    id: 'notif-membership-you',
    category: 'MEMBERSHIP',
    sourcePage: 'YOU',
    title: 'Circle Membership Active',
    message: 'Your verified credentials and standards are in good standing.',
    timestamp: '1d ago',
    isRead: true,
    type: 'membership',
    targetRoute: '/member/you',
  },
];

export const INITIAL_ELEVATE_BOOKINGS: ElevateBooking[] = [
  {
    id: 'booking-photography-aug',
    serviceId: 'professional-photography',
    serviceName: 'Professional Photography',
    duration: '90 min',
    date: '12 Aug',
    time: '4:00 PM',
    format: 'Studio',
    price: 5000,
    bookingStatus: 'Completed',
    paymentStatus: 'Paid',
    createdAt: Date.now() - 3600000 * 24 * 28,
  },
  {
    id: 'booking-dating-coaching-sep',
    serviceId: 'dating-coaching',
    serviceName: 'Dating Coaching',
    duration: '60 min',
    date: 'Saturday, 26 September',
    time: '6:00 PM',
    format: 'Online',
    price: 3000,
    bookingStatus: 'Awaiting Payment',
    paymentStatus: 'Awaiting Payment',
    createdAt: Date.now() - 3600000 * 6,
  },
];

export const INITIAL_ELEVATE_MESSAGES: ElevateConciergeMessage[] = [
  {
    id: 'msg-team-welcome',
    sender: 'team',
    text: "Welcome to Elevate. We're here to arrange private consultations tailored around your schedule and personal presentation goals. Feel free to share your requirements or questions with our desk anytime.",
    timestamp: Date.now() - 3600000 * 48,
  },
  {
    id: 'msg-team-proposal',
    sender: 'team',
    text: "Regarding your inquiry for Dating Coaching: our team has reserved Saturday, 26 September at 6:00 PM (Online, 60 minutes). You may review the proposal and complete confirmation when ready.",
    timestamp: Date.now() - 3600000 * 6,
  },
];

const defaultState: AuthState = {
  phoneNumber: '',
  countryCode: '+91',
  authMethod: null,
  isAuthenticated: false,
  isPhoneVerified: false,
  appearanceMode: 'ivory',
  profile: defaultProfile,
  incomingRequests: INITIAL_INCOMING_REQUESTS,
  sentRequests: INITIAL_SENT_REQUESTS,
  notifications: INITIAL_NOTIFICATIONS,
  matches: [],
  conversations: {},
  blockedProfileIds: [],
  elevateRequests: [],
  elevateBookings: INITIAL_ELEVATE_BOOKINGS,
  elevateMessages: INITIAL_ELEVATE_MESSAGES,
  mixerEvents: INITIAL_MIXER_EVENTS,
  mixerBookings: INITIAL_PAST_BOOKINGS,
  mixerInterestedEventIds: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const savedAppearance = localStorage.getItem('inner_circle_appearance_mode') as 'ivory' | 'after-dark' | null;
      let parsed: any = null;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          parsed = JSON.parse(saved);
        } catch {}
      }

      // Check resilient applicant backup key
      let backup: any = null;
      try {
        const rawBackup =
          sessionStorage.getItem('inner_circle_active_applicant_data') ||
          localStorage.getItem('inner_circle_active_applicant_data');
        if (rawBackup) {
          backup = JSON.parse(rawBackup);
        }
      } catch {}

      if (parsed || backup) {
        const mergedState = {
          ...defaultState,
          ...(parsed || {}),
          ...(backup || {}),
          profile: {
            ...defaultProfile,
            ...(parsed?.profile || {}),
            ...(backup?.profile || {}),
          },
        };

        // Ensure selfie & identity verified flags and image are explicitly retained
        if (backup?.isIdentityVerified !== undefined) mergedState.isIdentityVerified = backup.isIdentityVerified;
        if (backup?.isSelfieVerified !== undefined) mergedState.isSelfieVerified = backup.isSelfieVerified;
        if (backup?.selfieImage !== undefined) mergedState.selfieImage = backup.selfieImage;

        // Sanitize notifications so that only real notifications for actual app pages (MATCHES, CHAT, DISCOVER, YOU, ELEVATE, MIXERS) are loaded
        const rawNotifs: AppNotification[] = Array.isArray(mergedState.notifications) ? mergedState.notifications : [];
        const sanitizedNotifs = rawNotifs.filter(
          (n) =>
            n &&
            (n.sourcePage === 'MATCHES' || n.sourcePage === 'CHAT' || n.sourcePage === 'DISCOVER' || n.sourcePage === 'YOU' || n.sourcePage === 'ELEVATE' || n.sourcePage === 'MIXERS')
        );

        return {
          ...mergedState,
          incomingRequests: mergedState.incomingRequests !== undefined ? mergedState.incomingRequests : INITIAL_INCOMING_REQUESTS,
          sentRequests: mergedState.sentRequests !== undefined ? mergedState.sentRequests : INITIAL_SENT_REQUESTS,
          notifications: sanitizedNotifs.length > 0 ? sanitizedNotifs : INITIAL_NOTIFICATIONS,
          matches: mergedState.matches !== undefined ? mergedState.matches : [],
          conversations: mergedState.conversations !== undefined ? mergedState.conversations : {},
          blockedProfileIds: mergedState.blockedProfileIds !== undefined ? mergedState.blockedProfileIds : [],
          elevateRequests: mergedState.elevateRequests !== undefined ? mergedState.elevateRequests : [],
          elevateBookings: (mergedState.elevateBookings && mergedState.elevateBookings.length > 0) ? mergedState.elevateBookings : INITIAL_ELEVATE_BOOKINGS,
          elevateMessages: (mergedState.elevateMessages && mergedState.elevateMessages.length > 0) ? mergedState.elevateMessages : INITIAL_ELEVATE_MESSAGES,
          mixerEvents: (mergedState.mixerEvents && mergedState.mixerEvents.length > 0) ? mergedState.mixerEvents : INITIAL_MIXER_EVENTS,
          mixerBookings: (mergedState.mixerBookings && mergedState.mixerBookings.length > 0) ? mergedState.mixerBookings : INITIAL_PAST_BOOKINGS,
          mixerInterestedEventIds: Array.isArray(mergedState.mixerInterestedEventIds) ? mergedState.mixerInterestedEventIds : [],
          appearanceMode: savedAppearance || mergedState.appearanceMode || 'ivory',
        };
      }
      if (savedAppearance) {
        return {
          ...defaultState,
          appearanceMode: savedAppearance,
        };
      }
    } catch {
      // Ignore localStorage read errors
    }
    return defaultState;
  });

  // Ensure any stale elevate or mixer notifications from legacy sessions are purged
  useEffect(() => {
    setState((prev) => {
      const hasStale = (prev.notifications || []).some(
        (n) =>
          n.category === 'MIXER' ||
          n.category === 'ELEVATE' ||
          n.sourcePage === 'MIXERS' ||
          n.sourcePage === 'ELEVATE'
      );
      if (hasStale) {
        const cleaned = (prev.notifications || []).filter(
          (n) =>
            n.category !== 'MIXER' &&
            n.category !== 'ELEVATE' &&
            n.sourcePage !== 'MIXERS' &&
            n.sourcePage !== 'ELEVATE'
        );
        return {
          ...prev,
          notifications: cleaned.length > 0 ? cleaned : INITIAL_NOTIFICATIONS,
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      try {
        // Fallback 1: If localStorage quota is exceeded, preserve state with compressed photos & records
        const sanitized = {
          ...state,
          profile: { ...state.profile, photos: (state.profile.photos || []).slice(0, 3) },
          phoneRecords: {},
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      } catch {
        try {
          // Fallback 2: Light state with essential details preserved
          const minimal = {
            ...state,
            profile: { ...state.profile, photos: (state.profile.photos || []).slice(0, 1) },
            selfieImage: state.selfieImage ? state.selfieImage.slice(0, 1000) : null,
            phoneRecords: {},
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
        } catch {
          // Ignore localStorage write errors safely
        }
      }
    }

    // Always preserve textual profile and verification details in a lightweight independent backup key
    try {
      const textDetailsBackup = {
        phoneNumber: state.phoneNumber,
        countryCode: state.countryCode,
        authMethod: state.authMethod,
        isAuthenticated: state.isAuthenticated,
        isPhoneVerified: state.isPhoneVerified,
        isIdentityVerified: state.isIdentityVerified,
        isSelfieVerified: state.isSelfieVerified,
        selfieImage: state.selfieImage,
        isApplicationSubmitted: state.isApplicationSubmitted,
        isApplicationApproved: state.isApplicationApproved,
        applicationDecision: state.applicationDecision,
        membershipStatus: state.membershipStatus,
        profile: {
          firstName: state.profile.firstName,
          dateOfBirth: state.profile.dateOfBirth,
          city: state.profile.city,
          genderIdentity: state.profile.genderIdentity,
          selfDescribeGender: state.profile.selfDescribeGender,
          datingPreference: state.profile.datingPreference,
          currentStatus: state.profile.currentStatus,
          designation: state.profile.designation,
          company: state.profile.company,
          invitationCode: state.profile.invitationCode,
          introduction: state.profile.introduction,
          linkedinUrl: state.profile.linkedinUrl,
          instagramUsername: state.profile.instagramUsername,
          photos: state.profile.photos || [],
        },
      };
      sessionStorage.setItem('inner_circle_active_applicant_data', JSON.stringify(textDetailsBackup));
      localStorage.setItem('inner_circle_active_applicant_data', JSON.stringify(textDetailsBackup));
    } catch {
      // Ignore
    }
  }, [state]);

  const setPhoneAuth = (newPhoneNumber: string) => {
    setState((prev) => {
      const records = prev.phoneRecords || {};

      // First, save current active state into records for the old phone if one was active
      let updatedRecords = { ...records };
      if (prev.phoneNumber) {
        updatedRecords[prev.phoneNumber] = {
          profile: prev.profile,
          isApplicationSubmitted: prev.isApplicationSubmitted,
          isApplicationApproved: prev.isApplicationApproved,
          applicationDecision: prev.applicationDecision,
          decisionTimestamp: prev.decisionTimestamp,
          isPhoneVerified: prev.isPhoneVerified,
          isIdentityVerified: prev.isIdentityVerified,
          isSelfieVerified: prev.isSelfieVerified,
          selfieImage: prev.selfieImage,
        };
      }

      // Check if this newPhoneNumber already has a record
      const existingRecord = updatedRecords[newPhoneNumber];

      if (existingRecord) {
        // If the number was previously declined, check if 90 days (7,776,000,000 ms) have passed
        let currentDecision = existingRecord.applicationDecision;
        let isApproved = existingRecord.isApplicationApproved;
        let isSubmitted = existingRecord.isApplicationSubmitted;
        let userProfile = existingRecord.profile;

        if (currentDecision === 'declined' && existingRecord.decisionTimestamp) {
          const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
          const timeSinceDecline = Date.now() - existingRecord.decisionTimestamp;
          if (timeSinceDecline >= ninetyDaysMs) {
            // 90 days have elapsed: cooldown expired! Reset decision to allow fresh review
            currentDecision = null;
            isApproved = false;
            isSubmitted = false;
            // Clear or reset profile for re-application
            updatedRecords[newPhoneNumber] = {
              ...existingRecord,
              applicationDecision: null,
              isApplicationApproved: false,
              isApplicationSubmitted: false,
              decisionTimestamp: null,
            };
          }
        }

        return {
          ...prev,
          phoneNumber: newPhoneNumber,
          countryCode: '+91',
          authMethod: 'phone',
          isAuthenticated: false,
          isPhoneVerified: false,
          isIdentityVerified: existingRecord.isIdentityVerified || false,
          isSelfieVerified: existingRecord.isSelfieVerified || false,
          selfieImage: existingRecord.selfieImage || null,
          isApplicationSubmitted: isSubmitted || false,
          isApplicationApproved: isApproved || false,
          applicationDecision: currentDecision || null,
          decisionTimestamp: existingRecord.decisionTimestamp || null,
          profile: userProfile || { ...defaultProfile },
          phoneRecords: updatedRecords,
        };
      }

      // NEW NUMBER: completely brand-new applicant with clean state and clean profile!
      return {
        ...prev,
        phoneNumber: newPhoneNumber,
        countryCode: '+91',
        authMethod: 'phone',
        isAuthenticated: false,
        isPhoneVerified: false,
        isIdentityVerified: false,
        isSelfieVerified: false,
        selfieImage: null,
        isApplicationSubmitted: false,
        isApplicationApproved: false,
        applicationDecision: null,
        decisionTimestamp: null,
        profile: { ...defaultProfile },
        phoneRecords: updatedRecords,
      };
    });
  };

  const setGoogleAuth = (googleUser?: AuthState['googleUser']) => {
    setState((prev) => ({
      ...prev,
      authMethod: 'google',
      isAuthenticated: true,
      isPhoneVerified: true,
      googleUser,
      profile: {
        ...prev.profile,
        firstName: prev.profile.firstName || googleUser?.name?.split(' ')[0] || '',
      },
    }));
  };

  const setAppleAuth = () => {
    setState((prev) => ({
      ...prev,
      authMethod: 'apple',
      isAuthenticated: true,
      isPhoneVerified: true,
    }));
  };

  const setPhoneVerified = (verified: boolean) => {
    setState((prev) => ({
      ...prev,
      isPhoneVerified: verified,
      isAuthenticated: verified,
    }));
  };

  const setIdentityVerified = (verified: boolean) => {
    setState((prev) => {
      const next = {
        ...prev,
        isIdentityVerified: verified,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          isIdentityVerified: verified,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const setSelfieVerified = (verified: boolean, selfieImage: string | null = null) => {
    setState((prev) => {
      const next = {
        ...prev,
        isSelfieVerified: verified,
        selfieImage: selfieImage !== undefined ? selfieImage : prev.selfieImage,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          isSelfieVerified: verified,
          selfieImage: selfieImage !== undefined ? selfieImage : prev.selfieImage,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const setApplicationSubmitted = (submitted: boolean) => {
    setState((prev) => {
      const next = {
        ...prev,
        isApplicationSubmitted: submitted,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          isApplicationSubmitted: submitted,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const setApplicationApproved = (approved: boolean) => {
    setState((prev) => {
      const now = Date.now();
      const decision: 'approved' | null = approved ? 'approved' : null;
      const next = {
        ...prev,
        isApplicationApproved: approved,
        applicationDecision: decision,
        decisionTimestamp: now,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          isApplicationApproved: approved,
          applicationDecision: decision,
          decisionTimestamp: now,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const setApplicationDecision = (decision: 'approved' | 'declined' | 'more_info' | null) => {
    setState((prev) => {
      const now = Date.now();
      const isApproved = decision === 'approved';
      const next = {
        ...prev,
        applicationDecision: decision,
        isApplicationApproved: isApproved,
        decisionTimestamp: now,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          applicationDecision: decision,
          isApplicationApproved: isApproved,
          decisionTimestamp: now,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  // Simulates 90 days having passed for testing the cooldown expiration
  const simulate90DaysPassed = () => {
    setState((prev) => {
      const pastTimestamp = Date.now() - (91 * 24 * 60 * 60 * 1000);
      const next = {
        ...prev,
        applicationDecision: null,
        isApplicationApproved: false,
        isApplicationSubmitted: false,
        decisionTimestamp: pastTimestamp,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        if (records[prev.phoneNumber]) {
          records[prev.phoneNumber] = {
            ...records[prev.phoneNumber],
            applicationDecision: null,
            isApplicationApproved: false,
            isApplicationSubmitted: false,
            decisionTimestamp: pastTimestamp,
          };
        }
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const setMembershipStatus = (status: 'none' | 'member' | 'complimentary') => {
    setState((prev) => {
      const next = {
        ...prev,
        membershipStatus: status,
        complimentaryExpiredOverride: false,
        isAuthenticated: true,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          membershipStatus: status,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const startComplimentaryFirstLook = () => {
    setState((prev) => {
      const now = Date.now();
      const next = {
        ...prev,
        membershipStatus: 'complimentary' as const,
        complimentaryStartDate: now,
        complimentaryExpiredOverride: false,
        isAuthenticated: true,
        passedProfileIds: [],
        sentRequestProfileIds: [],
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || { profile: prev.profile }),
          membershipStatus: 'complimentary',
          complimentaryStartDate: now,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const expireTrialForTesting = () => {
    setState((prev) => ({
      ...prev,
      membershipStatus: 'complimentary',
      complimentaryExpiredOverride: true,
      complimentaryStartDate: Date.now() - (25 * 60 * 60 * 1000),
    }));
  };

  const resetTrialForTesting = () => {
    setState((prev) => ({
      ...prev,
      membershipStatus: 'complimentary',
      complimentaryExpiredOverride: false,
      complimentaryStartDate: Date.now(),
      passedProfileIds: [],
      sentRequestProfileIds: [],
    }));
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    setState((prev) => {
      const updatedProfile = {
        ...prev.profile,
        ...profileUpdates,
      };
      const next = {
        ...prev,
        profile: updatedProfile,
      };
      if (prev.phoneNumber) {
        const records = { ...(prev.phoneRecords || {}) };
        records[prev.phoneNumber] = {
          ...(records[prev.phoneNumber] || {}),
          profile: updatedProfile,
        };
        next.phoneRecords = records;
      }
      return next;
    });
  };

  const notificationsList = state.notifications && state.notifications.length > 0 
    ? state.notifications 
    : INITIAL_NOTIFICATIONS;

  const passedProfileIds = state.passedProfileIds || [];
  const sentRequestProfileIds = state.sentRequestProfileIds || [];
  const incomingRequests = state.incomingRequests !== undefined ? state.incomingRequests : INITIAL_INCOMING_REQUESTS;
  const sentRequests = state.sentRequests !== undefined ? state.sentRequests : INITIAL_SENT_REQUESTS;
  const matches = state.matches || [];
  const conversations = state.conversations || {};
  const blockedProfileIds = state.blockedProfileIds || [];

  const unreadNotificationsCount = notificationsList.filter((n) => !n.isRead).length;

  const isMember = state.membershipStatus === 'member';
  const isComplimentary = state.membershipStatus === 'complimentary';

  // 24 hours in milliseconds
  const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;
  const isTrialExpired = Boolean(
    isComplimentary &&
    (state.complimentaryExpiredOverride === true ||
      (state.complimentaryStartDate && Date.now() - state.complimentaryStartDate > TRIAL_DURATION_MS))
  );

  const maxComplimentaryProfiles = 20;
  const maxComplimentaryRequests = 5;

  const totalBrowsed = passedProfileIds.length + sentRequestProfileIds.length;
  const complimentaryProfilesRemaining = isMember
    ? 999
    : Math.max(0, maxComplimentaryProfiles - totalBrowsed);

  const complimentaryRequestsRemaining = isMember
    ? 999
    : Math.max(0, maxComplimentaryRequests - sentRequestProfileIds.length);

  const canDiscoverMore = isMember || (!isTrialExpired && complimentaryProfilesRemaining > 0);
  const canSendMoreRequests = isMember || (!isTrialExpired && complimentaryRequestsRemaining > 0);

  const passProfile = (profileId: string) => {
    if (!isMember && (isTrialExpired || complimentaryProfilesRemaining <= 0)) {
      return;
    }
    setState((prev) => {
      const alreadyPassed = prev.passedProfileIds || [];
      if (alreadyPassed.includes(profileId)) return prev;
      return {
        ...prev,
        passedProfileIds: [...alreadyPassed, profileId],
      };
    });
  };

  const sendConnectionRequest = (profileId: string) => {
    if (!isMember && (isTrialExpired || complimentaryRequestsRemaining <= 0)) {
      return;
    }
    setState((prev) => {
      const alreadySent = prev.sentRequestProfileIds || [];
      if (alreadySent.includes(profileId)) return prev;
      const nextSent = [...alreadySent, profileId];

      const targetProfile = DUMMY_DISCOVER_PROFILES.find((p) => p.id === profileId);
      const newSentReq: SentRequest = {
        id: `sent-${Date.now()}-${profileId}`,
        profileId,
        name: targetProfile ? targetProfile.firstName : 'Member',
        city: targetProfile ? targetProfile.city.toUpperCase() : 'INDIA',
        designation: targetProfile ? targetProfile.designation : undefined,
        photo: targetProfile ? targetProfile.photos[0] : undefined,
        status: 'AWAITING REPLY',
        timestamp: Date.now(),
      };
      const currentSentList = prev.sentRequests !== undefined ? prev.sentRequests : INITIAL_SENT_REQUESTS;
      const nextSentRequests = [newSentReq, ...currentSentList];

      const newNotif: AppNotification = {
        id: `notif-req-${Date.now()}`,
        category: 'REQUEST',
        sourcePage: 'MATCHES',
        title: targetProfile
          ? `Introduction request sent to ${targetProfile.firstName}`
          : 'Connection Request Sent',
        message: targetProfile
          ? `${targetProfile.designation} · ${targetProfile.city}`
          : 'Your introduction request has been delivered privately.',
        timestamp: 'Just now',
        isRead: false,
        type: 'request',
        targetRoute: '/member/matches',
      };
      const currentList = prev.notifications && prev.notifications.length > 0 
        ? prev.notifications 
        : INITIAL_NOTIFICATIONS;
      return {
        ...prev,
        sentRequestProfileIds: nextSent,
        sentRequests: nextSentRequests,
        notifications: [newNotif, ...currentList],
      };
    });
  };

  const acceptRequest = (requestId: string) => {
    setState((prev) => {
      const currentReqs = prev.incomingRequests !== undefined ? prev.incomingRequests : INITIAL_INCOMING_REQUESTS;
      const targetReq = currentReqs.find((r) => r.id === requestId);
      if (!targetReq) return prev;

      const nextReqs = currentReqs.filter((r) => r.id !== requestId);
      const newMatchId = `match-${targetReq.profileId}`;

      const openingText = targetReq.name === 'Meera'
        ? "Thank you for accepting — I'm Meera. How has your week been?"
        : `Hello! Happy to connect with you on Inner Circle.`;

      const newMatch: MatchItem = {
        id: newMatchId,
        profileId: targetReq.profileId,
        name: targetReq.name,
        age: targetReq.age,
        city: targetReq.city,
        designation: targetReq.designation,
        company: targetReq.company,
        photo: targetReq.photo,
        isVerified: targetReq.isVerified,
        matchedAt: Date.now(),
        lastMessage: openingText,
        lastMessageTime: Date.now(),
      };

      const openingMsg: ChatMessage = {
        id: `msg-open-${Date.now()}`,
        senderId: targetReq.profileId,
        text: openingText,
        timestamp: Date.now(),
      };

      const existingConversations = prev.conversations || {};
      const currentMsgs = existingConversations[newMatchId] || [];

      const matchNotif: AppNotification = {
        id: `notif-match-${Date.now()}`,
        category: 'MATCH',
        sourcePage: 'CHAT',
        title: `You matched with ${targetReq.name}`,
        message: openingText,
        timestamp: 'Just now',
        isRead: false,
        type: 'match',
        targetRoute: '/member/chat',
      };

      const currentList = prev.notifications && prev.notifications.length > 0 
        ? prev.notifications 
        : INITIAL_NOTIFICATIONS;

      return {
        ...prev,
        incomingRequests: nextReqs,
        matches: [newMatch, ...(prev.matches || [])],
        conversations: {
          ...existingConversations,
          [newMatchId]: currentMsgs.length > 0 ? currentMsgs : [openingMsg],
        },
        notifications: [matchNotif, ...currentList],
      };
    });
  };

  const declineRequest = (requestId: string) => {
    setState((prev) => {
      const currentReqs = prev.incomingRequests !== undefined ? prev.incomingRequests : INITIAL_INCOMING_REQUESTS;
      return {
        ...prev,
        incomingRequests: currentReqs.filter((r) => r.id !== requestId),
      };
    });
  };

  const declineAllQuietly = () => {
    setState((prev) => ({
      ...prev,
      incomingRequests: [],
    }));
  };

  const sendChatMessage = (matchId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => {
      const currentConversations = prev.conversations || {};
      const msgs = currentConversations[matchId] || [];
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: 'me',
        text: trimmed,
        timestamp: Date.now(),
      };
      const updatedMatches = (prev.matches || []).map((m) =>
        m.id === matchId
          ? { ...m, lastMessage: trimmed, lastMessageTime: Date.now() }
          : m
      );
      return {
        ...prev,
        conversations: {
          ...currentConversations,
          [matchId]: [...msgs, newMsg],
        },
        matches: updatedMatches,
      };
    });
  };

  const unmatchUser = (matchId: string) => {
    setState((prev) => {
      const nextMatches = (prev.matches || []).filter((m) => m.id !== matchId);
      const nextConversations = { ...(prev.conversations || {}) };
      delete nextConversations[matchId];
      return {
        ...prev,
        matches: nextMatches,
        conversations: nextConversations,
      };
    });
  };

  const blockUser = (matchId: string) => {
    setState((prev) => {
      const targetMatch = (prev.matches || []).find((m) => m.id === matchId);
      const blockedProfileId = targetMatch ? targetMatch.profileId : matchId;
      const nextBlocked = [...(prev.blockedProfileIds || []), blockedProfileId];
      const nextMatches = (prev.matches || []).filter((m) => m.id !== matchId);
      const currentReqs = prev.incomingRequests !== undefined ? prev.incomingRequests : INITIAL_INCOMING_REQUESTS;
      const currentSent = prev.sentRequests !== undefined ? prev.sentRequests : INITIAL_SENT_REQUESTS;
      const nextRequests = currentReqs.filter((r) => r.profileId !== blockedProfileId);
      const nextSent = currentSent.filter((s) => s.profileId !== blockedProfileId);
      const nextConversations = { ...(prev.conversations || {}) };
      delete nextConversations[matchId];
      return {
        ...prev,
        blockedProfileIds: nextBlocked,
        matches: nextMatches,
        incomingRequests: nextRequests,
        sentRequests: nextSent,
        conversations: nextConversations,
      };
    });
  };

  const markNotificationsAsRead = () => {
    setState((prev) => {
      const currentList = prev.notifications && prev.notifications.length > 0 
        ? prev.notifications 
        : INITIAL_NOTIFICATIONS;
      return {
        ...prev,
        notifications: currentList.map((n: AppNotification) => ({ ...n, isRead: true })),
      };
    });
  };

  const resetDiscoverQueue = () => {
    setState((prev) => ({
      ...prev,
      passedProfileIds: [],
      sentRequestProfileIds: [],
    }));
  };

  const setAppearanceMode = (mode: 'ivory' | 'after-dark') => {
    setState((prev) => ({
      ...prev,
      appearanceMode: mode,
    }));
    try {
      localStorage.setItem('inner_circle_appearance_mode', mode);
    } catch {
      // Ignore
    }
  };

  const resetAuth = () => {
    setState(defaultState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const submitElevateRequest = (
    reqData: Omit<ElevateRequest, 'id' | 'status' | 'createdAt'>
  ): ElevateRequest => {
    const newRequest: ElevateRequest = {
      ...reqData,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'request_received',
      createdAt: Date.now(),
    };

    const teamAckMsg: ElevateConciergeMessage = {
      id: `msg-ack-${Date.now()}`,
      sender: 'team',
      text: `Thanks for getting in touch. We've received your consultation request for ${reqData.serviceName}. Our Elevate team will review your notes and availability (${reqData.availability}${reqData.preferredDate ? `, preferred: ${reqData.preferredDate}` : ''}) and get back to you shortly to understand your requirements and arrange a suitable session.`,
      timestamp: Date.now(),
    };

    const newNotif: AppNotification = {
      id: `notif-elevate-${Date.now()}`,
      category: 'REQUEST',
      sourcePage: 'ELEVATE',
      title: `Consultation request: ${reqData.serviceName}`,
      message: 'The Elevate team is reviewing your availability and requirements.',
      timestamp: 'Just now',
      isRead: false,
      type: 'request',
      targetRoute: '/member/elevate',
    };

    setState((prev) => {
      const currentReqs = prev.elevateRequests || [];
      const currentMsgs = prev.elevateMessages || [];
      const currentNotifs = prev.notifications || [];
      return {
        ...prev,
        elevateRequests: [newRequest, ...currentReqs],
        elevateMessages: [...currentMsgs, teamAckMsg],
        notifications: [newNotif, ...currentNotifs],
      };
    });

    return newRequest;
  };

  const sendElevateConciergeMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: ElevateConciergeMessage = {
      id: `msg-member-${Date.now()}`,
      sender: 'member',
      text: trimmed,
      timestamp: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      elevateMessages: [...(prev.elevateMessages || []), newMsg],
    }));
  };

  const finalizeBookingProposal = (requestId?: string, serviceId?: string): ElevateBooking => {
    const now = Date.now();
    const serviceName = serviceId
      ? serviceId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Dating Coaching';

    const newBooking: ElevateBooking = {
      id: `booking-${now}-${Math.random().toString(36).substring(2, 6)}`,
      serviceId: serviceId || 'dating-coaching',
      serviceName: serviceName,
      duration: '60 min',
      date: 'Saturday, 26 September',
      time: '6:00 PM',
      format: 'Online',
      price: serviceId === 'professional-photography' ? 5000 : serviceId === 'style-grooming' ? 4000 : 3000,
      bookingStatus: 'Awaiting Payment',
      paymentStatus: 'Awaiting Payment',
      requestId,
      createdAt: now,
    };

    const teamProposalMsg: ElevateConciergeMessage = {
      id: `msg-prop-${now}`,
      sender: 'team',
      text: `We have finalized your session details for ${newBooking.serviceName}: ${newBooking.date} at ${newBooking.time} (${newBooking.format}, ${newBooking.duration}). Total fee is ₹${newBooking.price.toLocaleString('en-IN')}. Please tap below to review and confirm your booking.`,
      timestamp: now,
      proposedBooking: newBooking,
    };

    setState((prev) => {
      const currentBookings = prev.elevateBookings || [];
      const currentMsgs = prev.elevateMessages || [];
      const updatedReqs = (prev.elevateRequests || []).map((r) =>
        r.id === requestId ? { ...r, status: 'scheduling' as const } : r
      );
      return {
        ...prev,
        elevateRequests: updatedReqs,
        elevateBookings: [newBooking, ...currentBookings],
        elevateMessages: [...currentMsgs, teamProposalMsg],
      };
    });

    return newBooking;
  };

  const payElevateBooking = (bookingId: string) => {
    setState((prev) => {
      const currentBookings = prev.elevateBookings || [];
      const targetBooking = currentBookings.find((b) => b.id === bookingId);
      if (!targetBooking) return prev;

      const updatedBookings: ElevateBooking[] = currentBookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              bookingStatus: 'Confirmed' as const,
              paymentStatus: 'Paid' as const,
            }
          : b
      );

      const teamReceiptMsg: ElevateConciergeMessage = {
        id: `msg-paid-${Date.now()}`,
        sender: 'team',
        text: `Payment of ₹${targetBooking.price.toLocaleString('en-IN')} confirmed. Your ${targetBooking.serviceName} session on ${targetBooking.date} at ${targetBooking.time} is officially confirmed. Our team will send calendar invites and pre-session notes prior to the meeting.`,
        timestamp: Date.now(),
      };

      const paidNotif: AppNotification = {
        id: `notif-paid-${Date.now()}`,
        category: 'ELEVATE',
        sourcePage: 'ELEVATE',
        title: `Session Confirmed: ${targetBooking.serviceName}`,
        message: `${targetBooking.date} · ${targetBooking.time} · Payment Verified`,
        timestamp: 'Just now',
        isRead: false,
        type: 'discover',
        targetRoute: '/member/elevate',
      };

      return {
        ...prev,
        elevateBookings: updatedBookings,
        elevateMessages: [...(prev.elevateMessages || []), teamReceiptMsg],
        notifications: [paidNotif, ...(prev.notifications || [])],
      };
    });
  };

  const expressMixerInterest = (eventId: string) => {
    setState((prev) => {
      const currentInterested = prev.mixerInterestedEventIds || [];
      if (currentInterested.includes(eventId)) {
        return prev;
      }
      const allEvents = prev.mixerEvents || INITIAL_MIXER_EVENTS;
      const targetEvent = allEvents.find((e) => e.id === eventId);
      const updatedInterested = [...currentInterested, eventId];

      const notif: AppNotification = {
        id: `notif-interest-${Date.now()}`,
        category: 'MIXERS',
        sourcePage: 'MIXERS',
        title: `Interest Confirmed: ${targetEvent ? targetEvent.eventName : 'Mixer Event'}`,
        message: "You're on the interest list. We'll let you know when this Mixer is finalized.",
        timestamp: 'Just now',
        isRead: false,
        type: 'discover',
        targetRoute: '/member/mixers',
      };

      return {
        ...prev,
        mixerInterestedEventIds: updatedInterested,
        notifications: [notif, ...(prev.notifications || [])],
      };
    });
  };

  const bookMixerTicket = (
    eventId: string,
    price: number,
    priceType: 'member' | 'first_look'
  ): MixerBooking => {
    const allEvents = state.mixerEvents || INITIAL_MIXER_EVENTS;
    const targetEvent = allEvents.find((e) => e.id === eventId) || allEvents[0];
    const bookingId = `TIC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: MixerBooking = {
      id: bookingId,
      eventId: targetEvent.id,
      eventName: targetEvent.eventName,
      image: targetEvent.image,
      date: targetEvent.date,
      startTime: targetEvent.startTime,
      endTime: targetEvent.endTime,
      city: targetEvent.city,
      area: targetEvent.area,
      venue: targetEvent.venue,
      amountPaid: price,
      paidPriceType: priceType,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      bookedAt: Date.now(),
    };

    setState((prev) => {
      const prevBookings = prev.mixerBookings || [];
      const updatedBookings = [newBooking, ...prevBookings];

      // Update spots available on the event
      const updatedEvents = (prev.mixerEvents || INITIAL_MIXER_EVENTS).map((ev) => {
        if (ev.id === eventId) {
          const nextSpots = Math.max(0, ev.spotsAvailable - 1);
          return {
            ...ev,
            spotsAvailable: nextSpots,
            status: nextSpots === 0 ? ('SOLD OUT' as const) : ev.status,
          };
        }
        return ev;
      });

      const bookNotif: AppNotification = {
        id: `notif-book-${Date.now()}`,
        category: 'MIXERS',
        sourcePage: 'MIXERS',
        title: `Booking Confirmed: ${targetEvent.eventName}`,
        message: `${targetEvent.date} · ${targetEvent.startTime} · Pass ID ${bookingId}`,
        timestamp: 'Just now',
        isRead: false,
        type: 'discover',
        targetRoute: '/member/mixers',
      };

      return {
        ...prev,
        mixerBookings: updatedBookings,
        mixerEvents: updatedEvents,
        notifications: [bookNotif, ...(prev.notifications || [])],
      };
    });

    return newBooking;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        appearanceMode: state.appearanceMode || 'ivory',
        setAppearanceMode,
        setPhoneAuth,
        setGoogleAuth,
        setAppleAuth,
        setPhoneVerified,
        setIdentityVerified,
        setSelfieVerified,
        setApplicationSubmitted,
        setApplicationApproved,
        setApplicationDecision,
        isComplimentary,
        isMember,
        isTrialExpired,
        complimentaryProfilesRemaining,
        complimentaryRequestsRemaining,
        maxComplimentaryProfiles,
        maxComplimentaryRequests,
        canDiscoverMore,
        canSendMoreRequests,
        expireTrialForTesting,
        resetTrialForTesting,
        setMembershipStatus,
        startComplimentaryFirstLook,
        simulate90DaysPassed,
        updateProfile,
        resetAuth,
        passedProfileIds,
        sentRequestProfileIds,
        notifications: notificationsList,
        unreadNotificationsCount,
        passProfile,
        sendConnectionRequest,
        markNotificationsAsRead,
        resetDiscoverQueue,
        // Matches & Chat
        incomingRequests,
        sentRequests,
        matches,
        conversations,
        blockedProfileIds,
        acceptRequest,
        declineRequest,
        declineAllQuietly,
        sendChatMessage,
        unmatchUser,
        blockUser,
        // Elevate
        elevateRequests: state.elevateRequests || [],
        elevateBookings: state.elevateBookings || INITIAL_ELEVATE_BOOKINGS,
        elevateMessages: state.elevateMessages || INITIAL_ELEVATE_MESSAGES,
        submitElevateRequest,
        sendElevateConciergeMessage,
        finalizeBookingProposal,
        payElevateBooking,
        // Mixers
        mixerEvents: state.mixerEvents || INITIAL_MIXER_EVENTS,
        mixerBookings: state.mixerBookings || INITIAL_PAST_BOOKINGS,
        mixerInterestedEventIds: state.mixerInterestedEventIds || [],
        expressMixerInterest,
        bookMixerTicket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
