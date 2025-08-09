import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, ensureCurrencyFormatting } from '../../utils/formatters';
interface SalesSummary {
  totalSales: number | null;
  orderCount: number | null;
  averageOrderValue: number | null;
}

interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function SalesReport() {
  const { t } = useTranslation();
  const [dailySummary, setDailySummary] = useState<SalesSummary | null>(null);
  const [rangeSummary, setRangeSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDailySummary();
    loadRangeSummary();
    loadTopProducts();
    // Ensure currency formatting is working
    ensureCurrencyFormatting();
  }, []);

  const loadDailySummary = async () => {
    try {
      const result = await (window as any).database.reports.getDailySalesSummary();
      if (result.success && result.data) {
        setDailySummary(result.data);
      }
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    }
  };

  const loadRangeSummary = async () => {
    try {
      const result = await (window as any).database.reports.getSalesSummary(dateFrom, dateTo);
      if (result.success && result.data) {
        setRangeSummary(result.data);
      }
    } catch (error) {
      console.error('Failed to load range summary:', error);
    }
  };

  const loadTopProducts = async () => {
    try {
      const result = await (window as any).database.reports.getTopSellingProducts(10, dateFrom, dateTo);
      if (result.success && result.data) {
        setTopProducts(result.data);
      }
    } catch (error) {
      console.error('Failed to load top products:', error);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRangeSummary(),
        loadTopProducts(),
      ]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    // TODO: Implement save functionality
    console.log('Saving sales report');
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
                     <h2 className="text-2xl font-bold tracking-tight">
             {t('reportsSection.salesReport')}
           </h2>
           <p className="text-muted-foreground">
             {t('reportsSection.salesReportDescription')}
           </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSaveReport}>
                         <Download className="h-4 w-4 mr-2" />
             {t('reportsSection.saveReport')}
           </Button>
           <Button onClick={handleGenerateReport} disabled={loading}>
             <Calendar className="h-4 w-4 mr-2" />
             {loading ? t('reportsSection.generating') : t('reportsSection.generateReport')}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
                     <CardTitle className="flex items-center">
             <Calendar className="h-5 w-5 mr-2" />
             {t('reportsSection.dateRange')}
           </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                             <Label htmlFor="dateFrom">{t('reportsSection.dateFrom')}</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
                             <Label htmlFor="dateTo">{t('reportsSection.dateTo')}</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">
               {t('reportsSection.todaySales')}
             </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dailySummary?.totalSales)}
            </div>
                         <p className="text-xs text-muted-foreground">
               {t('reportsSection.todayOrders', { count: dailySummary?.orderCount || 0 })}
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
            <div className="text-2xl font-bold">
              {formatCurrency(dailySummary?.averageOrderValue)}
            </div>
                         <p className="text-xs text-muted-foreground">
               {t('reportsSection.perOrder')}
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reportsSection.todayOrders')}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dailySummary?.orderCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reportsSection.orders')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reportsSection.dateRangeSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t('reportsSection.totalSales')}
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(rangeSummary?.totalSales)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t('reportsSection.totalOrders')}
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(rangeSummary?.orderCount)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t('reportsSection.averageOrderValue')}
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(rangeSummary?.averageOrderValue)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {t('reportsSection.topSellingProducts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('reportsSection.noDataFound')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reportsSection.product')}</TableHead>
                  <TableHead>{t('reportsSection.quantity')}</TableHead>
                  <TableHead>{t('reportsSection.revenue')}</TableHead>
                  <TableHead className="text-right">{t('reportsSection.rank')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatNumber(product.totalQuantity)}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">#{index + 1}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
