/**
 * VennZ Mock BlindDate Recommendation Provider
 *
 * Implements the BlindDateService interface using deterministic, structured
 * mock data sourced from curated member profiles.
 *
 * FUTURE INTEGRATION NOTES:
 * 1. Database Integration:
 *    - Replace localStorage reads/writes with API calls to `GET /api/v1/blinddate/recommendation`
 *      and `POST /api/v1/blinddate/decision`.
 *    - The backend database will authoritatively maintain user decisions, expiration TTLs,
 *      and mutual match validation.
 * 2. Machine Learning Model Integration:
 *    - The future ML recommendation service will score candidates based on consented profile
 *      attributes, behavioral affinities, conversational pacing, and historical outcomes.
 *    - The endpoint will deliver a recommendation payload directly conforming to `Recommendation`.
 *    - The UI layer will require ZERO changes when the ML pipeline goes live.
 */

import type { BlindDateService } from './blindDateService';
import type {
  Recommendation,
  RecommendationStatus,
  MutualConnection,
  FullProfile,
  PublicProfilePreview,
} from '../types/blindDate';
import { DUMMY_DISCOVER_PROFILES } from '../data/dummyProfiles';
import type { DiscoverProfile } from '../types/discover';

interface StoredBlindDateState {
  decisions: Record<string, { decision: 'accept' | 'reject'; timestamp: number }>;
  activeRecommendationId: string | null;
  mutualConnectionIds: string[];
}

const STORAGE_KEY = 'vennz_blinddate_state_v2';

export class MockBlindDateProvider implements BlindDateService {
  private inMemoryFallback: StoredBlindDateState = {
    decisions: {},
    activeRecommendationId: null,
    mutualConnectionIds: [],
  };

