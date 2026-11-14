const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const supportRoutes = require('./routes/supportRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Module 02: Restaurant Owner Routes
const ownerAuthRoutes = require('./routes/ownerAuthRoutes');
const ownerDashboardRoutes = require('./routes/ownerDashboardRoutes');
const ownerRestaurantRoutes = require('./routes/ownerRestaurantRoutes');
const ownerMenuRoutes = require('./routes/ownerMenuRoutes');
const ownerOrderRoutes = require('./routes/ownerOrderRoutes');
const ownerReviewRoutes = require('./routes/ownerReviewRoutes');
const ownerPromotionRoutes = require('./routes/ownerPromotionRoutes');
const ownerEarningsRoutes = require('./routes/ownerEarningsRoutes');
const ownerNotificationRoutes = require('./routes/ownerNotificationRoutes');

// Module 03: Delivery Rider Routes
const riderAuthRoutes = require('./routes/riderAuthRoutes');
const riderProfileRoutes = require('./routes/riderProfileRoutes');
const riderDashboardRoutes = require('./routes/riderDashboardRoutes');
const riderAvailabilityRoutes = require('./routes/riderAvailabilityRoutes');
const riderDeliveryRoutes = require('./routes/riderDeliveryRoutes');
const riderLocationRoutes = require('./routes/riderLocationRoutes');
const riderHistoryRoutes = require('./routes/riderHistoryRoutes');
const riderEarningsRoutes = require('./routes/riderEarningsRoutes');
const riderNotificationRoutes = require('./routes/riderNotificationRoutes');

// Module 04: System Admin Portal Routes
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000'
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 FoodDelight API Server is running successfully!',
    port: process.env.PORT || 5000,
    health: '/health',
    customerPortal: 'http://localhost:5174',
    ownerPortal: 'http://localhost:5174/owner/login'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'FoodDelight API Server',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/payments', paymentRoutes);

// Module 02: Restaurant Owner Portal API Routes (/api/v1/owner and /api/owner aliases)
const mountOwnerRoutes = (prefix) => {
  app.use(`${prefix}/auth`, ownerAuthRoutes);
  app.use(`${prefix}/dashboard`, ownerDashboardRoutes);
  app.use(`${prefix}/restaurant`, ownerRestaurantRoutes);
  app.use(`${prefix}/menu`, ownerMenuRoutes);
  app.use(`${prefix}/orders`, ownerOrderRoutes);
  app.use(`${prefix}/reviews`, ownerReviewRoutes);
  app.use(`${prefix}/promotions`, ownerPromotionRoutes);
  app.use(`${prefix}/earnings`, ownerEarningsRoutes);
  app.use(`${prefix}/notifications`, ownerNotificationRoutes);
};

mountOwnerRoutes('/api/v1/owner');
mountOwnerRoutes('/api/owner');

// Module 03: Delivery Rider Portal API Routes
const mountRiderRoutes = (prefix) => {
  app.use(`${prefix}/auth`, riderAuthRoutes);
  app.use(`${prefix}/profile`, riderProfileRoutes);
  app.use(`${prefix}/dashboard`, riderDashboardRoutes);
  app.use(`${prefix}/availability`, riderAvailabilityRoutes);
  app.use(`${prefix}/deliveries`, riderDeliveryRoutes);
  app.use(`${prefix}/location`, riderLocationRoutes);
  app.use(`${prefix}/history`, riderHistoryRoutes);
  app.use(`${prefix}/earnings`, riderEarningsRoutes);
  app.use(`${prefix}/notifications`, riderNotificationRoutes);
};

mountRiderRoutes('/api/v1/rider');
mountRiderRoutes('/api/rider');

// Module 04: System Admin Portal API Routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
