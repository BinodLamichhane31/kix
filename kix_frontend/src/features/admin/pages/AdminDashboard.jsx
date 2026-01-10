import { TrendingUp, DollarSign, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as dashboardService from '../../../services/api/dashboard.service';
import * as orderService from '../../../services/api/order.service';
import { formatPrice } from '../../../utils/currency';
import { Link } from 'react-router-dom';
import { useToast } from '../../../store/contexts/ToastContext';

// Order status mapping
const adminOrderStatusMap = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  confirmed: {
    label: 'Confirmed',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  processing: {
    label: 'Processing',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  shipped: {
    label: 'Shipped',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
  },
  delivered: {
    label: 'Delivered',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
  },
};

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsData = await dashboardService.getAdminStats();
      setStats(statsData);

      // Load recent orders
      const ordersResponse = await orderService.getAllOrders({ limit: 5 });
      setRecentOrders(ordersResponse.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: stats.revenueGrowth !== 0 ? `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%` : null,
      isPositive: stats.revenueGrowth >= 0,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      change: stats.orderGrowth !== 0 ? `${stats.orderGrowth >= 0 ? '+' : ''}${stats.orderGrowth.toFixed(1)}%` : null,
      isPositive: stats.orderGrowth >= 0,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'users',
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: stats.userGrowth !== 0 ? `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth.toFixed(1)}%` : null,
      isPositive: stats.userGrowth >= 0,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'products',
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      change: null,
      isPositive: null,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-black mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-bold">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-bold text-green-600 dark:text-green-400">{stats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
              <span className="font-bold text-red-600 dark:text-red-400">{stats.cancelledOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-brand-black dark:text-brand-accent hover:underline flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const status = adminOrderStatusMap[order.status] || adminOrderStatusMap.pending;
                const orderId = order._id || order.id;
                const user = order.user || {};
                return (
                  <Link
                    key={orderId}
                    to={`/admin/orders/${orderId}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.name || 'N/A'} · {user.email || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${status.bgColor} ${status.textColor}`}
                      >
                        {status.label}
                      </span>
                      <span className="font-bold">{formatPrice(order.total)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

