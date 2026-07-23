import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingListPage } from './pages/BookingListPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { TicketViewPage } from './pages/TicketViewPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Toaster position="top-right" theme="light" richColors />
              <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected SaaS App Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="bookings" element={<BookingListPage />} />
                  <Route path="bookings/new" element={<BookingFormPage />} />
                  <Route path="bookings/:id/edit" element={<BookingFormPage />} />
                  <Route path="bookings/:id/ticket" element={<TicketViewPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch All Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
