import { contextBridge, ipcRenderer } from 'electron';
import { USER_CHANNELS, CATEGORY_CHANNELS, UNIT_CHANNELS, PRODUCT_CHANNELS, ORDER_CHANNELS, ORDER_ITEM_CHANNELS, SETTINGS_CHANNELS, DATABASE_CHANNELS } from './database-channels';

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

  // Category operations
  categories: {
    getAll: (options?: any) => ipcRenderer.invoke(CATEGORY_CHANNELS.GET_ALL_CATEGORIES, options),
    getById: (id: number) => ipcRenderer.invoke(CATEGORY_CHANNELS.GET_CATEGORY_BY_ID, id),
    create: (categoryData: any) => ipcRenderer.invoke(CATEGORY_CHANNELS.CREATE_CATEGORY, categoryData),
    update: (id: number, categoryData: any) => ipcRenderer.invoke(CATEGORY_CHANNELS.UPDATE_CATEGORY, id, categoryData),
    delete: (id: number) => ipcRenderer.invoke(CATEGORY_CHANNELS.DELETE_CATEGORY, id),
    getRootCategories: () => ipcRenderer.invoke(CATEGORY_CHANNELS.GET_ROOT_CATEGORIES),
    getChildren: (parentId: number) => ipcRenderer.invoke(CATEGORY_CHANNELS.GET_CHILDREN_CATEGORIES, parentId),
    updateSortOrder: (id: number, sortOrder: number) => ipcRenderer.invoke(CATEGORY_CHANNELS.UPDATE_SORT_ORDER, id, sortOrder),
  },

  // Unit operations
  units: {
    getAll: (options?: any) => ipcRenderer.invoke(UNIT_CHANNELS.GET_ALL_UNITS, options),
    getById: (id: number) => ipcRenderer.invoke(UNIT_CHANNELS.GET_UNIT_BY_ID, id),
    create: (unitData: any) => ipcRenderer.invoke(UNIT_CHANNELS.CREATE_UNIT, unitData),
    update: (id: number, unitData: any) => ipcRenderer.invoke(UNIT_CHANNELS.UPDATE_UNIT, id, unitData),
    delete: (id: number) => ipcRenderer.invoke(UNIT_CHANNELS.DELETE_UNIT, id),
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

  // Order Item operations
  orderItems: {
    getAll: () => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.GET_ALL_ORDER_ITEMS),
    getById: (id: number) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.GET_ORDER_ITEM_BY_ID, id),
    getByOrderId: (orderId: number) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.GET_ORDER_ITEMS_BY_ORDER, orderId),
    create: (itemData: any) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.CREATE_ORDER_ITEM, itemData),
    createMultiple: (items: any[]) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.CREATE_MULTIPLE_ORDER_ITEMS, items),
    update: (id: number, itemData: any) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.UPDATE_ORDER_ITEM, id, itemData),
    delete: (id: number) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.DELETE_ORDER_ITEM, id),
    deleteByOrderId: (orderId: number) => ipcRenderer.invoke(ORDER_ITEM_CHANNELS.DELETE_ORDER_ITEMS_BY_ORDER, orderId),
  },

  // Settings operations
  settings: {
    getAll: (filter?: any) => ipcRenderer.invoke(SETTINGS_CHANNELS.GET_ALL_SETTINGS, filter),
    get: (key: string) => ipcRenderer.invoke(SETTINGS_CHANNELS.GET_SETTING, key),
    set: (key: string, value: any) => ipcRenderer.invoke(SETTINGS_CHANNELS.SET_SETTING, key, value),
    delete: (key: string) => ipcRenderer.invoke(SETTINGS_CHANNELS.DELETE_SETTING, key),
    getByCategory: (category: string) => ipcRenderer.invoke(SETTINGS_CHANNELS.GET_BY_CATEGORY, category),
    initializeDefaults: () => ipcRenderer.invoke(SETTINGS_CHANNELS.INITIALIZE_DEFAULTS),
  },
};

// Expose API to renderer
export function exposeDatabaseContext() {
  contextBridge.exposeInMainWorld('database', databaseAPI);
} 