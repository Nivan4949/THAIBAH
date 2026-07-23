import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Setting } from '../types/database';
import { initialSettings } from './mockData';

const LOCAL_STORAGE_SETTINGS_KEY = 'thaibah_company_settings_v2';

export const settingsService = {
  async getSettings(): Promise<Setting> {
    // 1. Check local storage cache for instant rendering
    const cached = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    let baseSettings: Setting = initialSettings;
    if (cached) {
      try {
        baseSettings = JSON.parse(cached);
      } catch {
        baseSettings = initialSettings;
      }
    }

    // 2. Sync with Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const remoteSetting = data[0] as Setting;
          localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(remoteSetting));
          return remoteSetting;
        }
      } catch (err) {
        console.warn('Supabase fetch settings warning:', err);
      }
    }

    return baseSettings;
  },

  async updateSettings(settingsData: Partial<Setting>): Promise<Setting> {
    const current = await this.getSettings();
    const updatedPayload: Setting = {
      ...current,
      ...settingsData,
      updated_at: new Date().toISOString(),
    };

    // 1. ALWAYS persist to local storage immediately to prevent reversion on refresh
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updatedPayload));

    // 2. Sync to Supabase for cross-device global persistence
    if (isSupabaseConfigured && supabase) {
      try {
        // Query existing setting record ID in Supabase
        const { data: existingRows } = await supabase
          .from('settings')
          .select('id')
          .limit(1);

        const targetId = existingRows && existingRows.length > 0 ? existingRows[0].id : current.id;

        if (targetId) {
          const { data, error } = await supabase
            .from('settings')
            .update(updatedPayload)
            .eq('id', targetId)
            .select()
            .single();

          if (error) {
            console.error('Supabase settings update failed:', error.message || error);
          } else if (data) {
            const savedSetting = data as Setting;
            localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(savedSetting));
            return savedSetting;
          }
        } else {
          const { data, error } = await supabase
            .from('settings')
            .insert([updatedPayload])
            .select()
            .single();

          if (error) {
            console.error('Supabase settings insert failed:', error.message || error);
          } else if (data) {
            const savedSetting = data as Setting;
            localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(savedSetting));
            return savedSetting;
          }
        }
      } catch (err) {
        console.error('Supabase settings update exception:', err);
      }
    }

    return updatedPayload;
  }
};
