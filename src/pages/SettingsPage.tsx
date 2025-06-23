import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { useSettings } from '../hooks/useSettings';
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
  AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type SettingCategory = 'general' | 'printing' | 'pos' | 'appearance';

interface SettingFormData {
  [key: string]: any;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingCategory>('general');
  const [formData, setFormData] = useState<SettingFormData>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { settings, loading, error, refresh } = useSettings();

  // Initialize form data when settings load
  useEffect(() => {
    const initialData: SettingFormData = {};
    settings.forEach(setting => {
      initialData[setting.key] = setting.value || setting.defaultValue || '';
    });
    setFormData(initialData);
  }, [settings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each setting individually via IPC
      const savePromises = Object.entries(formData).map(([key, value]) => 
        window.database.settings.set(key, value)
      );
      
      await Promise.all(savePromises);
      toast.success('Settings saved successfully');
      setHasChanges(false);
      await refresh();
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
      const resetPromises = categorySettings.map(setting => 
        window.database.settings.set(setting.key, setting.defaultValue)
      );
      
      await Promise.all(resetPromises);
      toast.success('Settings reset to defaults');
      await refresh();
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to reset settings');
      console.error('Error resetting settings:', error);
    }
  };

  const renderSettingField = (setting: any) => {
    const value = formData[setting.key] || '';

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={setting.key}
              checked={value === 'true' || value === true}
              onCheckedChange={(checked) => 
                handleInputChange(setting.key, checked ? 'true' : 'false')
              }
            />
            <Label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </Label>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </Label>
            <Input
              id={setting.key}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              placeholder={setting.defaultValue}
            />
          </div>
        );

      case 'select':
        // For predefined select options (would need to be configured)
        const selectOptions = getSelectOptions(setting.key);
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleInputChange(setting.key, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={setting.defaultValue} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        // Text input or textarea
        if (setting.key.includes('address') || setting.key.includes('description') || setting.key.includes('header') || setting.key.includes('footer')) {
          return (
            <div className="space-y-2">
              <Label htmlFor={setting.key} className="text-sm font-medium">
                {setting.label}
              </Label>
              <Textarea
                id={setting.key}
                value={value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                placeholder={setting.defaultValue}
                rows={3}
              />
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <Label htmlFor={setting.key} className="text-sm font-medium">
                {setting.label}
              </Label>
              <Input
                id={setting.key}
                type={setting.key.includes('email') ? 'email' : 'text'}
                value={value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                placeholder={setting.defaultValue}
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
      case 'currency_code':
        return [
          { value: 'USD', label: 'US Dollar (USD)' },
          { value: 'EUR', label: 'Euro (EUR)' },
          { value: 'GBP', label: 'British Pound (GBP)' },
          { value: 'CAD', label: 'Canadian Dollar (CAD)' },
          { value: 'AUD', label: 'Australian Dollar (AUD)' }
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
    }
  ];

  const categorySettings = settings.filter(s => s.category === activeTab);

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
                  <p className="text-gray-500">No settings available for this category</p>
                </div>
              ) : (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}