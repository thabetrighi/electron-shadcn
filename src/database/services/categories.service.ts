import { eq, like, and, or, desc, asc, isNull } from 'drizzle-orm';
import { db } from '../connection';
import { categories, type Category, type NewCategory } from '../schema';

export class CategoriesService {
  static async getAll(options: {
    search?: string;
    parentId?: number | null;
    status?: string;
    language?: 'en' | 'fr' | 'ar';
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { search, parentId, status, language = 'en', page = 1, limit = 50 } = options;
      
      let query = db.select().from(categories);
      
      const conditions = [];
      if (search) {
        const nameField = language === 'fr' ? categories.nameFr : 
                         language === 'ar' ? categories.nameAr : categories.nameEn;
        conditions.push(
          or(
            like(categories.name, `%${search}%`),
            like(nameField, `%${search}%`)
          )
        );
      }
      if (parentId !== undefined) {
        if (parentId === null) {
          conditions.push(isNull(categories.parentId));
        } else {
          conditions.push(eq(categories.parentId, parentId));
        }
      }
      if (status) conditions.push(eq(categories.status, status as any));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query.orderBy(asc(categories.sortOrder), asc(categories.name));
      
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
      
      const result = await query;
      
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getById(id: number) {
    try {
      const result = await db.select().from(categories).where(eq(categories.id, id));
      if (result.length === 0) {
        return { success: false, error: 'Category not found' };
      }
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getChildren(parentId: number) {
    try {
      const result = await db.select().from(categories)
        .where(eq(categories.parentId, parentId))
        .orderBy(asc(categories.sortOrder), asc(categories.name));
      
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getRootCategories() {
    try {
      const result = await db.select().from(categories)
        .where(isNull(categories.parentId))
        .orderBy(asc(categories.sortOrder), asc(categories.name));
      
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async create(categoryData: NewCategory) {
    try {
      const result = await db.insert(categories).values({
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, categoryData: Partial<NewCategory>) {
    try {
      const result = await db.update(categories)
        .set({ ...categoryData, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Category not found' };
      }
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async delete(id: number) {
    try {
      // Check if category has children
      const children = await db.select().from(categories).where(eq(categories.parentId, id));
      if (children.length > 0) {
        return { success: false, error: 'Cannot delete category with subcategories' };
      }

      await db.delete(categories).where(eq(categories.id, id));
      return { success: true, data: { id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updateSortOrder(id: number, sortOrder: number) {
    try {
      const result = await db.update(categories)
        .set({ sortOrder, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))
        .returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
} 