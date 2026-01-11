import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import designRoutes from './routes/design.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import reviewRoutes from './routes/review.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KIX API is running' });
});

// eSewa configuration check (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/payments/esewa/check-config', async (req, res) => {
    try {
      const esewaService = await import('./utils/esewa.service.js');
      const { isConfigured, getConfig } = esewaService;
      
      if (typeof getConfig !== 'function') {
        return res.status(500).json({
          success: false,
          error: 'getConfig is not a function. Check exports in esewa.service.js',
          availableExports: Object.keys(esewaService),
        });
      }
      
      const config = getConfig();
      
      res.json({
        success: true,
        configured: isConfigured(),
        config: {
          mode: process.env.ESEWA_MODE || 'development',
          hasMerchantId: !!config.merchantId,
          merchantId: config.merchantId || 'NOT SET',
          hasSecretKey: !!config.secretKey,
          secretKeyLength: config.secretKey?.length || 0,
          hasSuccessUrl: !!config.successUrl,
          successUrl: config.successUrl || 'NOT SET',
          hasFailureUrl: !!config.failureUrl,
          failureUrl: config.failureUrl || 'NOT SET',
          paymentUrl: config.paymentUrl || 'NOT SET',
        },
        envVars: {
          ESEWA_MODE: process.env.ESEWA_MODE || 'NOT SET',
          ESEWA_DEV_MERCHANT_ID: process.env.ESEWA_DEV_MERCHANT_ID ? 'SET' : 'NOT SET',
          ESEWA_DEV_SECRET_KEY: process.env.ESEWA_DEV_SECRET_KEY ? 'SET' : 'NOT SET',
          ESEWA_DEV_SUCCESS_URL: process.env.ESEWA_DEV_SUCCESS_URL || 'NOT SET',
          ESEWA_DEV_FAILURE_URL: process.env.ESEWA_DEV_FAILURE_URL || 'NOT SET',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes); // Payment callbacks (public endpoints)
app.use('/api/designs', designRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kix')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;



