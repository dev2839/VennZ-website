/**
 * VennZ BlindDate Domain Models
 * 
 * Formal domain models representing the curated BlindDate recommendation system.
 * Designed with a strict boundary between public preview data and authenticated
 * mutual connection data.
 */

export type RecommendationStatus =
  | 'pending'           // Curated recommendation is available and awaiting user decision
  | 'accepted_waiting'  // User has accepted; awaiting candidate's reciprocal response
  | 'rejected'          // User has rejected recommendation; hidden from queue
  | 'mutual'            // Mutual connection confirmed; full profile unlocked
  | 'expired';          // Recommendation timed out without response

export type UserDecision = 'accept' | 'reject';

/**
 * Public preview fields permitted before mutual consent.
 * Strictly conceals private contact data, exact surname/legal credentials,
 * unapproved personal albums, and social links.
 */
export interface PublicProfilePreview {
  profileId: string;
  displayName: string;
  age: number;
  city: string;
  designation: string;
  company?: string;
  education?: string;
  gender: 'woman' | 'man' | 'other';
  previewPhoto: string;
  photos: string[];
  introduction: string;
  introductionSnippet: string;
  interests: string[];
  vibes: string[];
  isVerified: boolean;
  curationHighlight?: string; // Editorial highlight: e.g. "Shared affinity for Architecture & Coffee"
  careerAndEducation?: {
    role: string;
    company: string;
    education: string;
  };
  datingPreference?: string;
  currentStatus?: string;
  photoPrompts?: {
    photoIndex: number;
    title: string;
    subtitle?: string;
    content: string;
    tags?: string[];
  }[];
  quirks?: string[];
  weekendRitual?: string;
  activeStatus?: string;
}

/**
 * Complete profile unlocked strictly upon mutual acceptance.
 */
export interface FullProfile {
  id: string;
  firstName: string;
  age: number;
  city: string;
  designation: string;
  company?: string;
  gender: 'woman' | 'man' | 'other';
  photos: string[];
  introduction: string;
  interests: string[];
  vibes: string[];
  isVerified: boolean;
  datingPreference?: string;
  currentStatus?: string;
  linkedinUrl?: string;
  instagramUsername?: string;
  showLinkedinPublicly?: boolean;
  showInstagramPublicly?: boolean;
}

/**
 * Recommendation instance assigned to a member.
 */
export interface Recommendation {
  id: string;                      // Stable recommendation ID (e.g. "rec-2026-ananya-28")
  candidateProfileId: string;      // ID of candidate member
  preview: PublicProfilePreview;   // Privacy-safe preview
  status: RecommendationStatus;    // Current lifecycle state
  createdAt: number;               // Recommendation issuance timestamp
  expiresAt: number;               // Expiration timestamp
  mutualAt?: number;               // Timestamp when mutual acceptance was confirmed
  candidateHasAccepted?: boolean;  // Whether candidate has already reciprocated
  userDecision?: UserDecision;     // User's recorded decision
  decisionTimestamp?: number;      // When decision was submitted
}

/**
 * Confirmed mutual connection entity.
 */
export interface MutualConnection {
  recommendationId: string;
  candidateProfileId: string;
  candidateName: string;
  candidatePhoto: string;
  connectedAt: number;
  chatConversationId?: string;
  fullProfile: FullProfile;
}

/**
 * Typed domain error.
 */
export interface RecommendationError {
  code:
    | 'NETWORK_ERROR'
    | 'NOT_FOUND'
    | 'ALREADY_DECIDED'
    | 'EXPIRED'
    | 'SUBMISSION_FAILED'
    | 'UNAUTHORIZED';
  message: string;
  retryable: boolean;
}
