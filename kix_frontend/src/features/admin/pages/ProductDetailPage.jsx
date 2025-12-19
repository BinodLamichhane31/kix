import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Loader2, AlertCircle, Package, Tag, DollarSign, Box, Star, Eye, Image as ImageIcon } from 'lucide-react';
import * as productService from '../../../services/api/product.service';
import { formatPrice } from '../../../utils/currency';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Toast from '../../../components/common/Toast';

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts({}, 1, 1000);
      const foundProduct = response.data?.find(p => (p._id || p.id) === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedImage(foundProduct.image || foundProduct.images?.[0] || null);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.deleteProduct(id);
      setToast({
        isVisible: true,
        message: `Product "${product.name}" deleted successfully`,
        type: 'success',
      });
      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setToast({
        isVisible: true,
        message: err.message || 'Failed to delete product',
        type: 'error',
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/products?edit=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);

  const getStatusColor = () => {
    if (!product.inStock) return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
    if (product.stock < 10) return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300';
    return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
  };

  const getStatusText = () => {
    if (!product.inStock) return 'Out of Stock';
    if (product.stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{product.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Product ID: {product._id || product.id} • Slug: {product.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Edit size={18} />
            Edit Product
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Images */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="aspect-square rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden mb-4">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              {!selectedImage && (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImage === image
                        ? 'border-brand-black dark:border-brand-accent'
                        : 'border-gray-200 dark:border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} angle ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-brand-gray rounded-xl border border-gray-200 dark:border-white/10 p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Star size={16} />
                <span className="text-xs font-semibold uppercase">Rating</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {product.rating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {product.reviewCount || 0} reviews
              </p>
            </div>
            <div className="bg-white dark:bg-brand-gray rounded-xl border border-gray-200 dark:border-white/10 p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Eye size={16} />
                <span className="text-xs font-semibold uppercase">Views</span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                N/A
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Package size={20} />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                    Category
                  </label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.category}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                    Gender
                  </label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{product.gender}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                  Description
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {product.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Pricing
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                  Current Price
                </label>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </p>
              </div>
              {product.originalPrice && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                    Original Price
                  </label>
                  <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% discount
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Box size={20} />
              Inventory
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                  Stock Quantity
                </label>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{product.stock || 0}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 block">
                  Status
                </label>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Tag size={20} />
              Variants
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">
                  Available Colors ({product.colors?.length || 0})
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors?.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-white capitalize"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">
                  Available Sizes ({product.sizes?.length || 0})
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      EU {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-black mb-4">Product Flags</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Product</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  product.isNew 
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                }`}>
                  {product.isNew ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  product.isFeatured 
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                }`}>
                  {product.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}




