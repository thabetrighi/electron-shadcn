import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Package, Tag, Ruler } from 'lucide-react';

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
  description?: string;
  status: string;
}

interface Unit {
  id: number;
  name: string;
  symbol: string;
  type: string;
  status: string;
}

export default function CrudManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'units'>('products');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    sku: '',
    sellingPrice: 0,
    currentStock: 0,
    categoryId: '',
    unitId: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Unit form state
  const [unitForm, setUnitForm] = useState({
    name: '',
    symbol: '',
    type: 'piece',
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadProducts(), loadCategories(), loadUnits()]);
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

  const createProduct = async () => {
    try {
      const result = await window.database.products.create({
        ...productForm,
        sellingPrice: Number(productForm.sellingPrice),
        currentStock: Number(productForm.currentStock),
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
        unitId: productForm.unitId ? Number(productForm.unitId) : null,
        isActive: true,
      });

      if (result.success) {
        setProductForm({ name: '', description: '', sku: '', sellingPrice: 0, currentStock: 0, categoryId: '', unitId: '' });
        loadProducts();
      } else {
        setError(`Failed to create product: ${result.error}`);
      }
    } catch (err) {
      setError('Error creating product');
      console.error('Error creating product:', err);
    }
  };

  const createCategory = async () => {
    try {
      const result = await window.database.categories.create({
        ...categoryForm,
        status: 'active',
      });

      if (result.success) {
        setCategoryForm({ name: '', description: '' });
        loadCategories();
      } else {
        setError(`Failed to create category: ${result.error}`);
      }
    } catch (err) {
      setError('Error creating category');
      console.error('Error creating category:', err);
    }
  };

  const createUnit = async () => {
    try {
      const result = await window.database.units.create({
        ...unitForm,
        status: 'active',
      });

      if (result.success) {
        setUnitForm({ name: '', symbol: '', type: 'piece' });
        loadUnits();
      } else {
        setError(`Failed to create unit: ${result.error}`);
      }
    } catch (err) {
      setError('Error creating unit');
      console.error('Error creating unit:', err);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const result = await window.database.products.delete(id);
      if (result.success) {
        loadProducts();
      } else {
        setError(`Failed to delete product: ${result.error}`);
      }
    } catch (err) {
      setError('Error deleting product');
      console.error('Error deleting product:', err);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      const result = await window.database.categories.delete(id);
      if (result.success) {
        loadCategories();
      } else {
        setError(`Failed to delete category: ${result.error}`);
      }
    } catch (err) {
      setError('Error deleting category');
      console.error('Error deleting category:', err);
    }
  };

  const deleteUnit = async (id: number) => {
    try {
      const result = await window.database.units.delete(id);
      if (result.success) {
        loadUnits();
      } else {
        setError(`Failed to delete unit: ${result.error}`);
      }
    } catch (err) {
      setError('Error deleting unit');
      console.error('Error deleting unit:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Management</h2>
        <Button onClick={loadAllData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh All'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ×
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('products')}
          className="flex items-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </Button>
        <Button
          variant={activeTab === 'categories' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('categories')}
          className="flex items-center space-x-2"
        >
          <Tag className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </Button>
        <Button
          variant={activeTab === 'units' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('units')}
          className="flex items-center space-x-2"
        >
          <Ruler className="w-4 h-4" />
          <span>Units ({units.length})</span>
        </Button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Product</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Name</Label>
                  <Input
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label htmlFor="product-sku">SKU</Label>
                  <Input
                    id="product-sku"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="Product SKU"
                  />
                </div>
                <div>
                  <Label htmlFor="product-price">Price</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="product-stock">Stock</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    value={productForm.currentStock}
                    onChange={(e) => setProductForm({ ...productForm, currentStock: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="product-category">Category</Label>
                  <Select value={productForm.categoryId} onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="product-unit">Unit</Label>
                  <Select value={productForm.unitId} onValueChange={(value) => setProductForm({ ...productForm, unitId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>
              <Button onClick={createProduct} disabled={!productForm.name}>
                Create Product
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">
                        SKU: {product.sku || 'N/A'} | Price: ${product.sellingPrice} | Stock: {product.currentStock}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No products found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <Button onClick={createCategory} disabled={!categoryForm.name}>
                Create Category
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                      <Button variant="destructive" size="sm" onClick={() => deleteCategory(category.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No categories found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Unit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unit-name">Name</Label>
                  <Input
                    id="unit-name"
                    value={unitForm.name}
                    onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                    placeholder="Unit name"
                  />
                </div>
                <div>
                  <Label htmlFor="unit-symbol">Symbol</Label>
                  <Input
                    id="unit-symbol"
                    value={unitForm.symbol}
                    onChange={(e) => setUnitForm({ ...unitForm, symbol: e.target.value })}
                    placeholder="Unit symbol"
                  />
                </div>
                <div>
                  <Label htmlFor="unit-type">Type</Label>
                  <Select value={unitForm.type} onValueChange={(value) => setUnitForm({ ...unitForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="length">Length</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={createUnit} disabled={!unitForm.name || !unitForm.symbol}>
                Create Unit
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Units List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {units.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{unit.name} ({unit.symbol})</h4>
                      <p className="text-sm text-gray-600">Type: {unit.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                        {unit.status}
                      </Badge>
                      <Button variant="destructive" size="sm" onClick={() => deleteUnit(unit.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {units.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No units found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 