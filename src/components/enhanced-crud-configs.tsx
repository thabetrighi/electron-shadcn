import React from 'react';
import { Column, Action, BulkAction, Stats, FilterField } from './AdvancedDataTable';
import { FormField, createTextField, createNumberField, createSelectField, createTextareaField, createEmailField, createPasswordField, createDateField, createCheckboxField, createCurrencyField } from './FormModal';
import { Badge } from './ui/badge';
import { 
  Users, 
  Archive, 
  Target, 
  ShoppingCart,
  Package,
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  UserCheck,
  UserX,
  Crown,
  Building,
  Truck,
  DollarSign,
  Activity,
  TrendingUp,
  AlertCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  CreditCard,
  FileText
} from 'lucide-react';

// Enhanced utility functions with dynamic currency support
export const formatCurrency = (amount: number, currency = 'USD', locale?: string) => {
  try {
    // Auto-detect currency from user's locale if not specified
    if (currency === 'USD' && !locale) {
      const userLocale = navigator.language || 'en-US';
      if (userLocale.startsWith('en-GB') || userLocale.startsWith('en-UK')) currency = 'GBP';
      else if (userLocale.startsWith('fr') || userLocale.startsWith('de') || userLocale.startsWith('es') || userLocale.startsWith('it')) currency = 'EUR';
      else if (userLocale.startsWith('ar')) currency = 'SAR';
    }
    
    return new Intl.NumberFormat(locale || navigator.language || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  } catch (error) {
    // Fallback to USD if currency is not supported
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }
};

// Enhanced number formatting
const formatNumber = (value: number, locale?: string) => {
  return new Intl.NumberFormat(locale || navigator.language || 'en-US').format(value || 0);
};

// Enhanced percentage formatting
export const formatPercentage = (value: number, locale?: string) => {
  return new Intl.NumberFormat(locale || navigator.language || 'en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format((value || 0) / 100);
};

// Currency symbol getter
export const getCurrencySymbol = (currency = 'USD') => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  return symbols[currency] || currency;
};

// Enhanced rendering with better styling
export const renderCurrency = (amount: number, currency = 'USD', className?: string) => (
  <span className={`font-semibold text-green-600 ${className || ''}`}>
    {formatCurrency(amount, currency)}
  </span>
);

export const renderStock = (stock: number, lowStockThreshold = 10, className?: string) => (
  <div className={`flex items-center space-x-2 ${className || ''}`}>
    <span className={`font-medium ${
      stock <= 0 ? 'text-red-600' : 
      stock <= lowStockThreshold ? 'text-yellow-600' : 
      'text-green-600'
    }`}>
      {formatNumber(stock)}
    </span>
    {stock <= 0 && <Badge variant="destructive" className="text-xs">Out</Badge>}
    {stock > 0 && stock <= lowStockThreshold && <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">Low</Badge>}
  </div>
);

export const renderStatus = (status: string) => {
  if (!status) return <span className="text-gray-400">-</span>;
  
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    inactive: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock },
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    archived: { color: 'bg-red-100 text-red-800 border-red-200', icon: Archive },
    deleted: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
    processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity },
    shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: DollarSign },
    failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    refunded: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Activity }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const renderUserRole = (role: string) => {
  if (!role) return <span className="text-gray-400">-</span>;
  
  const roleConfig = {
    admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Crown },
    client: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck },
    supplier: { color: 'bg-green-100 text-green-800 border-green-200', icon: Building }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.client;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

export const renderDate = (date: string | Date) => {
  if (!date) return <span className="text-gray-400">-</span>;
  return (
    <span className="text-gray-900">
      {new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </span>
  );
};

export const renderDateTime = (date: string | Date) => {
  if (!date) return <span className="text-gray-400">-</span>;
  return (
    <span className="text-gray-900">
      {new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </span>
  );
};

export const renderPhone = (phone: string) => {
  if (!phone) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex items-center">
      <Phone className="w-3 h-3 mr-1 text-gray-400" />
      <span className="font-mono text-sm">{phone}</span>
    </div>
  );
};

export const renderEmail = (email: string) => {
  if (!email) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex items-center">
      <Mail className="w-3 h-3 mr-1 text-gray-400" />
      <span className="text-sm">{email}</span>
    </div>
  );
};

