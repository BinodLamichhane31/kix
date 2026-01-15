import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Gift, ChevronDown, Loader2 } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';
import * as cartService from '../../../services/api/cart.service';
import { useCart } from '../../../store/contexts/CartContext';
import DesignPreviewModal from '../../customize/components/DesignPreviewModal';

const shippingOptions = [
  { id: 'standard', label: 'Standard', description: '3-5 business days', price: 0 },
  { id: 'express', label: 'Express', description: '1-2 business days', price: 12 },
  { id: 'priority', label: 'Priority', description: 'Next day delivery', price: 24 },
];

const promoRules = {
  KIX10: {
    label: '10% off your order',
    type: 'percent',
    value: 0.1,
  },
};

export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [shipping, setShipping] = useState('standard');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState('');
  const [previewDesign, setPreviewDesign] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (cart && cart.shippingMethod) {
      setShipping(cart.shippingMethod);
    }
    if (cart && cart.promoCode) {
      setAppliedPromo(cart.promoCode);
    }
  }, [cart]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      // If unauthorized, redirect to sign in
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    if (!cart) return { subtotal: 0, discount: 0, shippingFee: 0, total: 0 };
    
    const subtotal = cart.subtotal || 0;
    const shippingFee = cart.shippingFee || 0;
    const discount = cart.discount || 0;
    const total = cart.total || 0;

    return { subtotal, discount, shippingFee, total };
  }, [cart]);

  const updateQty = async (itemId, delta) => {
    try {
      setUpdating(true);
      const item = cart.items.find((i) => i._id === itemId);
      if (!item) return;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        await removeItem(itemId);
      } else {
        const updatedCart = await cartService.updateCartItem(itemId, newQuantity);
        setCart(updatedCart);
        refreshCart(); // Update navbar count
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message || 'Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      const updatedCart = await cartService.removeCartItem(itemId);
      setCart(updatedCart);
      refreshCart(); // Update navbar count
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.message || 'Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyPromo = async (event) => {
    event.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    try {
      setUpdating(true);
      setError('');
      const updatedCart = await cartService.applyPromoCode(code);
      setCart(updatedCart);
      setAppliedPromo(code);
      refreshCart(); // Update navbar count
    } catch (error) {
      console.error('Error applying promo code:', error);
      setError(error.message || 'Invalid code. Try "KIX10" for 10% off.');
      setAppliedPromo(null);
    } finally {
      setUpdating(false);
    }
  };

  const handleShippingChange = async (newShipping) => {
    try {
      setUpdating(true);
      setShipping(newShipping);
      const updatedCart = await cartService.updateShippingMethod(newShipping);
      setCart(updatedCart);
      refreshCart(); // Update navbar count
    } catch (error) {
      console.error('Error updating shipping method:', error);
      setError(error.message || 'Failed to update shipping method');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      setUpdating(true);
      await cartService.clearCart();
      await loadCart();
      refreshCart(); // Update navbar count
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message || 'Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  if (loading) {
    return (
      <section className="bg-gray-50 dark:bg-brand-black min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-brand-black min-h-screen pt-24 pb-16 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Cart Items */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black tracking-tight">Cart</h1>
              {!isEmpty && (
                <button
                  onClick={handleClearCart}
                  disabled={updating}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  Clear all
                </button>
              )}
            </div>

            {isEmpty ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-16 text-center space-y-6 bg-white/50 dark:bg-brand-gray/30">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <Gift size={32} className="text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold">Your cart is empty</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Explore our collection and add items to your cart
                  </p>
                </div>
                <Link
                  to={appRoutes.shop}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                >
                  Browse sneakers
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const product = item.product;
                  const productImage = product?.image || '/placeholder-shoe.jpg';
                  const productName = product?.name || 'Product';
                  
                  return (
                    <div
                      key={item._id}
                      className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex gap-5 group hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                    >
                      <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between gap-4 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold mb-1 truncate">
                              {item.customization?.designName || productName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {item.color} · {item.size}
                            </p>
                            {item.customization && (
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent text-[10px] font-bold uppercase tracking-wider">
                                  Custom Design
                                </div>
                                <button
                                  onClick={() => setPreviewDesign(item.customization)}
                                  className="text-[10px] font-bold text-brand-black dark:text-white hover:text-brand-accent dark:hover:text-brand-accent transition-colors flex items-center gap-1 underline underline-offset-2"
                                >
                                  360 View
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-base font-bold">{formatPrice(item.price)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={updating}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              disabled={updating}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                              onClick={() => updateQty(item._id, -1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center border-x border-gray-200 dark:border-white/10">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={updating}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                              onClick={() => updateQty(item._id, 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
              <h2 className="text-xl font-bold">Summary</h2>

              {/* Order Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {totals.shippingFee === 0 ? 'Free' : formatPrice(totals.shippingFee)}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-brand-accent font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black">{formatPrice(totals.total)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                    placeholder="Enter code"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setError('');
                    }}
                  />
                  <button
                    type="submit"
                    className="rounded-lg px-4 py-2.5 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black text-sm font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                {appliedPromo && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {promoRules[appliedPromo].label} applied ✓
                  </p>
                )}
              </form>

              {/* Shipping Method Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Shipping Method
                </label>
                <div className="relative">
                  <select
                    value={shipping}
                    onChange={(e) => handleShippingChange(e.target.value)}
                    disabled={updating}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                  >
                    {shippingOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} - {option.description} ({option.price === 0 ? 'Free' : formatPrice(option.price)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Checkout Button */}
              {isEmpty ? (
                <div className="block w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl py-3.5 font-bold text-center cursor-not-allowed">
                  Proceed to checkout
                </div>
              ) : (
                <Link
                  to={appRoutes.checkout}
                  className="block w-full bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl py-3.5 font-bold text-center hover:bg-brand-accent dark:hover:bg-white transition-colors"
                >
                  Proceed to checkout
                </Link>
              )}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By continuing, you agree to our{' '}
                <span className="underline cursor-pointer hover:text-brand-black dark:hover:text-brand-accent">
                  Terms & Privacy
                </span>
              </p>
            </div>

          </div>
        </div>
      </div>

      <DesignPreviewModal 
        isOpen={!!previewDesign}
        onClose={() => setPreviewDesign(null)}
        design={previewDesign || {}}
        title={previewDesign?.designName}
      />
    </section>
  );
}

