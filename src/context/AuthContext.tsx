import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser } from '../types/database';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const LOCAL_STORAGE_AUTH_KEY = 'thaibah_admin_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || 'admin@thaibahtravels.com',
            name: data.session.user.user_metadata?.name || 'Thaibah Admin',
          });
        }
      } else {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailOrUsername: string, password?: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const email = emailOrUsername.includes('@')
      ? emailOrUsername
      : `${emailOrUsername.toLowerCase()}@thaibahtravels.com`;

    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const loggedUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || emailOrUsername,
        };
        setUser(loggedUser);
        if (rememberMe) {
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(loggedUser));
        }
        setIsLoading(false);
        return { success: true };
      }
    }

    // Demo Mode Authentication Fallback
    const demoUser: AdminUser = {
      id: 'admin-demo-001',
      email: email,
      name: emailOrUsername === 'admin' ? 'Thaibah Admin' : emailOrUsername,
    };
    setUser(demoUser);
    if (rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(demoUser));
    }
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    setUser(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Password reset link sent to your email.' };
    }
    return { success: true, message: 'Password reset link simulated. You may login using demo mode.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
