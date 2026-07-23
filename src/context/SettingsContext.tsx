import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import { Setting } from '../types/database';
import { initialSettings } from '../services/mockData';

interface SettingsContextType {
  settings: Setting;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<Setting>) => Promise<Setting>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Setting>(initialSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Error loading settings, using default:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (newSettings: Partial<Setting>): Promise<Setting> => {
    setIsLoading(true);
    const updated = await settingsService.updateSettings(newSettings);
    setSettings(updated);
    setIsLoading(false);
    return updated;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings: handleUpdateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
