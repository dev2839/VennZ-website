export type ComplaintCategory =
  | 'REPORT A MEMBER'
  | 'SAFETY CONCERN'
  | 'BILLING'
  | 'SOMETHING ELSE';

export interface ComplaintRecord {
  id: string;
  category: ComplaintCategory;
  message: string;
  timestamp: number;
  status: 'received' | 'in_review' | 'resolved';
}

export interface UserInvitation {
  code: string;
  createdAt: number;
}

export type AppearanceMode = 'ivory' | 'after-dark';
