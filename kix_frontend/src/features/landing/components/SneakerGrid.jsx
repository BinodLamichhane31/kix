import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Loader2, Check, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../utils/currency';
import * as productService from '../../../services/api/product.service';
import * as cartService from '../../../services/api/cart.service';
import * as wishlistService from '../../../services/api/wishlist.service';
import { appRoutes } from '../../../utils/navigation';
import { useCart } from '../../../store/contexts/CartContext';
import { useToast } from '../../../store/contexts/ToastContext';
import { useAuth } from '../../../store/contexts/AuthContext';

export function SneakerGrid() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [togglingWishlist, setTogglingWishlist] = useState({});

  useEffect(() => {
    loadTrendingProducts();
    if (isAuthenticated) {
      loadWishlistStatus();
    }
  }, [isAuthenticated]);

  const loadTrendingProducts = async () => {
    try {
      setLoading(true);
      // Fetch featured/trending products - prioritize products with isFeatured flag
      const response = await productService.getProducts(
        { 
          isFeatured: true
        },
        1,
        4 // Limit to 4 products for landing page
      );
      
      if (response && response.data) {
        // If no featured products, get latest products sorted by featured (which prioritizes newest)
        if (response.data.length === 0) {
          const fallbackResponse = await productService.getProducts(
            {},
            1,
            4
          );
          setProducts(fallbackResponse.data || []);
        } else {
          setProducts(response.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading trending products:', error);
      // On error, keep empty array - will show empty state
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const wishlistData = await wishlistService.getWishlist();
      // Handle both array format and object with items array
      const items = Array.isArray(wishlistData) 
        ? wishlistData 
        : (wishlistData?.items || []);
      
      if (items && items.length > 0) {
        const wishlistIds = new Set(
          items.map(item => item.product?._id || item.product?.id || item.productId)
        );
        setWishlistItems(wishlistIds);
      }
    } catch (error) {
      // Silently fail - user might not be authenticated
      console.error('Error loading wishlist:', error);
    }
  };

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/auth/sign-in');
      return;
    }

    const productId = product.id || product._id;
    
    try {
      setTogglingWishlist(prev => ({ ...prev, [productId]: true }));
      const isInWishlist = wishlistItems.has(productId);

      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        showToast('Removed from wishlist', 'success');
      } else {
        await wishlistService.addToWishlist(productId);
        setWishlistItems(prev => new Set([...prev, productId]));
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
      setTogglingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }

    if (!product.sizes || product.sizes.length === 0) {
      showToast('This product has no available sizes', 'error');
      return;
    }
    
    if (!product.colors || product.colors.length === 0) {
      showToast('This product has no available colors', 'error');
      return;
    }

    const productId = product.id || product._id;
    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0];

    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      setAddedToCart(prev => ({ ...prev, [productId]: false }));

      await cartService.addItemToCart({
        productId,
        quantity: 1,
        size: defaultSize,
        color: defaultColor,
        customization: null,
      });

      setAddedToCart(prev => ({ ...prev, [productId]: true }));
      showToast('Added to cart!', 'success');
      refreshCart();
      
      setTimeout(() => {
        setAddedToCart(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        setAddingToCart(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
      
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      } else {
        showToast(error.message || 'Failed to add to cart. Please try again.', 'error');
      }
    }
  };
  return (
    <section id="new" className="py-24 bg-gray-100 dark:bg-brand-black relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
              Trending <span className="text-brand-black dark:text-brand-accent">Drops</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Curated selection of our most popular custom designs.</p>
          </div>
          <Link 
            to={appRoutes.shop}
            className="text-gray-900 dark:text-white border-b border-brand-accent pb-1 hover:text-brand-black dark:hover:text-brand-accent transition-colors uppercase font-bold tracking-wider text-sm"
          >
            View All Collection
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={48} className="animate-spin text-brand-black dark:text-brand-accent" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const productId = product.id || product._id;
              const isInWishlist = wishlistItems.has(productId);
              const isAdding = addingToCart[productId] || false;
              const isAdded = addedToCart[productId] || false;
              const isToggling = togglingWishlist[productId] || false;
              const discount = product.originalPrice 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <div key={productId} className="group relative bg-white dark:bg-brand-gray rounded-2xl p-4 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none">
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
                      onClick={(e) => handleWishlistToggle(e, product)}
                      disabled={isToggling}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isInWishlist
                          ? 'bg-red-500/90 dark:bg-red-500/90 text-white hover:bg-red-600 dark:hover:bg-red-600'
                          : 'bg-white/50 dark:bg-black/20 hover:bg-brand-accent hover:text-brand-black text-gray-900 dark:text-white'
                      }`}
                      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                    </button>
                    
                    <Link to={appRoutes.product(product.slug)}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      />
                    </Link>
                    
                    {/* Quick Add Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={isAdding || !product.inStock}
                        className="w-full bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-brand-accent dark:hover:bg-brand-accent transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : isAdded ? (
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
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">{product.category}</p>
                    <Link to={appRoutes.product(product.slug)}>
                      <h3 className="text-gray-900 dark:text-white font-bold text-lg group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
                    {product.rating > 0 && (
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
                        {product.reviewCount > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({product.reviewCount})
                          </span>
                        )}
                      </div>
                    )}
                    
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
                    {product.inStock && product.stock && product.stock < 10 && (
                      <p className="text-orange-500 text-xs font-medium">Only {product.stock} left</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No trending products available at the moment.</p>
            <Link 
              to={appRoutes.shop}
              className="inline-block mt-4 text-brand-black dark:text-brand-accent font-semibold hover:underline"
            >
              Browse All Products →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

