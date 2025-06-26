import { eq, like, and, or } from 'drizzle-orm';
import { db } from '../connection';
import { products, categories, units, type Product, type NewProduct } from '../schema';

export class ProductsService {
  static async getAll(options: any = {}) {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          nameEn: products.nameEn,
          nameFr: products.nameFr,
          nameAr: products.nameAr,
          description: products.description,
          sku: products.sku,
          barcode: products.barcode,
          categoryId: products.categoryId,
          unitId: products.unitId,
          supplierId: products.supplierId,
          purchasePrice: products.purchasePrice,
          sellingPrice: products.sellingPrice,
          minPrice: products.minPrice,
          currentStock: products.currentStock,
          minStock: products.minStock,
          weight: products.weight,
          color: products.color,
          size: products.size,
          image: products.image,
          taxRate: products.taxRate,
          discountRate: products.discountRate,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          trackStock: products.trackStock,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          // Category information
          category: {
            id: categories.id,
            name: categories.name,
          },
          // Unit information
          unit: {
            id: units.id,
            name: units.name,
            symbol: units.symbol,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(units, eq(products.unitId, units.id));
        
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getById(id: number) {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          nameEn: products.nameEn,
          nameFr: products.nameFr,
          nameAr: products.nameAr,
          description: products.description,
          sku: products.sku,
          barcode: products.barcode,
          categoryId: products.categoryId,
          unitId: products.unitId,
          supplierId: products.supplierId,
          purchasePrice: products.purchasePrice,
          sellingPrice: products.sellingPrice,
          minPrice: products.minPrice,
          currentStock: products.currentStock,
          minStock: products.minStock,
          weight: products.weight,
          color: products.color,
          size: products.size,
          image: products.image,
          taxRate: products.taxRate,
          discountRate: products.discountRate,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          trackStock: products.trackStock,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          // Category information
          category: {
            id: categories.id,
            name: categories.name,
          },
          // Unit information
          unit: {
            id: units.id,
            name: units.name,
            symbol: units.symbol,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(units, eq(products.unitId, units.id))
        .where(eq(products.id, id));
        
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