  private getStorage(): StoredBlindDateState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Local storage unavailable; fallback to memory
    }
    return this.inMemoryFallback;
  }

  private setStorage(state: StoredBlindDateState): void {
    this.inMemoryFallback = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota or disabled errors
    }
  }

  /**
   * Helper: Maps a DiscoverProfile to a privacy-safe PublicProfilePreview.
   * Strictly conceals private contact data and unverified identifiers.
   */
  private mapToPreview(profile: DiscoverProfile): PublicProfilePreview {
    // Generate intelligent curation highlight based on interests & vibe
    const firstInterests = (profile.interests || []).slice(0, 2).join(' & ');
    const highlight = firstInterests
      ? `Shared affinity for ${firstInterests}`
      : 'Curated for values & lifestyle alignment';

    // Extract first sentence for safe introduction snippet
    const rawIntro = profile.introduction || 'Ambitious, intentional, and curated on VennZ.';
    const snippetMatch = rawIntro.match(/^[^.!?]+[.!?]/);
    const snippet = snippetMatch ? snippetMatch[0] : rawIntro.slice(0, 90) + '...';

    return {
      profileId: profile.id,
      displayName: profile.firstName,
      age: profile.age,
      city: profile.city,
      designation: profile.designation,
      company: profile.company,
      education: profile.education,
      gender: profile.gender,
      previewPhoto: profile.photos && profile.photos.length > 0 ? profile.photos[0] : '',
      photos: profile.photos && profile.photos.length > 0 ? profile.photos : [],
      introduction: profile.introduction || '',
      introductionSnippet: snippet,
      interests: profile.interests || [],
      vibes: profile.vibes || [],
      isVerified: Boolean(profile.isVerified),
      curationHighlight: highlight,
      careerAndEducation: profile.careerAndEducation,
      datingPreference: profile.datingPreference,
      currentStatus: profile.currentStatus,
      photoPrompts: profile.photoPrompts,
      quirks: profile.quirks,
      weekendRitual: profile.weekendRitual,
      activeStatus: profile.activeStatus,
    };
  }

  /**
   * Helper: Maps a DiscoverProfile to an authenticated FullProfile.
   */
  private mapToFullProfile(profile: DiscoverProfile): FullProfile {
    return {
      id: profile.id,
      firstName: profile.firstName,
      age: profile.age,
      city: profile.city,
      designation: profile.designation,
      company: profile.company,
      gender: profile.gender,
      photos: profile.photos || [],
      introduction: profile.introduction || '',
      interests: profile.interests || [],
      vibes: profile.vibes || [],
      isVerified: Boolean(profile.isVerified),
      datingPreference: profile.datingPreference,
      currentStatus: profile.currentStatus,
      linkedinUrl: profile.linkedinUrl,
      instagramUsername: profile.instagramUsername,
      showLinkedinPublicly: profile.showLinkedinPublicly,
      showInstagramPublicly: profile.showInstagramPublicly,
    };
  }

  /**
   * Generates a stable recommendation instance for a candidate profile.
   */
  private createRecommendation(profile: DiscoverProfile, index: number): Recommendation {
    const recId = `rec-bd-${profile.id}`;
    // Simulate candidate reciprocity: odd indexed profiles reciprocate automatically on accept
    const candidateHasAccepted = index % 2 === 0;

    return {
      id: recId,
      candidateProfileId: profile.id,
      preview: this.mapToPreview(profile),
      status: 'pending',
      createdAt: Date.now() - 3600000 * 2,
      expiresAt: Date.now() + 3600000 * 24, // 24-hour expiration window
      candidateHasAccepted,
    };
  }

  public async getNextRecommendation(_userId: string): Promise<Recommendation | null> {
    // Simulate realistic asynchronous network delay (180ms)
    await new Promise((resolve) => setTimeout(resolve, 180));

    const state = this.getStorage();

    // 1. Check if user already has an active recommendation awaiting decision or in waiting/mutual state
    if (state.activeRecommendationId) {
      const activeCandidateId = state.activeRecommendationId.replace('rec-bd-', '');
      const profile = DUMMY_DISCOVER_PROFILES.find((p) => p.id === activeCandidateId);
      if (profile) {
        const decisionEntry = state.decisions[state.activeRecommendationId];
        const isMutual = state.mutualConnectionIds.includes(state.activeRecommendationId);
        const candidateIndex = DUMMY_DISCOVER_PROFILES.findIndex((p) => p.id === activeCandidateId);
        const rec = this.createRecommendation(profile, candidateIndex);

        if (isMutual) {
          rec.status = 'mutual';
          rec.userDecision = 'accept';
        } else if (decisionEntry && decisionEntry.decision === 'accept') {
          rec.status = 'accepted_waiting';
          rec.userDecision = 'accept';
        } else {
          rec.status = 'pending';
        }

        return rec;
      }
    }

    // 2. Select next eligible candidate from pool who has not been accepted or rejected
    const eligibleProfiles = DUMMY_DISCOVER_PROFILES.filter((cand) => {
      const candRecId = `rec-bd-${cand.id}`;
      return !state.decisions[candRecId];
    });

    if (eligibleProfiles.length === 0) {
      return null;
    }

    // Pick top recommendation from eligible pool
    const selectedProfile = eligibleProfiles[0];
    const candidateIndex = DUMMY_DISCOVER_PROFILES.findIndex((p) => p.id === selectedProfile.id);
    const recommendation = this.createRecommendation(selectedProfile, candidateIndex);

    // Save as currently active
    state.activeRecommendationId = recommendation.id;
    this.setStorage(state);

    return recommendation;
  }

  public async getRecommendationStatus(recommendationId: string): Promise<RecommendationStatus> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const state = this.getStorage();

    if (state.mutualConnectionIds.includes(recommendationId)) {
      return 'mutual';
    }

    const decision = state.decisions[recommendationId];
    if (decision) {
      return decision.decision === 'accept' ? 'accepted_waiting' : 'rejected';
    }

    return 'pending';
  }

  public async acceptRecommendation(
    recommendationId: string,
    _userId: string
  ): Promise<RecommendationStatus> {
    await new Promise((resolve) => setTimeout(resolve, 240));

    const state = this.getStorage();
    state.decisions[recommendationId] = {
      decision: 'accept',
      timestamp: Date.now(),
    };

    // Find candidate profile
    const candidateId = recommendationId.replace('rec-bd-', '');
    const candidateIndex = DUMMY_DISCOVER_PROFILES.findIndex((p) => p.id === candidateId);
    const candidateReciprocates = candidateIndex >= 0 ? candidateIndex % 2 === 0 : true;

    if (candidateReciprocates) {
      // Mutual connection confirmed!
      if (!state.mutualConnectionIds.includes(recommendationId)) {
        state.mutualConnectionIds.push(recommendationId);
      }
      this.setStorage(state);
      return 'mutual';
    } else {
      // Waiting for candidate response
      this.setStorage(state);
      return 'accepted_waiting';
    }
  }

  public async rejectRecommendation(recommendationId: string, _userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const state = this.getStorage();
    state.decisions[recommendationId] = {
      decision: 'reject',
      timestamp: Date.now(),
    };

    // Clear active recommendation so next eligible can be presented
    if (state.activeRecommendationId === recommendationId) {
      state.activeRecommendationId = null;
    }

    this.setStorage(state);
  }

  public async getMutualConnection(
    recommendationId: string,
    _userId: string
  ): Promise<MutualConnection | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const state = this.getStorage();
    if (!state.mutualConnectionIds.includes(recommendationId)) {
      return null;
    }

    const candidateId = recommendationId.replace('rec-bd-', '');
    const profile = DUMMY_DISCOVER_PROFILES.find((p) => p.id === candidateId);
    if (!profile) return null;

    return {
      recommendationId,
      candidateProfileId: profile.id,
      candidateName: profile.firstName,
      candidatePhoto: profile.photos && profile.photos.length > 0 ? profile.photos[0] : '',
      connectedAt: Date.now(),
      chatConversationId: `match-${profile.id}`,
      fullProfile: this.mapToFullProfile(profile),
    };
  }

  public async getFullProfile(profileId: string, _requestingUserId: string): Promise<FullProfile> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const state = this.getStorage();
    const recId = `rec-bd-${profileId}`;

    // Verify mutual connection authorization
    if (!state.mutualConnectionIds.includes(recId)) {
      throw new Error('Unauthorized: Full profile is protected until mutual consent is verified.');
    }

    const profile = DUMMY_DISCOVER_PROFILES.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error('Profile not found.');
    }

    return this.mapToFullProfile(profile);
  }

  public async resetRecommendations(_userId: string): Promise<void> {
    const freshState: StoredBlindDateState = {
      decisions: {},
      activeRecommendationId: null,
      mutualConnectionIds: [],
    };
    this.setStorage(freshState);
  }
}

// Export singleton instance for standard injection
export const blindDateService = new MockBlindDateProvider();
