import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  usersChange: number;
  lowStockItems: number;
  featuredProducts: number;
  todayOrders: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  items: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  image?: string;
}

export default function HomePage() {
  const { t } = useTranslation();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    usersChange: 0,
    lowStockItems: 0,
    featuredProducts: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      setStats({
        totalRevenue: 124580.50,
        totalOrders: 1247,
        totalProducts: 156,
        totalUsers: 89,
        revenueChange: 12.5,
        ordersChange: 8.2,
        productsChange: 5.1,
        usersChange: 15.3,
        lowStockItems: 8,
        featuredProducts: 12,
        todayOrders: 23,
        pendingOrders: 7,
      });

      setRecentOrders([
        {
          id: 1001,
          customerName: 'John Doe',
          total: 89.99,
          status: 'completed',
          date: new Date().toISOString(),
          items: 3,
        },
        {
          id: 1002,
          customerName: 'Jane Smith',
          total: 156.50,
          status: 'pending',
          date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          items: 5,
        },
        {
          id: 1003,
          customerName: 'Mike Johnson',
          total: 234.75,
          status: 'completed',
          date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          items: 7,
        },
        {
          id: 1004,
          customerName: 'Sarah Wilson',
          total: 67.25,
          status: 'cancelled',
          date: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          items: 2,
        },
      ]);

      setTopProducts([
        {
          id: 1,
          name: 'Wireless Headphones',
          sales: 45,
          revenue: 2249.55,
          stock: 23,
        },
        {
          id: 2,
          name: 'Smart Watch',
          sales: 32,
          revenue: 6399.68,
          stock: 15,
        },
        {
          id: 3,
          name: 'Laptop Stand',
          sales: 28,
          revenue: 1399.72,
          stock: 41,
        },
        {
          id: 4,
          name: 'USB-C Cable',
          sales: 67,
          revenue: 1340.33,
          stock: 89,
        },
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number',
    href 
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    format?: 'number' | 'currency';
    href?: string;
  }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? formatCurrency(value) : value.toLocaleString();

    const cardElement = (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1">{t('home.fromLastMonth')}</span>
          </div>
        </CardContent>
      </Card>
    );

    return href ? <Link to={href}>{cardElement}</Link> : cardElement;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-center text-muted-foreground mt-4">{t('home.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{t('home.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('home.welcomeMessage')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Calendar className="h-4 w-4 mr-2" />
            {t('home.last30Days')}
          </Button>
          <Link to="/pos">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('home.newSale')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('home.totalRevenue')}
          value={stats.totalRevenue}
          change={stats.revenueChange}
          icon={DollarSign}
          format="currency"
          href="/reports"
        />
        <StatCard
          title={t('home.totalOrders')}
          value={stats.totalOrders}
          change={stats.ordersChange}
          icon={ShoppingCart}
          href="/orders"
        />
        <StatCard
          title={t('home.productsLabel')}
          value={stats.totalProducts}
          change={stats.productsChange}
          icon={Package}
          href="/products"
        />
        <StatCard
          title={t('home.customers')}
          value={stats.totalUsers}
          change={stats.usersChange}
          icon={Users}
          href="/users"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('home.todaysOrders')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} {t('home.pending')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('home.lowStockAlert')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {t('home.itemsNeedRestock')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('home.featuredProducts')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredProducts}</div>
            <p className="text-xs text-muted-foreground">
              {t('home.currentlyFeatured')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('home.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% {t('home.fromLastWeek')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('home.recentOrders')}</CardTitle>
              <Link to="/orders">
                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('home.viewAll')}</span>
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {t(`home.${order.status}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('home.topProducts')}</CardTitle>
              <Link to="/products">
                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('home.viewAll')}</span>
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} {t('home.sold')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.stock} {t('home.inStock')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('home.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/pos">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                {t('home.newSale')}
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Plus className="h-6 w-6 mb-2" />
                {t('home.addProduct')}
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                {t('home.viewReports')}
              </Button>
            </Link>
            <Link to="/users">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                {t('home.manageUsers')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
