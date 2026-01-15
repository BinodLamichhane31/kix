import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { ArrowLeft, Loader2, RotateCcw, ShoppingBag, Save, Zap, ChevronLeft, ChevronRight, X, Check, Menu } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ShoeViewer from '../components/ShoeViewer';
import { appRoutes } from '../../../utils/navigation';
import { formatPrice } from '../../../utils/currency';
import * as designService from '../../../services/api/design.service';
import { addItemToCart } from '../../../services/api/cart.service';
import { apiRequest } from '../../../services/api/client';
import { useAuth } from '../../../store/contexts/AuthContext';
import { useToast } from '../../../store/contexts/ToastContext';
import { DesignNameModal } from '../../../components/common/DesignNameModal';

// Parts and default colors aligned with the provided customization code
const initialColors = {
  laces: '#ffffff',
  mesh: '#ffffff',
  caps: '#ffffff',
  inner: '#ffffff',
  sole: '#ffffff',
  stripes: '#ffffff',
  band: '#ffffff',
  patch: '#ffffff',
};

const allParts = [
  { key: 'laces', label: 'Laces' },
  { key: 'mesh', label: 'Mesh' },
  { key: 'caps', label: 'Caps' },
  { key: 'inner', label: 'Inner' },
  { key: 'sole', label: 'Sole' },
  { key: 'stripes', label: 'Stripes' },
  { key: 'band', label: 'Band' },
  { key: 'patch', label: 'Patch' },
];

const baseModels = [
  {
    id: 'classic',
    name: 'Classic Runner',
    slug: 'air-max-90-classic',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2012&auto=format&fit=crop',
    description: 'Timeless design, perfect for everyday wear',
  },
  {
    id: 'sport',
    name: 'Sport Pro',
    slug: 'ultra-boost-running-pro',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
    description: 'High-performance athletic sneaker',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    slug: 'retro-wave-lifestyle',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2012&auto=format&fit=crop',
    description: 'Comfortable and stylish for casual occasions',
  },
  {
    id: 'premium',
    name: 'Premium Elite',
    slug: 'heritage-classic-low',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2087&auto=format&fit=crop',
    description: 'Luxury materials and premium craftsmanship',
  },
];

const colorSwatches = [
  '#000000', // Black
  '#ffffff', // White
  '#9ca3af', // Light Grey
  '#d4a574', // Tan/Beige
  '#166534', // Dark Green
  '#1e40af', // Dark Blue
  '#3b82f6', // Light Blue
  '#4b5563', // Dark Purple/Grey
  '#dc2626', // Dark Red
  '#f472b6', // Pink
];

