import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Search, X, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import * as wishlistService from '../../../services/api/wishlist.service';
import * as cartService from '../../../services/api/cart.service';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';
import { useCart } from '../../../store/contexts/CartContext';
import { useToast } from '../../../store/contexts/ToastContext';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null });
  const [addingToCart, setAddingToCart] = useState({});
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const wishlist = await wishlistService.getWishlist();
      setWishlistItems(wishlist?.items || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      showToast(error.message || 'Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredWishlist = useMemo(() => {
    if (!searchQuery.trim()) {
      return wishlistItems;
    }
    const query = searchQuery.toLowerCase();
    return wishlistItems.filter(
      (item) =>
        item.product?.name?.toLowerCase().includes(query) ||
        item.product?.category?.toLowerCase().includes(query)
    );
  }, [wishlistItems, searchQuery]);

  const handleRemoveClick = (productId) => {
    setDeleteConfirm({ isOpen: true, productId });
  };

  const handleRemoveConfirm = async () => {
    if (!deleteConfirm.productId) return;

    try {
      await wishlistService.removeFromWishlist(deleteConfirm.productId);
      await loadWishlist();
      showToast('Removed from wishlist', 'success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast(error.message || 'Failed to remove from wishlist', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };

  const handleAddToCart = async (item) => {
    const product = item.product;
    if (!product) return;

    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }

    // Use first available size and color as defaults
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;

    if (!defaultSize || !defaultColor) {
      showToast('Product size or color not available', 'error');
      return;
    }

    try {
      setAddingToCart((prev) => ({ ...prev, [product._id || product.id]: true }));

      await cartService.addItemToCart({
        productId: product._id || product.id,
        quantity: 1,
        size: defaultSize,
        color: defaultColor,
        customization: null,
      });

      showToast('Added to cart!', 'success');
      refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(error.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart((prev) => {
        const newState = { ...prev };
        delete newState[product._id || product.id];
        return newState;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Wishlist</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your saved items
        </p>
      </div>

      {/* Search Bar */}
      {wishlistItems.length > 0 && (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {filteredWishlist.length} {filteredWishlist.length === 1 ? 'item' : 'items'} found
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
            <p className="text-gray-600 dark:text-gray-400">Loading wishlist...</p>
          </div>
        </div>
      ) : filteredWishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWishlist.map((item) => {
            const product = item.product;
            if (!product) return null;
            const productId = product._id || product.id;
            const isAdding = addingToCart[productId];

            return (
              <div
                key={item._id || productId}
                className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 hover:border-gray-300 dark:hover:border-white/20 transition-colors group"
              >
                <Link to={`/product/${product.slug}`}>
                  <div className="relative mb-4 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden aspect-square">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveClick(productId);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-brand-black/90 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Link>

                <div className="space-y-2">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-semibold hover:text-brand-black dark:hover:text-brand-accent transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!product.inStock || isAdding}
                      className="flex-1 px-4 py-2 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-lg font-semibold text-sm hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <Search size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-semibold mb-2">No items found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Try adjusting your search query
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <Heart size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-semibold mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Start adding items you love to your wishlist
          </p>
          <Link
            to={appRoutes.shop}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            Browse Products
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
        onConfirm={handleRemoveConfirm}
        title="Remove from Wishlist"
        message="Are you sure you want to remove this item from your wishlist?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

