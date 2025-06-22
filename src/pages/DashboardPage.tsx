import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

interface DashboardStats {
  users: number;
  products: number;
  orders: number;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAndFetchData();
  }, []);

  const initializeAndFetchData = async () => {
    try {
      // Initialize database
      await window.database.initialize();
      
      // Fetch data
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        window.database.users.getAll(),
        window.database.products.getAll(),
        window.database.orders.getAll(),
      ]);

      const users = usersResult.success ? usersResult.data || [] : [];
      const products = productsResult.success ? productsResult.data || [] : [];
      const orders = ordersResult.success ? ordersResult.data || [] : [];

      const revenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      setStats({
        users: users.length,
        products: products.length,
        orders: orders.length,
        revenue,
      });
    } catch (error) {
      console.error('Failed to initialize or fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    try {
      // Create sample users
      await window.database.users.create({
        name: 'Admin User',
        email: 'admin@pos.com',
        role: 'admin',
      });
      await window.database.users.create({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
      });

      // Create sample products
      await window.database.products.create({
        name: 'Coffee - Medium Roast',
        description: 'Premium medium roast coffee beans',
        sellingPrice: 12.99,
        currentStock: 100,
      });
      await window.database.products.create({
        name: 'Organic Tea - Earl Grey',
        description: 'Organic Earl Grey tea blend',
        sellingPrice: 8.99,
        currentStock: 50,
      });
      await window.database.products.create({
        name: 'Chocolate Croissant',
        description: 'Fresh baked chocolate croissant',
        sellingPrice: 3.50,
        currentStock: 25,
      });

      initializeAndFetchData();
    } catch (error) {
      console.error('Failed to create sample data:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={createSampleData} variant="outline">
            Create Sample Data
          </Button>
          <Button onClick={initializeAndFetchData}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Available products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <p className="text-xs text-muted-foreground">All orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your Electron app with mock database is now set up and ready to use! 
              The database has been initialized and you can start managing users, products, and orders.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Features available:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Complete CRUD operations via IPC</li>
                <li>In-memory mock database</li>
                <li>Clean architecture with service layer</li>
                <li>shadcn/ui components for modern UI</li>
                <li>Type-safe database operations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => createSampleData()}>
                Create Sample Data
              </Button>
              <Button variant="outline" onClick={() => initializeAndFetchData()}>
                Refresh Data
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Database Status: ✅ Connected</p>
              <p>Tables: users, products, orders</p>
              <p>Database: In-memory mock database</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 