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
    key: 'date_format',
    value: 'MM/DD/YYYY',
    type: 'string',
    category: 'general',
    label: 'Date Format',
    description: 'How dates are displayed',
    defaultValue: 'MM/DD/YYYY',
    isPublic: true,
    sortOrder: 8
  },
  {
    key: 'time_format',
    value: '12h',
    type: 'string',
    category: 'general',
    label: 'Time Format',
    description: '12-hour or 24-hour time',
    defaultValue: '12h',
    isPublic: true,
    sortOrder: 9
  },
  {
    key: 'week_start',
    value: 'sunday',
    type: 'string',
    category: 'general',
    label: 'Week Starts On',
    description: 'First day of the week',
    defaultValue: 'sunday',
    isPublic: true,
    sortOrder: 10
  },
  {
    key: 'region',
    value: 'US',
    type: 'string',
    category: 'general',
    label: 'Region',
    description: 'Regional settings for formatting',
    defaultValue: 'US',
    isPublic: true,
    sortOrder: 11
  },

  // =====================================
  // CURRENCY SETTINGS
  // =====================================
  
  // Currency Display
  {
    key: 'currency_code',
    value: 'USD',
    type: 'string',
    category: 'currency',
    label: 'Primary Currency',
    description: 'Default currency for transactions',
    defaultValue: 'USD',
    isPublic: true,
    sortOrder: 1
  },
  {
    key: 'currency_symbol',
    value: '$',
    type: 'string',
    category: 'currency',
    label: 'Currency Symbol',
    description: 'Currency symbol to display',
    defaultValue: '$',
    isPublic: true,
    sortOrder: 2
  },
  {
    key: 'currency_position',
    value: 'before',
    type: 'string',
    category: 'currency',
    label: 'Symbol Position',
    description: 'Where to place currency symbol',
    defaultValue: 'before',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'number_format',
    value: 'comma_dot',
    type: 'string',
    category: 'currency',
    label: 'Number Format',
    description: 'How to format numbers',
    defaultValue: 'comma_dot',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'decimal_places',
    value: '2',
    type: 'number',
    category: 'currency',
    label: 'Decimal Places',
    description: 'Number of decimal places',
    defaultValue: '2',
    isPublic: true,
    sortOrder: 5
  },
  {
    key: 'round_to_nearest',
    value: '0.01',
    type: 'string',
    category: 'currency',
    label: 'Round to Nearest',
    description: 'Round prices to nearest value',
    defaultValue: '0.01',
    isPublic: true,
    sortOrder: 6
  },
  
  // Tax Configuration
  {
    key: 'default_tax_rate',
    value: '10.0',
    type: 'number',
    category: 'currency',
    label: 'Default Tax Rate (%)',
    description: 'Standard tax rate percentage',
    defaultValue: '10.0',
    isPublic: true,
    sortOrder: 7
  },
  {
    key: 'tax_calculation',
    value: 'exclusive',
    type: 'string',
    category: 'currency',
    label: 'Tax Calculation',
    description: 'How tax is calculated',
    defaultValue: 'exclusive',
    isPublic: true,
    sortOrder: 8
  },
  {
    key: 'tax_display',
    value: 'inclusive',
    type: 'string',
    category: 'currency',
    label: 'Tax Display',
    description: 'How tax is displayed to customers',
    defaultValue: 'inclusive',
    isPublic: true,
    sortOrder: 9
  },
  {
    key: 'tax_rounding',
    value: 'standard',
    type: 'string',
    category: 'currency',
    label: 'Tax Rounding',
    description: 'How tax amounts are rounded',
    defaultValue: 'standard',
    isPublic: true,
    sortOrder: 10
  },
  
  // Pricing & Business Rules
  {
    key: 'allow_negative_inventory',
    value: 'false',
    type: 'boolean',
    category: 'currency',
    label: 'Allow Negative Inventory',
    description: 'Allow sales when stock is zero',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 11
  },
  {
    key: 'price_change_tracking',
    value: 'true',
    type: 'boolean',
    category: 'currency',
    label: 'Track Price Changes',
    description: 'Log all price modifications',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 12
  },
  {
    key: 'auto_calculate_margin',
    value: 'true',
    type: 'boolean',
    category: 'currency',
    label: 'Auto Calculate Margin',
    description: 'Automatically calculate profit margins',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 13
  },
  {
    key: 'markup_percentage',
    value: '50',
    type: 'number',
    category: 'currency',
    label: 'Default Markup (%)',
    description: 'Default markup percentage for new products',
    defaultValue: '50',
    isPublic: true,
    sortOrder: 14
  },

  // =====================================
  // PRINTING SETTINGS
  // =====================================
  
  // Printer Configuration
  {
    key: 'auto_print_receipt',
    value: 'true',
    type: 'boolean',
    category: 'printing',
    label: 'Auto Print Receipt',
    description: 'Automatically print receipt after checkout',
    defaultValue: 'true',
    sortOrder: 1
  },
  {
    key: 'printer_name',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Default Printer',
    description: 'Select your default printer',
    defaultValue: '',
    sortOrder: 2
  },
  {
    key: 'printer_type',
    value: 'thermal',
    type: 'string',
    category: 'printing',
    label: 'Printer Type',
    description: 'Type of printer',
    defaultValue: 'thermal',
    sortOrder: 3
  },
  {
    key: 'paper_size',
    value: '80mm',
    type: 'string',
    category: 'printing',
    label: 'Paper Size',
    description: 'Receipt paper size',
    defaultValue: '80mm',
    sortOrder: 4
  },
  {
    key: 'print_quality',
    value: 'standard',
    type: 'string',
    category: 'printing',
    label: 'Print Quality',
    description: 'Print quality setting',
    defaultValue: 'standard',
    sortOrder: 5
  },
  {
    key: 'print_speed',
    value: 'normal',
    type: 'string',
    category: 'printing',
    label: 'Print Speed',
    description: 'Print speed setting',
    defaultValue: 'normal',
    sortOrder: 6
  },
  
  // Ticket Configuration
  {
    key: 'ticket_width',
    value: '80',
    type: 'number',
    category: 'printing',
    label: 'Ticket Width (mm)',
    description: 'Width of the receipt in millimeters',
    defaultValue: '80',
    sortOrder: 7
  },
  {
    key: 'ticket_margin_top',
    value: '5',
    type: 'number',
    category: 'printing',
    label: 'Top Margin (mm)',
    description: 'Top margin in millimeters',
    defaultValue: '5',
    sortOrder: 8
  },
  {
    key: 'ticket_margin_bottom',
    value: '10',
    type: 'number',
    category: 'printing',
    label: 'Bottom Margin (mm)',
    description: 'Bottom margin in millimeters',
    defaultValue: '10',
    sortOrder: 9
  },
  {
    key: 'ticket_margin_left',
    value: '2',
    type: 'number',
    category: 'printing',
    label: 'Left Margin (mm)',
    description: 'Left margin in millimeters',
    defaultValue: '2',
    sortOrder: 10
  },
  {
    key: 'ticket_margin_right',
    value: '2',
    type: 'number',
    category: 'printing',
    label: 'Right Margin (mm)',
    description: 'Right margin in millimeters',
    defaultValue: '2',
    sortOrder: 11
  },
  {
    key: 'ticket_font_size',
    value: '12',
    type: 'string',
    category: 'printing',
    label: 'Ticket Font Size',
    description: 'Font size for receipt text',
    defaultValue: '12',
    sortOrder: 12
  },
  
  // Receipt Content Settings
  {
    key: 'receipt_header',
    value: 'Thank you for your business!',
    type: 'string',
    category: 'printing',
    label: 'Receipt Header',
    description: 'Text at top of receipt',
    defaultValue: 'Thank you for your business!',
    sortOrder: 13
  },
  {
    key: 'receipt_footer',
    value: 'Please come again!',
    type: 'string',
    category: 'printing',
    label: 'Receipt Footer',
    description: 'Text at bottom of receipt',
    defaultValue: 'Please come again!',
    sortOrder: 14
  },
  {
    key: 'print_logo',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Print Logo',
    description: 'Print company logo on receipt',
    defaultValue: 'false',
    sortOrder: 15
  },
  {
    key: 'logo_size',
    value: 'medium',
    type: 'string',
    category: 'printing',
    label: 'Logo Size',
    description: 'Size of company logo on receipt',
    defaultValue: 'medium',
    sortOrder: 16
  },
  {
    key: 'print_customer_copy',
    value: 'true',
    type: 'boolean',
    category: 'printing',
    label: 'Print Customer Copy',
    description: 'Print customer copy by default',
    defaultValue: 'true',
    sortOrder: 17
  },
  {
    key: 'print_merchant_copy',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Print Merchant Copy',
    description: 'Print merchant copy automatically',
    defaultValue: 'false',
    sortOrder: 18
  },
  {
    key: 'print_barcode',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Print Order Barcode',
    description: 'Print barcode on receipt for order tracking',
    defaultValue: 'false',
    sortOrder: 19
  },
  {
    key: 'print_qr_code',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Print QR Code',
    description: 'Print QR code for digital receipt',
    defaultValue: 'false',
    sortOrder: 20
  },
  
  // Invoice/A4 Print Settings
  {
    key: 'invoice_printer',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Invoice Printer',
    description: 'Printer for invoices and reports',
    defaultValue: '',
    sortOrder: 21
  },
  {
    key: 'invoice_paper_size',
    value: 'A4',
    type: 'string',
    category: 'printing',
    label: 'Invoice Paper Size',
    description: 'Paper size for invoices',
    defaultValue: 'A4',
    sortOrder: 22
  },
  {
    key: 'invoice_orientation',
    value: 'portrait',
    type: 'string',
    category: 'printing',
    label: 'Invoice Orientation',
    description: 'Page orientation for invoices',
    defaultValue: 'portrait',
    sortOrder: 23
  },
  {
    key: 'invoice_margin_top',
    value: '20',
    type: 'number',
    category: 'printing',
    label: 'Invoice Top Margin (mm)',
    description: 'Top margin for invoices',
    defaultValue: '20',
    sortOrder: 24
  },
  {
    key: 'invoice_margin_bottom',
    value: '20',
    type: 'number',
    category: 'printing',
    label: 'Invoice Bottom Margin (mm)',
    description: 'Bottom margin for invoices',
    defaultValue: '20',
    sortOrder: 25
  },
  {
    key: 'invoice_margin_left',
    value: '15',
    type: 'number',
    category: 'printing',
    label: 'Invoice Left Margin (mm)',
    description: 'Left margin for invoices',
    defaultValue: '15',
    sortOrder: 26
  },
  {
    key: 'invoice_margin_right',
    value: '15',
    type: 'number',
    category: 'printing',
    label: 'Invoice Right Margin (mm)',
    description: 'Right margin for invoices',
    defaultValue: '15',
    sortOrder: 27
  },
  {
    key: 'invoice_font_size',
    value: '10',
    type: 'string',
    category: 'printing',
    label: 'Invoice Font Size',
    description: 'Font size for invoice text',
    defaultValue: '10',
    sortOrder: 28
  },
  {
    key: 'invoice_logo_position',
    value: 'top-left',
    type: 'string',
    category: 'printing',
    label: 'Invoice Logo Position',
    description: 'Position of logo on invoice',
    defaultValue: 'top-left',
    sortOrder: 29
  },
  {
    key: 'auto_print_invoice',
    value: 'false',
    type: 'boolean',
    category: 'printing',
    label: 'Auto Print Invoice',
    description: 'Automatically print invoice for orders above threshold',
    defaultValue: 'false',
    sortOrder: 30
  },
  {
    key: 'invoice_threshold',
    value: '100',
    type: 'number',
    category: 'printing',
    label: 'Invoice Threshold',
    description: 'Minimum amount to auto-print invoice',
    defaultValue: '100',
    sortOrder: 31
  },

  // =====================================
  // POS SETTINGS
  // =====================================
  {
    key: 'pos_layout',
    value: 'grid',
    type: 'string',
    category: 'pos',
    label: 'Default Layout',
    description: 'Default product view layout',
    defaultValue: 'grid',
    sortOrder: 1
  },
  {
    key: 'products_per_page',
    value: '50',
    type: 'number',
    category: 'pos',
    label: 'Products Per Page',
    description: 'Number of products to display',
    defaultValue: '50',
    sortOrder: 2
  },
  {
    key: 'enable_barcode_scanner',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Enable Barcode Scanner',
    description: 'Enable barcode scanning',
    defaultValue: 'true',
    sortOrder: 3
  },
  {
    key: 'sound_effects',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Sound Effects',
    description: 'Play sounds for actions',
    defaultValue: 'true',
    sortOrder: 4
  },
  {
    key: 'show_product_images',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Show Product Images',
    description: 'Display product images',
    defaultValue: 'true',
    sortOrder: 5
  },
  {
    key: 'enable_quick_sale',
    value: 'true',
    type: 'boolean',
    category: 'pos',
    label: 'Enable Quick Sale',
    description: 'Allow quick sale without customer details',
    defaultValue: 'true',
    sortOrder: 6
  },
  {
    key: 'require_customer_info',
    value: 'false',
    type: 'boolean',
    category: 'pos',
    label: 'Require Customer Info',
    description: 'Require customer information for sales',
    defaultValue: 'false',
    sortOrder: 7
  },

  // =====================================
  // APPEARANCE SETTINGS
  // =====================================
  {
    key: 'theme_mode',
    value: 'light',
    type: 'string',
    category: 'appearance',
    label: 'Theme Mode',
    description: 'Light or dark theme',
    defaultValue: 'light',
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
    key: 'compact_mode',
    value: 'false',
    type: 'boolean',
    category: 'appearance',
    label: 'Compact Mode',
    description: 'Use compact interface',
    defaultValue: 'false',
    isPublic: true,
    sortOrder: 3
  },
  {
    key: 'show_animations',
    value: 'true',
    type: 'boolean',
    category: 'appearance',
    label: 'Show Animations',
    description: 'Enable interface animations',
    defaultValue: 'true',
    isPublic: true,
    sortOrder: 4
  },
  {
    key: 'sidebar_position',
    value: 'left',
    type: 'string',
    category: 'appearance',
    label: 'Sidebar Position',
    description: 'Position of the navigation sidebar',
    defaultValue: 'left',
    isPublic: true,
    sortOrder: 5
  },
  {
    key: 'color_scheme',
    value: 'blue',
    type: 'string',
    category: 'appearance',
    label: 'Accent Color',
    description: 'Primary accent color for the interface',
    defaultValue: 'blue',
    isPublic: true,
    sortOrder: 6
  },
  {
    key: 'layout_density',
    value: 'comfortable',
    type: 'string',
    category: 'appearance',
    label: 'Layout Density',
    description: 'How compact the interface should be',
    defaultValue: 'comfortable',
    isPublic: true,
    sortOrder: 7
  },

  // =====================================
  // LEGACY SETTINGS (for compatibility)
  // =====================================
  {
    key: 'app_name',
    value: 'POS System',
    type: 'string',
    category: 'general',
    label: 'Application Name',
    description: 'The name of your POS application',
    defaultValue: 'POS System',
    isPublic: true,
    sortOrder: 50
  },
  {
    key: 'receipt_printer_name',
    value: '',
    type: 'string',
    category: 'printing',
    label: 'Receipt Printer Name',
    description: 'Name of the receipt printer',
    defaultValue: '',
    sortOrder: 50
  },
  {
    key: 'receipt_width',
    value: '80',
    type: 'number',
    category: 'printing',
    label: 'Receipt Width (mm)',
    description: 'Width of receipt paper in millimeters',
    defaultValue: '80',
    sortOrder: 51
  },
  {
    key: 'tax_rate',
    value: '0',
    type: 'number',
    category: 'general',
    label: 'Legacy Tax Rate (%)',
    description: 'Legacy tax rate percentage',
    defaultValue: '0',
    isPublic: true,
    sortOrder: 51
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