import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Calendar } from 'lucide-react';
import { mockOrders, orderStatusMap } from '../data/dummyData';
import { formatPrice } from '../../../utils/currency';

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = mockOrders.find((o) => o.id === id);

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

  const status = orderStatusMap[order.status];

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
            {new Date(order.date).toLocaleDateString('en-US', {
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
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10"
                >
                  <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold mb-1">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.color} · {item.size} · Quantity: {item.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(item.price * item.qty)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold">
                  {formatPrice(order.items.reduce((sum, item) => sum + item.price * item.qty, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
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
                    {new Date(order.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {order.estimatedDelivery && (
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                    <p className="text-sm font-semibold">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

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
                  <Package size={18} className="text-gray-400" />
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
                : 'Cash on Delivery'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

