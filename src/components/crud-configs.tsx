import React from 'react';
import { Column, Action, BulkAction, Stats, FilterField } from './AdvancedDataTable';
import { FormField, createTextField, createNumberField, createSelectField, createTextareaField, createEmailField, createPasswordField, createDateField, createCheckboxField, createCurrencyField } from './FormModal';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Archive, 
  Target, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle,
  DollarSign,
  Activity,
  TrendingUp,
  AlertCircle,
  Star,
  Settings
} from 'lucide-react';

// Enhanced utility functions for rendering
export const renderStatus = (status: string) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    archived: { color: 'bg-gray-100 text-gray-600', icon: Archive },
    deleted: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const renderCurrency = (amount: number, currency = 'USD') => (
  <span className="font-mono font-medium text-green-600">
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0)}
  </span>
);

export const renderDate = (date: string | Date) => {
  if (!date) return '-';
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

export const renderBoolean = (value: boolean) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}>
    {value ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
    {value ? 'Yes' : 'No'}
  </span>
);

export const renderRating = (rating: number, maxRating = 5) => (
  <div className="flex items-center">
    {[...Array(maxRating)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))}
    <span className="ml-2 text-sm text-gray-600">({rating})</span>
  </div>
);

export const renderTags = (tags: string[]) => (
  <div className="flex flex-wrap gap-1">
    {tags?.slice(0, 3).map((tag, index) => (
      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
        {tag}
      </span>
    ))}
    {tags?.length > 3 && (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
        +{tags.length - 3}
      </span>
    )}
  </div>
);

// Enhanced action creators
export const createStandardActions = <T extends Record<string, any>>(
  onView?: (item: T) => void,
  onEdit?: (item: T) => void,
  onDelete?: (item: T) => void,
  onDuplicate?: (item: T) => void
): Action<T>[] => {
  const actions: Action<T>[] = [];

  if (onView) {
    actions.push({
      label: 'View',
      icon: Eye,
      onClick: onView,
      variant: 'outline'
    });
  }

  if (onEdit) {
    actions.push({
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'outline'
    });
  }

  if (onDuplicate) {
    actions.push({
      label: 'Duplicate',
      icon: Copy,
      onClick: onDuplicate,
      variant: 'outline'
    });
  }

  if (onDelete) {
    actions.push({
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive'
    });
  }

  return actions;
};

export const createStandardBulkActions = <T extends Record<string, any>>(
  onBulkEdit?: (items: T[]) => void,
  onBulkDelete?: (items: T[]) => void,
  onBulkExport?: (items: T[]) => void
): BulkAction<T>[] => {
  const actions: BulkAction<T>[] = [];

  if (onBulkExport) {
    actions.push({
      label: 'Export Selected',
      icon: Download,
      onClick: onBulkExport,
      variant: 'outline'
    });
  }

  if (onBulkEdit) {
    actions.push({
      label: 'Edit Selected',
      icon: Edit,
      onClick: onBulkEdit,
      variant: 'outline'
    });
  }

  if (onBulkDelete) {
    actions.push({
      label: 'Delete Selected',
      icon: Trash2,
      onClick: onBulkDelete,
      variant: 'destructive',
      requiresConfirmation: true
    });
  }

  return actions;
};

// Products Configuration
export interface Product {
  id: number;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  categoryId?: number;
  unitId?: number;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  category?: { name: string };
  unit?: { name: string; symbol: string };
}

