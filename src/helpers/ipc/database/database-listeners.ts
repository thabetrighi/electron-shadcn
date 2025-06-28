import { ipcMain } from 'electron';
import { initializeDatabase } from '../../../database/connection';
import { UsersService } from '../../../database/services/users.service';
import { CategoriesService } from '../../../database/services/categories.service';
import { UnitsService } from '../../../database/services/units.service';
import { ProductsService } from '../../../database/services/products.service';
import { OrdersService } from '../../../database/services/orders.service';
import { SettingsService } from '../../../database/services/settings.service';
import { USER_CHANNELS, CATEGORY_CHANNELS, UNIT_CHANNELS, PRODUCT_CHANNELS, ORDER_CHANNELS, SETTINGS_CHANNELS, DATABASE_CHANNELS } from './database-channels';

export function registerDatabaseListeners() {
  console.log('Registering database IPC listeners...');

  // Database operations
  ipcMain.handle(DATABASE_CHANNELS.INITIALIZE, async () => {
    try {
      await initializeDatabase();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // User operations
  ipcMain.handle(USER_CHANNELS.GET_ALL_USERS, async (_, search) => {
    return await UsersService.getAll(search);
  });

  ipcMain.handle(USER_CHANNELS.GET_USER_BY_ID, async (_, id) => {
    return await UsersService.getById(id);
  });

  ipcMain.handle(USER_CHANNELS.CREATE_USER, async (_, userData) => {
    return await UsersService.create(userData);
  });

  ipcMain.handle(USER_CHANNELS.UPDATE_USER, async (_, id, userData) => {
    return await UsersService.update(id, userData);
  });

  ipcMain.handle(USER_CHANNELS.DELETE_USER, async (_, id) => {
    return await UsersService.delete(id);
  });

  // Category operations
  ipcMain.handle(CATEGORY_CHANNELS.GET_ALL_CATEGORIES, async (_, options) => {
    return await CategoriesService.getAll(options);
  });

  ipcMain.handle(CATEGORY_CHANNELS.GET_CATEGORY_BY_ID, async (_, id) => {
    return await CategoriesService.getById(id);
  });

  ipcMain.handle(CATEGORY_CHANNELS.CREATE_CATEGORY, async (_, categoryData) => {
    return await CategoriesService.create(categoryData);
  });

  ipcMain.handle(CATEGORY_CHANNELS.UPDATE_CATEGORY, async (_, id, categoryData) => {
    return await CategoriesService.update(id, categoryData);
  });

  ipcMain.handle(CATEGORY_CHANNELS.DELETE_CATEGORY, async (_, id) => {
    return await CategoriesService.delete(id);
  });

  ipcMain.handle(CATEGORY_CHANNELS.GET_ROOT_CATEGORIES, async () => {
    return await CategoriesService.getRootCategories();
  });

  ipcMain.handle(CATEGORY_CHANNELS.GET_CHILDREN_CATEGORIES, async (_, parentId) => {
    return await CategoriesService.getChildren(parentId);
  });

  ipcMain.handle(CATEGORY_CHANNELS.UPDATE_SORT_ORDER, async (_, id, sortOrder) => {
    return await CategoriesService.updateSortOrder(id, sortOrder);
  });

  // Unit operations
  ipcMain.handle(UNIT_CHANNELS.GET_ALL_UNITS, async (_, options) => {
    return await UnitsService.getAll(options);
  });

  ipcMain.handle(UNIT_CHANNELS.GET_UNIT_BY_ID, async (_, id) => {
    return await UnitsService.getById(id);
  });

  ipcMain.handle(UNIT_CHANNELS.CREATE_UNIT, async (_, unitData) => {
    return await UnitsService.create(unitData);
  });

  ipcMain.handle(UNIT_CHANNELS.UPDATE_UNIT, async (_, id, unitData) => {
    return await UnitsService.update(id, unitData);
  });

  ipcMain.handle(UNIT_CHANNELS.DELETE_UNIT, async (_, id) => {
    return await UnitsService.delete(id);
  });

  // Product operations
  ipcMain.handle(PRODUCT_CHANNELS.GET_ALL_PRODUCTS, async (_, search) => {
    return await ProductsService.getAll(search);
  });

  ipcMain.handle(PRODUCT_CHANNELS.GET_PRODUCT_BY_ID, async (_, id) => {
    return await ProductsService.getById(id);
  });

  ipcMain.handle(PRODUCT_CHANNELS.CREATE_PRODUCT, async (_, productData) => {
    return await ProductsService.create(productData);
  });

  ipcMain.handle(PRODUCT_CHANNELS.UPDATE_PRODUCT, async (_, id, productData) => {
    return await ProductsService.update(id, productData);
  });

  ipcMain.handle(PRODUCT_CHANNELS.DELETE_PRODUCT, async (_, id) => {
    return await ProductsService.delete(id);
  });

  ipcMain.handle(PRODUCT_CHANNELS.GET_PRODUCTS_BY_CATEGORY, async (_, category) => {
    return await ProductsService.getByCategory(category);
  });

  // Order operations
  ipcMain.handle(ORDER_CHANNELS.GET_ALL_ORDERS, async () => {
    return await OrdersService.getAll();
  });

  ipcMain.handle(ORDER_CHANNELS.GET_ORDER_BY_ID, async (_, id) => {
    return await OrdersService.getById(id);
  });

  ipcMain.handle(ORDER_CHANNELS.CREATE_ORDER, async (_, orderData) => {
    return await OrdersService.create(orderData);
  });

  ipcMain.handle(ORDER_CHANNELS.UPDATE_ORDER, async (_, id, orderData) => {
    return await OrdersService.update(id, orderData);
  });

  ipcMain.handle(ORDER_CHANNELS.DELETE_ORDER, async (_, id) => {
    return await OrdersService.delete(id);
  });

  ipcMain.handle(ORDER_CHANNELS.GET_ORDERS_BY_USER, async (_, userId) => {
    return await OrdersService.getByUser(userId);
  });

  // Settings operations
  ipcMain.handle(SETTINGS_CHANNELS.GET_ALL_SETTINGS, async (_, filter) => {
    return await SettingsService.getAll(filter);
  });

  ipcMain.handle(SETTINGS_CHANNELS.GET_SETTING, async (_, key) => {
    return await SettingsService.get(key);
  });

  ipcMain.handle(SETTINGS_CHANNELS.SET_SETTING, async (_, key, value) => {
    return await SettingsService.set(key, value);
  });

  ipcMain.handle(SETTINGS_CHANNELS.DELETE_SETTING, async (_, key) => {
    return await SettingsService.delete(key);
  });

  ipcMain.handle(SETTINGS_CHANNELS.GET_BY_CATEGORY, async (_, category) => {
    return await SettingsService.getByCategory(category);
  });

  ipcMain.handle(SETTINGS_CHANNELS.INITIALIZE_DEFAULTS, async () => {
    return await SettingsService.initializeDefaults();
  });

  console.log('Database IPC listeners registered successfully');
} 