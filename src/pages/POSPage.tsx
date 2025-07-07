import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Scan,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  Users,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  Trash2,
  Save,
  ArrowLeft,
  Keyboard,
  Filter,
  Tag,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Star,
  Heart,
  Zap,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface Product {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  sellingPrice: number;
  currentStock: number;
  categoryId?: number;
  unitId?: number;
  image?: string;
  taxRate?: number;
  discountRate?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  minStock?: number;
  category?: { id: number; name: string; };
  unit?: { id: number; name: string; symbol: string; };
}

interface Category {
  id: number;
  name: string;
  nameEn?: string;
  image?: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

interface CartItem {
  id: string;
  product?: Product;
  customItem?: {
    name: string;
    price: number;
    description?: string;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  isCustom: boolean;
}

interface PendingCart {
  id: string;
  name: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  customerName?: string;
}

const KEYBOARD_SHORTCUTS = {
  'F1': 'toggleView',
  'F2': 'toggleFullscreen',
  'F3': 'focusSearch',
  'F4': 'scanBarcode',
  'F5': 'showAllProducts',
  'F8': 'clearCart',
  'F9': 'savePendingCart',
  'F10': 'checkoutWithPrint',
  'F11': 'checkoutWithoutPrint',
  'Escape': 'clearSearch',
  'Enter': 'quickCheckout',
};

export default function POSPage() {
  const { t } = useTranslation();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingCarts, setPendingCarts] = useState<PendingCart[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [cartView, setCartView] = useState<'grid' | 'list'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    price: 0,
    quantity: 1,
    description: ''
  });
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragReady, setIsDragReady] = useState(false);
  const [currentPendingCartId, setCurrentPendingCartId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    users: User[];
  }>({ products: [], users: [] });

  // Debug customer name state changes
  useEffect(() => {
    console.log('Customer name state changed:', customerName);
  }, [customerName]);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadPendingCarts();
    loadOrderForEditing();
  }, []);

  // Load order data for editing if coming from Orders page
  const loadOrderForEditing = () => {
    const editOrderData = localStorage.getItem('editOrderData');
    if (editOrderData) {
      try {
        const orderData = JSON.parse(editOrderData);
        console.log('Loading order for editing:', orderData);
        
        // Clear the stored data
        localStorage.removeItem('editOrderData');
        
        // Load order items
        loadOrderItemsForEditing(orderData.id);
        
        // Set customer name and user
        if (orderData.staff?.name) {
          setSelectedUser(orderData.staff);
          setCustomerName(orderData.staff.name);
        } else if (orderData.customer?.name) {
          setCustomerName(orderData.customer.name);
        }
        
        toast.success(`Editing order ${orderData.orderNumber}`);
      } catch (error) {
        console.error('Failed to load order for editing:', error);
        toast.error('Failed to load order for editing');
      }
    }
  };

  // Load order items for editing
  const loadOrderItemsForEditing = async (orderId: number) => {
    try {
      const response = await window.database.orderItems.getByOrderId(orderId);
      if (response.success && response.data) {
        const cartItems: CartItem[] = response.data.map((item: any) => ({
          id: Date.now().toString() + Math.random(),
          product: item.productId ? {
            id: item.productId,
            name: item.productName,
            sellingPrice: item.unitPrice,
            currentStock: 999, // We don't have stock info for editing
            sku: item.productSku,
          } : undefined,
          customItem: !item.productId ? {
            name: item.productName,
            price: item.unitPrice,
            description: '',
          } : undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discountAmount,
          total: item.totalPrice,
          isCustom: !item.productId,
        }));
        
        setCart(cartItems);
        toast.success(`Loaded ${cartItems.length} items from order`);
      }
    } catch (error) {
      console.error('Failed to load order items for editing:', error);
      toast.error('Failed to load order items');
    }
  };

  // Ensure drag is ready when products are loaded
  useEffect(() => {
    if (products.length > 0 && !loading) {
      // Small delay to ensure components are fully rendered
      const timer = setTimeout(() => {
        setIsDragReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsDragReady(false);
    }
  }, [products, loading]);

  // Handle fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const shortcut = KEYBOARD_SHORTCUTS[key as keyof typeof KEYBOARD_SHORTCUTS];
      
      if (shortcut) {
        event.preventDefault();
        handleShortcut(shortcut);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShortcut = (action: string) => {
    switch (action) {
      case 'toggleView':
        setView(prev => prev === 'grid' ? 'list' : 'grid');
        break;
      case 'toggleFullscreen':
        setIsFullscreen(prev => !prev);
        break;
      case 'focusSearch':
        searchInputRef.current?.focus();
        break;
      case 'scanBarcode':
        barcodeInputRef.current?.focus();
        break;
      case 'showAllProducts':
        setSelectedCategory('all');
        setSearchTerm('');
        break;
      case 'clearCart':
        clearCart();
        break;
      case 'savePendingCart':
        savePendingCart();
        break;
              case 'checkoutWithPrint':
          handleCheckout(true);
          break;
        case 'checkoutWithoutPrint':
          handleCheckout(false);
          break;
      case 'clearSearch':
        setSearchTerm('');
        break;
      case 'quickCheckout':
        if (cart.length > 0) handleCheckout();
        break;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products, categories, and users
      const [productsResult, categoriesResult, usersResult] = await Promise.all([
        window.database.products.getAll(),
        window.database.categories.getAll(),
        window.database.users.getAll()
      ]);
      
      if (productsResult.success) {
        setProducts(productsResult.data || []);
      }
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data?.filter(cat => cat.status === 'active') || []);
      }

      if (usersResult.success) {
        setUsers(usersResult.data?.filter(user => user.status === 'active') || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCarts = () => {
    const saved = localStorage.getItem('pos_pending_carts');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPendingCarts(parsed.map((cart: any) => ({
        ...cart,
        createdAt: new Date(cart.createdAt)
      })));
    }
  };

  const savePendingCarts = (carts: PendingCart[]) => {
    localStorage.setItem('pos_pending_carts', JSON.stringify(carts));
    setPendingCarts(carts);
  };

  // Product image component with fallback
  const ProductImage = ({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-10 h-10 text-xs',
      md: 'w-16 h-16 text-sm',
      lg: 'w-24 h-24 text-lg'
    };

    const getInitials = (name: string) => {
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={product.image} alt={product.name} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {getInitials(product.name)}
        </AvatarFallback>
      </Avatar>
    );
  };

  // Enhanced cart operations
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (product.currentStock <= 0) {
      toast.error('Product out of stock');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product?.id === product.id);
      const unitPrice = product.sellingPrice;
      const discount = (product.discountRate || 0) * unitPrice / 100;
      
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > product.currentStock) {
          toast.error('Not enough stock available');
          return prev;
        }
        
        return prev.map(item =>
          item.product?.id === product.id
            ? { 
                ...item, 
                quantity: newQuantity,
                total: (unitPrice - discount) * newQuantity
              }
            : item
        );
      }
      
      const newItem: CartItem = {
        id: Date.now().toString() + Math.random(),
        product,
        quantity,
        unitPrice,
        discount,
        total: (unitPrice - discount) * quantity,
        isCustom: false
      };
      
      return [...prev, newItem];
    });
    
    toast.success(`${product.name} added to cart`);
  }, []);

  const addCustomItemToCart = (customItem: { name: string; price: number; description?: string }, quantity: number = 1) => {
    const newItem: CartItem = {
      id: Date.now().toString() + Math.random(),
      customItem,
      quantity,
      unitPrice: customItem.price,
      discount: 0,
      total: customItem.price * quantity,
      isCustom: true
    };
    
    setCart(prev => [...prev, newItem]);
    toast.success(`${customItem.name} added to cart`);
  };

  const handleAddCustomItem = () => {
    if (!customItemForm.name || customItemForm.price <= 0) {
      toast.error('Please enter a valid name and price');
      return;
    }

    addCustomItemToCart(
      {
        name: customItemForm.name,
        price: customItemForm.price,
        description: customItemForm.description
      },
      customItemForm.quantity
    );

    // Reset form and close modal
    setCustomItemForm({
      name: '',
      price: 0,
      quantity: 1,
      description: ''
    });
    setShowCustomItemModal(false);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.product?.id !== productId));
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.product?.id === productId) {
          if (item.product && newQuantity > item.product.currentStock) {
            toast.error('Not enough stock available');
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            total: (item.unitPrice - item.discount) * newQuantity
          };
        }
        return item;
      })
    );
  };

  const updatePrice = (itemId: string, newPrice: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            unitPrice: newPrice,
            total: (newPrice - item.discount) * item.quantity
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product?.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCurrentPendingCartId(null);
    setCustomerName('');
    toast.success('Cart cleared');
  };

  // Cart calculations
  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getCartTax = () => {
    return cart.reduce((total, item) => {
      const taxRate = item.product?.taxRate || 0;
      return total + (item.total * taxRate / 100);
    }, 0);
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getCartTax();
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Pending cart operations
  const savePendingCart = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const newCart: PendingCart = {
      id: Date.now().toString(),
      name: customerName || `Cart ${pendingCarts.length + 1}`,
      items: [...cart],
      total: getCartTotal(),
      createdAt: new Date(),
      customerName
    };

    const updatedCarts = [...pendingCarts, newCart];
    savePendingCarts(updatedCarts);
    clearCart();
    toast.success('Cart saved successfully');
  };

  const loadPendingCart = (cartId: string) => {
    const pendingCart = pendingCarts.find(cart => cart.id === cartId);
    if (pendingCart) {
      setCart(pendingCart.items);
      setCustomerName(pendingCart.customerName || '');
      setCurrentPendingCartId(cartId);
      setActiveTab('current');
      toast.success('Cart loaded successfully');
    }
  };

  const deletePendingCart = (cartId: string) => {
    const updatedCarts = pendingCarts.filter(cart => cart.id !== cartId);
    savePendingCarts(updatedCarts);
    toast.success('Cart deleted successfully');
  };

  // Quick checkout from pending cart without loading it to current cart
  const quickCheckoutPendingCart = async (pendingCart: PendingCart, printReceipt: boolean = true) => {
    if (pendingCart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const subtotal = pendingCart.items.reduce((total, item) => total + item.total, 0);
      const taxAmount = pendingCart.items.reduce((total, item) => {
        const taxRate = item.product?.taxRate || 0;
        return total + (item.total * taxRate / 100);
      }, 0);
      const total = subtotal + taxAmount;

      const orderData = {
        orderNumber: `POS-${Date.now()}`,
        customerId: null,
        customerName: pendingCart.customerName || 'Walk-in Customer',
        userId: selectedUser?.id || null,
        userAssigned: selectedUser?.name || null,
        subtotal,
        taxAmount,
        totalAmount: total,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        orderDate: new Date().toISOString().split('T')[0],
        itemsCount: pendingCart.items.reduce((count, item) => count + item.quantity, 0),
        receiptPrinted: printReceipt,
        orderItems: pendingCart.items.map(item => ({
          productId: item.product?.id || null,
          productName: item.product?.name || item.customItem?.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
          isCustomItem: item.isCustom
        }))
      };

      const result = await window.database.orders.create(orderData);
      if (result.success) {
        // Create order items after order is successfully created
        const orderItems = pendingCart.items.map(item => ({
          orderId: result.data.id,
          productId: item.product?.id || null,
          productName: item.product?.name || item.customItem?.name,
          productSku: item.product?.sku || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountRate: 0,
          discountAmount: item.discount,
          taxRate: item.product?.taxRate || 0,
          taxAmount: (item.total * (item.product?.taxRate || 0)) / 100,
          totalPrice: item.total,
        }));

        const itemsResult = await window.database.orderItems.createMultiple(orderItems);
        if (itemsResult.success) {
          console.log(`✅ Created ${orderItems.length} order items for pending cart order ${orderData.orderNumber}`);
        } else {
          console.warn(`⚠️ Failed to create order items for pending cart order ${orderData.orderNumber}:`, itemsResult.error);
        }
        
        const assignedText = selectedUser ? ` (Assigned to: ${selectedUser.name})` : '';
        toast.success(`Sale completed! Order #${orderData.orderNumber}${assignedText}`);
        
        // Remove the pending cart after checkout
        const updatedCarts = pendingCarts.filter(cart => cart.id !== pendingCart.id);
        savePendingCarts(updatedCarts);
        
        setShowPendingModal(false);
        loadData(); // Refresh stock levels
      }
    } catch (error) {
      console.error('Quick checkout failed:', error);
      toast.error('Quick checkout failed');
    }
  };

  // Barcode scanning
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchValue = searchTerm.trim() || barcodeInput.trim();
    if (!searchValue) return;

    const product = products.find(p => p.barcode === searchValue);
    if (product) {
      addToCart(product);
      setSearchTerm('');
      setBarcodeInput('');
      toast.success('Product found and added to cart');
    } else {
      toast.error('Product not found');
    }
  };

  // Checkout functions
  const handleCheckout = async (printReceipt: boolean = true) => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const subtotal = getCartSubtotal();
      const taxAmount = getCartTax();
      const total = getCartTotal();

      // Debug logs
      console.log('Selected user at checkout:', selectedUser);
      console.log('Customer name at checkout:', customerName);

      const orderData = {
        orderNumber: `POS-${Date.now()}`,
        customerId: null,
        customerName: customerName || 'Walk-in Customer',
        userId: selectedUser?.id || null,
        userAssigned: selectedUser?.name || null,
        subtotal,
        taxAmount,
        totalAmount: total,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        orderDate: new Date().toISOString().split('T')[0],
        itemsCount: getCartItemCount(),
        receiptPrinted: printReceipt,
        orderItems: cart.map(item => ({
          productId: item.product?.id || null,
          productName: item.product?.name || item.customItem?.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
          isCustomItem: item.isCustom
        }))
      };

      console.log('Order data being sent:', orderData);

      const result = await window.database.orders.create(orderData);
      if (result.success) {
        // Create order items after order is successfully created
        const orderItems = cart.map(item => ({
          orderId: result.data.id,
          productId: item.product?.id || null,
          productName: item.product?.name || item.customItem?.name,
          productSku: item.product?.sku || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountRate: 0,
          discountAmount: item.discount,
          taxRate: item.product?.taxRate || 0,
          taxAmount: (item.total * (item.product?.taxRate || 0)) / 100,
          totalPrice: item.total,
        }));

        const itemsResult = await window.database.orderItems.createMultiple(orderItems);
        if (itemsResult.success) {
          console.log(`✅ Created ${orderItems.length} order items for order ${orderData.orderNumber}`);
        } else {
          console.warn(`⚠️ Failed to create order items for order ${orderData.orderNumber}:`, itemsResult.error);
        }
        
        const assignedText = selectedUser ? ` (Assigned to: ${selectedUser.name})` : '';
        const printText = printReceipt ? ' [Receipt Printed]' : ' [No Receipt]';
        toast.success(`Sale completed! Order #${orderData.orderNumber}${assignedText}${printText}`);
        
        // If this cart was loaded from pending carts, remove it from pending carts
        if (currentPendingCartId) {
          const updatedCarts = pendingCarts.filter(cart => cart.id !== currentPendingCartId);
          savePendingCarts(updatedCarts);
          toast.success('Pending cart removed after checkout');
        }
        
        // Print receipt if requested
        if (printReceipt) {
          await printReceipt_(orderData, cart);
        }
        
        clearCart();
        setSelectedUser(null); // Reset user selection
        loadData(); // Refresh stock levels
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed');
    }
  };

  const handleCheckoutWithPrint = async () => {
    await handleCheckout(true);
  };

  const handleCheckoutWithoutPrint = async () => {
    await handleCheckout(false);
  };

  // Print receipt function
  const printReceipt_ = async (orderData: any, cartItems: CartItem[]) => {
    try {
      // Here you would integrate with your printer
      // For now, we'll simulate printing
      console.log('Printing receipt for order:', orderData.orderNumber);
      
      // You can add actual printer integration here
      // Example: await window.electronAPI.printReceipt(orderData, cartItems);
      
      toast.success('Receipt sent to printer');
    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Print failed - order saved successfully');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    if (!product.isActive) return false;
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter categories to show only non-empty ones
  const nonEmptyCategories = categories.filter(category => {
    return products.some(product => product.categoryId === category.id && product.isActive);
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, product: Product) => {
    // Ensure the product data is valid
    if (!product || !product.id) {
      e.preventDefault();
      return;
    }
    
    // Set drag data immediately
    try {
      const productData = JSON.stringify(product);
      e.dataTransfer.setData('application/json', productData);
      e.dataTransfer.setData('text/plain', product.name); // Fallback
      e.dataTransfer.effectAllowed = 'copy';
      
      // Set dragging state
      setIsDragging(true);
      
      // Add visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    } catch (error) {
      console.error('Failed to set drag data:', error);
      e.preventDefault();
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Try to get product data - check multiple formats
      let productData = e.dataTransfer.getData('application/json');
      
      // If JSON data isn't available, try other formats
      if (!productData) {
        const textData = e.dataTransfer.getData('text/plain');
        if (textData) {
          // Try to find product by name as fallback
          const foundProduct = products.find(p => p.name === textData);
          if (foundProduct) {
            productData = JSON.stringify(foundProduct);
          }
        }
      }
      
      if (!productData) {
        toast.error('Invalid product data - please try again');
        return;
      }
      
      const product = JSON.parse(productData) as Product;
      
      // Validate product data
      if (!product || !product.id) {
        toast.error('Invalid product - please try again');
        return;
      }
      
      // Check stock before adding
      if (product.currentStock <= 0) {
        toast.error(`${product.name} is out of stock!`);
        return;
      }
      
      addToCart(product);
      toast.success(`${product.name} added to cart via drag & drop!`);
    } catch (error) {
      console.error('Failed to add item via drag & drop:', error);
      toast.error('Failed to add item to cart - please try clicking instead');
    } finally {
      setIsDragging(false);
      // Force clear all drag data
      try {
        e.dataTransfer.clearData();
      } catch {
        // Ignore clearing errors
      }
    }
  };

  // Enhanced search that includes users and products
  const performEnhancedSearch = (searchValue: string) => {
    if (!searchValue.trim()) {
      setSearchResults({ products: [], users: [] });
      return;
    }

    const searchLower = searchValue.toLowerCase();
    
    const matchedProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );

    const matchedUsers = users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );

    setSearchResults({ products: matchedProducts, users: matchedUsers });
  };

  // Handle enhanced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performEnhancedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, products, users]);

  // UI Components
  const ProductCard = ({ product }: { product: Product }) => (
    <Card 
      className={`transition-all duration-200 hover:shadow-md hover:scale-102 ${
        product.currentStock <= 0 ? 'opacity-50 cursor-not-allowed' : 
        isDragReady && product.currentStock > 0 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${product.isFeatured ? 'ring-2 ring-yellow-400' : ''} ${
        isDragging ? 'opacity-75' : ''
      }`}
      onClick={() => addToCart(product)}
      draggable={isDragReady && product.currentStock > 0}
      onDragStart={(e) => handleDragStart(e, product)}
      onDragEnd={handleDragEnd}
      title={
        product.currentStock <= 0 ? 'Out of stock' :
        isDragReady ? 'Click to add or drag to cart' : 'Click to add to cart'
      }
    >
      <CardContent className="p-2">
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="relative">
            <ProductImage product={product} size="md" />
            {product.isFeatured && (
              <Star className="absolute -top-0.5 -right-0.5 w-3 h-3 text-yellow-500 fill-current" />
            )}
            {product.currentStock <= (product.minStock || 5) && product.currentStock > 0 && (
              <AlertCircle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-orange-500" />
            )}
          </div>
          
          <div className="w-full">
            <h3 className="font-semibold text-xs mb-1 line-clamp-2 leading-tight">{product.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(product.sellingPrice)}
              </span>
              {product.discountRate && product.discountRate > 0 && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  -{product.discountRate}%
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-0.5 ${
                product.currentStock <= 0 ? 'text-red-500' : 
                product.currentStock <= (product.minStock || 5) ? 'text-orange-500' : 'text-green-500'
              }`}>
                <Package className="w-2.5 h-2.5" />
                {product.currentStock}
              </span>
              {product.category && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                  {product.category.name.slice(0, 8)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card 
      className={`transition-all duration-200 hover:shadow-sm ${
        product.currentStock <= 0 ? 'opacity-50 cursor-not-allowed' : 
        isDragReady && product.currentStock > 0 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'opacity-75' : ''}`}
      onClick={() => addToCart(product)}
      draggable={isDragReady && product.currentStock > 0}
      onDragStart={(e) => handleDragStart(e, product)}
      onDragEnd={handleDragEnd}
      title={
        product.currentStock <= 0 ? 'Out of stock' :
        isDragReady ? 'Click to add or drag to cart' : 'Click to add to cart'
      }
    >
      <CardContent className="p-2">
        <div className="flex items-center space-x-2">
          <ProductImage product={product} size="sm" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs mb-0.5 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-1 line-clamp-1">{product.description}</p>
                <div className="flex items-center gap-1">
                  {product.sku && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">SKU: {product.sku.slice(0, 6)}</Badge>
                  )}
                  {product.category && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">{product.category.name}</Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-2">
                <div className="text-sm font-bold text-green-600 mb-0.5">
                  {formatCurrency(product.sellingPrice)}
                </div>
                <div className={`text-xs ${
                  product.currentStock <= 0 ? 'text-red-500' : 
                  product.currentStock <= (product.minStock || 5) ? 'text-orange-500' : 'text-green-500'
                }`}>
                  Stock: {product.currentStock}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CartListItem = ({ item }: { item: CartItem }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {item.product ? (
            <ProductImage product={item.product} size="sm" />
          ) : (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-purple-500 text-white text-xs font-bold">
                {item.customItem?.name.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        {/* Product Info - Minimal */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {item.product?.name || item.customItem?.name || 'Custom Item'}
          </h4>
          {item.product?.category && (
            <div className="text-xs text-blue-600">{item.product.category.name}</div>
          )}
        </div>
        
        {/* Quantity - Simple */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => item.product && updateQuantity(item.product.id, item.quantity - 1)}
            className="p-0 w-6 h-6 rounded-full border-blue-300"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => item.product && updateQuantity(item.product.id, item.quantity + 1)}
            className="p-0 w-6 h-6 rounded-full border-blue-300"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Total - Prominent */}
        <div className="text-right min-w-[70px]">
          <div className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</div>
        </div>

        {/* Remove */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => item.product && removeFromCart(item.product.id)}
          className="p-0 w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  const CartGridItem = ({ item }: { item: CartItem }) => (
    <div className={`flex-shrink-0 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all duration-200 ${
      isFullscreen ? 'w-44 mb-2' : 'w-44'
    }`}>
      {/* Compact Vertical Card */}
      <div className="flex flex-col h-full">
        {/* Product Header */}
        <div className="flex items-center gap-2 mb-2">
          {item.product ? (
            <ProductImage product={item.product} size="sm" />
          ) : (
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-purple-500 text-white text-xs">
                {item.customItem?.name.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-xs truncate leading-tight">
              {item.product?.name || item.customItem?.name || 'Custom Item'}
            </h4>
            {item.product?.category && (
              <div className="text-xs text-blue-600 truncate">{item.product.category.name}</div>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => item.product && removeFromCart(item.product.id)}
            className="p-0 w-4 h-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
          >
            <X className="w-2 h-2" />
          </Button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-center gap-1 mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => item.product && updateQuantity(item.product.id, item.quantity - 1)}
            className="p-0 w-5 h-5 rounded-full border-blue-300 hover:bg-blue-50"
          >
            <Minus className="w-2 h-2" />
          </Button>
          {editingItem === `qty-${item.id}` ? (
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => item.product && updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
              onBlur={() => setEditingItem(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingItem(null);
              }}
              className="w-10 h-5 text-center text-xs font-bold border-blue-300"
              autoFocus
            />
          ) : (
            <span 
              className="w-8 text-center font-bold cursor-pointer hover:text-blue-600 text-sm bg-blue-50 rounded px-1 py-0.5"
              onClick={() => setEditingItem(`qty-${item.id}`)}
            >
              {item.quantity}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => item.product && updateQuantity(item.product.id, item.quantity + 1)}
            className="p-0 w-5 h-5 rounded-full border-blue-300 hover:bg-blue-50"
          >
            <Plus className="w-2 h-2" />
          </Button>
        </div>

        {/* Price Section */}
        <div className="text-center space-y-1 mb-2">
          {editingItem === item.id ? (
            <Input
              type="number"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
              onBlur={() => setEditingItem(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingItem(null);
              }}
              className="w-full h-5 text-center text-xs font-bold"
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setEditingItem(item.id)}
              className="text-xs font-medium cursor-pointer hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
            >
              {formatCurrency(item.unitPrice)}
            </div>
          )}
          <div className="text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded px-2 py-1 transition-colors">
            {formatCurrency(item.total)}
          </div>
        </div>

        {/* Stock Info */}
        {item.product && (
          <div className="text-center mt-auto">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              item.product.currentStock <= (item.product.minStock || 5) 
                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {item.product.currentStock}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`h-screen flex flex-col bg-gray-50 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>


      {/* Compact Header */}
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('pos.terminal', 'POS Terminal')}</h1>
            </div>
          </div>

          {/* Center: Compact Search & Controls */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder={t('pos.searchPlaceholder', 'Search products, users, SKU...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSubmit(e);
                  }
                }}
                className="pl-9 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              
              {/* Compact Search Results */}
              {searchTerm && (searchResults.products.length > 0 || searchResults.users.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {searchResults.products.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">{t('pos.products', 'Products')}</div>
                      {searchResults.products.slice(0, 4).map(product => (
                        <div 
                          key={product.id}
                          className="flex items-center gap-2 p-1.5 hover:bg-gray-50 cursor-pointer rounded text-sm"
                          onClick={() => {
                            addToCart(product);
                            setSearchTerm('');
                          }}
                        >
                          <ProductImage product={product} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{formatCurrency(product.sellingPrice)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.users.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-1">{t('pos.users', 'Users')}</div>
                      {searchResults.users.slice(0, 3).map(user => (
                        <div 
                          key={user.id}
                          className="flex items-center gap-2 p-1.5 hover:bg-gray-50 cursor-pointer rounded text-sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setCustomerName(user.name); // Auto-set customer name to user name
                            setSearchTerm('');
                            toast.success(t('pos.assignedToUser', 'Assigned to {{user}}', { user: user.name }));
                          }}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowCustomItemModal(true)}
              size="sm"
              className="h-9 px-3 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowKeyboardHelp(true)} 
              className="h-9 px-3"
              title={t('pos.keyboardShortcuts', 'Keyboard Shortcuts')}
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="h-9 px-3" title={t('pos.toggleView', 'Toggle View')}>
              {view === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (isFullscreen) {
                  document.exitFullscreen?.();
                } else {
                  document.documentElement.requestFullscreen?.();
                }
                setIsFullscreen(!isFullscreen);
              }} 
              className="h-9 px-3"
              title={t('pos.fullscreen', 'Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Modern Top Control Panel */}
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {/* Compact Statistics Row */}
          <div className="flex items-center justify-between">
            {/* Left Statistics & Controls */}
            <div className="flex items-center gap-4">
              {/* User Assignment - Clickable Icon */}
              <div className="relative">
                <div 
                  onClick={() => {
                    console.log('User selector clicked, current state:', showUserSelector);
                    setShowUserSelector(!showUserSelector);
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {selectedUser ? `${selectedUser.name}${customerName && customerName !== selectedUser.name ? ` (${customerName})` : ''}` : t('pos.user', 'User')}
                  </span>
                </div>
                
                {/* User Dropdown */}
                {showUserSelector && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => {
                        console.log('Modal backdrop clicked, closing modal. Customer name at close:', customerName);
                        setShowUserSelector(false);
                      }}
                    />
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-3 space-y-2">
                        <Input
                          placeholder={t('pos.enterCustomerName', 'Enter customer name...')}
                          value={customerName}
                          onChange={(e) => {
                            console.log('Customer name input changed:', e.target.value);
                            setCustomerName(e.target.value);
                          }}
                          className="h-8 text-sm"
                        />
                        <div className="border-t pt-2">
                          <div className="text-xs text-gray-500 mb-1">{t('pos.selectUser', 'Assign User:')}</div>
                          
                          {/* Clear Assignment Button */}
                          {selectedUser && (
                            <div
                              onClick={() => {
                                setSelectedUser(null);
                                setCustomerName('');
                                setShowUserSelector(false);
                                toast.success('User assignment cleared');
                              }}
                              className="flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-colors bg-red-50 hover:bg-red-100 border border-red-200 mb-2"
                            >
                              <X className="w-4 h-4 text-red-600" />
                              <div className="flex-1">
                                <div className="font-medium text-red-700">Clear Assignment</div>
                                <div className="text-xs text-red-500">Remove user assignment</div>
                              </div>
                            </div>
                          )}
                          
                          {users.map(user => (
                            <div
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setCustomerName(user.name); // Auto-set customer name to user name
                                setShowUserSelector(false);
                                toast.success(t('pos.assignedToUser', 'Assigned to {{user}}', { user: user.name }));
                              }}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-colors ${
                                selectedUser?.id === user.id 
                                  ? 'bg-blue-100 border border-blue-200' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <User className={`w-4 h-4 ${selectedUser?.id === user.id ? 'text-blue-600' : 'text-gray-500'}`} />
                              <div className="flex-1">
                                <div className={`font-medium ${selectedUser?.id === user.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                selectedUser?.id === user.id 
                                  ? 'bg-blue-200 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Products Count */}
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">{filteredProducts.length}</span>
              </div>

              {/* Cart Items */}
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-bold text-purple-600">{getCartItemCount()}</span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-700">{formatCurrency(getCartSubtotal())}</span>
              </div>

              {/* Tax */}
              {getCartTax() > 0 && (
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(getCartTax())}</span>
                </div>
              )}
            </div>
            
            {/* Big Total Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200">
              <div className="text-xs text-green-700 font-medium mb-1">TOTAL</div>
              <div className="text-4xl font-bold text-green-600">
                {formatCurrency(getCartTotal())}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products Section - Main Area */}
        <div className="flex flex-col overflow-hidden flex-1">
          {/* Product Controls */}
          <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Direct Category Navigation */}
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={`h-7 px-3 text-sm transition-all relative ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  All
                  <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {products.filter(p => p.isActive).length}
                  </span>
                </Button>
                {nonEmptyCategories.slice(0, 6).map(category => {
                  const categoryProductCount = products.filter(p => p.categoryId === category.id && p.isActive).length;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`h-7 px-3 text-sm transition-all relative ${
                        selectedCategory === category.id 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {category.name.length > 8 ? category.name.substring(0, 8) + '...' : category.name}
                      <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {categoryProductCount}
                      </span>
                    </Button>
                  );
                })}
                
                {/* More Categories */}
                {nonEmptyCategories.length > 6 && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="h-7 px-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">More...</option>
                    {nonEmptyCategories.slice(6).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({products.filter(p => p.categoryId === category.id && p.isActive).length})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {searchTerm && `"${searchTerm}"`}
              </div>
            </div>
          </div>

          {/* Products Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Package className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">{t('pos.noProducts', 'No products found')}</p>
                <p className="text-sm">{t('pos.tryAdjustingSearch', 'Try adjusting your search or category filter')}</p>
              </div>
            ) : (
              <div className={`${
                view === 'grid' 
                  ? `grid gap-2 ${
                      isFullscreen 
                        ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12'
                        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
                    }`
                  : 'space-y-1.5'
              }`}>
                {filteredProducts.map((product) => (
                  view === 'grid' ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <ProductListItem key={product.id} product={product} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart & Orders List - Always Right Side */}
        <div className={`bg-white border-gray-200 flex flex-col overflow-hidden ${
          isFullscreen ? 'w-96' : 'w-80'
        }`}>
          {/* Sidebar Header */}
          <div className="flex-none px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">{t('pos.cart', 'Cart')} ({getCartItemCount()})</span>
              </h3>
              <div className="flex items-center gap-1">
                {/* Cart View Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCartView(cartView === 'grid' ? 'list' : 'grid')}
                  className="h-6 px-2 text-xs hover:bg-blue-50"
                  title={`Switch to ${cartView === 'grid' ? 'List' : 'Grid'} View`}
                >
                  {cartView === 'grid' ? <List className="w-3 h-3" /> : <Grid3X3 className="w-3 h-3" />}
                </Button>
                
                {/* Save Cart */}
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={savePendingCart}
                    className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
                    title={t('pos.saveCart', 'Save Cart')}
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                )}
                
                {/* Pending Carts Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPendingModal(true)}
                  className={`h-6 px-2 text-xs ${
                    pendingCarts.length > 0 
                      ? 'text-blue-600 hover:bg-blue-50' 
                      : 'text-gray-400 cursor-default'
                  }`}
                  disabled={pendingCarts.length === 0}
                  title={`${pendingCarts.length} Pending Carts`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {pendingCarts.length}
                </Button>

                {/* Clear Cart */}
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title={t('pos.clearCart', 'Clear Cart')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Cart Items - Dynamic Layout */}
          <div className="flex-1 overflow-hidden">
            {cart.length === 0 ? (
              <div 
                className={`flex flex-col items-center justify-center h-full text-gray-500 p-4 border-2 border-dashed rounded-lg m-2 transition-colors ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ShoppingCart className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-400' : 'text-gray-300'}`} />
                <p className="text-sm font-medium mb-1">{isDragging ? t('pos.dropProductHere', 'Drop product here!') : t('pos.cartEmpty', 'Cart is empty')}</p>
                <p className="text-xs text-center">{isDragging ? t('pos.releaseToAdd', 'Release to add to cart') : t('pos.addProductsHint', 'Add products by clicking or drag & drop here')}</p>
              </div>
            ) : cartView === 'list' ? (
              /* List View - Vertical Scrolling */
              <div 
                className="h-full overflow-y-auto p-2"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-2">
                  {cart.map((item) => (
                    <CartListItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              /* Grid View - Horizontal Scrolling */
              <div 
                className="h-full overflow-x-auto overflow-y-hidden"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`flex gap-2 p-2 h-full ${isFullscreen ? 'flex-wrap' : ''}`}>
                  {cart.map((item) => (
                    <CartGridItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Fixed Checkout Button at Bottom */}
          {cart.length > 0 && (
            <div className="flex-none p-3 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 space-y-2">
              {/* Primary Checkout with Print */}
              <Button
                onClick={() => handleCheckout(true)}
                className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold text-lg shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {t('pos.checkoutAndPrint', 'Checkout & Print')} ({formatCurrency(getCartTotal())})
              </Button>
              
              {/* Secondary Checkout without Print */}
              <Button
                onClick={() => handleCheckout(false)}
                variant="outline"
                className="w-full h-8 text-sm border-green-300 text-green-700 hover:bg-green-50"
              >
                <Receipt className="w-4 h-4 mr-2" />
                {t('pos.checkoutNoPrint', 'Checkout without Print')} (F11)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same but more compact */}
      {/* Custom Item Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-4 h-4" />
                {t('pos.addCustomItem', 'Add Custom Item')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('pos.itemName', 'Item Name')} *</label>
                <Input
                  placeholder={t('pos.enterItemName', 'Enter item name')}
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm(prev => ({ ...prev, name: e.target.value }))}
                  className="h-8"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('pos.price', 'Price')} *</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t('pos.pricePlaceholder', '0.00')}
                    value={customItemForm.price}
                    onChange={(e) => setCustomItemForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('pos.quantity', 'Quantity')}</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={t('pos.quantityPlaceholder', '1')}
                    value={customItemForm.quantity}
                    onChange={(e) => setCustomItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="h-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('pos.description', 'Description')}</label>
                <Input
                  placeholder={t('pos.optionalDescription', 'Optional description')}
                  value={customItemForm.description}
                  onChange={(e) => setCustomItemForm(prev => ({ ...prev, description: e.target.value }))}
                  className="h-8"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => setShowCustomItemModal(false)}
                  variant="outline"
                  className="flex-1 h-8"
                >
                  {t('pos.cancel', 'Cancel')}
                </Button>
                <Button 
                  onClick={handleAddCustomItem}
                  disabled={!customItemForm.name || customItemForm.price <= 0}
                  className="flex-1 h-8"
                >
                  {t('pos.addToCart', 'Add to Cart')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Carts Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Pending Carts ({pendingCarts.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPendingModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingCarts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Clock className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Pending Carts</p>
                  <p className="text-sm text-center">Save your current cart to create pending orders</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {pendingCarts.map((pendingCart) => (
                      <div key={pendingCart.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900">{pendingCart.name}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>{pendingCart.items.length} items</span>
                              <span>{new Date(pendingCart.createdAt).toLocaleDateString()}</span>
                              {pendingCart.customerName && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {pendingCart.customerName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 text-sm">
                              {formatCurrency(pendingCart.total)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Items Preview */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Items:</div>
                          <div className="space-y-1">
                            {pendingCart.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                                <span className="truncate">
                                  {item.product?.name || item.customItem?.name} × {item.quantity}
                                </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(item.total)}
                                </span>
                              </div>
                            ))}
                            {pendingCart.items.length > 3 && (
                              <div className="text-xs text-gray-400 text-center py-1">
                                +{pendingCart.items.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => {
                                loadPendingCart(pendingCart.id);
                                setShowPendingModal(false);
                              }}
                              className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              Load
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                quickCheckoutPendingCart(pendingCart, true);
                              }}
                              className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Pay & Print
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                deletePendingCart(pendingCart.id);
                              }}
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              quickCheckoutPendingCart(pendingCart, false);
                            }}
                            variant="outline"
                            className="w-full h-6 text-xs border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <Receipt className="w-3 h-3 mr-1" />
                            Pay No Print
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Clear All Button */}
                  {pendingCarts.length > 0 && (
                    <div className="border-t border-gray-200 p-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPendingCarts([]);
                          savePendingCarts([]);
                          toast.success('All pending carts cleared');
                          setShowPendingModal(false);
                        }}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Pending Carts
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Keyboard className="w-5 h-5 text-white" />
                </div>
                Keyboard Shortcuts & Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Function Keys */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">Function Keys</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F1</kbd>
                        <span className="text-sm">Toggle View Mode</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Grid3X3 className="w-3 h-3" />
                        <List className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F2</kbd>
                        <span className="text-sm">Toggle Fullscreen</span>
                      </div>
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F3</kbd>
                        <span className="text-sm">Focus Search</span>
                      </div>
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F4</kbd>
                        <span className="text-sm">Barcode Scan</span>
                      </div>
                      <Scan className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F5</kbd>
                        <span className="text-sm">Show All Products</span>
                      </div>
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Action Keys */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-600">Action Keys</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F8</kbd>
                        <span className="text-sm">Clear Cart</span>
                      </div>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F9</kbd>
                        <span className="text-sm">Save Cart</span>
                      </div>
                      <Save className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-green-200 rounded text-xs font-mono">F10</kbd>
                        <span className="text-sm font-semibold">Checkout & Print</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-blue-200 rounded text-xs font-mono">F11</kbd>
                        <span className="text-sm font-semibold">Checkout No Print</span>
                      </div>
                      <Receipt className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">ESC</kbd>
                        <span className="text-sm">Clear Search</span>
                      </div>
                      <X className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Enter</kbd>
                        <span className="text-sm">Quick Checkout</span>
                      </div>
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Pro tip: Use drag & drop to add products to cart
                  </p>
                  <Button 
                    onClick={() => setShowKeyboardHelp(false)} 
                    className="px-6"
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}