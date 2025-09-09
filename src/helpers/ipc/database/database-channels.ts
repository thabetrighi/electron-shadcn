// User channels
export const USER_CHANNELS = {
  GET_ALL_USERS: 'user:get-all',
  GET_USER_BY_ID: 'user:get-by-id',
  CREATE_USER: 'user:create',
  UPDATE_USER: 'user:update',
  DELETE_USER: 'user:delete',
} as const;

// Category channels
export const CATEGORY_CHANNELS = {
  GET_ALL_CATEGORIES: 'category:get-all',
  GET_CATEGORY_BY_ID: 'category:get-by-id',
  CREATE_CATEGORY: 'category:create',
  UPDATE_CATEGORY: 'category:update',
  DELETE_CATEGORY: 'category:delete',
  GET_ROOT_CATEGORIES: 'category:get-root',
  GET_CHILDREN_CATEGORIES: 'category:get-children',
  UPDATE_SORT_ORDER: 'category:update-sort-order',
} as const;

// Unit channels
export const UNIT_CHANNELS = {
  GET_ALL_UNITS: 'unit:get-all',
  GET_UNIT_BY_ID: 'unit:get-by-id',
  CREATE_UNIT: 'unit:create',
  UPDATE_UNIT: 'unit:update',
  DELETE_UNIT: 'unit:delete',
} as const;

// Product channels
export const PRODUCT_CHANNELS = {
  GET_ALL_PRODUCTS: 'product:get-all',
  GET_PRODUCT_BY_ID: 'product:get-by-id',
  CREATE_PRODUCT: 'product:create',
  UPDATE_PRODUCT: 'product:update',
  DELETE_PRODUCT: 'product:delete',
  GET_PRODUCTS_BY_CATEGORY: 'product:get-by-category',
} as const;

// Order channels
export const ORDER_CHANNELS = {
  GET_ALL_ORDERS: 'order:get-all',
  GET_ORDER_BY_ID: 'order:get-by-id',
  CREATE_ORDER: 'order:create',
  UPDATE_ORDER: 'order:update',
  DELETE_ORDER: 'order:delete',
  GET_ORDERS_BY_USER: 'order:get-by-user',
} as const;

// Order Item channels
export const ORDER_ITEM_CHANNELS = {
  GET_ALL_ORDER_ITEMS: 'order-item:get-all',
  GET_ORDER_ITEM_BY_ID: 'order-item:get-by-id',
  GET_ORDER_ITEMS_BY_ORDER: 'order-item:get-by-order',
  CREATE_ORDER_ITEM: 'order-item:create',
  CREATE_MULTIPLE_ORDER_ITEMS: 'order-item:create-multiple',
  UPDATE_ORDER_ITEM: 'order-item:update',
  DELETE_ORDER_ITEM: 'order-item:delete',
  DELETE_ORDER_ITEMS_BY_ORDER: 'order-item:delete-by-order',
} as const;

// Settings channels
export const SETTINGS_CHANNELS = {
  GET_ALL_SETTINGS: 'settings:get-all',
  GET_SETTING: 'settings:get',
  SET_SETTING: 'settings:set',
  BULK_UPDATE: 'settings:bulk-update',
  DELETE_SETTING: 'settings:delete',
  GET_BY_CATEGORY: 'settings:get-by-category',
  INITIALIZE_DEFAULTS: 'settings:initialize-defaults',
  CHECK_DATABASE_HEALTH: 'settings:check-database-health',
  RESET_DATABASE: 'settings:reset-database',
} as const;

// Database channels
export const DATABASE_CHANNELS = {
  INITIALIZE: 'database:initialize',
} as const;

// Reports channels
export const REPORTS_CHANNELS = {
  GET_SUPPLIER_PAYMENT_REPORT: 'reports:get-supplier-payment',
  GET_DAILY_SALES_SUMMARY: 'reports:get-daily-sales-summary',
  GET_SALES_SUMMARY: 'reports:get-sales-summary',
  GET_TOP_SELLING_PRODUCTS: 'reports:get-top-selling-products',
  GET_SUPPLIERS: 'reports:get-suppliers',
  GET_PRODUCTS_COUNT: 'reports:get-products-count',
} as const;

// Printer channels
export const PRINTER_CHANNELS = {
  GET_AVAILABLE_PRINTERS: 'printer:get-available',
  GET_DEFAULT_PRINTER: 'printer:get-default',
  SET_DEFAULT_PRINTER: 'printer:set-default',
  PRINT_RECEIPT: 'printer:print-receipt',
  PRINT_INVOICE: 'printer:print-invoice',
  PRINT_PRODUCT_LABEL: 'printer:print-product-label',
  PRINT_REPORT: 'printer:print-report',
  TEST_PRINTER: 'printer:test',
  GET_PRINTER_STATUS: 'printer:get-status',
} as const; 