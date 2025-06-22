import { db } from './connection';
import { UsersService } from './services/users.service';
import { CategoriesService } from './services/categories.service';
import { UnitsService } from './services/units.service';
import { ProductsService } from './services/products.service';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create admin user
    const adminResult = await UsersService.create({
      name: 'Admin User',
      email: 'admin@pos.com',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
    });
    console.log('✅ Admin user created');

    // Create sample users
    await UsersService.create({
      name: 'John Customer',
      email: 'john@customer.com',
      phone: '+1234567891',
      role: 'client',
      status: 'active',
    });

    await UsersService.create({
      name: 'Coffee Supplier Inc',
      email: 'supplier@coffee.com',
      phone: '+1234567892',
      role: 'supplier',
      status: 'active',
    });

    // Create units
    const pieceUnit = await UnitsService.create({
      name: 'Piece',
      nameEn: 'Piece',
      symbol: 'pcs',
      type: 'piece',
      status: 'active',
    });

    const kgUnit = await UnitsService.create({
      name: 'Kilogram',
      nameEn: 'Kilogram',
      symbol: 'kg',
      type: 'weight',
      status: 'active',
    });

    const literUnit = await UnitsService.create({
      name: 'Liter',
      nameEn: 'Liter',
      symbol: 'L',
      type: 'volume',
      status: 'active',
    });

    console.log('✅ Units created');

    // Create categories
    const beveragesCategory = await CategoriesService.create({
      name: 'Beverages',
      nameEn: 'Beverages',
      description: 'Hot and cold beverages',
      status: 'active',
      sortOrder: 1,
    });

    const foodCategory = await CategoriesService.create({
      name: 'Food',
      nameEn: 'Food',
      description: 'Fresh food items',
      status: 'active',
      sortOrder: 2,
    });

    const snacksCategory = await CategoriesService.create({
      name: 'Snacks',
      nameEn: 'Snacks',
      description: 'Light snacks and treats',
      status: 'active',
      sortOrder: 3,
    });

    // Create subcategories
    const coffeeCategory = await CategoriesService.create({
      name: 'Coffee',
      nameEn: 'Coffee',
      description: 'Coffee products',
      parentId: beveragesCategory.data?.id,
      status: 'active',
      sortOrder: 1,
    });

    const teaCategory = await CategoriesService.create({
      name: 'Tea',
      nameEn: 'Tea',
      description: 'Tea products',
      parentId: beveragesCategory.data?.id,
      status: 'active',
      sortOrder: 2,
    });

    console.log('✅ Categories created');

    // Create sample products with proper relationships
    await ProductsService.create({
      name: 'Coffee - Medium Roast',
      nameEn: 'Coffee - Medium Roast',
      description: 'Premium medium roast coffee beans',
      sku: 'COFFEE-MED-001',
      barcode: '1234567890123',
      categoryId: coffeeCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 8.50,
      sellingPrice: 12.99,
      minPrice: 10.00,
      currentStock: 100,
      minStock: 10,
      taxRate: 0.10,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'Organic Tea - Earl Grey',
      nameEn: 'Organic Tea - Earl Grey',
      description: 'Organic Earl Grey tea blend',
      sku: 'TEA-EARL-001',
      barcode: '1234567890124',
      categoryId: teaCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 6.00,
      sellingPrice: 8.99,
      minPrice: 7.50,
      currentStock: 50,
      minStock: 5,
      taxRate: 0.10,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'Chocolate Croissant',
      nameEn: 'Chocolate Croissant',
      description: 'Fresh baked chocolate croissant',
      sku: 'PASTRY-CHOC-001',
      barcode: '1234567890125',
      categoryId: foodCategory.data?.id,
      unitId: pieceUnit.data?.id,
      purchasePrice: 2.00,
      sellingPrice: 3.50,
      minPrice: 3.00,
      currentStock: 25,
      minStock: 5,
      taxRate: 0.08,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'Blueberry Muffin',
      nameEn: 'Blueberry Muffin',
      description: 'Fresh blueberry muffin',
      sku: 'MUFFIN-BLUE-001',
      barcode: '1234567890126',
      categoryId: snacksCategory.data?.id,
      unitId: pieceUnit.data?.id,
      purchasePrice: 1.50,
      sellingPrice: 2.99,
      minPrice: 2.50,
      currentStock: 30,
      minStock: 10,
      taxRate: 0.08,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'Espresso',
      nameEn: 'Espresso',
      description: 'Strong espresso shot',
      sku: 'COFFEE-ESP-001',
      barcode: '1234567890127',
      categoryId: coffeeCategory.data?.id,
      unitId: pieceUnit.data?.id,
      purchasePrice: 0.50,
      sellingPrice: 1.99,
      minPrice: 1.50,
      currentStock: 0,
      minStock: 0,
      taxRate: 0.10,
      isActive: true,
      trackStock: false, // Service item
    });

    console.log('✅ Sample products created');
    console.log('🎉 Database seeding completed successfully!');
    
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run seed if called directly
if (require.main === module) {
  // Initialize database first for direct execution
  const { initializeDatabase } = require('./connection');
  initializeDatabase().then(() => {
    return seedDatabase();
  }).then((result: { success: boolean; error?: string }) => {
    if (result.success) {
      console.log('✅ Seeding completed');
      process.exit(0);
    } else {
      console.error('❌ Seeding failed:', result.error);
      process.exit(1);
    }
  }).catch((error: Error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}
