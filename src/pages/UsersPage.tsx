import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { crudConfigurations } from '../components/enhanced-crud-configs';
import { toast } from 'react-hot-toast';

// Enhanced User interface
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'supplier';
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const { t } = useTranslation();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Get configuration
  const config = crudConfigurations.users;

  // Enhanced statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const clientUsers = users.filter(u => u.role === 'client').length;
    const supplierUsers = users.filter(u => u.role === 'supplier').length;

    return [
      {
        label: t('stats.totalUsers', 'Total Users'),
        value: totalUsers,
        icon: config.entityConfig.icon,
        color: config.entityConfig.color,
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.activeUsers', 'Active Users'),
        value: activeUsers,
        icon: config.entityConfig.icon,
        color: 'text-green-600',
        format: 'number' as const,
        comparison: {
          value: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          label: t('stats.ofTotal', 'of total')
        }
      },
      {
        label: t('stats.administrators', 'Administrators'),
        value: adminUsers,
        icon: config.entityConfig.icon,
        color: 'text-purple-600',
        format: 'number' as const
      },
      {
        label: t('stats.clients', 'Clients'),
        value: clientUsers,
        icon: config.entityConfig.icon,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.suppliers', 'Suppliers'),
        value: supplierUsers,
        icon: config.entityConfig.icon,
        color: 'text-orange-600',
        format: 'number' as const
      }
    ];
  }, [users, t, config]);

  // CRUD operations
  const handleAdd = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const response = await window.database.users.create(formData);
      if (!response.success) throw new Error(response.error);
      
      setUsers(prev => [...prev, response.data]);
      toast.success(t('messages.userCreated', 'User created successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(t('messages.createError', 'Failed to create user'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string | number, formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const response = await window.database.users.update(Number(id), formData);
      if (!response.success) throw new Error(response.error);
      
      setUsers(prev => prev.map(u => u.id === id ? response.data : u));
      toast.success(t('messages.userUpdated', 'User updated successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(t('messages.updateError', 'Failed to update user'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      
      const response = await window.database.users.delete(Number(id));
      if (!response.success) throw new Error(response.error);
      
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(t('messages.userDeleted', 'User deleted successfully'));
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(t('messages.deleteError', 'Failed to delete user'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      setLoading(true);
      
      await Promise.all(ids.map(id => window.database.users.delete(Number(id))));
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
      toast.success(t('messages.usersDeleted', '{{count}} users deleted successfully', { count: ids.length }));
    } catch (error) {
      console.error('Failed to delete users:', error);
      toast.error(t('messages.bulkDeleteError', 'Failed to delete users'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      const response = await window.database.users.getAll();
      if (!response.success) throw new Error(response.error);
      
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(t('messages.fetchError', 'Failed to load users'));
      toast.error(t('messages.fetchError', 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

  // Custom card renderer
  const cardRenderer = (user: User) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Role:</span>
          <div>{config.columns[1].render?.(user.role, user)}</div>
        </div>
        {user.phone && (
          <div>
            <span className="text-gray-500">Phone:</span>
            <div className="font-medium">{user.phone}</div>
          </div>
        )}
        <div>
          <span className="text-gray-500">Status:</span>
          <div>{config.columns[3].render?.(user.status, user)}</div>
        </div>
        {user.lastLoginAt && (
          <div>
            <span className="text-gray-500">Last Login:</span>
            <div className="font-medium">{config.columns[4].render?.(user.lastLoginAt, user)}</div>
          </div>
        )}
      </div>
      
      {user.address && (
        <p className="text-sm text-gray-600 line-clamp-2">{user.address}</p>
      )}
    </div>
  );

  return (
    <CrudPageTemplate
      // Core data
      data={users}
      loading={loading}
      error={error}
      
      // Entity configuration
      entityName="user"
      entityNamePlural="users"
      entityConfig={config.entityConfig}
      
      // Table configuration
      columns={config.columns}
      filterFields={config.filterFields}
      stats={stats}
      
      // Display options
      searchable={true}
      filterable={true}
      sortable={true}
      paginated={true}
      selectable={true}
      exportable={true}
      
      // View modes
      viewModes={['table', 'cards']}
      defaultViewMode="table"
      cardRenderer={cardRenderer}
      
      // Form configuration
      formFields={config.formFields}
      formSections={[
        {
          title: t('sections.basicInfo', 'Basic Information'),
          fields: ['name', 'email', 'phone']
        },
        {
          title: t('sections.roleAndStatus', 'Role & Status'),
          fields: ['role', 'status']
        },
        {
          title: t('sections.additionalInfo', 'Additional Information'),
          fields: ['address']
        }
      ]}
      
      // CRUD operations
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
      
      // Customization
      title={t('users.title', 'Users')}
      subtitle={t('users.subtitle', 'Manage system users and their roles')}
      
      // Advanced features
      enableAnalytics={true}
      idField="id"
      titleField="name"
      statusField="status"
      dateField="createdAt"
      
      // Configuration
      autoRefresh={true}
      refreshInterval={60000}
      preserveSelection={false}
      density="comfortable"
    />
  );
}
