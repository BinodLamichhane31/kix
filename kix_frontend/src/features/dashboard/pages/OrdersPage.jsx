import { Link } from 'react-router-dom';
import { Package, Search, ArrowRight, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import * as orderService from '../../../services/api/order.service';
import { formatPrice } from '../../../utils/currency';
import { useToast } from '../../../store/contexts/ToastContext';

// Order status mapping
const orderStatusMap = {
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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50,
      };
      const response = await orderService.getOrders(filters);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast(error.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) {
      return orders;
    }
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query);
      const matchesItems = order.items?.some((item) => {
        const product = item.product;
        return product?.name?.toLowerCase().includes(query);
      });
      return matchesOrderNumber || matchesItems;
    });
  }, [orders, searchQuery]);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Transform order data for display
  const transformOrderItem = (item) => {
    const product = item.product || {};
    const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5050';
    let image = item.productImage || product.image || '/placeholder-shoe.jpg';
    if (image && image.startsWith('/uploads/')) {
      image = `${API_BASE}${image}`;
    }
    return {
      name: item.productName || product.name || 'Product',
      color: item.color || 'N/A',
      size: item.size || 'N/A',
      price: item.price || 0,
      qty: item.quantity || 1,
      image,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Orders</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track and manage your orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm font-medium focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
              <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
            </div>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const status = orderStatusMap[order.status] || orderStatusMap.pending;
            const orderId = order._id || order.id;
            return (
              <div
                key={orderId}
                className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Placed on{' '}
                          {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                            month: 'long',
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

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {order.items?.map((item, idx) => {
                        const transformedItem = transformOrderItem(item);
                        return (
                          <div key={item._id || idx} className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                              <img
                                src={transformedItem.image}
                                alt={transformedItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{transformedItem.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {transformedItem.color} · {transformedItem.size} · Qty: {transformedItem.qty}
                              </p>
                            </div>
                            {idx < order.items.length - 1 && (
                              <div className="w-px h-12 bg-gray-200 dark:bg-white/10 mx-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        <span className="font-semibold">Total:</span>{' '}
                        <span className="font-bold text-base">{formatPrice(order.total)}</span>
                      </span>
                      {order.trackingNumber && (
                        <span>
                          <span className="font-semibold">Tracking:</span> {order.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="lg:ml-6">
                    <Link
                      to={`/dashboard/orders/${orderId}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                    >
                      <Eye size={18} />
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-lg font-semibold mb-2">No orders found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You haven\'t placed any orders yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

