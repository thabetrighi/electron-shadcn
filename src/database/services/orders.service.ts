import { eq, desc, count } from 'drizzle-orm';
import { db } from '../connection';
import { orders, orderItems, users, type Order, type NewOrder } from '../schema';

export class OrdersService {
  static async getAll(options: any = {}) {
    try {
      // Fetch orders with customer information
      const result = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerId: orders.customerId,
          total: orders.totalAmount, // Map totalAmount to total
          subtotal: orders.subtotal,
          taxAmount: orders.taxAmount,
          discountAmount: orders.discountAmount,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          orderDate: orders.orderDate,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          customerEmail: orders.customerEmail,
          staffId: orders.staffId,
          // Join customer data
          customer: {
            name: users.name,
            email: users.email,
            phone: users.phone,
          },
        })
        .from(orders)
        .leftJoin(users, eq(orders.customerId, users.id))
        .orderBy(desc(orders.createdAt));

      // Get items count for each order
      const orderIds = result.map(order => order.id);
      const itemsCounts = await Promise.all(
        orderIds.map(async (orderId) => {
          const itemsCount = await db
            .select({ count: count() })
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));
          return { orderId, count: itemsCount[0]?.count || 0 };
        })
      );

      // Map the results with customer data, staff data, and items count
      const mappedResult = result.map(order => ({
        ...order,
        // Use joined customer data if available, otherwise use order fields
        customer: (order.customer && order.customer.name) ? order.customer : (
          order.customerName ? {
            name: order.customerName,
            email: order.customerEmail || '',
            phone: order.customerPhone || '',
          } : null
        ),
        // Add staff information (we'll fetch this separately if needed)
        staff: order.staffId ? { id: order.staffId, name: 'Staff Member' } : null,
        itemsCount: itemsCounts.find(ic => ic.orderId === order.id)?.count || 0,
      }));

      // Fetch staff information for orders that have staffId
      for (const order of mappedResult) {
        if (order.staffId) {
          try {
            const staffResult = await db
              .select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
              })
              .from(users)
              .where(eq(users.id, order.staffId));
            
            if (staffResult.length > 0) {
              order.staff = staffResult[0];
              console.log(`✅ Fetched staff data for order ${order.id}:`, staffResult[0]);
            } else {
              console.warn(`⚠️ No staff found for order ${order.id} with staffId ${order.staffId}`);
            }
          } catch (error) {
            console.warn(`Failed to fetch staff data for order ${order.id}:`, error);
          }
        }
      }

      return { success: true, data: mappedResult };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getById(id: number) {
    try {
      const order = await db.select().from(orders).where(eq(orders.id, id));
      if (order.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      
      return {
        success: true,
        data: {
          order: order[0],
          items: items,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async create(orderData: any) {
    try {
      const orderNumber = orderData.orderNumber || `ORD${Date.now()}`;
      
      // Map component fields to database fields
      const dbOrderData = {
        orderNumber,
        customerId: orderData.customerId || null,
        totalAmount: orderData.totalAmount || orderData.total || 0,
        subtotal: orderData.subtotal || 0,
        taxAmount: orderData.taxAmount || 0,
        discountAmount: orderData.discountAmount || 0,
        paymentMethod: orderData.paymentMethod || 'cash',
        paymentStatus: orderData.paymentStatus || 'pending',
        status: orderData.status || 'pending',
        orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Additional POS fields
        customerName: orderData.customerName || null,
        customerPhone: orderData.customerPhone || null,
        customerEmail: orderData.customerEmail || null,
        paidAmount: orderData.paidAmount || orderData.totalAmount || orderData.total || 0,
        changeAmount: orderData.changeAmount || 0,
        receiptPrinted: orderData.receiptPrinted || false,
        staffId: orderData.userId || null,
        orderType: orderData.orderType || 'sale',
      };
      
      const result = await db.insert(orders).values(dbOrderData).returning();
      
      // Return data in the format expected by the component
      const returnData = {
        ...result[0],
        total: result[0].totalAmount, // Map back to expected field name
      };
      
      return { success: true, data: returnData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, orderData: any) {
    try {
      // Map component fields to database fields
      const dbOrderData = {
        ...orderData,
        totalAmount: orderData.total || orderData.totalAmount,
        updatedAt: new Date().toISOString(),
      };
      
      // Remove component-specific fields that don't exist in DB
      delete dbOrderData.total;
      delete dbOrderData.customer;
      delete dbOrderData.itemsCount;
      
      const result = await db.update(orders)
        .set(dbOrderData)
        .where(eq(orders.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Order not found' };
      }
      
      // Return data in the format expected by the component
      const returnData = {
        ...result[0],
        total: result[0].totalAmount, // Map back to expected field name
      };
      
      return { success: true, data: returnData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async delete(id: number) {
    try {
      await db.delete(orders).where(eq(orders.id, id));
      return { success: true, data: { id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
