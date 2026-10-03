export interface DiscoverProfile {
  id: string;
  firstName: string;
  age: number;
  city: string;
  designation: string;
  company: string;
  education?: string;
  photos: string[];
  isVerified: boolean;
  introduction: string; // Required two-line introduction
  interests: string[];
  careerAndEducation?: {
    role: string;
    company: string;
    education: string;
  };
  datingPreference?: string;
  gender: 'woman' | 'man' | 'other';
  currentStatus?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp?: string;
  isRead: boolean;
  type: 'request' | 'match' | 'system' | 'discover' | 'membership';
  category?: string; // e.g. 'REQUEST', 'MATCH', 'INTRODUCTIONS', 'MEMBERSHIP'
  sourcePage?: string; // e.g. 'MATCHES', 'CHAT', 'DISCOVER', 'YOU'
  targetRoute?: string;
  avatarUrl?: string;
}
