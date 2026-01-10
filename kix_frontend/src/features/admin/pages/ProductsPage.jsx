import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Search, Edit, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/currency';
import { ProductForm } from '../components/ProductForm';
import * as productService from '../../../services/api/product.service';
import { Toast } from '../../../components/common/Toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const statusMap = {
  active: { label: 'Active', bgColor: 'bg-green-100 dark:bg-green-900/40', textColor: 'text-green-700 dark:text-green-300' },
  low_stock: { label: 'Low Stock', bgColor: 'bg-yellow-100 dark:bg-yellow-900/40', textColor: 'text-yellow-700 dark:text-yellow-300' },
  out_of_stock: { label: 'Out of Stock', bgColor: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-700 dark:text-red-300' },
  inactive: { label: 'Inactive', bgColor: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-700 dark:text-gray-300' },
};

const getProductStatus = (product) => {
  if (!product.inStock) return 'out_of_stock';
  if (product.stock < 10) return 'low_stock';
  return 'active';
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all products with a high limit
      const response = await productService.getProducts({}, 1, 1000);
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const productStatus = getProductStatus(product);
      const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    const id = productToDelete._id || productToDelete.id;
    setDeletingId(id);
    try {
      await productService.deleteProduct(id);
      // Reload products after deletion
      await loadProducts();
      setToast({
        show: true,
        message: `Product "${productToDelete.name}" deleted successfully`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setToast({
        show: true,
        message: err.message || 'Failed to delete product',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  const handleFormSuccess = (product, isUpdate = false) => {
    loadProducts();
    setToast({
      show: true,
      message: isUpdate 
        ? `Product "${product?.name || 'Product'}" updated successfully`
        : `Product "${product?.name || 'Product'}" added successfully`,
      type: 'success',
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Products</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your product catalog ({products.length} products)
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm font-medium focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-brand-black/40 border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {filteredProducts.map((product) => {
                  const status = statusMap[getProductStatus(product)];
                  return (
                    <tr key={product.id || product._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            {!product.image && (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {product.id || product._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{product.slug}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                        {product.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={product.stock < 10 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${status.bgColor} ${status.textColor}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product._id || product.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            disabled={deletingId === (product._id || product.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === (product._id || product.id) ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <Package size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No products found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
            >
              <Plus size={18} />
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={(product) => handleFormSuccess(product, !!editingProduct)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name || 'this product'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
          duration={3000}
        />
      )}
    </div>
  );
}
