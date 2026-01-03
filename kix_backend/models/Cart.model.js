import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
  },
  // For customized products
  customization: {
    type: {
      colors: {
        laces: String,
        mesh: String,
        caps: String,
        inner: String,
        sole: String,
        stripes: String,
        band: String,
        patch: String,
      },
      baseModel: {
        id: String,
        name: String,
      },
    },
    default: null,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
}, {
  _id: true,
  timestamps: false,
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    // Applied promo code
    promoCode: {
      type: String,
      default: null,
    },
    // Shipping method
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'priority'],
      default: 'standard',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Virtual for shipping fee
cartSchema.virtual('shippingFee').get(function () {
  const shippingOptions = {
    standard: 0,
    express: 12,
    priority: 24,
  };
  return shippingOptions[this.shippingMethod] || 0;
});

// Virtual for discount (if promo code applied)
cartSchema.virtual('discount').get(function () {
  if (!this.promoCode) {
    return 0;
  }

  const promoRules = {
    KIX10: {
      label: '10% off your order',
      type: 'percent',
      value: 0.1,
    },
  };

  const promo = promoRules[this.promoCode.toUpperCase()];
  if (!promo) {
    return 0;
  }

  const subtotal = this.subtotal;
  if (promo.type === 'percent') {
    return subtotal * promo.value;
  }

  return 0;
});

// Virtual for total
cartSchema.virtual('total').get(function () {
  return Math.max(this.subtotal - this.discount, 0) + this.shippingFee;
});

// Indexes
cartSchema.index({ user: 1 });

// Method to add item to cart
cartSchema.methods.addItem = function (itemData) {
  const existingItemIndex = this.items.findIndex(
    (item) =>
      item.product.toString() === itemData.product.toString() &&
      item.size === itemData.size &&
      item.color === itemData.color &&
      JSON.stringify(item.customization) === JSON.stringify(itemData.customization)
  );

  if (existingItemIndex !== -1) {
    // Update quantity if item already exists
    this.items[existingItemIndex].quantity += itemData.quantity;
  } else {
    // Add new item
    this.items.push(itemData);
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  return this.save();
};

// Method to remove item
cartSchema.methods.removeItem = function (itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clear = function () {
  this.items = [];
  this.promoCode = null;
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;


