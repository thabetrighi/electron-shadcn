import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Package, Tag, Users, Database, Loader2 } from 'lucide-react';
import CrudManagement from '../components/dashboard/CrudManagement';

export default function DashboardPage() {
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    units: 0,
    users: 0,
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Manage your POS system data</p>
        </div>
        <Button onClick={initializeDatabase} disabled={dbStatus === 'loading'}>
          {dbStatus === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Refresh Database
            </>
          )}
        </Button>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Database Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                dbStatus === 'connected' ? 'bg-green-500' : 
                dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            />
            <span className="font-medium">
              {dbStatus === 'connected' ? 'Connected' : 
               dbStatus === 'error' ? 'Error' : 'Connecting...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">
              Total products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.units}</div>
            <p className="text-xs text-muted-foreground">
              Measurement units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              System users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CRUD Management */}
      {dbStatus === 'connected' && <CrudManagement />}
      
      {dbStatus === 'error' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Database Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Failed to connect to the database. Please check the console for more details.
            </p>
            <Button onClick={initializeDatabase} className="mt-4">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 