// ===== USERS CONFIGURATION =====
export interface User {
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

export const usersColumns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '200px',
    render: (name: string, user: User) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
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

export const usersFormFields: FormField[] = [
  createTextField('name', 'Full Name', {
    validation: { required: true, minLength: 2, maxLength: 100 },
    placeholder: 'Enter full name',
    width: 'full'
  }),
  createEmailField('email', 'Email Address', {
    validation: { required: true, email: true },
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

export const usersFilterFields: FilterField[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'multiselect',
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'client', label: 'Client' },
      { value: 'supplier', label: 'Supplier' }
    ]
  },
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  {
    key: 'createdAt',
    label: 'Registration Date',
    type: 'daterange'
  },
  {
    key: 'lastLoginAt',
    label: 'Last Login',
    type: 'daterange'
  }
];

// ===== CATEGORIES CONFIGURATION =====
export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description?: string;
  parentId?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  parent?: { name: string };
  productsCount?: number;
}

export const categoriesColumns: Column<Category>[] = [
  {
    key: 'name',
    header: 'Category Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '250px',
    render: (name: string, category: Category) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm">
          <Archive className="w-4 h-4" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          {category.parent && (
            <div className="text-sm text-gray-500">Under: {category.parent.name}</div>
          )}
        </div>
      </div>
    )
  },
  {
    key: 'nameEn',
    header: 'English Name',
    exportable: true
  },
  {
    key: 'productsCount',
    header: 'Products',
    render: (count: number) => (
      <div className="flex items-center">
        <Package className="w-4 h-4 mr-1 text-gray-400" />
        <span className="font-medium">{count || 0}</span>
      </div>
    ),
    sortable: true,
    type: 'number',
    exportable: true,
    align: 'center'
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
    key: 'createdAt',
    header: 'Created',
    render: renderDate,
    sortable: true,
    type: 'date',
    exportable: true
  }
];

export const categoriesFormFields: FormField[] = [
  createTextField('name', 'Category Name', {
    validation: { required: true, minLength: 2, maxLength: 100 },
    placeholder: 'Enter category name',
    width: 'full'
  }),
  createTextField('nameEn', 'English Name', {
    placeholder: 'Enter English name',
    width: 'half'
  }),
  createTextField('nameFr', 'French Name', {
    placeholder: 'Enter French name',
    width: 'half'
  }),
  createTextField('nameAr', 'Arabic Name', {
    placeholder: 'Enter Arabic name',
    width: 'half'
  }),
  createSelectField('parentId', 'Parent Category', [], {
    placeholder: 'Select parent category (optional)',
    searchable: true,
    clearable: true,
    width: 'half'
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], {
    defaultValue: 'active',
    width: 'half'
  }),
  createTextareaField('description', 'Description', {
    rows: 3,
    placeholder: 'Enter category description (optional)',
    width: 'full'
  })
];

// ===== UNITS CONFIGURATION =====
export interface Unit {
  id: number;
  name: string;
  nameEn?: string;
  symbol: string;
  type: 'piece' | 'weight' | 'volume' | 'length';
  conversionRate: number;
  baseUnitId?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  baseUnit?: { name: string; symbol: string };
}

export const unitsColumns: Column<Unit>[] = [
  {
    key: 'name',
    header: 'Unit Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '200px',
    render: (name: string, unit: Unit) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-mono">
          {unit.symbol}
        </div>
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500 capitalize">{unit.type}</div>
        </div>
      </div>
    )
  },
  {
    key: 'symbol',
    header: 'Symbol',
    render: (symbol: string) => (
      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{symbol}</span>
    ),
    exportable: true
  },
  {
    key: 'type',
    header: 'Type',
    render: (type: string) => (
      <span className="capitalize text-gray-700">{type}</span>
    ),
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'conversionRate',
    header: 'Conversion Rate',
    render: (rate: number) => (
      <span className="font-mono">{rate}</span>
    ),
    sortable: true,
    type: 'number',
    exportable: true,
    align: 'right'
  },
  {
    key: 'baseUnit',
    header: 'Base Unit',
    render: (baseUnit: any) => baseUnit ? `${baseUnit.name} (${baseUnit.symbol})` : '-',
    exportable: true
  },
  {
    key: 'status',
    header: 'Status',
    render: renderStatus,
    sortable: true,
    filterable: true,
    exportable: true
  }
];

