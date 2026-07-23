import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Booking, DashboardStats, ActivityLog } from '../types/database';
import { initialBookings, initialActivityLogs } from './mockData';

const LOCAL_STORAGE_BOOKINGS_KEY = 'thaibah_bookings_v1';
const LOCAL_STORAGE_LOGS_KEY = 'thaibah_activity_logs_v1';

// Helper to initialize local storage if empty
const getLocalBookings = (): Booking[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(initialBookings));
    return initialBookings;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialBookings;
  }
};

const saveLocalBookings = (bookings: Booking[]) => {
  localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
};

const getLocalActivityLogs = (): ActivityLog[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(initialActivityLogs));
    return initialActivityLogs;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialActivityLogs;
  }
};

const addLocalActivityLog = (action: string, details: string, booking_id?: string) => {
  const logs = getLocalActivityLogs();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}`,
    action,
    details,
    booking_id,
    user_name: 'Admin',
    created_at: new Date().toISOString(),
  };
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updatedLogs));
  return newLog;
};

export const bookingService = {
  // Fetch all bookings
  async getBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings from Supabase:', error);
        return getLocalBookings();
      }
      return data as Booking[];
    }
    return getLocalBookings();
  },

  // Fetch single booking by ID or booking_id (TB000001)
  async getBookingById(idOrBookingId: string): Promise<Booking | null> {
    if (isSupabaseConfigured && supabase) {
      const isUuid = idOrBookingId.includes('-');
      const query = isUuid 
        ? supabase.from('bookings').select('*').eq('id', idOrBookingId).single()
        : supabase.from('bookings').select('*').eq('booking_id', idOrBookingId).single();

      const { data, error } = await query;
      if (error || !data) {
        const localList = getLocalBookings();
        return localList.find(b => b.id === idOrBookingId || b.booking_id === idOrBookingId) || null;
      }
      return data as Booking;
    }

    const bookings = getLocalBookings();
    return bookings.find(b => b.id === idOrBookingId || b.booking_id === idOrBookingId) || null;
  },

  // Generate next automatic booking ID formatted as TB000001
  async generateNextBookingId(): Promise<string> {
    let bookings: Booking[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('bookings').select('booking_id');
      if (data && data.length > 0) {
        bookings = data as Booking[];
      } else {
        bookings = getLocalBookings();
      }
    } else {
      bookings = getLocalBookings();
    }

    let maxNum = 0;
    bookings.forEach(b => {
      if (b.booking_id && b.booking_id.startsWith('TB')) {
        const num = parseInt(b.booking_id.replace('TB', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `TB${String(nextNum).padStart(6, '0')}`;
  },

  // Create new booking
  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'total_pax' | 'balance_amount'>): Promise<Booking> {
    const total_pax = Number(bookingData.adults) + Number(bookingData.children);
    const balance_amount = Number(bookingData.package_amount) - Number(bookingData.advance_paid);
    
    // Auto-calculate payment status if not explicitly updated correctly
    let payment_status = bookingData.payment_status;
    if (balance_amount <= 0 && bookingData.package_amount > 0) {
      payment_status = 'Paid';
    } else if (bookingData.advance_paid > 0 && balance_amount > 0) {
      payment_status = 'Advance Paid';
    } else if (bookingData.advance_paid === 0) {
      payment_status = 'Pending';
    }

    const newBookingPayload = {
      ...bookingData,
      total_pax,
      balance_amount,
      payment_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .insert([newBookingPayload])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase create error:', error);
      } else {
        addLocalActivityLog('Booking Created', `Created booking ${data.booking_id} for ${data.guest_name}`, data.booking_id);
        return data as Booking;
      }
    }

    // Local Storage Fallback
    const localBookings = getLocalBookings();
    const newBooking: Booking = {
      ...newBookingPayload,
      id: `bk-${Date.now()}`,
    };

    saveLocalBookings([newBooking, ...localBookings]);
    addLocalActivityLog('Booking Created', `Created booking ${newBooking.booking_id} for ${newBooking.guest_name}`, newBooking.booking_id);
    return newBooking;
  },

  // Update existing booking
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const existing = await this.getBookingById(id);
    if (!existing) return null;

    const adults = updates.adults !== undefined ? Number(updates.adults) : existing.adults;
    const children = updates.children !== undefined ? Number(updates.children) : existing.children;
    const total_pax = adults + children;

    const package_amount = updates.package_amount !== undefined ? Number(updates.package_amount) : existing.package_amount;
    const advance_paid = updates.advance_paid !== undefined ? Number(updates.advance_paid) : existing.advance_paid;
    const balance_amount = package_amount - advance_paid;

    let payment_status = updates.payment_status || existing.payment_status;
    if (balance_amount <= 0 && package_amount > 0) {
      payment_status = 'Paid';
    } else if (advance_paid > 0 && balance_amount > 0) {
      payment_status = 'Advance Paid';
    } else if (advance_paid === 0) {
      payment_status = 'Pending';
    }

    const payload = {
      ...updates,
      total_pax,
      package_amount,
      advance_paid,
      balance_amount,
      payment_status,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        addLocalActivityLog('Booking Updated', `Updated details for ${data.booking_id}`, data.booking_id);
        return data as Booking;
      }
    }

    const localBookings = getLocalBookings();
    const index = localBookings.findIndex(b => b.id === id || b.booking_id === id);
    if (index !== -1) {
      localBookings[index] = { ...localBookings[index], ...payload };
      saveLocalBookings(localBookings);
      addLocalActivityLog('Booking Updated', `Updated details for ${localBookings[index].booking_id}`, localBookings[index].booking_id);
      return localBookings[index];
    }

    return null;
  },

  // Delete booking
  async deleteBooking(id: string): Promise<boolean> {
    const target = await this.getBookingById(id);
    const targetId = target ? target.booking_id : id;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      if (error) console.error('Supabase delete error:', error);
    }

    const localBookings = getLocalBookings();
    const filtered = localBookings.filter(b => b.id !== id && b.booking_id !== id);
    saveLocalBookings(filtered);
    addLocalActivityLog('Booking Deleted', `Deleted booking record ${targetId}`, targetId);
    return true;
  },

  // Duplicate booking
  async duplicateBooking(id: string): Promise<Booking | null> {
    const original = await this.getBookingById(id);
    if (!original) return null;

    const newBookingId = await this.generateNextBookingId();
    const today = new Date().toISOString().split('T')[0];

    const duplicatedData: Omit<Booking, 'id' | 'created_at' | 'total_pax' | 'balance_amount'> = {
      booking_id: newBookingId,
      guest_name: `${original.guest_name} (Copy)`,
      phone: original.phone,
      email: original.email,
      adults: original.adults,
      children: original.children,
      package_name: original.package_name,
      booking_date: today,
      travel_date: original.travel_date,
      pickup_location: original.pickup_location,
      dropoff_location: original.dropoff_location,
      seat_numbers: original.seat_numbers,
      reporting_time: original.reporting_time,
      departure_time: original.departure_time,
      package_amount: original.package_amount,
      advance_paid: 0, // Reset advance for new copy
      payment_status: 'Pending',
      booking_status: 'Pending',
    };

    const newBooking = await this.createBooking(duplicatedData);
    addLocalActivityLog('Booking Duplicated', `Duplicated ${original.booking_id} into new booking ${newBookingId}`, newBookingId);
    return newBooking;
  },

  // Calculate Dashboard KPI Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const bookings = await this.getBookings();
    const todayStr = new Date().toISOString().split('T')[0];

    const stats: DashboardStats = {
      totalBookings: bookings.length,
      todaysBookings: bookings.filter(b => b.booking_date === todayStr).length,
      upcomingTours: bookings.filter(b => b.travel_date >= todayStr && b.booking_status !== 'Cancelled').length,
      pendingPayments: bookings.filter(b => b.balance_amount > 0).length,
      confirmedTours: bookings.filter(b => b.booking_status === 'Confirmed').length,
      cancelledTours: bookings.filter(b => b.booking_status === 'Cancelled').length,
      totalRevenue: bookings.reduce((sum, b) => b.booking_status !== 'Cancelled' ? sum + Number(b.package_amount) : sum, 0),
      advanceCollected: bookings.reduce((sum, b) => b.booking_status !== 'Cancelled' ? sum + Number(b.advance_paid) : sum, 0),
      balancePending: bookings.reduce((sum, b) => b.booking_status !== 'Cancelled' ? sum + Number(b.balance_amount) : sum, 0),
    };

    return stats;
  },

  // Get Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data && data.length > 0) return data as ActivityLog[];
    }
    return getLocalActivityLogs();
  }
};
