import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartService from '../../services/api/cart.service';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total items count
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Load cart from API
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      // Don't set error for auth issues - just clear cart
      if (!error.message.includes('Authentication')) {
        setError(error.message);
      } else {
        setCart(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart on mount and when auth status changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Refresh cart (useful after adding/removing items)
  const refreshCart = useCallback(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, loadCart]);

  const value = {
    cart,
    itemCount,
    loading,
    error,
    refreshCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Return a safe default instead of throwing to prevent crashes
    console.warn('useCart must be used within a CartProvider');
    return {
      cart: null,
      itemCount: 0,
      loading: false,
      error: null,
      refreshCart: () => {},
      loadCart: () => {},
    };
  }
  return context;
}





