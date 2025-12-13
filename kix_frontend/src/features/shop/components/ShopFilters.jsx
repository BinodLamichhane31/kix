import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { filterOptions } from '../data/dummyProducts';
import { formatNPR, convertUSDToNPR } from '../../../utils/currency';

export function ShopFilters({ filters, onFilterChange, isOpen, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    gender: true,
    price: true,
    colors: true,
  });

  // Price range slider state (in NPR)
  // USD ranges converted to NPR: $0-$300 = ₨0-₨39,900
  const MIN_PRICE = 0;
  const MAX_PRICE = 39900; // ~$300 in NPR
  const [minPrice, setMinPrice] = useState(filters.minPrice || MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || MAX_PRICE);

  useEffect(() => {
    setLocalFilters(filters);
    setMinPrice(filters.minPrice !== undefined ? filters.minPrice : MIN_PRICE);
    setMaxPrice(filters.maxPrice !== undefined ? filters.maxPrice : MAX_PRICE);
  }, [filters]);

  const handlePriceChange = (newMin, newMax) => {
    const newFilters = { ...localFilters };
    if (newMin === MIN_PRICE && newMax === MAX_PRICE) {
      // Reset to all prices
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
    } else {
      newFilters.minPrice = newMin;
      newFilters.maxPrice = newMax;
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters };
    
    if (key === 'colors') {
      // Toggle color in array
      if (newFilters.colors?.includes(value)) {
        newFilters.colors = newFilters.colors.filter(c => c !== value);
      } else {
        newFilters.colors = [...(newFilters.colors || []), value];
      }
    } else if (key === 'onlyNew') {
      newFilters.onlyNew = value;
    } else {
      newFilters[key] = value === "All" ? null : value;
    }
    
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const cleared = { category: null, gender: null, colors: [], minPrice: undefined, maxPrice: undefined, onlyNew: false };
    setLocalFilters(cleared);
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    onFilterChange(cleared);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFiltersCount = 
    (localFilters.category && localFilters.category !== "All" ? 1 : 0) +
    (localFilters.gender && localFilters.gender !== "All" ? 1 : 0) +
    (localFilters.colors?.length || 0) +
    (localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined ? 1 : 0) +
    (localFilters.onlyNew ? 1 : 0);

  // Active filter chips
  const activeFilters = [];
  if (localFilters.category && localFilters.category !== "All") {
    activeFilters.push({ type: 'category', label: localFilters.category });
  }
  if (localFilters.gender && localFilters.gender !== "All") {
    activeFilters.push({ type: 'gender', label: localFilters.gender });
  }
  if (localFilters.colors?.length > 0) {
    localFilters.colors.forEach(color => {
      const colorName = filterOptions.colors.find(c => c.value === color)?.name || color;
      activeFilters.push({ type: 'color', label: colorName, value: color });
    });
  }
  if (localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined) {
    const range = filterOptions.priceRanges.find(r => 
      r.min === (localFilters.minPrice || 0) && r.max === (localFilters.maxPrice || 133000)
    );
    if (range) {
      activeFilters.push({ type: 'price', label: range.label });
    } else {
      // Custom price range
      activeFilters.push({ 
        type: 'price', 
        label: `${formatNPR(localFilters.minPrice || 0)} - ${formatNPR(localFilters.maxPrice || MAX_PRICE)}` 
      });
    }
  }
  if (localFilters.onlyNew) {
    activeFilters.push({ type: 'onlyNew', label: 'New arrivals' });
  }

  const removeFilter = (filter) => {
    const newFilters = { ...localFilters };
    if (filter.type === 'category') {
      newFilters.category = null;
    } else if (filter.type === 'gender') {
      newFilters.gender = null;
    } else if (filter.type === 'color') {
      newFilters.colors = newFilters.colors?.filter(c => c !== filter.value) || [];
    } else if (filter.type === 'price') {
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
    } else if (filter.type === 'onlyNew') {
      newFilters.onlyNew = false;
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
          Filters
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors uppercase tracking-wider"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-white/10">
          {activeFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => removeFilter(filter)}
              className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-brand-accent hover:text-brand-black hover:border-brand-accent transition-all group"
            >
              {filter.type === 'color' && (
                <span
                  className="w-3 h-3 rounded-full border border-gray-300 dark:border-white/20"
                  style={{
                    backgroundColor: filterOptions.colors.find(c => c.value === filter.value)?.hex || '#ffffff'
                  }}
                />
              )}
              {filter.label}
              <X size={12} className="group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      )}

      {/* Highlights */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">New arrivals</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Show only latest drops</p>
        </div>
        <button
          onClick={() => handleFilterChange('onlyNew', !localFilters.onlyNew)}
          className={`w-14 h-7 rounded-full flex items-center px-1 transition-all ${localFilters.onlyNew ? 'bg-brand-black dark:bg-brand-accent' : 'bg-gray-200 dark:bg-white/10'}`}
          aria-pressed={localFilters.onlyNew}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white dark:bg-brand-black shadow transition-transform ${
              localFilters.onlyNew ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Category
          </h4>
          {expandedSections.category ? (
            <ChevronUp size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          )}
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {filterOptions.categories.map((category) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={(localFilters.category || "All") === category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-4 h-4 text-brand-black dark:text-brand-accent border-gray-300 dark:border-white/20 focus:ring-brand-accent focus:ring-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender Filter */}
      <div>
        <button
          onClick={() => toggleSection('gender')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Gender
          </h4>
          {expandedSections.gender ? (
            <ChevronUp size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          )}
        </button>
        {expandedSections.gender && (
          <div className="space-y-2">
            {filterOptions.genders.map((gender) => (
              <label key={gender} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={(localFilters.gender || "All") === gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-4 h-4 text-brand-black dark:text-brand-accent border-gray-300 dark:border-white/20 focus:ring-brand-accent focus:ring-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors">
                  {gender}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter - Slider */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Price Range
          </h4>
          {expandedSections.price ? (
            <ChevronUp size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
              <span>{formatNPR(minPrice)}</span>
              <span className="text-gray-400">-</span>
              <span>{formatNPR(maxPrice)}</span>
            </div>

            {/* Dual Range Slider */}
            <div className="relative">
              {/* Track */}
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full relative">
                {/* Active Range */}
                <div
                  className="absolute h-2 bg-brand-black dark:bg-brand-accent rounded-full"
                  style={{
                    left: `${((minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                    width: `${((maxPrice - minPrice) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                  }}
                />
              </div>

              {/* Min Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={minPrice}
                onChange={(e) => {
                  const newMin = Math.min(Number(e.target.value), maxPrice - 1000);
                  setMinPrice(newMin);
                  handlePriceChange(newMin, maxPrice);
                }}
                className="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-black [&::-webkit-slider-thumb]:dark:bg-brand-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:dark:border-brand-black [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-black [&::-moz-range-thumb]:dark:bg-brand-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:dark:border-brand-black [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto"
              />

              {/* Max Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={maxPrice}
                onChange={(e) => {
                  const newMax = Math.max(Number(e.target.value), minPrice + 1000);
                  setMaxPrice(newMax);
                  handlePriceChange(minPrice, newMax);
                }}
                className="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-black [&::-webkit-slider-thumb]:dark:bg-brand-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:dark:border-brand-black [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-black [&::-moz-range-thumb]:dark:bg-brand-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:dark:border-brand-black [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto"
              />
            </div>

            {/* Price Inputs (Optional - for precise input) */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1">
                <label className="block text-gray-500 dark:text-gray-400 mb-1">Min (NPR)</label>
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={minPrice}
                  onChange={(e) => {
                    const newMin = Math.min(Math.max(Number(e.target.value), MIN_PRICE), maxPrice - 1000);
                    setMinPrice(newMin);
                    handlePriceChange(newMin, maxPrice);
                  }}
                  className="w-full bg-white dark:bg-brand-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-500 dark:text-gray-400 mb-1">Max (NPR)</label>
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={maxPrice}
                  onChange={(e) => {
                    const newMax = Math.max(Math.min(Number(e.target.value), MAX_PRICE), minPrice + 1000);
                    setMaxPrice(newMax);
                    handlePriceChange(minPrice, newMax);
                  }}
                  className="w-full bg-white dark:bg-brand-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Colors Filter */}
      <div>
        <button
          onClick={() => toggleSection('colors')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Colors
          </h4>
          {expandedSections.colors ? (
            <ChevronUp size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors" />
          )}
        </button>
        {expandedSections.colors && (
          <div className="flex flex-wrap gap-3">
            {filterOptions.colors.map((color) => (
              <label
                key={color.value}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                title={color.name}
              >
                <input
                  type="checkbox"
                  checked={localFilters.colors?.includes(color.value) || false}
                  onChange={() => handleFilterChange('colors', color.value)}
                  className="sr-only"
                />
                <span
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    localFilters.colors?.includes(color.value)
                      ? 'border-brand-black dark:border-white scale-110 shadow-lg'
                      : 'border-gray-300 dark:border-white/20 hover:border-brand-black dark:hover:border-brand-accent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-brand-black dark:group-hover:text-brand-accent transition-colors">
                  {color.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => onClose(!isOpen)}
        className="lg:hidden flex items-center gap-2 bg-white dark:bg-brand-black border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
      >
        <SlidersHorizontal size={18} />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-brand-accent text-brand-black text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm dark:shadow-none">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => onClose(false)}>
          <div 
            className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-brand-black border-r border-gray-200 dark:border-white/10 shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Filters
              </h3>
              <button
                onClick={() => onClose(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
