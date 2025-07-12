import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Settings, Database, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsTest() {
  const [testKey, setTestKey] = useState('test_setting');
  const [testValue, setTestValue] = useState('test_value');
  const [result, setResult] = useState<any>(null);

  const testSaveSetting = async () => {
    try {
      console.log(`Testing save setting: ${testKey} = ${testValue}`);
      const result = await window.database.settings.set(testKey, testValue);
      setResult(result);
      
      if (result.success) {
        toast.success('Setting saved successfully!', {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Failed to save setting: ${result.error}`, {
          icon: '❌',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error testing save setting:', error);
      toast.error(`Test failed: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  const testGetSetting = async () => {
    try {
      console.log(`Testing get setting: ${testKey}`);
      const value = await window.database.settings.get(testKey);
      setResult({ success: true, value });
      
      if (value !== null) {
        toast.success(`Setting retrieved: ${value}`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error('Setting not found', {
          icon: '⚠️',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error testing get setting:', error);
      toast.error(`Test failed: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  const testInitializeDefaults = async () => {
    try {
      console.log('Testing initialize defaults...');
      const result = await window.database.settings.initializeDefaults();
      setResult(result);
      
      if (result.success) {
        toast.success(`Defaults initialized: ${result.created || 0} created, ${result.updated || 0} updated`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Failed to initialize: ${result.error}`, {
          icon: '❌',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error testing initialize defaults:', error);
      toast.error(`Test failed: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  const testDatabaseHealth = async () => {
    try {
      console.log('Testing database health...');
      const result = await window.database.settings.checkDatabaseHealth();
      setResult(result);
      
      if (result.success) {
        toast.success('Database is healthy!', {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Database health check failed: ${result.error}`, {
          icon: '❌',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error testing database health:', error);
      toast.error(`Test failed: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  const testGetAllSettings = async () => {
    try {
      console.log('Testing get all settings...');
      const result = await window.database.settings.getAll();
      setResult(result);
      
      if (result.success) {
        toast.success(`Retrieved ${result.data.length} settings`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Failed to get settings: ${result.error}`, {
          icon: '❌',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error testing get all settings:', error);
      toast.error(`Test failed: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  const testResetDatabase = async () => {
    try {
      console.log('Testing reset database...');
      const result = await window.database.settings.resetDatabase();
      setResult(result);
      
      if (result.success) {
        toast.success('Database reset successfully!', {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast.error(`Failed to reset database: ${result.error}`, {
          icon: '❌',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error testing reset database:', error);
      toast.error(`Test failed: ${error}`, {
        icon: '❌',
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings Test Panel
        </CardTitle>
      </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testKey">Test Key</Label>
              <Input
                id="testKey"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Enter setting key"
              />
            </div>
            <div>
              <Label htmlFor="testValue">Test Value</Label>
              <Input
                id="testValue"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                placeholder="Enter setting value"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testSaveSetting} variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Save
            </Button>
            <Button onClick={testGetSetting} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <Database className="w-4 h-4 mr-2" />
              Test Get
            </Button>
            <Button onClick={testInitializeDefaults} variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
              <Settings className="w-4 h-4 mr-2" />
              Initialize Defaults
            </Button>
            <Button onClick={testDatabaseHealth} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              <AlertCircle className="w-4 h-4 mr-2" />
              Check Health
            </Button>
            <Button onClick={testGetAllSettings} variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
              <Database className="w-4 h-4 mr-2" />
              Get All Settings
            </Button>
            <Button onClick={testResetDatabase} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <Database className="w-4 h-4 mr-2" />
              Reset Database
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <Label>Test Result:</Label>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
        </div>
          )}
      </CardContent>
    </Card>
    </div>
  );
} 