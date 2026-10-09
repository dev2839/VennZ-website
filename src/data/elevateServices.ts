import type { ElevateService } from '../types/elevate';

export const ELEVATE_SERVICES: ElevateService[] = [
  {
    id: 'profile-intelligence',
    number: '01',
    category: 'profile-intelligence',
    name: 'Profile Intelligence',
    tagline: 'Measurable scorecard analyzing profile views, requests, conversion rates, and response speed over time.',
    description:
      'A data-driven scorecard built entirely on measurable VennZ member telemetry. Understand how members discover, evaluate, and connect with your profile, benchmarked against VennZ cohort percentiles.',
    helpsWith: [
      'Profile views and unique member discovery velocity',
      'View-to-Request and Request-to-Match conversion funnels',
      'Response rates, reply speeds, and communication cadence',
      'Performance trends and week-over-week growth tracking',
      'Cohort benchmark vs top 15% active VennZ profiles',
      'Actionable data indicators for profile optimization',
    ],
    format: 'Paid Scorecard & Live Telemetry',
    typicalDuration: 'Instant Telemetry & 7-Day Tracking',
    startingPrice: 1999,
    privacyAccessScope: 'Staff access strictly limited to aggregate performance telemetry. No access to private conversations or unposted drafts.',
  },
  {
    id: 'profile-makeover',
    number: '02',
    category: 'profile-makeover',
    name: 'Profile Makeover',
    tagline: 'Editorial audit of photos, bio, vibe synergy, and work presentation with actionable before/after recommendations.',
    description:
      'A holistic, human-led review by VennZ Senior Editorial Curators. We audit your visual presentation, 240-character narrative, vibe synergy, and career positioning to deliver tailored, actionable before/after enhancements.',
    helpsWith: [
      'Photograph selection, sequence hierarchy, and lighting audit',
      '240-character bio refinement for warmth, intrigue, and distinctiveness',
      'Interests and vibe pairings optimized for natural conversation starters',
      'Education and career framing to balance prestige and approachability',
      'Holistic first impression evaluation and aura assessment',
      'Concrete Before & After comparison deliverables with one-click adjustments',
    ],
    format: 'Curated Editorial Deliverable',
    typicalDuration: '48-Hour Turnaround',
    startingPrice: 3499,
    privacyAccessScope: 'Staff access strictly limited to profile presentation assets (photos, bio, interests, work). Zero message access.',
  },
];
