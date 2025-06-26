import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { crudConfigurations, formatCurrency } from '../components/enhanced-crud-configs';
import { toast } from 'react-hot-toast';

interface Order {
  id: number;
  orderNumber: string;
  customerId?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  customer?: { name: string; email: string };
  itemsCount?: number;
}

export default function OrdersPage() {
  const { t } = useTranslation();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const config = crudConfigurations.orders;

  // Update form fields with customer options
  const formFields = useMemo(() => {
    const customerOptions = customers.map(c => ({
      value: c.id,
      label: `${c.name} (${c.email})`
    }));

    return config.formFields.map(field => {
      if (field.key === 'customerId') {
        return {
          ...field,
          options: customerOptions
        };
      }
      return field;
    });
  }, [customers, config.formFields]);

  // Enhanced statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / totalOrders : 0;

    return [
      {
        label: t('stats.totalOrders', 'Total Orders'),
        value: totalOrders,
        icon: config.entityConfig.icon,
        color: config.entityConfig.color,
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.pendingOrders', 'Pending Orders'),
        value: pendingOrders,
        icon: config.entityConfig.icon,
        color: 'text-yellow-600',
        format: 'number' as const,
        comparison: {
          value: totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0,
          label: t('stats.ofTotal', 'of total')
        }
      },
      {
        label: t('stats.totalRevenue', 'Total Revenue'),
        value: totalRevenue,
        icon: config.entityConfig.icon,
        color: 'text-green-600',
        format: 'currency' as const
      },
      {
        label: t('stats.avgOrderValue', 'Average Order Value'),
        value: avgOrderValue,
        icon: config.entityConfig.icon,
        color: 'text-indigo-600',
        format: 'currency' as const
      },
      {
        label: t('stats.confirmedOrders', 'Confirmed Orders'),
        value: confirmedOrders,
        icon: config.entityConfig.icon,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.deliveredOrders', 'Delivered Orders'),
        value: deliveredOrders,
        icon: config.entityConfig.icon,
        color: 'text-purple-600',
        format: 'number' as const
      }
    ];
  }, [orders, t, config]);

  // CRUD operations
  const handleAdd = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const orderData = {
        ...formData,
        total: parseFloat(formData.total) || 0,
        customerId: formData.customerId || null
      };

      const response = await window.database.orders.create(orderData);
      if (!response.success) throw new Error(response.error);
      
      setOrders(prev => [...prev, response.data]);
      toast.success(t('messages.orderCreated', 'Order created successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(t('messages.createError', 'Failed to create order'));
      throw error;
    } finally {  
      setLoading(false);
    }
  };

  const handleEdit = async (id: string | number, formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const orderData = {
        ...formData,
        total: parseFloat(formData.total) || 0,
        customerId: formData.customerId || null
      };

      const response = await window.database.orders.update(Number(id), orderData);
      if (!response.success) throw new Error(response.error);
      
      setOrders(prev => prev.map(o => o.id === id ? response.data : o));
      toast.success(t('messages.orderUpdated', 'Order updated successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error(t('messages.updateError', 'Failed to update order'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      
      const response = await window.database.orders.delete(Number(id));
      if (!response.success) throw new Error(response.error);
      
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success(t('messages.orderDeleted', 'Order deleted successfully'));
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error(t('messages.deleteError', 'Failed to delete order'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      setLoading(true);
      
      await Promise.all(ids.map(id => window.database.orders.delete(Number(id))));
      setOrders(prev => prev.filter(o => !ids.includes(o.id)));
      toast.success(t('messages.ordersDeleted', '{{count}} orders deleted successfully', { count: ids.length }));
    } catch (error) {
      console.error('Failed to delete orders:', error);
      toast.error(t('messages.bulkDeleteError', 'Failed to delete orders'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      const [ordersResponse, customersResponse] = await Promise.all([
        window.database.orders.getAll(),
        window.database.users.getAll()
      ]);
      
      if (!ordersResponse.success) throw new Error(ordersResponse.error);
      if (!customersResponse.success) throw new Error(customersResponse.error);
      
      setOrders(ordersResponse.data || []);
      setCustomers(customersResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(t('messages.fetchError', 'Failed to load orders'));
      toast.error(t('messages.fetchError', 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

  // Custom card renderer
  const cardRenderer = (order: Order) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-mono text-sm">
            #{order.orderNumber.slice(-3)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
            {order.customer && (
              <p className="text-sm text-gray-500">{order.customer.name}</p>
            )}
          </div>
        </div>
        {config.columns[4].render?.(order.status, order)}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Total:</span>
          <div className="font-semibold text-green-600">{formatCurrency(order.total)}</div>
        </div>
        <div>
          <span className="text-gray-500">Items:</span>
          <div className="font-medium">{order.itemsCount || 0}</div>
        </div>
        <div>
          <span className="text-gray-500">Payment:</span>
          <div>{config.columns[5].render?.(order.paymentStatus, order)}</div>
        </div>
        <div>
          <span className="text-gray-500">Order Date:</span>
          <div className="font-medium">{config.columns[6].render?.(order.orderDate, order)}</div>
        </div>
      </div>
      
      {order.paymentMethod && (
        <div className="text-sm">
          <span className="text-gray-500">Payment Method:</span>
          <span className="ml-2 capitalize">{order.paymentMethod.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  );

  return (
    <CrudPageTemplate
      // Core data
      data={orders}
      loading={loading}
      error={error}
      
      // Entity configuration
      entityName="order"
      entityNamePlural="orders"
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
      formFields={formFields}
      formSections={[
        {
          title: t('sections.orderInfo', 'Order Information'),
          fields: ['orderNumber', 'customerId', 'orderDate']
        },
        {
          title: t('sections.payment', 'Payment Details'),
          fields: ['total', 'paymentMethod', 'paymentStatus']
        },
        {
          title: t('sections.status', 'Order Status'),
          fields: ['status']
        }
      ]}
      
      // CRUD operations
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
      
      // Customization
      title={t('orders.title', 'Orders')}
      subtitle={t('orders.subtitle', 'Manage customer orders and transactions')}
      
      // Advanced features
      enableAnalytics={true}
      idField="id"
      titleField="orderNumber"
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