/**
 * VennZ BlindDate Service Contract
 * 
 * Formal service interface for the BlindDate recommendation experience.
 * UI components interact strictly with this contract, ensuring complete
 * interchangeability between the development mock provider and the future
 * production machine-learning recommendation engine and database API.
 */

import type {
  Recommendation,
  RecommendationStatus,
  MutualConnection,
  FullProfile,
} from '../types/blindDate';

export interface BlindDateService {
  /**
   * Retrieves the next eligible personalized recommendation for the user.
   * Returns null if no eligible candidates remain in the user's queue.
   */
  getNextRecommendation(userId: string): Promise<Recommendation | null>;

  /**
   * Checks the current lifecycle status of an active recommendation.
   */
  getRecommendationStatus(recommendationId: string): Promise<RecommendationStatus>;

  /**
   * Submits the user's acceptance of the recommendation.
   * If the candidate has already accepted, resolves immediately to 'mutual'.
   * Otherwise resolves to 'accepted_waiting'.
   */
  acceptRecommendation(
    recommendationId: string,
    userId: string
  ): Promise<RecommendationStatus>;

  /**
   * Submits the user's rejection of the recommendation.
   * Removes it from the active queue and persists rejection to avoid repeat delivery.
   */
  rejectRecommendation(recommendationId: string, userId: string): Promise<void>;

  /**
   * Retrieves mutual connection details once both participants have consented.
   * Returns null if mutual acceptance has not occurred.
   */
  getMutualConnection(
    recommendationId: string,
    userId: string
  ): Promise<MutualConnection | null>;

  /**
   * Fetches the complete profile after mutual consent authorization is verified.
   * Throws an unauthorized error if mutual connection has not been verified.
   */
  getFullProfile(profileId: string, requestingUserId: string): Promise<FullProfile>;

  /**
   * Resets local recommendation queue state (useful for user resetting or demonstration).
   */
  resetRecommendations(userId: string): Promise<void>;
}
