// User channels
export const USER_CHANNELS = {
  GET_ALL_USERS: 'user:get-all',
  GET_USER_BY_ID: 'user:get-by-id',
  CREATE_USER: 'user:create',
  UPDATE_USER: 'user:update',
  DELETE_USER: 'user:delete',
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

// Database channels
export const DATABASE_CHANNELS = {
  INITIALIZE: 'database:initialize',
} as const; 