/**
 * Mock DigiLocker Service
 *
 * PURPOSE: Development / testing placeholder.
 * REPLACE: When client provides real DigiLocker API credentials/endpoints,
 *          implement the same `IDigiLockerService` interface in
 *          `realDigiLockerService.ts` and update the import in
 *          `digiLockerService.ts`.
 *
 * This mock simulates realistic timing and behavior of the actual flow:
 *   1. initiateFlow() — simulates the DigiLocker redirect delay (~1.5s)
 *   2. fetchVerifiedData() — simulates data fetch after consent (~1.2s)
 */

import type {
  IDigiLockerService,
  DigiLockerInitResult,
  DigiLockerConsentResult,
  DigiLockerVerifiedData,
} from '../types/digilocker';

// ─── Mock response data ───────────────────────────────────────────────────────
// DEVELOPMENT ONLY — replace with real API response when integrating.
// Do NOT import or reference this data directly in any UI component.

const MOCK_DIGILOCKER_RESPONSE: DigiLockerVerifiedData = {
  name: 'Rahul Sharma',
  dateOfBirth: '2001-08-15',
};

// ─── Mock session ID generator ────────────────────────────────────────────────

const generateMockSessionId = (): string =>
  `mock_dl_session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ─── Mock service implementation ──────────────────────────────────────────────

class MockDigiLockerService implements IDigiLockerService {
  /**
   * Simulates DigiLocker OAuth initiation.
   * Real implementation: opens DigiLocker OAuth URL / redirect.
   */
  async initiateFlow(): Promise<DigiLockerInitResult> {
    // Simulate network/redirect delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate ~5% failure rate for realistic error handling testing
    if (Math.random() < 0.0) {
      return { status: 'error', message: 'Unable to reach DigiLocker. Please try again.' };
    }

    return {
      status: 'initiated',
      sessionId: generateMockSessionId(),
    };
  }

  /**
   * Simulates fetching verified data after user grants consent.
   * Real implementation: exchanges OAuth code for token, fetches user data.
   */
  async fetchVerifiedData(
    _sessionId: string,
    userConsented: boolean
  ): Promise<DigiLockerConsentResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (!userConsented) {
      return { status: 'declined' };
    }

    // Simulate ~0% failure in mock (set > 0 to test error handling)
    if (Math.random() < 0.0) {
      return { status: 'error', message: 'Failed to retrieve verified data. Please try again.' };
    }

    return {
      status: 'granted',
      data: { ...MOCK_DIGILOCKER_RESPONSE },
    };
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const mockDigiLockerService = new MockDigiLockerService();
