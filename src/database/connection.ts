import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import * as schema from './schema';

// Database path
const dbPath = path.join(app.getPath('userData'), 'pos.db');

// Create database connection
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Initialize database with schema
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Enable WAL mode for better performance
    sqlite.pragma('journal_mode = WAL');
    
    // Create tables using schema (they will be created if they don't exist)
    console.log('Database connection established and ready');
    
    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
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