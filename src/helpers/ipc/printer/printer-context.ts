import { contextBridge, ipcRenderer } from 'electron';
import { PRINTER_CHANNELS } from '../database/database-channels';

export function exposePrinterContext() {
  contextBridge.exposeInMainWorld('printer', {
    // Get available printers
    getAvailablePrinters: async () => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.GET_AVAILABLE_PRINTERS);
    },

    // Get default printer
    getDefaultPrinter: async () => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.GET_DEFAULT_PRINTER);
    },

    // Set default printer
    setDefaultPrinter: async (printerName: string) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.SET_DEFAULT_PRINTER, printerName);
    },

    // Print receipt
    printReceipt: async (receiptData: any) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.PRINT_RECEIPT, receiptData);
    },

    // Print invoice
    printInvoice: async (invoiceData: any) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.PRINT_INVOICE, invoiceData);
    },

    // Print product label
    printProductLabel: async (productData: any) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.PRINT_PRODUCT_LABEL, productData);
    },

    // Print report
    printReport: async (reportData: any) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.PRINT_REPORT, reportData);
    },

    // Test printer
    testPrinter: async (printerName?: string) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.TEST_PRINTER, printerName);
    },

    // Get printer status
    getPrinterStatus: async (printerName?: string) => {
      return await ipcRenderer.invoke(PRINTER_CHANNELS.GET_PRINTER_STATUS, printerName);
    }
  });
} 