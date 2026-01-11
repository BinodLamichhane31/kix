/**
 * Rate Limiting Middleware
 * Provides rate limiting for payment endpoints to prevent abuse
 */

// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map();

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message to return
 * @returns {Function} - Express middleware
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 10, // 10 requests per window default
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => {
      // Use IP address and user ID if authenticated
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                 req.headers['x-real-ip'] ||
                 req.ip ||
                 'unknown';
      const userId = req.user?.id || 'anonymous';
      return `${ip}:${userId}`;
    },
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create entry for this key
    let entry = requestCounts.get(key);

    if (!entry || now - entry.resetTime > windowMs) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      requestCounts.set(key, entry);
      return next();
    }

    // Increment count
    entry.count++;

    if (entry.count > max) {
      // Rate limit exceeded
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: resetIn,
      });
      return;
    }

    requestCounts.set(key, entry);
    next();
  };
};

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Payment endpoint rate limiter
 * Stricter limits for payment operations
 */
export const paymentRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many payment requests, please try again in a minute',
});

/**
 * Callback endpoint rate limiter
 * More lenient for callbacks as they come from eSewa
 */
export const callbackRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute (higher for eSewa callbacks)
  message: 'Too many callback requests, please contact support',
});

/**
 * Verification endpoint rate limiter
 * Allow more verification attempts
 */
export const verificationRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 verification attempts per minute
  message: 'Too many verification attempts, please try again later',
});

