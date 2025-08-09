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
      // Ensure email is provided and unique. If omitted/empty, generate a unique placeholder email.
      let normalizedEmail = (userData.email || '').trim();

      if (!normalizedEmail) {
        const baseFromName = (userData.name || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'user';

        // Try a few times to avoid rare collisions
        for (let attempt = 0; attempt < 3; attempt++) {
          const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
          const candidate = `${baseFromName}-${suffix}@local`;
          const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, candidate));
          if (exists.length === 0) {
            normalizedEmail = candidate;
            break;
          }
        }

        // Final fallback (extremely unlikely to collide after attempts above)
        if (!normalizedEmail) {
          normalizedEmail = `${baseFromName}-${Math.random().toString(36).slice(2)}@local`;
        }
      } else {
        // If user provided an email, ensure it's unique
        const existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail));
        if (existingUser.length > 0) {
          return { success: false, error: 'Email already exists' };
        }
      }

      const result = await db
        .insert(users)
        .values({
          ...userData,
          email: normalizedEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
      
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
