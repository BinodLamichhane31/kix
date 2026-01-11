import crypto from 'crypto';

/**
 * eSewa Payment Gateway Service
 * Enterprise-grade implementation with security-first approach
 */

// eSewa Configuration from environment variables
// For testing, use eSewa test credentials:
// - Merchant ID: EPAYTEST
// - Secret Key: 8gBm/:&EnhH.1/q
// - Test eSewa IDs: 9806800001-9806800005, Password: Nepal@123, MPIN: 1122
const ESEWA_CONFIG = {
  // Production or Development
  mode: process.env.ESEWA_MODE || 'development', // 'development' or 'production'
  
  // Development credentials
  // For quick testing without merchant registration, use:
  // ESEWA_DEV_MERCHANT_ID=EPAYTEST
  // ESEWA_DEV_SECRET_KEY=8gBm/:&EnhH.1/q
  dev: {
    merchantId: process.env.ESEWA_DEV_MERCHANT_ID || 'EPAYTEST',
    secretKey: process.env.ESEWA_DEV_SECRET_KEY || '8gBm/:&EnhH.1/q',
    successUrl: process.env.ESEWA_DEV_SUCCESS_URL || 'http://localhost:5173/payment/callback',
    failureUrl: process.env.ESEWA_DEV_FAILURE_URL || 'http://localhost:5173/payment/callback',
    // Test environment URLs for EPAYTEST test account
    // NOTE: eSewa test environments (UAT, RC-EPAY, DEV) are often unreliable or down
    // For reliable testing, consider getting a development merchant account from eSewa
    // 
    // Try these URLs in order (set via ESEWA_DEV_PAYMENT_URL env var):
    // 1. 'https://epay.esewa.com.np/api/epay/main/v2/form' (production-like, might work with test account)
    // 2. 'https://rc-epay.esewa.com.np/api/epay/main/v2/form' (release candidate)
    // 3. 'https://uat.esewa.com.np/epay/main?' (UAT environment - often down)
    // 4. 'https://dev.esewa.com.np/epay/main?' (dev environment)
    //
    // If none work, contact eSewa support: support@esewa.com.np
    paymentUrl: process.env.ESEWA_DEV_PAYMENT_URL || 'https://epay.esewa.com.np/api/epay/main/v2/form',
    verificationUrl: process.env.ESEWA_DEV_VERIFY_URL || 'https://epay.esewa.com.np/api/epay/v1/transaction/verify/?pid=',
  },
  
  // Production credentials
  prod: {
    merchantId: process.env.ESEWA_PROD_MERCHANT_ID || '',
    secretKey: process.env.ESEWA_PROD_SECRET_KEY || '',
    successUrl: process.env.ESEWA_PROD_SUCCESS_URL || 'https://yourdomain.com/payment/callback',
    failureUrl: process.env.ESEWA_PROD_FAILURE_URL || 'https://yourdomain.com/payment/callback',
    paymentUrl: 'https://epay.esewa.com.np/api/epay/main/v2/form',
    verificationUrl: 'https://epay.esewa.com.np/api/epay/v1/transaction/verify/?pid=',
  },
};

/**
 * Get current eSewa configuration based on mode
 */
export const getConfig = () => {
  return ESEWA_CONFIG[ESEWA_CONFIG.mode] || ESEWA_CONFIG.dev;
};

/**
 * Generate cryptographically secure transaction ID
 * Format: KIX-{timestamp}-{random32chars}
 * Example: KIX-1704067200000-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 */
export const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex'); // 32 character hex string
  return `KIX-${timestamp}-${randomBytes}`;
};

/**
 * Generate eSewa Product Code
 * Must be unique per transaction
 * eSewa requires product code to be shorter and simpler (typically order ID or shorter identifier)
 */
export const generateProductCode = (orderNumber) => {
  // eSewa requires product code to be alphanumeric, typically shorter
  // Use order number or a shorter identifier
  // Format: Keep it simple and under 50 chars for better compatibility
  return orderNumber || `ORDER-${Date.now()}`;
};

/**
 * Calculate HMAC signature for eSewa payment request
 * eSewa uses SHA-256 HMAC for request signing
 * 
 * According to eSewa API v2 documentation:
 * - Signature is calculated from signed_field_names in the EXACT ORDER specified
 * - Format: field1=value1,field2=value2,field3=value3
 * - The order MUST match signed_field_names, NOT alphabetical order
 * 
 * @param {Object} data - Data object with field names and values
 * @param {string} secretKey - Secret key for HMAC
 * @param {Array} fieldOrder - Optional: Array of field names in the exact order they should appear (defaults to alphabetical if not provided)
 * @returns {string} - Base64 encoded HMAC signature
 */
