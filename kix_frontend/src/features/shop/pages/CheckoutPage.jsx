import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CreditCard, MapPin, User, Phone, Mail, Check, Loader2, Plus } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';
import * as cartService from '../../../services/api/cart.service';
import * as orderService from '../../../services/api/order.service';
import * as addressService from '../../../services/api/address.service';
import { useToast } from '../../../store/contexts/ToastContext';
import { useCart } from '../../../store/contexts/CartContext';

const shippingOptions = [
  { id: 'standard', label: 'Standard', description: '3-5 business days', price: 0 },
  { id: 'express', label: 'Express', description: '1-2 business days', price: 12 },
  { id: 'priority', label: 'Priority', description: 'Next day delivery', price: 24 },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshCart } = useCart();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    postalCode: '',
    country: 'Nepal',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  useEffect(() => {
    if (cart && cart.shippingMethod) {
      setShippingMethod(cart.shippingMethod);
    }
  }, [cart]);

  useEffect(() => {
    // Auto-select default address if available
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setUseSavedAddress(true);
        fillFormFromAddress(defaultAddress);
      }
    }
  }, [addresses]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
      
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        // Redirect to cart if empty
        navigate(appRoutes.cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      } else {
        navigate(appRoutes.cart);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Don't show error toast here - addresses are optional
    }
  };

  const fillFormFromAddress = (address) => {
    setShippingInfo({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      email: address.email || '',
      phone: address.phone || '',
      address: address.address || '',
      landmark: address.landmark || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      country: address.country || 'Nepal',
    });
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setUseSavedAddress(true);
    const address = addresses.find(addr => addr._id === addressId);
    if (address) {
      fillFormFromAddress(address);
    }
  };

  const handleUseManualAddress = () => {
    setUseSavedAddress(false);
    setSelectedAddressId(null);
    // Keep current form values
  };

  const subtotal = cart?.subtotal ?? 0;
  const shippingFee = cart?.shippingFee ?? (shippingOptions.find((opt) => opt.id === shippingMethod)?.price ?? 0);
  const discount = cart?.discount ?? 0;
  const total = cart?.total ?? (subtotal - discount + shippingFee);

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    // Update shipping method in cart
    try {
      await cartService.updateShippingMethod(shippingMethod);
      setStep(2);
    } catch (error) {
      console.error('Error updating shipping method:', error);
      showToast('Failed to update shipping method', 'error');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // For eSewa, we need to create order first and then redirect to payment
    if (paymentMethod === 'esewa') {
      await handleEsewaPaymentFlow(e);
      return;
    }
    
    // For card and COD, continue to review step
    if (paymentMethod === 'card') {
      if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        return; // Form validation will handle this
      }
    }
    setStep(3);
  };

  const handleEsewaPaymentFlow = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate shipping address is complete
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
          !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
          !shippingInfo.postalCode || !shippingInfo.country) {
        showToast('Please complete all shipping information', 'error');
        setIsProcessing(false);
        setStep(1);
        return;
      }

      // Step 1: Create order with PENDING payment status
      // Note: Frontend does NOT calculate totals - backend does this
      const order = await orderService.createOrder({
        shippingAddress: shippingInfo,
        paymentMethod: 'esewa',
        shippingMethod,
        promoCode: cart?.promoCode || null,
        notes: null,
      });

      if (!order || !order._id) {
        throw new Error('Failed to create order');
      }

      // Step 2: Initiate eSewa payment (backend generates transaction ID and payment URL)
      const paymentData = await orderService.initiateEsewaPayment(order._id);

      if (!paymentData || !paymentData.paymentUrl || !paymentData.formData) {
        throw new Error('Failed to initiate payment');
      }

      // Step 3: Submit form to eSewa (auto-redirect)
      // Create a form and submit it programmatically
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.paymentUrl;
      form.style.display = 'none';

      // Add all form data fields
      Object.keys(paymentData.formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData.formData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Note: User will be redirected to eSewa, then back to our callback page
      // Show loading message while redirecting
      showToast('Redirecting to eSewa payment...', 'info');

    } catch (error) {
      console.error('Error processing eSewa payment:', error);
      showToast(error.message || 'Failed to process payment. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Safety check: eSewa should not reach this function
      if (paymentMethod === 'esewa') {
        showToast('eSewa payment should be handled separately', 'error');
        setIsProcessing(false);
        return;
      }

      // Prepare payment details (only store last 4 digits for security)
      const paymentDetails = {};
      if (paymentMethod === 'card' && paymentInfo.cardNumber) {
        paymentDetails.cardLast4 = paymentInfo.cardNumber.replace(/\s/g, '').slice(-4);
        paymentDetails.cardBrand = paymentInfo.cardNumber.startsWith('4') ? 'Visa' : 
                                   paymentInfo.cardNumber.startsWith('5') ? 'Mastercard' : 'Unknown';
      }

      // Validate shipping address is complete
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
          !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
          !shippingInfo.postalCode || !shippingInfo.country) {
        showToast('Please complete all shipping information', 'error');
        setIsProcessing(false);
        setStep(1);
        return;
      }

      // Create order
      const order = await orderService.createOrder({
        shippingAddress: shippingInfo,
        paymentMethod,
        paymentDetails,
        shippingMethod,
        promoCode: cart?.promoCode || null,
        notes: null,
      });

      // Refresh cart to clear it
      refreshCart();

      showToast('Order placed successfully!', 'success');
      
      // Redirect to order detail page
      navigate(`/dashboard/orders/${order._id}`, {
        state: { orderNumber: order.orderNumber },
      });
    } catch (error) {
      console.error('Error placing order:', error);
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const updateShippingInfo = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updatePaymentInfo = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <section className="bg-gray-50 dark:bg-brand-black min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </section>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <section className="bg-gray-50 dark:bg-brand-black min-h-screen pt-24 pb-16 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={appRoutes.cart}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Checkout</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {step} of 3
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s
                        ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black'
                        : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step > s ? <Check size={16} /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        step > s ? 'bg-brand-black dark:bg-brand-accent' : 'bg-gray-200 dark:bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-accent/20 dark:bg-brand-accent/30 flex items-center justify-center">
                        <MapPin size={18} className="text-brand-black dark:text-brand-black" />
                      </div>
                      <h2 className="text-xl font-bold">Shipping Address</h2>
                    </div>
                    {addresses.length > 0 && (
                      <Link
                        to={appRoutes.dashboard.addresses}
                        className="text-sm font-semibold text-brand-black dark:text-brand-accent hover:underline flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Manage Addresses
                      </Link>
                    )}
                  </div>

                  {/* Saved Addresses Selection */}
                  {addresses.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Select Saved Address
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {addresses.map((address) => (
                          <label
                            key={address._id}
                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                              useSavedAddress && selectedAddressId === address._id
                                ? 'border-brand-black dark:border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10'
                                : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={useSavedAddress && selectedAddressId === address._id}
                              onChange={() => handleAddressSelect(address._id)}
                              className="mt-1 accent-brand-accent"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold">{address.label}</p>
                                {address.isDefault && (
                                  <span className="text-xs font-semibold text-brand-black dark:text-brand-accent bg-brand-accent/10 dark:bg-brand-accent/20 px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                <p>{address.firstName} {address.lastName}</p>
                                <p>{address.address}{address.landmark && `, Near: ${address.landmark}`}</p>
                                <p>{address.city}, {address.postalCode}, {address.country}</p>
                                <p>{address.phone}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {useSavedAddress && (
                        <button
                          type="button"
                          onClick={handleUseManualAddress}
                          className="mt-3 text-sm font-semibold text-brand-black dark:text-brand-accent hover:underline"
                        >
                          + Enter New Address
                        </button>
                      )}
                    </div>
                  )}

                  {(!useSavedAddress || addresses.length === 0) && addresses.length > 0 && (
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
                          if (defaultAddress) {
                            handleAddressSelect(defaultAddress._id);
                          }
                        }}
                        className="text-sm font-semibold text-brand-black dark:text-brand-accent hover:underline"
                      >
                        ← Use Saved Address
                      </button>
                    </div>
                  )}

                  {/* Manual Address Form - Always visible but can be pre-filled */}
                  <div className={useSavedAddress && addresses.length > 0 ? 'opacity-75' : ''}>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => updateShippingInfo('firstName', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => updateShippingInfo('lastName', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => updateShippingInfo('email', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => updateShippingInfo('phone', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => updateShippingInfo('address', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Nearest Landmark <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.landmark}
                      onChange={(e) => updateShippingInfo('landmark', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                      placeholder="e.g., Near Central Hospital, Opposite City Mall"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => updateShippingInfo('city', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                        placeholder="Kathmandu"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => updateShippingInfo('postalCode', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                        placeholder="44600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.country}
                      onChange={(e) => updateShippingInfo('country', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                    />
                  </div>
                  </div>
                </div>

                {/* Shipping Method Selection */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Shipping Method
                  </h3>
                  <div className="space-y-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          shippingMethod === option.id
                            ? 'border-brand-black dark:border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10'
                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={option.id}
                          checked={shippingMethod === option.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="accent-brand-accent"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{option.label}</p>
                            <p className="text-sm font-bold">
                              {option.price === 0 ? 'Free' : formatPrice(option.price)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-accent/20 dark:bg-brand-accent/30 flex items-center justify-center">
                      <CreditCard size={18} className="text-brand-black dark:text-brand-black" />
                    </div>
                    <h2 className="text-xl font-bold">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {/* Credit / Debit Card */}
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-brand-black dark:border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-brand-accent"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        {/* Credit/Debit Card Logo */}
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src="https://www.shutterstock.com/image-vector/mastercard-visa-logotype-money-600nw-2374413349.jpg"
                            alt="Visa Mastercard"
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Credit / Debit Card</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, Amex</p>
                        </div>
                      </div>
                    </label>

                    {/* eSewa */}
                    <label
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === 'esewa'
                          ? 'border-brand-black dark:border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="esewa"
                        checked={paymentMethod === 'esewa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-brand-accent"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        {/* eSewa Logo */}
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src="https://e7.pngegg.com/pngimages/261/608/png-clipart-esewa-zone-office-bayalbas-google-play-iphone-iphone-electronics-text-thumbnail.png"
                            alt="eSewa"
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">eSewa</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Pay with your eSewa wallet</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={paymentInfo.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                            updatePaymentInfo('cardNumber', formatted);
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentInfo.cardName}
                          onChange={(e) => updatePaymentInfo('cardName', e.target.value)}
                          placeholder="John Doe"
                          className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={paymentInfo.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              updatePaymentInfo('expiryDate', value);
                            }}
                            placeholder="MM/YY"
                            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={paymentInfo.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              updatePaymentInfo('cvv', value);
                            }}
                            placeholder="123"
                            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-accent/20 dark:bg-brand-accent/30 flex items-center justify-center">
                      <Check size={18} className="text-brand-black dark:text-brand-black" />
                    </div>
                    <h2 className="text-xl font-bold">Review Order</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Shipping Address
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="font-semibold">
                          {shippingInfo.firstName} {shippingInfo.lastName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{shippingInfo.address}</p>
                        {shippingInfo.landmark && (
                          <p className="text-gray-500 dark:text-gray-500 italic">
                            Near: {shippingInfo.landmark}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400">
                          {shippingInfo.city}, {shippingInfo.postalCode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{shippingInfo.country}</p>
                        <p className="text-gray-600 dark:text-gray-400">{shippingInfo.phone}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Payment Method
                      </h3>
                      <p className="text-sm font-semibold">
                        {paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'esewa' ? 'eSewa' : 'Cash on Delivery'}
                      </p>
                      {paymentMethod === 'card' && paymentInfo.cardNumber && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          **** **** **** {paymentInfo.cardNumber.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-8 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-3">
                {cart.items.map((item) => {
                  const product = item.product;
                  const productImage = product?.image || '/placeholder-shoe.jpg';
                  const productName = product?.name || 'Product';
                  
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {item.customization?.designName || productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.color} · {item.size} · Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-accent font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lock size={14} />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

