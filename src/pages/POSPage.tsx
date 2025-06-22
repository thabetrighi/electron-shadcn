import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, ShoppingCart, Plus, Minus, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  currentStock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await window.database.products.getAll();
      if (result.success) {
        setProducts(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.sellingPrice * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const total = getCartTotal();
      const orderData = {
        customerName: 'Walk-in Customer',
        orderDate: new Date().toISOString().split('T')[0],
        totalAmount: total,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
      };

      const result = await window.database.orders.create(orderData);
      if (result.success) {
        alert(`Sale completed! Total: $${total.toFixed(2)}`);
        clearCart();
        loadProducts();
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createSampleProducts = async () => {
    try {
      await window.database.products.create({
        name: 'Coffee - Premium Blend',
        description: 'Premium coffee blend',
        sellingPrice: 12.99,
        currentStock: 50,
        isActive: true,
      });

      await window.database.products.create({
        name: 'Tea - Earl Grey',
        description: 'Classic Earl Grey tea',
        sellingPrice: 8.99,
        currentStock: 30,
        isActive: true,
      });

      await window.database.products.create({
        name: 'Pastry - Croissant',
        description: 'Buttery croissant',
        sellingPrice: 3.50,
        currentStock: 20,
        isActive: true,
      });

      loadProducts();
      alert('Sample products created!');
    } catch (error) {
      console.error('Failed to create sample products:', error);
      alert('Failed to create sample products');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">POS System</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {products.length === 0 && !loading && (
            <Button onClick={createSampleProducts} className="mb-4">
              Create Sample Products
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Products ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No products found</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToCart(product)}
                      >
                        <h3 className="font-medium text-sm mb-2">{product.name}</h3>
                        <div className="text-lg font-bold text-green-600 mb-1">
                          ${product.sellingPrice?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {product.currentStock || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({getCartItemCount()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cart is empty</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product.name}</div>
                          <div className="text-xs text-gray-500">
                            ${item.product.sellingPrice.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="mx-2 min-w-[2rem] text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-8 h-8 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="min-w-[4rem] text-right font-medium">
                          ${(item.product.sellingPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {cart.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
                      <span>Total:</span>
                      <span className="text-green-600">${getCartTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button onClick={handleCheckout} className="w-full" size="lg">
                        Complete Sale
                      </Button>
                      <Button onClick={clearCart} variant="outline" className="w-full">
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
