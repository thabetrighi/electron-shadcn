import { eq, and, like, desc } from 'drizzle-orm';
import { db } from '../connection';
import { settings, type Setting, type NewSetting } from '../schema';

export interface SettingsFilter {
  category?: string;
  key?: string;
  isPublic?: boolean;
}

export interface SettingDefinition {
  key: string;
  value?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'file';
  category: string;
  label: string;
  description?: string;
  defaultValue?: string;
  isRequired?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
}

// Default settings for the application
export const DEFAULT_SETTINGS: SettingDefinition[] = [
  // General Settings
  {
    key: 'app_name',
    value: 'POS System',
    type: 'string',
    category: 'general',
    label: 'Application Name',
    description: 'The name of your POS application',
    defaultValue: 'POS System',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'company_name',
    value: 'Your Company',
    type: 'string',
    category: 'general',
    label: 'Company Name',
    description: 'Your company or business name',
    defaultValue: 'Your Company',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'company_address',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Company Address',
    description: 'Your business address',
    defaultValue: '',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'company_phone',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Phone Number',
    description: 'Your business phone number',
    defaultValue: '',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'company_email',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Email Address',
    description: 'Your business email address',
    defaultValue: '',
    isPublic: true,
    sortOrder: 5
  },
  {
    key: 'currency_symbol',
    value: '$',
    type: 'string',
    category: 'general',
    label: 'Currency Symbol',
    description: 'Currency symbol to display',
    defaultValue: '$',
    isPublic: true,
    sortOrder: 6
  },
  {
    key: 'currency_code',
    value: 'USD',
    type: 'string',
    category: 'general',
    label: 'Currency Code',
    description: 'ISO currency code',
    defaultValue: 'USD',
    isPublic: true,
    sortOrder: 7
  },
  {
    key: 'tax_rate',
    value: '0',
    type: 'number',
    category: 'general',
    label: 'Default Tax Rate (%)',
    description: 'Default tax rate percentage',
    defaultValue: '0',
    isPublic: true,
    sortOrder: 8
  },

  // Printing Settings
  {
    key: 'receipt_printer_name',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Receipt Printer Name',
    description: 'Name of the receipt printer',
    defaultValue: '',
    sortOrder: 1
  },
  {
    key: 'receipt_width',
    value: '80',
    type: 'number',
    category: 'printing',
    label: 'Receipt Width (mm)',
    description: 'Width of receipt paper in millimeters',
    defaultValue: '80',
    sortOrder: 2
  },
  {
    key: 'receipt_header',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Receipt Header',
    description: 'Custom header text for receipts',
    defaultValue: '',
    sortOrder: 3
  },
  {
    key: 'receipt_footer',
    value: 'Thank you for your business!',
    type: 'string',
    category: 'printing',
    label: 'Receipt Footer',
    description: 'Custom footer text for receipts',
    defaultValue: 'Thank you for your business!',
    sortOrder: 4
  },
  {
    key: 'auto_print_receipt',
    value: 'true',
    type: 'boolean',
    category: 'printing',
    label: 'Auto Print Receipt',
    description: 'Automatically print receipt after sale',
    defaultValue: 'true',
    sortOrder: 5
  },
  {
    key: 'print_customer_copy',
    value: 'true',
    type: 'boolean',
    category: 'printing',
    label: 'Print Customer Copy',
    description: 'Print customer copy of receipt',
    defaultValue: 'true',
    sortOrder: 6
  },

  // POS Settings
  {
    key: 'pos_layout',
    value: 'grid',
    type: 'string',
    category: 'pos',
    label: 'POS Layout',
    description: 'Layout style for POS interface',
    defaultValue: 'grid',
    sortOrder: 1
  },
  {
    key: 'show_product_images',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Show Product Images',
    description: 'Display product images in POS',
    defaultValue: 'true',
    sortOrder: 2
  },
  {
    key: 'enable_barcode_scanner',
    value: 'false',
    type: 'boolean',
    category: 'pos',
    label: 'Enable Barcode Scanner',
    description: 'Enable barcode scanning functionality',
    defaultValue: 'false',
    sortOrder: 3
  },
  {
    key: 'low_stock_alert',
    value: '10',
    type: 'number',
    category: 'pos',
    label: 'Low Stock Alert Threshold',
    description: 'Alert when stock falls below this number',
    defaultValue: '10',
    sortOrder: 4
  },

  // Appearance Settings
  {
    key: 'theme_mode',
    value: 'light',
    type: 'string',
    category: 'appearance',
    label: 'Theme Mode',
    description: 'Application theme (light/dark)',
    defaultValue: 'light',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'primary_color',
    value: '#3b82f6',
    type: 'string',
    category: 'appearance',
    label: 'Primary Color',
    description: 'Primary brand color',
    defaultValue: '#3b82f6',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'font_size',
    value: 'medium',
    type: 'string',
    category: 'appearance',
    label: 'Font Size',
    description: 'Application font size',
    defaultValue: 'medium',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'compact_mode',
    value: 'false',
    type: 'boolean',
    category: 'appearance',
    label: 'Compact Mode',
    description: 'Use compact interface layout',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 4
  }
];

