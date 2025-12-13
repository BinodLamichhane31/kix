import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { mockWishlist } from '../data/dummyData';
import { formatPrice } from '../../../utils/currency';
import { appRoutes } from '../../../utils/navigation';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(mockWishlist);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWishlist = useMemo(() => {
    if (!searchQuery.trim()) {
      return wishlist;
    }
    const query = searchQuery.toLowerCase();
    return wishlist.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query)
    );
  }, [wishlist, searchQuery]);

  const handleRemove = (id) => {
    if (window.confirm('Remove this item from your wishlist?')) {
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddToCart = (item) => {
    // In real app, add item to cart via context/API
    console.log('Add to cart:', item);
    // You can implement cart functionality here
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
      {wishlist.length > 0 && (
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

      {filteredWishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 hover:border-gray-300 dark:hover:border-white/20 transition-colors group"
            >
              <Link to={`${appRoutes.product(item.productId)}`}>
                <div className="relative mb-4 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden aspect-square">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(item.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-brand-black/90 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Link>

              <div className="space-y-2">
                <Link to={`${appRoutes.product(item.productId)}`}>
                  <h3 className="font-semibold hover:text-brand-black dark:hover:text-brand-accent transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.color}</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{formatPrice(item.price)}</p>
                  {item.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className="flex-1 px-4 py-2 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-lg font-semibold text-sm hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}

