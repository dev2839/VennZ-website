export const GENDER_OPTIONS = ['WOMAN', 'MAN', 'NON-BINARY', 'PREFER TO SELF-DESCRIBE'] as const;

export const DATING_PREF_OPTIONS = ['WOMEN', 'MEN', 'EVERYONE'] as const;

export const STATUS_OPTIONS = [
  'WORKING',
  'FOUNDER / ENTREPRENEUR',
  'STUDENT',
  'SELF-EMPLOYED / FREELANCER',
  'OTHER',
] as const;

export const INTEREST_OPTIONS = [
  'Art',
  'Books',
  'Cooking',
  'Fitness',
  'Gaming',
  'Hiking',
  'Music',
  'Photography',
  'Startups',
  'Tech',
  'Travel',
  'Yoga',
  'Cycling',
  'Coffee',
  'Cinema',
  'Theatre',
  'Investing',
  'Sports',
  'Dancing',
  'Poetry',
] as const;

export const VIBE_OPTIONS = [
  'Ambitious',
  'Creative',
  'Curious',
  'Empathetic',
  'Grounded',
  'Humorous',
  'Intellectual',
  'Laid-back',
  'Outgoing',
  'Passionate',
  'Spontaneous',
  'Thoughtful',
] as const;

export type InterestOption = typeof INTEREST_OPTIONS[number];
export type VibeOption = typeof VIBE_OPTIONS[number];
