import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar, Download, Filter, Calculator, DollarSign, Package, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, ensureCurrencyFormatting } from '../../utils/formatters';
interface SupplierPaymentReport {
  supplierId: number;
  supplierName: string;
  totalOrdersAmount: number;
  totalWeights: number;
  transactionPrice: number;
  laborCost: number;
  taxValue: number;
  totalExpenses: number;
  paymentAmount: number;
  orderCount: number;
  dateRange: {
    from: string;
    to: string;
  };
}

interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  supplierId?: number;
  transactionPrice?: number;
  laborCost?: number;
  taxValue?: number;
}

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export default function SupplierPaymentReport() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<SupplierPaymentReport[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    transactionPrice: 0,
    laborCost: 0,
    taxValue: 0,
  });

  useEffect(() => {
    loadSuppliers();
    generateReport();
    // Ensure currency formatting is working
    ensureCurrencyFormatting();
  }, []);

  const loadSuppliers = async () => {
    try {
      const result = await (window as any).database.reports.getSuppliers();
      if (result.success && result.data) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const result = await (window as any).database.reports.getSupplierPaymentReport(filters);
      if (result.success && result.data) {
        setReports(result.data);
      } else {
        console.error('Failed to generate report:', result.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerateReport = () => {
    generateReport();
  };

  const handleSaveReport = () => {
    // TODO: Implement save functionality
    console.log('Saving report with filters:', filters);
  };

  const formatQuantity = (quantity: number) => {
    return `${formatNumber(quantity, 0)}`;
  };

  const getTotalStats = () => {
    if (reports.length === 0) return null;

    return {
      totalPayment: reports.reduce((sum, report) => sum + report.paymentAmount, 0),
      totalOrdersAmount: reports.reduce((sum, report) => sum + report.totalOrdersAmount, 0),
      totalWeights: reports.reduce((sum, report) => sum + report.totalWeights, 0),
      totalExpenses: reports.reduce((sum, report) => sum + report.totalExpenses, 0),
      totalOrders: reports.reduce((sum, report) => sum + report.orderCount, 0),
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('reportsSection.supplierPaymentReport')}
          </h2>
          <p className="text-muted-foreground">
            {t('reportsSection.supplierPaymentDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSaveReport}>
            <Download className="h-4 w-4 mr-2" />
            {t('reportsSection.saveReport')}
          </Button>
          <Button onClick={handleGenerateReport} disabled={loading}>
            <Calculator className="h-4 w-4 mr-2" />
            {loading ? t('reportsSection.generating') : t('reportsSection.generateReport')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t('reportsSection.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">{t('reportsSection.dateFrom')}</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">{t('reportsSection.dateTo')}</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            {/* Supplier Filter */}
            <div className="space-y-2">
              <Label htmlFor="supplier">{t('reportsSection.supplier')}</Label>
                             <Select
                 value={filters.supplierId?.toString() || 'all'}
                 onValueChange={(value) => handleFilterChange('supplierId', value === 'all' ? undefined : parseInt(value))}
               >
                <SelectTrigger>
                  <SelectValue placeholder={t('reportsSection.allSuppliers')} />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="all">{t('reportsSection.allSuppliers')}</SelectItem>
                   {suppliers.map((supplier) => (
                     <SelectItem key={supplier.id} value={supplier.id.toString()}>
                       {supplier.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>

            {/* Transaction Price */}
            <div className="space-y-2">
              <Label htmlFor="transactionPrice">{t('reportsSection.transactionPrice')}</Label>
              <Input
                id="transactionPrice"
                type="number"
                step="0.01"
                value={filters.transactionPrice}
                onChange={(e) => handleFilterChange('transactionPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Labor Cost */}
            <div className="space-y-2">
              <Label htmlFor="laborCost">{t('reportsSection.laborCost')}</Label>
              <Input
                id="laborCost"
                type="number"
                step="0.01"
                value={filters.laborCost}
                onChange={(e) => handleFilterChange('laborCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Tax Value */}
            <div className="space-y-2">
              <Label htmlFor="taxValue">{t('reportsSection.taxValue')}</Label>
              <Input
                id="taxValue"
                type="number"
                step="0.01"
                value={filters.taxValue}
                onChange={(e) => handleFilterChange('taxValue', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">
                 {t('reportsSection.totalPayment')}
               </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalPayment)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">
                 {t('reportsSection.totalOrdersAmount')}
               </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalOrdersAmount)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                      <CardTitle className="text-sm font-medium">
               {t('reportsSection.totalQuantities')}
             </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatQuantity(stats.totalWeights)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">
                 {t('reportsSection.totalExpenses')}
               </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">
                 {t('reportsSection.totalOrders')}
               </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reportsSection.supplierPaymentDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">{t('reportsSection.loading')}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('reportsSection.noDataFound')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                                     <TableHead>{t('reportsSection.supplier')}</TableHead>
                   <TableHead>{t('reportsSection.orderCount')}</TableHead>
                   <TableHead>{t('reportsSection.totalOrdersAmount')}</TableHead>
                                                        <TableHead>{t('reportsSection.totalQuantities')}</TableHead>
                   <TableHead>{t('reportsSection.transactionPrice')}</TableHead>
                   <TableHead>{t('reportsSection.laborCost')}</TableHead>
                   <TableHead>{t('reportsSection.taxValue')}</TableHead>
                   <TableHead>{t('reportsSection.totalExpenses')}</TableHead>
                   <TableHead className="text-right">{t('reportsSection.paymentAmount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.supplierId}>
                    <TableCell className="font-medium">{report.supplierName || t('reportsSection.unknownSupplier')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{report.orderCount}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(report.totalOrdersAmount)}</TableCell>
                    <TableCell>{formatQuantity(report.totalWeights)}</TableCell>
                    <TableCell>{formatCurrency(report.transactionPrice)}</TableCell>
                    <TableCell>{formatCurrency(report.laborCost)}</TableCell>
                    <TableCell>{formatCurrency(report.taxValue)}</TableCell>
                    <TableCell>{formatCurrency(report.totalExpenses)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={report.paymentAmount >= 0 ? "default" : "destructive"}>
                        {formatCurrency(report.paymentAmount)}
                      </Badge>
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
