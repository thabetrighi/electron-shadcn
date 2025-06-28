import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { 
  Monitor, 
  Palette, 
  DollarSign, 
  Printer,
  Globe,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  Type,
  Layout
} from 'lucide-react';

interface SettingTest {
  key: string;
  name: string;
  icon: React.ReactNode;
  test: () => Promise<boolean>;
  value: any;
}

export default function SettingsTest() {
  const { settings } = useSettings();
  const { i18n } = useTranslation();
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [testing, setTesting] = useState(false);

  const getCurrentValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || 'Not set';
  };

  const settingTests: SettingTest[] = [
    {
      key: 'language',
      name: 'Language Setting',
      icon: <Globe className="w-4 h-4" />,
      test: async () => {
        const currentLang = i18n.language;
        const settingLang = getCurrentValue('language');
        return currentLang === settingLang;
      },
      value: getCurrentValue('language')
    },
    {
      key: 'theme_mode',
      name: 'Theme Mode',
      icon: <Palette className="w-4 h-4" />,
      test: async () => {
        const savedTheme = localStorage.getItem('theme');
        const settingTheme = getCurrentValue('theme_mode');
        return savedTheme === settingTheme;
      },
      value: getCurrentValue('theme_mode')
    },
    {
      key: 'currency_code',
      name: 'Currency Code',
      icon: <DollarSign className="w-4 h-4" />,
      test: async () => {
        const currencyCode = getCurrentValue('currency_code');
        // Test if currency formatting works
        const testAmount = 1234.56;
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode || 'USD'
        }).format(testAmount);
        return formatted.includes(currencyCode || 'USD');
      },
      value: getCurrentValue('currency_code')
    },
    {
      key: 'font_size',
      name: 'Font Size',
      icon: <Type className="w-4 h-4" />,
      test: async () => {
        const fontSize = getCurrentValue('font_size');
        const rootFontSize = getComputedStyle(document.documentElement).fontSize;
        const expectedSizes = { small: '14px', medium: '16px', large: '18px' };
        return rootFontSize === (expectedSizes[fontSize as keyof typeof expectedSizes] || '16px');
      },
      value: getCurrentValue('font_size')
    },
    {
      key: 'compact_mode',
      name: 'Compact Mode',
      icon: <Layout className="w-4 h-4" />,
      test: async () => {
        const compactMode = getCurrentValue('compact_mode');
        const hasCompactClass = document.documentElement.classList.contains('compact-mode');
        return (compactMode === 'true') === hasCompactClass;
      },
      value: getCurrentValue('compact_mode')
    },
    {
      key: 'printer_name',
      name: 'Printer Configuration',
      icon: <Printer className="w-4 h-4" />,
      test: async () => {
        const printerName = getCurrentValue('printer_name');
        const printerType = getCurrentValue('printer_type');
        const paperSize = getCurrentValue('paper_size');
        return !!(printerName && printerType && paperSize);
      },
      value: `${getCurrentValue('printer_name')} (${getCurrentValue('printer_type')})`
    },
    {
      key: 'color_scheme',
      name: 'Color Scheme',
      icon: <Eye className="w-4 h-4" />,
      test: async () => {
        const colorScheme = getCurrentValue('color_scheme');
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
        return !!primaryColor; // Just check if primary color is set
      },
      value: getCurrentValue('color_scheme')
    }
  ];

  const runAllTests = async () => {
    setTesting(true);
    const results: {[key: string]: boolean} = {};
    
    for (const test of settingTests) {
      try {
        results[test.key] = await test.test();
      } catch (error) {
        console.error(`Test failed for ${test.key}:`, error);
        results[test.key] = false;
      }
    }
    
    setTestResults(results);
    setTesting(false);
  };

  const runSingleTest = async (testKey: string) => {
    const test = settingTests.find(t => t.key === testKey);
    if (!test) return;
    
    try {
      const result = await test.test();
      setTestResults(prev => ({ ...prev, [testKey]: result }));
    } catch (error) {
      console.error(`Test failed for ${testKey}:`, error);
      setTestResults(prev => ({ ...prev, [testKey]: false }));
    }
  };

  const getTestIcon = (testKey: string) => {
    if (!(testKey in testResults)) {
      return <TestTube className="w-4 h-4 text-gray-400" />;
    }
    return testResults[testKey] ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getTestBadge = (testKey: string) => {
    if (!(testKey in testResults)) {
      return <Badge variant="secondary">Not Tested</Badge>;
    }
    return testResults[testKey] ? 
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">✓ Passed</Badge> : 
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">✗ Failed</Badge>;
  };

  const passedTests = Object.values(testResults).filter(result => result).length;
  const totalTests = Object.keys(testResults).length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Settings Integration Test
        </CardTitle>
        <CardDescription>
          Test if settings are properly applied to the system in real-time
        </CardDescription>
        <div className="flex items-center gap-4 mt-4">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            {testing ? 'Testing...' : 'Run All Tests'}
          </Button>
          {totalTests > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {passedTests}/{totalTests} tests passed
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(passedTests / totalTests) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingTests.map((test) => (
            <div key={test.key} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {test.icon}
                  <h4 className="font-medium text-sm">{test.name}</h4>
                </div>
                {getTestIcon(test.key)}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-600 truncate">
                  <strong>Current Value:</strong> {test.value}
                </p>
                <div className="flex items-center justify-between">
                  {getTestBadge(test.key)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runSingleTest(test.key)}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Status */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            System Status
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Language:</span>
              <br />
              <span className="text-blue-600">{i18n.language}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Theme:</span>
              <br />
              <span className="text-blue-600">{document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Font Size:</span>
              <br />
              <span className="text-blue-600">{getComputedStyle(document.documentElement).fontSize}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Compact Mode:</span>
              <br />
              <span className="text-blue-600">
                {document.documentElement.classList.contains('compact-mode') ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 