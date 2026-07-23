import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking, DashboardStats, ActivityLog } from '../types/database';
import { motion } from 'framer-motion';
import {
  Ticket,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Eye,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Bus,
  Luggage,
  Award,
  Sparkles,
  Plane
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [fetchedStats, bookingsList, logs] = await Promise.all([
      bookingService.getDashboardStats(),
      bookingService.getBookings(),
      bookingService.getActivityLogs(),
    ]);

    setStats(fetchedStats);
    setRecentBookings(bookingsList.slice(0, 5));
    setActivityLogs(logs);
    setLoading(false);
  };

  const chartData = [
    { month: 'Mar', bookings: 12, revenue: 1450000 },
    { month: 'Apr', bookings: 18, revenue: 2100000 },
    { month: 'May', bookings: 24, revenue: 2890000 },
    { month: 'Jun', bookings: 31, revenue: 3650000 },
    { month: 'Jul', bookings: recentBookings.length + 20, revenue: stats ? stats.totalRevenue : 4200000 },
    { month: 'Aug', bookings: 35, revenue: 4800000 },
  ];

  const pieData = stats ? [
    { name: 'Paid', value: stats.confirmedTours - stats.pendingPayments, color: '#10B981' },
    { name: 'Advance Paid', value: stats.pendingPayments, color: '#F59E0B' },
    { name: 'Cancelled', value: stats.cancelledTours, color: '#EF4444' },
  ] : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <div className="w-10 h-10 border-4 border-brand-900/20 border-t-brand-900 rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold">Loading Executive Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Royal Banner Header */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-brand-800/30">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full mb-3 border border-amber-300/30">
            <Award className="w-3.5 h-3.5" />
            Official Thaibah Management Platform
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Executive Tour &amp; Booking Control
          </h1>
          <p className="text-xs lg:text-sm text-blue-100 mt-1 max-w-2xl">
            Real-time analytics for luxury tours, Umrah packages, passenger registrations, and payment collections.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/bookings/new"
            className="flex-1 md:flex-none px-6 py-3.5 bg-gradient-to-r from-amber-400 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-slate-950 font-extrabold rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Booking</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Bookings */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-blue-50 text-brand-900 border border-blue-100">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.totalBookings || 0}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold flex items-center">
              +12% <TrendingUp className="w-3 h-3 ml-0.5" />
            </span>
            this month
          </div>
        </motion.div>

        {/* Today's Bookings */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Bookings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.todaysBookings || 0}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">New registrations</div>
        </motion.div>

        {/* Upcoming Tours */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Tours</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.upcomingTours || 0}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">Scheduled departures</div>
        </motion.div>

        {/* Confirmed Tours */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.confirmedTours || 0}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">Ready for travel</div>
        </motion.div>

        {/* Pending Payments */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Balances</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats?.pendingPayments || 0}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-semibold">
            Due: {formatCurrency(stats?.balancePending || 0)}
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-amber-300 dark:border-amber-500/30 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/40"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Total Fare Value</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-brand-900">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            Advance: <span className="text-emerald-600 font-bold">{formatCurrency(stats?.advanceCollected || 0)}</span>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Booking & Revenue Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Booking Growth &amp; Revenue Trajectory</h2>
              <p className="text-xs text-slate-500">Monthly passenger count vs package booking fare value</p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              2026 Season
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Classification</h2>
            <p className="text-xs text-slate-500">Proportion of Fully Paid vs Advance vs Pending</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
              <div className="text-[11px] text-slate-500 font-medium">Fully Paid</div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {stats ? stats.confirmedTours - stats.pendingPayments : 0}
              </div>
            </div>
            <div>
              <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
              <div className="text-[11px] text-slate-500 font-medium">Advance</div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">{stats?.pendingPayments || 0}</div>
            </div>
            <div>
              <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1" />
              <div className="text-[11px] text-slate-500 font-medium">Cancelled</div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">{stats?.cancelledTours || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Bookings & System Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Passenger Vouchers</h2>
              <p className="text-xs text-slate-500">Latest travel bookings issued</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-bold text-brand-900 hover:underline flex items-center gap-1 transition"
            >
              <span>View All ({stats?.totalBookings})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Guest Name</th>
                  <th className="py-3 px-3">Travel Date</th>
                  <th className="py-3 px-3">Package Title</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-brand-900 dark:text-gold-400">
                      {b.booking_id}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {b.guest_name}
                      <div className="text-[10px] text-slate-400 font-normal">{b.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">{b.travel_date}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[150px] truncate">
                      {b.package_name}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/bookings/${b.booking_id}/ticket`}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-brand-900 hover:bg-brand-800 text-white font-bold transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Activity Log */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-900 dark:text-gold-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Audit Trail</span>
          </div>

          <div className="space-y-3 max-h-[330px] overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="w-7 h-7 rounded-full bg-brand-900/10 text-brand-900 dark:text-gold-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