export const productColumns: Column<Product>[] = [
  {
    key: 'name',
    header: 'Product Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'sku',
    header: 'SKU',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    render: (value) => renderCurrency(value),
    type: 'currency',
    exportable: true,
    align: 'right'
  },
  {
    key: 'stock',
    header: 'Stock',
    sortable: true,
    type: 'number',
    exportable: true,
    align: 'right',
    render: (value: number) => (
      <span className={`font-medium ${value <= 0 ? 'text-red-600' : value <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
        {value}
      </span>
    )
  },
  {
    key: 'category',
    header: 'Category',
    render: (value) => value?.name || '-',
    filterable: true,
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
    key: 'createdAt',
    header: 'Created',
    render: renderDate,
    sortable: true,
    type: 'date',
    exportable: true
  }
];

export const productFormFields: FormField[] = [
  createTextField('name', 'Product Name', { 
    validation: { required: true, minLength: 2, maxLength: 100 },
    placeholder: 'Enter product name'
  }),
  createTextField('sku', 'SKU', { 
    placeholder: 'Enter product SKU (optional)',
    tooltip: 'Stock Keeping Unit - unique identifier for the product'
  }),
  createCurrencyField('price', 'Price', { 
    validation: { required: true, positive: true },
    placeholder: '0.00'
  }),
  createNumberField('stock', 'Stock Quantity', { 
    validation: { required: true, min: 0, integer: true },
    placeholder: '0'
  }),
  createSelectField('categoryId', 'Category', [], { 
    placeholder: 'Select a category',
    searchable: true,
    clearable: true
  }),
  createSelectField('unitId', 'Unit', [], { 
    placeholder: 'Select a unit',
    searchable: true,
    clearable: true
  }),
  createTextareaField('description', 'Description', { 
    rows: 3,
    placeholder: 'Enter product description (optional)'
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ], { defaultValue: 'active' })
];

export const productFilterFields: FilterField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'archived', label: 'Archived' }
    ]
  },
  {
    key: 'categoryId',
    label: 'Category',
    type: 'select',
    options: [] // Will be populated dynamically
  },
  {
    key: 'price',
    label: 'Price Range',
    type: 'range',
    validation: { min: 0 }
  },
  {
    key: 'stock',
    label: 'Stock Level',
    type: 'select',
    options: [
      { value: 'out_of_stock', label: 'Out of Stock' },
      { value: 'low_stock', label: 'Low Stock (≤10)' },
      { value: 'in_stock', label: 'In Stock' }
    ]
  }
];

// Users Configuration
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

export const userColumns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    filterable: true,
    exportable: true,
    render: (value: string) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        value === 'admin' ? 'bg-red-100 text-red-800' :
        value === 'supplier' ? 'bg-blue-100 text-blue-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )
  },
  {
    key: 'phone',
    header: 'Phone',
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
    render: (value) => value ? renderDate(value) : 'Never',
    sortable: true,
    exportable: true
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: renderDate,
    sortable: true,
    exportable: true
  }
];

export const userFormFields: FormField[] = [
  createTextField('name', 'Full Name', { 
    validation: { required: true, minLength: 2, maxLength: 100 },
    placeholder: 'Enter full name'
  }),
  createEmailField('email', 'Email Address', { 
    validation: { required: true, email: true },
    placeholder: 'Enter email address'
  }),
  createPasswordField('password', 'Password', { 
    validation: { required: true, minLength: 8 },
    placeholder: 'Enter password',
    conditional: { field: 'id', value: undefined, operator: 'equals' } // Only show for new users
  }),
  createSelectField('role', 'Role', [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'client', label: 'Client', description: 'Customer access' },
    { value: 'supplier', label: 'Supplier', description: 'Supplier access' }
  ], { 
    validation: { required: true },
    defaultValue: 'client'
  }),
  createTextField('phone', 'Phone Number', { 
    validation: { phone: true },
    placeholder: 'Enter phone number (optional)'
  }),
  createTextareaField('address', 'Address', { 
    rows: 2,
    placeholder: 'Enter address (optional)'
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], { defaultValue: 'active' })
];

export const userFilterFields: FilterField[] = [
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
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  {
    key: 'createdAt',
    label: 'Registration Date',
    type: 'daterange'
  }
];

// Categories Configuration
export interface Category {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  parentId?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  parent?: { name: string };
  productsCount?: number;
}

export const categoryColumns: Column<Category>[] = [
  {
    key: 'name',
    header: 'Category Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'nameEn',
    header: 'English Name',
    sortable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'parent',
    header: 'Parent Category',
    render: (value) => value?.name || 'Root Category',
    filterable: true,
    exportable: true
  },
  {
    key: 'productsCount',
    header: 'Products',
    render: (value: number) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {value || 0}
      </span>
    ),
    sortable: true,
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
    exportable: true
  }
];

export const categoryFormFields: FormField[] = [
  createTextField('name', 'Category Name', { 
    validation: { required: true, minLength: 2, maxLength: 100 },
    placeholder: 'Enter category name'
  }),
  createTextField('nameEn', 'English Name', { 
    placeholder: 'Enter English name (optional)'
  }),
  createSelectField('parentId', 'Parent Category', [], { 
    placeholder: 'Select parent category (optional)',
    searchable: true,
    clearable: true
  }),
  createTextareaField('description', 'Description', { 
    rows: 3,
    placeholder: 'Enter category description (optional)'
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], { defaultValue: 'active' })
];

export const categoryFilterFields: FilterField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  {
    key: 'parentId',
    label: 'Parent Category',
    type: 'select',
    options: [] // Will be populated dynamically
  }
];

// Units Configuration
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

export const unitColumns: Column<Unit>[] = [
  {
    key: 'name',
    header: 'Unit Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'symbol',
    header: 'Symbol',
    sortable: true,
    exportable: true,
    render: (value: string) => (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-800">
        {value}
      </span>
    )
  },
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    filterable: true,
    exportable: true,
    render: (value: string) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        value === 'piece' ? 'bg-green-100 text-green-800' :
        value === 'weight' ? 'bg-blue-100 text-blue-800' :
        value === 'volume' ? 'bg-purple-100 text-purple-800' :
        'bg-orange-100 text-orange-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )
  },
  {
    key: 'conversionRate',
    header: 'Conversion Rate',
    sortable: true,
    exportable: true,
    align: 'right'
  },
  {
    key: 'baseUnit',
    header: 'Base Unit',
    render: (value) => value ? `${value.name} (${value.symbol})` : '-',
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

export const unitFormFields: FormField[] = [
  createTextField('name', 'Unit Name', { 
    validation: { required: true, minLength: 1, maxLength: 50 },
    placeholder: 'Enter unit name'
  }),
  createTextField('nameEn', 'English Name', { 
    placeholder: 'Enter English name (optional)'
  }),
  createTextField('symbol', 'Symbol', { 
    validation: { required: true, minLength: 1, maxLength: 10 },
    placeholder: 'Enter unit symbol'
  }),
  createSelectField('type', 'Type', [
    { value: 'piece', label: 'Piece', description: 'Individual items' },
    { value: 'weight', label: 'Weight', description: 'Mass measurement' },
    { value: 'volume', label: 'Volume', description: 'Liquid/gas measurement' },
    { value: 'length', label: 'Length', description: 'Distance measurement' }
  ], { 
    validation: { required: true },
    defaultValue: 'piece'
  }),
  createNumberField('conversionRate', 'Conversion Rate', { 
    validation: { required: true, positive: true },
    defaultValue: 1,
    step: 0.01,
    tooltip: 'Rate to convert to base unit (1 = base unit)'
  }),
  createSelectField('baseUnitId', 'Base Unit', [], { 
    placeholder: 'Select base unit (optional)',
    searchable: true,
    clearable: true
  }),
  createSelectField('status', 'Status', [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], { defaultValue: 'active' })
];

export const unitFilterFields: FilterField[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'multiselect',
    options: [
      { value: 'piece', label: 'Piece' },
      { value: 'weight', label: 'Weight' },
      { value: 'volume', label: 'Volume' },
      { value: 'length', label: 'Length' }
    ]
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  }
];

// Orders Configuration
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

export const orderColumns: Column<Order>[] = [
  {
    key: 'orderNumber',
    header: 'Order #',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (value) => value ? `${value.name} (${value.email})` : 'Guest',
    searchable: true,
    exportable: true
  },
  {
    key: 'total',
    header: 'Total',
    render: (value) => renderCurrency(value),
    sortable: true,
    exportable: true,
    align: 'right'
  },
  {
    key: 'status',
    header: 'Order Status',
    render: (value: string) => {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        processing: 'bg-purple-100 text-purple-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );
    },
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'paymentStatus',
    header: 'Payment',
    render: (value: string) => {
      const paymentColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800'
      };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentColors[value as keyof typeof paymentColors]}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );
    },
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'orderDate',
    header: 'Order Date',
    render: renderDate,
    sortable: true,
    exportable: true
  }
];

export const orderFilterFields: FilterField[] = [
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
    key: 'orderDate',
    label: 'Order Date Range',
    type: 'daterange'
  },
  {
    key: 'total',
    label: 'Order Value',
    type: 'range',
    validation: { min: 0 }
  }
];

// Export all configurations
export const crudConfigs = {
  products: {
    entityName: 'product',
    entityNamePlural: 'products',
    columns: productColumns,
    formFields: productFormFields,
    filterFields: productFilterFields,
    icon: Package,
    color: 'text-blue-600'
  },
  users: {
    entityName: 'user',
    entityNamePlural: 'users',
    columns: userColumns,
    formFields: userFormFields,
    filterFields: userFilterFields,
    icon: Users,
    color: 'text-green-600'
  },
  categories: {
    entityName: 'category',
    entityNamePlural: 'categories',
    columns: categoryColumns,
    formFields: categoryFormFields,
    filterFields: categoryFilterFields,
    icon: Archive,
    color: 'text-orange-600'
  },
  units: {
    entityName: 'unit',
    entityNamePlural: 'units',
    columns: unitColumns,
    formFields: unitFormFields,
    filterFields: unitFilterFields,
    icon: Target,
    color: 'text-indigo-600'
  },
  orders: {
    entityName: 'order',
    entityNamePlural: 'orders',
    columns: orderColumns,
    formFields: [], // Orders typically have complex forms
    filterFields: orderFilterFields,
    icon: ShoppingCart,
    color: 'text-purple-600'
  }
};

export type EntityType = keyof typeof crudConfigs; 