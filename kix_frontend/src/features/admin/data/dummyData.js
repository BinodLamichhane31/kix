// Admin panel dummy data structured for easy backend integration

// Admin dashboard stats
export const adminStats = {
  totalRevenue: 1250000, // NPR
  totalOrders: 342,
  totalUsers: 1248,
  totalProducts: 156,
  pendingOrders: 23,
  completedOrders: 289,
  cancelledOrders: 30,
  revenueGrowth: 12.5, // percentage
  orderGrowth: 8.3,
  userGrowth: 15.2,
};

// Recent orders for admin
export const adminRecentOrders = [
  {
    id: 'ORD-001',
    orderNumber: 'KIX-2024-001234',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'processing',
    total: 24580,
    date: '2024-03-25T10:30:00Z',
    paymentMethod: 'card',
  },
  {
    id: 'ORD-002',
    orderNumber: 'KIX-2024-001233',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    status: 'shipped',
    total: 18500,
    date: '2024-03-24T14:20:00Z',
    paymentMethod: 'esewa',
  },
  {
    id: 'ORD-003',
    orderNumber: 'KIX-2024-001232',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    status: 'delivered',
    total: 32500,
    date: '2024-03-23T09:15:00Z',
    paymentMethod: 'card',
  },
  {
    id: 'ORD-004',
    orderNumber: 'KIX-2024-001231',
    customerName: 'Alice Williams',
    customerEmail: 'alice@example.com',
    status: 'cancelled',
    total: 21500,
    date: '2024-03-22T16:45:00Z',
    paymentMethod: 'esewa',
  },
];

// Admin products (simplified for management)
export const adminProducts = [
  {
    id: 'prod_001',
    name: 'Air Walker V2',
    sku: 'KIX-AWV2-001',
    category: 'Lifestyle',
    price: 185,
    stock: 45,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    sales: 124,
    revenue: 22940,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'prod_002',
    name: 'Nova Glide',
    sku: 'KIX-NG-002',
    category: 'Running',
    price: 165,
    stock: 32,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    sales: 98,
    revenue: 16170,
    createdAt: '2024-02-10T14:30:00Z',
  },
  {
    id: 'prod_003',
    name: 'Elite Runner Pro',
    sku: 'KIX-ERP-003',
    category: 'Running',
    price: 210,
    stock: 0,
    status: 'out_of_stock',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    sales: 87,
    revenue: 18270,
    createdAt: '2024-01-20T11:20:00Z',
  },
  {
    id: 'prod_004',
    name: 'Urban Strike',
    sku: 'KIX-US-004',
    category: 'Lifestyle',
    price: 185,
    stock: 28,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200&auto=format&fit=crop',
    sales: 156,
    revenue: 28860,
    createdAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'prod_005',
    name: 'Speed Max Ultra',
    sku: 'KIX-SMU-005',
    category: 'Basketball',
    price: 215,
    stock: 15,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop',
    sales: 73,
    revenue: 15695,
    createdAt: '2024-02-15T16:00:00Z',
  },
  {
    id: 'prod_006',
    name: 'Storm Chaser',
    sku: 'KIX-SC-006',
    category: 'Limited Edition',
    price: 250,
    stock: 8,
    status: 'low_stock',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop',
    sales: 42,
    revenue: 10500,
    createdAt: '2024-03-01T12:30:00Z',
  },
];

// Admin users
export const adminUsers = [
  {
    id: 'user_001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+977 98XXXXXXXX',
    role: 'customer',
    status: 'active',
    totalOrders: 12,
    totalSpent: 45230,
    lastLogin: '2024-03-25T08:30:00Z',
    joinedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user_002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+977 98XXXXXXXX',
    role: 'customer',
    status: 'active',
    totalOrders: 8,
    totalSpent: 32100,
    lastLogin: '2024-03-24T14:20:00Z',
    joinedAt: '2024-02-10T14:30:00Z',
  },
  {
    id: 'user_003',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    phone: '+977 98XXXXXXXX',
    role: 'customer',
    status: 'active',
    totalOrders: 15,
    totalSpent: 67500,
    lastLogin: '2024-03-23T09:15:00Z',
    joinedAt: '2024-01-20T11:20:00Z',
  },
  {
    id: 'user_004',
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice@example.com',
    phone: '+977 98XXXXXXXX',
    role: 'customer',
    status: 'inactive',
    totalOrders: 5,
    totalSpent: 18200,
    lastLogin: '2024-03-10T16:45:00Z',
    joinedAt: '2024-01-05T09:00:00Z',
  },
];

// Order status map for admin
export const adminOrderStatusMap = {
  processing: { label: 'Processing', color: 'blue', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300' },
  shipped: { label: 'Shipped', color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-300' },
  delivered: { label: 'Delivered', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' },
  cancelled: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-300' },
};

// Product status map
export const productStatusMap = {
  active: { label: 'Active', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' },
  out_of_stock: { label: 'Out of Stock', color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-300' },
  low_stock: { label: 'Low Stock', color: 'yellow', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-300' },
  inactive: { label: 'Inactive', color: 'gray', bgColor: 'bg-gray-100 dark:bg-gray-900/30', textColor: 'text-gray-700 dark:text-gray-300' },
};

// User status map
export const userStatusMap = {
  active: { label: 'Active', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' },
  inactive: { label: 'Inactive', color: 'gray', bgColor: 'bg-gray-100 dark:bg-gray-900/30', textColor: 'text-gray-700 dark:text-gray-300' },
  suspended: { label: 'Suspended', color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-300' },
};

