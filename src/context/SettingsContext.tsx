import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { settingsRepo, subscribe } from '@/database';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import type { AppSettings } from '@/types/models';

interface SettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  updateSetting: async () => {},
});

/**
 * Loads settings from SQLite once and keeps them in memory for the whole app.
 * Writes go to the DB and update the in-memory copy optimistically.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const s = await settingsRepo.getAll();
      setSettings(s);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
    return subscribe('settings', reload);
  }, [reload]);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await settingsRepo.set(key, value);
    },
    [],
  );

  const value = useMemo(() => ({ settings, loaded, updateSetting }), [settings, loaded, updateSetting]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
