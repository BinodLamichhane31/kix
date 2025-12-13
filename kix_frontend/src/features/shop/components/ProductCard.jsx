import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/currency';

export function ProductCard({ product }) {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

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
        <button className="absolute top-3 right-3 bg-white/50 dark:bg-black/20 hover:bg-brand-accent hover:text-brand-black text-gray-900 dark:text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10">
          <Heart size={16} />
        </button>
        
        <Link to={`/product/${product.slug}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        
        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-brand-accent dark:hover:bg-brand-accent transition-colors shadow-lg">
            <ShoppingBag size={18} />
            <span>Add to Cart</span>
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
