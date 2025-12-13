import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { shopService } from '../data/dummyProducts';
import { ProductCard } from './ProductCard';

export function RelatedSneakers({ category, excludeSlug, title = 'Related sneakers' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const data = await shopService.getRelatedProducts({
        category,
        excludeSlug,
        limit: 4,
      });
      if (active) {
        setItems(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [category, excludeSlug]);

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Recommendations</p>
          <h2 className="text-3xl font-black mt-2">{title}</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          Loading pairs...
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No related sneakers available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </section>
  );
}

