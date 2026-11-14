const express = require('express');
const router = express.Router();

const { protectAdmin, requireAdminRole } = require('../middleware/adminAuth');

// Controllers
const {
  loginAdmin,
  getAdminMe,
  updateAdminPassword,
  getAdminAccounts,
  createAdminAccount
} = require('../controllers/adminAuthController');

const { getAdminOverview } = require('../controllers/adminDashboardController');

const {
  getCustomers,
  getCustomerDetails,
  toggleCustomerSuspension
} = require('../controllers/adminCustomersController');

const {
  getRestaurants,
  getRestaurantDetails,
  updateRestaurantApproval,
  toggleRestaurantSuspension,
  updateRestaurantCommission,
  updateRestaurantFeatured
} = require('../controllers/adminRestaurantsController');

const {
  getRiders,
  getRiderDetails,
  updateRiderVerification,
  toggleRiderSuspension
} = require('../controllers/adminRidersController');

const {
  getOrders,
  getOrderDetails,
  overrideOrderStatus,
  assignRider
} = require('../controllers/adminOrdersController');

const {
  getFinanceSummary,
  getPayments,
  getCommissions,
  getRefunds,
  createRefund,
  processRefund,
  getPayouts,
  processRestaurantPayout,
  processRiderPayout
} = require('../controllers/adminFinanceController');

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/adminCategoriesController');

const { getMenuItems, moderateMenuItem } = require('../controllers/adminMenuController');

const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/adminCouponsController');

const { getReviews, moderateReview } = require('../controllers/adminReviewsController');

const {
  getTickets,
  getTicketDetails,
  replyTicket,
  updateTicketStatus
} = require('../controllers/adminSupportController');

const { getAdminAlerts, broadcastAnnouncement } = require('../controllers/adminNotificationsController');

const { getReports } = require('../controllers/adminReportsController');

const { getSettings, updateSettings } = require('../controllers/adminSettingsController');

const { getAuditLogs } = require('../controllers/adminAuditLogsController');

// ========================
// 1. Authentication & Team
// ========================
router.post('/auth/login', loginAdmin);
router.get('/auth/me', protectAdmin, getAdminMe);
router.put('/auth/password', protectAdmin, updateAdminPassword);
router.get('/auth/admins', protectAdmin, requireAdminRole('super_admin'), getAdminAccounts);
router.post('/auth/admins', protectAdmin, requireAdminRole('super_admin'), createAdminAccount);

// ========================
// 2. Dashboard KPIs
// ========================
router.get('/dashboard/overview', protectAdmin, getAdminOverview);

// ========================
// 3. Customers
// ========================
router.get('/customers', protectAdmin, getCustomers);
router.get('/customers/:id', protectAdmin, getCustomerDetails);
router.patch(
  '/customers/:id/suspend',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  toggleCustomerSuspension
);

// ========================
// 4. Restaurants
// ========================
router.get('/restaurants', protectAdmin, getRestaurants);
router.get('/restaurants/:id', protectAdmin, getRestaurantDetails);
router.patch(
  '/restaurants/:id/approval',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  updateRestaurantApproval
);
router.patch(
  '/restaurants/:id/suspend',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  toggleRestaurantSuspension
);
router.patch(
  '/restaurants/:id/commission',
  protectAdmin,
  requireAdminRole('super_admin', 'finance_admin'),
  updateRestaurantCommission
);
router.patch(
  '/restaurants/:id/promoted',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  updateRestaurantFeatured
);

// ========================
// 5. Riders
// ========================
router.get('/riders', protectAdmin, getRiders);
router.get('/riders/:id', protectAdmin, getRiderDetails);
router.patch(
  '/riders/:id/verification',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  updateRiderVerification
);
router.patch(
  '/riders/:id/suspend',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  toggleRiderSuspension
);

// ========================
// 6. Orders
// ========================
router.get('/orders', protectAdmin, getOrders);
router.get('/orders/:id', protectAdmin, getOrderDetails);
router.patch(
  '/orders/:id/override-status',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  overrideOrderStatus
);
router.patch(
  '/orders/:id/assign-rider',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  assignRider
);

