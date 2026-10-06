export type ElevateServiceCategory =
  | 'profile-intelligence'
  | 'profile-makeover'
  | 'conversation-audit'
  | 'video-review'
  | 'consultation';

export interface ElevateService {
  id: string;
  number: string; // '01', '02', etc.
  category: ElevateServiceCategory;
  name: string;
  tagline: string;
  description: string;
  helpsWith: string[];
  format: string; // e.g. 'Dynamic Scorecard', 'Editorial Report', 'Encrypted Audio/Video'
  typicalDuration: string; // e.g. 'Instant Telemetry', '48-hour Editorial Turnaround'
  startingPrice: number; // e.g. 1999, 3499
  isOptionalAddon?: boolean;
  privacyAccessScope: string; // Describes strict least-privilege staff access
}

export type ElevateOrderStatus =
  | 'ordered'
  | 'assigned'
  | 'in_review'
  | 'deliverable_ready'
  | 'completed'
  | 'refund_requested'
  | 'refunded';

export type ReviewerAccessScope =
  | 'intelligence_metrics_only'
  | 'profile_presentation_only'
  | 'anonymized_conversations_only'
  | 'video_editorial_only';

export interface ElevateReviewerAccess {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string; // e.g. 'Senior Editorial Director', 'VennZ Data Intelligence Lead'
  accessScope: ReviewerAccessScope;
  accessStatus: 'active' | 'revoked' | 'expired';
  grantedAt: number;
  lastAccessedAt?: number;
}

export interface ProfileIntelligenceScorecard {
  viewsTotal: number;
  viewsUnique: number;
  requestsReceived: number;
  requestsSent: number;
  matchesMutual: number;
  viewToRequestRate: number; // e.g. 13.5 (%)
  requestToMatchRate: number; // e.g. 46.2 (%)
  responseRate: number; // e.g. 91.5 (%)
  averageReplyTimeMinutes: number; // e.g. 35 mins
  cohortPercentile: number; // e.g. 88 (top 12%)
  performanceTimeline: {
    week: string;
    views: number;
    requests: number;
    matches: number;
  }[];
  conversionFunnels: {
    stage: string;
    count: number;
    conversionPercent: number;
  }[];
  keyTakeaways: string[];
}

export interface ProfileMakeoverPillar {
  name: string;
  score: number; // 1-10
  currentAssessment: string;
  recommendation: string;
}

export interface ProfileMakeoverReport {
  overallScore: number;
  pillars: {
    photos: ProfileMakeoverPillar;
    bio: ProfileMakeoverPillar;
    interestsAndVibe: ProfileMakeoverPillar;
    careerAndWork: ProfileMakeoverPillar;
    firstImpression: ProfileMakeoverPillar;
  };
  beforeAfterComparison: {
    area: string;
    before: string;
    after: string;
    rationale: string;
  }[];
  suggestedBioDraft: string;
  recommendedPhotoSequence: string[];
}

export interface ConversationAuditReport {
  isConfigured: boolean;
  memberConsentGiven: boolean;
  conversationsAnalyzedCount: number;
  partnerDataRedacted: boolean;
  cadenceScore: number; // out of 100
  momentumScore: number; // out of 100
  questionBalanceRatio: string; // e.g. '51% member / 49% match'
  invitationTimingInsight: string;
  keyRecommendations: string[];
}

export interface ElevateDeliverable {
  title: string;
  summary: string;
  deliveredAt: number;
  scorecard?: ProfileIntelligenceScorecard;
  makeover?: ProfileMakeoverReport;
  conversationAudit?: ConversationAuditReport;
  videoReviewUrl?: string;
  notesFromReviewer?: string;
}

export interface ElevateRefundState {
  status: 'none' | 'eligible' | 'requested' | 'processed' | 'declined';
  requestedAt?: number;
  processedAt?: number;
  reason?: string;
  refundAmount?: number;
}

export interface ElevateOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ElevateServiceCategory;
  price: number;
  status: ElevateOrderStatus;
  createdAt: number;
  updatedAt: number;
  reviewerAccess: ElevateReviewerAccess;
  deliverable?: ElevateDeliverable;
  refundState: ElevateRefundState;
  addVideoReview?: boolean;
  conversationAuditConsent?: boolean;
}

export type ElevateRequestStatus = 'request_received' | 'reviewing' | 'scheduling';

export interface ElevateRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  helpRequired: string;
  availability: 'Morning' | 'Afternoon' | 'Evening' | 'Weekend' | 'Flexible';
  preferredDate?: string;
  notes?: string;
  status: ElevateRequestStatus;
  createdAt: number;
}

export type BookingStatus =
  | 'Request Received'
  | 'Reviewing'
  | 'Scheduling'
  | 'Awaiting Payment'
  | 'Confirmed'
  | 'Completed';

export type PaymentStatus = 'Awaiting Payment' | 'Paid';

export interface ElevateBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  duration: string;
  date: string;
  time: string;
  format: string;
  price: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  requestId?: string;
  createdAt: number;
}

export interface ElevateConciergeMessage {
  id: string;
  sender: 'member' | 'team';
  text: string;
  timestamp: number;
  proposedBooking?: ElevateBooking;
  orderReferenceId?: string;
}
