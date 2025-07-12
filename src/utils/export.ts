import { Column } from '../components/AdvancedDataTable';

export interface ExportColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => string;
  width?: number;
}

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  delimiter?: string;
  includeFilters?: boolean;
  selectedOnly?: boolean;
  customFields?: string[];
  format?: 'csv' | 'excel' | 'pdf' | 'json' | 'print';
}

export interface PrintOptions {
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
  includeCompanyInfo?: boolean;
  paperSize?: 'A4' | 'Letter' | 'Receipt';
  orientation?: 'portrait' | 'landscape';
}

// Helper function to get setting via IPC
async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await window.database.settings.get(key);
    return result.success ? result.data?.value || result.data?.defaultValue || null : null;
  } catch {
    return null;
  }
}

// CSV Export
export const exportToCSV = <T>(data: T[], columns: Column<T>[], options: ExportOptions = {}) => {
  const exportColumns = columns.filter(col => col.exportable !== false);
  const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Create CSV headers
  const headers = exportColumns.map(col => col.header).join(',');
  
  // Create CSV rows
  const rows = data.map(row => {
    return exportColumns.map(col => {
      const value = row[col.key];
      const stringValue = String(value || '');
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    }).join(',');
  });
  
  const csvContent = [headers, ...rows].join('\n');
  
  // Download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Excel Export (simplified - using CSV format with .xlsx extension)
export const exportToExcel = <T>(data: T[], columns: Column<T>[], options: ExportOptions = {}) => {
  const filename = options.filename?.replace('.csv', '.xlsx') || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
  exportToCSV(data, columns, { ...options, filename });
};

// JSON Export
export const exportToJSON = <T>(data: T[], columns: Column<T>[], options: ExportOptions = {}) => {
  const exportColumns = columns.filter(col => col.exportable !== false);
  const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.json`;
  
  const exportData = data.map(row => {
    const exportRow: any = {};
    exportColumns.forEach(col => {
      exportRow[String(col.key)] = row[col.key];
    });
    return exportRow;
  });
  
  const jsonContent = JSON.stringify(exportData, null, 2);
  
  // Download the file
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Print functionality
export const printTable = <T>(data: T[], columns: Column<T>[], options: ExportOptions & { title?: string; subtitle?: string } = {}) => {
  const exportColumns = columns.filter(col => col.exportable !== false);
  
  const printStyles = `
    <style>
      @media print {
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .print-header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .print-title { font-size: 24px; font-weight: bold; margin: 0; }
        .print-subtitle { font-size: 14px; color: #666; margin: 5px 0 0 0; }
        .print-meta { font-size: 12px; color: #666; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .no-print { display: none; }
      }
    </style>
  `;
  
  const printContent = `
    ${printStyles}
    <div class="print-header">
      <h1 class="print-title">${options.title || 'Data Export'}</h1>
      ${options.subtitle ? `<p class="print-subtitle">${options.subtitle}</p>` : ''}
      <div class="print-meta">
        Generated on: ${new Date().toLocaleString()} | 
        Total Records: ${data.length} | 
        ${options.selectedOnly ? 'Selected Records Only' : 'All Records'}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          ${exportColumns.map(col => `<th>${col.header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${exportColumns.map(col => {
              const value = row[col.key];
              const displayValue = col.render && typeof window !== 'undefined' 
                ? String(value) // Simplified for print - actual rendering would need React rendering
                : String(value || '');
              return `<td>${displayValue}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
};

// PDF Export (simplified - opens print dialog)
export const exportToPDF = <T>(data: T[], columns: Column<T>[], options: ExportOptions & { title?: string; subtitle?: string } = {}) => {
  printTable(data, columns, { ...options, format: 'pdf' });
};

// Main export function
export const exportData = <T>(
  format: string,
  data: T[],
  columns: Column<T>[],
  options: ExportOptions & { title?: string; subtitle?: string } = {}
) => {
  switch (format) {
    case 'csv':
      exportToCSV(data, columns, options);
      break;
    case 'excel':
      exportToExcel(data, columns, options);
      break;
    case 'json':
      exportToJSON(data, columns, options);
      break;
    case 'pdf':
      exportToPDF(data, columns, options);
      break;
    case 'print':
      printTable(data, columns, options);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
};

// Bulk operations utilities
export const createBulkOperations = <T>() => ({
  export: (selectedData: T[], columns: Column<T>[], format: string) => {
    exportData(format, selectedData, columns, {
      filename: `bulk_export_${selectedData.length}_items_${new Date().toISOString().split('T')[0]}`,
      selectedOnly: true
    });
  },
  
  copy: (selectedData: T[], columns: Column<T>[]) => {
    const exportColumns = columns.filter(col => col.exportable !== false);
    const headers = exportColumns.map(col => col.header).join('\t');
    const rows = selectedData.map(row => 
      exportColumns.map(col => String(row[col.key] || '')).join('\t')
    );
    const content = [headers, ...rows].join('\n');
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
});

// Advanced filtering utilities
export const createAdvancedFilters = <T>() => ({
  applyDateRange: (data: T[], field: keyof T, from: string, to: string) => {
    return data.filter(row => {
      const date = new Date(String(row[field]));
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return date >= fromDate && date <= toDate;
    });
  },
  
  applyNumericRange: (data: T[], field: keyof T, min: number, max: number) => {
    return data.filter(row => {
      const value = Number(row[field]) || 0;
      return value >= min && value <= max;
    });
  },
  
  applyMultiSelect: (data: T[], field: keyof T, values: string[]) => {
    if (values.length === 0) return data;
    return data.filter(row => values.includes(String(row[field])));
  },
  
  applyTextSearch: (data: T[], searchTerm: string, searchableFields: (keyof T)[]) => {
    if (!searchTerm) return data;
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return data.filter(row => 
      searchableFields.some(field => 
        String(row[field] || '').toLowerCase().includes(lowerSearchTerm)
      )
    );
  }
});

// Stats calculation utilities
export const calculateStats = <T>(data: T[], field: keyof T, type: 'sum' | 'avg' | 'count' | 'min' | 'max') => {
  const values = data
    .map(row => Number(row[field]))
    .filter(val => !isNaN(val));
  
  switch (type) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'avg':
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    case 'count':
      return values.length;
    case 'min':
      return values.length > 0 ? Math.min(...values) : 0;
    case 'max':
      return values.length > 0 ? Math.max(...values) : 0;
    default:
      return 0;
  }
};

// Receipt printing (for POS)
export async function printReceipt(
  orderData: any,
  items: any[],
  options: PrintOptions = {}
) {
  const companyName = await getSetting('company_name') || 'Your Store';
  const companyAddress = await getSetting('company_address') || '';
  const companyPhone = await getSetting('company_phone') || '';
  const receiptHeader = await getSetting('receipt_header') || '';
  const receiptFooter = await getSetting('receipt_footer') || 'Thank you for your business!';
  const receiptWidth = await getSetting('receipt_width') || '80';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${orderData.orderNumber}</title>
      <style>
        @media print {
          @page {
            size: ${receiptWidth}mm auto;
            margin: 0;
          }
          body { margin: 0; }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.2;
          width: ${receiptWidth}mm;
          margin: 0 auto;
          padding: 5mm;
        }
        
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 5mm;
          margin-bottom: 5mm;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 2mm;
        }
        
        .company-info {
          font-size: 10px;
          margin-bottom: 1mm;
        }
        
        .receipt-header {
          font-size: 11px;
          margin-top: 3mm;
        }
        
        .order-info {
          margin: 5mm 0;
          font-size: 11px;
        }
        
        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 3mm 0;
        }
        
        .item {
          margin: 2mm 0;
        }
        
        .item-name {
          font-weight: bold;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        
        .totals {
          margin: 5mm 0;
          font-size: 11px;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          margin: 1mm 0;
        }
        
        .total-final {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 2mm;
          margin-top: 3mm;
        }
        
        .footer {
          text-align: center;
          border-top: 1px dashed #000;
          padding-top: 5mm;
          margin-top: 5mm;
          font-size: 10px;
        }
        
        .no-print {
          display: none;
        }
        
        @media screen {
          .no-print {
            display: block;
            text-align: center;
            margin: 10px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button onclick="window.print()" style="padding: 8px 16px; margin: 5px;">Print Receipt</button>
        <button onclick="window.close()" style="padding: 8px 16px; margin: 5px;">Close</button>
      </div>
      
      <div class="header">
        <div class="company-name">${companyName}</div>
        ${companyAddress ? `<div class="company-info">${companyAddress}</div>` : ''}
        ${companyPhone ? `<div class="company-info">Tel: ${companyPhone}</div>` : ''}
        ${receiptHeader ? `<div class="receipt-header">${receiptHeader}</div>` : ''}
      </div>
      
      <div class="order-info">
        <div>Receipt #: ${orderData.orderNumber}</div>
        <div>Date: ${new Date(orderData.orderDate || orderData.createdAt).toLocaleString()}</div>
        ${orderData.customerName ? `<div>Customer: ${orderData.customerName}</div>` : ''}
        ${orderData.staffId ? `<div>Cashier: Staff ${orderData.staffId}</div>` : ''}
      </div>
      
      <div class="items">
        ${items.map(item => `
          <div class="item">
            <div class="item-name">${item.productName}</div>
            <div class="item-details">
                              <span>${item.quantity} x دج${item.unitPrice.toFixed(2)}</span>
              <span>دج${item.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>دج${orderData.subtotal.toFixed(2)}</span>
        </div>
        ${orderData.discountAmount > 0 ? `
          <div class="total-line">
            <span>Discount:</span>
            <span>-دج${orderData.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${orderData.taxAmount > 0 ? `
          <div class="total-line">
            <span>Tax:</span>
            <span>دج${orderData.taxAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-line total-final">
          <span>TOTAL:</span>
          <span>دج${orderData.totalAmount.toFixed(2)}</span>
        </div>
        ${orderData.paidAmount ? `
          <div class="total-line">
            <span>Paid:</span>
            <span>دج${orderData.paidAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${orderData.changeAmount > 0 ? `
          <div class="total-line">
            <span>Change:</span>
            <span>دج${orderData.changeAmount.toFixed(2)}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="footer">
        ${receiptFooter}
        <div style="margin-top: 3mm; font-size: 9px;">
          ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-print for receipts
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}

// Export factory function for common use cases
export function createExporter<T>(
  columns: ExportColumn<T>[],
  defaultOptions: ExportOptions = {}
) {
  return {
    toCSV: (data: T[], options?: ExportOptions) => 
      exportToCSV(data, columns, { ...defaultOptions, ...options }),
    
    toExcel: (data: T[], options?: ExportOptions) => 
      exportToExcel(data, columns, { ...defaultOptions, ...options }),
    
    toJSON: (data: T[], options?: ExportOptions) => 
      exportToJSON(data, columns, { ...defaultOptions, ...options }),
    
    print: (data: T[], options?: PrintOptions) => 
      printReceipt(data, [], options)
  };
}

// Enhanced currency formatting with dynamic currency support
export const formatCurrency = (amount: number, currency = 'DZD', locale?: string) => {
  try {
    return new Intl.NumberFormat(locale || navigator.language || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  } catch (error) {
    // Fallback to DZD if currency is not supported
    return `دج${(amount || 0).toFixed(2)}`;
  }
};

// Enhanced number formatting
export const formatNumber = (value: number, locale?: string) => {
  return new Intl.NumberFormat(locale || navigator.language || 'en-US').format(value || 0);
};

// Enhanced date formatting
export const formatDate = (date: string | Date, locale?: string, options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  try {
    return new Intl.DateTimeFormat(locale || navigator.language || 'en-US', {
      ...defaultOptions,
      ...options
    }).format(new Date(date));
  } catch (error) {
    return new Date(date).toLocaleDateString();
  }
};