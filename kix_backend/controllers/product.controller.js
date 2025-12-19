import Product from '../models/Product.model.js';
import { getFileUrl } from '../middleware/upload.middleware.js';

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      colors,
      minPrice,
      maxPrice,
      search,
      onlyNew,
      isFeatured,
      sort = 'featured',
      page = 1,
      limit = 12,
    } = req.query;

    // Build filter object
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (gender && gender !== 'all') {
      filter.gender = gender.toLowerCase();
    }

    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : [colors];
      filter.colors = { $in: colorArray };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    if (onlyNew === 'true') {
      filter.isNew = true;
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    // Text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Build sort object
    let sortOption = {};
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'featured':
      default:
        sortOption = { isFeatured: -1, createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .select('-__v')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get related products
 */
export const getRelatedProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query;

    // Find the current product
    const currentProduct = await Product.findOne({ slug }).select('category');

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find related products (same category, exclude current product)
    const relatedProducts = await Product.find({
      category: currentProduct.category,
      slug: { $ne: slug },
      inStock: true,
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(parseInt(limit, 10))
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new product (Admin only)
 */
export const createProduct = async (req, res) => {
  try {
    // Parse form data (handles both JSON and multipart/form-data)
    let productData = {};
    
    // If it's multipart/form-data, parse the body fields
    if (req.body && typeof req.body === 'object') {
      productData = { ...req.body };
      
      // Parse array fields if they're strings
      if (typeof productData.colors === 'string') {
        productData.colors = productData.colors ? [productData.colors] : [];
      } else if (Array.isArray(productData.colors)) {
        // Already an array
      } else {
        productData.colors = [];
      }
      
      if (typeof productData.sizes === 'string') {
        productData.sizes = productData.sizes ? [productData.sizes] : [];
      } else if (Array.isArray(productData.sizes)) {
        // Already an array
      } else {
        productData.sizes = [];
      }
      
      if (typeof productData.images === 'string') {
        productData.images = productData.images ? [productData.images] : [];
      } else if (Array.isArray(productData.images)) {
        // Already an array
      } else {
        productData.images = [];
      }
      
      // Parse boolean fields
      if (typeof productData.isNew === 'string') {
        productData.isNew = productData.isNew === 'true';
      }
      if (typeof productData.isFeatured === 'string') {
        productData.isFeatured = productData.isFeatured === 'true';
      }
      if (typeof productData.inStock === 'string') {
        productData.inStock = productData.inStock === 'true';
      }
      
      // Parse number fields
      if (productData.price) {
        productData.price = parseFloat(productData.price);
      }
      if (productData.originalPrice) {
        productData.originalPrice = parseFloat(productData.originalPrice);
      }
      if (productData.stock) {
        productData.stock = parseInt(productData.stock, 10);
      }
      if (productData.rating) {
        productData.rating = parseFloat(productData.rating);
      }
      if (productData.reviewCount) {
        productData.reviewCount = parseInt(productData.reviewCount, 10);
      }
    }

    // Handle file uploads
    if (req.files) {
      // Handle main image
      if (req.files.image && req.files.image.length > 0) {
        productData.image = getFileUrl(req.files.image[0].filename);
      }
      
      // Handle additional images
      if (req.files.images && req.files.images.length > 0) {
        const additionalImages = req.files.images.map(file => getFileUrl(file.filename));
        // Merge with existing images array if any
        productData.images = [...(productData.images || []), ...additionalImages].slice(0, 4);
      }
    } else if (req.file) {
      // Legacy support: single file upload
      productData.image = getFileUrl(req.file.filename);
    }

    // Validate image - must be URL or file path
    if (productData.image && !productData.image.startsWith('/uploads/') && !productData.image.startsWith('http://') && !productData.image.startsWith('https://')) {
      // Invalid image format, remove it
      delete productData.image;
    }
    
    // Ensure main image is provided (file upload required)
    if (!productData.image && !req.files?.image && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product main image is required (please upload a file)',
      });
    }

    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = Product.generateSlug(productData.name);
    }

    // Ensure slug is unique
    const existingProduct = await Product.findOne({ slug: productData.slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists',
      });
    }

    // Set createdBy if user is authenticated
    if (req.user && req.user._id) {
      productData.createdBy = req.user._id;
      productData.updatedBy = req.user._id;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a product (Admin only)
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse form data (handles both JSON and multipart/form-data)
    let updateData = {};
    
    // If it's multipart/form-data, parse the body fields
    if (req.body && typeof req.body === 'object') {
      updateData = { ...req.body };
      
      // Parse array fields if they're strings
      if (updateData.colors !== undefined) {
        if (typeof updateData.colors === 'string') {
          updateData.colors = updateData.colors ? [updateData.colors] : [];
        } else if (!Array.isArray(updateData.colors)) {
          updateData.colors = [];
        }
      }
      
      if (updateData.sizes !== undefined) {
        if (typeof updateData.sizes === 'string') {
          updateData.sizes = updateData.sizes ? [updateData.sizes] : [];
        } else if (!Array.isArray(updateData.sizes)) {
          updateData.sizes = [];
        }
      }
      
      if (updateData.images !== undefined) {
        if (typeof updateData.images === 'string') {
          updateData.images = updateData.images ? [updateData.images] : [];
        } else if (!Array.isArray(updateData.images)) {
          updateData.images = [];
        }
      }
      
      // Parse boolean fields
      if (updateData.isNew !== undefined && typeof updateData.isNew === 'string') {
        updateData.isNew = updateData.isNew === 'true';
      }
      if (updateData.isFeatured !== undefined && typeof updateData.isFeatured === 'string') {
        updateData.isFeatured = updateData.isFeatured === 'true';
      }
      if (updateData.inStock !== undefined && typeof updateData.inStock === 'string') {
        updateData.inStock = updateData.inStock === 'true';
      }
      
      // Parse number fields
      if (updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price);
      }
      if (updateData.originalPrice !== undefined) {
        updateData.originalPrice = updateData.originalPrice ? parseFloat(updateData.originalPrice) : null;
      }
      if (updateData.stock !== undefined) {
        updateData.stock = parseInt(updateData.stock, 10);
      }
      if (updateData.rating !== undefined) {
        updateData.rating = parseFloat(updateData.rating);
      }
      if (updateData.reviewCount !== undefined) {
        updateData.reviewCount = parseInt(updateData.reviewCount, 10);
      }
    }

    // Handle file uploads
    if (req.files) {
      // Handle main image
      if (req.files.image && req.files.image.length > 0) {
        updateData.image = getFileUrl(req.files.image[0].filename);
      }
      
      // Handle additional images
      if (req.files.images && req.files.images.length > 0) {
        const additionalImages = req.files.images.map(file => getFileUrl(file.filename));
        // Merge with existing images array if any, or replace
        if (updateData.images && Array.isArray(updateData.images)) {
          updateData.images = [...updateData.images, ...additionalImages].slice(0, 4);
        } else {
          updateData.images = additionalImages.slice(0, 4);
        }
      }
    } else if (req.file) {
      // Legacy support: single file upload
      updateData.image = getFileUrl(req.file.filename);
    }

    // Validate image - must be URL or file path
    if (updateData.image && !updateData.image.startsWith('/uploads/') && !updateData.image.startsWith('http://') && !updateData.image.startsWith('https://')) {
      // Invalid image format, remove it
      delete updateData.image;
    }
    
    // For updates, image is optional (can keep existing)
    // But if both are missing and no existing image, that's handled by validation

    // Generate slug if name is updated
    if (updateData.name && !updateData.slug) {
      updateData.slug = Product.generateSlug(updateData.name);
    }

    // Check if slug is being updated and if it's unique
    if (updateData.slug) {
      const existingProduct = await Product.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists',
        });
      }
    }

    // Set updatedBy if user is authenticated
    if (req.user && req.user._id) {
      updateData.updatedBy = req.user._id;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a product (Admin only)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get product by ID (Admin only)
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select('-__v').lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

