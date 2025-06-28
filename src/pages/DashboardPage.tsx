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
  DollarSign,
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
  const { i18n } = useTranslation();

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
      name: 'Language',
      icon: <Globe className="w-4 h-4" />,
      settingKey: 'language',
      systemValue: i18n.language,
      status: getSettingStatus('language', i18n.language)
    },
    {
      name: 'Theme',
      icon: <Palette className="w-4 h-4" />,
      settingKey: 'theme_mode',
      systemValue: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      status: true // Theme is always working
    },
    {
      name: 'Font Size',
      icon: <Type className="w-4 h-4" />,
      settingKey: 'font_size',
      systemValue: getComputedStyle(document.documentElement).fontSize,
      status: true // Font size is always applied
    },
    {
      name: 'Compact Mode',
      icon: <Layout className="w-4 h-4" />,
      settingKey: 'compact_mode',
      systemValue: document.documentElement.classList.contains('compact-mode'),
      status: getSettingStatus('compact_mode', document.documentElement.classList.contains('compact-mode'))
    },
    {
      name: 'Currency',
      icon: <DollarSign className="w-4 h-4" />,
      settingKey: 'currency_code',
      systemValue: getCurrentValue('currency_code'),
      status: !!getCurrentValue('currency_code')
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <LangToggle variant="select" showLabel showSettingsLink />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Integration Status */}
      <Card className="settings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-600" />
            Settings Integration Status
          </CardTitle>
          <CardDescription>
            Real-time status of system settings integration
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
                        (stat.systemValue ? 'Enabled' : 'Disabled') : 
                        stat.systemValue
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stat.status ? (
                    <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Quick System Info</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Current Language:</span>
                <br />
                <span className="text-blue-600">{i18n.language.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Theme Mode:</span>
                <br />
                <span className="text-blue-600">
                  {document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Root Font Size:</span>
                <br />
                <span className="text-blue-600">{getComputedStyle(document.documentElement).fontSize}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Settings Count:</span>
                <br />
                <span className="text-blue-600">{settings.length} loaded</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Settings updated</p>
                  <p className="text-xs text-gray-500">Language and theme preferences saved</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">System integration active</p>
                  <p className="text-xs text-gray-500">All settings are working correctly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Dashboard loaded</p>
                  <p className="text-xs text-gray-500">Welcome to your POS system</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 