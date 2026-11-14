const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const RiderProfile = require('../models/RiderProfile');
const Refund = require('../models/Refund');
const Payout = require('../models/Payout');

// @desc    Generate analytics reports for operations and finance
// @route   GET /api/v1/admin/reports
// @access  Private (Admin - Operations/Finance/Super)
const getReports = async (req, res) => {
  try {
    const { reportType = 'sales', startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    if (reportType === 'sales') {
      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalOrders: { $sum: 1 },
            grossSales: { $sum: '$pricing.total' },
            itemSubtotal: { $sum: '$pricing.subtotal' },
            deliveryFees: { $sum: '$pricing.deliveryFee' },
            taxes: { $sum: '$pricing.tax' },
            discounts: { $sum: '$pricing.discount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return res.status(200).json({
        success: true,
        reportType,
        range: { start, end },
        data: salesData
      });
    }

    if (reportType === 'restaurants') {
      const restaurantData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: '$restaurant',
            totalDeliveredOrders: { $sum: 1 },
            totalSales: { $sum: '$pricing.subtotal' },
            totalRevenue: { $sum: '$pricing.total' }
          }
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: '_id',
            foreignField: '_id',
            as: 'restaurant'
          }
        },
        { $unwind: '$restaurant' },
        {
          $project: {
            restaurantName: '$restaurant.name',
            city: '$restaurant.address.city',
            commissionRate: { $ifNull: ['$restaurant.platformCommission', 15] },
            totalDeliveredOrders: 1,
            totalSales: 1,
            totalRevenue: 1,
            platformFeeEarned: {
              $round: [
                {
                  $multiply: [
                    '$totalSales',
                    { $divide: [{ $ifNull: ['$restaurant.platformCommission', 15] }, 100] }
                  ]
                },
                0
              ]
            }
          }
        },
        { $sort: { totalSales: -1 } }
      ]);

      return res.status(200).json({
        success: true,
        reportType,
        range: { start, end },
        data: restaurantData
      });
    }

    if (reportType === 'riders') {
      const riderData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'delivered',
            rider: { $ne: null }
          }
        },
        {
          $group: {
            _id: '$rider',
            deliveriesCompleted: { $sum: 1 },
            deliveryFeeEarned: { $sum: '$pricing.deliveryFee' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            riderName: '$user.name',
            phone: '$user.phone',
            deliveriesCompleted: 1,
            deliveryFeeEarned: 1
          }
        },
        { $sort: { deliveriesCompleted: -1 } }
      ]);

      return res.status(200).json({
        success: true,
        reportType,
        range: { start, end },
        data: riderData
      });
    }

    if (reportType === 'refunds') {
      const refundData = await Refund.find({
        createdAt: { $gte: start, $lte: end }
      })
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        reportType,
        range: { start, end },
        data: refundData
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown reportType. Choose from: sales, restaurants, riders, refunds.'
    });
  } catch (err) {
    console.error('Error generating report:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report.'
    });
  }
};

module.exports = {
  getReports
};
