import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required'],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

// Method to add item to wishlist
wishlistSchema.methods.addItem = function (productId) {
  // Check if product already exists in wishlist
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    // Item already in wishlist, update addedAt
    existingItem.addedAt = new Date();
    return this.save();
  }

  // Add new item
  this.items.push({ product: productId, addedAt: new Date() });
  return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasItem = function (productId) {
  return this.items.some(
    (item) => item.product.toString() === productId.toString()
  );
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;


