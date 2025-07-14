import { db } from './connection';
import { UsersService } from './services/users.service';
import { CategoriesService } from './services/categories.service';
import { UnitsService } from './services/units.service';
import { ProductsService } from './services/products.service';
import { OrdersService } from './services/orders.service';
import { SettingsService } from './services/settings.service';
import { orderItems } from './schema';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Initialize default settings first
    console.log('🔧 Initializing default settings...');
    const settingsResult = await SettingsService.initializeDefaults();
    if (settingsResult.success) {
      console.log('✅ Default settings initialized');
      
      // Set Algerian Dinar as default currency
      await SettingsService.set('currency_code', 'DZD');
      await SettingsService.set('currency_symbol', 'دج');
      await SettingsService.set('currency_position', 'before');
      await SettingsService.set('currency_precision', '2');
      console.log('✅ Algerian Dinar set as default currency');
    } else {
      console.error('❌ Failed to initialize default settings:', settingsResult.error);
    }

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
    const vegetablesCategory = await CategoriesService.create({
      name: 'خضار',
      nameEn: 'Vegetables',
      description: 'الخضار الطازجة',
      status: 'active',
      sortOrder: 1,
    });

    const fruitsCategory = await CategoriesService.create({
      name: 'فواكه',
      nameEn: 'Fruits',
      description: 'الفواكه الطازجة',
      status: 'active',
      sortOrder: 2,
    });

    console.log('✅ Categories created');

    // Create vegetables products
    await ProductsService.create({
      name: 'فلفل حار',
      nameEn: 'Hot Pepper',
      description: 'فلفل حار طازج',
      sku: 'VEG-HOT-PEPPER-001',
      barcode: '1234567890123',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 2.50,
      sellingPrice: 4.00,
      minPrice: 3.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'فلفل حلو',
      nameEn: 'Sweet Pepper',
      description: 'فلفل حلو طازج',
      sku: 'VEG-SWEET-PEPPER-001',
      barcode: '1234567890124',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 3.00,
      sellingPrice: 5.00,
      minPrice: 4.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'جزر',
      nameEn: 'Carrot',
      description: 'جزر طازج',
      sku: 'VEG-CARROT-001',
      barcode: '1234567890125',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.50,
      sellingPrice: 2.50,
      minPrice: 2.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'بصل',
      nameEn: 'Onion',
      description: 'بصل طازج',
      sku: 'VEG-ONION-001',
      barcode: '1234567890126',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.00,
      sellingPrice: 2.00,
      minPrice: 1.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'بطاطا',
      nameEn: 'Potato',
      description: 'بطاطا طازجة',
      sku: 'VEG-POTATO-001',
      barcode: '1234567890127',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.20,
      sellingPrice: 2.20,
      minPrice: 2.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'طماطم',
      nameEn: 'Tomato',
      description: 'طماطم طازجة',
      sku: 'VEG-TOMATO-001',
      barcode: '1234567890128',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 2.00,
      sellingPrice: 3.50,
      minPrice: 3.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'خيار',
      nameEn: 'Cucumber',
      description: 'خيار طازج',
      sku: 'VEG-CUCUMBER-001',
      barcode: '1234567890129',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.80,
      sellingPrice: 3.00,
      minPrice: 2.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'ثوم',
      nameEn: 'Garlic',
      description: 'ثوم طازج',
      sku: 'VEG-GARLIC-001',
      barcode: '1234567890130',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 3.50,
      sellingPrice: 6.00,
      minPrice: 5.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'باذنجان',
      nameEn: 'Eggplant',
      description: 'باذنجان طازج',
      sku: 'VEG-EGGPLANT-001',
      barcode: '1234567890131',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 2.20,
      sellingPrice: 4.00,
      minPrice: 3.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'كوسة',
      nameEn: 'Zucchini',
      description: 'كوسة طازجة',
      sku: 'VEG-ZUCCHINI-001',
      barcode: '1234567890132',
      categoryId: vegetablesCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.50,
      sellingPrice: 2.80,
      minPrice: 2.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    // Create fruits products
    await ProductsService.create({
      name: 'تفاح',
      nameEn: 'Apple',
      description: 'تفاح طازج',
      sku: 'FRUIT-APPLE-001',
      barcode: '1234567890133',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 3.00,
      sellingPrice: 5.00,
      minPrice: 4.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'موز',
      nameEn: 'Banana',
      description: 'موز طازج',
      sku: 'FRUIT-BANANA-001',
      barcode: '1234567890134',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 2.50,
      sellingPrice: 4.50,
      minPrice: 4.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'برتقال',
      nameEn: 'Orange',
      description: 'برتقال طازج',
      sku: 'FRUIT-ORANGE-001',
      barcode: '1234567890135',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 2.00,
      sellingPrice: 3.50,
      minPrice: 3.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'عنب',
      nameEn: 'Grapes',
      description: 'عنب طازج',
      sku: 'FRUIT-GRAPES-001',
      barcode: '1234567890136',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 4.00,
      sellingPrice: 7.00,
      minPrice: 6.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'فراولة',
      nameEn: 'Strawberry',
      description: 'فراولة طازجة',
      sku: 'FRUIT-STRAWBERRY-001',
      barcode: '1234567890137',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 5.00,
      sellingPrice: 8.50,
      minPrice: 7.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'بطيخ',
      nameEn: 'Watermelon',
      description: 'بطيخ طازج',
      sku: 'FRUIT-WATERMELON-001',
      barcode: '1234567890138',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.50,
      sellingPrice: 3.00,
      minPrice: 2.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'شمام',
      nameEn: 'Cantaloupe',
      description: 'شمام طازج',
      sku: 'FRUIT-CANTALOUPE-001',
      barcode: '1234567890139',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 2.00,
      sellingPrice: 4.00,
      minPrice: 3.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'خوخ',
      nameEn: 'Peach',
      description: 'خوخ طازج',
      sku: 'FRUIT-PEACH-001',
      barcode: '1234567890140',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 3.50,
      sellingPrice: 6.00,
      minPrice: 5.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'كمثرى',
      nameEn: 'Pear',
      description: 'كمثرى طازجة',
      sku: 'FRUIT-PEAR-001',
      barcode: '1234567890141',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 3.00,
      sellingPrice: 5.50,
      minPrice: 5.00,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    await ProductsService.create({
      name: 'ليمون',
      nameEn: 'Lemon',
      description: 'ليمون طازج',
      sku: 'FRUIT-LEMON-001',
      barcode: '1234567890142',
      categoryId: fruitsCategory.data?.id,
      unitId: kgUnit.data?.id,
      purchasePrice: 1.50,
      sellingPrice: 3.00,
      minPrice: 2.50,
      currentStock: 1000000,
      minStock: 10,
      taxRate: 0,
      isActive: true,
      trackStock: true,
    });

    console.log('✅ Vegetables and fruits products created');

    // Create sample orders
    await OrdersService.create({
      orderNumber: 'ORD-2024-001',
      customerId: 2, // John Customer
      totalAmount: 25.00,
      subtotal: 25.00,
      taxAmount: 0,
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
      subtotal: 15.50,
      taxAmount: 0,
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
      totalAmount: 42.00,
      subtotal: 42.00,
      taxAmount: 0,
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
      totalAmount: 18.50,
      subtotal: 18.50,
      taxAmount: 0,
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
      totalAmount: 8.50,
      subtotal: 8.50,
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
      totalAmount: 35.00,
      subtotal: 35.00,
      taxAmount: 0,
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
        productName: 'فلفل حار',
        productSku: 'VEG-HOT-PEPPER-001',
        quantity: 2,
        unitPrice: 4.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 8.00,
      }
    ]);

    // Order 2 items (ORD-2024-002) - 2 items
    await db.insert(orderItems).values([
      {
        orderId: 2,
        productId: 3,
        productName: 'جزر',
        productSku: 'VEG-CARROT-001',
        quantity: 2,
        unitPrice: 2.50,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 5.00,
      },
      {
        orderId: 2,
        productId: 2,
        productName: 'فلفل حلو',
        productSku: 'VEG-SWEET-PEPPER-001',
        quantity: 1,
        unitPrice: 5.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 5.00,
      }
    ]);

    // Order 3 items (ORD-2024-003) - 4 items
    await db.insert(orderItems).values([
      {
        orderId: 3,
        productId: 1,
        productName: 'فلفل حار',
        productSku: 'VEG-HOT-PEPPER-001',
        quantity: 3,
        unitPrice: 4.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 12.00,
      },
      {
        orderId: 3,
        productId: 4,
        productName: 'بصل',
        productSku: 'VEG-ONION-001',
        quantity: 1,
        unitPrice: 2.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 2.00,
      }
    ]);

    // Order 4 items (ORD-2024-004) - 1 item
    await db.insert(orderItems).values([
      {
        orderId: 4,
        productId: 2,
        productName: 'فلفل حلو',
        productSku: 'VEG-SWEET-PEPPER-001',
        quantity: 2,
        unitPrice: 5.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 10.00,
      }
    ]);

    // Order 5 items (ORD-2024-005) - 1 item
    await db.insert(orderItems).values([
      {
        orderId: 5,
        productId: 2,
        productName: 'فلفل حلو',
        productSku: 'VEG-SWEET-PEPPER-001',
        quantity: 1,
        unitPrice: 5.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 5.00,
      }
    ]);

    // Order 6 items (ORD-2024-006) - 5 items
    await db.insert(orderItems).values([
      {
        orderId: 6,
        productId: 1,
        productName: 'فلفل حار',
        productSku: 'VEG-HOT-PEPPER-001',
        quantity: 1,
        unitPrice: 4.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 4.00,
      },
      {
        orderId: 6,
        productId: 3,
        productName: 'جزر',
        productSku: 'VEG-CARROT-001',
        quantity: 3,
        unitPrice: 2.50,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 7.50,
      },
      {
        orderId: 6,
        productId: 4,
        productName: 'بصل',
        productSku: 'VEG-ONION-001',
        quantity: 4,
        unitPrice: 2.00,
        discountRate: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 8.00,
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
