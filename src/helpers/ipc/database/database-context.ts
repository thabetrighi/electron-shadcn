import { contextBridge, ipcRenderer } from 'electron';
import { USER_CHANNELS, PRODUCT_CHANNELS, ORDER_CHANNELS, DATABASE_CHANNELS } from './database-channels';

// Database API
export const databaseAPI = {
  // Database operations
  initialize: () => ipcRenderer.invoke(DATABASE_CHANNELS.INITIALIZE),

  // User operations
  users: {
    getAll: (search?: string) => ipcRenderer.invoke(USER_CHANNELS.GET_ALL_USERS, search),
    getById: (id: number) => ipcRenderer.invoke(USER_CHANNELS.GET_USER_BY_ID, id),
    create: (userData: any) => ipcRenderer.invoke(USER_CHANNELS.CREATE_USER, userData),
    update: (id: number, userData: any) => ipcRenderer.invoke(USER_CHANNELS.UPDATE_USER, id, userData),
    delete: (id: number) => ipcRenderer.invoke(USER_CHANNELS.DELETE_USER, id),
  },

  // Product operations
  products: {
    getAll: (search?: string) => ipcRenderer.invoke(PRODUCT_CHANNELS.GET_ALL_PRODUCTS, search),
    getById: (id: number) => ipcRenderer.invoke(PRODUCT_CHANNELS.GET_PRODUCT_BY_ID, id),
    create: (productData: any) => ipcRenderer.invoke(PRODUCT_CHANNELS.CREATE_PRODUCT, productData),
    update: (id: number, productData: any) => ipcRenderer.invoke(PRODUCT_CHANNELS.UPDATE_PRODUCT, id, productData),
    delete: (id: number) => ipcRenderer.invoke(PRODUCT_CHANNELS.DELETE_PRODUCT, id),
    getByCategory: (category: string) => ipcRenderer.invoke(PRODUCT_CHANNELS.GET_PRODUCTS_BY_CATEGORY, category),
  },

  // Order operations
  orders: {
    getAll: () => ipcRenderer.invoke(ORDER_CHANNELS.GET_ALL_ORDERS),
    getById: (id: number) => ipcRenderer.invoke(ORDER_CHANNELS.GET_ORDER_BY_ID, id),
    create: (orderData: any) => ipcRenderer.invoke(ORDER_CHANNELS.CREATE_ORDER, orderData),
    update: (id: number, orderData: any) => ipcRenderer.invoke(ORDER_CHANNELS.UPDATE_ORDER, id, orderData),
    delete: (id: number) => ipcRenderer.invoke(ORDER_CHANNELS.DELETE_ORDER, id),
    getByUser: (userId: number) => ipcRenderer.invoke(ORDER_CHANNELS.GET_ORDERS_BY_USER, userId),
  },
};

// Expose API to renderer
export function exposeDatabaseContext() {
  contextBridge.exposeInMainWorld('database', databaseAPI);
} 