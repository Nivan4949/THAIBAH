import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { BookingStatus, PaymentStatus } from '../types/database';
import {
  User,
  Phone,
  Mail,
  Users,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Save,
  ArrowLeft,
  Ticket,
  Bus,
  CreditCard,
  Award,
  Luggage,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  // Form State
  const [bookingId, setBookingId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [packageName, setPackageName] = useState('Premium Royal Umrah Package');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [travelDate, setTravelDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Thaibah Office, Chenguvetty');
  const [dropoffLocation, setDropoffLocation] = useState('Cochin International Airport (COK)');
  const [seatNumbers, setSeatNumbers] = useState('01A, 01B');
  const [reportingTime, setReportingTime] = useState('04:30 AM');
  const [departureTime, setDepartureTime] = useState('05:00 AM');
  const [packageAmount, setPackageAmount] = useState<number>(150000);
  const [advancePaid, setAdvancePaid] = useState<number>(50000);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('Confirmed');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Advance Paid');

  // Derived Values
  const totalPax = (Number(adults) || 0) + (Number(children) || 0);
  const balanceAmount = Math.max(0, (Number(packageAmount) || 0) - (Number(advancePaid) || 0));

  useEffect(() => {
    if (isEditing && id) {
      loadBookingToEdit(id);
    } else {
      generateId();
    }
  }, [id]);

  useEffect(() => {
    const pkg = Number(packageAmount) || 0;
    const adv = Number(advancePaid) || 0;
    const bal = pkg - adv;

    if (bal <= 0 && pkg > 0) {
      setPaymentStatus('Paid');
    } else if (adv > 0 && bal > 0) {
      setPaymentStatus('Advance Paid');
    } else if (adv === 0) {
      setPaymentStatus('Pending');
    }
  }, [packageAmount, advancePaid]);

  const generateId = async () => {
    const nextId = await bookingService.generateNextBookingId();
    setBookingId(nextId);
  };

  const loadBookingToEdit = async (bookingIdToFetch: string) => {
    setFetching(true);
    const existing = await bookingService.getBookingById(bookingIdToFetch);
    setFetching(false);

    if (existing) {
      setBookingId(existing.booking_id);
      setGuestName(existing.guest_name);
      setPhone(existing.phone);
      setEmail(existing.email || '');
      setAdults(existing.adults);
      setChildren(existing.children);
      setPackageName(existing.package_name);
      setBookingDate(existing.booking_date);
      setTravelDate(existing.travel_date);
      setPickupLocation(existing.pickup_location);
      setDropoffLocation(existing.dropoff_location);
      setSeatNumbers(existing.seat_numbers || '');
      setReportingTime(existing.reporting_time || '');
      setDepartureTime(existing.departure_time || '');
      setPackageAmount(existing.package_amount);
      setAdvancePaid(existing.advance_paid);
      setBookingStatus(existing.booking_status);
      setPaymentStatus(existing.payment_status);
    } else {
      toast.error('Booking record not found.');
      navigate('/bookings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error('Please enter guest name.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter passenger phone number.');
      return;
    }
    if (!travelDate) {
      toast.error('Please select travel date.');
      return;
    }

    setLoading(true);

    const payload = {
      booking_id: bookingId,
      guest_name: guestName,
      phone,
      email,
      adults: Number(adults),
      children: Number(children),
      package_name: packageName,
      booking_date: bookingDate,
      travel_date: travelDate,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      seat_numbers: seatNumbers,
      reporting_time: reportingTime,
      departure_time: departureTime,
      package_amount: Number(packageAmount),
      advance_paid: Number(advancePaid),
      payment_status: paymentStatus,
      booking_status: bookingStatus,
    };

    if (isEditing && id) {
      const updated = await bookingService.updateBooking(id, payload);
      setLoading(false);
      if (updated) {
        toast.success(`Booking ${bookingId} updated successfully!`);
        navigate(`/bookings/${updated.booking_id}/ticket`);
      } else {
        toast.error('Failed to update booking record.');
      }
    } else {
      const created = await bookingService.createBooking(payload);
      setLoading(false);
      if (created) {
        toast.success(`New Booking ${created.booking_id} created successfully!`);
        navigate(`/bookings/${created.booking_id}/ticket`);
      } else {
        toast.error('Failed to create booking record.');
      }
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <div className="w-10 h-10 border-4 border-brand-900/20 border-t-brand-900 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading Booking Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </button>

        <div className="px-3.5 py-1.5 rounded-full bg-brand-900 text-white text-xs font-mono font-extrabold shadow-sm">
          Booking Code: {bookingId}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <h1 className="text-2xl font-extrabold text-white">
          {isEditing ? `Edit Booking Record (${bookingId})` : 'New Tour Voucher Registration'}
        </h1>
        <p className="text-xs text-blue-100 mt-1">
          Fill out passenger details, travel parameters, seat assignments, and payment schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Guest Details */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <User className="w-4 h-4 text-brand-900" />
            <span>Guest &amp; Passenger Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guest Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guest Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Mohammed Al-Rashid"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="passenger@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Adults & Children Pax Count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-brand-900" />
                    <span>Adults</span>
                  </div>
                </label>
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Luggage className="w-3 h-3 text-brand-900" />
                    <span>Children</span>
                  </div>
                </label>
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-semibold">Total Passenger Headcount (Pax):</span>
            <span className="text-brand-900 font-extrabold text-sm">{totalPax} Passengers</span>
          </div>
        </div>

        {/* SECTION 2: Tour & Package Parameters */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <Ticket className="w-4 h-4 text-brand-900" />
            <span>Tour Package &amp; Registration Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Booking ID (Auto) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking ID (Auto Generated)
              </label>
              <input
                type="text"
                disabled
                value={bookingId}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono font-bold text-brand-900"
              />
            </div>

            {/* Package Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Package / Tour Title *
              </label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. Premium Royal Umrah Package"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Booking Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-900" />
                  <span>Booking Registration Date</span>
                </div>
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <div className="flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-brand-900" />
                  <span>Travel / Departure Date *</span>
                </div>
              </label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Booking Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Status
              </label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-900"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Travel Itinerary & Timing */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-900" />
            <span>Travel Itinerary, Seats &amp; Timings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Point Location *
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Thaibah Office, Chenguvetty"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Drop-off Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Drop-off Destination *
              </label>
              <input
                type="text"
                required
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="e.g. Cochin International Airport (COK)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Seat Numbers */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seat Number(s)
              </label>
              <input
                type="text"
                value={seatNumbers}
                onChange={(e) => setSeatNumbers(e.target.value)}
                placeholder="e.g. 04A, 04B, 05A"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Reporting & Departure Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-900" />
                    <span>Reporting Time</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={reportingTime}
                  onChange={(e) => setReportingTime(e.target.value)}
                  placeholder="08:30 AM"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-900" />
                    <span>Departure Time</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Financial Schedule & Payment Details */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-brand-900" />
            <span>Financial Schedule &amp; Fare Collection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Package Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Package Amount (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={packageAmount}
                onChange={(e) => setPackageAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Advance Paid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                min={0}
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-extrabold text-emerald-600 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Balance Amount (Auto) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Balance Due (₹ Auto)
              </label>
              <input
                type="number"
                disabled
                value={balanceAmount}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-extrabold text-amber-600"
              />
            </div>
          </div>

          {/* Payment Status Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Status Classification
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-900"
              >
                <option value="Paid">Paid (Full Payment Cleared)</option>
                <option value="Advance Paid">Advance Paid (Partial Balance)</option>
                <option value="Pending">Pending (No Payment Received)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-2xl text-sm shadow-md flex items-center gap-2 transition transform active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Booking Record' : 'Save & Issue Travel Voucher'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
