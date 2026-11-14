const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const RiderProfile = require('../models/RiderProfile');
const Refund = require('../models/Refund');
const Payout = require('../models/Payout');
const RiderPayout = require('../models/RiderPayout');
const SupportTicket = require('../models/SupportTicket');

// @desc    Get Admin Overview & Key Performance Indicators (KPIs)
// @route   GET /api/v1/admin/dashboard/overview
// @access  Private (Admin)
const getAdminOverview = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Parallel aggregate count queries
    const [
      totalOrders,
      ordersToday,
      activeOrdersCount,
      deliveredOrdersCount,
      cancelledOrdersCount,
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      totalRestaurants,
      approvedRestaurants,
      pendingRestaurants,
      suspendedRestaurants,
      totalRiders,
      approvedRiders,
      pendingRiders,
      onlineRidersCount,
      openTicketsCount,
      pendingRefundsCount
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', isSuspended: { $ne: true } }),
      User.countDocuments({ role: 'customer', isSuspended: true }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ approvalStatus: 'approved' }),
      Restaurant.countDocuments({ approvalStatus: 'pending' }),
      Restaurant.countDocuments({ isSuspended: true }),
      User.countDocuments({ role: 'rider' }),
      RiderProfile.countDocuments({ verificationStatus: 'approved' }),
      RiderProfile.countDocuments({ verificationStatus: 'pending' }),
      RiderProfile.countDocuments({ isAvailable: true }),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Refund.countDocuments({ status: 'pending' })
    ]);

    // Financial calculations
    const financialStats = await Order.aggregate([
      {
        $facet: {
          allTimeDelivered: [
            { $match: { status: 'delivered' } },
            {
              $group: {
                _id: null,
                grossRevenue: { $sum: '$pricing.total' },
                subtotalRevenue: { $sum: '$pricing.subtotal' },
                deliveryFees: { $sum: '$pricing.deliveryFee' },
                taxes: { $sum: '$pricing.tax' },
                discounts: { $sum: '$pricing.discount' }
              }
            }
          ],
          todayDelivered: [
            {
              $match: {
                status: 'delivered',
                createdAt: { $gte: todayStart }
              }
            },
            {
              $group: {
                _id: null,
                todayGross: { $sum: '$pricing.total' }
              }
            }
          ]
        }
      }
    ]);

    const allTime = financialStats[0]?.allTimeDelivered[0] || {
      grossRevenue: 0,
      subtotalRevenue: 0,
      deliveryFees: 0,
      taxes: 0,
      discounts: 0
    };

    const todayGross = financialStats[0]?.todayDelivered[0]?.todayGross || 0;

    // Platform commission is calculated roughly at ~15% of food subtotal or recorded
    const estimatedCommission = Math.round(allTime.subtotalRevenue * 0.15);
    const todayCommission = Math.round(todayGross * 0.15);

    // Total refunds sum
    const refundStats = await Refund.aggregate([
      { $match: { status: { $in: ['approved', 'processed'] } } },
      { $group: { _id: null, totalRefunded: { $sum: '$amount' } } }
    ]);
    const totalRefunded = refundStats[0]?.totalRefunded || 0;

    // Payout stats
    const [restaurantPayoutStats, riderPayoutStats] = await Promise.all([
      Payout.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$netPayable' } } }
      ]),
      RiderPayout.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    const totalRestaurantPayouts = restaurantPayoutStats[0]?.total || 0;
    const totalRiderPayouts = riderPayoutStats[0]?.total || 0;

    // Last 7 days revenue trend
    const sevenDayTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          gross: { $sum: '$pricing.total' },
          commission: { $sum: { $multiply: ['$pricing.subtotal', 0.15] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent 10 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email phone')
      .populate('restaurant', 'name logo')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          grossRevenue: allTime.grossRevenue,
          grossRevenueToday: todayGross,
          platformCommission: estimatedCommission,
          platformCommissionToday: todayCommission,
          deliveryFees: allTime.deliveryFees,
          totalRefunded,
          totalRestaurantPayouts,
          totalRiderPayouts,
          totalOrders,
          ordersToday,
          activeOrders: activeOrdersCount,
          deliveredOrders: deliveredOrdersCount,
          cancelledOrders: cancelledOrdersCount,
          customers: {
            total: totalCustomers,
            active: activeCustomers,
            suspended: suspendedCustomers
          },
          restaurants: {
            total: totalRestaurants,
            approved: approvedRestaurants,
            pending: pendingRestaurants,
            suspended: suspendedRestaurants
          },
          riders: {
            total: totalRiders,
            approved: approvedRiders,
            pending: pendingRiders,
            online: onlineRidersCount
          },
          alerts: {
            pendingRestaurants,
            pendingRiders,
            openTickets: openTicketsCount,
            pendingRefunds: pendingRefundsCount
          }
        },
        sevenDayTrend,
        orderStatusBreakdown,
        recentOrders
      }
    });
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard overview.'
    });
  }
};

module.exports = {
  getAdminOverview
};
