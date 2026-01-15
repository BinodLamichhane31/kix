import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
  },
  productImage: {
    type: String,
    required: [true, 'Product image is required'],
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
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
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
      designName: String,
      designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design',
      },
    },
    default: null,
  },
}, {
  _id: true,
  timestamps: false,
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  landmark: {
    type: String,
    default: null,
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'Nepal',
    trim: true,
  },
}, {
  _id: false,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['card', 'esewa', 'cod'],
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentDetails: {
      // Store minimal payment info (last 4 digits, etc.)
      cardLast4: String,
      cardBrand: String,
      // eSewa transaction details
      esewaTransactionId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values while maintaining uniqueness
      },
      esewaProductCode: String,
      esewaReferenceId: String,
      esewaAmount: Number, // Locked amount at payment initiation
      // Verification tracking
      verifiedAt: Date,
      verificationAttempts: {
        type: Number,
        default: 0,
      },
      lastVerificationAttempt: Date,
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'priority'],
      default: 'standard',
    },
    shippingFee: {
      type: Number,
      required: [true, 'Shipping fee is required'],
      min: [0, 'Shipping fee cannot be negative'],
      default: 0,
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
      immutable: true, // Locked once set
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      immutable: true, // Locked once set
    },
    promoCode: {
      type: String,
      default: null,
      immutable: true, // Locked once set
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
      immutable: true, // Locked once set
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'paymentDetails.esewaTransactionId': 1 }, { unique: true, sparse: true });
orderSchema.index({ 'paymentDetails.esewaReferenceId': 1 });

// Static method to generate order number
orderSchema.statics.generateOrderNumber = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KIX-${timestamp}-${random}`;
};

// Pre-save middleware to generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    let orderNumber;
    let isUnique = false;
    
    while (!isUnique) {
      orderNumber = Order.generateOrderNumber();
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
    }
    
    this.orderNumber = orderNumber;
  }
  next();
});

// Pre-save middleware to prevent modification of financial fields
// Note: This middleware runs BEFORE validation, so we need to check modified paths
orderSchema.pre('save', function (next) {
  if (!this.isNew) {
    // Prevent modification of immutable financial fields after order creation
    const financialFields = ['subtotal', 'discount', 'promoCode', 'total', 'shippingFee'];
    const modifiedFields = this.modifiedPaths();
    
    for (const field of modifiedFields) {
      if (financialFields.includes(field)) {
        // Check if the change is actually different (allows setting same value)
        if (this.isModified(field)) {
          return next(new Error(`Cannot modify ${field} after order creation. This field is immutable.`));
        }
      }
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;






