import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ShopFilters } from '../components/ShopFilters';
import { Pagination } from '../components/Pagination';
import * as productService from '../../../services/api/product.service';
import { Loader2, Search, X } from 'lucide-react';

// Filter options for the UI
const filterOptions = {
  categories: ['Running', 'Lifestyle', 'Basketball', 'Classic', 'Limited Edition'],
  genders: ['Men', 'Women', 'Unisex'],
  colors: ['white', 'black', 'red', 'blue', 'pink', 'beige', 'green', 'yellow', 'purple', 'gray'],
  sortOptions: [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ],
};

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null,
    gender: null,
    colors: [],
    minPrice: undefined,
    maxPrice: undefined,
    search: '',
    onlyNew: false,
  });
  const [sort, setSort] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 12;
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadProducts();
  }, [filters, sort, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Map frontend filters to backend API format
      const apiFilters = {
        category: filters.category || undefined,
        gender: filters.gender ? filters.gender.toLowerCase() : undefined,
        colors: filters.colors && filters.colors.length > 0 ? filters.colors : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search || undefined,
        onlyNew: filters.onlyNew || undefined, // Backend expects 'onlyNew' not 'isNew'
        inStock: true, // Only show in-stock products in shop
      };

      // Remove undefined values
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === undefined) {
          delete apiFilters[key];
        }
      });

      const response = await productService.getProducts(
        { ...apiFilters, sort },
        currentPage,
        itemsPerPage
      );
      
      setProducts(response.data || []);
      
      // Transform pagination format if needed
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage || currentPage,
          totalPages: response.pagination.totalPages || 1,
          totalItems: response.pagination.totalItems || 0,
          itemsPerPage: response.pagination.itemsPerPage || itemsPerPage,
          hasNextPage: response.pagination.hasNextPage || false,
          hasPreviousPage: response.pagination.hasPrevPage || response.pagination.hasPreviousPage || false,
        });
      } else {
        setPagination(null);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = {
      onlyNew: searchParams.get('onlyNew'),
      gender: searchParams.get('gender'),
      category: searchParams.get('category'),
      color: searchParams.get('color'),
      sort: searchParams.get('sort'),
      search: searchParams.get('search'),
    };

    const patches = {};

    if (params.onlyNew !== null) {
      patches.onlyNew = params.onlyNew === 'true';
    }

    if (params.gender) {
      const value = params.gender.toLowerCase();
      if (value === 'men') patches.gender = 'Men';
      else if (value === 'women') patches.gender = 'Women';
      else if (value === 'unisex') patches.gender = 'Unisex';
      else if (value === 'all' || value === '') patches.gender = null;
    }

    if (params.category !== null) {
      if (!params.category || params.category === 'all') {
        patches.category = null;
      } else {
        const match = filterOptions.categories.find(
          (cat) => cat.toLowerCase().replace(/\s+/g, '-') === params.category.toLowerCase()
        );
        if (match) {
          patches.category = match;
        }
      }
    }

    if (params.color !== null) {
      if (!params.color || params.color === 'all') {
        patches.colors = [];
      } else {
        patches.colors = [params.color];
      }
    }

    if (params.search !== null) {
      patches.search = params.search || '';
    }

    if (params.sort) {
      const validSort = filterOptions.sortOptions.find((opt) => opt.value === params.sort);
      if (validSort && sort !== params.sort) {
        setSort(params.sort);
      }
    }

    if (Object.keys(patches).length > 0) {
      setFilters((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.entries(patches).forEach(([key, value]) => {
          const isEqual =
            key === 'colors'
              ? JSON.stringify(prev.colors || []) === JSON.stringify(value || [])
              : prev[key] === value;
          if (!isEqual) {
            next[key] = value;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      setCurrentPage(1);
    }
    setSearchInput(patches.search ?? searchParams.get('search') ?? '');
  }, [searchParams, sort]);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const value = searchInput.trim();
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, search: '' }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
            Shop <span className="text-brand-black dark:text-brand-accent">KIX</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover our complete collection of premium sneakers
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="mb-6 lg:hidden">
          <ShopFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            isOpen={isFilterOpen}
            onClose={setIsFilterOpen}
          />
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mb-6 flex items-center gap-3 bg-white dark:bg-brand-gray border border-gray-200 dark:border-white/10 rounded-3xl px-4 py-3 shadow-sm"
        >
          <Search size={18} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search sneakers, collections, or colors..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-2xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black text-sm font-semibold px-4 py-2 hover:bg-brand-accent dark:hover:bg-white transition"
          >
            Search
          </button>
        </form>

        {/* Main Content - Sidebar + Products */}
        <div className="flex gap-6 lg:gap-8">
          {/* Left Sidebar - Filters (Desktop Only) */}
          <div className="hidden lg:block">
            <ShopFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={isFilterOpen}
              onClose={setIsFilterOpen}
            />
          </div>

          {/* Right Side - Products */}
          <div className="flex-1 min-w-0">
            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-none">
              {/* Results Count */}
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {pagination && (
                  <>
                    Showing <span className="font-bold text-gray-900 dark:text-white">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    {' - '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {Math.min(currentPage * itemsPerPage, pagination.totalItems)}
                    </span>
                    {' of '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {pagination.totalItems}
                    </span>
                    {' products'}
                  </>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Sort:
                </label>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex-1 sm:w-auto bg-white dark:bg-brand-black border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-colors"
                >
                  {filterOptions.sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-brand-black dark:text-brand-accent" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4 font-semibold">No products found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination - Always visible if more than 1 page */}
                {pagination && pagination.totalPages > 1 && (
                  <Pagination pagination={pagination} onPageChange={handlePageChange} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
