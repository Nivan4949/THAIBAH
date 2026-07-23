import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types/database';
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  X,
  Ticket,
  Bus,
  Users,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<'booking_id' | 'guest_name' | 'travel_date' | 'package_amount'>('travel_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const data = await bookingService.getBookings();
    setBookings(data);
    setLoading(false);
  };

  const handleDuplicate = async (booking: Booking) => {
    toast.loading('Duplicating booking record...', { id: 'dup' });
    const duplicated = await bookingService.duplicateBooking(booking.id);
    if (duplicated) {
      toast.success(`Booking duplicated! New ID: ${duplicated.booking_id}`, { id: 'dup' });
      await fetchBookings();
    } else {
      toast.error('Failed to duplicate booking.', { id: 'dup' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await bookingService.deleteBooking(deleteTarget.id);
    setDeleting(false);
    if (success) {
      toast.success(`Booking ${deleteTarget.booking_id} deleted successfully.`);
      setDeleteTarget(null);
      await fetchBookings();
    } else {
      toast.error('Failed to delete booking.');
    }
  };

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        b.booking_id.toLowerCase().includes(searchLower) ||
        b.guest_name.toLowerCase().includes(searchLower) ||
        b.phone.toLowerCase().includes(searchLower) ||
        b.package_name.toLowerCase().includes(searchLower);

      const matchesBookingStatus = selectedBookingStatus === 'ALL' || b.booking_status === selectedBookingStatus;
      const matchesPaymentStatus = selectedPaymentStatus === 'ALL' || b.payment_status === selectedPaymentStatus;
      const matchesDate = !selectedDate || b.travel_date === selectedDate;

      return matchesSearch && matchesBookingStatus && matchesPaymentStatus && matchesDate;
    });
  }, [bookings, searchTerm, selectedBookingStatus, selectedPaymentStatus, selectedDate]);

  // Sort Logic
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'package_amount') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBookings, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedBookings.slice(start, start + itemsPerPage);
  }, [sortedBookings, currentPage]);

  const handleSort = (field: 'booking_id' | 'guest_name' | 'travel_date' | 'package_amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tour Booking Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, issue vouchers, duplicate records, and manage passenger manifests.
          </p>
        </div>

        <Link
          to="/bookings/new"
          className="px-5 py-3 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-2xl text-xs shadow-md flex items-center gap-2 transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Tour Voucher Registration</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID (TB000001), Guest Name, Phone..."
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Booking Status Filter */}
          <div>
            <select
              value={selectedBookingStatus}
              onChange={(e) => {
                setSelectedBookingStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-900 font-medium"
            >
              <option value="ALL">Booking Status: All</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-900 font-medium"
            >
              <option value="ALL">Payment Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Advance Paid">Advance Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Travel Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-900"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="absolute right-8 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort('booking_id')}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Booking ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('guest_name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Passenger Details</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('travel_date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Travel Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Package &amp; Pickup</th>
                <th
                  onClick={() => handleSort('package_amount')}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Fare &amp; Payment</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-brand-900/30 border-t-brand-900 rounded-full animate-spin mx-auto mb-2" />
                    Loading booking manifest...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No booking records found matching your query filters.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                    {/* Booking ID */}
                    <td className="py-4 px-4 font-mono font-bold text-brand-900 dark:text-gold-400">
                      {b.booking_id}
                      <div className="text-[10px] text-slate-400 font-sans font-medium mt-0.5">
                        {b.total_pax} Pax ({b.adults}A, {b.children}C)
                      </div>
                    </td>

                    {/* Guest Name */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{b.guest_name}</div>
                      <div className="text-xs text-slate-500 font-medium">{b.phone}</div>
                      {b.email && <div className="text-[11px] text-slate-400">{b.email}</div>}
                    </td>

                    {/* Travel Date */}
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-900" />
                        <span>{b.travel_date}</span>
                      </div>
                      {b.reporting_time && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          Rep: {b.reporting_time}
                        </div>
                      )}
                    </td>

                    {/* Package & Pickup */}
                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{b.package_name}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Pickup: {b.pickup_location}
                      </div>
                    </td>

                    {/* Fare & Payment */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(b.package_amount)}</div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.payment_status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.payment_status === 'Advance Paid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {b.payment_status}
                        </span>
                      </div>
                      {b.balance_amount > 0 && (
                        <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                          Bal: {formatCurrency(b.balance_amount)}
                        </div>
                      )}
                    </td>

                    {/* Booking Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.booking_status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.booking_status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.booking_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/bookings/${b.booking_id}/ticket`}
                          className="p-1.5 rounded-lg bg-brand-900 text-white hover:bg-brand-800 transition"
                          title="View Official Travel Voucher"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/bookings/${b.booking_id}/edit`}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                          title="Edit Booking Record"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(b)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                          title="Duplicate Booking"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                          title="Delete Booking Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{paginatedBookings.length}</span> of{' '}
            <span className="font-bold text-slate-900">{sortedBookings.length}</span> booking records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Delete Booking</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to permanently delete booking record{' '}
              <span className="text-brand-900 font-mono font-bold">{deleteTarget.booking_id}</span> for{' '}
              <span className="text-slate-900 font-bold">{deleteTarget.guest_name}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
