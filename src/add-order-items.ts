// Simple script to add order items to existing orders
// This can be run through the browser console once the app is running

// Add this to browser console:
/*
// First check what orders exist
window.debugOrderItems()

// Then add items to orders with 0 itemsCount
window.addOrderItems()

// Check again to see updated itemsCount
window.debugOrderItems()
*/

// Alternative: Add individual items manually
/*
// Add single item to order ID 1
await window.database.orderItems.create({
  orderId: 1,
  productId: 1,
  productName: 'Coffee - Medium Roast',
  productSku: 'COFFEE-MED-001',
  quantity: 2,
  unitPrice: 12.99,
  discountRate: 0,
  discountAmount: 0,
  taxRate: 0.10,
  taxAmount: 2.60,
  totalPrice: 25.98,
})

// Add multiple items at once
await window.database.orderItems.createMultiple([
  {
    orderId: 2,
    productId: 1,
    productName: 'Coffee - Medium Roast',
    productSku: 'COFFEE-MED-001',
    quantity: 1,
    unitPrice: 12.99,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0.10,
    taxAmount: 1.30,
    totalPrice: 14.29,
  },
  {
    orderId: 2,
    productId: 2,
    productName: 'Organic Tea',
    productSku: 'TEA-EARL-001',
    quantity: 3,
    unitPrice: 8.99,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0.10,
    taxAmount: 2.70,
    totalPrice: 26.97,
  }
])

// Then refresh the orders page to see updated itemsCount
*/ 