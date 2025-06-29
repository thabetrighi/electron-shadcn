import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { FormField, createTextField, createSelectField, createCurrencyField, createDateField } from '../components/FormModal';
import { Column } from '../components/AdvancedDataTable';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Hash, CheckCircle2, Clock, XCircle, Truck, DollarSign, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { renderStatus, renderDate } from '../utils/renderers';

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

  // Enhanced columns configuration with translations
  const columns: Column<Record<string, any>>[] = useMemo(() => [
    {
      key: 'orderNumber',
      header: t('orders.orderNumber', 'Order Number'),
      sortable: true,
      filterable: true,
      searchable: true,
      exportable: true,
      sticky: true,
      width: '150px',
      render: (orderNumber: string) => (
        <div className="flex items-center space-x-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="font-mono font-medium text-blue-600">{orderNumber}</span>
        </div>
      )
    },
    {
      key: 'customer',
      header: t('orders.customer', 'Customer'),
      render: (customer: any) => customer ? (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
      ) : <span className="text-gray-400">-</span>,
      filterable: true,
      exportable: true
    },
    {
      key: 'total',
      header: t('orders.total', 'Total'),
      render: (total: number) => (
        <span className="font-semibold text-green-600 text-lg">
          {formatCurrency(total)}
        </span>
      ),
      sortable: true,
      type: 'currency',
      exportable: true,
      align: 'right'
    },
    {
      key: 'itemsCount',
      header: t('orders.items', 'Items'),
      render: (count: number) => (
        <div className="flex items-center justify-center">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {count || 0}
          </span>
        </div>
      ),
      sortable: true,
      type: 'number',
      exportable: true,
      align: 'center'
    },
    {
      key: 'status',
      header: t('orders.status', 'Order Status'),
      render: renderStatus,
      sortable: true,
      filterable: true,
      exportable: true
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: renderStatus,
      sortable: true,
      filterable: true,
      exportable: true
    },
    {
      key: 'orderDate',
      header: t('orders.date', 'Order Date'),
      render: renderDate,
      sortable: true,
      type: 'date',
      exportable: true
    }
  ], [t]);

  // Form fields with dynamic customer options and translations
  const formFields = useMemo((): FormField[] => {
    const customerOptions = customers.map(c => ({
      value: c.id,
      label: `${c.name} (${c.email})`
    }));

    return [
      createTextField('orderNumber', t('orders.orderNumber', 'Order Number'), {
        validation: { required: true },
        placeholder: 'ORD-001',
        width: 'half'
      }),
      createSelectField('customerId', t('orders.customer', 'Customer'), customerOptions, {
        validation: { required: true },
        placeholder: 'Select customer',
        searchable: true,
        width: 'half'
      }),
      createCurrencyField('total', t('orders.total', 'Total Amount'), {
        validation: { required: true, positive: true },
        placeholder: '0.00',
        width: 'half'
      }),
      createSelectField('paymentMethod', 'Payment Method', [
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Credit/Debit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'check', label: 'Check' }
      ], {
        placeholder: 'Select payment method',
        width: 'half'
      }),
      createSelectField('status', t('orders.status', 'Order Status'), [
        { value: 'pending', label: t('status.pending', 'Pending') },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: t('status.cancelled', 'Cancelled') }
      ], {
        defaultValue: 'pending',
        width: 'half'
      }),
      createSelectField('paymentStatus', 'Payment Status', [
        { value: 'pending', label: t('status.pending', 'Pending') },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ], {
        defaultValue: 'pending',
        width: 'half'
      }),
      createDateField('orderDate', t('orders.date', 'Order Date'), {
        validation: { required: true },
        defaultValue: new Date().toISOString().split('T')[0],
        width: 'half'
      })
    ];
  }, [customers, t]);

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
        icon: ShoppingCart,
        color: 'text-purple-600',
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.pendingOrders', 'Pending Orders'),
        value: pendingOrders,
        icon: Clock,
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
        icon: DollarSign,
        color: 'text-green-600',
        format: 'currency' as const
      },
      {
        label: t('stats.avgOrderValue', 'Average Order Value'),
        value: avgOrderValue,
        icon: ShoppingCart,
        color: 'text-indigo-600',
        format: 'currency' as const
      },
      {
        label: t('stats.confirmedOrders', 'Confirmed Orders'),
        value: confirmedOrders,
        icon: CheckCircle2,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.deliveredOrders', 'Delivered Orders'),
        value: deliveredOrders,
        icon: Truck,
        color: 'text-purple-600',
        format: 'number' as const
      }
    ];
  }, [orders, t]);

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

  // Enhanced card renderer
  const cardRenderer = (order: Record<string, any>) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-lg text-blue-600">{order.orderNumber}</h3>
            </div>
            {order.customer && (
              <p className="text-sm text-gray-500">{order.customer.name}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(order.total)}
          </div>
          <div className="space-x-1">
            {renderStatus(order.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-gray-500 text-sm font-medium">Items:</span>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
            {order.itemsCount || 0}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-gray-500 text-sm font-medium">Payment:</span>
          <div>{renderStatus(order.paymentStatus)}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-sm">Order Date:</span>
            <div className="font-medium">{renderDate(order.orderDate)}</div>
          </div>
          {order.paymentMethod && (
            <div>
              <span className="text-gray-500 text-sm">Payment Method:</span>
              <div className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      </div>

      {order.customer?.email && (
        <div className="pt-2 border-t border-gray-100">
          <span className="text-gray-500 text-sm">Customer Email:</span>
          <p className="text-sm text-gray-700">{order.customer.email}</p>
        </div>
      )}
    </div>
  );

  return (
    <CrudPageTemplate
      data={orders}
      loading={loading}
      error={error}
      entityName="order"
      entityNamePlural="orders"
      entityConfig={{
        icon: ShoppingCart,
        color: "text-purple-600",
        description: t("pages.ordersSubtitle", "Manage customer orders and transactions"),
        category: "sales",
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
      title={t("pages.orders", "Orders")}
      subtitle={t("pages.ordersSubtitle", "Manage customer orders and transactions")}
    />
  );
} 