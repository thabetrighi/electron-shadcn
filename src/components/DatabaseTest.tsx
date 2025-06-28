import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function DatabaseTest() {
  const [status, setStatus] = useState('Not connected');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    try {
      // Initialize database
      const initResult = await window.database.initialize();
      console.log('Database init result:', initResult);
      
      if (initResult.success) {
        setStatus('Connected');
        
        // Test loading data
        const productsResult = await window.database.products.getAll();
        const categoriesResult = await window.database.categories.getAll();
        
        console.log('Products result:', productsResult);
        console.log('Categories result:', categoriesResult);
        
        if (productsResult.success) {
          setProducts(productsResult.data || []);
        }
        
        if (categoriesResult.success) {
          setCategories(categoriesResult.data || []);
        }
      } else {
        setStatus(`Error: ${initResult.error}`);
      }
    } catch (error) {
      console.error('Database test error:', error);
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestProduct = async () => {
    try {
      const result = await window.database.products.create({
        name: 'Test Product',
        description: 'A test product',
        sellingPrice: 9.99,
        currentStock: 10,
        isActive: true,
      });
      
      console.log('Create product result:', result);
      
      if (result.success) {
        testDatabase(); // Refresh data
      }
    } catch (error) {
      console.error('Create product error:', error);
    }
  };

  const createTestCategory = async () => {
    try {
      const result = await window.database.categories.create({
        name: 'Test Category',
        description: 'A test category',
        status: 'active',
      });
      
      console.log('Create category result:', result);
      
      if (result.success) {
        testDatabase(); // Refresh data
      }
    } catch (error) {
      console.error('Create category error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Database Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Status:</strong> {status}</p>
          </div>
          
          <div className="space-x-2">
            <Button onClick={testDatabase} disabled={loading}>
              {loading ? 'Testing...' : 'Test Database'}
            </Button>
            <Button onClick={createTestProduct}>Create Test Product</Button>
            <Button onClick={createTestCategory}>Create Test Category</Button>
          </div>
          
          <div>
            <h3 className="font-bold">Products ({products.length}):</h3>
            {products.map((product) => (
              <div key={product.id} className="p-2 border rounded">
                <p><strong>{product.name}</strong> - ${product.sellingPrice}</p>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="font-bold">Categories ({categories.length}):</h3>
            {categories.map((category) => (
              <div key={category.id} className="p-2 border rounded">
                <p><strong>{category.name}</strong></p>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 