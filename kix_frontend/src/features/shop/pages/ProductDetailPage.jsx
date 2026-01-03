import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Star, ShoppingBag, Heart, Shield, Truck, Sparkles, Palette, Check } from 'lucide-react';
import * as productService from '../../../services/api/product.service';
import * as cartService from '../../../services/api/cart.service';
import * as wishlistService from '../../../services/api/wishlist.service';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';
import { useCart } from '../../../store/contexts/CartContext';
import { useToast } from '../../../store/contexts/ToastContext';
import { useAuth } from '../../../store/contexts/AuthContext';
import { ReviewsSection } from '../components/ReviewsSection';
import { RelatedSneakers } from '../components/RelatedSneakers';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      try {
        const response = await productService.getProductBySlug(slug);
        if (!isMounted) return;
        if (response) {
          setProduct(response);
          setSelectedImage(response?.images?.[0] || response?.image || null);
          setSelectedColor(response?.colors?.[0] || null);
          setSelectedSize(response?.sizes?.[0] || null);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  const handleWishlistToggle = async () => {
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

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    return images.filter(Boolean);
  }, [product]);

  const thumbnailImages = useMemo(() => {
    const placeholders = [
      'https://placehold.co/600x600?text=Angle+1',
      'https://placehold.co/600x600?text=Angle+2',
      'https://placehold.co/600x600?text=Angle+3',
      'https://placehold.co/600x600?text=Angle+4',
    ];
    const list = [...galleryImages];
    for (let i = list.length; i < 4; i += 1) {
      list.push(placeholders[i]);
    }
    return list.slice(0, 4);
  }, [galleryImages]);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      showToast('Please select a size and color', 'warning');
      return;
    }

    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      setAddingToCart(true);

      await cartService.addItemToCart({
        productId: product.id || product._id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
        customization: null,
      });

      showToast('Added to cart!', 'success');
      // Refresh cart to update count in navbar
      refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      } else {
        showToast(error.message || 'Failed to add to cart. Please try again.', 'error');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      showToast('Please select a size and color', 'warning');
      return;
    }

    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      setAddingToCart(true);

      // Clear existing cart first
      await cartService.clearCart();

      // Add only this product to cart
      await cartService.addItemToCart({
        productId: product.id || product._id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
        customization: null,
      });

      // Refresh cart to update count in navbar
      refreshCart();
      // Navigate to checkout after adding to cart
      navigate(appRoutes.checkout);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.message.includes('Authentication')) {
        navigate('/auth/sign-in');
      } else {
        showToast(error.message || 'Failed to add to cart. Please try again.', 'error');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-brand-black">
        <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-300">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm tracking-wide uppercase">Loading sneaker</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="flex items-center justify-center min-h-screen text-gray-900 bg-gray-50 dark:bg-brand-black dark:text-white">
        <div className="space-y-6 text-center">
          <p className="text-3xl font-black">Sneaker not found</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 transition-colors border border-gray-300 rounded-xl dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pb-16 text-gray-900 bg-gray-50 dark:bg-brand-black dark:text-white pt-28">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-gray-500 transition-colors dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent"
        >
          <ArrowLeft size={18} />
          Back to shop
        </button>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 shadow-2xl dark:bg-brand-gray rounded-3xl dark:border-white/10">
              <div className="flex items-center justify-center overflow-hidden bg-gray-100 aspect-square rounded-3xl dark:bg-white/5">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="text-center text-gray-400">No image available</div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3 mt-6">
                {thumbnailImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square rounded-2xl border transition-all bg-gray-50 dark:bg-white/5 flex items-center justify-center ${
                      selectedImage === image
                        ? 'border-brand-black dark:border-brand-accent shadow-lg'
                        : 'border-gray-200 dark:border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {image ? (
                      <img src={image} alt={product.name} className="object-contain w-full h-full p-2" />
                    ) : (
                      <div className="text-xs text-gray-400 dark:text-gray-500">Angle {index + 1}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{product.category}</p>
              <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1 text-brand-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                      className={i < Math.round(product.rating) ? 'text-brand-accent' : 'text-gray-300 dark:text-gray-600'}
                    />
                  ))}
                </div>
                <span>{product.rating.toFixed(1)} • {product.reviewCount} reviews</span>
              </div>

              <div className="mt-6">
                <p className="text-3xl font-black">{formatPrice(product.price)}</p>
                {product.originalPrice && (
                  <p className="text-sm text-gray-500 line-through dark:text-gray-400">
                    {formatPrice(product.originalPrice)}
                  </p>
                )}
              </div>

              <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">
                {product.description ||
                  'A sculpted silhouette engineered for all-day wear. Breathable mesh with premium overlays and adaptive cushioning keep you light on your feet.'}
              </p>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">Colors</p>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Palette size={14} />
                    {selectedColor || 'Choose'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-11 h-11 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-brand-black dark:border-brand-accent scale-110 shadow-lg'
                          : 'border-gray-200 dark:border-white/10 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">Sizes</p>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-2xl border text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-brand-black dark:border-brand-accent text-brand-black dark:text-brand-accent bg-brand-accent/20 dark:bg-brand-accent/20'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-black/50 dark:hover:border-brand-accent/60'
                      }`}
                    >
                      EU {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedSize || !selectedColor || !product.inStock}
                className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition-all shadow-xl bg-brand-black dark:bg-brand-accent dark:text-brand-black rounded-2xl hover:bg-brand-accent dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Add to bag
                  </>
                )}
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={togglingWishlist}
                className={`flex items-center justify-center w-full gap-2 py-4 font-bold transition-all border rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isInWishlist
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/20 hover:border-brand-black dark:hover:border-brand-accent'
                }`}
              >
                {togglingWishlist ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {isInWishlist ? 'Removing...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                    {isInWishlist ? 'In Wishlist' : 'Wishlist'}
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart || !selectedSize || !selectedColor || !product.inStock}
                className="flex items-center justify-center w-full gap-2 py-4 font-bold text-gray-700 transition-all border border-gray-200 dark:border-white/20 rounded-2xl dark:text-gray-200 hover:border-brand-black dark:hover:border-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} />
                Buy instantly
              </button>
            </div>

            {/* Additional info removed per request */}
          </div>
        </div>

        <ReviewsSection 
          productId={product._id || product.id} 
          productRating={product.rating || 0} 
          productReviewCount={product.reviewCount || 0}
          title="Community feedback" 
        />
        <RelatedSneakers category={product.category} excludeSlug={product.slug} title="Related sneakers" />
      </div>
    </section>
  );
}

