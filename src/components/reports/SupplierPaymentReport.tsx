import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar, Filter, Calculator, Package, Users, Printer, Coins } from 'lucide-react';
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
    dateFrom: new Date().toISOString().split('T')[0], // Today's date
    dateTo: new Date().toISOString().split('T')[0], // Today's date
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

  const handlePrintReport = async () => {
    try {
      console.log('=== PRINTING SUPPLIER PAYMENT REPORT ===');
      console.log('Filters Applied:', filters);
      
      // First, update the report data before printing
      console.log('🔄 تحديث بيانات التقرير قبل الطباعة...');
      await generateReport();
      
      // Get printer settings from cache (same as POS page)
      const printerName = (window as any).settingsCache?.getSetting('printer.printerName') || 'Microsoft Print to PDF';
      console.log('Printer settings from cache:', printerName);
      
      // Get POS settings from cache (same as POS page)
      const currencyCode = (window as any).settingsCache?.getSetting('currency_code') || 'DZD';
      const receiptTitle = (window as any).settingsCache?.getSetting('pos_receipt_title') || 'POS SYSTEM';
      const companyName = (window as any).settingsCache?.getSetting('company_name') || '';
      
      console.log('POS settings from cache:', { currencyCode, receiptTitle, companyName });
      
      // Get supplier payment report data using the current filters
      console.log('Getting supplier payment report with filters:', filters);
      
      const supplierReportResult = await (window as any).database.reports.getSupplierPaymentReport(filters);
      console.log('Supplier report result:', supplierReportResult);
      
      if (supplierReportResult.success && supplierReportResult.data && supplierReportResult.data.length > 0) {
        console.log('✅ Found supplier data:', supplierReportResult.data.length, 'records');
        const supplierData = supplierReportResult.data[0];
        
        // Get order items for the same period to display in the report
        console.log('🔍 Getting order items for period:', filters.dateFrom, 'to', filters.dateTo);
        const orderItemsResult = await (window as any).database.reports.getTopSellingProducts(50, filters.dateFrom, filters.dateTo);
        console.log('Order items result:', orderItemsResult);
        
        // Prepare items for printing
        let items = [];
        if (orderItemsResult.success && orderItemsResult.data && orderItemsResult.data.length > 0) {
          items = orderItemsResult.data.map((product: any) => ({
            name: product.productName || 'منتج غير محدد',
            quantity: product.totalQuantity || 0,
            unitPrice: product.totalQuantity > 0 ? (product.totalRevenue / product.totalQuantity) : 0,
            total: product.totalRevenue || 0,
            boxCount: 0,
            boxType: 'K'
          }));
        }
        
        // Create receipt-like data structure (same as POS)
        const reportData = {
          orderNumber: `SUPPLIER-REPORT-${Date.now()}`,
          customerName: 'تقرير دفعات الموردين',
          userAssigned: '',
          subtotal: supplierData.totalOrdersAmount || 0,
          taxAmount: 0, // Remove tax from printing
          totalAmount: supplierData.paymentAmount || 0,
          language: localStorage.getItem('i18nextLng') || 'ar',
          items: items,
          reportSummary: {
            orderCount: supplierData.orderCount || 0,
            totalAmount: supplierData.totalOrdersAmount || 0,
            totalQuantities: supplierData.totalQuantities || 0,
            transactionPrice: supplierData.transactionPrice || 0,
            laborCost: supplierData.laborCost || 0,
            taxValue: 0, // Remove tax from printing summary
            totalExpenses: supplierData.totalExpenses || 0,
            paymentAmount: supplierData.paymentAmount || 0
          }
        };
        
        // Print the report data
        console.log('✅ طباعة التقرير مع البيانات:', reportData);
        await (window as any).printer.printReceipt(reportData);
        console.log('✅ تم إرسال التقرير للطابعة بنجاح');
        
      } else {
        console.log('❌ No supplier data found for the given filters');
        console.log('Filters used:', filters);
        
        // Alert user about no data
        alert(`لم توجد بيانات موردين للفترة من ${filters.dateFrom} إلى ${filters.dateTo}\n\nتأكد من:\n1. وجود طلبات في هذه الفترة\n2. صحة التواريخ المدخلة\n3. أن هناك بيانات في قاعدة البيانات`);
        return; // Don't proceed with printing if no data
      }
      
    } catch (error: any) {
      console.error('Failed to print report:', error);
      alert(`خطأ في طباعة التقرير: ${error.message || 'حدث خطأ غير متوقع'}`);
    }
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            فلاتر التقرير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters in Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-sm font-medium">من تاريخ</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-sm font-medium">إلى تاريخ</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">المورد</Label>
                             <Select
                 value={filters.supplierId?.toString() || 'all'}
                 onValueChange={(value) => handleFilterChange('supplierId', value === 'all' ? undefined : parseInt(value))}
               >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="جميع الموردين" />
                </SelectTrigger>
                                 <SelectContent>
                  <SelectItem value="all">جميع الموردين</SelectItem>
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
              <Label htmlFor="transactionPrice" className="text-sm font-medium">سعر المعاملة</Label>
              <Input
                id="transactionPrice"
                type="number"
                step="0.01"
                value={filters.transactionPrice}
                onChange={(e) => handleFilterChange('transactionPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full"
              />
          </div>

            {/* Labor Cost */}
            <div className="space-y-2">
              <Label htmlFor="laborCost" className="text-sm font-medium">أجرة العمال</Label>
              <Input
                id="laborCost"
                type="number"
                step="0.01"
                value={filters.laborCost}
                onChange={(e) => handleFilterChange('laborCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            {/* Tax Value */}
            <div className="space-y-2">
              <Label htmlFor="taxValue" className="text-sm font-medium">قيمة المكس</Label>
              <Input
                id="taxValue"
                type="number"
                step="0.01"
                value={filters.taxValue}
                onChange={(e) => handleFilterChange('taxValue', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t">
            <Button onClick={handleGenerateReport} disabled={loading} className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {loading ? 'جاري التحديث...' : 'تحديث التقرير'}
            </Button>
            <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              طباعة التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {stats && (
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              ملخص التقرير
               </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalPayment)}</div>
                <div className="text-sm text-blue-700">إجمالي المدفوعات</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalOrdersAmount)}</div>
                <div className="text-sm text-green-700">إجمالي قيمة الطلبات</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900">{formatQuantity(stats.totalWeights)}</div>
                <div className="text-sm text-purple-700">إجمالي الكميات</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-900">{formatCurrency(stats.totalExpenses)}</div>
                <div className="text-sm text-orange-700">إجمالي المصروفات</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <div className="text-sm text-gray-700">عدد الطلبات</div>
              </div>
            </div>
            </CardContent>
          </Card>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            تفاصيل تقرير دفعات الموردين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4 text-lg">جاري تحميل التقرير...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد بيانات</h3>
              <p className="text-muted-foreground">لم يتم العثور على بيانات للفلاتر المحددة</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">المورد</TableHead>
                  <TableHead className="font-semibold">عدد الطلبات</TableHead>
                  <TableHead className="font-semibold">إجمالي قيمة الطلبات</TableHead>
                  <TableHead className="font-semibold">إجمالي الكميات</TableHead>
                  <TableHead className="font-semibold">سعر المعاملة</TableHead>
                  <TableHead className="font-semibold">أجرة العمال</TableHead>
                  <TableHead className="font-semibold">قيمة المكس</TableHead>
                  <TableHead className="font-semibold">إجمالي المصروفات</TableHead>
                  <TableHead className="text-right font-semibold">مبلغ الدفع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.supplierId}>
                    <TableCell className="font-medium">{report.supplierName || 'غير محدد'}</TableCell>
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
