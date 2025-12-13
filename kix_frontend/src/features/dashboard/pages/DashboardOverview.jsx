import { Link } from 'react-router-dom';
import { Package, TrendingUp, Heart, MapPin, ShoppingBag, ArrowRight, Eye } from 'lucide-react';
import { mockDashboardStats, mockOrders, mockWishlist } from '../data/dummyData';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';
import { orderStatusMap } from '../data/dummyData';

export default function DashboardOverview() {
  const recentOrders = mockOrders.slice(0, 3);
  const recentWishlist = mockWishlist.slice(0, 3);

  const statCards = [
    {
      id: 'total-orders',
      label: 'Total Orders',
      value: mockDashboardStats.totalOrders,
      icon: Package,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: mockDashboardStats.pendingOrders,
      icon: ShoppingBag,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'total-spent',
      label: 'Total Spent',
      value: formatPrice(mockDashboardStats.totalSpent),
      icon: TrendingUp,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    },
    {
      id: 'wishlist',
      label: 'Wishlist Items',
      value: mockDashboardStats.wishlistItems,
      icon: Heart,
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening with your orders.
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
              </div>
              <div>
                <p className="text-2xl font-black mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link
              to="/dashboard/orders"
              className="text-sm font-semibold text-brand-black dark:text-brand-accent hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const status = orderStatusMap[order.status];
                return (
                  <Link
                    key={order.id}
                    to={`/dashboard/orders/${order.id}`}
                    className="block p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${status.bgColor} ${status.textColor}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold mt-3">{formatPrice(order.total)}</p>
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

        {/* Wishlist */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Wishlist</h2>
            <Link
              to="/dashboard/wishlist"
              className="text-sm font-semibold text-brand-black dark:text-brand-accent hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentWishlist.length > 0 ? (
            <div className="space-y-4">
              {recentWishlist.map((item) => (
                <Link
                  key={item.id}
                  to={`${appRoutes.product(item.productId)}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.color}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                      {item.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(item.originalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  {!item.inStock && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      Out of Stock
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Heart size={48} className="mx-auto mb-3 opacity-50" />
              <p>Your wishlist is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/orders"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-black dark:hover:border-brand-accent hover:bg-brand-accent/5 dark:hover:bg-brand-accent/10 transition-colors"
          >
            <Package size={24} className="text-brand-black dark:text-brand-accent" />
            <span className="font-semibold">View Orders</span>
          </Link>
          <Link
            to="/dashboard/addresses"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-black dark:hover:border-brand-accent hover:bg-brand-accent/5 dark:hover:bg-brand-accent/10 transition-colors"
          >
            <MapPin size={24} className="text-brand-black dark:text-brand-accent" />
            <span className="font-semibold">Manage Addresses</span>
          </Link>
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-black dark:hover:border-brand-accent hover:bg-brand-accent/5 dark:hover:bg-brand-accent/10 transition-colors"
          >
            <Eye size={24} className="text-brand-black dark:text-brand-accent" />
            <span className="font-semibold">Edit Profile</span>
          </Link>
          <Link
            to={appRoutes.shop}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-black dark:hover:border-brand-accent hover:bg-brand-accent/5 dark:hover:bg-brand-accent/10 transition-colors"
          >
            <ShoppingBag size={24} className="text-brand-black dark:text-brand-accent" />
            <span className="font-semibold">Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

