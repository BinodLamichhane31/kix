import { TrendingUp, DollarSign, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminStats, adminRecentOrders, adminOrderStatusMap } from '../data/dummyData';
import { formatPrice } from '../../../utils/currency';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const statCards = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: formatPrice(adminStats.totalRevenue),
      icon: DollarSign,
      change: `+${adminStats.revenueGrowth}%`,
      isPositive: true,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: adminStats.totalOrders,
      icon: ShoppingBag,
      change: `+${adminStats.orderGrowth}%`,
      isPositive: true,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'users',
      label: 'Total Users',
      value: adminStats.totalUsers.toLocaleString(),
      icon: Users,
      change: `+${adminStats.userGrowth}%`,
      isPositive: true,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'products',
      label: 'Total Products',
      value: adminStats.totalProducts,
      icon: Package,
      change: null,
      isPositive: null,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    },
  ];

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
              <span className="font-bold">{adminStats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-bold text-green-600 dark:text-green-400">{adminStats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
              <span className="font-bold text-red-600 dark:text-red-400">{adminStats.cancelledOrders}</span>
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

          <div className="space-y-3">
            {adminRecentOrders.map((order) => {
              const status = adminOrderStatusMap[order.status];
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customerName} · {order.customerEmail}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(order.date).toLocaleDateString('en-US', {
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

