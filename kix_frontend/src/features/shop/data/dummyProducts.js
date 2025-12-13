// Dummy product data structured for easy backend API integration
// This mimics a typical API response structure

// Currency conversion utility (1 USD = 133 NPR)
const USD_TO_NPR_RATE = 133;
const convertUSDToNPR = (usdPrice) => Math.round(usdPrice * USD_TO_NPR_RATE);

export const dummyProducts = [
  {
    id: 1,
    name: "Air Walker V2",
    slug: "air-walker-v2",
    price: 145.00,
    originalPrice: null,
    category: "Running",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["white", "black", "blue"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    stock: 45,
  },
  {
    id: 2,
    name: "Urban Drift Low",
    slug: "urban-drift-low",
    price: 120.00,
    originalPrice: 150.00,
    category: "Lifestyle",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop",
    ],
    colors: ["black", "white"],
    sizes: ["7", "8", "9", "10", "11"],
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    stock: 32,
  },
  {
    id: 3,
    name: "Cosmos High-Top",
    slug: "cosmos-high-top",
    price: 189.00,
    originalPrice: null,
    category: "Basketball",
    gender: "men",
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=1665&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=1665&auto=format&fit=crop",
    ],
    colors: ["red", "blue", "black"],
    sizes: ["8", "9", "10", "11", "12", "13"],
    isNew: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    stock: 67,
  },
  {
    id: 4,
    name: "Retro Force 90",
    slug: "retro-force-90",
    price: 165.00,
    originalPrice: null,
    category: "Classic",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
    ],
    colors: ["white", "beige"],
    sizes: ["6", "7", "8", "9", "10", "11"],
    isNew: false,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stock: 28,
  },
  {
    id: 5,
    name: "Nova Runner Pro",
    slug: "nova-runner-pro",
    price: 199.00,
    originalPrice: null,
    category: "Running",
    gender: "women",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    ],
    colors: ["pink", "white", "black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 92,
    inStock: true,
    stock: 54,
  },
  {
    id: 6,
    name: "Street Classic Low",
    slug: "street-classic-low",
    price: 110.00,
    originalPrice: 140.00,
    category: "Lifestyle",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2071&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2071&auto=format&fit=crop",
    ],
    colors: ["black", "white", "red"],
    sizes: ["7", "8", "9", "10", "11"],
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 78,
    inStock: true,
    stock: 41,
  },
  {
    id: 7,
    name: "Elite Court",
    slug: "elite-court",
    price: 175.00,
    originalPrice: null,
    category: "Basketball",
    gender: "men",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["black", "white"],
    sizes: ["8", "9", "10", "11", "12"],
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 145,
    inStock: true,
    stock: 36,
  },
  {
    id: 8,
    name: "Minimalist Step",
    slug: "minimalist-step",
    price: 95.00,
    originalPrice: null,
    category: "Lifestyle",
    gender: "women",
    image: "https://images.unsplash.com/photo-1544966503-7d6fd3ae0ab8?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544966503-7d6fd3ae0ab8?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["beige", "pink", "white"],
    sizes: ["5", "6", "7", "8", "9"],
    isNew: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 63,
    inStock: true,
    stock: 29,
  },
  {
    id: 9,
    name: "Speed Demon",
    slug: "speed-demon",
    price: 215.00,
    originalPrice: null,
    category: "Running",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["blue", "black", "red"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    isNew: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 187,
    inStock: true,
    stock: 72,
  },
  {
    id: 10,
    name: "Vintage Champ",
    slug: "vintage-champ",
    price: 130.00,
    originalPrice: 160.00,
    category: "Classic",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["white", "black"],
    sizes: ["7", "8", "9", "10", "11"],
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 112,
    inStock: true,
    stock: 38,
  },
  {
    id: 11,
    name: "Flex Runner",
    slug: "flex-runner",
    price: 155.00,
    originalPrice: null,
    category: "Running",
    gender: "women",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2087&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2087&auto=format&fit=crop",
    ],
    colors: ["pink", "white"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    stock: 43,
  },
  {
    id: 12,
    name: "Court Master",
    slug: "court-master",
    price: 180.00,
    originalPrice: null,
    category: "Basketball",
    gender: "men",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=2069&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=2069&auto=format&fit=crop",
    ],
    colors: ["red", "blue", "black"],
    sizes: ["8", "9", "10", "11", "12", "13"],
    isNew: false,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 134,
    inStock: true,
    stock: 51,
  },
  {
    id: 13,
    name: "Swift Runner X",
    slug: "swift-runner-x",
    price: 165.00,
    originalPrice: null,
    category: "Running",
    gender: "men",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2071&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2071&auto=format&fit=crop",
    ],
    colors: ["blue", "black"],
    sizes: ["8", "9", "10", "11", "12"],
    isNew: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 87,
    inStock: true,
    stock: 42,
  },
  {
    id: 14,
    name: "Grace Step",
    slug: "grace-step",
    price: 125.00,
    originalPrice: null,
    category: "Lifestyle",
    gender: "women",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    ],
    colors: ["pink", "beige", "white"],
    sizes: ["5", "6", "7", "8", "9"],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    stock: 58,
  },
  {
    id: 15,
    name: "Pro Court Elite",
    slug: "pro-court-elite",
    price: 195.00,
    originalPrice: null,
    category: "Basketball",
    gender: "men",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["black", "red"],
    sizes: ["8", "9", "10", "11", "12", "13"],
    isNew: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 201,
    inStock: true,
    stock: 73,
  },
  {
    id: 16,
    name: "Classic Edge",
    slug: "classic-edge",
    price: 115.00,
    originalPrice: 135.00,
    category: "Classic",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
    ],
    colors: ["white", "black"],
    sizes: ["7", "8", "9", "10", "11"],
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 94,
    inStock: true,
    stock: 35,
  },
  {
    id: 17,
    name: "Trail Blazer",
    slug: "trail-blazer",
    price: 175.00,
    originalPrice: null,
    category: "Running",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop",
    ],
    colors: ["black", "blue"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    isNew: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 128,
    inStock: true,
    stock: 47,
  },
  {
    id: 18,
    name: "Urban Chic",
    slug: "urban-chic",
    price: 105.00,
    originalPrice: 125.00,
    category: "Lifestyle",
    gender: "women",
    image: "https://images.unsplash.com/photo-1544966503-7d6fd3ae0ab8?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544966503-7d6fd3ae0ab8?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["beige", "pink"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 76,
    inStock: true,
    stock: 31,
  },
  {
    id: 19,
    name: "Power Dunk",
    slug: "power-dunk",
    price: 200.00,
    originalPrice: null,
    category: "Basketball",
    gender: "men",
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=1665&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=1665&auto=format&fit=crop",
    ],
    colors: ["red", "black"],
    sizes: ["8", "9", "10", "11", "12"],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 169,
    inStock: true,
    stock: 61,
  },
  {
    id: 20,
    name: "Marathon Pro",
    slug: "marathon-pro",
    price: 185.00,
    originalPrice: null,
    category: "Running",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2087&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2087&auto=format&fit=crop",
    ],
    colors: ["blue", "white", "black"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 142,
    inStock: true,
    stock: 52,
  },
  {
    id: 21,
    name: "Casual Comfort",
    slug: "casual-comfort",
    price: 100.00,
    originalPrice: null,
    category: "Lifestyle",
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["white", "beige", "black"],
    sizes: ["6", "7", "8", "9", "10", "11"],
    isNew: true,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 108,
    inStock: true,
    stock: 39,
  },
  {
    id: 22,
    name: "Ace Runner",
    slug: "ace-runner",
    price: 170.00,
    originalPrice: null,
    category: "Running",
    gender: "women",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    ],
    colors: ["pink", "white"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    isNew: false,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 115,
    inStock: true,
    stock: 44,
  },
  {
    id: 23,
    name: "Vintage Court",
    slug: "vintage-court",
    price: 140.00,
    originalPrice: 165.00,
    category: "Classic",
    gender: "men",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=2069&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=2069&auto=format&fit=crop",
    ],
    colors: ["black", "white"],
    sizes: ["8", "9", "10", "11", "12"],
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 97,
    inStock: true,
    stock: 33,
  },
  {
    id: 24,
    name: "Elegance Walk",
    slug: "elegance-walk",
    price: 135.00,
    originalPrice: null,
    category: "Lifestyle",
    gender: "women",
    image: "https://images.unsplash.com/photo-1544966503-7d6fd3ae0ab8?q=80&w=2070&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544966503-7d6fd3ae0ab8?q=80&w=2070&auto=format&fit=crop",
    ],
    colors: ["pink", "beige", "white"],
    sizes: ["5", "6", "7", "8", "9"],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 143,
    inStock: true,
    stock: 56,
  },
];