export const generateSignature = (data, secretKey, fieldOrder = null) => {
  if (!secretKey || secretKey.trim() === '') {
    throw new Error('eSewa secret key is not configured');
  }
  
  // If field order is specified, use that order; otherwise sort alphabetically (for backward compatibility)
  const keys = fieldOrder || Object.keys(data).sort();
  
  // Create message from data fields in the specified order
  // Format: field1=value1,field2=value2,field3=value3
  const messageParts = keys.map(key => {
    if (!data.hasOwnProperty(key)) {
      throw new Error(`Missing required field for signature: ${key}`);
    }
    return `${key}=${data[key]}`;
  });
  const message = messageParts.join(',');
  
  // Generate HMAC SHA-256 signature
  const signature = crypto
    .createHmac('sha256', secretKey.trim())
    .update(message)
    .digest('base64');
  
  return signature;
};

/**
 * Build eSewa payment URL with all required parameters
 * @param {Object} params - Payment parameters
 * @param {string} params.transactionId - Unique transaction ID
 * @param {number} params.amount - Payment amount (must match order total)
 * @param {string} params.productCode - Product/service code
 * @param {string} params.orderNumber - Order number for reference
 * @returns {Object} - Payment URL and form data
 */
export const buildPaymentUrl = (params) => {
  const config = getConfig();
  const { transactionId, amount, productCode, orderNumber } = params;
  
  // Validate configuration
  if (!config.merchantId || config.merchantId.trim() === '') {
    throw new Error('eSewa merchant ID is not configured. Please check your environment variables.');
  }
  
  if (!config.secretKey || config.secretKey.trim() === '') {
    throw new Error('eSewa secret key is not configured. Please check your environment variables.');
  }
  
  // Validate required parameters
  if (!transactionId || !amount || !productCode || !orderNumber) {
    throw new Error('Missing required payment parameters');
  }
  
  // Validate amount is positive
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }
  
  // Validate amount doesn't exceed eSewa limits (max 100,000 NPR)
  if (amount > 100000) {
    throw new Error('Payment amount exceeds eSewa maximum limit of 100,000 NPR');
  }
  
  // Format amount to 2 decimal places (required by eSewa)
  const formattedAmount = parseFloat(amount).toFixed(2);
  
  // Prepare payment data according to eSewa API v2 format
  // Note: eSewa v2 API format - do NOT include merchant_id in form data
  // The merchant ID is validated via the signature and secret key
  const paymentData = {
    amount: formattedAmount,
    tax_amount: '0.00',
    total_amount: formattedAmount,
    transaction_uuid: transactionId,
    product_code: productCode,
    product_service_charge: '0.00',
    product_delivery_charge: '0.00',
    success_url: config.successUrl,
    failure_url: config.failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature: '', // Will be calculated below
  };
  
  // Note: merchant_id is NOT included in form data for eSewa v2 API
  // It's validated server-side by eSewa using the signature and secret key
  
  // Generate signature from signed fields only
  // CRITICAL: Order must match signed_field_names EXACTLY: total_amount,transaction_uuid,product_code
  const signatureData = {
    total_amount: paymentData.total_amount,
    transaction_uuid: paymentData.transaction_uuid,
    product_code: paymentData.product_code,
  };
  
  // Parse the signed_field_names to get the exact field order
  const fieldOrder = paymentData.signed_field_names.split(',').map(field => field.trim());
  
  try {
    // Generate signature with the exact field order from signed_field_names
    paymentData.signature = generateSignature(signatureData, config.secretKey, fieldOrder);
    
    // Log signature generation for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // Build message in the correct order (matching signed_field_names)
      const message = fieldOrder.map(key => `${key}=${signatureData[key]}`).join(',');
      console.log('eSewa Payment Debug:', {
        merchantId: config.merchantId,
        paymentUrl: config.paymentUrl,
        transactionId: transactionId,
        amount: formattedAmount,
        productCode: productCode,
        signedFieldNames: paymentData.signed_field_names,
        fieldOrder: fieldOrder,
        signatureMessage: message, // This should match the actual signature message now
        signatureLength: paymentData.signature?.length || 0,
        signature: paymentData.signature?.substring(0, 20) + '...', // First 20 chars only
        formDataKeys: Object.keys(paymentData),
        formData: paymentData, // Full form data for debugging
      });
    }
    
    return {
      url: config.paymentUrl,
      method: 'POST',
      formData: paymentData,
      merchantId: config.merchantId,
    };
  } catch (error) {
    console.error('Error generating eSewa signature:', error);
    throw new Error(`Failed to generate payment signature: ${error.message}`);
  }
};

