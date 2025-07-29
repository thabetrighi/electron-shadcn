import { toast } from 'react-hot-toast';

// Types for settings cache
export interface CachedSetting {
  key: string;
  value: string | null;
  type: 'string' | 'number' | 'boolean' | 'json' | 'file';
  category: string;
  label: string;
  description?: string;
  defaultValue?: string;
  isRequired?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
  updatedAt?: string;
}

export interface SettingsCache {
  settings: Map<string, CachedSetting>;
  lastUpdated: number;
  isInitialized: boolean;
  isLoading: boolean;
}

// Global cache instance
let settingsCache: SettingsCache = {
  settings: new Map(),
  lastUpdated: 0,
  isInitialized: false,
  isLoading: false
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache event listeners
const cacheListeners: Array<(cache: SettingsCache) => void> = [];

/**
 * Settings Cache Manager
 * Provides fast access to settings with caching and automatic updates
 */
export class SettingsCacheManager {
  /**
   * Initialize the cache by loading all settings from database
   */
  static async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing settings cache...');
      settingsCache.isLoading = true;
      
      // Wait for database to be ready
      let retries = 0;
      const maxRetries = 10;
      
      while (!window.database && retries < maxRetries) {
        console.log(`Waiting for database to be ready... (attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      
      if (!window.database) {
        throw new Error('Database not available after maximum retries');
      }
      
      // Load all settings from database
      const result = await window.database.settings.getAll();
      
      if (result.success && result.data) {
        // Clear existing cache
        settingsCache.settings.clear();
        
        // Populate cache
        for (const setting of result.data) {
          settingsCache.settings.set(setting.key, {
            key: setting.key,
            value: setting.value || setting.defaultValue || null,
            type: setting.type,
            category: setting.category,
            label: setting.label,
            description: setting.description,
            defaultValue: setting.defaultValue,
            isRequired: setting.isRequired,
            isPublic: setting.isPublic,
            sortOrder: setting.sortOrder,
            updatedAt: setting.updatedAt
          });
        }
        
        settingsCache.lastUpdated = Date.now();
        settingsCache.isInitialized = true;
        
        console.log(`✅ Settings cache initialized with ${settingsCache.settings.size} settings`);
        this.notifyListeners();
      } else {
        throw new Error(result.error || 'Failed to load settings');
      }
    } catch (error) {
      console.error('❌ Failed to initialize settings cache:', error);
      settingsCache.isInitialized = false;
      
      toast.error('Failed to load settings cache', {
        icon: '❌',
        duration: 3000
      });
    } finally {
      settingsCache.isLoading = false;
    }
  }

  /**
   * Get a setting value from cache
   */
  static get(key: string): string | null {
    if (!settingsCache.isInitialized) {
      console.warn('Settings cache not initialized, returning null for:', key);
      // Try to initialize cache if not initialized
      if (!settingsCache.isLoading) {
        this.initialize().catch(error => {
          console.error('Failed to initialize cache on demand:', error);
        });
      }
      return null;
    }

    const setting = settingsCache.settings.get(key);
    return setting?.value || null;
  }

  /**
   * Get a typed setting value from cache
   */
  static getTyped<T = any>(key: string): T | null {
    const setting = settingsCache.settings.get(key);
    if (!setting) return null;

    const value = setting.value;
    if (value === null) return null;

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
  }

  /**
   * Get all settings from cache
   */
  static getAll(): CachedSetting[] {
    if (!settingsCache.isInitialized) {
      console.warn('Settings cache not initialized, returning empty array');
      return [];
    }

    return Array.from(settingsCache.settings.values());
  }

  /**
   * Get settings by category from cache
   */
  static getByCategory(category: string): CachedSetting[] {
    if (!settingsCache.isInitialized) {
      return [];
    }

    return Array.from(settingsCache.settings.values())
      .filter(setting => setting.category === category)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  /**
   * Set a setting value and update cache
   */
  static async set(key: string, value: any): Promise<boolean> {
    try {
      console.log(`🔄 Setting cache value: ${key} = ${value}`);
      
      // Check if database is available
      if (!window.database) {
        console.warn('Database not available, cannot update setting:', key);
        return false;
      }
      
      // Update database first
      const result = await window.database.settings.set(key, value);
      
      if (result.success) {
        // Update cache
        const existingSetting = settingsCache.settings.get(key);
        if (existingSetting) {
          existingSetting.value = String(value);
          existingSetting.updatedAt = new Date().toISOString();
        } else {
          // If setting doesn't exist in cache, add it
          settingsCache.settings.set(key, {
            key,
            value: String(value),
            type: 'string',
            category: 'custom',
            label: key,
            isPublic: false,
            updatedAt: new Date().toISOString()
          });
        }
        
        settingsCache.lastUpdated = Date.now();
        this.notifyListeners();
        
        console.log(`✅ Cache updated for: ${key}`);
        return true;
      } else {
        console.error('Failed to update setting in database:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating setting in cache:', error);
      return false;
    }
  }

  /**
   * Bulk update settings and cache
   */
  static async bulkUpdate(updates: Record<string, any>): Promise<boolean> {
    try {
      console.log('🔄 Bulk updating settings cache...');
      
      // Check if database is available
      if (!window.database) {
        console.warn('Database not available, cannot bulk update settings');
        return false;
      }
      
      const result = await window.database.settings.bulkUpdate(updates);
      
      if (result.success) {
        // Update cache for all changed settings
        for (const [key, value] of Object.entries(updates)) {
          const existingSetting = settingsCache.settings.get(key);
          if (existingSetting) {
            existingSetting.value = String(value);
            existingSetting.updatedAt = new Date().toISOString();
          }
        }
        
        settingsCache.lastUpdated = Date.now();
        this.notifyListeners();
        
        console.log(`✅ Cache bulk updated for ${Object.keys(updates).length} settings`);
        return true;
      } else {
        console.error('Failed to bulk update settings:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error bulk updating settings cache:', error);
      return false;
    }
  }

  /**
   * Refresh cache from database
   */
  static async refresh(): Promise<void> {
    console.log('🔄 Refreshing settings cache...');
    await this.initialize();
  }

  /**
   * Check if cache is valid (not expired)
   */
  static isCacheValid(): boolean {
    if (!settingsCache.isInitialized) return false;
    
    const now = Date.now();
    const cacheAge = now - settingsCache.lastUpdated;
    
    return cacheAge < CACHE_DURATION;
  }

  /**
   * Get cache status
   */
  static getCacheStatus() {
    return {
      isInitialized: settingsCache.isInitialized,
      isLoading: settingsCache.isLoading,
      settingsCount: settingsCache.settings.size,
      lastUpdated: settingsCache.lastUpdated,
      isValid: this.isCacheValid(),
      cacheAge: Date.now() - settingsCache.lastUpdated
    };
  }

  /**
   * Clear cache
   */
  static clear(): void {
    settingsCache.settings.clear();
    settingsCache.isInitialized = false;
    settingsCache.lastUpdated = 0;
    this.notifyListeners();
    console.log('🗑️ Settings cache cleared');
  }

  /**
   * Add cache change listener
   */
  static addListener(listener: (cache: SettingsCache) => void): void {
    cacheListeners.push(listener);
  }

  /**
   * Remove cache change listener
   */
  static removeListener(listener: (cache: SettingsCache) => void): void {
    const index = cacheListeners.indexOf(listener);
    if (index > -1) {
      cacheListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of cache changes
   */
  private static notifyListeners(): void {
    cacheListeners.forEach(listener => {
      try {
        listener(settingsCache);
      } catch (error) {
        console.error('Error in cache listener:', error);
      }
    });
  }
}

// Convenience functions for easy access
export const getSetting = (key: string): string | null => SettingsCacheManager.get(key);
export const getTypedSetting = <T = any>(key: string): T | null => SettingsCacheManager.getTyped<T>(key);
export const getAllSettings = (): CachedSetting[] => SettingsCacheManager.getAll();
export const getSettingsByCategory = (category: string): CachedSetting[] => SettingsCacheManager.getByCategory(category);
export const setSetting = (key: string, value: any): Promise<boolean> => SettingsCacheManager.set(key, value);
export const bulkUpdateSettings = (updates: Record<string, any>): Promise<boolean> => SettingsCacheManager.bulkUpdate(updates);
export const refreshSettingsCache = (): Promise<void> => SettingsCacheManager.refresh();
export const isSettingsCacheValid = (): boolean => SettingsCacheManager.isCacheValid();
export const getSettingsCacheStatus = () => SettingsCacheManager.getCacheStatus();
export const clearSettingsCache = (): void => SettingsCacheManager.clear(); 