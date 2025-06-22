import { initializeDatabase } from './connection';
import { UsersService } from './services/users.service';
import { ProductsService } from './services/products.service';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Initialize database first
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Create admin user
    await UsersService.create({
      name: 'Admin User',
      email: 'admin@pos.com',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
    });

    // Create sample products
    await ProductsService.create({
      name: 'Coffee - Medium Roast',
      description: 'Premium medium roast coffee beans',
      sellingPrice: 12.99,
      currentStock: 100,
      isActive: true,
    });

    await ProductsService.create({
      name: 'Organic Tea - Earl Grey',
      description: 'Organic Earl Grey tea blend',
      sellingPrice: 8.99,
      currentStock: 50,
      isActive: true,
    });

    await ProductsService.create({
      name: 'Chocolate Croissant',
      description: 'Fresh baked chocolate croissant',
      sellingPrice: 3.50,
      currentStock: 25,
      isActive: true,
    });

    console.log('✅ Sample data created');
    console.log('🎉 Database seeding completed successfully!');
    
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase().then((result) => {
    if (result.success) {
      console.log('✅ Seeding completed');
      process.exit(0);
    } else {
      console.error('❌ Seeding failed:', result.error);
      process.exit(1);
    }
  });
}
