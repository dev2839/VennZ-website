export interface ElevateService {
  id: string;
  number: string; // '01', '02', etc.
  name: string;
  tagline: string;
  description: string;
  helpsWith: string[];
  format: string; // e.g. 'Online', 'In-Person Studio', 'Hybrid'
  typicalDuration: string; // e.g. '60 minutes', '90 minutes'
  startingPrice: number; // e.g. 3000, 5000
}

export type ElevateRequestStatus = 'request_received' | 'reviewing' | 'scheduling';

export interface ElevateRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  helpRequired: string;
  availability: 'Morning' | 'Afternoon' | 'Evening' | 'Weekend' | 'Flexible';
  preferredDate?: string;
  notes?: string;
  status: ElevateRequestStatus;
  createdAt: number;
}

export type BookingStatus =
  | 'Request Received'
  | 'Reviewing'
  | 'Scheduling'
  | 'Awaiting Payment'
  | 'Confirmed'
  | 'Completed';

export type PaymentStatus = 'Awaiting Payment' | 'Paid';

export interface ElevateBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  duration: string;
  date: string; // e.g. 'Saturday, 26 September'
  time: string; // e.g. '6:00 PM'
  format: string; // e.g. 'Online' or 'Studio'
  price: number; // e.g. 3000
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  requestId?: string;
  createdAt: number;
}

export interface ElevateConciergeMessage {
  id: string;
  sender: 'member' | 'team';
  text: string;
  timestamp: number;
  proposedBooking?: ElevateBooking;
}
