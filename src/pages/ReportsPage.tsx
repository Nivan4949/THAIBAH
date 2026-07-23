import React, { useState, useEffect, useMemo } from 'react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types/database';
import { useSettings } from '../context/SettingsContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Bus,
  Award,
  Sparkles,
  ArrowUpRight,
  PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const { settings } = useSettings();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [dateFilter, setDateFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const list = await bookingService.getBookings();
    setBookings(list);
    setLoading(false);
  };

  // Date Filtering Logic
  const filteredBookings = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return bookings.filter((b) => {
      // Date Filter
      if (dateFilter === 'THIS_MONTH') {
        const currentMonth = todayStr.substring(0, 7); // YYYY-MM
        if (!b.travel_date.startsWith(currentMonth) && !b.booking_date.startsWith(currentMonth)) {
          return false;
        }
      } else if (dateFilter === 'LAST_30') {
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (b.booking_date < thirtyDaysAgo) return false;
      } else if (dateFilter === 'THIS_YEAR') {
        const currentYear = todayStr.substring(0, 4);
        if (!b.travel_date.startsWith(currentYear) && !b.booking_date.startsWith(currentYear)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.booking_id.toLowerCase().includes(q) ||
          b.guest_name.toLowerCase().includes(q) ||
          b.package_name.toLowerCase().includes(q) ||
          b.phone.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [bookings, dateFilter, searchQuery]);

  // Derived Financial Statistics
  const financialStats = useMemo(() => {
    const totalBookings = filteredBookings.length;
    const totalPax = filteredBookings.reduce((sum, b) => sum + Number(b.total_pax), 0);
    const totalRevenue = filteredBookings.reduce((sum, b) => b.booking_status !== 'Cancelled' ? sum + Number(b.package_amount) : sum, 0);
    const totalAdvance = filteredBookings.reduce((sum, b) => b.booking_status !== 'Cancelled' ? sum + Number(b.advance_paid) : sum, 0);
    const totalBalance = filteredBookings.reduce((sum, b) => b.booking_status !== 'Cancelled' ? sum + Number(b.balance_amount) : sum, 0);
    const avgValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalBookings,
      totalPax,
      totalRevenue,
      totalAdvance,
      totalBalance,
      avgValue,
    };
  }, [filteredBookings]);

  // Package Distribution Chart Data
  const packageDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredBookings.forEach((b) => {
      if (b.booking_status !== 'Cancelled') {
        counts[b.package_name] = (counts[b.package_name] || 0) + 1;
      }
    });

    const colors = ['#1E3A8A', '#0284C7', '#D97706', '#10B981', '#8B5CF6', '#EC4899'];
    return Object.keys(counts).map((pkg, idx) => ({
      name: pkg,
      count: counts[pkg],
      color: colors[idx % colors.length],
    }));
  }, [filteredBookings]);

  // Export CSV Data Handler
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error('No booking records to export.');
      return;
    }

    const headers = [
      'Booking ID',
      'Guest Name',
      'Phone',
      'Email',
      'Travel Date',
      'Package Title',
      'Passengers (Pax)',
      'Pickup Location',
      'Dropoff Location',
      'Seats',
      'Package Fare (INR)',
      'Advance Paid (INR)',
      'Balance Due (INR)',
      'Payment Status',
      'Booking Status',
    ];

    const csvRows = [headers.join(',')];

    filteredBookings.forEach((b) => {
      const row = [
        `"${b.booking_id}"`,
        `"${b.guest_name.replace(/"/g, '""')}"`,
        `"${b.phone}"`,
        `"${b.email || ''}"`,
        `"${b.travel_date}"`,
        `"${b.package_name.replace(/"/g, '""')}"`,
        b.total_pax,
        `"${b.pickup_location.replace(/"/g, '""')}"`,
        `"${b.dropoff_location.replace(/"/g, '""')}"`,
        `"${b.seat_numbers || ''}"`,
        b.package_amount,
        b.advance_paid,
        b.balance_amount,
        `"${b.payment_status}"`,
        `"${b.booking_status}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Thaibah-Travels-Financial-Manifest-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Financial Manifest exported successfully!');
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
        <p className="text-sm font-semibold">Generating Executive Financial Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Banner & Title */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full mb-3 border border-amber-300/30">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Business Intelligence
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Financial &amp; Tour Analytics Reports
          </h1>
          <p className="text-xs lg:text-sm text-blue-100 mt-1">
            Revenue trajectory, passenger manifests, payment collections, and package distribution.
          </p>
        </div>

        <div className="no-print flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl text-xs shadow flex items-center justify-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV Manifest</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-amber-400 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Search Bar */}
      <div className="no-print glass-card rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Timeframe:</span>
          {(
            [
              { key: 'ALL', label: 'All Time' },
              { key: 'THIS_MONTH', label: 'This Month' },
              { key: 'LAST_30', label: 'Last 30 Days' },
              { key: 'THIS_YEAR', label: 'This Year' },
            ] as const
          ).map((btn) => (
            <button
              key={btn.key}
              onClick={() => setDateFilter(btn.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                dateFilter === btn.key
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter report records..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-900 font-medium"
          />
        </div>
      </div>

      {/* KPI Financial Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase">Gross Package Revenue</div>
          <div className="text-2xl font-extrabold text-brand-900 mt-2">
            {formatCurrency(financialStats.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Confirmed tour bookings</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase">Advance Collections</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatCurrency(financialStats.totalAdvance)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Funds received in bank</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase">Outstanding Due</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            {formatCurrency(financialStats.totalBalance)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Pending balance collection</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Passengers (Pax)</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {financialStats.totalPax} Passengers
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Headcount registered</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase">Vouchers Issued</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {financialStats.totalBookings} Bookings
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Travel passes generated</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/50">
          <div className="text-xs font-bold text-slate-500 uppercase">Avg Package Value</div>
          <div className="text-2xl font-extrabold text-brand-900 mt-2">
            {formatCurrency(financialStats.avgValue)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Per booking average</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package Popularity Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Package Popularity</h2>
            <p className="text-xs text-slate-500">Tour package distribution</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {packageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
            {packageDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.count} Bookings</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Performance Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue &amp; Collections Trajectory</h2>
              <p className="text-xs text-slate-500">Gross revenue vs Advance collections breakdown</p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-blue-50 text-brand-900 text-xs font-bold">
              {filteredBookings.length} Total Records
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredBookings.slice(0, 10).map((b) => ({
                  id: b.booking_id,
                  packageFare: b.package_amount,
                  advance: b.advance_paid,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px' }} />
                <Bar dataKey="packageFare" name="Package Fare" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="advance" name="Advance Paid" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Printable Passenger & Financial Manifest Table */}
      <div className="printable-ticket glass-card rounded-3xl border border-slate-200 overflow-hidden shadow-card p-6 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-brand-900">
              {settings.company_name} • Financial Report
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Passenger Travel &amp; Revenue Manifest</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating By: {settings.operating_by} • Generated on {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold text-brand-900">
              Total Fare: {formatCurrency(financialStats.totalRevenue)}
            </div>
            <div className="text-xs text-emerald-600 font-bold">
              Collected: {formatCurrency(financialStats.totalAdvance)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Booking ID</th>
                <th className="py-3 px-3">Guest Name</th>
                <th className="py-3 px-3">Travel Date</th>
                <th className="py-3 px-3">Package Title</th>
                <th className="py-3 px-3">Pax</th>
                <th className="py-3 px-3 text-right">Package Fare</th>
                <th className="py-3 px-3 text-right">Advance Paid</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-brand-900">{b.booking_id}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {b.guest_name}
                    <div className="text-[10px] text-slate-400 font-normal">{b.phone}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{b.travel_date}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{b.package_name}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{b.total_pax}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(b.package_amount)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">
                    {formatCurrency(b.advance_paid)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600">
                    {formatCurrency(b.balance_amount)}
                  </td>
                  <td className="py-3 px-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
