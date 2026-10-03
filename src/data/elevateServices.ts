import type { ElevateService } from '../types/elevate';

export const ELEVATE_SERVICES: ElevateService[] = [
  {
    id: 'confidence-coaching',
    number: '01',
    name: 'Confidence Coaching',
    tagline: 'Build confidence, presence and ease in social and dating situations.',
    description:
      'A dedicated, one-on-one consultation focused on overcoming situational hesitation, grounding your body language, and speaking with effortless composure in private and high-stakes social settings.',
    helpsWith: [
      'Social and dating ease',
      'Non-verbal composure and body language',
      'Managing first-encounter anxiety',
      'Expressing authentic boundaries',
      'Building lasting personal presence',
    ],
    format: 'Online',
    typicalDuration: '60 minutes',
    startingPrice: 3000,
  },
  {
    id: 'dating-coaching',
    number: '02',
    name: 'Dating Coaching',
    tagline: 'Practical guidance for communication, dating and building meaningful connections.',
    description:
      'A focused session designed around your dating goals, communication style and current challenges. Gain discreet clarity on dating dynamics, pacing, and intentional relationship building.',
    helpsWith: [
      'Communication & banter',
      'First-date confidence',
      'Navigating dating patterns',
      'Setting boundaries & pacing',
      'Building meaningful connections',
      'Post-date debrief and clarity',
    ],
    format: 'Online',
    typicalDuration: '60 minutes',
    startingPrice: 3000,
  },
  {
    id: 'profile-refinement',
    number: '03',
    name: 'Profile Refinement',
    tagline: 'Refine how you present yourself so your profile feels authentic and compelling.',
    description:
      'Direct editorial curation of your photographs, prompts, and narrative tone. We balance natural authenticity with high-impact distinction so the right members notice you first.',
    helpsWith: [
      'Photo selection and sequence curation',
      'Crafting sharp, nuanced written prompts',
      'Balancing vulnerability and prestige',
      'Eliminating clichés and ambiguous signals',
      'Highlighting personal values and lifestyle',
    ],
    format: 'Online',
    typicalDuration: '60 minutes',
    startingPrice: 3500,
  },
  {
    id: 'style-grooming',
    number: '04',
    name: 'Style & Grooming',
    tagline: 'Personal guidance on style, grooming and presenting yourself with confidence.',
    description:
      'Private aesthetic guidance on wardrobe curation, silhouette, fit, and grooming rituals designed specifically for evenings, daytime introductions, and signature personal identity.',
    helpsWith: [
      'Wardrobe essentials and timeless silhouettes',
      'Date-night and mixer attire selection',
      'Tailoring, fit, and grooming consultation',
      'Color palette and fabric coordination',
      'Elevating signature personal aesthetic',
    ],
    format: 'Online / Hybrid',
    typicalDuration: '75 minutes',
    startingPrice: 4000,
  },
  {
    id: 'professional-photography',
    number: '05',
    name: 'Professional Photography',
    tagline: 'High-quality photography designed to help your profile represent you naturally.',
    description:
      'A private, natural-light portrait session with master photographers accustomed to editorial, discreet portraiture. We focus on relaxed movement and authentic expressions.',
    helpsWith: [
      'Editorial, non-staged natural portraits',
      'Multiple lifestyle & evening looks',
      'Studio or curated urban location',
      'High-resolution retouched deliverables',
      'Tailored specifically for member profiles',
    ],
    format: 'Studio / On-Location',
    typicalDuration: '90 minutes',
    startingPrice: 5000,
  },
  {
    id: 'personality-development',
    number: '06',
    name: 'Personality Development',
    tagline: 'Develop communication, presence and interpersonal confidence.',
    description:
      'Holistic refinement of conversational intelligence, vocal cadence, listening depth, and emotional agility to leave a memorable, magnetic impression.',
    helpsWith: [
      'Conversational depth & active listening',
      'Vocal pacing and articulation',
      'Storytelling and emotional resonance',
      'Navigating diverse social circles',
      'Graceful conflict and boundary handling',
    ],
    format: 'Online',
    typicalDuration: '60 minutes',
    startingPrice: 3500,
  },
];
