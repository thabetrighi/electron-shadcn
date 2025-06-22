import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { db } from '../connection';
import { units, type Unit, type NewUnit } from '../schema';

export class UnitsService {
  static async getAll(options: {
    search?: string;
    type?: string;
    status?: string;
    language?: 'en' | 'fr' | 'ar';
  } = {}) {
    try {
      const { search, type, status, language = 'en' } = options;
      
      let query = db.select().from(units);
      
      const conditions = [];
      if (search) {
        const nameField = language === 'fr' ? units.nameFr : 
                         language === 'ar' ? units.nameAr : units.nameEn;
        conditions.push(
          or(
            like(units.name, `%${search}%`),
            like(nameField, `%${search}%`),
            like(units.symbol, `%${search}%`)
          )
        );
      }
      if (type) conditions.push(eq(units.type, type as any));
      if (status) conditions.push(eq(units.status, status as any));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query.orderBy(asc(units.name));
      
      const result = await query;
      
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getById(id: number) {
    try {
      const result = await db.select().from(units).where(eq(units.id, id));
      if (result.length === 0) {
        return { success: false, error: 'Unit not found' };
      }
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getByType(type: string) {
    try {
      const result = await db.select().from(units)
        .where(eq(units.type, type as any))
        .orderBy(asc(units.name));
      
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async create(unitData: NewUnit) {
    try {
      const result = await db.insert(units).values({
        ...unitData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, unitData: Partial<NewUnit>) {
    try {
      const result = await db.update(units)
        .set({ ...unitData, updatedAt: new Date().toISOString() })
        .where(eq(units.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'Unit not found' };
      }
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async delete(id: number) {
    try {
      await db.delete(units).where(eq(units.id, id));
      return { success: true, data: { id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
} 