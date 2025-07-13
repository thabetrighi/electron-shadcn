import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { useSettings } from '../hooks/useSettings';
import { useSettingsCache } from '../hooks/useSettingsCache';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../helpers/language_helpers';
import { 
  Settings, 
  Printer, 
  Palette, 
  Store, 
  Receipt, 
  Monitor,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Coins,
  Globe,
  ShoppingCart,
  FileText,
  Database,
  Wifi,
  Zap,
  Eye,
  Type
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import SettingsTest from '../components/SettingsTest';
import SettingsCacheStatus from '../components/SettingsCacheStatus';


type SettingCategory = 'general' | 'printing' | 'pos' | 'appearance' | 'currency';

interface SettingFormData {
  [key: string]: any;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingCategory>('general');
  const [formData, setFormData] = useState<SettingFormData>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<Array<{value: string; label: string}>>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  // Get printer capabilities and display them
  const [selectedPrinterInfo, setSelectedPrinterInfo] = useState<any>(null);

  // Use settings cache
  const settingsCache = useSettingsCache();

  // Get printer capabilities when printer is selected
  const getPrinterCapabilities = async (printerName: string) => {
    try {
      const result = await (window as any).printer.getPrinterStatus(printerName);
      if (result.success) {
        setSelectedPrinterInfo(result.data);
      }
    } catch (error) {
      console.error('Error getting printer capabilities:', error);
    }
  };

  // Update printer capabilities when printer changes
  useEffect(() => {
    if (formData['printer.printerName'] && formData['printer.printerName'] !== 'none') {
      getPrinterCapabilities(formData['printer.printerName']);
    } else {
      setSelectedPrinterInfo(null);
    }
  }, [formData['printer.printerName']]);

  const { settings, loading, error, refresh } = useSettings();
  const { i18n, t } = useTranslation();

  // Apply settings changes immediately to the system
  const applySettingToSystem = async (key: string, value: any) => {
    try {
      switch (key) {
        case 'language':
          // Apply language change immediately
          if (value && value !== i18n.language) {
            setAppLanguage(value, i18n);
            toast.success(`Language changed to ${value}`, {
              icon: '🌐',
              duration: 2000
            });
          }
          break;
          
        case 'theme_mode':
          // Apply theme change immediately
          {
            const theme = value === 'system' ? 
              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
              value;
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
            localStorage.setItem('theme', value);
            toast.success(`Theme changed to ${value}`, {
              icon: '🎨',
              duration: 2000
            });
          }
          break;
          
        case 'font_size':
          // Apply font size change immediately
          {
            const fontSizes = { small: '14px', medium: '16px', large: '18px' };
            const newFontSize = fontSizes[value as keyof typeof fontSizes] || '16px';
            document.documentElement.style.fontSize = newFontSize;
            toast.success(`Font size changed to ${value} (${newFontSize})`, {
              icon: '🔤',
              duration: 2000
            });
          }
          break;
          
        case 'currency_code':
        case 'currency_symbol':
        case 'currency_position':
        case 'decimal_places':
          // Show currency format preview and create CSS custom properties for the app
          {
            const currentSymbol = key === 'currency_symbol' ? value : (formData.currency_symbol || '$');
            const currentPosition = key === 'currency_position' ? value : (formData.currency_position || 'before');
            const currentDecimals = key === 'decimal_places' ? parseInt(value) : parseInt(formData.decimal_places || '2');
            const currentCode = key === 'currency_code' ? value : (formData.currency_code || 'USD');
            
            // Apply currency settings to CSS custom properties for global use
            document.documentElement.style.setProperty('--currency-symbol', currentSymbol);
            document.documentElement.style.setProperty('--currency-position', currentPosition);
            document.documentElement.style.setProperty('--currency-decimals', currentDecimals.toString());
            document.documentElement.style.setProperty('--currency-code', currentCode);
            
            // Create a sample formatted currency value
            const sample = 1234.56;
            let formatted = '';
            if (currentPosition === 'before') {
              formatted = `${currentSymbol}${sample.toFixed(currentDecimals)}`;
            } else if (currentPosition === 'after') {
              formatted = `${sample.toFixed(currentDecimals)}${currentSymbol}`;
            } else if (currentPosition === 'before_space') {
              formatted = `${currentSymbol} ${sample.toFixed(currentDecimals)}`;
            } else if (currentPosition === 'after_space') {
              formatted = `${sample.toFixed(currentDecimals)} ${currentSymbol}`;
            }
            
            // Show preview with currency settings applied
            const previewElement = document.createElement('div');
            previewElement.className = 'currency-preview';
            previewElement.innerHTML = `
              <strong>💰 Currency Preview:</strong> ${formatted}
              <br><small>Code: ${currentCode} | Decimals: ${currentDecimals}</small>
            `;
            
            toast.success(`Currency settings updated`, {
              icon: '💰',
              duration: 4000
            });
          }
          break;
          
        case 'compact_mode':
          // Apply compact mode immediately
          {
            if (value === 'true' || value === true) {
              document.documentElement.classList.add('compact-mode');
              document.documentElement.style.setProperty('--spacing-scale', '0.75');
            } else {
              document.documentElement.classList.remove('compact-mode');
              document.documentElement.style.setProperty('--spacing-scale', '1');
            }
            toast.success(`Compact mode ${(value === 'true' || value === true) ? 'enabled' : 'disabled'}`, {
              icon: (value === 'true' || value === true) ? '📦' : '🏠',
              duration: 2000
            });
          }
          break;
          
        case 'sidebar_position':
          // Apply sidebar position change
          {
            document.documentElement.style.setProperty('--sidebar-position', value);
            document.documentElement.setAttribute('data-sidebar-position', value);
            toast.success(`Sidebar position changed to ${value}`, {
              icon: '📍',
              duration: 2000
            });
          }
          break;
          
        case 'color_scheme':
          // Apply color scheme change with proper CSS custom properties
          {
            const colorSchemes = {
              blue: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
              green: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
              purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
              red: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
              orange: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
              teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#5eead4' },
              pink: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
              gray: { primary: '#6b7280', secondary: '#4b5563', accent: '#9ca3af' }
            };
            
            const scheme = colorSchemes[value as keyof typeof colorSchemes];
            if (scheme) {
              document.documentElement.style.setProperty('--primary', scheme.primary);
              document.documentElement.style.setProperty('--primary-dark', scheme.secondary);
              document.documentElement.style.setProperty('--accent', scheme.accent);
              document.documentElement.setAttribute('data-color-scheme', value);
              
              toast.success(`Color scheme changed to ${value}`, {
                icon: '🎨',
                duration: 2000
              });
            }
          }
          break;
          
        case 'layout_density':
          // Apply layout density changes
          {
            const densities = {
              compact: { scale: '0.8', spacing: '0.5rem' },
              comfortable: { scale: '1', spacing: '1rem' },
              spacious: { scale: '1.2', spacing: '1.5rem' }
            };
            
            const density = densities[value as keyof typeof densities];
            if (density) {
              document.documentElement.style.setProperty('--layout-scale', density.scale);
              document.documentElement.style.setProperty('--layout-spacing', density.spacing);
              document.documentElement.setAttribute('data-layout-density', value);
              
              toast.success(`Layout density changed to ${value}`, {
                icon: value === 'compact' ? '📦' : value === 'spacious' ? '🏠' : '🎯',
                duration: 2000
              });
            }
          }
          break;
          
        case 'date_format':
          // Apply date format changes
          {
            document.documentElement.style.setProperty('--date-format', value);
            toast.success(`Date format changed to ${value}`, {
              icon: '📅',
              duration: 2000
            });
          }
          break;
          
        case 'time_format':
          // Apply time format changes
          {
            document.documentElement.style.setProperty('--time-format', value);
            toast.success(`Time format changed to ${value}`, {
              icon: '🕐',
              duration: 2000
            });
          }
          break;
          
        default:
          // For other settings, show appropriate feedback
          if (['printer.printerName', 'printer_type', 'paper_size', 'invoice_printer'].includes(key)) {
            if (value === 'none') {
              toast.success(`${key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} cleared`, {
                icon: '🖨️',
                duration: 2000
              });
            } else {
              // Apply printer settings to system (store for later use)
              document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
              toast.success(`Printer setting updated: ${key.replace(/[_]/g, ' ')}`, {
                icon: '🖨️',
                duration: 2000
              });
            }
          } else if (key.includes('tax') || key.includes('currency')) {
            // Apply tax/financial settings
            document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
            toast.success(`Financial setting updated: ${key.replace(/[_]/g, ' ')}`, {
              icon: '💼',
              duration: 2000
            });
          } else if (key.includes('font') || key.includes('margin')) {
            // Apply typography/spacing settings
            document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
            toast.success(`Display setting updated: ${key.replace(/[_]/g, ' ')}`, {
              icon: '📐',
              duration: 2000
            });
          } else {
            // Generic setting update
            document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
            toast.success(`Setting updated: ${key.replace(/[_]/g, ' ')}`, {
              icon: '⚙️',
              duration: 2000
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error applying setting to system:', error);
      toast.error(`Failed to apply ${key} setting to system`);
    }
  };

  // Initialize form data when settings load
  useEffect(() => {
    const initialData: SettingFormData = {};
    console.log('Initializing form data with settings:', settings.length);
    
    settings.forEach(setting => {
      let value = setting.value || setting.defaultValue || '';
      // Handle printer settings - convert empty values to 'none'
      if ((setting.key === 'printer.printerName' || setting.key === 'invoice_printer') && value === '') {
        value = 'none';
      }
      initialData[setting.key] = value;
      
      // Log printer settings for debugging
      if (setting.key.startsWith('printer.') || setting.key.includes('printer')) {
        console.log(`Setting ${setting.key}: ${value} (original: ${setting.value}, default: ${setting.defaultValue})`);
      }
    });
    
    console.log('Form data initialized:', Object.keys(initialData).filter(key => key.startsWith('printer.') || key.includes('printer')));
    setFormData(initialData);
  }, [settings]);

  // Initialize default settings using the service
  const initializeDefaultSettings = async () => {
    try {
      console.log('🔧 Initializing default settings...');
      
      // First, check database health
      const healthCheck = await window.database.settings.checkDatabaseHealth?.();
      console.log('Database health check:', healthCheck);
      
      if (!healthCheck?.success) {
        toast.error('Database connection issue detected');
        return;
      }
      
      // Initialize defaults using database service
      const result = await window.database.settings.initializeDefaults();
      
      if (result.success) {
        console.log('✅ Default settings initialized successfully');
        
        // Refresh cache to get the new settings
        await settingsCache.refreshCache();
        
        toast.success(`Settings initialized: ${result.created || 0} created, ${result.updated || 0} updated`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        console.error('❌ Failed to initialize default settings:', result.error);
        toast.error(`Failed to initialize settings: ${result.error}`, {
          icon: '❌',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
      toast.error(`Initialization error: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  // Fix settings categories - this updates existing settings to have correct categories
  const fixSettingsCategories = async () => {
    try {
      // Define the correct category mappings
      const categoryMappings = {
        // General Settings
        'company_name': 'general',
        'company_address': 'general', 
        'company_phone': 'general',
        'company_email': 'general',
        'tax_number': 'general',
        'language': 'general',
        'timezone': 'general',
        'date_format': 'general',
        'time_format': 'general',
        'week_start': 'general',
        'region': 'general',
        
        // Currency Settings
        'currency_code': 'currency',
        'currency_symbol': 'currency',
        'currency_position': 'currency',
        'number_format': 'currency',
        'decimal_places': 'currency',
        'round_to_nearest': 'currency',
        'default_tax_rate': 'currency',
        'tax_calculation': 'currency',
        'tax_display': 'currency',
        'tax_rounding': 'currency',
        'allow_negative_inventory': 'currency',
        'price_change_tracking': 'currency',
        'auto_calculate_margin': 'currency',
        'markup_percentage': 'currency',
        
        // Printing Settings
        'auto_print_receipt': 'printing',
        'printer_name': 'printing',
        'printer_type': 'printing',
        'paper_size': 'printing',
        'print_quality': 'printing',
        'print_speed': 'printing',
        'ticket_width': 'printing',
        'ticket_margin_top': 'printing',
        'ticket_margin_bottom': 'printing',
        'ticket_margin_left': 'printing',
        'ticket_margin_right': 'printing',
        'ticket_font_size': 'printing',
        'receipt_header': 'printing',
        'receipt_footer': 'printing',
        'print_logo': 'printing',
        'logo_size': 'printing',
        'print_customer_copy': 'printing',
        'print_merchant_copy': 'printing',
        'print_barcode': 'printing',
        'print_qr_code': 'printing',
        'invoice_printer': 'printing',
        'invoice_paper_size': 'printing',
        'invoice_orientation': 'printing',
        'invoice_margin_top': 'printing',
        'invoice_margin_bottom': 'printing',
        'invoice_margin_left': 'printing',
        'invoice_margin_right': 'printing',
        'invoice_font_size': 'printing',
        'invoice_logo_position': 'printing',
        'auto_print_invoice': 'printing',
        'invoice_threshold': 'printing',
        
        // POS Settings
        'pos_layout': 'pos',
        'products_per_page': 'pos',
        'enable_barcode_scanner': 'pos',
        'sound_effects': 'pos',
        'show_product_images': 'pos',
        'enable_quick_sale': 'pos',
        'require_customer_info': 'pos',
        
        // Appearance Settings
        'theme_mode': 'appearance',
        'font_size': 'appearance',
        'compact_mode': 'appearance',
        'show_animations': 'appearance',
        'sidebar_position': 'appearance',
        'color_scheme': 'appearance',
        'layout_density': 'appearance'
      };

      // Update each setting that has wrong category
      let fixedCount = 0;
      for (const setting of settings) {
        const correctCategory = categoryMappings[setting.key as keyof typeof categoryMappings];
        if (correctCategory && setting.category !== correctCategory) {
          console.log(`Fixing category for ${setting.key}: ${setting.category} -> ${correctCategory}`);
          
          // Delete and recreate with correct category (simpler than complex update)
          await window.database.settings.delete(setting.key);
          await window.database.settings.set(setting.key, setting.value || setting.defaultValue);
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        toast.success(`Fixed categories for ${fixedCount} settings`);
        await refresh();
      } else {
        toast('All settings already have correct categories', {
          icon: '✅',
          duration: 2000
        });
      }
    } catch (error) {
      toast.error('Failed to fix settings categories');
      console.error('Error fixing categories:', error);
    }
  };

  const handleInputChange = async (key: string, value: any) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    
    // Special handling for printer settings
    if (key === 'printer.printerName' && value !== 'none') {
      try {
        // Set the printer as default in the system
        const result = await (window as any).printer.setDefaultPrinter(value);
        if (result.success) {
          toast.success(`Default printer set to ${value}`, {
            icon: '🖨️',
            duration: 2000
          });
        } else {
          toast.error(`Failed to set default printer: ${result.error}`, {
            icon: '❌',
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error setting default printer:', error);
        toast.error('Failed to set default printer');
      }
    }
    
    // Save to cache and database immediately
    try {
      console.log(`Attempting to save setting: ${key} = ${value}`);
      const success = await settingsCache.setSetting(key, value);
      
      if (success) {
        console.log(`Setting ${key} saved successfully: ${value}`);
        // Apply the change to the system immediately
        await applySettingToSystem(key, value);
        
        // Show success feedback for important settings
        if (key.includes('printer') || key.includes('currency') || key.includes('company')) {
          toast.success(`${key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} updated`, {
            icon: '✅',
            duration: 2000
          });
        }
      } else {
        console.error('Failed to save setting to cache');
        toast.error(`Failed to save ${key}`, {
          icon: '❌',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error(`Failed to save ${key}: ${error}`, {
        icon: '❌',
        duration: 4000
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all changes to cache and database
      const success = await settingsCache.bulkUpdateSettings(formData);
      
      if (success) {
        toast.success('Settings saved successfully');
        setHasChanges(false);
        // Refresh cache to ensure we have latest data
        await settingsCache.refreshCache();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const categorySettings = settings.filter(s => s.category === activeTab);
      const resetUpdates: Record<string, any> = {};
      
      // Prepare reset updates
      categorySettings.forEach(setting => {
        resetUpdates[setting.key] = setting.defaultValue;
      });
      
      // Reset settings using cache
      const success = await settingsCache.bulkUpdateSettings(resetUpdates);
      
      if (success) {
        toast.success('Settings reset to defaults');
        // Refresh cache and form data
        await settingsCache.refreshCache();
        setHasChanges(false);
      } else {
        toast.error('Failed to reset settings');
      }
    } catch (error) {
      toast.error('Failed to reset settings');
      console.error('Error resetting settings:', error);
    }
  };

  const renderSettingField = (setting: any) => {
    const value = formData[setting.key] || '';
    
    // Determine if this setting should use a select dropdown
    const selectOptions = getSelectOptions(setting.key);
    const shouldUseSelect = selectOptions.length > 0;

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
            <div className="flex-1">
              <Label htmlFor={setting.key} className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                {setting.label}
              </Label>
              {setting.description && (
                <p className="text-xs text-gray-600 mt-1 ml-6">{setting.description}</p>
              )}
            </div>
            <Switch
              id={setting.key}
              checked={value === 'true' || value === true}
              onCheckedChange={(checked) => 
                handleInputChange(setting.key, checked ? 'true' : 'false')
              }
              className="ml-4"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-3">
            <Label htmlFor={setting.key} className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Type className="w-4 h-4 text-green-600" />
              {setting.label}
            </Label>
            {setting.description && (
              <p className="text-xs text-gray-600 ml-6">{setting.description}</p>
            )}
            <div className="relative">
              <Input
                id={setting.key}
                type="number"
                value={value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                placeholder={setting.defaultValue}
                className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 text-sm">
                #
              </span>
            </div>
          </div>
        );

      case 'select':
      default:
        // Use select for enumerable values, text/textarea for others
        if (shouldUseSelect || setting.type === 'select') {
          return (
            <div className="space-y-3">
              <Label htmlFor={setting.key} className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                {setting.label}
              </Label>
              {setting.description && (
                <p className="text-xs text-gray-600 ml-6">{setting.description}</p>
              )}
              <Select
                value={value}
                onValueChange={(newValue) => handleInputChange(setting.key, newValue)}
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                  <SelectValue placeholder={setting.defaultValue || "Select an option..."} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {selectOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        
        // Text input or textarea for non-enumerable values
        if (setting.key.includes('address') || setting.key.includes('description') || setting.key.includes('header') || setting.key.includes('footer')) {
          return (
            <div className="space-y-3">
              <Label htmlFor={setting.key} className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                {setting.label}
              </Label>
              {setting.description && (
                <p className="text-xs text-gray-600 ml-6">{setting.description}</p>
              )}
              <Textarea
                id={setting.key}
                value={value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                placeholder={setting.defaultValue}
                rows={3}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
              />
            </div>
          );
        } else {
          return (
            <div className="space-y-3">
              <Label htmlFor={setting.key} className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600" />
                {setting.label}
              </Label>
              {setting.description && (
                <p className="text-xs text-gray-600 ml-6">{setting.description}</p>
              )}
              <Input
                id={setting.key}
                type={setting.key.includes('email') ? 'email' : 'text'}
                value={value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                placeholder={setting.defaultValue}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          );
        }
    }
  };

  const getSelectOptions = (key: string) => {
    switch (key) {
      case 'theme_mode':
        return [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ];
      case 'font_size':
        return [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ];
      case 'pos_layout':
        return [
          { value: 'grid', label: 'Grid' },
          { value: 'list', label: 'List' }
        ];
      
      case 'printer_type':
        return [
          { value: 'thermal', label: '🧾 Thermal Printer (Receipt/POS)' },
          { value: 'inkjet', label: '🖨️ Inkjet Printer (Color/Photo)' },
          { value: 'laser', label: '⚡ Laser Printer (Fast/Text)' },
          { value: 'dot_matrix', label: '�� Dot Matrix Printer (Multi-copy)' },
          { value: 'label', label: '🏷️ Label Printer (Barcode/Shipping)' },
          { value: 'wide_format', label: '📐 Wide Format Printer (Posters/Plans)' },
          { value: '3d', label: '🎯 3D Printer' },
          { value: 'photo', label: '📸 Photo Printer (High Quality)' }
        ];
      case 'currency_code':
        return [
          { value: 'DZD', label: '🇩🇿 Algerian Dinar (دج)' },
          { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
          { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
          { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
          { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' },
          { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)' },
          { value: 'JPY', label: '🇯🇵 Japanese Yen (JPY)' },
          { value: 'CHF', label: '🇨🇭 Swiss Franc (CHF)' },
          { value: 'CNY', label: '🇨🇳 Chinese Yuan (CNY)' },
          { value: 'INR', label: '🇮🇳 Indian Rupee (INR)' },
          { value: 'SEK', label: '🇸🇪 Swedish Krona (SEK)' },
          { value: 'NOK', label: '🇳🇴 Norwegian Krone (NOK)' },
          { value: 'DKK', label: '🇩🇰 Danish Krone (DKK)' },
          { value: 'PLN', label: '🇵🇱 Polish Zloty (PLN)' },
          { value: 'CZK', label: '🇨🇿 Czech Koruna (CZK)' },
          { value: 'HUF', label: '🇭🇺 Hungarian Forint (HUF)' }
        ];
      case 'currency_position':
        return [
          { value: 'before', label: 'Before amount ($100)' },
          { value: 'after', label: 'After amount (100$)' },
          { value: 'before_space', label: 'Before with space ($ 100)' },
          { value: 'after_space', label: 'After with space (100 $)' }
        ];
      case 'number_format':
        return [
          { value: 'comma_dot', label: '1,234.56 (US Format)' },
          { value: 'space_comma', label: '1 234,56 (European Format)' },
          { value: 'dot_comma', label: '1.234,56 (German Format)' },
          { value: 'apostrophe_dot', label: "1'234.56 (Swiss Format)" }
        ];
      case 'round_to_nearest':
        return [
          { value: '0.01', label: '0.01 (Penny/Cent)' },
          { value: '0.05', label: '0.05 (Nickel)' },
          { value: '0.10', label: '0.10 (Dime)' },
          { value: '0.25', label: '0.25 (Quarter)' },
          { value: '0.50', label: '0.50 (Half)' },
          { value: '1.00', label: '1.00 (Whole)' }
        ];
      case 'language':
        return [
          { value: 'en', label: '🇺🇸 English' },
          { value: 'fr', label: '🇫🇷 Français' },
          { value: 'ar', label: '🇸🇦 العربية' }
        ];
      case 'timezone':
        return [
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'Eastern Time (US)' },
          { value: 'America/Chicago', label: 'Central Time (US)' },
          { value: 'America/Denver', label: 'Mountain Time (US)' },
          { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
          { value: 'Europe/London', label: 'London' },
          { value: 'Europe/Paris', label: 'Paris' },
          { value: 'Europe/Berlin', label: 'Berlin' },
          { value: 'Asia/Tokyo', label: 'Tokyo' },
          { value: 'Asia/Shanghai', label: 'Shanghai' },
          { value: 'Asia/Dubai', label: 'Dubai' },
          { value: 'Australia/Sydney', label: 'Sydney' }
        ];
      case 'date_format':
        return [
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European)' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
          { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (German)' },
          { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
          { value: 'DD MMM YYYY', label: 'DD MMM YYYY (01 Jan 2024)' },
          { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Jan 01, 2024)' }
        ];
      case 'time_format':
        return [
          { value: '12h', label: '12-hour (1:30 PM)' },
          { value: '24h', label: '24-hour (13:30)' }
        ];
      case 'week_start':
        return [
          { value: 'sunday', label: 'Sunday' },
          { value: 'monday', label: 'Monday' },
          { value: 'saturday', label: 'Saturday' }
        ];
      case 'region':
        return [
          { value: 'US', label: '🇺🇸 United States' },
          { value: 'CA', label: '🇨🇦 Canada' },
          { value: 'GB', label: '🇬🇧 United Kingdom' },
          { value: 'DE', label: '🇩🇪 Germany' },
          { value: 'FR', label: '🇫🇷 France' },
          { value: 'ES', label: '🇪🇸 Spain' },
          { value: 'IT', label: '🇮🇹 Italy' },
          { value: 'JP', label: '🇯🇵 Japan' },
          { value: 'AU', label: '🇦🇺 Australia' },
          { value: 'IN', label: '🇮🇳 India' }
        ];
      case 'paper_size':
        return [
          { value: '58mm', label: '58mm (Thermal)' },
          { value: '80mm', label: '80mm (Thermal)' },
          { value: '112mm', label: '112mm (Wide Thermal)' },
          { value: 'A4', label: 'A4 (210 × 297 mm)' },
          { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
          { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
          { value: 'A5', label: 'A5 (148 × 210 mm)' },
          { value: 'A6', label: 'A6 (105 × 148 mm)' }
        ];
      case 'sidebar_position':
        return [
          { value: 'left', label: '← Left Side' },
          { value: 'right', label: 'Right Side →' },
          { value: 'hidden', label: '⊡ Hidden (Collapsible)' }
        ];
      case 'color_scheme':
        return [
          { value: 'blue', label: '🔵 Blue (Default)' },
          { value: 'green', label: '🟢 Green (Nature)' },
          { value: 'purple', label: '🟣 Purple (Creative)' },
          { value: 'red', label: '🔴 Red (Bold)' },
          { value: 'orange', label: '🟠 Orange (Energetic)' },
          { value: 'teal', label: '🐬 Teal (Professional)' },
          { value: 'pink', label: '🌸 Pink (Soft)' },
          { value: 'gray', label: '⚫ Gray (Minimal)' }
        ];
      case 'layout_density':
        return [
          { value: 'compact', label: '📦 Compact (More Content)' },
          { value: 'comfortable', label: '🎯 Comfortable (Balanced)' },
          { value: 'spacious', label: '🏠 Spacious (More Whitespace)' }
        ];
      // Enhanced Printing Options  
      case 'printer_name':
      case 'invoice_printer':
      case 'printer.printerName':
        return availablePrinters.length > 0 ? [
          { value: 'none', label: 'Select Printer...' },
          ...availablePrinters
        ] : [
          { value: 'none', label: 'Select Printer...' },
          { value: 'default', label: '🖨️ System Default Printer' },
          { value: 'microsoft_print_to_pdf', label: '📄 Microsoft Print to PDF' },
          { value: 'thermal_printer_1', label: '🧾 Thermal Printer (USB)' },
          { value: 'thermal_printer_2', label: '🧾 Thermal Printer (Network)' },
          { value: 'epson_tm_t20', label: '🖨️ EPSON TM-T20' },
          { value: 'star_tsp143', label: '⭐ Star TSP143' },
          { value: 'zebra_gk420t', label: '🦓 Zebra GK420t' },
          { value: 'brother_ql820nwb', label: '👥 Brother QL-820NWB' },
          { value: 'canon_pixma', label: '🖨️ Canon PIXMA Series' },
          { value: 'hp_laserjet', label: '🖨️ HP LaserJet Series' },
        ];

      case 'printer.copies':
        return [
          { value: '1', label: '1 Copy' },
          { value: '2', label: '2 Copies' },
          { value: '3', label: '3 Copies' },
          { value: '4', label: '4 Copies' },
          { value: '5', label: '5 Copies' }
        ];
      case 'printer.silent':
      case 'printer.preview':
        return [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ];
      case 'printer.timeOutPerLine':
        return [
          { value: '200', label: '200ms (Fast)' },
          { value: '400', label: '400ms (Normal)' },
          { value: '600', label: '600ms (Slow)' },
          { value: '800', label: '800ms (Very Slow)' }
        ];
      case 'print_quality':
        return [
          { value: 'draft', label: 'Draft (Fast, Low Quality)' },
          { value: 'standard', label: 'Standard (Normal)' },
          { value: 'high', label: 'High Quality (Slow)' },
          { value: 'best', label: 'Best Quality (Very Slow)' }
        ];
      case 'print_speed':
        return [
          { value: 'slow', label: 'Slow (Better Quality)' },
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Fast (Draft Quality)' },
          { value: 'maximum', label: 'Maximum Speed' }
        ];
      case 'ticket_font_size':
      case 'invoice_font_size':
        return [
          { value: '8', label: '8pt (Very Small)' },
          { value: '9', label: '9pt (Small)' },
          { value: '10', label: '10pt (Normal)' },
          { value: '11', label: '11pt' },
          { value: '12', label: '12pt (Medium)' },
          { value: '14', label: '14pt (Large)' },
          { value: '16', label: '16pt (Very Large)' },
          { value: '18', label: '18pt (Extra Large)' }
        ];
      case 'logo_size':
        return [
          { value: 'small', label: 'Small (25% width)' },
          { value: 'medium', label: 'Medium (50% width)' },
          { value: 'large', label: 'Large (75% width)' },
          { value: 'full', label: 'Full Width' }
        ];
      case 'invoice_orientation':
        return [
          { value: 'portrait', label: 'Portrait (Vertical)' },
          { value: 'landscape', label: 'Landscape (Horizontal)' }
        ];
      case 'invoice_logo_position':
        return [
          { value: 'top-left', label: 'Top Left' },
          { value: 'top-center', label: 'Top Center' },
          { value: 'top-right', label: 'Top Right' },
          { value: 'center-left', label: 'Center Left' },
          { value: 'center', label: 'Center' },
          { value: 'center-right', label: 'Center Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
          { value: 'bottom-center', label: 'Bottom Center' },
          { value: 'bottom-right', label: 'Bottom Right' }
        ];
      case 'invoice_paper_size':
        return [
          { value: 'A4', label: 'A4 (210 × 297 mm)' },
          { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
          { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
          { value: 'A3', label: 'A3 (297 × 420 mm)' },
          { value: 'A5', label: 'A5 (148 × 210 mm)' },
          { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' }
        ];
      case 'printer_quality':
        return [
          { value: 'draft', label: 'Draft (Fast, Low Quality)' },
          { value: 'normal', label: 'Normal (Standard)' },
          { value: 'high', label: 'High Quality (Slow)' },
          { value: 'best', label: 'Best Quality (Very Slow)' }
        ];
      case 'printer_color_mode':
        return [
          { value: 'monochrome', label: 'Monochrome (Black & White)' },
          { value: 'color', label: 'Color (Full Color)' },
          { value: 'grayscale', label: 'Grayscale (Shades of Gray)' }
        ];
      case 'printer_font_family':
        return [
          { value: 'Arial', label: 'Arial (Sans-serif)' },
          { value: 'Times New Roman', label: 'Times New Roman (Serif)' },
          { value: 'Courier New', label: 'Courier New (Monospace)' },
          { value: 'Helvetica', label: 'Helvetica (Clean)' },
          { value: 'Georgia', label: 'Georgia (Elegant)' },
          { value: 'Verdana', label: 'Verdana (Readable)' }
        ];
      case 'printer_orientation':
        return [
          { value: 'portrait', label: 'Portrait (Vertical)' },
          { value: 'landscape', label: 'Landscape (Horizontal)' }
        ];
      default:
        return [];
    }
  };

  const tabs = [
    {
      id: 'general' as SettingCategory,
      label: 'General',
      icon: Store,
      description: 'Basic company and application settings'
    },
    {
      id: 'printing' as SettingCategory,
      label: 'Printing',
      icon: Printer,
      description: 'Receipt and report printing configuration'
    },
    {
      id: 'pos' as SettingCategory,
      label: 'POS',
      icon: Monitor,
      description: 'Point of sale interface settings'
    },
    {
      id: 'appearance' as SettingCategory,
      label: 'Appearance',
      icon: Palette,
      description: 'Theme and visual customization'
    },
    {
      id: 'currency' as SettingCategory,
      label: 'Currency',
      icon: Coins,
      description: 'Currency and financial settings'
    }
  ];

  const categorySettings = settings.filter(s => s.category === activeTab);



  // Auto-initialize settings if we don't have enough settings loaded
  useEffect(() => {
    if (!loading && !error) {
      console.log('Checking if initialization needed. Settings count:', settings.length);
      if (settings.length < 30) {
        console.log('Triggering auto-initialization');
        initializeDefaultSettings();
      } else {
        // Check for missing printer settings even if we have enough settings
        checkAndFixPrinterSettings();
      }
    }
  }, [loading, error, settings.length]);

  // Auto-fix categories if many settings have 'custom' category
  useEffect(() => {
    if (!loading && !error && settings.length > 0) {
      const customCategoryCount = settings.filter(s => s.category === 'custom').length;
      const customPercentage = (customCategoryCount / settings.length) * 100;
      
      console.log(`Found ${customCategoryCount} settings with 'custom' category (${customPercentage.toFixed(1)}%)`);
      
      // If more than 50% of settings have 'custom' category, automatically fix them
      if (customPercentage > 50) {
        console.log('Auto-fixing settings categories...');
        toast('Detected settings with wrong categories, fixing automatically...', {
          icon: '🔧',
          duration: 3000
        });
        fixSettingsCategories();
      }
    }
  }, [loading, error, settings]);
  
  // Also try to initialize on mount
  useEffect(() => {
    const initOnMount = async () => {
      try {
        console.log('Initializing database on mount');
        await window.database.initialize();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database initialization failed on mount:', error);
      }
    };
    initOnMount();
  }, []);

  // Detect available printers from OS
  const detectPrinters = async () => {
    setLoadingPrinters(true);
    try {
      // Use the actual printer API
      const result = await (window as any).printer.getAvailablePrinters();
      
      if (result.success) {
        setAvailablePrinters(result.data);
        toast.success(`Found ${result.data.length} printers`);
      } else {
        toast.error('Failed to detect printers');
        console.error('Printer detection failed:', result.error);
      }
    } catch (error) {
      toast.error('Failed to detect printers');
      console.error('Error detecting printers:', error);
    } finally {
      setLoadingPrinters(false);
    }
  };

  // Initialize printer detection on component mount
  useEffect(() => {
    detectPrinters();
  }, []);

  // Test printer function
  const testPrinter = async (printerName?: string) => {
    try {
      // If no printer name provided, use the current default printer from settings
      const targetPrinter = printerName || formData['printer.printerName'] || 'none';
      
      if (targetPrinter === 'none') {
        toast.error('No printer selected. Please select a printer first.');
        return;
      }
      
      console.log(`Testing printer: ${targetPrinter}`);
      
      const result = await (window as any).printer.testPrinter(targetPrinter);
      
      if (result.success) {
        toast.success(`Test print completed successfully to ${result.data.printer}`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Test print failed: ${result.error}`, {
          icon: '❌',
          duration: 3000
        });
      }
    } catch (error) {
      toast.error('Failed to test printer');
      console.error('Error testing printer:', error);
    }
  };

  // Test current printer from settings
  const testCurrentPrinter = async () => {
    try {
      const currentPrinter = formData['printer.printerName'];
      
      if (!currentPrinter || currentPrinter === 'none') {
        toast.error('No printer selected in settings. Please select a printer first.');
        return;
      }
      
      console.log(`Testing current printer from settings: ${currentPrinter}`);
      
      const result = await (window as any).printer.testPrinter(currentPrinter);
      
      if (result.success) {
        toast.success(`Test print completed successfully to ${result.data.printer}`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Test print failed: ${result.error}`, {
          icon: '❌',
          duration: 3000
        });
      }
    } catch (error) {
      toast.error('Failed to test current printer');
      console.error('Error testing current printer:', error);
    }
  };

  // Get default printer on component mount
  useEffect(() => {
    const getDefaultPrinter = async () => {
      try {
        const result = await (window as any).printer.getDefaultPrinter();
        if (result.success) {
          // Update form data with default printer
          setFormData(prev => ({
            ...prev,
            'printer.printerName': result.data
          }));
        }
      } catch (error) {
        console.error('Error getting default printer:', error);
      }
    };
    
    getDefaultPrinter();
  }, []);

  // Check and fix missing printer settings
  const checkAndFixPrinterSettings = async () => {
    try {
      const printerSettings = [
        'printer.printerName', 'printer.pageSize', 'printer.copies', 'printer.margin',
        'printer.silent', 'printer.preview', 'printer.timeOutPerLine', 'invoice_printer'
      ];
      
      let missingSettings = 0;
      for (const settingKey of printerSettings) {
        try {
          const result = await window.database.settings.get(settingKey);
          if (result === null) {
            console.log(`Missing printer setting: ${settingKey}`);
            missingSettings++;
          }
        } catch (error) {
          console.log(`Error checking setting ${settingKey}:`, error);
          missingSettings++;
        }
      }
      
      if (missingSettings > 0) {
        console.log(`Found ${missingSettings} missing printer settings, initializing...`);
        await initializeDefaultSettings();
      }
    } catch (error) {
      console.error('Error checking printer settings:', error);
    }
  };

  // Debug function to log current printer settings
  const debugPrinterSettings = async () => {
    try {
      console.log('=== DEBUG: Current Printer Settings ===');
      
      const printerSettings = [
        'printer.printerName', 'printer.pageSize', 'printer.copies', 'printer.margin',
        'printer.silent', 'printer.preview', 'printer.timeOutPerLine', 'invoice_printer'
      ];
      
      for (const settingKey of printerSettings) {
        try {
          const result = await window.database.settings.get(settingKey);
          console.log(`${settingKey}: ${result}`);
        } catch (error) {
          console.log(`${settingKey}: ERROR - ${error}`);
        }
      }
      
      console.log('=== END DEBUG ===');
      toast.success('Printer settings logged to console');
    } catch (error) {
      console.error('Error debugging printer settings:', error);
      toast.error('Failed to debug printer settings');
    }
  };

  // Test function to manually save a printer setting
  const testSavePrinterSetting = async () => {
    try {
      console.log('Testing manual save of printer setting...');
      
      const testKey = 'printer.printerName';
      const testValue = 'Test Printer Manual';
      
      console.log(`Manually saving ${testKey} = ${testValue}`);
      
      const result = await window.database.settings.set(testKey, testValue);
      
      if (result.success) {
        console.log('Manual save successful');
        toast.success('Manual printer setting save successful');
        
        // Try to retrieve it
        const retrieved = await window.database.settings.get(testKey);
        console.log(`Retrieved value: ${retrieved}`);
        
        await refresh();
      } else {
        console.error('Manual save failed:', result.error);
        toast.error(`Manual save failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in manual test:', error);
      toast.error(`Manual test failed: ${error}`);
    }
  };

  // Function to update currency to Algerian Dinar
  const updateCurrencyToDZD = async () => {
    try {
      const result = await window.database.settings.updateCurrencyToDZD();
      if (result.success) {
        toast.success(t('settings.currencyUpdated', 'Currency updated to Algerian Dinar (دج)'));
        refresh();
        await settingsCache.refreshCache();
      } else {
        toast.error(t('settings.currencyUpdateError', 'Failed to update currency'));
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
      toast.error(t('settings.currencyUpdateError', 'Failed to update currency'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4 animate-spin" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your application preferences</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          
          <Button
            variant="outline"
            onClick={initializeDefaultSettings}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Database className="w-4 h-4 mr-2" />
            Initialize Defaults
          </Button>
          
          <Button
            variant="outline"
            onClick={checkAndFixPrinterSettings}
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Fix Printer Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={debugPrinterSettings}
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Debug Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={testSavePrinterSetting}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Test Save
          </Button>
          
          <Button
            variant="outline"
            onClick={testCurrentPrinter}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Test Current Printer
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Category
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Settings Test Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <SettingsTest />
          <SettingsCacheStatus />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-500">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings, {
                  className: "w-5 h-5"
                })}
                <span>{tabs.find(t => t.id === activeTab)?.label} Settings</span>
              </CardTitle>
              <CardDescription>
                {tabs.find(t => t.id === activeTab)?.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {categorySettings.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No settings available for this category</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Total settings loaded: {settings.length} | Category: {activeTab}
                  </p>
                  <Button 
                    onClick={initializeDefaultSettings}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Initialize Default Settings
                  </Button>
                </div>
              ) : (
                <>
                  {/* Category-specific layout */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Store className="w-5 h-5" />
                          Company Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categorySettings.filter(s => s.key.includes('company') || s.key.includes('tax')).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              {renderSettingField(setting)}
                              {setting.description && (
                                <p className="text-xs text-gray-500">{setting.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Regional & Localization Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {categorySettings.filter(s => 
                            s.key.includes('language') || 
                            s.key.includes('timezone') || 
                            s.key.includes('date_format') || 
                            s.key.includes('time_format') || 
                            s.key.includes('week_start') || 
                            s.key.includes('region')
                          ).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              {renderSettingField(setting)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'printing' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Printer className="w-5 h-5" />
                            Basic Printer Settings
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testPrinter(formData['printer.printerName'])}
                              disabled={!formData['printer.printerName'] || formData['printer.printerName'] === 'none'}
                              className="text-xs"
                            >
                              <Printer className="w-3 h-3 mr-1" />
                              Test Print
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={detectPrinters}
                              disabled={loadingPrinters}
                              className="text-xs"
                            >
                              {loadingPrinters ? (
                                <>
                                  <Settings className="w-3 h-3 mr-1 animate-spin" />
                                  Detecting...
                                </>
                              ) : (
                                <>
                                  <Wifi className="w-3 h-3 mr-1" />
                                  Refresh Printers
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={initializeDefaultSettings}
                              className="text-xs bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                            >
                              <Database className="w-3 h-3 mr-1" />
                              Reset Settings
                            </Button>
                          </div>
                        </h3>
                        
                        {/* Printer Info Display */}
                        {selectedPrinterInfo && (
                          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                {selectedPrinterInfo.name}
                              </h4>
                              <Badge 
                                variant={selectedPrinterInfo.status === 'ready' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {selectedPrinterInfo.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Type:</span>
                                <div className="text-gray-600 capitalize">{selectedPrinterInfo.type}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Connection:</span>
                                <div className="text-gray-600 capitalize">{selectedPrinterInfo.connection}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <div className="text-gray-600 capitalize">{selectedPrinterInfo.status}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categorySettings.filter(s => 
                            s.key === 'printer.printerName' ||
                            s.key === 'printer.pageSize' ||
                            s.key === 'printer.copies' ||
                            s.key === 'printer.margin' ||
                            s.key === 'printer.silent' ||
                            s.key === 'printer.preview' ||
                            s.key === 'printer.timeOutPerLine'
                          ).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              {renderSettingField(setting)}
                              {setting.description && (
                                <p className="text-xs text-gray-500">{setting.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        

                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'currency' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Coins className="w-5 h-5" />
                          Currency Display
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categorySettings.filter(s => 
                            s.key.includes('currency') || 
                            s.key.includes('number_format') || 
                            s.key.includes('decimal') || 
                            s.key.includes('round')
                          ).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              {renderSettingField(setting)}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Receipt className="w-5 h-5" />
                          Tax Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categorySettings.filter(s => s.key.includes('tax')).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              {renderSettingField(setting)}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Pricing & Business Rules
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categorySettings.filter(s => 
                            s.key.includes('markup') || 
                            s.key.includes('margin') || 
                            s.key.includes('inventory') || 
                            s.key.includes('price')
                          ).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              {renderSettingField(setting)}
                            </div>
                          ))}
                        </div>
                      </div>
                      {activeTab === 'currency' && (
                        <div className="mt-6">
                          <Button variant="outline" onClick={updateCurrencyToDZD}>
                            {t('settings.setAlgerianDinar', 'تعيين الدينار الجزائري (دج) كعملة افتراضية')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Default layout for other categories */}
                  {!['general', 'printing', 'currency'].includes(activeTab) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categorySettings.map((setting) => (
                        <div key={setting.key} className="space-y-2">
                          {renderSettingField(setting)}
                          {setting.description && (
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}