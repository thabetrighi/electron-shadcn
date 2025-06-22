import { eq, like, and, or } from 'drizzle-orm';
import { db } from '../connection';
import { products, type Product, type NewProduct } from '../schema';

export class ProductsService {
  static async getAll(options: any = {}) {
    try {
      const result = await db.select().from(products);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getById(id: number) {
    try {
      const result = await db.select().from(products).where(eq(products.id, id));
      if (result.length === 0) {
        return { success: false, error: 'Product not found' };
      }
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async create(productData: NewProduct) {
    try {
      const result = await db.insert(products).values({
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, productData: Partial<NewProduct>) {
    try {
      const result = await db.update(products)
        .set({ ...productData, updatedAt: new Date().toISOString() })
        .where(eq(products.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Product not found' };
      }
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async delete(id: number) {
    try {
      await db.delete(products).where(eq(products.id, id));
      return { success: true, data: { id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
