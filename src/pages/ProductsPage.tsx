import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataTable, Column, createEditAction, createDeleteAction, renderStatus, renderCurrency } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package, Plus, AlertTriangle, TrendingUp, Star, DollarSign } from 'lucide-react';

// Zod validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  sellingPrice: z.number().min(0, 'Price must be positive'),
  purchasePrice: z.number().min(0, 'Price must be positive').optional(),
  currentStock: z.number().int().min(0, 'Stock must be non-negative'),
  minStock: z.number().int().min(0, 'Min stock must be non-negative').optional(),
  maxStock: z.number().int().min(1, 'Max stock must be positive').optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.number().optional(),
  unitId: z.number().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product extends ProductFormData {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      sellingPrice: 0,
      purchasePrice: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      if (window.database?.products) {
        const result = await window.database.products.getAll();
        if (result.success) {
          setProducts(result.data || []);
        }
      } else {
        // Enhanced mock data
        setProducts([
          {
            id: 1,
            name: 'Wireless Bluetooth Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            sku: 'WH-001',
            barcode: '1234567890123',
            sellingPrice: 99.99,
            purchasePrice: 60.00,
            currentStock: 25,
            minStock: 5,
            maxStock: 100,
            isActive: true,
            isFeatured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Smart Watch Series 5',
            description: 'Advanced smartwatch with health monitoring',
            sku: 'SW-002',
            barcode: '2345678901234',
            sellingPrice: 299.99,
            purchasePrice: 200.00,
            currentStock: 3,
            minStock: 5,
            maxStock: 50,
            isActive: true,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            name: 'USB-C Charging Cable',
            description: 'Fast charging USB-C cable 3 feet',
            sku: 'CB-003',
            barcode: '3456789012345',
            sellingPrice: 19.99,
            purchasePrice: 8.00,
            currentStock: 150,
            minStock: 20,
            maxStock: 500,
            isActive: true,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            name: 'Laptop Stand Adjustable',
            description: 'Ergonomic laptop stand with adjustable height',
            sku: 'LS-004',
            barcode: '4567890123456',
            sellingPrice: 49.99,
            purchasePrice: 25.00,
            currentStock: 0,
            minStock: 3,
            maxStock: 30,
            isActive: false,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setSubmitting(true);
      
      if (editingProduct) {
        if (window.database?.products) {
          const result = await window.database.products.update(editingProduct.id, data);
          if (result.success) {
            setProducts(products.map(p => 
              p.id === editingProduct.id 
                ? { ...p, ...data, updatedAt: new Date().toISOString() }
                : p
            ));
          }
        } else {
          // Mock update
          setProducts(products.map(p => 
            p.id === editingProduct.id 
              ? { ...p, ...data, updatedAt: new Date().toISOString() }
              : p
          ));
        }
      } else {
        if (window.database?.products) {
          const result = await window.database.products.create(data);
          if (result.success) {
            setProducts([...products, result.data]);
          }
        } else {
          // Mock create
          const newProduct: Product = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setProducts([...products, newProduct]);
        }
      }
      
      setDialogOpen(false);
      form.reset();
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      sellingPrice: product.sellingPrice,
      purchasePrice: product.purchasePrice || 0,
      currentStock: product.currentStock,
      minStock: product.minStock || 0,
      maxStock: product.maxStock || 100,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        if (window.database?.products) {
          const result = await window.database.products.delete(product.id);
          if (result.success) {
            setProducts(products.filter(p => p.id !== product.id));
          }
        } else {
          setProducts(products.filter(p => p.id !== product.id));
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.reset();
    setDialogOpen(true);
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.currentStock <= (p.minStock || 0)).length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);
  const outOfStockProducts = products.filter(p => p.currentStock === 0).length;

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            {row.sku && (
              <div className="text-sm text-gray-500">SKU: {row.sku}</div>
            )}
            {row.description && (
              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                {row.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'Price',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{renderCurrency(value)}</div>
          {row.purchasePrice && (
            <div className="text-sm text-gray-500">
              Cost: {renderCurrency(row.purchasePrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stock',
      sortable: true,
      render: (value, row) => (
        <div className="text-center">
          <div className={`font-medium ${
            value === 0 ? 'text-red-600' :
            value <= (row.minStock || 0) ? 'text-orange-600' : 'text-green-600'
          }`}>
            {value}
          </div>
          {value === 0 && (
            <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
          )}
          {value > 0 && value <= (row.minStock || 0) && (
            <Badge variant="secondary" className="text-xs">Low Stock</Badge>
          )}
          {row.minStock && (
            <div className="text-xs text-gray-500">Min: {row.minStock}</div>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          {renderStatus(value ? 'active' : 'inactive')}
          {row.isFeatured && (
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const actions = [
    createEditAction(handleEdit),
    createDeleteAction(handleDelete),
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Unavailable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredProducts}</div>
            <p className="text-xs text-muted-foreground">
              Promoted items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderCurrency(products.length > 0 ? products.reduce((sum, p) => sum + p.sellingPrice, 0) / products.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average selling price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <DataTable
        data={products}
        columns={columns}
        actions={actions}
        loading={loading}
        onAdd={handleAdd}
        onRefresh={loadProducts}
        title="Products Inventory"
        searchable
        paginated
        pageSize={10}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    className={form.formState.errors.name ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    {...form.register('sku')}
                    placeholder="e.g., WH-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  {...form.register('barcode')}
                  placeholder="e.g., 1234567890123"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    {...form.register('sellingPrice', { valueAsNumber: true })}
                    className={form.formState.errors.sellingPrice ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.sellingPrice && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.sellingPrice.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    {...form.register('purchasePrice', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Inventory</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    {...form.register('currentStock', { valueAsNumber: true })}
                    className={form.formState.errors.currentStock ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.currentStock && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.currentStock.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    {...form.register('minStock', { valueAsNumber: true })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxStock">Maximum Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    {...form.register('maxStock', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <Select 
                    value={form.watch('isActive').toString()} 
                    onValueChange={(value) => form.setValue('isActive', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="isFeatured">Featured Product</Label>
                  <Select 
                    value={form.watch('isFeatured').toString()} 
                    onValueChange={(value) => form.setValue('isFeatured', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setDialogOpen(false);
                  form.reset();
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
