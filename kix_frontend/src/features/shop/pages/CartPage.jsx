import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Gift, ChevronDown } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';

const initialCart = [
  {
    id: 'air-walker-v2',
    name: 'Air Walker V2',
    color: 'Arctic Grey',
    size: 'EU 42',
    price: 185,
    originalPrice: 210,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop',
    qty: 1,
  },
  {
    id: 'nova-glide',
    name: 'Nova Glide',
    color: 'Midnight',
    size: 'EU 40',
    price: 165,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    qty: 2,
  },
];

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
  const [items, setItems] = useState(initialCart);
  const [shipping, setShipping] = useState('standard');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingFee = shippingOptions.find((option) => option.id === shipping)?.price ?? 0;
    const discount =
      appliedPromo && promoRules[appliedPromo]
        ? subtotal * promoRules[appliedPromo].value
        : 0;
    const total = Math.max(subtotal - discount, 0) + shippingFee;

    return { subtotal, discount, shippingFee, total };
  }, [items, shipping, appliedPromo]);

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyPromo = (event) => {
    event.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (promoRules[code]) {
      setAppliedPromo(code);
      setError('');
    } else {
      setError('Invalid code. Try "KIX10" for 10% off.');
      setAppliedPromo(null);
    }
  };

  const isEmpty = items.length === 0;

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
                  onClick={() => setItems([])}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
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
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex gap-5 group hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold mb-1 truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {item.color} · {item.size}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-base font-bold">{formatPrice(item.price)}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            onClick={() => updateQty(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center border-x border-gray-200 dark:border-white/10">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            onClick={() => updateQty(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatPrice(item.price * item.qty)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    onChange={(e) => setShipping(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors appearance-none cursor-pointer"
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
              <Link
                to={appRoutes.checkout}
                className="block w-full bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl py-3.5 font-bold text-center hover:bg-brand-accent dark:hover:bg-white transition-colors"
              >
                Proceed to checkout
              </Link>
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
    </section>
  );
}

