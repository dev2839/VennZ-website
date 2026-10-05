/**
 * DigiLocker Integration Types
 *
 * These types define the contract between the VennZ UI flow and the
 * DigiLocker service layer. The mock service implements this same interface,
 * so swapping to the real API requires only replacing the service — not the UI.
 */

// ─── Data returned by DigiLocker after successful consent ────────────────────

export interface DigiLockerVerifiedData {
  /** Verified legal full name from DigiLocker */
  name: string;
  /** Verified date of birth in ISO format YYYY-MM-DD */
  dateOfBirth: string;
}

// ─── Result types from each service call ─────────────────────────────────────

export type DigiLockerInitResult =
  | { status: 'initiated'; sessionId: string }
  | { status: 'error'; message: string };

export type DigiLockerConsentResult =
  | { status: 'granted'; data: DigiLockerVerifiedData }
  | { status: 'declined' }
  | { status: 'error'; message: string };

// ─── Internal flow step states ────────────────────────────────────────────────

export type DigiLockerFlowStep =
  | 'intro'       // Explain what DigiLocker is and what we access
  | 'redirecting' // Simulating redirect to DigiLocker (loading state)
  | 'permission'  // Mock DigiLocker consent/permission screen
  | 'verifying'   // Processing consent and fetching data
  | 'success'     // Verification complete, proceeding to profile
  | 'declined'    // User declined consent
  | 'error';      // API / network error

// ─── Service interface ────────────────────────────────────────────────────────

/**
 * IDigiLockerService defines the contract that both the mock and real
 * DigiLocker service implementations must satisfy.
 *
 * To integrate the real DigiLocker API:
 *   1. Create `src/services/realDigiLockerService.ts`
 *   2. Implement this interface with actual OAuth/API calls
 *   3. Replace `mockDigiLockerService` import in `digiLockerService.ts`
 */
export interface IDigiLockerService {
  /**
   * Initiate the DigiLocker OAuth/redirect flow.
   * In production: redirects user to DigiLocker login page.
   * In mock: simulates a brief redirect delay.
   */
  initiateFlow(): Promise<DigiLockerInitResult>;

  /**
   * After user grants consent on the DigiLocker page, fetch the
   * authorized data (name + DOB only).
   *
   * @param sessionId - Session identifier from initiateFlow result
   * @param userConsented - Whether the user explicitly clicked "Allow"
   */
  fetchVerifiedData(
    sessionId: string,
    userConsented: boolean
  ): Promise<DigiLockerConsentResult>;
}
