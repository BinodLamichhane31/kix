import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Star, Loader2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../utils/currency';
import * as cartService from '../../../services/api/cart.service';
import * as wishlistService from '../../../services/api/wishlist.service';
import { appRoutes } from '../../../utils/navigation';
import { useCart } from '../../../store/contexts/CartContext';
import { useToast } from '../../../store/contexts/ToastContext';
import { useAuth } from '../../../store/contexts/AuthContext';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Check if product is in wishlist
  useEffect(() => {
    if (isAuthenticated && product?.id) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, product?.id]);

  const checkWishlistStatus = async () => {
    try {
      const inWishlist = await wishlistService.checkWishlist(product.id || product._id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      // Silently fail - user might not be authenticated
      setIsInWishlist(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/auth/sign-in');
      return;
    }

    try {
      setTogglingWishlist(true);
      const productId = product.id || product._id;

      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setIsInWishlist(false);
        showToast('Removed from wishlist', 'success');
      } else {
        await wishlistService.addToWishlist(productId);
        setIsInWishlist(true);
        showToast('Added to wishlist!', 'success');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      } else {
        showToast(error.message || 'Failed to update wishlist', 'error');
      }
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }

    // Use first available size and color as defaults
    if (!product.sizes || product.sizes.length === 0) {
      showToast('This product has no available sizes', 'error');
      return;
    }
    
    if (!product.colors || product.colors.length === 0) {
      showToast('This product has no available colors', 'error');
      return;
    }

    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0];

    try {
      setAddingToCart(true);
      setAddedToCart(false);

      await cartService.addItemToCart({
        productId: product.id || product._id,
        quantity: 1,
        size: defaultSize,
        color: defaultColor,
        customization: null,
      });

      setAddedToCart(true);
      showToast('Added to cart!', 'success');
      // Refresh cart to update count in navbar
      refreshCart();
      setTimeout(() => {
        setAddedToCart(false);
        setAddingToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart(false);
      
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      } else {
        showToast(error.message || 'Failed to add to cart. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="group relative bg-white dark:bg-brand-gray rounded-2xl p-4 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none">
      {/* Image Container */}
      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 relative mb-4">
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-brand-accent text-brand-black text-xs font-bold px-2 py-1 rounded z-10">
            NEW
          </span>
        )}
        {discount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            -{discount}%
          </span>
        )}
        <button
          onClick={handleWishlistToggle}
          disabled={togglingWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors z-10 ${
            isInWishlist
              ? 'bg-red-500/90 dark:bg-red-500/90 text-white hover:bg-red-600 dark:hover:bg-red-600'
              : 'bg-white/50 dark:bg-black/20 hover:bg-brand-accent hover:text-brand-black text-gray-900 dark:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
        
        <Link to={`/product/${product.slug}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        
        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !product.inStock}
            className="w-full bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-brand-accent dark:hover:bg-brand-accent transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : addedToCart ? (
              <>
                <Check size={18} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{product.category}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-gray-900 dark:text-white font-bold text-lg group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center text-brand-black dark:text-brand-accent">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                className={i < Math.floor(product.rating) ? "text-brand-black dark:text-brand-accent" : "text-gray-300 dark:text-gray-600"}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({product.reviewCount})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <p className="text-gray-900 dark:text-white font-bold text-lg">{formatPrice(product.price)}</p>
          {product.originalPrice && (
            <p className="text-gray-500 dark:text-gray-400 text-sm line-through">
              {formatPrice(product.originalPrice)}
            </p>
          )}
        </div>
        
        {/* Stock Indicator */}
        {!product.inStock && (
          <p className="text-red-500 text-xs font-medium">Out of Stock</p>
        )}
        {product.inStock && product.stock < 10 && (
          <p className="text-orange-500 text-xs font-medium">Only {product.stock} left</p>
        )}
      </div>
    </div>
  );
}
