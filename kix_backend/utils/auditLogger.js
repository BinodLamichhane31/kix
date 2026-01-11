import crypto from 'crypto';
import AuditLog from '../models/AuditLog.model.js';

/**
 * Audit Logger Utility
 * Provides structured logging for all payment and order operations
 */

/**
 * Create audit log entry
 * @param {Object} params - Audit log parameters
 * @returns {Promise<Object>} - Created audit log entry
 */
export const logAudit = async (params) => {
  try {
    const {
      action,
      orderId,
      orderNumber,
      userId,
      userEmail,
      paymentMethod,
      transactionId,
      amount,
      previousStatus,
      newStatus,
      previousPaymentStatus,
      newPaymentStatus,
      ipAddress,
      userAgent,
      requestId,
      success,
      errorMessage,
      errorCode,
      metadata = {},
    } = params;
    
    // Validate required fields
    if (!action || !orderId || !orderNumber || !userId || !userEmail || success === undefined) {
      console.error('Audit log: Missing required fields', params);
      return null;
    }
    
    const auditEntry = await AuditLog.create({
      action,
      orderId,
      orderNumber,
      userId,
      userEmail,
      paymentMethod,
      transactionId,
      amount,
      previousStatus,
      newStatus,
      previousPaymentStatus,
      newPaymentStatus,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      requestId: requestId || crypto.randomUUID(),
      success,
      errorMessage,
      errorCode,
      metadata,
      timestamp: new Date(),
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${action} - Order: ${orderNumber} - Success: ${success}`);
    }
    
    return auditEntry;
  } catch (error) {
    // Never throw errors from audit logging - it shouldn't break the main flow
    console.error('Error creating audit log:', error);
    return null;
  }
};

/**
 * Get audit logs for an order
 * @param {string} orderId - Order ID
 * @param {number} limit - Maximum number of logs to return
 * @returns {Promise<Array>} - Audit log entries
 */
export const getAuditLogs = async (orderId, limit = 100) => {
  try {
    const logs = await AuditLog.find({ orderId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs for a transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Array>} - Audit log entries
 */
export const getAuditLogsByTransaction = async (transactionId) => {
  try {
    const logs = await AuditLog.find({ transactionId })
      .sort({ timestamp: -1 })
      .lean();
    
    return logs;
  } catch (error) {
    console.error('Error fetching audit logs by transaction:', error);
    return [];
  }
};

/**
 * Get IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
export const getIpAddress = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Get user agent from request
 * @param {Object} req - Express request object
 * @returns {string} - User agent
 */
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Generate request ID for tracing
 * @returns {string} - Request ID
 */
export const generateRequestId = () => {
  // Use crypto.randomUUID if available (Node 15+), otherwise generate manually
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older Node.js versions
  return crypto.randomBytes(16).toString('hex');
};

