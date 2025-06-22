import { eq, desc } from 'drizzle-orm';
import { db } from '../connection';
import { orders, orderItems, type Order, type NewOrder } from '../schema';

export class OrdersService {
  static async getAll(options: any = {}) {
    try {
      const result = await db.select().from(orders).orderBy(desc(orders.createdAt));
      return { success: true, data: result };
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
      const orderNumber = `ORD${Date.now()}`;
      
      const result = await db.insert(orders).values({
        ...orderData,
        orderNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, orderData: any) {
    try {
      const result = await db.update(orders)
        .set({ ...orderData, updatedAt: new Date().toISOString() })
        .where(eq(orders.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Order not found' };
      }
      
      return { success: true, data: result[0] };
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
