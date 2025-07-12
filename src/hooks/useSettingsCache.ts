import { useState, useEffect, useCallback } from 'react';
import { SettingsCacheManager, CachedSetting } from '../helpers/settings-cache';

export interface UseSettingsCacheReturn {
  // Settings access
  getSetting: (key: string) => string | null;
  getTypedSetting: <T = any>(key: string) => T | null;
  getAllSettings: () => CachedSetting[];
  getSettingsByCategory: (category: string) => CachedSetting[];
  
  // Settings modification
  setSetting: (key: string, value: any) => Promise<boolean>;
  bulkUpdateSettings: (updates: Record<string, any>) => Promise<boolean>;
  
  // Cache management
  refreshCache: () => Promise<void>;
  clearCache: () => void;
  
  // Status
  isInitialized: boolean;
  isLoading: boolean;
  isValid: boolean;
  settingsCount: number;
  lastUpdated: number;
  cacheAge: number;
  
  // Convenience getters for common settings
  getPrinterName: () => string | null;
  getCurrencyCode: () => string | null;
  getCurrencySymbol: () => string | null;
  getTaxRate: () => number | null;
  getLanguage: () => string | null;
  getThemeMode: () => string | null;
}

export function useSettingsCache(): UseSettingsCacheReturn {
  const [cacheStatus, setCacheStatus] = useState(() => SettingsCacheManager.getCacheStatus());

  // Initialize cache on mount
  useEffect(() => {
    const initializeCache = async () => {
      if (!cacheStatus.isInitialized && !cacheStatus.isLoading) {
        await SettingsCacheManager.initialize();
        setCacheStatus(SettingsCacheManager.getCacheStatus());
      }
    };

    initializeCache();
  }, []);

  // Listen for cache changes
  useEffect(() => {
    const handleCacheChange = () => {
      setCacheStatus(SettingsCacheManager.getCacheStatus());
    };

    SettingsCacheManager.addListener(handleCacheChange);
    return () => SettingsCacheManager.removeListener(handleCacheChange);
  }, []);

  // Settings access methods
  const getSetting = useCallback((key: string): string | null => {
    return SettingsCacheManager.get(key);
  }, []);

  const getTypedSetting = useCallback(<T = any>(key: string): T | null => {
    return SettingsCacheManager.getTyped<T>(key);
  }, []);

  const getAllSettings = useCallback((): CachedSetting[] => {
    return SettingsCacheManager.getAll();
  }, []);

  const getSettingsByCategory = useCallback((category: string): CachedSetting[] => {
    return SettingsCacheManager.getByCategory(category);
  }, []);

  // Settings modification methods
  const setSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    const success = await SettingsCacheManager.set(key, value);
    if (success) {
      setCacheStatus(SettingsCacheManager.getCacheStatus());
    }
    return success;
  }, []);

  const bulkUpdateSettings = useCallback(async (updates: Record<string, any>): Promise<boolean> => {
    const success = await SettingsCacheManager.bulkUpdate(updates);
    if (success) {
      setCacheStatus(SettingsCacheManager.getCacheStatus());
    }
    return success;
  }, []);

  // Cache management methods
  const refreshCache = useCallback(async (): Promise<void> => {
    await SettingsCacheManager.refresh();
    setCacheStatus(SettingsCacheManager.getCacheStatus());
  }, []);

  const clearCache = useCallback((): void => {
    SettingsCacheManager.clear();
    setCacheStatus(SettingsCacheManager.getCacheStatus());
  }, []);

  // Convenience getters for common settings
  const getPrinterName = useCallback((): string | null => {
    return getSetting('printer.printerName');
  }, [getSetting]);

  const getCurrencyCode = useCallback((): string | null => {
    return getSetting('currency_code');
  }, [getSetting]);

  const getCurrencySymbol = useCallback((): string | null => {
    return getSetting('currency_symbol');
  }, [getSetting]);

  const getTaxRate = useCallback((): number | null => {
    return getTypedSetting<number>('tax_rate');
  }, [getTypedSetting]);

  const getLanguage = useCallback((): string | null => {
    return getSetting('language');
  }, [getSetting]);

  const getThemeMode = useCallback((): string | null => {
    return getSetting('theme_mode');
  }, [getSetting]);

  return {
    // Settings access
    getSetting,
    getTypedSetting,
    getAllSettings,
    getSettingsByCategory,
    
    // Settings modification
    setSetting,
    bulkUpdateSettings,
    
    // Cache management
    refreshCache,
    clearCache,
    
    // Status
    isInitialized: cacheStatus.isInitialized,
    isLoading: cacheStatus.isLoading,
    isValid: cacheStatus.isValid,
    settingsCount: cacheStatus.settingsCount,
    lastUpdated: cacheStatus.lastUpdated,
    cacheAge: cacheStatus.cacheAge,
    
    // Convenience getters
    getPrinterName,
    getCurrencyCode,
    getCurrencySymbol,
    getTaxRate,
    getLanguage,
    getThemeMode
  };
} 