export const unitsFormFields: FormField[] = [
  createTextField('name', 'Unit Name', {
    validation: { required: true, minLength: 1, maxLength: 50 },
    placeholder: 'Enter unit name',
    width: 'half'
  }),
  createTextField('nameEn', 'English Name', {
    placeholder: 'Enter English name',
    width: 'half'
  }),
  createTextField('symbol', 'Symbol', {
    validation: { required: true, maxLength: 10 },
    placeholder: 'Enter unit symbol (e.g., kg, m, L)',
    width: 'half'
  }),
  createSelectField('type', 'Type', [
    { value: 'piece', label: 'Piece' },
    { value: 'weight', label: 'Weight' },
    { value: 'volume', label: 'Volume' },
    { value: 'length', label: 'Length' }
  ], {
    validation: { required: true },
    defaultValue: 'piece',
    width: 'half'
  }),
  createNumberField('conversionRate', 'Conversion Rate', {
    validation: { required: true, positive: true },
    placeholder: '1.0',
    defaultValue: 1,
    width: 'half',
    helpText: 'Rate to convert to base unit'
  }),
  createSelectField('baseUnitId', 'Base Unit', [], {
    placeholder: 'Select base unit (optional)',
    searchable: true,
    clearable: true,
    width: 'half'
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], {
    defaultValue: 'active',
    width: 'half'
  })
];

// ===== ORDERS CONFIGURATION =====
export interface Order {
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

export const ordersColumns: Column<Order>[] = [
  {
    key: 'orderNumber',
    header: 'Order Number',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '150px',
    render: (orderNumber: string) => (
      <div className="flex items-center space-x-2">
        <Hash className="w-4 h-4 text-gray-400" />
        <span className="font-mono font-medium">{orderNumber}</span>
      </div>
    )
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (customer: any) => customer ? (
      <div>
        <div className="font-medium text-gray-900">{customer.name}</div>
        <div className="text-sm text-gray-500">{customer.email}</div>
      </div>
    ) : '-',
    filterable: true,
    exportable: true
  },
  {
    key: 'total',
    header: 'Total',
    render: (total: number) => (
      <span className="font-semibold text-green-600">
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
    header: 'Items',
    render: (count: number) => (
      <div className="flex items-center justify-center">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
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
    header: 'Order Status',
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
    header: 'Order Date',
    render: renderDate,
    sortable: true,
    type: 'date',
    exportable: true
  }
];

export const ordersFormFields: FormField[] = [
  createTextField('orderNumber', 'Order Number', {
    validation: { required: true },
    placeholder: 'ORD-001',
    width: 'half'
  }),
  createSelectField('customerId', 'Customer', [], {
    validation: { required: true },
    placeholder: 'Select customer',
    searchable: true,
    width: 'half'
  }),
  createCurrencyField('total', 'Total Amount', {
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
  createSelectField('status', 'Order Status', [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ], {
    defaultValue: 'pending',
    width: 'half'
  }),
  createSelectField('paymentStatus', 'Payment Status', [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ], {
    defaultValue: 'pending',
    width: 'half'
  }),
  createDateField('orderDate', 'Order Date', {
    validation: { required: true },
    defaultValue: new Date().toISOString().split('T')[0],
    width: 'half'
  })
];

export const ordersFilterFields: FilterField[] = [
  {
    key: 'status',
    label: 'Order Status',
    type: 'multiselect',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'processing', label: 'Processing' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  {
    key: 'paymentStatus',
    label: 'Payment Status',
    type: 'multiselect',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' }
    ]
  },
  {
    key: 'total',
    label: 'Total Amount',
    type: 'range',
    validation: { min: 0 },
    placeholder: 'Min - Max amount'
  },
  {
    key: 'orderDate',
    label: 'Order Date',
    type: 'daterange'
  }
];

// Export all configurations
export const crudConfigurations = {
  users: {
    columns: usersColumns,
    formFields: usersFormFields,
    filterFields: usersFilterFields,
    entityConfig: {
      icon: Users,
      color: 'text-green-600',
      description: 'Manage system users and their roles',
      category: 'administration'
    }
  },
  categories: {
    columns: categoriesColumns,
    formFields: categoriesFormFields,
    filterFields: [],
    entityConfig: {
      icon: Archive,
      color: 'text-orange-600',
      description: 'Organize products into categories',
      category: 'organization'
    }
  },
  units: {
    columns: unitsColumns,
    formFields: unitsFormFields,
    filterFields: [],
    entityConfig: {
      icon: Target,
      color: 'text-indigo-600',
      description: 'Measurement units for products',
      category: 'configuration'
    }
  },
  orders: {
    columns: ordersColumns,
    formFields: ordersFormFields,
    filterFields: ordersFilterFields,
    entityConfig: {
      icon: ShoppingCart,
      color: 'text-purple-600',
      description: 'Manage customer orders and transactions',
      category: 'sales'
    }
  }
}; 