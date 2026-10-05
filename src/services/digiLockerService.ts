/**
 * DigiLocker Service — Active Integration Point
 *
 * This file is the SINGLE place to swap mock → real implementation.
 *
 * TO INTEGRATE REAL DIGILOCKER API:
 *   1. Create `src/services/realDigiLockerService.ts`
 *      implementing `IDigiLockerService`
 *   2. Change the import below from mockDigiLockerService → realDigiLockerService
 *   3. No UI component changes required.
 */

import type { IDigiLockerService } from '../types/digilocker';
import { mockDigiLockerService } from './mockDigiLockerService';

// ─── Active service binding ───────────────────────────────────────────────────
// Switch this to `realDigiLockerService` when client provides API credentials.

export const digiLockerService: IDigiLockerService = mockDigiLockerService;

// Re-export types for convenience
export type { DigiLockerVerifiedData, DigiLockerFlowStep } from '../types/digilocker';
