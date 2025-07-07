import { db } from './connection';
import { UsersService } from './services/users.service';
import { CategoriesService } from './services/categories.service';
import { UnitsService } from './services/units.service';
import { ProductsService } from './services/products.service';
import { OrdersService } from './services/orders.service';
import { orderItems } from './schema';

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

    // Create sample orders
    await OrdersService.create({
      orderNumber: 'ORD-2024-001',
      customerId: 2, // John Customer
      totalAmount: 25.97,
      subtotal: 23.97,
      taxAmount: 2.00,
      discountAmount: 0,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'delivered',
      orderDate: '2024-01-15',
      customerName: 'John Customer',
      customerEmail: 'john@customer.com',
      customerPhone: '+1234567891',
    });

    await OrdersService.create({
      orderNumber: 'ORD-2024-002',
      customerId: null, // Walk-in customer
      totalAmount: 15.50,
      subtotal: 14.49,
      taxAmount: 1.01,
      discountAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'completed',
      orderDate: '2024-01-16',
      customerName: 'Walk-in Customer',
      customerEmail: null,
      customerPhone: null,
    });

    await OrdersService.create({
      orderNumber: 'ORD-2024-003',
      customerId: 2, // John Customer
      totalAmount: 42.95,
      subtotal: 39.95,
      taxAmount: 3.00,
      discountAmount: 0,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'shipped',
      orderDate: '2024-01-17',
      customerName: 'John Customer',
      customerEmail: 'john@customer.com',
      customerPhone: '+1234567891',
    });

    await OrdersService.create({
      orderNumber: 'ORD-2024-004',
      customerId: 2, // John Customer
      totalAmount: 18.75,
      subtotal: 17.50,
      taxAmount: 1.25,
      discountAmount: 0,
      paymentMethod: 'mobile',
      paymentStatus: 'pending',
      status: 'confirmed',
      orderDate: '2024-01-18',
      customerName: 'John Customer',
      customerEmail: 'john@customer.com',
      customerPhone: '+1234567891',
    });

    await OrdersService.create({
      orderNumber: 'ORD-2024-005',
      customerId: null, // Walk-in customer
      totalAmount: 8.99,
      subtotal: 8.99,
      taxAmount: 0,
      discountAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'processing',
      orderDate: '2024-01-19',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '+1234567899',
    });

    await OrdersService.create({
      orderNumber: 'ORD-2024-006',
      customerId: 2, // John Customer
      totalAmount: 35.48,
      subtotal: 32.98,
      taxAmount: 2.50,
      discountAmount: 0,
      paymentMethod: 'card',
      paymentStatus: 'failed',
      status: 'cancelled',
      orderDate: '2024-01-20',
      customerName: 'John Customer',
      customerEmail: 'john@customer.com',
      customerPhone: '+1234567891',
    });

    console.log('✅ Sample orders created');

    // Create sample order items
    // Order 1 items (ORD-2024-001) - 3 items
    await db.insert(orderItems).values([
      {
        orderId: 1,
        productId: 1,
        productName: 'Coffee - Medium Roast',
        productSku: 'COFFEE-MED-001',
        quantity: 2,
        unitPrice: 12.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.10,
        taxAmount: 2.00,
        totalPrice: 25.98,
      }
    ]);

    // Order 2 items (ORD-2024-002) - 2 items
    await db.insert(orderItems).values([
      {
        orderId: 2,
        productId: 3,
        productName: 'Chocolate Croissant',
        productSku: 'PASTRY-CHOC-001',
        quantity: 2,
        unitPrice: 3.50,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.08,
        taxAmount: 0.56,
        totalPrice: 7.00,
      },
      {
        orderId: 2,
        productId: 2,
        productName: 'Organic Tea - Earl Grey',
        productSku: 'TEA-EARL-001',
        quantity: 1,
        unitPrice: 8.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.10,
        taxAmount: 0.45,
        totalPrice: 8.50,
      }
    ]);

    // Order 3 items (ORD-2024-003) - 4 items
    await db.insert(orderItems).values([
      {
        orderId: 3,
        productId: 1,
        productName: 'Coffee - Medium Roast',
        productSku: 'COFFEE-MED-001',
        quantity: 3,
        unitPrice: 12.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.10,
        taxAmount: 3.00,
        totalPrice: 38.97,
      },
      {
        orderId: 3,
        productId: 4,
        productName: 'Blueberry Muffin',
        productSku: 'MUFFIN-BLUE-001',
        quantity: 1,
        unitPrice: 2.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.08,
        taxAmount: 0.24,
        totalPrice: 2.99,
      }
    ]);

    // Order 4 items (ORD-2024-004) - 1 item
    await db.insert(orderItems).values([
      {
        orderId: 4,
        productId: 2,
        productName: 'Organic Tea - Earl Grey',
        productSku: 'TEA-EARL-001',
        quantity: 2,
        unitPrice: 8.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.10,
        taxAmount: 1.25,
        totalPrice: 17.98,
      }
    ]);

    // Order 5 items (ORD-2024-005) - 1 item
    await db.insert(orderItems).values([
      {
        orderId: 5,
        productId: 2,
        productName: 'Organic Tea - Earl Grey',
        productSku: 'TEA-EARL-001',
        quantity: 1,
        unitPrice: 8.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 8.99,
      }
    ]);

    // Order 6 items (ORD-2024-006) - 5 items
    await db.insert(orderItems).values([
      {
        orderId: 6,
        productId: 1,
        productName: 'Coffee - Medium Roast',
        productSku: 'COFFEE-MED-001',
        quantity: 1,
        unitPrice: 12.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.10,
        taxAmount: 1.30,
        totalPrice: 12.99,
      },
      {
        orderId: 6,
        productId: 3,
        productName: 'Chocolate Croissant',
        productSku: 'PASTRY-CHOC-001',
        quantity: 3,
        unitPrice: 3.50,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.08,
        taxAmount: 0.84,
        totalPrice: 10.50,
      },
      {
        orderId: 6,
        productId: 4,
        productName: 'Blueberry Muffin',
        productSku: 'MUFFIN-BLUE-001',
        quantity: 4,
        unitPrice: 2.99,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0.08,
        taxAmount: 0.36,
        totalPrice: 11.96,
      }
    ]);

    console.log('✅ Sample order items created');
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