// ========================
// 7. Finance, Revenue & Payouts
// ========================
router.get('/finance/summary', protectAdmin, requireAdminRole('super_admin', 'finance_admin'), getFinanceSummary);
router.get('/finance/payments', protectAdmin, requireAdminRole('super_admin', 'finance_admin'), getPayments);
router.get('/finance/commissions', protectAdmin, requireAdminRole('super_admin', 'finance_admin'), getCommissions);
router.get('/finance/refunds', protectAdmin, requireAdminRole('super_admin', 'finance_admin'), getRefunds);
router.post('/finance/refunds', protectAdmin, requireAdminRole('super_admin', 'finance_admin'), createRefund);
router.patch(
  '/finance/refunds/:id/process',
  protectAdmin,
  requireAdminRole('super_admin', 'finance_admin'),
  processRefund
);
router.get('/finance/payouts', protectAdmin, requireAdminRole('super_admin', 'finance_admin'), getPayouts);
router.post(
  '/finance/payouts/restaurant',
  protectAdmin,
  requireAdminRole('super_admin', 'finance_admin'),
  processRestaurantPayout
);
router.post(
  '/finance/payouts/rider',
  protectAdmin,
  requireAdminRole('super_admin', 'finance_admin'),
  processRiderPayout
);

// ========================
// 8. Categories
// ========================
router.get('/categories', protectAdmin, getCategories);
router.post('/categories', protectAdmin, requireAdminRole('super_admin', 'operations_admin'), createCategory);
router.put('/categories/:id', protectAdmin, requireAdminRole('super_admin', 'operations_admin'), updateCategory);
router.delete('/categories/:id', protectAdmin, requireAdminRole('super_admin', 'operations_admin'), deleteCategory);

// ========================
// 9. Menu Moderation
// ========================
router.get('/menu', protectAdmin, getMenuItems);
router.patch(
  '/menu/:id/moderate',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  moderateMenuItem
);

// ========================
// 10. Coupons
// ========================
router.get('/coupons', protectAdmin, getCoupons);
router.post(
  '/coupons',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin', 'finance_admin'),
  createCoupon
);
router.put(
  '/coupons/:id',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin', 'finance_admin'),
  updateCoupon
);
router.delete(
  '/coupons/:id',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin', 'finance_admin'),
  deleteCoupon
);

// ========================
// 11. Reviews Moderation
// ========================
router.get('/reviews', protectAdmin, getReviews);
router.patch(
  '/reviews/:id/moderate',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin', 'support_admin'),
  moderateReview
);

// ========================
// 12. Support Tickets
// ========================
router.get('/support/tickets', protectAdmin, getTickets);
router.get('/support/tickets/:id', protectAdmin, getTicketDetails);
router.post(
  '/support/tickets/:id/reply',
  protectAdmin,
  requireAdminRole('super_admin', 'support_admin', 'operations_admin'),
  replyTicket
);
router.patch(
  '/support/tickets/:id/status',
  protectAdmin,
  requireAdminRole('super_admin', 'support_admin', 'operations_admin'),
  updateTicketStatus
);

// ========================
// 13. Notifications & Broadcast
// ========================
router.get('/notifications/alerts', protectAdmin, getAdminAlerts);
router.post(
  '/notifications/broadcast',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  broadcastAnnouncement
);

// ========================
// 14. Reports
// ========================
router.get(
  '/reports',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin', 'finance_admin'),
  getReports
);

// ========================
// 15. Platform Settings
// ========================
router.get('/settings', protectAdmin, getSettings);
router.put('/settings', protectAdmin, requireAdminRole('super_admin'), updateSettings);

// ========================
// 16. Audit Logs
// ========================
router.get(
  '/audit-logs',
  protectAdmin,
  requireAdminRole('super_admin', 'operations_admin'),
  getAuditLogs
);

module.exports = router;
