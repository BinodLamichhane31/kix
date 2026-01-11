import mongoose from 'mongoose';

/**
 * Audit Log Model
 * Records all critical payment and order operations for audit and traceability
 */
const auditLogSchema = new mongoose.Schema(
  {
    // Operation details
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'ORDER_CREATED',
        'PAYMENT_INITIATED',
        'PAYMENT_VERIFIED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PAYMENT_CANCELLED',
        'PAYMENT_REFUNDED',
        'ORDER_STATUS_UPDATED',
        'PAYMENT_STATUS_UPDATED',
        'VERIFICATION_ATTEMPT',
        'VERIFICATION_FAILED',
      ],
    },
    
    // Entity references
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    
    // User information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    
    // Payment information
    paymentMethod: {
      type: String,
      enum: ['card', 'esewa', 'cod'],
    },
    transactionId: String,
    amount: Number,
    
    // Operation metadata
    previousStatus: String,
    newStatus: String,
    previousPaymentStatus: String,
    newPaymentStatus: String,
    
    // Request information
    ipAddress: String,
    userAgent: String,
    requestId: String, // For tracing requests across services
    
    // Result information
    success: {
      type: Boolean,
      required: true,
    },
    errorMessage: String,
    errorCode: String,
    
    // Additional context
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ orderId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ transactionId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index - keep logs for 2 years
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