export default function CustomizeSneaker() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('designId');
  
  const [colors, setColors] = useState(initialColors);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState(null); // Track selected part from 3D model
  const [selectedBaseModel, setSelectedBaseModel] = useState(baseModels[0]);
  const [realProduct, setRealProduct] = useState(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPartMenu, setShowPartMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { showToast } = useToast();
  
  // Load design if designId is provided
  useEffect(() => {
    if (designId && isAuthenticated) {
      loadDesign(designId);
    }
  }, [designId, isAuthenticated]);

  // Fetch real product data when base model changes
  useEffect(() => {
    if (selectedBaseModel?.slug) {
      loadRealProduct(selectedBaseModel.slug);
    }
  }, [selectedBaseModel]);
  
  const loadRealProduct = async (slug) => {
    try {
      setLoadingProduct(true);
      const product = await apiRequest(`/products/slug/${slug}`);
      if (product.success) {
        setRealProduct(product.data);
      }
    } catch (error) {
      console.error('Error loading real product:', error);
    } finally {
      setLoadingProduct(false);
    }
  };
  
  const loadDesign = async (id) => {
    try {
      const design = await designService.getDesignById(id);
      if (design) {
        setColors(design.colors);
        // Find matching base model
        const model = baseModels.find(m => m.id === design.baseModel.id) || baseModels[0];
        setSelectedBaseModel(model);
      }
    } catch (error) {
      console.error('Error loading design:', error);
    }
  };

  const handleColorChange = (part, color) => {
    setColors((prev) => ({
      ...prev,
      [part]: color,
    }));
  };

  const handlePartSelect = (partKey) => {
    // Find the index of the selected part
    const partIndex = allParts.findIndex((p) => p.key === partKey);
    if (partIndex !== -1) {
      setActivePartIndex(partIndex);
      setSelectedPart(partKey);
      // Clear selection after a short delay for visual feedback
      setTimeout(() => setSelectedPart(null), 500);
    }
  };

  const handleReset = () => {
    setColors(initialColors);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/auth/sign-in');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveDesign = async (designName) => {
    try {
      setSaving(true);
      setShowSaveModal(false);

      const designData = {
        name: designName,
        description: `Custom ${selectedBaseModel.name} design`,
        baseModel: {
          id: selectedBaseModel.id,
          name: selectedBaseModel.name,
          image: selectedBaseModel.image,
        },
        colors,
        status: 'draft',
        tags: [],
      };

      await designService.createDesign(designData);
      showToast('Design saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving design:', error);
      showToast(error.message || 'Failed to save design. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChooseBaseModel = () => {
    setShowModelSelector(true);
  };

  const handleSelectBaseModel = (model) => {
    setSelectedBaseModel(model);
    setShowModelSelector(false);
  };

  const handleDirectlyBuy = async () => {
    if (!isAuthenticated) {
      navigate('/auth/sign-in');
      return;
    }

    try {
      setSaving(true);
      
      // Ensure product is loaded
      await ensureProductLoaded();
      
      // Add to cart (which also saves the design)
      await handleAddToCart(false);
      
      // Navigate to checkout only after successful cart addition
      navigate('/checkout');
    } catch (error) {
      console.error('Checkout preparation failed:', error);
      showToast(error.message || 'Failed to prepare checkout. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const ensureProductLoaded = async () => {
    if (realProduct) return realProduct;
    
    // Wait for product to load
    try {
      const response = await apiRequest(`/products/slug/${selectedBaseModel.slug}`);
      if (response && response.success) {
        setRealProduct(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
    
    // Fallback to a default product structure if API fails
    return realProduct || {
      _id: 'temp-id',
      name: selectedBaseModel.name,
      price: 2500,
      slug: selectedBaseModel.slug
    };
  };

  const handleAddToCart = async (showNotification = true) => {
    if (!isAuthenticated) {
      navigate('/auth/sign-in');
      return;
    }

    try {
      setSaving(true);
      
      // Ensure product is loaded
      const currentProduct = await ensureProductLoaded();
      
      // 1. Generate a unique name for the design using timestamp + random for better uniqueness
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
      const uniqueId = `${timestamp}${randomStr}`;
      const designName = `Custom ${selectedBaseModel.name} #${uniqueId}`;

      // 2. Auto-save the design
      const designData = {
        name: designName,
        description: `Customized ${selectedBaseModel.name} order design`,
        baseModel: {
          id: selectedBaseModel.id,
          name: selectedBaseModel.name,
          image: selectedBaseModel.image,
        },
        colors,
        status: 'draft',
        tags: ['auto-saved', 'cart-item'],
      };

      let savedDesignResponse;
      let savedDesignId;
      
      try {
        savedDesignResponse = await designService.createDesign(designData);
        savedDesignId = savedDesignResponse?.data?._id || savedDesignResponse?._id;
        
        if (!savedDesignId) {
          throw new Error('Failed to save design - no ID returned');
        }
      } catch (designError) {
        console.error('Error saving design:', designError);
        
        // If design save fails, still try to add to cart without design reference
        // This ensures the user can still purchase even if design save fails
        if (showNotification) {
          showToast('Design could not be saved, but item will be added to cart', 'warning');
        }
      }

      // 3. Add to cart with design metadata using cart service
      const cartItemData = {
        productId: currentProduct._id,
        quantity: 1,
        size: '9', // Default size
        color: 'Custom',
        customization: {
          colors,
          baseModel: {
            id: selectedBaseModel.id,
            name: selectedBaseModel.name
          },
          designName: designName,
          designId: savedDesignId || null
        }
      };

      await addItemToCart(cartItemData);

      if (showNotification) {
        showToast(`"${designName}" added to cart!`, 'success');
      }
    } catch (error) {
      console.error('Error in custom purchase flow:', error);
      if (showNotification) {
        showToast(error.message || 'Failed to process your design. Please try again.', 'error');
      }
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const nextPart = () => {
    setActivePartIndex((prev) => (prev + 1) % allParts.length);
  };

  const prevPart = () => {
    setActivePartIndex((prev) => (prev - 1 + allParts.length) % allParts.length);
  };

  const currentPart = allParts[activePartIndex];
  const currentColor = colors[currentPart.key];

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-brand-gray border-b border-gray-200 dark:border-white/10 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <Link
              to={appRoutes.customize}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-brand-black dark:text-white">
                {selectedBaseModel.name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Customize Your Style</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0 overflow-hidden">
          {/* Left - 3D Preview */}
          <div className="bg-white dark:bg-brand-gray flex items-center justify-center p-12 overflow-hidden">
            <div className="w-full max-w-2xl aspect-square">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-brand-black/40 rounded-2xl">
                    <div className="text-center space-y-4">
                      <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D model...</p>
                    </div>
                  </div>
                }
              >
                <ShoeViewer 
                  colors={colors} 
                  selectedPart={selectedPart || currentPart.key}
                  onPartSelect={handlePartSelect}
                />
              </Suspense>
            </div>
          </div>

          {/* Right - Color Controls */}
          <div className="bg-gray-50 dark:bg-brand-black border-l border-gray-200 dark:border-white/10 overflow-y-auto">
            <div className="p-8 space-y-8">
              {/* Base Model Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Base Model
                  </div>
                  <button
                    onClick={handleChooseBaseModel}
                    className="text-xs font-semibold text-brand-black dark:text-white hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-brand-black shrink-0">
                    <img
                      src={selectedBaseModel.image}
                      alt={selectedBaseModel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-brand-black dark:text-white mb-1">
                      {selectedBaseModel.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedBaseModel.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Part Navigation */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      {currentPart.label} {activePartIndex + 1}/{allParts.length}
                    </div>
                    <div className="text-sm font-semibold text-brand-black dark:text-white">
                      {currentColor.toUpperCase()}
                    </div>
                    {selectedPart === currentPart.key && (
                      <div className="text-xs text-brand-accent mt-1 animate-pulse">
                        ✓ Selected from 3D model
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPart}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      aria-label="Previous part"
                    >
                      <ChevronLeft size={20} className="text-brand-black dark:text-white" />
                    </button>
                    <button
                      onClick={() => setShowPartMenu(!showPartMenu)}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      aria-label="Select part"
                    >
                      <Menu size={20} className="text-brand-black dark:text-white" />
                    </button>
                    <button
                      onClick={nextPart}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      aria-label="Next part"
                    >
                      <ChevronRight size={20} className="text-brand-black dark:text-white" />
                    </button>
                  </div>
                </div>

                {/* Part Menu Dropdown */}
                {showPartMenu && (
                  <div className="mb-6 bg-white dark:bg-brand-gray rounded-xl border border-gray-200 dark:border-white/10 p-4 shadow-lg">
                    <div className="grid grid-cols-3 gap-2">
                      {allParts.map((part, index) => (
                        <button
                          key={part.key}
                          onClick={() => {
                            setActivePartIndex(index);
                            setShowPartMenu(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            activePartIndex === index
                              ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                              : 'bg-gray-50 dark:bg-white/5 text-brand-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                          }`}
                        >
                          {part.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Swatches - 40% smaller */}
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Color
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorSwatches.map((swatch, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(currentPart.key, swatch)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          currentColor.toLowerCase() === swatch.toLowerCase()
                            ? 'border-brand-black dark:border-white scale-110 shadow-lg'
                            : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40'
                        }`}
                        style={{ backgroundColor: swatch }}
                        aria-label={`Select color ${swatch}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker - 40% smaller */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Custom Color
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-white/10 shadow-sm"
                      style={{ backgroundColor: currentColor }}
                    />
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => handleColorChange(currentPart.key, e.target.value)}
                      className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Part Indicators */}
                <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t border-gray-200 dark:border-white/10">
                  {allParts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePartIndex(index)}
                      className={`transition-all ${
                        activePartIndex === index
                          ? 'w-8 h-2 rounded-full bg-brand-black dark:bg-white'
                          : 'w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'
                      }`}
                      aria-label={`Go to part ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors text-sm"
                >
                  <RotateCcw size={16} />
                  Reset All
                </button>
              </div>

              {/* Purchase Card */}
              <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4 sticky bottom-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-2xl font-black text-brand-black dark:text-white">
                    {loadingProduct ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      formatPrice(realProduct?.price || 189)
                    ) }
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                    Add to Cart
                  </button>
                  <button
                    onClick={handleDirectlyBuy}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Zap size={18} />
                    )}
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base Model Selector Modal - Smaller */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-brand-black dark:text-white">
                Choose Base Model
              </h2>
              <button
                onClick={() => setShowModelSelector(false)}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <X size={18} className="text-brand-black dark:text-white" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {baseModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelectBaseModel(model)}
                    className={`relative group rounded-xl border-2 overflow-hidden transition-all text-left ${
                      selectedBaseModel.id === model.id
                        ? 'border-brand-black dark:border-white shadow-md ring-2 ring-brand-black/10 dark:ring-white/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-brand-black shrink-0">
                        <img
                          src={model.image}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-black text-brand-black dark:text-white">
                            {model.name}
                          </h3>
                          {selectedBaseModel.id === model.id && (
                            <div className="w-5 h-5 rounded-full bg-brand-black dark:bg-white flex items-center justify-center shrink-0">
                              <Check size={12} className="text-white dark:text-brand-black" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {model.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Design Name Modal */}
      <DesignNameModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveDesign}
        defaultName={`My ${selectedBaseModel.name} Design`}
      />
    </div>
  );
}
