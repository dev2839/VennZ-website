/**
 * VennZ After Hours — Configurable Business & Window Rules
 *
 * All parameters (nightly schedule, conversation duration, quotas, age filter)
 * are centralized here for easy configuration and adjustment.
 */

export interface AfterHoursScheduleConfig {
  /** Start hour in 24h format (e.g. 22 for 10 PM) */
  windowStartHour: number;
  /** Start minute (e.g. 0) */
  windowStartMinute: number;
  /** End hour in 24h format (e.g. 23 for 11 PM) */
  windowEndHour: number;
  /** End minute (e.g. 0) */
  windowEndMinute: number;
  /** Max duration of blind conversation in seconds (8 minutes = 480) */
  conversationDurationSeconds: number;
  /** Number of blind chats allowed per night for free users */
  freeBlindChatsPerNight: number;
  /** Number of blind chats allowed per night for premium members */
  premiumBlindChatsPerNight: number;
  /** Number of mutual matches allowed per week for free users */
  freeMatchesPerWeek: number;
  /** Number of mutual matches allowed per week for premium members (-1 = unlimited) */
  premiumMatchesPerWeek: number;
  /** Maximum allowable age gap from user's age in years (up to 4 years difference) */
  maxAgeDifference: number;
  /** FIFO queue pairing timeout in seconds */
  fifoQueueTimeoutSeconds: number;
}

export const DEFAULT_AFTER_HOURS_CONFIG: AfterHoursScheduleConfig = {
  windowStartHour: 22, // 10:00 PM
  windowStartMinute: 0,
  windowEndHour: 23, // 11:00 PM
  windowEndMinute: 0,
  conversationDurationSeconds: 480, // 8 minutes
  freeBlindChatsPerNight: 2,
  premiumBlindChatsPerNight: 7,
  freeMatchesPerWeek: 3,
  premiumMatchesPerWeek: -1, // Unlimited
  maxAgeDifference: 4,
  fifoQueueTimeoutSeconds: 3.5,
};
