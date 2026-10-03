export type MixerEventStatus = 'PLANNING' | 'FINALIZED' | 'SOLD OUT' | 'COMPLETED';

export interface MixerEvent {
  id: string;
  eventName: string;
  image: string;
  date: string; // e.g. 'Saturday, 10 October'
  startTime: string; // e.g. '7:00 PM'
  endTime: string; // e.g. '10:00 PM'
  city: string; // e.g. 'Mumbai'
  area: string; // e.g. 'South Mumbai'
  venue: string; // e.g. 'Venue to be announced' or 'The Claridges Conservatory'
  isVenueAnnounced: boolean;
  description: string;
  whatToExpect: string[];
  capacity: number;
  spotsAvailable: number;
  regularPrice: number; // e.g. 5000
  memberPrice: number; // e.g. 4000
  status: MixerEventStatus;
}

export type MixerBookingStatus = 'Confirmed' | 'Attended' | 'Cancelled';

export interface MixerBooking {
  id: string; // e.g. 'TIC-4821'
  eventId: string;
  eventName: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  city: string;
  area: string;
  venue: string;
  amountPaid: number;
  paidPriceType: 'member' | 'first_look';
  bookingStatus: MixerBookingStatus;
  paymentStatus: 'Paid';
  bookedAt: number;
}
