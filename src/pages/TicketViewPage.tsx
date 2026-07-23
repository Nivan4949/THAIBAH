import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useSettings } from '../context/SettingsContext';
import { Booking } from '../types/database';
import { QRCodeSVG } from 'qrcode.react';
import html2pdf from 'html2pdf.js';
import {
  Printer,
  FileDown,
  ArrowLeft,
  Edit,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Bus,
  Award,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export const TicketViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (bookingId: string) => {
    setLoading(true);
    const fetchedBooking = await bookingService.getBookingById(bookingId);
    setBooking(fetchedBooking);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !booking) return;

    setPdfGenerating(true);
    toast.loading('Generating official travel voucher PDF...', { id: 'pdf' });

    const element = ticketRef.current;
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `Thaibah-Travels-Voucher-${booking.booking_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    try {
      await html2pdf().from(element).set(opt).save();
      toast.success(`PDF downloaded: Thaibah-Travels-Voucher-${booking.booking_id}.pdf`, { id: 'pdf' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Could not generate PDF. You may use Print to PDF as fallback.', { id: 'pdf' });
    } finally {
      setPdfGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <div className="w-10 h-10 border-4 border-brand-900/20 border-t-brand-900 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold">Generating Official Travel Voucher...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500">Booking record not found.</p>
        <Link to="/bookings" className="text-brand-900 underline font-bold text-sm">
          Return to Bookings List
        </Link>
      </div>
    );
  }

  const termsList = settings?.terms_conditions
    ? settings.terms_conditions.split('\n').filter((t) => t.trim().length > 0)
    : [
        '• Report 30 minutes before departure.',
        '• Carry valid government ID.',
        '• Seat numbers may change due to operational reasons.',
        '• Company isn\'t responsible for delays due to weather or traffic.',
        '• Cancellation policy applies.',
        '• Smoking and alcohol are prohibited.',
        '• Passengers are responsible for their own belongings.',
      ];

  const logoSrc = settings?.logo || '/logo-official.svg';

  const qrPayload = JSON.stringify({
    system: `${settings.company_name} Official System`,
    booking_id: booking.booking_id,
    guest: booking.guest_name,
    travel_date: booking.travel_date,
    seats: booking.seat_numbers || 'Assigned On Board',
    pax: booking.total_pax,
    status: booking.booking_status,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Action Toolbar */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/bookings')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to={`/bookings/${booking.booking_id}/edit`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-brand-900 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition shadow-sm"
          >
            <FileDown className="w-4 h-4 text-brand-900" />
            <span>{pdfGenerating ? 'Preparing PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Travel Voucher (A4)</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          LUXURY BOARDING PASS / TRAVEL VOUCHER SCREEN & PRINT
          ======================================================== */}
      <div
        ref={ticketRef}
        className="printable-ticket bg-white rounded-3xl overflow-hidden border-2 border-brand-900/20 shadow-2xl relative text-slate-900 font-sans watermark-overlay"
      >
        {/* HERO HEADER SECTION WITH TRAVEL GRADIENT */}
        <div className="royal-header-gradient p-6 lg:p-8 text-white relative overflow-hidden border-b-4 border-amber-400">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-md shrink-0">
                <img src={logoSrc} alt={settings.company_name} className="h-12 object-contain" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                  OFFICIAL BOARDING PASS VOUCHER
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                  TOUR BOOKING CONFIRMATION
                </h2>
                <div className="text-xs text-blue-100 font-medium">
                  {booking.package_name}
                </div>
              </div>
            </div>

            {/* Booking Code & Confirmation Badge */}
            <div className="text-right flex flex-col items-start sm:items-end">
              <div className="px-3.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold tracking-wider uppercase shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMED VOUCHER</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-amber-300 mt-1">
                ID: {booking.booking_id}
              </div>
              <div className="text-[10px] text-blue-100 font-medium">Issued: {booking.booking_date}</div>
            </div>
          </div>
        </div>

        {/* MAIN VOUCHER BODY */}
        <div className="p-6 lg:p-8 space-y-6 relative z-10">
          {/* GUEST & PASSENGER CARDS WITH TRAVEL ICONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Guest Name Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-900" />
                <span>Passenger / Guest</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-1">{booking.guest_name}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{booking.phone}</div>
            </div>

            {/* Travel Date & Seats Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-900" />
                <span>Travel Date &amp; Seats</span>
              </div>
              <div className="text-base font-extrabold text-brand-900 mt-1">{booking.travel_date}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5 font-mono">
                Seats: {booking.seat_numbers || 'Assigned On Board'}
              </div>
            </div>

            {/* Passenger Count Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-900" />
                <span>Total Passengers</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {booking.total_pax} Headcount
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                ({booking.adults} Adults, {booking.children} Children)
              </div>
            </div>
          </div>

          {/* ITINERARY & TIMINGS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Route Locations */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pickup Location</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {booking.pickup_location}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Drop-off Destination</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {booking.dropoff_location}
                </div>
              </div>
            </div>

            {/* Departure Timings */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-900" />
                  <span>Reporting Time</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {booking.reporting_time || '30 Mins Before Departure'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-brand-900" />
                  <span>Departure Time</span>
                </div>
                <div className="text-sm font-extrabold text-brand-900 mt-0.5">
                  {booking.departure_time || 'As Scheduled'}
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY & SCANNABLE QR PASS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial Schedule */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Package Fare</div>
                <div className="text-xl font-extrabold text-slate-900">{formatCurrency(booking.package_amount)}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Advance Paid</div>
                <div className="text-sm font-bold text-emerald-700">{formatCurrency(booking.advance_paid)}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Balance Due</div>
                <div className="text-sm font-bold text-amber-700">{formatCurrency(booking.balance_amount)}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Payment Status</div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    booking.payment_status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : booking.payment_status === 'Advance Paid'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {booking.payment_status}
                </span>
              </div>
            </div>

            {/* SCANNABLE QR CODE & GREEN VERIFIED BOOKING BADGE */}
            <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>VERIFIED BOOKING</span>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                <QRCodeSVG value={qrPayload} size={135} level="H" />
              </div>

              <div className="font-mono text-xs font-extrabold text-brand-900">
                {booking.booking_id}
              </div>
            </div>
          </div>

          {/* OFFICIAL TERMS & CONDITIONS */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Terms &amp; Conditions</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-700 font-medium">
              {termsList.map((term, index) => (
                <div key={index} className="leading-relaxed">
                  {term.startsWith('•') ? term : `• ${term}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OFFICIAL FOOTER SECTION */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-extrabold text-sm text-amber-300">{settings.company_name || 'Thaibah Travels'}</div>
            <div className="text-slate-300 mt-0.5">{settings.address || 'Chenguvetty, Kottakkal, Malappuram, Kerala, India'}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Operating By: <strong className="text-white">{settings.operating_by || 'Thaibah Travels Hyderabad'}</strong>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="flex items-center sm:justify-end gap-1.5 text-slate-200 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.phone || '+91 98765 43210 / +91 94000 12345'}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-slate-200 font-medium">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.email || 'info@thaibahtravels.com'}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-amber-300 font-bold text-[11px]">
              <Globe className="w-3.5 h-3.5" />
              <span>www.thaibahtravels.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
