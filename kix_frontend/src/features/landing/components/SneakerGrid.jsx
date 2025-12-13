import { Heart, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';

const FEATURED_SNEAKERS = [
  {
    id: 1,
    name: "Air Walker V2",
    price: 145.00,
    category: "Running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    isNew: true
  },
  {
    id: 2,
    name: "Urban Drift Low",
    price: 120.00,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Cosmos High-Top",
    price: 189.00,
    category: "Basketball",
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=1665&auto=format&fit=crop",
    isNew: true
  },
  {
    id: 4,
    name: "Retro Force 90",
    price: 165.00,
    category: "Classic",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
  }
];

export function SneakerGrid() {
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
          <button className="text-gray-900 dark:text-white border-b border-brand-accent pb-1 hover:text-brand-black dark:hover:text-brand-accent transition-colors uppercase font-bold tracking-wider text-sm">
            View All Collection
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_SNEAKERS.map((sneaker) => (
            <div key={sneaker.id} className="group relative bg-white dark:bg-brand-gray rounded-2xl p-4 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none">
              {/* Image Container */}
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 relative mb-4">
                {sneaker.isNew && (
                  <span className="absolute top-3 left-3 bg-brand-accent text-brand-black text-xs font-bold px-2 py-1 rounded z-10">
                    NEW
                  </span>
                )}
                <button className="absolute top-3 right-3 bg-white/50 dark:bg-black/20 hover:bg-brand-accent hover:text-brand-black text-gray-900 dark:text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10">
                  <Heart size={16} />
                </button>
                
                <img 
                  src={sneaker.image} 
                  alt={sneaker.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Quick Add Button (Mobile hidden until hover on desktop) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button className="w-full bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-brand-accent dark:hover:bg-brand-accent transition-colors shadow-lg">
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{sneaker.category}</p>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors">{sneaker.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{formatPrice(sneaker.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

