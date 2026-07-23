export type PaymentStatus = 'Paid' | 'Advance Paid' | 'Pending';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export interface Booking {
  id: string;
  booking_id: string; // e.g. TB000001
  guest_name: string;
  phone: string;
  email?: string;
  adults: number;
  children: number;
  total_pax: number;
  package_name: string;
  booking_date: string; // YYYY-MM-DD
  travel_date: string; // YYYY-MM-DD
  pickup_location: string;
  dropoff_location: string;
  seat_numbers?: string;
  reporting_time?: string; // e.g. 08:30 AM
  departure_time?: string; // e.g. 09:00 AM
  package_amount: number;
  advance_paid: number;
  balance_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  created_at: string;
  updated_at?: string;
}

export interface Setting {
  id?: string;
  company_name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  footer_text: string;
  terms_conditions: string;
  operating_by: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  booking_id?: string;
  user_name?: string;
  created_at: string;
}

export interface DashboardStats {
  totalBookings: number;
  todaysBookings: number;
  upcomingTours: number;
  pendingPayments: number;
  confirmedTours: number;
  cancelledTours: number;
  totalRevenue: number;
  advanceCollected: number;
  balancePending: number;
}
