import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';

// Get database path - handle both Electron and Node.js contexts
function getDatabasePath() {
  try {
    // Try to import Electron's app module
    const { app } = require('electron');
    return path.join(app.getPath('userData'), 'pos.db');
  } catch (error) {
    // If we're not in Electron context, use current directory
    return path.join(process.cwd(), 'database.sqlite');
  }
}

// Get migrations path - handle both development and production
function getMigrationsPath() {
  const fs = require('fs');
  
  console.log('🔍 Detecting migrations path...');
  console.log('📂 Current __dirname:', __dirname);
  console.log('📂 Current process.cwd():', process.cwd());
  
  // Try different possible paths for migrations
  const possiblePaths = [
    // Development path
    path.join(__dirname, 'migrations'),
    path.join(process.cwd(), 'src', 'database', 'migrations'),
    // Build paths
    path.join(process.cwd(), '.vite', 'build', 'migrations'),
    path.join(__dirname, '..', '..', 'src', 'database', 'migrations'),
    // Electron production path
    path.join(__dirname, '..', 'migrations'),
  ];
  
  console.log('🔍 Checking possible migration paths:');
  
  // Find the first path that exists and has the journal file
  for (let i = 0; i < possiblePaths.length; i++) {
    const migrationPath = possiblePaths[i];
    console.log(`  ${i + 1}. ${migrationPath}`);
    
    if (fs.existsSync(migrationPath)) {
      console.log(`     ✅ Directory exists`);
      const journalPath = path.join(migrationPath, 'meta', '_journal.json');
      console.log(`     🔍 Checking journal: ${journalPath}`);
      
      if (fs.existsSync(journalPath)) {
        console.log(`     ✅ Journal found - using this path`);
        console.log(`📁 Selected migrations path: ${migrationPath}`);
        return migrationPath;
      } else {
        console.log(`     ❌ Journal not found`);
      }
    } else {
      console.log(`     ❌ Directory does not exist`);
    }
  }
  
  // If no migrations found, copy from source to build
  const sourcePath = path.join(process.cwd(), 'src', 'database', 'migrations');
  const buildPath = path.join(process.cwd(), '.vite', 'build', 'migrations');
  
  console.log('🔄 Attempting to copy migrations...');
  console.log(`📂 Source: ${sourcePath}`);
  console.log(`📂 Build: ${buildPath}`);
  
  if (fs.existsSync(sourcePath) && !fs.existsSync(buildPath)) {
    try {
      console.log('📁 Creating build migrations directory...');
      fs.mkdirSync(buildPath, { recursive: true });
      fs.mkdirSync(path.join(buildPath, 'meta'), { recursive: true });
      
      // Copy migration files
      const files = fs.readdirSync(sourcePath);
      files.forEach((file: string) => {
        if (file.endsWith('.sql')) {
          fs.copyFileSync(
            path.join(sourcePath, file),
            path.join(buildPath, file)
          );
          console.log(`📄 Copied: ${file}`);
        }
      });
      
      // Copy meta files
      const metaFiles = fs.readdirSync(path.join(sourcePath, 'meta'));
      metaFiles.forEach((file: string) => {
        fs.copyFileSync(
          path.join(sourcePath, 'meta', file),
          path.join(buildPath, 'meta', file)
        );
        console.log(`📄 Copied meta: ${file}`);
      });
      
      console.log('✅ Migrations copied successfully');
      return buildPath;
    } catch (error) {
      console.error('❌ Failed to copy migrations:', error);
    }
  }
  
  console.log(`📁 Fallback to source path: ${sourcePath}`);
  return sourcePath;
}

// Database path
const dbPath = getDatabasePath();