/**
 * Verify eSewa payment using eSewa verification API
 * This implements the verify-before-trust model
 * @param {Object} params - Verification parameters
 * @param {string} params.transactionId - Transaction ID from eSewa callback
 * @param {string} params.productCode - Product code used in payment
 * @param {number} params.totalAmount - Total amount from order (optional, for verification)
 * @returns {Promise<Object>} - Verification result
 */
export const verifyPayment = async (params) => {
  const config = getConfig();
  const { transactionId, productCode, totalAmount } = params;
  
  if (!transactionId || !productCode) {
    throw new Error('Missing required verification parameters');
  }
  
  // Build verification URL according to eSewa API documentation
  // Format: https://epay.esewa.com.np/api/epay/v1/transaction/verify/?pid={transaction_uuid}&product_code={product_code}&total_amount={total_amount}
  // Note: total_amount is required for verification
  const amount = totalAmount || 0;
  const verificationUrl = `${config.verificationUrl}${transactionId}&product_code=${productCode}&total_amount=${amount}`;
  
  try {
    // Use native fetch for HTTP request (Node.js 18+)
    // For older Node versions, consider using axios or node-fetch
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;
    
    const response = await fetch(verificationUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller?.signal,
    });
    
    if (timeoutId) clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`eSewa verification API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    // eSewa returns { status: 'COMPLETE' } on success, or error details on failure
    if (data.status === 'COMPLETE' || data.status === 'SUCCESS') {
      return {
        success: true,
        verified: true,
        transactionId: transactionId,
        data: data,
      };
    } else {
      return {
        success: false,
        verified: false,
        transactionId: transactionId,
        error: data.message || 'Payment verification failed',
        data: data,
      };
    }
  } catch (error) {
    // Handle network errors, timeouts, etc.
    console.error('eSewa verification error:', error);
    return {
      success: false,
      verified: false,
      transactionId: transactionId,
      error: error.message || 'Verification request failed',
    };
  }
};

/**
 * Validate eSewa callback parameters
 * Prevents tampering and ensures data integrity
 * @param {Object} callbackData - Data from eSewa callback
 * @param {Object} order - Order from database
 * @returns {Object} - Validation result
 */
export const validateCallback = (callbackData, order) => {
  const errors = [];
  
  // Required fields check
  if (!callbackData.transaction_uuid) {
    errors.push('Missing transaction_uuid');
  }
  
  if (!callbackData.product_code) {
    errors.push('Missing product_code');
  }
  
  if (callbackData.total_amount === undefined) {
    errors.push('Missing total_amount');
  }
  
  // Verify transaction ID matches order
  if (callbackData.transaction_uuid !== order.paymentDetails?.esewaTransactionId) {
    errors.push('Transaction ID mismatch');
  }
  
  // Verify product code matches order
  if (callbackData.product_code !== order.paymentDetails?.esewaProductCode) {
    errors.push('Product code mismatch');
  }
  
  // Verify amount matches order total (with tolerance for rounding)
  const callbackAmount = parseFloat(callbackData.total_amount);
  const orderTotal = order.total;
  const amountDifference = Math.abs(callbackAmount - orderTotal);
  
  if (amountDifference > 0.01) { // Allow 1 paisa tolerance for rounding
    errors.push(`Amount mismatch: expected ${orderTotal}, got ${callbackAmount}`);
  }
  
  // Verify status
  if (!['SUCCESS', 'COMPLETE', 'PENDING', 'FAILURE'].includes(callbackData.status)) {
    errors.push(`Invalid status: ${callbackData.status}`);
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Check if payment endpoint is properly configured
 */
export const isConfigured = () => {
  const config = getConfig();
  const isValid = !!(config.merchantId && config.secretKey && config.successUrl && config.failureUrl);
  
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.warn('eSewa configuration incomplete:', {
      hasMerchantId: !!config.merchantId,
      hasSecretKey: !!config.secretKey,
      hasSuccessUrl: !!config.successUrl,
      hasFailureUrl: !!config.failureUrl,
      mode: ESEWA_CONFIG.mode,
    });
  }
  
  return isValid;
};

