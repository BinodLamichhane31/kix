import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as productService from '../../../services/api/product.service';

const categories = ['Running', 'Lifestyle', 'Basketball', 'Classic', 'Limited Edition'];
const genders = ['men', 'women', 'unisex'];
const availableColors = ['white', 'black', 'red', 'blue', 'pink', 'beige'];
const availableSizes = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];

export function ProductForm({ product, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    originalPrice: '',
    category: 'Running',
    gender: 'unisex',
    image: '',
    images: [],
    colors: [],
    sizes: [],
    isNew: false,
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    inStock: true,
    stock: 0,
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || 'Running',
        gender: product.gender || 'unisex',
        image: product.image || '',
        images: product.images || [],
        colors: product.colors || [],
        sizes: product.sizes || [],
        isNew: product.isNew || false,
        isFeatured: product.isFeatured || false,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        inStock: product.inStock !== undefined ? product.inStock : true,
        stock: product.stock || 0,
        description: product.description || '',
      });
      // Set previews for existing images (convert to full URLs if needed)
      if (product.image) {
        const imageUrl = product.image.startsWith('http') 
          ? product.image 
          : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5050'}${product.image.startsWith('/') ? product.image : '/' + product.image}`;
        setMainImagePreview(imageUrl);
      }
      if (product.images && product.images.length > 0) {
        const imageUrls = product.images.slice(0, 4).map(img => 
          img.startsWith('http') 
            ? img 
            : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5050'}${img.startsWith('/') ? img : '/' + img}`
        );
        setAdditionalImagePreviews(imageUrls);
      }
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        slug: '',
        price: '',
        originalPrice: '',
        category: 'Running',
        gender: 'unisex',
        image: '',
        images: [],
        colors: [],
        sizes: [],
        isNew: false,
        isFeatured: false,
        rating: 0,
        reviewCount: 0,
        inStock: true,
        stock: 0,
        description: '',
      });
      setMainImageFile(null);
      setMainImagePreview(null);
      setAdditionalImageFiles([]);
      setAdditionalImagePreviews([]);
    }
    setErrors({});
    setSubmitError('');
  }, [product, isOpen]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleColorToggle = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: '' }));
      }
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.slice(0, 4); // Max 4 additional images
      setAdditionalImageFiles((prev) => {
        const combined = [...prev, ...newFiles].slice(0, 4);
        return combined;
      });
      
      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setAdditionalImagePreviews((prev) => {
        const combined = [...prev, ...newPreviews].slice(0, 4);
        return combined;
      });
    }
  };

  const handleRemoveMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews((prev) => {
      const preview = prev[index];
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.originalPrice && parseFloat(formData.originalPrice) < parseFloat(formData.price)) {
      newErrors.originalPrice = 'Original price must be greater than current price';
    }

    if (!mainImageFile) {
      newErrors.image = 'Main image is required (please upload a file)';
    }

    if (formData.colors.length === 0) {
      newErrors.colors = 'At least one color is required';
    }

    if (formData.sizes.length === 0) {
      newErrors.sizes = 'At least one size is required';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock, 10),
        rating: parseFloat(formData.rating) || 0,
        reviewCount: parseInt(formData.reviewCount, 10) || 0,
      };

      // Prepare image files array (main image + additional images)
      const imageFiles = [];
      if (mainImageFile) {
        imageFiles.push(mainImageFile);
      }
      imageFiles.push(...additionalImageFiles);

      let result;
      if (product) {
        // Update existing product
        result = await productService.updateProduct(product._id || product.id, productData, mainImageFile, additionalImageFiles);
      } else {
        // Create new product
        result = await productService.createProduct(productData, mainImageFile, additionalImageFiles);
      }

      if (result) {
        onSuccess?.(result);
        onClose();
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-black text-brand-black dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-brand-black dark:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {submitError}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none transition-all ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent'
                }`}
                placeholder="Air Walker V2"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none transition-all ${
                  errors.slug
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent'
                }`}
                placeholder="air-walker-v2"
              />
              {errors.slug && (
                <p className="mt-2 text-sm text-red-500">{errors.slug}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Price (NPR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none transition-all ${
                  errors.price
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent'
                }`}
                placeholder="19285.00"
              />
              {errors.price && (
                <p className="mt-2 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Original Price (NPR)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none transition-all ${
                  errors.originalPrice
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent'
                }`}
                placeholder="19950.00 (optional)"
              />
              {errors.originalPrice && (
                <p className="mt-2 text-sm text-red-500">{errors.originalPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-brand-black border-2 border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-brand-black border-2 border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-all"
              >
                {genders.map((gen) => (
                  <option key={gen} value={gen}>
                    {gen.charAt(0).toUpperCase() + gen.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
              Main Image *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleMainImageChange}
              className="w-full px-4 py-3 bg-white dark:bg-brand-black border-2 border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-black dark:file:bg-brand-accent file:text-white dark:file:text-brand-black hover:file:bg-brand-accent dark:hover:file:bg-white file:cursor-pointer"
            />
            {errors.image && (
              <p className="mt-2 text-sm text-red-500">{errors.image}</p>
            )}

            {/* Main Image Preview */}
            {mainImagePreview && (
              <div className="mt-3">
                <img
                  src={mainImagePreview}
                  alt="Main image preview"
                  className="w-40 h-40 object-cover rounded-lg border border-gray-200 dark:border-white/10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="mt-2 text-xs text-red-500 hover:text-red-600 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Additional Images (4 angles) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
              Additional Images (4 Different Angles)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleAdditionalImagesChange}
              className="w-full px-4 py-3 bg-white dark:bg-brand-black border-2 border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-black dark:file:bg-brand-accent file:text-white dark:file:text-brand-black hover:file:bg-brand-accent dark:hover:file:bg-white file:cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Upload up to 4 images showing different angles of the product
            </p>

            {/* Additional Images Preview */}
            {additionalImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Angle ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-white/10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Angle {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
              Colors * (Select at least one)
            </label>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorToggle(color)}
                  className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                    formData.colors.includes(color)
                      ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black border-brand-black dark:border-brand-accent'
                      : 'bg-white dark:bg-brand-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-brand-black dark:hover:border-brand-accent'
                  }`}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
            {errors.colors && (
              <p className="mt-2 text-sm text-red-500">{errors.colors}</p>
            )}
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
              Sizes * (Select at least one)
            </label>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all ${
                    formData.sizes.includes(size)
                      ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black border-brand-black dark:border-brand-accent'
                      : 'bg-white dark:bg-brand-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-brand-black dark:hover:border-brand-accent'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.sizes && (
              <p className="mt-2 text-sm text-red-500">{errors.sizes}</p>
            )}
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white focus:outline-none transition-all ${
                  errors.stock
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent'
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-2 text-sm text-red-500">{errors.stock}</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="w-5 h-5 text-brand-black dark:text-brand-accent border-gray-300 dark:border-white/20 rounded focus:ring-2 focus:ring-brand-accent"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">In Stock</span>
              </label>
            </div>

            <div className="flex items-center gap-4 pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                  className="w-5 h-5 text-brand-black dark:text-brand-accent border-gray-300 dark:border-white/20 rounded focus:ring-2 focus:ring-brand-accent"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">New Product</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 text-brand-black dark:text-brand-accent border-gray-300 dark:border-white/20 rounded focus:ring-2 focus:ring-brand-accent"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Featured Product</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-brand-black border-2 border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-all resize-none"
              placeholder="Product description..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              product ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

