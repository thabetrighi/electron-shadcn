import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface CrudService<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  getAll: (...args: any[]) => Promise<{ success: boolean; data?: T[]; error?: string }>;
  getById?: (id: any) => Promise<{ success: boolean; data?: T; error?: string }>;
  create: (data: CreateT) => Promise<{ success: boolean; data?: T; error?: string }>;
  update: (id: any, data: UpdateT) => Promise<{ success: boolean; data?: T; error?: string }>;
  delete: (id: any) => Promise<{ success: boolean; error?: string }>;
}

export interface UseCrudOptions {
  autoLoad?: boolean;
  showToasts?: boolean;
  toastMessages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
    error?: string;
  };
}

export interface UseCrudReturn<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  // Data state
  items: T[];
  loading: boolean;
  error: string | null;
  
  // Operations
  loadItems: () => Promise<void>;
  createItem: (data: CreateT) => Promise<boolean>;
  updateItem: (id: number | string, data: UpdateT) => Promise<boolean>;
  deleteItem: (id: number | string) => Promise<boolean>;
  bulkDelete: (ids: (number | string)[]) => Promise<boolean>;
  
  // Utilities
  getItemById: (id: number | string) => T | undefined;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useCrud<T extends { id: number | string }, CreateT = Partial<T>, UpdateT = Partial<T>>(
  service: CrudService<T, CreateT, UpdateT>,
  options: UseCrudOptions = {}
): UseCrudReturn<T, CreateT, UpdateT> {
  const {
    autoLoad = true,
    showToasts = true,
    toastMessages = {
      createSuccess: 'Item created successfully',
      updateSuccess: 'Item updated successfully',
      deleteSuccess: 'Item deleted successfully',
      error: 'An error occurred'
    }
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await service.getAll();
      
      if (result.success) {
        setItems(result.data || []);
      } else {
        const errorMsg = result.error || 'Failed to load items';
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      if (showToasts) {
        toast.error(toastMessages.error || errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [service, showToasts, toastMessages.error]);

  const createItem = useCallback(async (data: CreateT): Promise<boolean> => {
    try {
      setError(null);
      
      const result = await service.create(data);
      
      if (result.success) {
        if (showToasts) {
          toast.success(toastMessages.createSuccess || 'Item created successfully');
        }
        await loadItems(); // Refresh the list
        return true;
      } else {
        const errorMsg = result.error || 'Failed to create item';
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
        return false;
      }
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      if (showToasts) {
        toast.error(toastMessages.error || errorMsg);
      }
      return false;
    }
  }, [service, loadItems, showToasts, toastMessages.createSuccess, toastMessages.error]);

  const updateItem = useCallback(async (id: number | string, data: UpdateT): Promise<boolean> => {
    try {
      setError(null);
      
      const result = await service.update(id, data);
      
      if (result.success) {
        if (showToasts) {
          toast.success(toastMessages.updateSuccess || 'Item updated successfully');
        }
        await loadItems(); // Refresh the list
        return true;
      } else {
        const errorMsg = result.error || 'Failed to update item';
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
        return false;
      }
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      if (showToasts) {
        toast.error(toastMessages.error || errorMsg);
      }
      return false;
    }
  }, [service, loadItems, showToasts, toastMessages.updateSuccess, toastMessages.error]);

  const deleteItem = useCallback(async (id: number | string): Promise<boolean> => {
    try {
      setError(null);
      
      const result = await service.delete(id);
      
      if (result.success) {
        if (showToasts) {
          toast.success(toastMessages.deleteSuccess || 'Item deleted successfully');
        }
        await loadItems(); // Refresh the list
        return true;
      } else {
        const errorMsg = result.error || 'Failed to delete item';
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
        return false;
      }
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      if (showToasts) {
        toast.error(toastMessages.error || errorMsg);
      }
      return false;
    }
  }, [service, loadItems, showToasts, toastMessages.deleteSuccess, toastMessages.error]);

  const bulkDelete = useCallback(async (ids: (number | string)[]): Promise<boolean> => {
    try {
      setError(null);
      
      const deletePromises = ids.map(id => service.delete(id));
      const results = await Promise.all(deletePromises);
      
      const failedDeletes = results.filter(result => !result.success);
      
      if (failedDeletes.length === 0) {
        if (showToasts) {
          toast.success(`Successfully deleted ${ids.length} item(s)`);
        }
        await loadItems(); // Refresh the list
        return true;
      } else {
        const errorMsg = `Failed to delete ${failedDeletes.length} item(s)`;
        setError(errorMsg);
        if (showToasts) {
          toast.error(errorMsg);
        }
        return false;
      }
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      if (showToasts) {
        toast.error(toastMessages.error || errorMsg);
      }
      return false;
    }
  }, [service, loadItems, showToasts, toastMessages.error]);

  const getItemById = useCallback((id: number | string): T | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadItems();
    }
  }, [autoLoad, loadItems]);

  return {
    // Data state
    items,
    loading,
    error,
    
    // Operations
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    
    // Utilities
    getItemById,
    refresh: loadItems,
    clearError
  };
}

// Specialized hooks for common entities
export function useProducts() {
  return useCrud(window.database.products, {
    toastMessages: {
      createSuccess: 'Product created successfully',
      updateSuccess: 'Product updated successfully',
      deleteSuccess: 'Product deleted successfully'
    }
  });
}

export function useCategories() {
  return useCrud(window.database.categories, {
    toastMessages: {
      createSuccess: 'Category created successfully',
      updateSuccess: 'Category updated successfully',
      deleteSuccess: 'Category deleted successfully'
    }
  });
}

export function useUnits() {
  return useCrud(window.database.units, {
    toastMessages: {
      createSuccess: 'Unit created successfully',
      updateSuccess: 'Unit updated successfully',
      deleteSuccess: 'Unit deleted successfully'
    }
  });
}

export function useUsers() {
  return useCrud(window.database.users, {
    toastMessages: {
      createSuccess: 'User created successfully',
      updateSuccess: 'User updated successfully',
      deleteSuccess: 'User deleted successfully'
    }
  });
}

export function useOrders() {
  return useCrud(window.database.orders, {
    toastMessages: {
      createSuccess: 'Order created successfully',
      updateSuccess: 'Order updated successfully',
      deleteSuccess: 'Order deleted successfully'
    }
  });
} 