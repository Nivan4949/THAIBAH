import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Setting } from '../types/database';
import { initialSettings } from './mockData';

const LOCAL_STORAGE_SETTINGS_KEY = 'thaibah_company_settings_v1';

export const settingsService = {
  async getSettings(): Promise<Setting> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (!error && data) {
        return data as Setting;
      }
    }

    // Local storage fallback
    const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(initialSettings));
      return initialSettings;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return initialSettings;
    }
  },

  async updateSettings(settingsData: Partial<Setting>): Promise<Setting> {
    const current = await this.getSettings();
    const updatedPayload = {
      ...current,
      ...settingsData,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      if (current.id) {
        const { data, error } = await supabase
          .from('settings')
          .update(updatedPayload)
          .eq('id', current.id)
          .select()
          .single();
        if (!error && data) return data as Setting;
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert([updatedPayload])
          .select()
          .single();
        if (!error && data) return data as Setting;
      }
    }

    // Local storage update
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updatedPayload));
    return updatedPayload;
  }
};
