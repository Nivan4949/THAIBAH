import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Database,
  Award,
  Sparkles,
  Plane,
  Bus
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'All Tour Bookings', path: '/bookings', icon: Ticket },
    { label: 'New Registration', path: '/bookings/new', icon: PlusCircle },
    { label: 'Company Settings', path: '/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Executive Dashboard';
    if (path === '/bookings') return 'Tour Booking Management';
    if (path === '/bookings/new') return 'New Tour Voucher Registration';
    if (path.includes('/edit')) return 'Edit Booking Record';
    if (path.includes('/ticket')) return 'Official Travel Voucher & Boarding Pass';
    if (path === '/settings') return 'Company Branding & Settings';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar Header */}
      <header className="no-print h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official Brand Identity */}
          <div className="flex items-center gap-3">
            <img src="/logo-official.svg" alt="Thaibah Travels" className="h-9 object-contain" />
            <span className="text-slate-300 hidden sm:inline">|</span>
            <h1 className="text-sm lg:text-base font-extrabold text-brand-900 dark:text-white tracking-tight hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Accreditation Badge Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>IATA / TAFI Approved</span>
          </div>

          {/* Database Status */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isSupabaseConfigured
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Mode'}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-900 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-brand-900" />}
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-brand-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Thaibah Admin'}</div>
              <div className="text-[10px] text-slate-500">{user?.email || 'admin@thaibahtravels.com'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`no-print hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <img src="/logo-icon.svg" alt="Thaibah Icon" className="w-8 h-8 shrink-0" />
            {sidebarOpen && (
              <div>
                <div className="text-sm font-extrabold text-brand-900 dark:text-white tracking-wider font-display">
                  THAIBAH TRAVELS
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Software Suite
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-900 text-white font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-brand-900 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Info Box */}
          {sidebarOpen && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 m-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-brand-900 dark:text-gold-400 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>Official Travel Portal</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Chenguvetty, Kottakkal, Malappuram, Kerala
              </p>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="no-print lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col">
            <div className="p-4 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-200">
              <img src="/logo-official.svg" alt="Thaibah Logo" className="h-8" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-2 bg-white dark:bg-slate-900 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                        isActive ? 'bg-brand-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content Page Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
