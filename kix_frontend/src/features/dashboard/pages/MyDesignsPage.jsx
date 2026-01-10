import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Sparkles,
  Clock,
  Share2,
  Trash2,
  Edit3,
  Layers,
  Loader2,
  ShoppingBag,
  X,
} from 'lucide-react';
import * as designService from '../../../services/api/design.service';
import * as cartService from '../../../services/api/cart.service';
import * as productService from '../../../services/api/product.service';
import { appRoutes } from '../../../utils/navigation';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useCart } from '../../../store/contexts/CartContext';
import { useToast } from '../../../store/contexts/ToastContext';

const statusFilters = [
  { id: 'all', label: 'All designs' },
  { id: 'production', label: 'Production ready' },
  { id: 'draft', label: 'Drafts' },
];

export default function MyDesignsPage() {
  const [filter, setFilter] = useState('all');
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, designId: null });
  const [orderModal, setOrderModal] = useState({ isOpen: false, design: null });
  const [selectedSize, setSelectedSize] = useState('');
  const [ordering, setOrdering] = useState(false);
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const availableSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];

  useEffect(() => {
    loadDesigns();
  }, [filter]);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await designService.getDesigns({
        status: filter === 'all' ? undefined : filter,
        limit: 50,
      });
      setDesigns(response.data);
    } catch (error) {
      console.error('Error loading designs:', error);
      setError(error.message || 'Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = useMemo(() => {
    if (filter === 'all') return designs;
    return designs.filter((design) => design.status === filter);
  }, [designs, filter]);

  const designStats = useMemo(() => {
    const total = designs.length;
    const production = designs.filter((d) => d.status === 'production').length;
    const drafts = designs.filter((d) => d.status === 'draft').length;
    const savedEdits = designs.reduce((sum, d) => sum + d.totalEdits, 0);
    return [
      {
        label: 'Saved designs',
        value: total,
        icon: Palette,
      },
      {
        label: 'Production ready',
        value: production,
        icon: Sparkles,
      },
      {
        label: 'Drafts',
        value: drafts,
        icon: Layers,
      },
      {
        label: 'Total edits',
        value: savedEdits,
        icon: Clock,
      },
    ];
  }, [designs]);

  const handleOpenDesigner = () => {
    navigate(appRoutes.customizeSneaker);
  };

  const handleDuplicate = async (design) => {
    try {
      const duplicate = await designService.duplicateDesign(design._id || design.id);
      await loadDesigns(); // Reload designs
    } catch (error) {
      console.error('Error duplicating design:', error);
      alert(error.message || 'Failed to duplicate design');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, designId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.designId) return;

    try {
      await designService.deleteDesign(deleteConfirm.designId);
      await loadDesigns(); // Reload designs
      showToast('Design deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting design:', error);
      showToast(error.message || 'Failed to delete design', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, designId: null });
    }
  };

  const handleOrderClick = (design) => {
    setOrderModal({ isOpen: true, design });
    setSelectedSize('');
  };

  const handleOrderConfirm = async () => {
    if (!orderModal.design || !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }

    try {
      setOrdering(true);
      
      // Search for a product that matches the base model name
      // This allows custom designs to be ordered using existing products
      let product = null;
      try {
        const searchTerm = orderModal.design.baseModel?.name || 'Custom Sneaker';
        const productsResponse = await productService.getProducts(
          { search: searchTerm },
          1,
          1
        );
        
        if (productsResponse.data && productsResponse.data.length > 0) {
          product = productsResponse.data[0];
        }
      } catch (searchError) {
        console.warn('Error searching for product:', searchError);
      }

      // If no product found, try to get any available product as fallback
      // In production, you should create a "Custom Sneaker" product
      if (!product) {
        try {
          const productsResponse = await productService.getProducts({}, 1, 1);
          if (productsResponse.data && productsResponse.data.length > 0) {
            product = productsResponse.data[0];
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback product:', fallbackError);
        }
      }

      if (!product) {
        showToast('No product available for custom orders. Please contact support.', 'error');
        return;
      }

      // Validate size is available for the product
      if (!product.sizes || !product.sizes.includes(selectedSize)) {
        // Use first available size if selected size is not available
        const availableSize = product.sizes && product.sizes.length > 0 
          ? product.sizes[0] 
          : selectedSize;
        
        if (availableSize !== selectedSize) {
          showToast(`Size ${selectedSize} not available. Using size ${availableSize} instead.`, 'warning');
        }
      }

      const sizeToUse = (product.sizes && product.sizes.includes(selectedSize)) 
        ? selectedSize 
        : (product.sizes && product.sizes.length > 0 ? product.sizes[0] : selectedSize);
      
      // Use "Custom" as color since it's a custom design
      const colorToUse = product.colors && product.colors.length > 0 
        ? product.colors[0] 
        : 'Custom';
      
      // Add to cart with customization
      await cartService.addItemToCart({
        productId: product.id || product._id,
        quantity: 1,
        size: sizeToUse,
        color: colorToUse,
        customization: {
          colors: orderModal.design.colors,
          baseModel: orderModal.design.baseModel,
          designId: orderModal.design._id || orderModal.design.id,
          designName: orderModal.design.name,
        },
      });

      showToast('Custom design added to cart!', 'success');
      refreshCart();
      setOrderModal({ isOpen: false, design: null });
      setSelectedSize('');
    } catch (error) {
      console.error('Error adding design to cart:', error);
      showToast(error.message || 'Failed to add design to cart', 'error');
    } finally {
      setOrdering(false);
    }
  };

  const handleEdit = (design) => {
    navigate(`${appRoutes.customizeSneaker}?designId=${design._id || design.id}`);
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  // Transform design colors to match the UI format
  const transformDesignColors = (colors) => {
    return [
      { label: 'Laces', value: colors.laces },
      { label: 'Mesh', value: colors.mesh },
      { label: 'Caps', value: colors.caps },
      { label: 'Inner', value: colors.inner },
      { label: 'Sole', value: colors.sole },
      { label: 'Stripes', value: colors.stripes },
      { label: 'Band', value: colors.band },
      { label: 'Patch', value: colors.patch },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tight mb-2">My Designs</h1>
        </header>
        <div className="bg-red-100 dark:bg-red-900/30 rounded-2xl border border-red-200 dark:border-red-800 p-6 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={loadDesigns}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">My Designs</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Keep your sneaker experiments organized and pick up exactly where you left off.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenDesigner}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Palette size={18} />
            Start new build
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {designStats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex flex-wrap items-center gap-2">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === item.id
                ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black'
                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredDesigns.length === 0 ? (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-dashed border-gray-300 dark:border-white/20 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Palette size={28} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold">No designs here yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Save your creations from the customization studio to build your personal library.
          </p>
          <button
            onClick={handleOpenDesigner}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Sparkles size={18} />
            Launch studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => (
            <article
              key={design.id}
              className="bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-white/5">
                {design.thumbnail ? (
                  <img
                    src={design.thumbnail}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette size={48} className="text-gray-400" />
                  </div>
                )}
                <span
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    design.status === 'production'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}
                >
                  {design.status === 'production' ? 'Production ready' : 'Draft'}
                </span>
                <div
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full border-2 border-white dark:border-brand-gray"
                  style={{ backgroundColor: design.accent || '#000000' }}
                />
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">{design.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {design.baseModel?.name || 'Custom Design'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDuplicate(design)}
                    className="text-xs font-semibold text-brand-black dark:text-brand-accent hover:underline"
                  >
                    Duplicate
                  </button>
                </div>

                {design.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {design.description}
                  </p>
                )}

                {design.tags && design.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {design.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-brand-black/30 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Color recipe</span>
                    <span>Last edit: {formatDate(design.updatedAt || design.createdAt)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {transformDesignColors(design.colors).map((entry) => (
                      <div
                        key={entry.label}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/10"
                          style={{ backgroundColor: entry.value }}
                        />
                        <div>
                          <p className="text-xs font-semibold">{entry.label}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {entry.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-auto border-t border-gray-100 dark:border-white/5 pt-4">
                  <button
                    onClick={() => handleEdit(design)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold text-sm hover:bg-brand-accent dark:hover:bg-white transition-colors"
                  >
                    <Edit3 size={16} />
                    Customize
                  </button>
                  <button
                    onClick={() => handleOrderClick(design)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 dark:bg-green-500 text-white font-semibold text-sm hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                  >
                    <ShoppingBag size={16} />
                    Order
                  </button>
                  <button
                    onClick={() => alert('Share link copied!')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold hover:border-gray-300 dark:hover:border-white/20"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={() => handleDeleteClick(design._id || design.id)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold hover:border-red-300 dark:hover:border-red-500 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, designId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Design"
        message="Are you sure you want to remove this design from your library? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Order Modal */}
      {orderModal.isOpen && orderModal.design && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-gray rounded-2xl border-2 border-gray-200 dark:border-white/10 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    Order Custom Design
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Select a size for your custom sneaker
                  </p>
                </div>
                <button
                  onClick={() => setOrderModal({ isOpen: false, design: null })}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Design: {orderModal.design.name}
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Size:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        selectedSize === size
                          ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setOrderModal({ isOpen: false, design: null })}
                  className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderConfirm}
                  disabled={!selectedSize || ordering}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {ordering ? (
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
        </div>
      )}
    </div>
  );
}





