import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { db } from '../connection';
import { users, type User, type NewUser } from '../schema';

export class UsersService {
  static async getAll(options: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const { search, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
      let query = db.select().from(users);
      
      // Apply filters
      const conditions = [];
      if (search) {
        conditions.push(
          or(
            like(users.name, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phone, `%${search}%`)
          )
        );
      }
      if (role) conditions.push(eq(users.role, role as any));
      if (status) conditions.push(eq(users.status, status as any));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting
      const orderBy = sortOrder === 'desc' ? desc : asc;
      query = query.orderBy(orderBy(users[sortBy as keyof typeof users]));
      
      // Apply pagination
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
      const result = await db.select().from(users).where(eq(users.id, id));
      if (result.length === 0) {
        return { success: false, error: 'User not found' };
      }
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async create(userData: NewUser) {
    try {
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email));
      if (existingUser.length > 0) {
        return { success: false, error: 'Email already exists' };
      }

      const result = await db.insert(users).values({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async update(id: number, userData: Partial<NewUser>) {
    try {
      const result = await db.update(users)
        .set({ ...userData, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning();
      
      if (result.length === 0) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, data: result[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async delete(id: number) {
    try {
      await db.delete(users).where(eq(users.id, id));
      return { success: true, data: { id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
