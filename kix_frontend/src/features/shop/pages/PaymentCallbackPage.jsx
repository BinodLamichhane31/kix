import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import * as orderService from '../../../services/api/order.service';
import { appRoutes } from '../../../utils/navigation';
import { useToast } from '../../../store/contexts/ToastContext';
import { useAuth } from '../../../store/contexts/AuthContext';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      const paymentStatus = searchParams.get('status');
      const orderIdParam = searchParams.get('orderId');
      const error = searchParams.get('error');
      const alreadyPaid = searchParams.get('alreadyPaid');

      if (!orderIdParam) {
        setStatus('error');
        setLoading(false);
        showToast('Invalid payment callback - no order ID', 'error');
        return;
      }

      setOrderId(orderIdParam);

      // If already paid, just show success
      if (alreadyPaid === 'true') {
        await loadOrder(orderIdParam);
        setStatus('success');
        setLoading(false);
        showToast('Payment already processed', 'info');
        return;
      }

      // Load order details
      await loadOrder(orderIdParam);

      // Handle different statuses
      if (paymentStatus === 'success') {
        // Payment callback indicates success
        // Order should already be verified and marked as paid by backend callback handler
        // But we'll verify again to be safe
        if (order && order.paymentStatus === 'paid') {
          setStatus('success');
          showToast('Payment successful!', 'success');
        } else if (order && order.paymentStatus === 'pending') {
          // Payment callback succeeded but order still pending - try manual verification
          setStatus('verifying');
          await verifyPaymentManually(orderIdParam);
        } else {
          setStatus('error');
          showToast('Payment verification failed', 'error');
        }
      } else if (paymentStatus === 'failed' || error) {
        setStatus('failed');
        const errorMessage = error || 'Payment failed or was cancelled';
        showToast(errorMessage, 'error');
      } else {
        setStatus('error');
        showToast('Unknown payment status', 'error');
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      setStatus('error');
      showToast(error.message || 'Error processing payment callback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOrder = async (orderId) => {
    try {
      const orderData = await orderService.getOrderById(orderId);
      
      // Security: Verify order belongs to authenticated user
      // If user is not authenticated or order user doesn't match, redirect
      if (isAuthenticated && user && orderData.user) {
        const orderUserId = typeof orderData.user === 'object' ? orderData.user._id || orderData.user.id : orderData.user;
        const currentUserId = user._id || user.id;
        
        if (orderUserId.toString() !== currentUserId.toString()) {
          setStatus('error');
          showToast('You do not have permission to view this order', 'error');
          navigate(appRoutes.dashboard.orders);
          return null;
        }
      }
      
      setOrder(orderData);
      return orderData;
    } catch (error) {
      console.error('Error loading order:', error);
      // If 404 or unauthorized, redirect
      if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('permission')) {
        setStatus('error');
        showToast('Order not found or access denied', 'error');
        navigate(appRoutes.dashboard.orders);
        return null;
      }
      throw error;
    }
  };

  const verifyPaymentManually = async (orderId) => {
    try {
      setVerifying(true);
      const result = await orderService.verifyEsewaPayment(orderId);
      
      if (result && result.paymentStatus === 'paid') {
        setStatus('success');
        await loadOrder(orderId); // Reload order to get updated data
        showToast('Payment verified successfully!', 'success');
      } else {
        setStatus('failed');
        showToast('Payment verification failed. Please contact support.', 'error');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('failed');
      showToast(error.message || 'Payment verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetryPayment = () => {
    if (order && order.paymentStatus === 'failed') {
      // Navigate to order detail page where user can retry payment
      navigate(appRoutes.dashboard.orderDetail(order._id));
    } else {
      navigate(appRoutes.checkout);
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-50 dark:bg-brand-black min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Processing payment...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-brand-black min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-8 sm:p-12 text-center">
          {/* Success State */}
          {status === 'success' && order && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">
                Payment Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your payment has been processed successfully.
              </p>
              {order.orderNumber && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  Order Number: <span className="font-bold">{order.orderNumber}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => navigate(appRoutes.dashboard.orderDetail(order._id))}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                >
                  View Order
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate(appRoutes.dashboard.orders)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  View All Orders
                </button>
              </div>
            </>
          )}

          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Loader2 size={48} className="text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h1 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">
                Verifying Payment...
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please wait while we verify your payment with eSewa.
              </p>
              {order?.orderNumber && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Order Number: <span className="font-bold">{order.orderNumber}</span>
                </p>
              )}
            </>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle size={48} className="text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">
                Payment Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your payment could not be processed.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Please try again or contact support if the problem persists.
              </p>
              {order && order.paymentStatus === 'failed' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    onClick={handleRetryPayment}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                  >
                    <RefreshCw size={18} />
                    Retry Payment
                  </button>
                  <button
                    onClick={() => navigate(appRoutes.dashboard.orders)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              )}
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle size={48} className="text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">
                Payment Error
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                An error occurred while processing your payment. Please contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => navigate(appRoutes.dashboard.orders)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate(appRoutes.shop)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

