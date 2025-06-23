import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users table with roles (admin, client, supplier)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  phone: text("phone"),
  address: text("address"),
  role: text("role", { enum: ["admin", "client", "supplier"] }).notNull().default("client"),
  avatar: text("avatar"),
  status: text("status", { enum: ["active", "inactive", "suspended"] }).notNull().default("active"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Categories table with multi-language support
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  description: text("description"),
  image: text("image"),
  parentId: integer("parent_id").references(() => categories.id),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Units table (kg, piece, liter, etc.)
export const units = sqliteTable("units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  symbol: text("symbol").notNull(),
  type: text("type", { enum: ["weight", "volume", "piece", "length"] }).notNull().default("piece"),
  conversionRate: real("conversion_rate").default(1.0),
  baseUnit: integer("base_unit").references(() => units.id),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Products table with full POS features
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  nameFr: text("name_fr"),
  nameAr: text("name_ar"),
  description: text("description"),
  sku: text("sku").unique(),
  barcode: text("barcode").unique(),
  categoryId: integer("category_id").references(() => categories.id),
  unitId: integer("unit_id").references(() => units.id),
  supplierId: integer("supplier_id").references(() => users.id),
  
  // Pricing
  purchasePrice: real("purchase_price").default(0),
  sellingPrice: real("selling_price").notNull(),
  minPrice: real("min_price").default(0),
  
  // Inventory
  currentStock: integer("current_stock").default(0),
  minStock: integer("min_stock").default(0),
  
  // Product details
  weight: real("weight").default(0),
  color: text("color"),
  size: text("size"),
  image: text("image"),
  
  // Taxes and discounts
  taxRate: real("tax_rate").default(0),
  discountRate: real("discount_rate").default(0),
  
  // Flags
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  trackStock: integer("track_stock", { mode: "boolean" }).default(true),
  
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Orders table for POS transactions
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => users.id),
  staffId: integer("staff_id").references(() => users.id),
  
  // Order totals
  subtotal: real("subtotal").notNull().default(0),
  taxAmount: real("tax_amount").default(0),
  discountAmount: real("discount_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  
  // Payment details
  paymentMethod: text("payment_method", { 
    enum: ["cash", "card", "mobile", "check", "credit"] 
  }).notNull().default("cash"),
  paymentStatus: text("payment_status", { 
    enum: ["pending", "paid", "partial", "refunded"] 
  }).notNull().default("pending"),
  paidAmount: real("paid_amount").default(0),
  changeAmount: real("change_amount").default(0),
  
  // Order details
  status: text("status", { 
    enum: ["draft", "pending", "confirmed", "processing", "completed", "cancelled", "refunded"] 
  }).notNull().default("pending"),
  orderType: text("order_type", { enum: ["sale", "return", "void"] }).notNull().default("sale"),
  
  // Customer details
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  
  // Timestamps
  orderDate: text("order_date").default(sql`(date('now'))`),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  
  // Additional fields
  notes: text("notes"),
  receiptPrinted: integer("receipt_printed", { mode: "boolean" }).default(false),
});

// Order items table
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  
  // Product details at time of sale
  productName: text("product_name").notNull(),
  productSku: text("product_sku"),
  
  // Quantity and pricing
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  discountRate: real("discount_rate").default(0),
  discountAmount: real("discount_amount").default(0),
  taxRate: real("tax_rate").default(0),
  taxAmount: real("tax_amount").default(0),
  totalPrice: real("total_price").notNull(),
  
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Settings table for application configuration
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  type: text("type", { enum: ["string", "number", "boolean", "json", "file"] }).notNull().default("string"),
  category: text("category").notNull(), // e.g., "general", "printing", "pos", "appearance"
  label: text("label").notNull(),
  description: text("description"),
  defaultValue: text("default_value"),
  isRequired: integer("is_required", { mode: "boolean" }).default(false),
  isPublic: integer("is_public", { mode: "boolean" }).default(false), // Can be accessed by frontend
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
