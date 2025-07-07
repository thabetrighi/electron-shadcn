import { eq, and } from 'drizzle-orm';
import { db } from '../connection';
import { orderItems, type OrderItem, type NewOrderItem } from '../schema';

export class OrderItemsService {
  static async getAll(options: any = {}) {
    try {
      const result = await db.select().from(orderItems);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getByOrderId(orderId: number) {
    try {
      const result = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getById(id: number) {
    try {
      const orderItem = await db.select().from(orderItems).where(eq(orderItems.id, id));
      if (orderItem.length === 0) {
        return { success: false, error: 'Order item not found' };
      }
      return { success: true, data: orderItem[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async create(itemData: any) {
    try {
      const result = await db.insert(orderItems).values({
        ...itemData,
        createdAt: new Date().toISOString(),
      }).returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, itemData: any) {
    try {
      const result = await db.update(orderItems)
        .set(itemData)
        .where(eq(orderItems.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Order item not found' };
      }
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async delete(id: number) {
    try {
      await db.delete(orderItems).where(eq(orderItems.id, id));
      return { success: true, data: { id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deleteByOrderId(orderId: number) {
    try {
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
      return { success: true, data: { orderId } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Bulk create multiple items for an order
  static async createMultiple(items: any[]) {
    try {
      const itemsWithTimestamp = items.map(item => ({
        ...item,
        createdAt: new Date().toISOString(),
      }));
      
      const result = await db.insert(orderItems).values(itemsWithTimestamp).returning();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
} 