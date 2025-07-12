import { db } from '../connection';
import { settings } from '../schema';
import { eq, and, like } from 'drizzle-orm';

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
  // =====================================
  // GENERAL SETTINGS
  // =====================================
  
  // Company Information
  {
    key: 'company_name',
    value: 'My Business',
    type: 'string',
    category: 'general',
    label: 'Company Name',
    description: 'Your business name',
    defaultValue: 'My Business',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'company_address',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Company Address',
    description: 'Business address for receipts',
    defaultValue: '',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'company_phone',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Phone Number',
    description: 'Business phone number',
    defaultValue: '',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'company_email',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Email Address',
    description: 'Business email address',
    defaultValue: '',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'tax_number',
    value: '',
    type: 'string',
    category: 'general',
    label: 'Tax Number',
    description: 'Business tax/VAT number',
    defaultValue: '',
    isPublic: true,
    sortOrder: 5
  },
  
  // Regional & Localization Settings
  {
    key: 'language',
    value: 'en',
    type: 'string',
    category: 'general',
    label: 'Language',
    description: 'Application language',
    defaultValue: 'en',
    isPublic: true,
    sortOrder: 6
  },
  {
    key: 'timezone',
    value: 'UTC',
    type: 'string',
    category: 'general',
    label: 'Timezone',
    description: 'Business timezone',
    defaultValue: 'UTC',
    isPublic: true,
    sortOrder: 7
  },
  {
    key: 'locale',
    value: 'en-US',
    type: 'string',
    category: 'general',
    label: 'Locale',
    description: 'Regional formatting',
    defaultValue: 'en-US',
    isPublic: true,
    sortOrder: 8
  },

  // =====================================
  // CURRENCY & FINANCIAL SETTINGS
  // =====================================
  {
    key: 'currency_code',
    value: 'DZD',
    type: 'string',
    category: 'currency',
    label: 'Currency Code',
    description: 'Primary currency for transactions',
    defaultValue: 'DZD',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'currency_symbol',
    value: 'دج',
    type: 'string',
    category: 'currency',
    label: 'Currency Symbol',
    description: 'Currency symbol for display',
    defaultValue: 'دج',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'currency_position',
    value: 'before',
    type: 'string',
    category: 'currency',
    label: 'Currency Position',
    description: 'Symbol position relative to amount',
    defaultValue: 'before',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'currency_precision',
    value: '2',
    type: 'number',
    category: 'currency',
    label: 'Decimal Places',
    description: 'Number of decimal places for currency',
    defaultValue: '2',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'tax_rate',
    value: '0.10',
    type: 'number',
    category: 'currency',
    label: 'Default Tax Rate',
    description: 'Default tax rate as decimal (e.g., 0.10 for 10%)',
    defaultValue: '0.10',
    isPublic: true,
    sortOrder: 5
  },

  // =====================================
  // PRINTING SETTINGS
  // =====================================
  {
    key: 'printer.printerName',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Default Printer',
    description: 'Default printer for receipts',
    defaultValue: '',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'printer.pageSize',
    value: '80mm',
    type: 'string',
    category: 'printing',
    label: 'Paper Size',
    description: 'Receipt paper size',
    defaultValue: '80mm',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'printer.copies',
    value: '1',
    type: 'number',
    category: 'printing',
    label: 'Number of Copies',
    description: 'Number of copies to print',
    defaultValue: '1',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'printer.margin',
    value: '0 0 0 0',
    type: 'string',
    category: 'printing',
    label: 'Margins',
    description: 'Print margins (top right bottom left)',
    defaultValue: '0 0 0 0',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'printer.silent',
    value: 'true',
    type: 'boolean',
    category: 'printing',
    label: 'Silent Printing',
    description: 'Print without showing dialog',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 5
  },
  {
    key: 'printer.preview',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Show Print Preview',
    description: 'Show print preview before printing',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 6
  },
  {
    key: 'printer.timeOutPerLine',
    value: '400',
    type: 'number',
    category: 'printing',
    label: 'Timeout per Line',
    description: 'Timeout in milliseconds per line',
    defaultValue: '400',
    isPublic: true,
    sortOrder: 7
  },
  
  // Invoice printer settings
  {
    key: 'invoice_printer',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Invoice Printer',
    description: 'Printer for invoices and reports',
    defaultValue: '',
    isPublic: true,
    sortOrder: 8
  },
  {
    key: 'invoice_paper_size',
    value: 'A4',
    type: 'string',
    category: 'printing',
    label: 'Invoice Paper Size',
    description: 'Paper size for invoices',
    defaultValue: 'A4',
    isPublic: true,
    sortOrder: 9
  },
  {
    key: 'invoice_orientation',
    value: 'portrait',
    type: 'string',
    category: 'printing',
    label: 'Invoice Orientation',
    description: 'Page orientation for invoices',
    defaultValue: 'portrait',
    isPublic: true,
    sortOrder: 10
  },
  
  // Advanced printer settings
  {
    key: 'printer_quality',
    value: 'normal',
    type: 'string',
    category: 'printing',
    label: 'Print Quality',
    description: 'Print quality setting',
    defaultValue: 'normal',
    isPublic: true,
    sortOrder: 11
  },
  {
    key: 'printer_color_mode',
    value: 'monochrome',
    type: 'string',
    category: 'printing',
    label: 'Color Mode',
    description: 'Print color mode',
    defaultValue: 'monochrome',
    isPublic: true,
    sortOrder: 12
  },
  {
    key: 'printer_duplex',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Duplex Printing',
    description: 'Print on both sides',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 13
  },
  {
    key: 'printer_font_size',
    value: '12',
    type: 'number',
    category: 'printing',
    label: 'Font Size',
    description: 'Print font size',
    defaultValue: '12',
    isPublic: true,
    sortOrder: 14
  },
  {
    key: 'printer_font_family',
    value: 'Arial',
    type: 'string',
    category: 'printing',
    label: 'Font Family',
    description: 'Print font family',
    defaultValue: 'Arial',
    isPublic: true,
    sortOrder: 15
  },
  {
    key: 'printer_orientation',
    value: 'portrait',
    type: 'string',
    category: 'printing',
    label: 'Page Orientation',
    description: 'Page orientation for printing',
    defaultValue: 'portrait',
    isPublic: true,
    sortOrder: 16
  },
  {
    key: 'printer_margin_top',
    value: '10',
    type: 'number',
    category: 'printing',
    label: 'Top Margin',
    description: 'Top margin in mm',
    defaultValue: '10',
    isPublic: true,
    sortOrder: 17
  },
  {
    key: 'printer_margin_bottom',
    value: '10',
    type: 'number',
    category: 'printing',
    label: 'Bottom Margin',
    description: 'Bottom margin in mm',
    defaultValue: '10',
    isPublic: true,
    sortOrder: 18
  },
  {
    key: 'printer_margin_left',
    value: '10',
    type: 'number',
    category: 'printing',
    label: 'Left Margin',
    description: 'Left margin in mm',
    defaultValue: '10',
    isPublic: true,
    sortOrder: 19
  },
  {
    key: 'printer_margin_right',
    value: '10',
    type: 'number',
    category: 'printing',
    label: 'Right Margin',
    description: 'Right margin in mm',
    defaultValue: '10',
    isPublic: true,
    sortOrder: 20
  },
  {
    key: 'printer_header_template',
    value: 'POS SYSTEM\nReceipt\n{date} {time}',
    type: 'string',
    category: 'printing',
    label: 'Header Template',
    description: 'Receipt header template with placeholders',
    defaultValue: 'POS SYSTEM\nReceipt\n{date} {time}',
    isPublic: true,
    sortOrder: 21
  },
  {
    key: 'printer_footer_template',
    value: 'Thank you for your purchase!\nPlease come again',
    type: 'string',
    category: 'printing',
    label: 'Footer Template',
    description: 'Receipt footer template',
    defaultValue: 'Thank you for your purchase!\nPlease come again',
    isPublic: true,
    sortOrder: 22
  },
  {
    key: 'printer_auto_cut',
    value: 'true',
    type: 'boolean',
    category: 'printing',
    label: 'Auto Cut',
    description: 'Automatically cut receipt paper',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 23
  },
  {
    key: 'printer_open_drawer',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Open Drawer',
    description: 'Open cash drawer after printing',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 24
  },
  
  // =====================================
  // POS SETTINGS
  // =====================================
  {
    key: 'pos_receipt_title',
    value: 'POS SYSTEM',
    type: 'string',
    category: 'pos',
    label: 'Receipt Title',
    description: 'Title shown on receipts',
    defaultValue: 'POS SYSTEM',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'pos_show_tax',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Show Tax on Receipt',
    description: 'Display tax information on receipts',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'pos_show_change',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Show Change on Receipt',
    description: 'Display change amount on receipts',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'pos_auto_print',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Auto Print Receipts',
    description: 'Automatically print receipts after sale',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'pos_require_customer_info',
    value: 'false',
    type: 'boolean',
    category: 'pos',
    label: 'Require Customer Info',
    description: 'Require customer information for sales',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 5
  },
  
  // =====================================
  // APPEARANCE SETTINGS
  // =====================================
  {
    key: 'theme_mode',
    value: 'system',
    type: 'string',
    category: 'appearance',
    label: 'Theme Mode',
    description: 'Application theme mode',
    defaultValue: 'system',
    isPublic: true,
    sortOrder: 1
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
    sortOrder: 2
  },
  {
    key: 'show_animations',
    value: 'true',
    type: 'boolean',
    category: 'appearance',
    label: 'Show Animations',
    description: 'Enable UI animations',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'compact_mode',
    value: 'false',
    type: 'boolean',
    category: 'appearance',
    label: 'Compact Mode',
    description: 'Use compact layout',
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
      console.log(`SettingsService.get called with key: ${key}`);
      
      const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      
      if (result.length > 0) {
        const value = result[0].value || result[0].defaultValue || null;
        console.log(`Setting ${key} found in database: ${value}`);
        return value;
      }
      
      // Check if it's a default setting
      const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
      if (defaultSetting) {
        console.log(`Setting ${key} found in defaults: ${defaultSetting.defaultValue}`);
        return defaultSetting.defaultValue || null;
      }
      
      console.log(`Setting ${key} not found anywhere`);
      return null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
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
      console.log(`SettingsService.set called with key: ${key}, value: ${value}`);
      
      // Find existing setting or default definition
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
      
      console.log(`Existing setting found: ${existing.length > 0}`);
      console.log(`Default setting found: ${!!defaultSetting}`);
      
      let stringValue = String(value);
      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      }
      
      if (existing.length > 0) {
        // Update existing
        console.log(`Updating existing setting: ${key} = ${stringValue}`);
        await db.update(settings)
          .set({ 
            value: stringValue,
            updatedAt: new Date().toISOString()
          })
          .where(eq(settings.key, key));
        console.log(`Setting updated successfully`);
      } else if (defaultSetting) {
        // Create from default definition
        console.log(`Creating new setting from default: ${key} = ${stringValue}`);
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
        console.log(`Setting created successfully`);
      } else {
        // Create new custom setting
        console.log(`Creating new custom setting: ${key} = ${stringValue}`);
        await db.insert(settings).values({
          key,
          value: stringValue,
          type: 'string',
          category: 'custom',
          label: key,
          isPublic: false
        });
        console.log(`Custom setting created successfully`);
      }
      
      console.log(`SettingsService.set completed successfully for: ${key}`);
      return { success: true };
    } catch (error) {
      console.error(`Error setting value for ${key}:`, error);
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
      console.log('Initializing default settings...');
      let createdCount = 0;
      let updatedCount = 0;
      
      for (const setting of DEFAULT_SETTINGS) {
        const existing = await db.select().from(settings).where(eq(settings.key, setting.key)).limit(1);
        
        if (existing.length === 0) {
          // Create new setting
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
          createdCount++;
          console.log(`Created setting: ${setting.key}`);
        } else {
          // Update existing setting with default values if needed
          const existingSetting = existing[0];
          if (!existingSetting.defaultValue || !existingSetting.label || !existingSetting.category) {
            await db.update(settings)
              .set({
                defaultValue: setting.defaultValue,
                label: setting.label,
                description: setting.description,
                category: setting.category,
                type: setting.type,
                isRequired: setting.isRequired || false,
                isPublic: setting.isPublic || false,
                sortOrder: setting.sortOrder || 0,
                updatedAt: new Date().toISOString()
              })
              .where(eq(settings.key, setting.key));
            updatedCount++;
            console.log(`Updated setting: ${setting.key}`);
          }
        }
      }
      
      console.log(`Settings initialization completed: ${createdCount} created, ${updatedCount} updated`);
      return { success: true, created: createdCount, updated: updatedCount };
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

  // Check if settings table is properly initialized
  static async checkDatabaseHealth() {
    try {
      const result = await db.select().from(settings).limit(1);
      return { success: true, tableExists: true, recordCount: result.length };
    } catch (error) {
      console.error('Settings table health check failed:', error);
      return { success: false, error: String(error), tableExists: false };
    }
  }

  // Reset database (for troubleshooting)
  static async resetDatabase() {
    try {
      console.log('Resetting settings database...');
      
      // Delete all settings
      await db.delete(settings);
      
      // Reinitialize with defaults
      const result = await this.initializeDefaults();
      
      return { success: true, message: 'Database reset and reinitialized', ...result };
    } catch (error) {
      console.error('Error resetting database:', error);
      return { success: false, error: String(error) };
    }
  }
}

// Convenience functions
export const getSetting = SettingsService.get;
export const setSetting = SettingsService.set;
export const getTypedSetting = SettingsService.getTyped; 