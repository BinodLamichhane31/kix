import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, 'Original price cannot be negative'],
      validate: {
        validator: function (value) {
          return value === null || value >= this.price;
        },
        message: 'Original price must be greater than or equal to current price',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['Running', 'Lifestyle', 'Basketball', 'Classic', 'Limited Edition'],
        message: 'Invalid category. Must be one of: Running, Lifestyle, Basketball, Classic, Limited Edition',
      },
    },
    gender: {
      type: String,
      required: [true, 'Product gender is required'],
      enum: {
        values: ['men', 'women', 'unisex'],
        message: 'Invalid gender. Must be one of: men, women, unisex',
      },
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Product main image is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10;
        },
        message: 'Cannot have more than 10 images',
      },
    },
    colors: {
      type: [String],
      required: [true, 'Product colors are required'],
      validate: {
        validator: function (colors) {
          return colors.length > 0;
        },
        message: 'Product must have at least one color',
      },
    },
    sizes: {
      type: [String],
      required: [true, 'Product sizes are required'],
      validate: {
        validator: function (sizes) {
          return sizes.length > 0;
        },
        message: 'Product must have at least one size',
      },
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // SEO fields
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
    // Admin tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search index

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Pre-save middleware to ensure main image is in images array
productSchema.pre('save', function (next) {
  if (this.image && !this.images.includes(this.image)) {
    this.images.unshift(this.image);
  }
  next();
});

// Method to update stock
productSchema.methods.updateStock = function (quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Insufficient stock');
  }
  this.stock += quantity;
  this.inStock = this.stock > 0;
  return this.save();
};

// Static method to generate slug from name
productSchema.statics.generateSlug = function (name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const Product = mongoose.model('Product', productSchema);

export default Product;




