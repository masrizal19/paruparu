import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings } from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  getLocalSettings,
  saveSettingsToSupabase,
  fetchSettingsFromSupabase,
  applyCustomFont,
  clearCustomFont,
  getCustomFontsList,
} from '../lib/settings';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  resetSettings: () => Promise<void>;
  isSaving: boolean;
  adminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  refreshFont: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SiteSettings>(getLocalSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const syncActiveFont = async (currentSettings: SiteSettings) => {
    if (currentSettings.activeFontFamily && currentSettings.activeFontId) {
      const fonts = await getCustomFontsList();
      const activeFont = fonts.find((f) => f.id === currentSettings.activeFontId);
      if (activeFont) {
        applyCustomFont(activeFont.font_family, activeFont.file_url, activeFont.format);
        return;
      }
    }
    clearCustomFont();
  };

  useEffect(() => {
    // Attempt fetch from Supabase on mount
    fetchSettingsFromSupabase().then((data) => {
      setSettings(data);
      syncActiveFont(data);
    });
  }, []);

  const refreshFont = async () => {
    await syncActiveFont(settings);
  };

  const updateSettings = async (
    newSettings: Partial<SiteSettings>
  ): Promise<boolean> => {
    setIsSaving(true);
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    const res = await saveSettingsToSupabase(merged);
    setIsSaving(false);
    if (newSettings.activeFontFamily !== undefined || newSettings.activeFontId !== undefined) {
      await syncActiveFont(merged);
    }
    return res.success;
  };

  const resetSettings = async () => {
    setIsSaving(true);
    setSettings(DEFAULT_SITE_SETTINGS);
    await saveSettingsToSupabase(DEFAULT_SITE_SETTINGS);
    clearCustomFont();
    setIsSaving(false);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isSaving,
        adminModalOpen,
        setAdminModalOpen,
        refreshFont,
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
