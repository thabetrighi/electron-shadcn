import { db } from './connection';

export async function seedDatabaseElectron() {
  console.log('🌱 Starting Electron database seeding...');
  
  try {
    // Create admin user
    const adminUser = await db.insert({
      name: 'Admin User',
      email: 'admin@pos.com',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
    }).into('users').returning();
    
    console.log('✅ Admin user created');

    // Create units
    const pieceUnit = await db.insert({
      name: 'Piece',
      nameEn: 'Piece',
      symbol: 'pcs',
      type: 'piece',
      status: 'active',
    }).into('units').returning();

    const kgUnit = await db.insert({
      name: 'Kilogram',
      nameEn: 'Kilogram',
      symbol: 'kg',
      type: 'weight',
      status: 'active',
    }).into('units').returning();

    console.log('✅ Units created');

    // Create categories
    const beveragesCategory = await db.insert({
      name: 'Beverages',
      nameEn: 'Beverages',
      description: 'Hot and cold beverages',
      status: 'active',
      sortOrder: 1,
    }).into('categories').returning();

    const foodCategory = await db.insert({
      name: 'Food',
      nameEn: 'Food',
      description: 'Fresh food items',
      status: 'active',
      sortOrder: 2,
    }).into('categories').returning();

    console.log('✅ Categories created');

    // Create sample products
    await db.insert({
      name: 'Coffee - Medium Roast',
      nameEn: 'Coffee - Medium Roast',
      description: 'Premium medium roast coffee beans',
      sku: 'COFFEE-MED-001',
      sellingPrice: 12.99,
      currentStock: 100,
      categoryId: beveragesCategory[0]?.id,
      unitId: kgUnit[0]?.id,
      isActive: true,
    }).into('products');

    await db.insert({
      name: 'Chocolate Croissant',
      nameEn: 'Chocolate Croissant',
      description: 'Fresh baked chocolate croissant',
      sku: 'PASTRY-CHOC-001',
      sellingPrice: 3.50,
      currentStock: 25,
      categoryId: foodCategory[0]?.id,
      unitId: pieceUnit[0]?.id,
      isActive: true,
    }).into('products');

    console.log('✅ Sample products created');
    console.log('🎉 Electron database seeding completed successfully!');
    
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Electron database seeding failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 