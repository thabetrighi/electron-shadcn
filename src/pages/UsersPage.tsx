import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { FormField, createTextField, createSelectField, createEmailField, createTextareaField } from '../components/FormModal';
import { Column } from '../components/AdvancedDataTable';
import { Badge } from '../components/ui/badge';
import { Users, Phone, Mail, CheckCircle2, Clock, Archive, XCircle, Crown, UserCheck, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { renderStatus, renderUserRole, renderPhone, renderEmail, renderDateTime, renderDate } from '../utils/renderers';

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

// Users columns configuration
const usersColumns: Column<Record<string, any>>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '250px',
    render: (name: string, user: Record<string, any>) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    )
  },
  {
    key: 'role',
    header: 'Role',
    render: renderUserRole,
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'phone',
    header: 'Phone',
    render: renderPhone,
    exportable: true
  },
  {
    key: 'status',
    header: 'Status',
    render: renderStatus,
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'lastLoginAt',
    header: 'Last Login',
    render: (date: string) => date ? renderDateTime(date) : <span className="text-gray-400">Never</span>,
    sortable: true,
    type: 'date',
    exportable: true
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: renderDate,
    sortable: true,
    type: 'date',
    exportable: true
  }
];

// Form fields configuration
const usersFormFields: FormField[] = [
  createTextField('name', 'Full Name', {
    validation: { required: true, minLength: 2, maxLength: 100 },
    placeholder: 'Enter full name',
    width: 'full'
  }),
  createEmailField('email', 'Email Address', {
    validation: { required: false, email: true },
    placeholder: 'user@example.com',
    width: 'half'
  }),
  createTextField('phone', 'Phone Number', {
    placeholder: '+1 (555) 123-4567',
    width: 'half'
  }),
  createSelectField('role', 'Role', [
    { value: 'client', label: 'Client' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'admin', label: 'Administrator' }
  ], {
    defaultValue: 'client',
    width: 'half'
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], {
    defaultValue: 'active',
    width: 'half'
  }),
  createTextareaField('address', 'Address', {
    rows: 3,
    placeholder: 'Enter full address (optional)',
    width: 'full'
  })
];

export default function UsersPage() {
  const { t } = useTranslation();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Enhanced columns configuration with translations
  const columns: Column<Record<string, any>>[] = useMemo(() => [
    {
      key: 'name',
      header: t('users.name', 'Name'),
      sortable: true,
      filterable: true,
      searchable: true,
      exportable: true,
      sticky: true,
      width: '250px',
      render: (name: string, user: Record<string, any>) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
            {name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: t('users.role', 'Role'),
      render: renderUserRole,
      sortable: true,
      filterable: true,
      exportable: true
    },
    {
      key: 'phone',
      header: t('users.phone', 'Phone'),
      render: renderPhone,
      exportable: true
    },
    {
      key: 'status',
      header: t('users.status', 'Status'),
      render: renderStatus,
      sortable: true,
      filterable: true,
      exportable: true
    },
    {
      key: 'lastLoginAt',
      header: t('users.lastLogin', 'Last Login'),
      render: (date: string) => date ? renderDateTime(date) : <span className="text-gray-400">{t('never', 'Never')}</span>,
      sortable: true,
      type: 'date',
      exportable: true
    },
    {
      key: 'createdAt',
      header: t('users.created', 'Created'),
      render: renderDate,
      sortable: true,
      type: 'date',
      exportable: true
    }
  ], [t]);

  // Form fields configuration with translations
  const formFields: FormField[] = useMemo(() => [
    createTextField('name', t('users.name', 'Full Name'), {
      validation: { required: true, minLength: 2, maxLength: 100 },
      placeholder: t('users.namePlaceholder', 'Enter full name'),
      width: 'full'
    }),
    createEmailField('email', t('users.email', 'Email Address'), {
      validation: { required: true, email: true },
      placeholder: t('users.emailPlaceholder', 'Enter email address'),
      width: 'half'
    }),
    createTextField('phone', t('users.phone', 'Phone Number'), {
      placeholder: t('users.phonePlaceholder', 'Enter phone number'),
      width: 'half'
    }),
    createSelectField('role', t('users.role', 'Role'), [
      { value: 'client', label: 'Client' },
      { value: 'supplier', label: 'Supplier' },
      { value: 'admin', label: 'Administrator' }
    ], {
      placeholder: t('users.selectRole', 'Select user role'),
      defaultValue: 'client',
      width: 'half'
    }),
    createSelectField('status', t('users.status', 'Status'), [
      { value: 'active', label: t('status.active', 'Active') },
      { value: 'inactive', label: t('status.inactive', 'Inactive') }
    ], {
      defaultValue: 'active',
      width: 'half'
    }),
    createTextareaField('address', t('users.address', 'Address'), {
      rows: 3,
      placeholder: t('users.addressPlaceholder', 'Enter full address (optional)'),
      width: 'full'
    })
  ], [t]);

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
        icon: Users,
        color: 'text-green-600',
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.activeUsers', 'Active Users'),
        value: activeUsers,
        icon: Users,
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
        icon: Crown,
        color: 'text-purple-600',
        format: 'number' as const
      },
      {
        label: t('stats.clients', 'Clients'),
        value: clientUsers,
        icon: UserCheck,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.suppliers', 'Suppliers'),
        value: supplierUsers,
        icon: Building,
        color: 'text-orange-600',
        format: 'number' as const
      }
    ];
  }, [users, t]);

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

  // Enhanced card renderer
  const cardRenderer = (user: Record<string, any>) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          {renderStatus(user.status)}
          {renderUserRole(user.role)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {user.phone && (
          <div className="space-y-1">
            <span className="text-gray-500 text-sm font-medium">Phone:</span>
            <div>{renderPhone(user.phone)}</div>
          </div>
        )}
        {user.lastLoginAt && (
          <div className="space-y-1">
            <span className="text-gray-500 text-sm font-medium">Last Login:</span>
            <div className="text-sm">{renderDateTime(user.lastLoginAt)}</div>
          </div>
        )}
      </div>

      {user.address && (
        <div className="pt-3 border-t border-gray-100">
          <span className="text-gray-500 text-sm font-medium">Address:</span>
          <p className="mt-1 text-sm text-gray-700 line-clamp-2">{user.address}</p>
        </div>
      )}

      <div className="pt-2 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Member since</span>
          <span>{renderDate(user.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CrudPageTemplate
      data={users}
      loading={loading}
      error={error}
      entityName="user"
      entityNamePlural="users"
      entityConfig={{
        icon: Users,
        color: "text-green-600",
        description: t("pages.usersSubtitle", "Manage system users and their roles"),
        category: "administration",
      }}
              columns={columns}
        stats={stats}
        formFields={formFields}
      cardRenderer={cardRenderer}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
    />
  );
}
