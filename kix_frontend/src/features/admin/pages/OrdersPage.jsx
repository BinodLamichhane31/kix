import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Search, Eye, Edit, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as orderService from '../../../services/api/order.service';
import { formatPrice } from '../../../utils/currency';
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

export default function OrdersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        limit: 50,
      };
      const response = await orderService.getAllOrders(filters);
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
      const user = order.user || {};
      const matchesCustomer = 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);
      return matchesOrderNumber || matchesCustomer;
    });
  }, [orders, searchQuery]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
      
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Reload orders to get updated data
      await loadOrders();
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(error.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingStatus((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Orders</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage and track all orders
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
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-brand-black/40 border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Order Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {filteredOrders.map((order) => {
                  const status = adminOrderStatusMap[order.status] || adminOrderStatusMap.pending;
                  const orderId = order._id || order.id;
                  const user = order.user || {};
                  const isUpdating = updatingStatus[orderId];
                  
                  return (
                    <tr key={orderId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{order.orderNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{user.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.paymentMethod === 'card' ? 'Card' : order.paymentMethod === 'esewa' ? 'eSewa' : order.paymentMethod === 'cod' ? 'COD' : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          disabled={isUpdating}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border-none outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${status.bgColor} ${status.textColor}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {isUpdating && (
                          <Loader2 size={14} className="inline-block ml-2 animate-spin" />
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/orders/${orderId}`}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-semibold mb-2">No orders found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No orders yet'}
          </p>
        </div>
      )}
    </div>
  );
}

