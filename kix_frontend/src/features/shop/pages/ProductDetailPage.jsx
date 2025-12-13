import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Star, ShoppingBag, Heart, Shield, Truck, Sparkles, Palette, Check } from 'lucide-react';
import { shopService } from '../data/dummyProducts';
import { formatPrice } from '../../../utils/currency';
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

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      const response = await shopService.getProductBySlug(slug);
      if (!isMounted) return;
      setProduct(response);
      setSelectedImage(response?.images?.[0] || response?.image || null);
      setSelectedColor(response?.colors?.[0] || null);
      setSelectedSize(response?.sizes?.[0] || null);
      setLoading(false);

    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-black">
        <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-300">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm tracking-wide uppercase">Loading sneaker</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white">
        <div className="text-center space-y-6">
          <p className="text-3xl font-black">Sneaker not found</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to shop
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 p-6 shadow-2xl">
              <div className="aspect-square rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">No image available</div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3">
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
                      <img src={image} alt={product.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-xs">Angle {index + 1}</div>
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
              <h1 className="text-4xl font-black mt-2">{product.name}</h1>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </p>
                )}
              </div>

              <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description ||
                  'A sculpted silhouette engineered for all-day wear. Breathable mesh with premium overlays and adaptive cushioning keep you light on your feet.'}
              </p>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Colors</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
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
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Sizes</p>
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

            <div className="grid sm:grid-cols-3 gap-3">
              <button className="w-full bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand-accent dark:hover:bg-white transition-all shadow-xl">
                <ShoppingBag size={20} />
                Add to bag
              </button>
              <button className="w-full border border-gray-200 dark:border-white/20 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 hover:border-brand-black dark:hover:border-brand-accent transition-all">
                <Heart size={20} />
                Wishlist
              </button>
              <button className="w-full border border-gray-200 dark:border-white/20 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 hover:border-brand-black dark:hover:border-brand-accent transition-all">
                <Sparkles size={20} />
                Buy instantly
              </button>
            </div>

            {/* Additional info removed per request */}
          </div>
        </div>

        <ReviewsSection contextKey={product.slug} title="Community feedback" />
        <RelatedSneakers category={product.category} excludeSlug={product.slug} title="Related sneakers" />
      </div>
    </section>
  );
}

