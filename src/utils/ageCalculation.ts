/**
 * Age Calculation Utility
 *
 * Pure utility functions for computing age from a date of birth.
 * Kept separate so it can be used anywhere (DigiLocker flow, profile, etc.)
 * without coupling to any specific component or service.
 */

/**
 * Calculate age in complete years from a YYYY-MM-DD date string.
 * Correctly accounts for whether the birthday has occurred this year.
 *
 * @param dobIso - Date of birth in ISO format "YYYY-MM-DD"
 * @returns Age in complete years, or -1 if the input is invalid
 */
export function calculateAgeFromISO(dobIso: string): number {
  if (!dobIso || typeof dobIso !== 'string') return -1;

  const parts = dobIso.split('-');
  if (parts.length !== 3) return -1;

  const birthDate = new Date(dobIso);
  if (isNaN(birthDate.getTime())) return -1;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Subtract one year if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Check whether a person is eligible (18+) based on their DOB.
 *
 * @param dobIso - Date of birth in ISO format "YYYY-MM-DD"
 * @returns true if the person is 18 or older
 */
export function isAgeEligible(dobIso: string): boolean {
  const age = calculateAgeFromISO(dobIso);
  return age >= 18;
}

/**
 * Format a YYYY-MM-DD ISO date to a human-readable display string.
 * e.g. "2001-08-15" → "15 August 2001"
 */
export function formatDobForDisplay(dobIso: string): string {
  if (!dobIso) return '';
  const date = new Date(dobIso + 'T00:00:00');
  if (isNaN(date.getTime())) return dobIso;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Extract the first letter (initial) from a full name.
 * Used to seed the VennZ display name.
 *
 * @param fullName - Legal full name from DigiLocker
 * @returns First letter uppercase, or '' if name is empty
 */
export function getNameInitial(fullName: string): string {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase();
}
