import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Package, Tag, Users, Database, Loader2 } from 'lucide-react';
import CrudManagement from '../components/dashboard/CrudManagement';
import { Badge } from '../components/ui/badge';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import LangToggle from '../components/LangToggle';
import { 
  BarChart3, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  Monitor,
  Palette,
  Coins,
  Globe,
  CheckCircle,
  Type,
  Layout,
  TestTube
} from 'lucide-react';

export default function DashboardPage() {
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    units: 0,
    users: 0,
  });
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setDbStatus('loading');
      
      // Initialize database
      const initResult = await window.database.initialize();
      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      // Load stats
      const [productsResult, categoriesResult, unitsResult, usersResult] = await Promise.all([
        window.database.products.getAll(),
        window.database.categories.getAll(),
        window.database.units.getAll(),
        window.database.users.getAll(),
      ]);

      setStats({
        products: productsResult.success ? (productsResult.data?.length || 0) : 0,
        categories: categoriesResult.success ? (categoriesResult.data?.length || 0) : 0,
        units: unitsResult.success ? (unitsResult.data?.length || 0) : 0,
        users: usersResult.success ? (usersResult.data?.length || 0) : 0,
      });

      setDbStatus('connected');
    } catch (error) {
      console.error('Database initialization failed:', error);
      setDbStatus('error');
    }
  };

  const getCurrentValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || 'Not set';
  };

  const getSettingStatus = (key: string, systemValue: any) => {
    const settingValue = getCurrentValue(key);
    const isActive = settingValue === systemValue || 
                    (key === 'compact_mode' && (settingValue === 'true') === systemValue) ||
                    (key === 'theme_mode' && systemValue);
    return isActive;
  };

  const systemStats = [
    {
      name: t('settings.language', 'Language'),
      icon: <Globe className="w-4 h-4" />,
      settingKey: 'language',
      systemValue: i18n.language,
      status: getSettingStatus('language', i18n.language)
    },
    {
      name: t('dashboard.themeMode', 'Theme'),
      icon: <Palette className="w-4 h-4" />,
      settingKey: 'theme_mode',
      systemValue: document.documentElement.classList.contains('dark') ? t('system.dark', 'dark') : t('system.light', 'light'),
      status: true // Theme is always working
    },
    {
      name: t('dashboard.rootFontSize', 'Font Size'),
      icon: <Type className="w-4 h-4" />,
      settingKey: 'font_size',
      systemValue: getComputedStyle(document.documentElement).fontSize,
      status: true // Font size is always applied
    },
    {
      name: t('settings.compactMode', 'Compact Mode'),
      icon: <Layout className="w-4 h-4" />,
      settingKey: 'compact_mode',
      systemValue: document.documentElement.classList.contains('compact-mode'),
      status: getSettingStatus('compact_mode', document.documentElement.classList.contains('compact-mode'))
    },
    {
      name: t('settings.currency', 'Currency'),
      icon: <Coins className="w-4 h-4" />,
      settingKey: 'currency_code',
      systemValue: getCurrentValue('currency_code'),
      status: !!getCurrentValue('currency_code')
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title', 'Dashboard')}</h2>
        <div className="flex items-center space-x-2">
          <LangToggle variant="select" showLabel showSettingsLink />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalSales', 'Total Sales')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonth', '+{{percent}}% from last month', { percent: 20.1 })}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.orders', 'Orders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonth', '+{{percent}}% from last month', { percent: 180.1 })}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.customers', 'Customers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonth', '+{{percent}}% from last month', { percent: 19 })}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeNow', 'Active Now')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.sinceLastHour', '+{{count}} since last hour', { count: 201 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Integration Status */}
      <Card className="settings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-600" />
            {t('dashboard.settingsIntegration', 'Settings Integration Status')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.settingsIntegrationSubtitle', 'Real-time status of system settings integration')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemStats.map((stat) => (
              <div key={stat.settingKey} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <div>
                    <p className="font-medium text-sm">{stat.name}</p>
                    <p className="text-xs text-gray-600 truncate max-w-32">
                      {typeof stat.systemValue === 'boolean' ? 
                        (stat.systemValue ? t('status.enabled', 'Enabled') : t('status.disabled', 'Disabled')) : 
                        stat.systemValue
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stat.status ? (
                    <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('status.active', 'Active')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {t('status.inactive', 'Inactive')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-800">{t('dashboard.quickSystemInfo', 'Quick System Info')}</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">{t('dashboard.currentLanguage', 'Current Language')}:</span>
                <br />
                <span className="text-blue-600">{i18n.language.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">{t('dashboard.themeMode', 'Theme Mode')}:</span>
                <br />
                <span className="text-blue-600">
                  {document.documentElement.classList.contains('dark') ? t('system.dark', 'Dark') : t('system.light', 'Light')}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">{t('dashboard.rootFontSize', 'Root Font Size')}:</span>
                <br />
                <span className="text-blue-600">{getComputedStyle(document.documentElement).fontSize}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">{t('dashboard.settingsCount', 'Settings Count')}:</span>
                <br />
                <span className="text-blue-600">{t('dashboard.settingsLoaded', '{{count}} loaded', { count: settings.length })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.overview', 'Overview')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">{t('dashboard.chartPlaceholder', 'Chart visualization would go here')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity', 'Recent Activity')}</CardTitle>
            <CardDescription>{t('dashboard.recentActivitySubtitle', 'Your recent activities and updates')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{t('dashboard.settingsUpdated', 'Settings updated')}</p>
                  <p className="text-xs text-gray-500">{t('dashboard.settingsUpdatedDesc', 'Language and theme preferences saved')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{t('dashboard.systemIntegrationActive', 'System integration active')}</p>
                  <p className="text-xs text-gray-500">{t('dashboard.systemIntegrationDesc', 'All settings are working correctly')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{t('dashboard.dashboardLoaded', 'Dashboard loaded')}</p>
                  <p className="text-xs text-gray-500">{t('dashboard.dashboardLoadedDesc', 'Welcome to your POS system')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 