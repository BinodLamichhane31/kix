import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false, // Can be set to true if user has purchased the product
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for product reviews
reviewSchema.index({ product: 1, createdAt: -1 });

// Index for user reviews
reviewSchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware to ensure user can only have one review per product
reviewSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingReview = await mongoose.model('Review').findOne({
      user: this.user,
      product: this.product,
      _id: { $ne: this._id },
    });
    if (existingReview) {
      const error = new Error('You have already reviewed this product');
      error.name = 'DuplicateReviewError';
      return next(error);
    }
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
