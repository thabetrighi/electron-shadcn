import { db } from './connection';
import { SettingsService } from './services/settings.service';
import { users, units, categories, products } from './schema';

export async function seedDatabaseElectron() {
  console.log('🌱 Starting Electron database seeding...');
  
  try {
    // Initialize default settings
    console.log('🔧 Initializing default settings...');
    await SettingsService.initializeDefaults();
    console.log('✅ Default settings initialized');

    // Create admin user
    const adminUser = await db.insert(users).values({
      name: 'Admin User',
      email: 'admin@pos.com',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
    }).returning();
    
    console.log('✅ Admin user created');

    // Create units
    await db.insert(units).values([
      {
        name: 'Piece',
        nameEn: 'Piece',
        symbol: 'pcs',
        type: 'piece',
        status: 'active',
      },
      {
        name: 'Kilogram',
        nameEn: 'Kilogram',
        symbol: 'kg',
        type: 'weight',
        status: 'active',
      }
    ]);

    console.log('✅ Units created');

    // Create categories
    await db.insert(categories).values([
      {
        name: 'Beverages',
        nameEn: 'Beverages',
        description: 'Hot and cold beverages',
        status: 'active',
        sortOrder: 1,
      },
      {
        name: 'Food',
        nameEn: 'Food',
        description: 'Fresh food items',
        status: 'active',
        sortOrder: 2,
      }
    ]);

    console.log('✅ Categories created');

    // Create sample products (using approximate IDs - will work for initial seeding)
    await db.insert(products).values([
      {
        name: 'Coffee - Medium Roast',
        nameEn: 'Coffee - Medium Roast',
        description: 'Premium medium roast coffee beans',
        sku: 'COFFEE-MED-001',
        sellingPrice: 12.99,
        currentStock: 100,
        categoryId: 1, // Beverages
        unitId: 2, // Kilogram
        isActive: true,
      },
      {
        name: 'Chocolate Croissant',
        nameEn: 'Chocolate Croissant',
        description: 'Fresh baked chocolate croissant',
        sku: 'PASTRY-CHOC-001',
        sellingPrice: 3.50,
        currentStock: 25,
        categoryId: 2, // Food
        unitId: 1, // Piece
        isActive: true,
      }
    ]);

    console.log('✅ Sample products created');
    console.log('🎉 Electron database seeding completed successfully!');
    
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Electron database seeding failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 