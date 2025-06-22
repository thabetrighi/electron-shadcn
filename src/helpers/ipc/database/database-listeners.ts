import { ipcMain } from 'electron';
import { initializeDatabase } from '../../../database/connection';
import { UsersService } from '../../../database/services/users.service';
import { CategoriesService } from '../../../database/services/categories.service';
import { UnitsService } from '../../../database/services/units.service';
import { ProductsService } from '../../../database/services/products.service';
import { OrdersService } from '../../../database/services/orders.service';
import { USER_CHANNELS, PRODUCT_CHANNELS, ORDER_CHANNELS, DATABASE_CHANNELS } from './database-channels';

export function addDatabaseEventListeners() {
  // Database initialization
  ipcMain.handle(DATABASE_CHANNELS.INITIALIZE, async () => {
    try {
      await initializeDatabase();
      return { success: true };
    } catch (error: any) {
      console.error('Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  });

  // User operations
  ipcMain.handle(USER_CHANNELS.GET_ALL_USERS, async (_, options?: any) => {
    try {
      const result = await UsersService.getAll(options);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(USER_CHANNELS.GET_USER_BY_ID, async (_, id: number) => {
    try {
      const result = await UsersService.getById(id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(USER_CHANNELS.CREATE_USER, async (_, userData: any) => {
    try {
      const result = await UsersService.create(userData);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(USER_CHANNELS.UPDATE_USER, async (_, id: number, userData: any) => {
    try {
      const result = await UsersService.update(id, userData);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(USER_CHANNELS.DELETE_USER, async (_, id: number) => {
    try {
      const result = await UsersService.delete(id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Product operations
  ipcMain.handle(PRODUCT_CHANNELS.GET_ALL_PRODUCTS, async (_, options?: any) => {
    try {
      const result = await ProductsService.getAll(options);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(PRODUCT_CHANNELS.GET_PRODUCT_BY_ID, async (_, id: number) => {
    try {
      const result = await ProductsService.getById(id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(PRODUCT_CHANNELS.CREATE_PRODUCT, async (_, productData: any) => {
    try {
      const result = await ProductsService.create(productData);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(PRODUCT_CHANNELS.UPDATE_PRODUCT, async (_, id: number, productData: any) => {
    try {
      const result = await ProductsService.update(id, productData);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(PRODUCT_CHANNELS.DELETE_PRODUCT, async (_, id: number) => {
    try {
      const result = await ProductsService.delete(id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Order operations
  ipcMain.handle(ORDER_CHANNELS.GET_ALL_ORDERS, async (_, options?: any) => {
    try {
      const result = await OrdersService.getAll(options);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(ORDER_CHANNELS.GET_ORDER_BY_ID, async (_, id: number) => {
    try {
      const result = await OrdersService.getById(id);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(ORDER_CHANNELS.CREATE_ORDER, async (_, orderData: any) => {
    try {
      const result = await OrdersService.create(orderData);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  console.log('Database event listeners added successfully');
} 