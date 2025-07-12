import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Database, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettingsCache } from '../hooks/useSettingsCache';

export default function SettingsCacheStatus() {
  const settingsCache = useSettingsCache();

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatAge = (age: number) => {
    if (age === 0) return 'Never';
    const minutes = Math.floor(age / 60000);
    const seconds = Math.floor((age % 60000) / 1000);
    return `${minutes}m ${seconds}s ago`;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="w-5 h-5" />
          Settings Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">Status</p>
            <div className="flex items-center gap-2 mt-1">
              {settingsCache.isInitialized ? (
                <Badge variant="outline" className="border-green-300 text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Initialized
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-300 text-red-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Initialized
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-blue-700">Cache Age</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span className="text-sm text-blue-600">
                {formatAge(settingsCache.cacheAge)}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-blue-700">Settings Count</p>
            <span className="text-sm text-blue-600">{settingsCache.settingsCount}</span>
          </div>
          
          <div>
            <p className="text-sm font-medium text-blue-700">Last Updated</p>
            <span className="text-sm text-blue-600">
              {formatTime(settingsCache.lastUpdated)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={settingsCache.refreshCache}
            disabled={settingsCache.isLoading}
            className="border-blue-300 text-blue-600 hover:bg-blue-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${settingsCache.isLoading ? 'animate-spin' : ''}`} />
            Refresh Cache
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={settingsCache.clearCache}
            className="border-red-300 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>
        
        {settingsCache.isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading settings...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 