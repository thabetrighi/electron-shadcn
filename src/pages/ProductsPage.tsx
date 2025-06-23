import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { FormModal, createTextField, createNumberField, createSelectField, createTextareaField } from '../components/FormModal';
import { AdvancedDataTable, renderCurrency, renderBoolean, createEditAction, createDeleteAction, createBulkDeleteAction, createBulkEditAction } from '../components/AdvancedDataTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  sellingPrice: number;
  currentStock: number;
  categoryId?: number;
  unitId?: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  status: string;
}

interface Unit {
  id: number;
  name: string;
  symbol: string;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadUnits()
      ]);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await window.database.products.getAll();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        console.error('Failed to load products:', result.error);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await window.database.categories.getAll();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        console.error('Failed to load categories:', result.error);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadUnits = async () => {
    try {
      const result = await window.database.units.getAll();
      if (result.success) {
        setUnits(result.data || []);
      } else {
        console.error('Failed to load units:', result.error);
      }
    } catch (err) {
      console.error('Error loading units:', err);
    }
  };

  // Let AdvancedDataTable handle all filtering
  // const filteredProducts = products;

  const deleteProduct = async (id: number) => {
    try {
      const result = await window.database.products.delete(id);
      if (result.success) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        setError(result.error || 'Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
      console.error('Error deleting product:', err);
    }
  };

  // Modal handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        unitId: formData.unitId ? Number(formData.unitId) : null,
        isActive: true,
      };

      if (editingProduct) {
        const result = await window.database.products.update(editingProduct.id, productData);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success('Product updated successfully');
      } else {
        const result = await window.database.products.create(productData);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success('Product created successfully');
      }
      
      setIsFormModalOpen(false);
      await loadProducts();
    } catch (error) {
      toast.error('An error occurred');
      console.error('CRUD operation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    
    setSubmitting(true);
    try {
      const result = await window.database.products.delete(deletingProduct.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      await loadProducts();
    } catch (error) {
      toast.error('An error occurred');
      console.error('Delete error:', error);
    } finally {
      setSubmitting(false);
      setDeletingProduct(null);
    }
  };

  // Bulk actions handlers
  const handleBulkDelete = async (selectedProducts: Product[]) => {
    if (selectedProducts.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setSubmitting(true);
    try {
      const deletePromises = selectedProducts.map(product => 
        window.database.products.delete(product.id)
      );
      
      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => !result.success);
      
      if (failedDeletes.length === 0) {
        toast.success(`Successfully deleted ${selectedProducts.length} product(s)`);
      } else {
        toast.error(`Failed to delete ${failedDeletes.length} product(s)`);
      }
      
      await loadProducts();
    } catch (error) {
      toast.error('Error during bulk delete');
      console.error('Bulk delete error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkStatusToggle = async (selectedProducts: Product[]) => {
    if (selectedProducts.length === 0) return;
    
    setSubmitting(true);
    try {
      const updatePromises = selectedProducts.map(product => 
        window.database.products.update(product.id, { 
          ...product,
          isActive: !product.isActive 
        })
      );
      
      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => !result.success);
      
      if (failedUpdates.length === 0) {
        toast.success(`Successfully updated ${selectedProducts.length} product(s)`);
      } else {
        toast.error(`Failed to update ${failedUpdates.length} product(s)`);
      }
      
      await loadProducts();
    } catch (error) {
      toast.error('Error during bulk update');
      console.error('Bulk update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = products.map(product => 
        `${product.name},${product.sku || ''},${product.sellingPrice},${product.currentStock},${product.isActive ? 'Active' : 'Inactive'}`
      ).join('\n');
      
      const blob = new Blob([`Name,SKU,Price,Stock,Status\n${csvContent}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Products exported successfully');
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  // Form fields configuration
  const formFields = [
    createTextField('name', 'Product Name', { required: true }),
    createTextField('sku', 'SKU'),
    createNumberField('sellingPrice', 'Price', { 
      required: true, 
      validation: { min: 0 },
      placeholder: '0.00'
    }),
    createNumberField('currentStock', 'Stock', { 
      required: true, 
      validation: { min: 0 },
      placeholder: '0'
    }),
    createSelectField('categoryId', 'Category', 
      categories.map(cat => ({ value: cat.id, label: cat.name }))
    ),
    createSelectField('unitId', 'Unit', 
      units.map(unit => ({ value: unit.id, label: `${unit.name} (${unit.symbol})` }))
    ),
    createTextareaField('description', 'Description')
  ];

  // Table columns configuration
  const columns = [
    { 
      key: 'name' as keyof Product, 
      header: 'Name', 
      sortable: true, 
      filterable: true 
    },
    { 
      key: 'sku' as keyof Product, 
      header: 'SKU', 
      sortable: true, 
      filterable: true 
    },
    { 
      key: 'sellingPrice' as keyof Product, 
      header: 'Price', 
      sortable: true, 
      render: (value: number) => (
        <span className="font-mono text-green-600">${value.toFixed(2)}</span>
      )
    },
    { 
      key: 'currentStock' as keyof Product, 
      header: 'Stock', 
      sortable: true,
      render: (value: number) => (
        <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
          {value}
        </span>
      )
    },
    { 
      key: 'categoryId' as keyof Product, 
      header: 'Category', 
      render: (value: number) => {
        const category = categories.find(cat => cat.id === value);
        return category ? (
          <Badge variant="outline">{category.name}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    { 
      key: 'isActive' as keyof Product, 
      header: 'Status', 
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  // Filter fields
  const filterFields = [
    {
      key: 'isActive',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'select' as const,
      options: categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
    }
  ];

  // Stats
  const stats = [
    {
      label: 'Active Products',
      value: products.filter(p => p.isActive).length,
      icon: Package,
      color: 'text-green-600'
    },
    {
      label: 'Low Stock',
      value: products.filter(p => p.currentStock <= 10).length,
      icon: Package,
      color: 'text-orange-600'
    },
    {
      label: 'Total Value',
      value: `$${products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0).toFixed(2)}`,
      icon: Package,
      color: 'text-blue-600'
    }
  ];

  // Table actions
  const tableActions = [
    createEditAction<Product>(handleEditProduct),
    createDeleteAction<Product>(handleDeleteClick)
  ];

  // Bulk actions
  const bulkActions = [
    createBulkDeleteAction<Product>(handleBulkDelete),
    {
      label: 'Toggle Status',
      icon: Package,
      onClick: handleBulkStatusToggle,
      variant: 'outline' as const
    }
  ];

  const emptyState = {
    title: 'No products yet',
    description: 'Get started by adding your first product',
    action: {
      label: 'Add Your First Product',
      onClick: handleAddProduct
    }
  };

  // Custom card renderer
  const cardRenderer = (product: Product) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {product.sku && (
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              )}
            </div>
            <Badge variant={product.isActive ? 'default' : 'secondary'}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">
              ${product.sellingPrice.toFixed(2)}
            </span>
            <span className={`text-sm ${product.currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              Stock: {product.currentStock}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}

          <div className="flex space-x-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(product)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <AdvancedDataTable
        data={products}
        columns={columns}
        actions={tableActions}
        bulkActions={bulkActions}
        loading={loading}
        searchable={true}
        filterable={true}
        filterFields={filterFields}
        stats={stats}
        title="Products"
        subtitle="Manage your product inventory"
        onAdd={handleAddProduct}
        onRefresh={loadData}
        onExport={handleExport}
        emptyState={emptyState}
        cardRenderer={cardRenderer}
        viewModes={['table', 'cards']}
        selectable={true}
        pageSizes={[10, 25, 50, 100]}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        fields={formFields}
        initialData={editingProduct || {}}
        loading={submitting}
        submitLabel={editingProduct ? 'Update' : 'Create'}
        cancelLabel="Cancel"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
              {deletingProduct && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <strong>{deletingProduct.name}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 