// Create database connection
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Initialize database with schema
export async function initializeDatabase() {
  try {
    console.log(`Initializing database at: ${dbPath}`);
    
    // Enable WAL mode for better performance
    sqlite.pragma('journal_mode = WAL');
    
    // Try to run migrations, but don't fail if migration files are missing
    try {
      const migrationsPath = getMigrationsPath();
      console.log(`Looking for migrations at: ${migrationsPath}`);
      
      // Check if migrations directory exists
      const fs = require('fs');
      if (fs.existsSync(migrationsPath)) {
        console.log('Running database migrations...');
        migrate(db, { migrationsFolder: migrationsPath });
        console.log('Migrations completed');
      } else {
        console.log('Migrations folder not found, creating tables manually...');
        // Create tables manually if migrations are not available
        await createTablesManually();
      }
    } catch (migrationError) {
      console.warn('Migration failed, creating tables manually:', migrationError);
      await createTablesManually();
    }
    
    // Check if database needs seeding (check if users table is empty)
    try {
      const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      
      if (userCount.count === 0) {
        console.log('Database is empty, seeding with initial data...');
        // Seed database with initial data
        try {
          const { seedDatabase } = await import('./seed');
          await seedDatabase();
          console.log('Database seeded successfully');
        } catch (seedError) {
          console.warn('Failed to seed database:', seedError);
        }
      } else {
        console.log('Database already has data, skipping seeding');
      }
    } catch (seedError) {
      console.warn('Seeding check failed, database might not be properly initialized:', seedError);
    }
    
    console.log('Database connection established and ready');
    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Manual table creation as fallback
async function createTablesManually() {
  console.log('Creating tables manually...');
  
  const createTableStatements = [
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "password" text,
      "phone" text,
      "address" text,
      "role" text DEFAULT 'client' NOT NULL,
      "avatar" text,
      "status" text DEFAULT 'active' NOT NULL,
      "created_at" text DEFAULT (datetime('now')),
      "updated_at" text DEFAULT (datetime('now'))
    )`,
    
    `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email")`,
    
    `CREATE TABLE IF NOT EXISTS "categories" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "name_en" text,
      "name_fr" text,
      "name_ar" text,
      "description" text,
      "image" text,
      "parent_id" integer,
      "status" text DEFAULT 'active' NOT NULL,
      "sort_order" integer DEFAULT 0,
      "created_at" text DEFAULT (datetime('now')),
      "updated_at" text DEFAULT (datetime('now')),
      FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
    )`,
    
    `CREATE TABLE IF NOT EXISTS "units" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "name_en" text,
      "name_fr" text,
      "name_ar" text,
      "symbol" text NOT NULL,
      "type" text DEFAULT 'piece' NOT NULL,
      "conversion_rate" real DEFAULT 1,
      "base_unit" integer,
      "status" text DEFAULT 'active' NOT NULL,
      "created_at" text DEFAULT (datetime('now')),
      "updated_at" text DEFAULT (datetime('now')),
      FOREIGN KEY ("base_unit") REFERENCES "units"("id")
    )`,
    
    `CREATE TABLE IF NOT EXISTS "products" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "name_en" text,
      "name_fr" text,
      "name_ar" text,
      "description" text,
      "sku" text,
      "barcode" text,
      "category_id" integer,
      "unit_id" integer,
      "supplier_id" integer,
      "purchase_price" real DEFAULT 0,
      "selling_price" real NOT NULL,
      "min_price" real DEFAULT 0,
      "current_stock" integer DEFAULT 0,
      "min_stock" integer DEFAULT 0,
      "weight" real DEFAULT 0,
      "color" text,
      "size" text,
      "image" text,
      "tax_rate" real DEFAULT 0,
      "discount_rate" real DEFAULT 0,
      "is_active" integer DEFAULT 1,
      "is_featured" integer DEFAULT 0,
      "track_stock" integer DEFAULT 1,
      "created_at" text DEFAULT (datetime('now')),
      "updated_at" text DEFAULT (datetime('now')),
      FOREIGN KEY ("category_id") REFERENCES "categories"("id"),
      FOREIGN KEY ("unit_id") REFERENCES "units"("id"),
      FOREIGN KEY ("supplier_id") REFERENCES "users"("id")
    )`,
    
    `CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_unique" ON "products" ("sku")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "products_barcode_unique" ON "products" ("barcode")`,
    
    `CREATE TABLE IF NOT EXISTS "orders" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "order_number" text NOT NULL,
      "customer_id" integer,
      "staff_id" integer,
      "subtotal" real DEFAULT 0 NOT NULL,
      "tax_amount" real DEFAULT 0,
      "discount_amount" real DEFAULT 0,
      "total_amount" real NOT NULL,
      "payment_method" text DEFAULT 'cash' NOT NULL,
      "payment_status" text DEFAULT 'pending' NOT NULL,
      "paid_amount" real DEFAULT 0,
      "change_amount" real DEFAULT 0,
      "status" text DEFAULT 'pending' NOT NULL,
      "order_type" text DEFAULT 'sale' NOT NULL,
      "customer_name" text,
      "customer_phone" text,
      "customer_email" text,
      "order_date" text DEFAULT (date('now')),
      "created_at" text DEFAULT (datetime('now')),
      "updated_at" text DEFAULT (datetime('now')),
      "notes" text,
      "receipt_printed" integer DEFAULT 0,
      FOREIGN KEY ("customer_id") REFERENCES "users"("id"),
      FOREIGN KEY ("staff_id") REFERENCES "users"("id")
    )`,
    
    `CREATE UNIQUE INDEX IF NOT EXISTS "orders_order_number_unique" ON "orders" ("order_number")`,
    
    `CREATE TABLE IF NOT EXISTS "order_items" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "order_id" integer,
      "product_id" integer,
      "product_name" text NOT NULL,
      "product_sku" text,
      "quantity" integer NOT NULL,
      "unit_price" real NOT NULL,
      "discount_rate" real DEFAULT 0,
      "discount_amount" real DEFAULT 0,
      "tax_rate" real DEFAULT 0,
      "tax_amount" real DEFAULT 0,
      "total_price" real NOT NULL,
      "created_at" text DEFAULT (datetime('now')),
      FOREIGN KEY ("order_id") REFERENCES "orders"("id"),
      FOREIGN KEY ("product_id") REFERENCES "products"("id")
    )`
  ];
  
  for (const statement of createTableStatements) {
    try {
      sqlite.exec(statement);
    } catch (error) {
      console.warn('Failed to create table:', error);
    }
  }
  
  console.log('Manual table creation completed');
}

// Close database connection
export function closeDatabase() {
  try {
    sqlite.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

// Get database instance
export function getDatabase() {
  return db;
}

// Health check
export function isDatabaseHealthy() {
  try {
    const result = sqlite.prepare('SELECT 1').get();
    return result !== undefined;
  } catch {
    return false;
  }
} 