export class SettingsService {
  // Get all settings with optional filtering
  static async getAll(filter?: SettingsFilter) {
    try {
      const conditions = [];
      
      if (filter) {
        if (filter.category) {
          conditions.push(eq(settings.category, filter.category));
        }
        if (filter.key) {
          conditions.push(like(settings.key, `%${filter.key}%`));
        }
        if (filter.isPublic !== undefined) {
          conditions.push(eq(settings.isPublic, filter.isPublic));
        }
      }
      
      let result;
      if (conditions.length > 0) {
        result = await db.select().from(settings)
          .where(and(...conditions))
          .orderBy(settings.category, settings.sortOrder);
      } else {
        result = await db.select().from(settings)
          .orderBy(settings.category, settings.sortOrder);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { success: false, error: String(error), data: [] };
    }
  }

  // Get setting by key
  static async get(key: string): Promise<string | null> {
    try {
      const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (result.length > 0) {
        return result[0].value || result[0].defaultValue || null;
      }
      
      // Check if it's a default setting
      const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
      if (defaultSetting) {
        return defaultSetting.defaultValue || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  // Get typed setting value
  static async getTyped<T = any>(key: string): Promise<T | null> {
    try {
      const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      let value: string | null = null;
      let type = 'string';
      
      if (result.length > 0) {
        value = result[0].value || result[0].defaultValue;
        type = result[0].type;
      } else {
        // Check default settings
        const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
        if (defaultSetting) {
          value = defaultSetting.defaultValue || null;
          type = defaultSetting.type;
        }
      }
      
      if (value === null) return null;
      
      // Convert based on type
      switch (type) {
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
    } catch (error) {
      console.error('Error getting typed setting:', error);
      return null;
    }
  }

  // Set setting value
  static async set(key: string, value: any) {
    try {
      // Find existing setting or default definition
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
      
      let stringValue = String(value);
      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      }
      
      if (existing.length > 0) {
        // Update existing
        await db.update(settings)
          .set({ 
            value: stringValue,
            updatedAt: new Date().toISOString()
          })
          .where(eq(settings.key, key));
      } else if (defaultSetting) {
        // Create from default definition
        await db.insert(settings).values({
          key,
          value: stringValue,
          type: defaultSetting.type,
          category: defaultSetting.category,
          label: defaultSetting.label,
          description: defaultSetting.description,
          defaultValue: defaultSetting.defaultValue,
          isRequired: defaultSetting.isRequired || false,
          isPublic: defaultSetting.isPublic || false,
          sortOrder: defaultSetting.sortOrder || 0
        });
      } else {
        // Create new custom setting
        await db.insert(settings).values({
          key,
          value: stringValue,
          type: 'string',
          category: 'custom',
          label: key,
          isPublic: false
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting value:', error);
      return { success: false, error: String(error) };
    }
  }

  // Get settings by category
  static async getByCategory(category: string) {
    try {
      const result = await db.select()
        .from(settings)
        .where(eq(settings.category, category))
        .orderBy(settings.sortOrder);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting settings by category:', error);
      return { success: false, error: String(error), data: [] };
    }
  }

  // Initialize default settings
  static async initializeDefaults() {
    try {
      for (const setting of DEFAULT_SETTINGS) {
        const existing = await db.select().from(settings).where(eq(settings.key, setting.key)).limit(1);
        
        if (existing.length === 0) {
          await db.insert(settings).values({
            key: setting.key,
            value: setting.value,
            type: setting.type,
            category: setting.category,
            label: setting.label,
            description: setting.description,
            defaultValue: setting.defaultValue,
            isRequired: setting.isRequired || false,
            isPublic: setting.isPublic || false,
            sortOrder: setting.sortOrder || 0
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing default settings:', error);
      return { success: false, error: String(error) };
    }
  }

  // Bulk update settings
  static async bulkUpdate(updates: Record<string, any>) {
    try {
      for (const [key, value] of Object.entries(updates)) {
        await this.set(key, value);
      }
      return { success: true };
    } catch (error) {
      console.error('Error bulk updating settings:', error);
      return { success: false, error: String(error) };
    }
  }

  // Delete setting
  static async delete(key: string) {
    try {
      await db.delete(settings).where(eq(settings.key, key));
      return { success: true };
    } catch (error) {
      console.error('Error deleting setting:', error);
      return { success: false, error: String(error) };
    }
  }

  // Reset setting to default
  static async resetToDefault(key: string) {
    try {
      const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
      if (defaultSetting) {
        await this.set(key, defaultSetting.defaultValue);
        return { success: true };
      }
      return { success: false, error: 'No default value found' };
    } catch (error) {
      console.error('Error resetting setting:', error);
      return { success: false, error: String(error) };
    }
  }
}

// Convenience functions
export const getSetting = SettingsService.get;
export const setSetting = SettingsService.set;
export const getTypedSetting = SettingsService.getTyped; 