import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart3, Download, Calendar, Calculator, TrendingUp, Package } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber } from '../utils/formatters';
import SupplierPaymentReport from '../components/reports/SupplierPaymentReport';
import SalesReport from '../components/reports/SalesReport';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('supplier-payment');
  const [quickStats, setQuickStats] = useState({
    todaySales: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    todayOrders: 0
  });

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      // Load today's sales summary
      const salesResult = await (window as any).database.reports.getDailySalesSummary();
      if (salesResult.success && salesResult.data) {
        setQuickStats(prev => ({
          ...prev,
          todaySales: salesResult.data.totalSales || 0,
          todayOrders: salesResult.data.orderCount || 0,
          averageOrderValue: salesResult.data.averageOrderValue || 0
        }));
      }

      // Load suppliers count
      const suppliersResult = await (window as any).database.reports.getSuppliers();
      if (suppliersResult.success && suppliersResult.data) {
        setQuickStats(prev => ({
          ...prev,
          totalSuppliers: suppliersResult.data.length || 0
        }));
      }

      // Load products count
      const productsResult = await (window as any).database.reports.getProductsCount();
      if (productsResult.success) {
        setQuickStats(prev => ({
          ...prev,
          totalProducts: productsResult.data || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {t('filters.dateRange')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
                     <TabsTrigger value="supplier-payment" className="flex items-center">
             <Calculator className="h-4 w-4 mr-2" />
             {t('reportsSection.supplierPaymentReport')}
           </TabsTrigger>
           <TabsTrigger value="sales" className="flex items-center">
             <TrendingUp className="h-4 w-4 mr-2" />
             {t('reportsSection.salesReport')}
           </TabsTrigger>
           <TabsTrigger value="inventory" className="flex items-center">
             <Package className="h-4 w-4 mr-2" />
             {t('reportsSection.inventoryReport')}
           </TabsTrigger>
        </TabsList>

        <TabsContent value="supplier-payment" className="space-y-6">
          <SupplierPaymentReport />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SalesReport />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
                           <CardTitle className="flex items-center">
               <Package className="h-5 w-5 mr-2" />
               {t('reportsSection.inventoryReport')}
             </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                             <h3 className="text-lg font-semibold mb-2">{t('reportsSection.comingSoon')}</h3>
             <p className="text-muted-foreground mb-4">
               {t('reportsSection.inventoryReportDescription')}
             </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">
               {t('reportsSection.todaySales')}
             </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(quickStats.todaySales)}</div>
                         <p className="text-xs text-muted-foreground">
               {t('reportsSection.todayOrders', { count: quickStats.todayOrders })}
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">
               {t('reportsSection.totalSuppliers')}
             </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(quickStats.totalSuppliers)}</div>
                         <p className="text-xs text-muted-foreground">
               {t('reportsSection.activeSuppliers')}
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">
               {t('reportsSection.totalProducts')}
             </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(quickStats.totalProducts)}</div>
                         <p className="text-xs text-muted-foreground">
               {t('reportsSection.activeProducts')}
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">
               {t('reportsSection.averageOrderValue')}
             </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(quickStats.averageOrderValue)}</div>
                         <p className="text-xs text-muted-foreground">
               {t('reportsSection.perOrder')}
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 