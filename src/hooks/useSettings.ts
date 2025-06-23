import { useState, useEffect, useCallback } from 'react';
import type { Setting } from '../database/schema';

interface SettingsFilter {
  category?: string;
  type?: string;
  search?: string;
}

interface UseSettingsReturn {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSetting: (key: string) => string | null;
  getTypedSetting: <T = any>(key: string) => T | null;
  setSetting: (key: string, value: any) => Promise<boolean>;
  getByCategory: (category: string) => Setting[];
}

export function useSettings(filter?: SettingsFilter): UseSettingsReturn {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.database.settings.getAll(filter);
      
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || 'Failed to load settings');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const getSetting = useCallback((key: string): string | null => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || setting?.defaultValue || null;
  }, [settings]);

  const getTypedSetting = useCallback(<T = any>(key: string): T | null => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return null;
    
    const value = setting.value || setting.defaultValue;
    if (!value) return null;
    
    switch (setting.type) {
      case 'boolean':
        return (value.toLowerCase() === 'true') as T;
      case 'number':
        return Number(value) as T;
      case 'json':
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      default:
        return value as T;
    }
  }, [settings]);

  const setSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    try {
      const result = await window.database.settings.set(key, value);
      if (result.success) {
        await loadSettings(); // Refresh settings
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [loadSettings]);

  const getByCategory = useCallback((category: string): Setting[] => {
    return settings.filter(s => s.category === category);
  }, [settings]);

  return {
    settings,
    loading,
    error,
    refresh: loadSettings,
    getSetting,
    getTypedSetting,
    setSetting,
    getByCategory
  };
} 