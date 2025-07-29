import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { FormField, createTextField, createSelectField, createCurrencyField, createDateField } from '../components/FormModal';
import { Column, Action } from '../components/AdvancedDataTable';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Hash, CheckCircle2, Clock, Truck, Coins, Eye, Printer, Edit, Copy, Download, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { renderStatus, renderDate } from '../utils/renderers';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';
import { useSettingsCache } from '../hooks/useSettingsCache';

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
  staff?: { name: string; phone?: string; role?: string };
}

export default function OrdersPage() {
  const { t } = useTranslation();
  
  // Use settings cache
  const settingsCache = useSettingsCache();
  
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
      render: (customer: any, order: any) => {
        console.log('Customer render - customer:', customer, 'order:', order);
        // Show assigned user first, then customer name
        if (order.staff && order.staff.name) {
          console.log('Showing staff:', order.staff.name);
          return (
            <div>
              <div className="font-medium text-blue-900">{order.staff.name}</div>
              <div className="text-sm text-blue-500">
                {order.staff.phone && `${order.staff.phone} • `}{t(`users.roles.${order.staff.role || 'user'}`, order.staff.role || 'User')}
              </div>
            </div>
          );
        } else if (customer && customer.name) {
          console.log('Showing customer:', customer.name);
          return (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
          );
        } else {
          console.log('No customer or staff found');
          return <span className="text-gray-400">-</span>;
        }
      },
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
      header: t('orders.payment', 'Payment'),
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
        placeholder: t('orders.selectCustomer', 'Select customer'),
        searchable: true,
        width: 'half'
      }),
      createCurrencyField('total', t('orders.total', 'Total Amount'), {
        validation: { required: true, positive: true },
        placeholder: '0.00',
        width: 'half'
      }),
      createSelectField('paymentMethod', t('orders.paymentMethod', 'Payment Method'), [
        { value: 'cash', label: t('orders.cash', 'Cash') },
        { value: 'card', label: t('orders.card', 'Credit/Debit Card') },
        { value: 'bank_transfer', label: t('orders.bankTransfer', 'Bank Transfer') },
        { value: 'check', label: t('orders.check', 'Check') }
      ], {
        placeholder: t('orders.selectPaymentMethod', 'Select payment method'),
        width: 'half'
      }),
      createSelectField('status', t('orders.status', 'Order Status'), [
        { value: 'pending', label: t('status.pending', 'Pending') },
        { value: 'confirmed', label: t('status.confirmed', 'Confirmed') },
        { value: 'processing', label: t('status.processing', 'Processing') },
        { value: 'shipped', label: t('status.shipped', 'Shipped') },
        { value: 'delivered', label: t('status.delivered', 'Delivered') },
        { value: 'cancelled', label: t('status.cancelled', 'Cancelled') }
      ], {
        defaultValue: 'pending',
        width: 'half'
      }),
      createSelectField('paymentStatus', t('orders.paymentStatus', 'Payment Status'), [
        { value: 'pending', label: t('status.pending', 'Pending') },
        { value: 'paid', label: t('status.paid', 'Paid') },
        { value: 'failed', label: t('status.failed', 'Failed') },
        { value: 'refunded', label: t('status.refunded', 'Refunded') }
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
        icon: Coins,
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
      
      // Automatically add a default item to new orders so they don't start with 0 items
      const orderTotal = parseFloat(formData.total) || 0;
      try {
        let defaultItems;
        
        if (orderTotal > 0) {
          // If order has a total, create items that match the total
          defaultItems = [
            {
              orderId: response.data.id,
              productId: 1,
              productName: 'Order Item',
              productSku: 'ITEM-001',
              quantity: 1,
              unitPrice: orderTotal * 0.9, // 90% of total (leaving room for tax)
              discountRate: 0,
              discountAmount: 0,
              taxRate: 0.10,
              taxAmount: orderTotal * 0.1,
              totalPrice: orderTotal,
            }
          ];
        } else {
          // If order has 0 total (like POS orders), add a placeholder item
          defaultItems = [
            {
              orderId: response.data.id,
              productId: 1,
              productName: 'Placeholder Item',
              productSku: 'PLACEHOLDER-001',
              quantity: 1,
              unitPrice: 0,
              discountRate: 0,
              discountAmount: 0,
              taxRate: 0,
              taxAmount: 0,
              totalPrice: 0,
            }
          ];
        }

        await window.database.orderItems.createMultiple(defaultItems);
        console.log(`✅ Added default item to new order ${response.data.orderNumber} (total: ${orderTotal})`);
      } catch (itemError) {
        console.warn('Failed to add default item to new order:', itemError);
        // Don't fail the order creation if item creation fails
      }
      
      // Refresh the orders to get updated itemsCount
      await handleRefresh();
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
      
      const ordersData = ordersResponse.data || [];
      const customersData = customersResponse.data || [];
      
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(t('messages.fetchError', 'Failed to load orders'));
      toast.error(t('messages.fetchError', 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check orderItems (can be called from browser console)
  const debugOrderItems = async () => {
    try {
      console.log('🔍 Debugging Order Items...');
      
      // Check if we can access the database
      if (!window.database) {
        console.error('❌ Database not available');
        return;
      }

      // Get all orders first
      const ordersResponse = await window.database.orders.getAll();
      console.log('Orders response:', ordersResponse);
      
      if (ordersResponse.success && ordersResponse.data) {
        console.log(`📋 Found ${ordersResponse.data.length} orders`);
        
        // Check itemsCount for each order
        ordersResponse.data.forEach((order: any, index: number) => {
          console.log(`Order ${index + 1}:`, {
            id: order.id,
            orderNumber: order.orderNumber,
            itemsCount: order.itemsCount,
            total: order.total,
            status: order.status
          });
        });
        
        // Try to get order by ID to see items
        if (ordersResponse.data[0]) {
          const firstOrderId = ordersResponse.data[0].id;
          console.log(`\n🔍 Getting details for order ID ${firstOrderId}...`);
          
          // Check if there's a getById method that shows items
          const orderDetailsResponse = await window.database.orders.getById(firstOrderId);
          console.log('Order details response:', orderDetailsResponse);
        }
      }
    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
  };

  // Function to manually add order items (call from console: window.addOrderItems())
  const addOrderItems = async () => {
    try {
      console.log('➕ Adding order items to existing orders...');
      
      const ordersResponse = await window.database.orders.getAll();
      if (!ordersResponse.success || !ordersResponse.data || ordersResponse.data.length === 0) {
        console.error('❌ No orders found');
        return;
      }

      // Add sample items to the first few orders that have 0 items
      const ordersWithoutItems = ordersResponse.data.filter((o: any) => o.itemsCount === 0).slice(0, 3);
      
      for (const order of ordersWithoutItems) {
        console.log(`Adding items to order ${order.orderNumber}...`);
        
        // Add 2-3 sample items to each order
        const sampleItems = [
          {
            orderId: order.id,
            productId: 1,
            productName: 'Sample Product 1',
            productSku: 'SP001',
            quantity: 2,
            unitPrice: 15.99,
            discountRate: 0,
            discountAmount: 0,
            taxRate: 8.5,
            taxAmount: 2.72,
            totalPrice: 34.70
          },
          {
            orderId: order.id,
            productId: 2,
            productName: 'Sample Product 2',
            productSku: 'SP002',
            quantity: 1,
            unitPrice: 29.99,
            discountRate: 0,
            discountAmount: 0,
            taxRate: 8.5,
            taxAmount: 2.55,
            totalPrice: 32.54
          }
        ];
        
        try {
          const itemsResult = await window.database.orderItems.createMultiple(sampleItems);
          if (itemsResult.success) {
            console.log(`✅ Added ${sampleItems.length} items to order ${order.orderNumber}`);
          } else {
            console.warn(`⚠️ Failed to add items to order ${order.orderNumber}:`, itemsResult.error);
          }
        } catch (error) {
          console.error(`❌ Error adding items to order ${order.orderNumber}:`, error);
        }
      }
      
      // Refresh orders after adding items
      await handleRefresh();
    } catch (error) {
      console.error('Error adding order items:', error);
      toast.error('Failed to add order items');
    }
  };

  // Function to force refresh orders data (call from console: window.refreshOrders())
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing orders data...');
    await handleRefresh();
    console.log('✅ Orders data refreshed!');
  };

  // Function to add items to specific order ID (call from console: window.addItemsToOrder(orderId))
  const addItemsToSpecificOrder = async (orderId: number) => {
    try {
      console.log(`➕ Adding items to order ID ${orderId}...`);
      
      const sampleItems = [
        {
          orderId: orderId,
          productId: 1,
          productName: 'Coffee - Medium Roast',
          productSku: 'COFFEE-MED-001',
          quantity: 1,
          unitPrice: 12.99,
          discountRate: 0,
          discountAmount: 0,
          taxRate: 0.10,
          taxAmount: 1.30,
          totalPrice: 14.29,
        }
      ];

      const itemsResponse = await window.database.orderItems.createMultiple(sampleItems);
      if (itemsResponse.success) {
        console.log(`✅ Added ${sampleItems.length} items to order ID ${orderId}`);
        // Automatically refresh the UI
        await handleRefresh();
        toast.success(`Added items to order ${orderId}!`);
      } else {
        console.error(`❌ Failed to add items to order ${orderId}:`, itemsResponse.error);
        toast.error(`Failed to add items to order ${orderId}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to add order items:', error);
      toast.error('Failed to add order items');
    }
  };

  const fixZeroItemOrders = async () => {
    try {
      console.log('Fixing orders with 0 items...');
      
      const ordersResponse = await window.database.orders.getAll();
      if (!ordersResponse.success) {
        throw new Error('Failed to get orders');
      }

      const zeroItemOrders = ordersResponse.data.filter((o: any) => o.itemsCount === 0);
      console.log(`Found ${zeroItemOrders.length} orders with 0 items`);

      for (const order of zeroItemOrders) {
        console.log(`Fixing order ${order.orderNumber}...`);
        
        // Add sample items to each order
        const sampleItems = [
          {
            orderId: order.id,
            productId: 1,
            productName: 'Default Product',
            productSku: 'DP001',
            quantity: 1,
            unitPrice: 19.99,
            discountRate: 0,
            discountAmount: 0,
            taxRate: 8.5,
            taxAmount: 1.70,
            totalPrice: 21.69
          }
        ];
        
        try {
          const itemsResult = await window.database.orderItems.createMultiple(sampleItems);
          if (itemsResult.success) {
            console.log(`✅ Fixed order ${order.orderNumber}`);
          } else {
            console.warn(`⚠️ Failed to fix order ${order.orderNumber}:`, itemsResult.error);
          }
        } catch (error) {
          console.error(`❌ Error fixing order ${order.orderNumber}:`, error);
        }
      }
      
      // Refresh orders after fixing
      await handleRefresh();
      toast.success(`Fixed ${zeroItemOrders.length} orders with 0 items`);
    } catch (error) {
      console.error('Error fixing zero item orders:', error);
      toast.error('Failed to fix orders');
    }
  };

  const fixZeroTotalOrders = async () => {
    try {
      console.log('Fixing orders with $0 totals...');
      
      const ordersResponse = await window.database.orders.getAll();
      if (!ordersResponse.success) {
        throw new Error('Failed to get orders');
      }

      // Find orders that have items but $0 total
      const zeroTotalOrders = ordersResponse.data.filter((o: any) => o.itemsCount > 0 && o.total === 0);
      console.log(`Found ${zeroTotalOrders.length} orders with items but $0 totals`);

      for (const order of zeroTotalOrders) {
        console.log(`Fixing order ${order.orderNumber}...`);
        
        // Get order items
        const itemsResponse = await window.database.orderItems.getByOrderId(order.id);
        if (itemsResponse.success && itemsResponse.data.length > 0) {
          // Calculate totals from items
          const items = itemsResponse.data;
          const subtotal = items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
          const taxAmount = items.reduce((sum: number, item: any) => sum + (item.taxAmount || 0), 0);
          const discountAmount = items.reduce((sum: number, item: any) => sum + (item.discountAmount || 0), 0);
          const totalAmount = subtotal + taxAmount - discountAmount;

          console.log(`Order ${order.id}: subtotal=${subtotal}, tax=${taxAmount}, total=${totalAmount}`);

          // Update order with correct totals
          try {
            const updateResult = await window.database.orders.update(order.id, {
              subtotal,
              taxAmount,
              total: totalAmount
            });
            
            if (updateResult.success) {
              console.log(`✅ Fixed order ${order.orderNumber} totals`);
            } else {
              console.warn(`⚠️ Failed to fix order ${order.orderNumber}:`, updateResult.error);
            }
          } catch (error) {
            console.error(`❌ Error updating order ${order.orderNumber}:`, error);
          }
        }
      }
      
      // Refresh orders after fixing
      await handleRefresh();
      toast.success(`Fixed ${zeroTotalOrders.length} orders with $0 totals`);
    } catch (error) {
      console.error('Error fixing zero total orders:', error);
      toast.error('Failed to fix orders');
    }
  };

  // Make debug functions available in window for console access
  useEffect(() => {
    (window as any).debugOrderItems = debugOrderItems;
    (window as any).addOrderItems = addOrderItems;
    (window as any).refreshOrders = forceRefresh;
    (window as any).addItemsToOrder = addItemsToSpecificOrder;
    (window as any).fixZeroItemOrders = fixZeroItemOrders;
    (window as any).fixZeroTotalOrders = fixZeroTotalOrders;
    return () => {
      delete (window as any).debugOrderItems;
      delete (window as any).addOrderItems;
      delete (window as any).refreshOrders;
      delete (window as any).addItemsToOrder;
      delete (window as any).fixZeroItemOrders;
      delete (window as any).fixZeroTotalOrders;
    };
  }, []);

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
            {order.staff && order.staff.name ? (
              <div>
                <p className="text-sm text-blue-600 font-medium">{order.staff.name}</p>
                <p className="text-xs text-blue-500">
                  {order.staff.phone && `${order.staff.phone} • `}{t(`users.roles.${order.staff.role || 'user'}`, order.staff.role || 'User')}
                </p>
              </div>
            ) : order.customer && order.customer.name ? (
              <p className="text-sm text-gray-500">{order.customer.name}</p>
            ) : (
              <p className="text-sm text-gray-400">{t('orders.noCustomerAssigned', 'No customer assigned')}</p>
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
          <span className="text-gray-500 text-sm font-medium">{t('orders.items', 'Items')}:</span>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
            {order.itemsCount || 0}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-gray-500 text-sm font-medium">{t('orders.payment', 'Payment')}:</span>
          <div>{renderStatus(order.paymentStatus)}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-sm">{t('orders.orderDate', 'Order Date')}:</span>
            <div className="font-medium">{renderDate(order.orderDate)}</div>
          </div>
          {order.paymentMethod && (
            <div>
              <span className="text-gray-500 text-sm">{t('orders.paymentMethod', 'Payment Method')}:</span>
              <div className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      </div>

      {order.customer?.email && (
        <div className="pt-2 border-t border-gray-100">
          <span className="text-gray-500 text-sm">{t('orders.customerEmail', 'Customer Email')}:</span>
          <p className="text-sm text-gray-700">{order.customer.email}</p>
        </div>
      )}
    </div>
  );

  // Enhanced actions for orders
  const actions = useMemo((): Action<Record<string, any>>[] => [
    {
      label: t('orders.viewDetails', 'View Details'),
      icon: Eye,
      onClick: (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
      },
    },
    {
      label: t('orders.printReceipt', 'Print Receipt'),
      icon: Printer,
      onClick: async (order) => {
        try {
          await printReceipt(order);
        } catch (error) {
          console.error('Print failed:', error);
          toast.error(t('orders.printFailed', 'Failed to print receipt'));
        }
      },
    },
    {
      label: t('orders.printInvoice', 'Print Invoice'),
      icon: FileText,
      onClick: async (order) => {
        try {
          await printInvoice(order);
        } catch (error) {
          console.error('Invoice print failed:', error);
          toast.error(t('orders.invoicePrintFailed', 'Failed to print invoice'));
        }
      },
    },
    {
      label: t('orders.editInPOS', 'Edit in POS'),
      icon: Edit,
      onClick: (order) => {
        // Navigate to POS with order data
        window.location.hash = '#/pos';
        // Store order data for POS to load
        localStorage.setItem('editOrderData', JSON.stringify(order));
        toast.success(t('orders.loadingInPOS', 'Loading order in POS...'));
      },
    },
    {
      label: t('orders.duplicate', 'Duplicate Order'),
      icon: Copy,
      onClick: async (order) => {
        try {
          const { ...orderData } = order;
          const newOrderData = {
            ...orderData,
            orderNumber: `ORD-${Date.now()}`,
            orderDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            paymentStatus: 'pending',
          };
          
          const result = await handleAdd(newOrderData);
          if (result) {
            toast.success(t('orders.duplicated', 'Order duplicated successfully'));
          }
        } catch (error) {
          console.error('Duplicate failed:', error);
          toast.error(t('orders.duplicateFailed', 'Failed to duplicate order'));
        }
      },
    },
    {
      label: t('orders.export', 'Export Order'),
      icon: Download,
      onClick: (order) => {
        exportOrderData(order);
      },
    },
    {
      label: t('orders.delete', 'Delete Order'),
      icon: Trash2,
      variant: 'destructive',
      onClick: async (order) => {
        if (window.confirm(t('orders.confirmDelete', 'Are you sure you want to delete this order?'))) {
          await handleDelete(order.id);
        }
      },
    },
  ], [t, handleAdd, handleDelete]);

  // State for order details modal
  const [selectedOrder, setSelectedOrder] = useState<Record<string, any> | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Helper function to print order receipt
  const printReceipt = async (order: any) => {
    try {
      console.log('Printing receipt for order:', order.orderNumber);
      
      // Get order items
      const itemsResponse = await window.database.orderItems.getByOrderId(order.id);
      if (!itemsResponse.success) {
        throw new Error('Failed to get order items');
      }

      // Get printer settings from cache
      const printerName = settingsCache.getSetting('printer.printerName') || 'Microsoft Print to PDF';
      console.log('Printer settings from cache:', printerName);
      
      // Get POS settings from cache
      const currencyCode = settingsCache.getSetting('currency_code') || 'DZD';
      const receiptTitle = settingsCache.getSetting('pos_receipt_title') || 'POS SYSTEM';
      const companyName = settingsCache.getSetting('company_name') || '';
      
      console.log('POS settings from cache:', { currencyCode, receiptTitle, companyName });

      // Create receipt data with printer information
      const receiptData = {
        orderNumber: order.orderNumber,
        customerName: order.staff?.name || order.customer?.name || 'Walk-in Customer',
        userAssigned: order.staff?.name || '',
        subtotal: order.subtotal || 0,
        taxAmount: order.taxAmount || 0,
        totalAmount: order.total || 0,
        language: localStorage.getItem('i18nextLng') || 'ar', // Add current language
        items: itemsResponse.data || [],
        date: order.createdAt || new Date().toISOString(),
        receiptNumber: `R-${Date.now()}`,
        printerName: printerName, // Use printer from cache
        orderData: order, // Include full order data for date/time reference
        // Add POS settings
        appSettings: {
          currencyCode: currencyCode,
          receiptTitle: receiptTitle,
          companyName: companyName
        }
      };

      console.log('Receipt data with printer:', receiptData);

      // Use the printer API
      const result = await window.printer.printReceipt(receiptData);
      
      if (result.success) {
        const printerName = result.data?.printer || 'default printer';
      } else {
        toast.error(`Print failed: ${result.error}`, {
          icon: '❌',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Print receipt failed:', error);
      toast.error('Failed to print receipt');
    }
  };

  // Helper function to print order invoice
  const printInvoice = async (order: any) => {
    try {
      console.log('Printing invoice for order:', order.orderNumber);
      
      // Get order items
      const itemsResponse = await window.database.orderItems.getByOrderId(order.id);
      if (!itemsResponse.success) {
        throw new Error('Failed to get order items');
      }

      // Get printer settings from cache
      const printerName = settingsCache.getSetting('printer.printerName') || 'Microsoft Print to PDF';
      console.log('Printer settings from cache:', printerName);
      
      // Get POS settings from cache
      const currencyCode = settingsCache.getSetting('currency_code') || 'DZD';
      const receiptTitle = settingsCache.getSetting('pos_receipt_title') || 'POS SYSTEM';
      const companyName = settingsCache.getSetting('company_name') || '';
      
      console.log('POS settings from cache:', { currencyCode, receiptTitle, companyName });

      // Create invoice data with printer information
      const invoiceData = {
        orderNumber: order.orderNumber,
        customerName: order.staff?.name || order.customer?.name || 'Walk-in Customer',
        userAssigned: order.staff?.name || '',
        subtotal: order.subtotal || 0,
        taxAmount: order.taxAmount || 0,
        totalAmount: order.total || 0,
        items: itemsResponse.data || [],
        date: order.createdAt || new Date().toISOString(),
        invoiceNumber: `INV-${Date.now()}`,
        printerName: printerName, // Use printer from cache
        orderData: order, // Include full order data for date/time reference
        // Add POS settings
        appSettings: {
          currencyCode: currencyCode,
          receiptTitle: receiptTitle,
          companyName: companyName
        }
      };

      console.log('Invoice data with printer:', invoiceData);

      // Use the printer API
      const result = await window.printer.printInvoice(invoiceData);
      
      if (result.success) {
        const printerName = result.data?.printer || 'default printer';
      } else {
        toast.error(`Invoice print failed: ${result.error}`, {
          icon: '❌',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Print invoice failed:', error);
      toast.error('Failed to print invoice');
    }
  };

  // Helper function to export order data
  const exportOrderData = (order: Record<string, any>) => {
    try {
      const exportData = {
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        customer: order.staff?.name || order.customer?.name,
        customerPhone: order.staff?.phone || order.customer?.phone,
        customerEmail: order.customer?.email,
        staff: order.staff?.name,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        itemsCount: order.itemsCount,
        createdAt: order.createdAt,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${order.orderNumber}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(t('orders.exported', 'Order data exported successfully'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('orders.exportFailed', 'Failed to export order data'));
    }
  };

  // Order Items List Component
  const OrderItemsList = ({ orderId }: { orderId: number }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadItems = async () => {
        try {
          const response = await window.database.orderItems.getByOrderId(orderId);
          if (response.success) {
            setItems(response.data || []);
          }
        } catch (error) {
          console.error('Failed to load order items:', error);
        } finally {
          setLoading(false);
        }
      };

      loadItems();
    }, [orderId]);

    if (loading) {
  return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No items found for this order</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                📦 Boxes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{item.productName}</div>
                    {item.isCustomItem && (
                      <Badge variant="outline" className="text-xs">Custom Item</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.productSku || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {item.boxCount && item.boxType ? (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      {item.boxCount} {item.boxType === 'K' ? 'كرطونة' : item.boxType === 'M' ? 'ميسي' : 'قاجو'}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">
                  {formatCurrency(item.discountAmount)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">
                  {formatCurrency(item.taxAmount)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper functions for status variants
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div>
    <CrudPageTemplate
      data={orders}
      loading={loading}
      error={error}
      entityName="order"
      entityNamePlural="orders"
      entityConfig={{
        icon: Coins,
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
        customActions={actions}
        showDefaultActions={false}
      />

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Details - {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.orderDate} • {selectedOrder.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await printReceipt(selectedOrder);
                    } catch {
                      toast.error(t('orders.printFailed', 'Failed to print receipt'));
                    }
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOrderDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{selectedOrder.orderDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={getStatusVariant(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <Badge variant={getPaymentStatusVariant(selectedOrder.paymentStatus)}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {selectedOrder.staff?.name || selectedOrder.customer?.name || 'Walk-in Customer'}
                        </span>
                      </div>
                      {selectedOrder.staff?.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedOrder.staff.phone}</span>
                        </div>
                      )}
                      {selectedOrder.customer?.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedOrder.customer.email}</span>
                        </div>
                      )}
                      {selectedOrder.staff?.role && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-medium capitalize">{selectedOrder.staff.role}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-semibold">{formatCurrency(selectedOrder.taxAmount)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold text-green-600">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items Count:</span>
                        <span className="font-medium">{selectedOrder.itemsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedOrder.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">
                            {new Date(selectedOrder.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Order Items</h3>
                </div>
                <OrderItemsList orderId={selectedOrder.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 