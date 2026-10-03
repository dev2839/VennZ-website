export interface MatchItem {
  id: string;
  profileId: string;
  name: string;
  age: number;
  city: string;
  designation: string;
  company?: string;
  photo: string;
  isVerified: boolean;
  matchedAt: number;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface IncomingRequest {
  id: string;
  profileId: string;
  name: string;
  age: number;
  city: string;
  designation: string;
  company?: string;
  photo: string;
  isVerified: boolean;
  timestamp: number;
}

export interface SentRequest {
  id: string;
  profileId: string;
  name: string;
  city: string;
  designation?: string;
  photo?: string;
  status: 'AWAITING REPLY';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: 'me' | string;
  text: string;
  timestamp: number;
}

export interface ChatConversation {
  matchId: string;
  messages: ChatMessage[];
}
