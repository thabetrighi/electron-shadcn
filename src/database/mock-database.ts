// Mock database implementation for development
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
let users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://github.com/shadcn.png',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let products: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for professionals',
    price: 2499.99,
    category: 'Electronics',
    stock: 15,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug with company logo',
    price: 12.99,
    category: 'Kitchen',
    stock: 100,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let orders: Order[] = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    quantity: 1,
    totalAmount: 2499.99,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextUserId = 3;
let nextProductId = 3;
let nextOrderId = 2;

// User operations
export const userService = {
  async getAll(search?: string): Promise<{ success: boolean; data: User[] }> {
    let result = users;
    if (search) {
      result = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    return { success: true, data: result };
  },

  async getById(id: number): Promise<{ success: boolean; data: User | null }> {
    const user = users.find(u => u.id === id);
    return { success: true, data: user || null };
  },

  async create(userData: Partial<User>): Promise<{ success: boolean; data: User }> {
    const user: User = {
      id: nextUserId++,
      name: userData.name || '',
      email: userData.email || '',
      avatar: userData.avatar,
      role: userData.role || 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
    return { success: true, data: user };
  },

  async update(id: number, userData: Partial<User>): Promise<{ success: boolean; data: User | null }> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, data: null };
    
    users[index] = { 
      ...users[index], 
      ...userData, 
      updatedAt: new Date().toISOString() 
    };
    return { success: true, data: users[index] };
  },

  async delete(id: number): Promise<{ success: boolean; data: boolean }> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, data: false };
    
    users.splice(index, 1);
    return { success: true, data: true };
  },
};

// Product operations
export const productService = {
  async getAll(search?: string): Promise<{ success: boolean; data: Product[] }> {
    let result = products;
    if (search) {
      result = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return { success: true, data: result };
  },

  async getById(id: number): Promise<{ success: boolean; data: Product | null }> {
    const product = products.find(p => p.id === id);
    return { success: true, data: product || null };
  },

  async create(productData: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    const product: Product = {
      id: nextProductId++,
      name: productData.name || '',
      description: productData.description,
      price: productData.price || 0,
      category: productData.category || '',
      stock: productData.stock || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(product);
    return { success: true, data: product };
  },

  async update(id: number, productData: Partial<Product>): Promise<{ success: boolean; data: Product | null }> {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return { success: false, data: null };
    
    products[index] = { 
      ...products[index], 
      ...productData, 
      updatedAt: new Date().toISOString() 
    };
    return { success: true, data: products[index] };
  },

  async delete(id: number): Promise<{ success: boolean; data: boolean }> {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return { success: false, data: false };
    
    products.splice(index, 1);
    return { success: true, data: true };
  },

  async getByCategory(category: string): Promise<{ success: boolean; data: Product[] }> {
    const result = products.filter(p => p.category === category);
    return { success: true, data: result };
  },
};

// Order operations with joined data
export const orderService = {
  async getAll(): Promise<{ success: boolean; data: any[] }> {
    const ordersWithDetails = orders.map(order => {
      const user = users.find(u => u.id === order.userId);
      const product = products.find(p => p.id === order.productId);
      return {
        ...order,
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
        product: product ? { id: product.id, name: product.name, price: product.price, category: product.category } : null,
      };
    });
    return { success: true, data: ordersWithDetails };
  },

  async getById(id: number): Promise<{ success: boolean; data: any | null }> {
    const order = orders.find(o => o.id === id);
    if (!order) return { success: true, data: null };

    const user = users.find(u => u.id === order.userId);
    const product = products.find(p => p.id === order.productId);
    
    const orderWithDetails = {
      ...order,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      product: product ? { id: product.id, name: product.name, price: product.price, category: product.category } : null,
    };
    
    return { success: true, data: orderWithDetails };
  },

  async create(orderData: Partial<Order>): Promise<{ success: boolean; data: Order }> {
    const order: Order = {
      id: nextOrderId++,
      userId: orderData.userId || 0,
      productId: orderData.productId || 0,
      quantity: orderData.quantity || 1,
      totalAmount: orderData.totalAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(order);
    return { success: true, data: order };
  },

  async update(id: number, orderData: Partial<Order>): Promise<{ success: boolean; data: Order | null }> {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return { success: false, data: null };
    
    orders[index] = { 
      ...orders[index], 
      ...orderData, 
      updatedAt: new Date().toISOString() 
    };
    return { success: true, data: orders[index] };
  },

  async delete(id: number): Promise<{ success: boolean; data: boolean }> {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return { success: false, data: false };
    
    orders.splice(index, 1);
    return { success: true, data: true };
  },

  async getByUserId(userId: number): Promise<{ success: boolean; data: any[] }> {
    const userOrders = orders.filter(o => o.userId === userId);
    const ordersWithDetails = userOrders.map(order => {
      const product = products.find(p => p.id === order.productId);
      return {
        ...order,
        product: product ? { id: product.id, name: product.name, price: product.price, category: product.category } : null,
      };
    });
    return { success: true, data: ordersWithDetails };
  },
};

export const mockDatabase = {
  async initialize(): Promise<{ success: boolean }> {
    console.log('Mock database initialized');
    return { success: true };
  },
  
  users: userService,
  products: productService,
  orders: orderService,
}; 