import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { Column, Action, BulkAction, Stats, FilterField } from '../components/AdvancedDataTable';
import { FormField, createTextField, createNumberField, createSelectField, createTextareaField, createCurrencyField } from '../components/FormModal';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'react-hot-toast';
import { exportData } from '../utils/export';
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download, 
  Upload, 
  Archive, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Coins,
  Activity,
  BarChart3,
  XCircle,
  Printer
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { renderCurrency, renderDate, renderStock, renderStatus } from '../utils/renderers';
import { useSettingsCache } from '../hooks/useSettingsCache';

// Enhanced Product interface
interface Product {
  id: number;
  name: string;
  sku?: string;
  image?: string;
  sellingPrice: number;
  currentStock: number;
  categoryId?: number;
  unitId?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  unit?: { id: number; name: string; symbol: string };
  minStock?: number;
  isLowStock?: boolean;
  totalSold?: number;
  revenue?: number;
  // Legacy fields for backward compatibility and edit modal
  price?: number;
  stock?: number;
  lowStockThreshold?: number;
  barcode?: string; // Added for printing label
}

export default function ProductsPage() {
  const { t } = useTranslation();
  
  // Use settings cache
  const settingsCache = useSettingsCache();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Enhanced columns configuration
  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: t('products.image', 'Image'),
      render: (image: string, product: Product) => (
        <div className="flex items-center justify-center">
          <Avatar className="w-10 h-10">
            <AvatarImage src={image} alt={product.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
              {product.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      ),
      width: '80px',
      align: 'center'
    },
    {
      key: 'name',
      header: t('products.name', 'Product Name'),
      sortable: true,
      filterable: true,
      searchable: true,
      exportable: true,
      sticky: true,
      width: '200px'
    },
    {
      key: 'sku',
      header: t('products.sku', 'SKU'),
      sortable: true,
      filterable: true,
      searchable: true,
      exportable: true,
      copyable: true,
      render: (sku: string) => sku ? (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {sku}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'sellingPrice',
      header: t('products.price', 'Price'),
      sortable: true,
      render: (price: number) => renderCurrency(price),
      type: 'currency',
      exportable: true,
      align: 'right' as const
    },
    {
      key: 'currentStock',
      header: t('products.stock', 'Stock'),
      sortable: true,
      render: (stock: number, product: Product) => renderStock(stock, product.minStock || 10),
      type: 'number',
      exportable: true,
      align: 'right' as const
    },
    {
      key: 'category',
      header: t('products.category', 'Category'),
      render: (category: any) => category?.name || (
        <span className="text-gray-400">{t('common.none', 'None')}</span>
      ),
      filterable: true,
      exportable: true
    },
    {
      key: 'unit',
      header: t('products.unit', 'Unit'),
      render: (unit: any) => unit ? `${unit.name} (${unit.symbol})` : (
        <span className="text-gray-400">{t('common.none', 'None')}</span>
      ),
      exportable: true
    },
    {
      key: 'isActive',
      header: t('products.status', 'Status'),
      render: (isActive: boolean) => renderStatus(isActive ? t('status.active', 'active') : t('status.inactive', 'inactive')),
      sortable: true,
      filterable: true,
      exportable: true
    },
    {
      key: 'createdAt',
      header: t('products.created', 'Created'),
      render: renderDate,
      sortable: true,
      type: 'date',
      exportable: true
    }
  ];

  // Enhanced form fields (recreated when categories and units are loaded)
  const formFields: FormField[] = useMemo(() => {
    console.log('Creating form fields with categories:', categories.length, 'units:', units.length);
    console.log('Sample category:', categories[0]);
    console.log('Sample unit:', units[0]);
    
    return [
      createTextField('name', t('products.name', 'Product Name'), {
        validation: { required: true, minLength: 2, maxLength: 100 },
        placeholder: t('products.namePlaceholder', 'Enter product name'),
        width: 'full'
      }),
      createTextField('sku', t('products.sku', 'SKU'), {
        placeholder: t('products.skuPlaceholder', 'Enter product SKU (optional)'),
        tooltip: t('products.skuTooltip', 'Stock Keeping Unit - unique identifier'),
        width: 'half'
      }),
      createCurrencyField('price', t('products.price', 'Price'), {
        validation: { required: true, positive: true },
        placeholder: '0.00',
        width: 'half'
      }),
      createNumberField('stock', t('products.stock', 'Stock Quantity'), {
        validation: { required: true, min: 0, integer: true },
        placeholder: '0',
        width: 'half'
      }),
      createNumberField('lowStockThreshold', t('products.lowStockThreshold', 'Low Stock Threshold'), {
        validation: { min: 0, integer: true },
        placeholder: '10',
        defaultValue: 10,
        width: 'half',
        helpText: t('products.lowStockHelp', 'Alert when stock falls below this level')
      }),
      createSelectField('categoryId', t('products.category', 'Category'), 
        categories.length > 0 ? categories.map(cat => ({ value: cat.id, label: cat.name })) : [
          { value: '', label: t('loading', 'Loading...') }
        ], {
        placeholder: t('products.selectCategory', 'Select a category'),
        searchable: true,
        clearable: true,
        width: 'half',
        disabled: categories.length === 0
      }),
      createSelectField('unitId', t('products.unit', 'Unit'), 
        units.length > 0 ? units.map(unit => ({ value: unit.id, label: `${unit.name} (${unit.symbol})` })) : [
          { value: '', label: t('loading', 'Loading...') }
        ], {
        placeholder: t('products.selectUnit', 'Select a unit'),
        searchable: true,
        clearable: true,
        width: 'half',
        disabled: units.length === 0
      }),
      createTextareaField('description', t('products.description', 'Description'), {
        rows: 3,
        placeholder: t('products.descriptionPlaceholder', 'Enter product description (optional)'),
        width: 'full'
      }),
      createSelectField('isActive', t('products.status', 'Status'), [
        { value: true, label: t('status.active', 'Active') },
        { value: false, label: t('status.inactive', 'Inactive') }
      ], { 
        defaultValue: true,
        width: 'half'
      })
    ];
  }, [categories, units, t]);

  // Enhanced filter fields
  const filterFields: FilterField[] = [
    {
      key: 'isActive',
      label: t('filters.status', 'Status'),
      type: 'select',
      options: [
        { value: 'true', label: t('status.active', 'Active') },
        { value: 'false', label: t('status.inactive', 'Inactive') }
      ]
    },
    {
      key: 'categoryId',
      label: t('filters.category', 'Category'),
      type: 'multiselect',
      options: categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
    },
    {
      key: 'sellingPrice',
      label: t('filters.priceRange', 'Price Range'),
      type: 'range',
      validation: { min: 0 },
      placeholder: 'Min - Max price'
    },
    {
      key: 'currentStock',
      label: t('filters.stockLevel', 'Stock Level'),
      type: 'select',
      options: [
        { value: 'out_of_stock', label: t('filters.outOfStock', 'Out of Stock') },
        { value: 'low_stock', label: t('filters.lowStock', 'Low Stock') },
        { value: 'in_stock', label: t('filters.inStock', 'In Stock') }
      ]
    },
    {
      key: 'createdAt',
      label: t('filters.dateRange', 'Date Range'),
      type: 'daterange'
    }
  ];

  // Enhanced statistics
  const stats: Stats[] = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive === true).length;
    const lowStockProducts = products.filter(p => p.isLowStock).length;
    const outOfStockProducts = products.filter(p => p.currentStock <= 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
    const avgPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.sellingPrice, 0) / totalProducts : 0;

    return [
      {
        label: t('stats.totalProducts', 'Total Products'),
        value: totalProducts,
        icon: Package,
        color: 'text-blue-600',
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.activeProducts', 'Active Products'),
        value: activeProducts,
        icon: CheckCircle2,
        color: 'text-green-600',
        format: 'number' as const,
        comparison: {
          value: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0,
          label: t('stats.ofTotal', 'of total')
        }
      },
      {
        label: t('stats.totalValue', 'Total Inventory Value'),
        value: totalValue,
        icon: Coins,
        color: 'text-purple-600',
        format: 'currency' as const
      },
      {
        label: t('stats.avgPrice', 'Average Price'),
        value: avgPrice,
        icon: BarChart3,
        color: 'text-indigo-600',
        format: 'currency' as const
      },
      {
        label: t('stats.lowStock', 'Low Stock Items'),
        value: lowStockProducts,
        icon: AlertTriangle,
        color: 'text-yellow-600',
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.outOfStock', 'Out of Stock'),
        value: outOfStockProducts,
        icon: XCircle,
        color: 'text-red-600',
        format: 'number' as const,
        clickable: true
      }
    ];
  }, [products, t]);

  // Data transformation for edit modal
  const transformProductForEdit = (product: Product) => ({
    ...product,
    // Transform database fields to form field names
    price: product.sellingPrice,
    stock: product.currentStock,
    lowStockThreshold: product.minStock || 10,
    // Ensure categoryId and unitId are available
    categoryId: product.categoryId || product.category?.id || null,
    unitId: product.unitId || product.unit?.id || null
  });

  // CRUD operations
  const handleAdd = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      // Transform form data to match database schema
      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        isActive: formData.isActive,
        sellingPrice: parseFloat(formData.price) || 0,
        currentStock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.lowStockThreshold) || 10,
        categoryId: formData.categoryId || null,
        unitId: formData.unitId || null
      };

      // Call API to create product
      const response = await window.database.products.create(productData);
      if (!response.success) throw new Error(response.error);
      
      // Add to local state
      const newProduct = {
        ...response.data,
        isLowStock: response.data?.currentStock <= (response.data?.minStock || 10)
      };
      setProducts(prev => [...prev, newProduct]);
      
      toast.success(t('messages.productCreated', 'Product created successfully'));
      return newProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error(t('messages.createError', 'Failed to create product'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string | number, formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        isActive: formData.isActive,
        sellingPrice: parseFloat(formData.price) || 0,
        currentStock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.lowStockThreshold) || 10,
        categoryId: formData.categoryId || null,
        unitId: formData.unitId || null
      };

      // Call API to update product
      const response = await window.database.products.update(Number(id), productData);
      if (!response.success) throw new Error(response.error);
      
      // Update local state
      const updatedProduct = {
        ...response.data,
        isLowStock: response.data?.currentStock <= (response.data?.minStock || 10)
      };
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      toast.success(t('messages.productUpdated', 'Product updated successfully'));
      return updatedProduct;
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(t('messages.updateError', 'Failed to update product'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      
      // Call API to delete product
      const response = await window.database.products.delete(Number(id));
      if (!response.success) throw new Error(response.error);
      
      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== id));
      
      toast.success(t('messages.productDeleted', 'Product deleted successfully'));
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error(t('messages.deleteError', 'Failed to delete product'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      setLoading(true);
      
      // Call API to delete multiple products
      await Promise.all(ids.map(id => window.database.products.delete(Number(id))));
      
      // Remove from local state
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      
      toast.success(t('messages.productsDeleted', '{{count}} products deleted successfully', { count: ids.length }));
    } catch (error) {
      console.error('Failed to delete products:', error);
      toast.error(t('messages.bulkDeleteError', 'Failed to delete products'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string | number) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const duplicatedData = {
        ...product,
        name: `${product.name} (Copy)`,
        sku: product.sku ? `${product.sku}-COPY` : undefined,
        id: undefined
      };

      return await handleAdd(duplicatedData);
    } catch (error) {
      console.error('Failed to duplicate product:', error);
      toast.error(t('messages.duplicateError', 'Failed to duplicate product'));
      throw error;
    }
  };

  const handleExport = async (format: string, data: Product[], exportColumns: Column<Product>[]) => {
    try {
      exportData(format, data, exportColumns, {
        title: t('products.title', 'Products'),
        subtitle: t('products.subtitle', 'Product inventory management'),
        filename: `products_${new Date().toISOString().split('T')[0]}`
      });
      
      toast.success(t('messages.exportSuccess', 'Export completed successfully'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('messages.exportError', 'Export failed'));
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      // Fetch products with related data
      const [productsResponse, categoriesResponse, unitsResponse] = await Promise.all([
        window.database.products.getAll(),
        window.database.categories.getAll(),
        window.database.units.getAll()
      ]);
      
      if (!productsResponse.success) throw new Error(productsResponse.error);
      if (!categoriesResponse.success) throw new Error(categoriesResponse.error);
      if (!unitsResponse.success) throw new Error(unitsResponse.error);
      
      // Add calculated fields and legacy field mappings for edit modal
      const enhancedProducts = (productsResponse.data || []).map((product: any) => ({
        ...product,
        isLowStock: product.currentStock <= (product.minStock || 10),
        // Legacy field mappings for edit modal
        price: product.sellingPrice,
        stock: product.currentStock,
        lowStockThreshold: product.minStock,
        // Ensure categoryId and unitId are available for form modal (convert to strings for select fields)
        categoryId: product.categoryId ? String(product.categoryId) : (product.category?.id ? String(product.category.id) : null),
        unitId: product.unitId ? String(product.unitId) : (product.unit?.id ? String(product.unit.id) : null)
      }));
      
      setProducts(enhancedProducts);
      setCategories(categoriesResponse.data || []);
      setUnits(unitsResponse.data || []);
      
      // Debug logging
      console.log('Data loaded - Products:', enhancedProducts.length);
      console.log('Categories:', categoriesResponse.data?.length, categoriesResponse.data);
      console.log('Units:', unitsResponse.data?.length, unitsResponse.data);
      if (enhancedProducts.length > 0) {
        console.log('Sample product for edit:', enhancedProducts[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(t('messages.fetchError', 'Failed to load data'));
      toast.error(t('messages.fetchError', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

  // Debug effect to log data when it changes
  useEffect(() => {
    if (products.length > 0 && categories.length > 0 && units.length > 0) {
      console.log('=== DEBUGGING PRODUCT EDIT DATA ===');
      console.log('Sample product:', products[0]);
      console.log('Sample category:', categories[0]);
      console.log('Sample unit:', units[0]);
      console.log('Product categoryId:', products[0]?.categoryId, 'type:', typeof products[0]?.categoryId);
      console.log('Product unitId:', products[0]?.unitId, 'type:', typeof products[0]?.unitId);
      console.log('Category options:', categories.map(c => ({ id: c.id, name: c.name })));
      console.log('Unit options:', units.map(u => ({ id: u.id, name: u.name })));
      console.log('===================================');
    }
  }, [products, categories, units]);

  // Add print label action for table/list view
  const printLabelAction: Action<Product> = {
    label: t('products.printLabel', 'Print Label'),
    icon: Printer,
    onClick: async (product) => {
      try {
        // Get printer settings from cache
        const printerName = settingsCache.getSetting('printer.printerName') || 'Microsoft Print to PDF';
        
        const result = await window.printer.printProductLabel({
          name: product.name,
          price: product.sellingPrice,
          sku: product.sku,
          barcode: product.barcode,
          stock: product.currentStock,
          category: product.category?.name,
          printerName: printerName // Use printer from cache
        });
        if (result.success) {
          toast.success(t('products.labelPrinted', 'Label printed successfully'));
        } else {
          toast.error(result.error || t('products.labelPrintFailed', 'Failed to print label'));
        }
      } catch (error) {
        console.error('Print label failed:', error);
        toast.error(t('products.labelPrintFailed', 'Failed to print label'));
      }
    }
  };

  // Custom card renderer for products
  const cardRenderer = (product: Product) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          {product.sku && (
            <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
          )}
        </div>
        {renderStatus(product.isActive ? 'active' : 'inactive')}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Price:</span>
          <div className="font-medium">{renderCurrency(product.sellingPrice)}</div>
        </div>
        <div>
          <span className="text-gray-500">Stock:</span>
          <div>{renderStock(product.currentStock, product.minStock || 10)}</div>
        </div>
        {product.category && (
          <div>
            <span className="text-gray-500">Category:</span>
            <div className="font-medium">{product.category.name}</div>
          </div>
        )}
        {product.unit && (
          <div>
            <span className="text-gray-500">Unit:</span>
            <div className="font-medium">{product.unit.name}</div>
          </div>
        )}
      </div>
      
      {product.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
      )}
      <button
        className="mt-2 flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-sm"
        onClick={async () => {
          try {
            // Get printer settings from cache
            const printerName = settingsCache.getSetting('printer.printerName') || 'Microsoft Print to PDF';
            
            const result = await window.printer.printProductLabel({
              name: product.name,
              price: product.sellingPrice,
              sku: product.sku,
              barcode: product.barcode,
              stock: product.currentStock,
              category: product.category?.name,
              printerName: printerName // Use printer from cache
            });
            if (result.success) {
              toast.success(t('products.labelPrinted', 'Label printed successfully'));
            } else {
              toast.error(result.error || t('products.labelPrintFailed', 'Failed to print label'));
            }
          } catch (error) {
            console.error('Print label failed:', error);
            toast.error(t('products.labelPrintFailed', 'Failed to print label'));
          }
        }}
      >
        <Printer className="w-4 h-4" />
        {t('products.printLabel', 'Print Label')}
      </button>
    </div>
  );

  return (
    <CrudPageTemplate
      // Core data
      data={products}
      loading={loading}
      error={error}
      
      // Entity configuration
      entityName="product"
      entityNamePlural="products"
      entityConfig={{
        icon: Package,
        color: 'text-blue-600',
        description: t('products.description', 'Manage your product inventory'),
        category: 'inventory'
      }}
      
      // Table configuration
      columns={columns}
      filterFields={filterFields}
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
      
      // Form configuration - only show form if categories and units are loaded
      formFields={categories.length > 0 && units.length > 0 ? formFields : []}
      formSections={[
        {
          title: t('sections.basicInfo', 'Basic Information'),
          fields: ['name', 'sku', 'description', 'isActive']
        },
        {
          title: t('sections.pricing', 'Pricing & Inventory'),
          fields: ['price', 'stock', 'lowStockThreshold']
        },
        {
          title: t('sections.classification', 'Classification'),
          fields: ['categoryId', 'unitId']
        }
      ]}
      
      // CRUD operations
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onDuplicate={handleDuplicate}
      onRefresh={handleRefresh}
      onExport={handleExport}
      
      // Advanced features
      enableAnalytics={true}
      idField="id"
      titleField="name"
      statusField="isActive"
      dateField="createdAt"
      
      // Configuration
      autoRefresh={true}
      refreshInterval={60000}
      preserveSelection={false}
      density="comfortable"
      customActions={[printLabelAction]}
    />
  );
} 