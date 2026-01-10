import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      showToast(error.message || 'Failed to load order', 'error');
      navigate('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold mb-2">Order not found</p>
        <Link
          to="/dashboard/orders"
          className="text-brand-black dark:text-brand-accent hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const status = orderStatusMap[order.status] || orderStatusMap.pending;
  
  // Transform order items for display
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
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/dashboard/orders"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">{order.orderNumber}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Placed on{' '}
            {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="ml-auto">
          <span
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${status.bgColor} ${status.textColor}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => {
                const transformedItem = transformOrderItem(item);
                return (
                  <div
                    key={item._id || idx}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                      <img
                        src={transformedItem.image}
                        alt={transformedItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold mb-1">{transformedItem.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transformedItem.color} · {transformedItem.size} · Quantity: {transformedItem.qty}
                      </p>
                      {item.customization && (
                        <p className="text-xs text-brand-accent mt-1">Custom Design</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(transformedItem.price * transformedItem.qty)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatPrice(transformedItem.price)} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-semibold">{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={20} className="text-brand-black dark:text-brand-accent" />
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-semibold">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.address}</p>
              {order.shippingAddress.landmark && (
                <p className="text-gray-500 dark:text-gray-500 italic">
                  Near: {order.shippingAddress.landmark}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.country}</p>
              <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-xl font-bold">Order Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {order.deliveredAt && (
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivered On</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {order.trackingNumber && (
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tracking Number</p>
                    <p className="text-sm font-semibold">{order.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={20} className="text-brand-black dark:text-brand-accent" />
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>
            <p className="font-semibold">
              {order.paymentMethod === 'card'
                ? 'Credit / Debit Card'
                : order.paymentMethod === 'esewa'
                ? 'eSewa'
                : order.paymentMethod === 'cod'
                ? 'Cash on Delivery'
                : 'N/A'}
            </p>
            {order.paymentStatus && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status: <span className="font-semibold capitalize">{order.paymentStatus}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

