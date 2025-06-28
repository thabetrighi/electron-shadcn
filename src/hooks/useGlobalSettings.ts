import { useState, useEffect, useCallback } from 'react';

// Global settings interface
export interface GlobalSettings {
  currency_code: string;
  currency_precision: number;
  locale: string;
  number_format: string;
  date_format: string;
  tax_rate: number;
  app_name: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
}

// Default settings
const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  currency_code: 'USD',
  currency_precision: 2,
  locale: 'en-US',
  number_format: 'decimal',
  date_format: 'medium',
  tax_rate: 0,
  app_name: 'POS System',
  company_name: 'Your Company',
  company_address: '',
  company_phone: '',
  company_email: ''
};

// Settings cache
let globalSettingsCache: GlobalSettings | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Hook for using global settings
export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = Date.now();
      if (!globalSettingsCache || now - cacheTimestamp > CACHE_DURATION) {
        const result = await window.database.settings.getAll();
        
        if (result.success && result.data) {
          const settingsMap = result.data.reduce((acc: Record<string, any>, setting: any) => {
            acc[setting.key] = setting.value || setting.defaultValue;
            return acc;
          }, {});
          
          globalSettingsCache = {
            currency_code: settingsMap.currency_code || DEFAULT_GLOBAL_SETTINGS.currency_code,
            currency_precision: Number(settingsMap.currency_precision) || DEFAULT_GLOBAL_SETTINGS.currency_precision,
            locale: settingsMap.locale || DEFAULT_GLOBAL_SETTINGS.locale,
            number_format: settingsMap.number_format || DEFAULT_GLOBAL_SETTINGS.number_format,
            date_format: settingsMap.date_format || DEFAULT_GLOBAL_SETTINGS.date_format,
            tax_rate: Number(settingsMap.tax_rate) || DEFAULT_GLOBAL_SETTINGS.tax_rate,
            app_name: settingsMap.app_name || DEFAULT_GLOBAL_SETTINGS.app_name,
            company_name: settingsMap.company_name || DEFAULT_GLOBAL_SETTINGS.company_name,
            company_address: settingsMap.company_address || DEFAULT_GLOBAL_SETTINGS.company_address,
            company_phone: settingsMap.company_phone || DEFAULT_GLOBAL_SETTINGS.company_phone,
            company_email: settingsMap.company_email || DEFAULT_GLOBAL_SETTINGS.company_email
          };
          cacheTimestamp = now;
        } else {
          throw new Error(result.error || 'Failed to load settings');
        }
      }
      
      setSettings(globalSettingsCache || DEFAULT_GLOBAL_SETTINGS);
    } catch (err) {
      console.error('Failed to load global settings:', err);
      setError(String(err));
      setSettings(DEFAULT_GLOBAL_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key: keyof GlobalSettings, value: any): Promise<boolean> => {
    try {
      const result = await window.database.settings.set(key, value);
      if (result.success) {
        // Update cache and state
        globalSettingsCache = { ...globalSettingsCache!, [key]: value };
        setSettings(prev => ({ ...prev, [key]: value }));
        cacheTimestamp = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update setting:', error);
      return false;
    }
  }, []);

  const refreshSettings = useCallback(() => {
    globalSettingsCache = null;
    return loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSetting,
    refreshSettings,
    // Convenience getters
    getCurrency: () => settings.currency_code,
    getLocale: () => settings.locale,
    getCurrencyPrecision: () => settings.currency_precision,
    getDateFormat: () => settings.date_format as 'short' | 'medium' | 'long' | 'full',
    getTaxRate: () => settings.tax_rate
  };
}

// Synchronous access to cached settings
export function getGlobalSettingsSync(): GlobalSettings {
  return globalSettingsCache || DEFAULT_GLOBAL_SETTINGS;
}

// Individual setting getters (synchronous)
export function getCurrencySync(): string {
  return globalSettingsCache?.currency_code || DEFAULT_GLOBAL_SETTINGS.currency_code;
}

export function getLocaleSync(): string {
  return globalSettingsCache?.locale || DEFAULT_GLOBAL_SETTINGS.locale;
}

export function getCurrencyPrecisionSync(): number {
  return globalSettingsCache?.currency_precision || DEFAULT_GLOBAL_SETTINGS.currency_precision;
}

export function getDateFormatSync(): 'short' | 'medium' | 'long' | 'full' {
  return (globalSettingsCache?.date_format as 'short' | 'medium' | 'long' | 'full') || DEFAULT_GLOBAL_SETTINGS.date_format as 'short' | 'medium' | 'long' | 'full';
} 