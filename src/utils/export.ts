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
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions = {}
) {
  const {
    filename = 'export.csv',
    includeHeaders = true,
    delimiter = ','
  } = options;

  let csvContent = '';

  // Add headers
  if (includeHeaders) {
    const headers = columns.map(col => `"${col.header}"`).join(delimiter);
    csvContent += headers + '\n';
  }

  // Add data rows
  data.forEach(row => {
    const values = columns.map(col => {
      const value = col.render 
        ? col.render(row[col.key], row)
        : String(row[col.key] || '');
      
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    });
    csvContent += values.join(delimiter) + '\n';
  });

  // Download file
  downloadFile(csvContent, filename, 'text/csv');
}

// Excel Export (CSV with Excel-friendly format)
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions = {}
) {
  const {
    filename = 'export.xlsx',
    includeHeaders = true
  } = options;

  // Add BOM for UTF-8 encoding in Excel
  let csvContent = '\uFEFF';

  if (includeHeaders) {
    const headers = columns.map(col => col.header).join('\t');
    csvContent += headers + '\n';
  }

  data.forEach(row => {
    const values = columns.map(col => {
      const value = col.render 
        ? col.render(row[col.key], row)
        : String(row[col.key] || '');
      
      // Excel-friendly formatting
      return value.replace(/\t/g, ' ').replace(/\n/g, ' ');
    });
    csvContent += values.join('\t') + '\n';
  });

  downloadFile(csvContent, filename, 'application/vnd.ms-excel');
}

// JSON Export
export function exportToJSON<T>(
  data: T[],
  options: ExportOptions = {}
) {
  const { filename = 'export.json' } = options;
  
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

// Print functionality
export async function printData<T>(
  data: T[],
  columns: ExportColumn<T>[],
  options: PrintOptions = {}
) {
  const {
    title = 'Report',
    subtitle = '',
    includeDate = true,
    includeCompanyInfo = true,
    paperSize = 'A4',
    orientation = 'portrait'
  } = options;

  // Get company info from settings
  let companyInfo = '';
  if (includeCompanyInfo) {
    const companyName = await getSetting('company_name') || 'Your Company';
    const companyAddress = await getSetting('company_address') || '';
    const companyPhone = await getSetting('company_phone') || '';
    const companyEmail = await getSetting('company_email') || '';
    
    companyInfo = `
      <div class="company-info">
        <h2>${companyName}</h2>
        ${companyAddress ? `<p>${companyAddress}</p>` : ''}
        ${companyPhone ? `<p>Phone: ${companyPhone}</p>` : ''}
        ${companyEmail ? `<p>Email: ${companyEmail}</p>` : ''}
      </div>
    `;
  }

  const currentDate = includeDate ? new Date().toLocaleDateString() : '';

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @media print {
          @page {
            size: ${paperSize} ${orientation};
            margin: 1cm;
          }
          body { margin: 0; }
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .company-info {
          margin-bottom: 15px;
        }
        
        .company-info h2 {
          margin: 0 0 5px 0;
          font-size: 18px;
        }
        
        .company-info p {
          margin: 2px 0;
          color: #666;
        }
        
        .report-title {
          font-size: 16px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .report-date {
          color: #666;
          font-size: 11px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        
        .no-print {
          display: none;
        }
        
        @media screen {
          .no-print {
            display: block;
            margin: 20px 0;
            text-align: center;
          }
          
          body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${companyInfo}
        <div class="report-title">${title}</div>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        ${currentDate ? `<div class="report-date">Generated on: ${currentDate}</div>` : ''}
      </div>
      
      <div class="no-print">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Print Report
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
          Close
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => {
                const value = col.render 
                  ? col.render(row[col.key], row)
                  : String(row[col.key] || '');
                return `<td>${value}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Total Records: ${data.length}</p>
        <p>Printed on: ${new Date().toLocaleString()}</p>
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
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

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
              <span>${item.quantity} x $${item.unitPrice.toFixed(2)}</span>
              <span>$${item.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>$${orderData.subtotal.toFixed(2)}</span>
        </div>
        ${orderData.discountAmount > 0 ? `
          <div class="total-line">
            <span>Discount:</span>
            <span>-$${orderData.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${orderData.taxAmount > 0 ? `
          <div class="total-line">
            <span>Tax:</span>
            <span>$${orderData.taxAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-line total-final">
          <span>TOTAL:</span>
          <span>$${orderData.totalAmount.toFixed(2)}</span>
        </div>
        ${orderData.paidAmount ? `
          <div class="total-line">
            <span>Paid:</span>
            <span>$${orderData.paidAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${orderData.changeAmount > 0 ? `
          <div class="total-line">
            <span>Change:</span>
            <span>$${orderData.changeAmount.toFixed(2)}</span>
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

// Utility function to download files
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
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
      exportToJSON(data, { ...defaultOptions, ...options }),
    
    print: (data: T[], options?: PrintOptions) => 
      printData(data, columns, options)
  };
}