// Filter options (this would typically come from the API)
export const filterOptions = {
  categories: ["All", "Running", "Lifestyle", "Basketball", "Classic"],
  genders: ["All", "Men", "Women", "Unisex"],
  colors: [
    { name: "White", value: "white", hex: "#ffffff" },
    { name: "Black", value: "black", hex: "#000000" },
    { name: "Red", value: "red", hex: "#ef4444" },
    { name: "Blue", value: "blue", hex: "#3b82f6" },
    { name: "Pink", value: "pink", hex: "#ec4899" },
    { name: "Beige", value: "beige", hex: "#f5f5dc" },
  ],
  priceRanges: [
    { label: "All Prices", min: 0, max: 133000 },
    { label: "Under ₨13,300", min: 0, max: 13300 },
    { label: "₨13,300 - ₨19,950", min: 13300, max: 19950 },
    { label: "₨19,950 - ₨26,600", min: 19950, max: 26600 },
    { label: "Over ₨26,600", min: 26600, max: 133000 },
  ],
  sortOptions: [
    { label: "Featured", value: "featured" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Newest First", value: "newest" },
    { label: "Highest Rated", value: "rating" },
  ],
};

// API-like service functions (to be replaced with actual API calls)
export const shopService = {
  // Simulates API call to get products
  async getProducts(filters = {}, page = 1, limit = 12) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...dummyProducts];
    
    // Apply filters
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.gender && filters.gender !== "All") {
      filtered = filtered.filter(p => 
        p.gender.toLowerCase() === filters.gender.toLowerCase() || p.gender === "unisex"
      );
    }
    
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        filters.colors.some(color => p.colors.includes(color))
      );
    }
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => {
        // Convert product price from USD to NPR for comparison
        const priceInNPR = convertUSDToNPR(p.price);
        if (filters.minPrice !== undefined && priceInNPR < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && priceInNPR > filters.maxPrice) return false;
        return true;
      });
    }

    if (filters.onlyNew) {
      filtered = filtered.filter(p => p.isNew);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case "price_asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case "featured":
        default:
          filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      }
    }
    
    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);
    
    return {
      data: paginated,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
  
  // Get filter options (categories, colors, etc.)
  async getFilterOptions() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return filterOptions;
  },

  async getProductBySlug(slug) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return dummyProducts.find(product => product.slug === slug) || null;
  },

  async getRelatedProducts({ category, excludeSlug, limit = 4 } = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    let products = [...dummyProducts];
    if (category) {
      products = products.filter(product => product.category === category);
    }
    if (excludeSlug) {
      products = products.filter(product => product.slug !== excludeSlug);
    }
    return products.slice(0, limit);
  },
};

