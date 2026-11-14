const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Payout = require('../models/Payout');
const RiderPayout = require('../models/RiderPayout');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get Comprehensive Financial Summary
// @route   GET /api/v1/admin/finance/summary
// @access  Private (Admin - Finance/Super)
const getFinanceSummary = async (req, res) => {
  try {
    const [ordersAgg, refundsAgg, restaurantPayoutsAgg, riderPayoutsAgg, paymentMethodAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'delivered' } },
        {
          $group: {
            _id: null,
            totalGmv: { $sum: '$pricing.total' },
            totalSubtotal: { $sum: '$pricing.subtotal' },
            totalDeliveryFees: { $sum: '$pricing.deliveryFee' },
            totalTaxes: { $sum: '$pricing.tax' },
            totalDiscounts: { $sum: '$pricing.discount' },
            deliveredCount: { $sum: 1 }
          }
        }
      ]),
      Refund.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Payout.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$netPayable' },
            count: { $sum: 1 }
          }
        }
      ]),
      RiderPayout.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$payment.method',
            totalVolume: { $sum: '$pricing.total' },
            orderCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const orderData = ordersAgg[0] || {
      totalGmv: 0,
      totalSubtotal: 0,
      totalDeliveryFees: 0,
      totalTaxes: 0,
      totalDiscounts: 0,
      deliveredCount: 0
    };

    const platformCommission = Math.round(orderData.totalSubtotal * 0.15);

    let totalRefunded = 0;
    let pendingRefundAmount = 0;
    refundsAgg.forEach((r) => {
      if (['approved', 'processed'].includes(r._id)) totalRefunded += r.totalAmount;
      if (r._id === 'pending') pendingRefundAmount += r.totalAmount;
    });

    let completedRestaurantPayouts = 0;
    restaurantPayoutsAgg.forEach((p) => {
      if (p._id === 'completed') completedRestaurantPayouts += p.totalAmount;
    });

    let completedRiderPayouts = 0;
    riderPayoutsAgg.forEach((p) => {
      if (p._id === 'completed') completedRiderPayouts += p.totalAmount;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalGmv: orderData.totalGmv,
        platformCommission,
        deliveryFees: orderData.totalDeliveryFees,
        taxes: orderData.totalTaxes,
        totalRefunded,
        pendingRefundAmount,
        completedRestaurantPayouts,
        completedRiderPayouts,
        paymentMethodBreakdown: paymentMethodAgg,
        refundsSummary: refundsAgg,
        restaurantPayoutsSummary: restaurantPayoutsAgg,
        riderPayoutsSummary: riderPayoutsAgg
      }
    });
  } catch (err) {
    console.error('Error getting financial summary:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial summary.'
    });
  }
};

// @desc    Get paginated payments
// @route   GET /api/v1/admin/finance/payments
// @access  Private (Admin - Finance/Super)
const getPayments = async (req, res) => {
  try {
    const { search = '', status = 'all', method = 'all', page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};
    if (status !== 'all') {
      query['payment.status'] = status;
    }
    if (method !== 'all') {
      query['payment.method'] = method;
    }
    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ orderNumber: reg }, { 'payment.transactionId': reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('restaurant', 'name')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .select('orderNumber user restaurant payment pricing status createdAt')
        .lean()
    ]);

    const payments = orders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      customer: o.user,
      restaurant: o.restaurant,
      amount: o.pricing?.total || 0,
      method: o.payment?.method || 'cash',
      status: o.payment?.status || 'pending',
      transactionId: o.payment?.transactionId || `TXN-${o.orderNumber}`,
      orderStatus: o.status,
      createdAt: o.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments.'
    });
  }
};

// @desc    Get restaurant commissions breakdown
// @route   GET /api/v1/admin/finance/commissions
// @access  Private (Admin - Finance/Super)
const getCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Aggregate commissions by restaurant
    const commissions = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: '$restaurant',
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$pricing.subtotal' },
          grossTotal: { $sum: '$pricing.total' }
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
          restaurantId: '$_id',
          restaurantName: '$restaurant.name',
          platformCommissionRate: { $ifNull: ['$restaurant.platformCommission', 15] },
          totalOrders: 1,
          totalSales: 1,
          grossTotal: 1,
          earnedCommission: {
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
      { $sort: { earnedCommission: -1 } },
      { $skip: skip },
      { $limit: take }
    ]);

    const totalStats = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$pricing.subtotal' }
        }
      }
    ]);

    const overallSales = totalStats[0]?.totalSales || 0;
    const overallEstimatedCommission = Math.round(overallSales * 0.15);

    return res.status(200).json({
      success: true,
      data: {
        commissions,
        totals: {
          overallSales,
          overallEstimatedCommission
        }
      }
    });
  } catch (err) {
    console.error('Error fetching commissions:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve commissions.'
    });
  }
};

// @desc    Get paginated refunds list
// @route   GET /api/v1/admin/finance/refunds
// @access  Private (Admin - Finance/Super)
const getRefunds = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10, search = '' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ orderNumber: reg }, { reason: reg }, { providerReference: reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, refunds] = await Promise.all([
      Refund.countDocuments(query),
      Refund.find(query)
        .populate('customer', 'name email phone')
        .populate('order', 'orderNumber status pricing payment')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        refunds,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching refunds:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve refunds.'
    });
  }
};

// @desc    Create manual refund request for an order
// @route   POST /api/v1/admin/finance/refunds
// @access  Private (Admin - Finance/Super)
const createRefund = async (req, res) => {
  try {
    const { orderId, amount, reason, refundMethod = 'original_source' } = req.body;

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const refundAmount = amount ? parseInt(amount) : order.pricing.total;

    const refund = await Refund.create({
      order: order._id,
      orderNumber: order.orderNumber,
      customer: order.user._id,
      amount: refundAmount,
      reason: reason || 'Customer requested cancellation/refund',
      status: 'pending',
      refundMethod
    });

    await recordAudit({
      admin: req.user,
      action: 'create_refund_request',
      targetType: 'Refund',
      targetId: refund._id,
      targetName: `Refund for Order #${order.orderNumber}`,
      reason,
      details: {
        orderNumber: order.orderNumber,
        amount: refundAmount,
        refundMethod
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Refund request created successfully.',
      data: refund
    });
  } catch (err) {
    console.error('Error creating refund:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create refund request.'
    });
  }
};

// @desc    Process or approve/reject refund
// @route   PATCH /api/v1/admin/finance/refunds/:id/process
// @access  Private (Admin - Finance/Super)
const processRefund = async (req, res) => {
  try {
    const { status, adminNotes = '', providerReference = '' } = req.body; // 'approved' | 'processed' | 'rejected'

    if (!['approved', 'processed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund status. Must be approved, processed, or rejected.'
      });
    }

    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund record not found.'
      });
    }

    const prevStatus = refund.status;
    refund.status = status;
    refund.adminNotes = adminNotes;
    if (providerReference) refund.providerReference = providerReference;
    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    await refund.save();

    // If processed or approved, update the corresponding Order's payment status to 'refunded'
    if (['approved', 'processed'].includes(status)) {
      await Order.findByIdAndUpdate(refund.order, {
        'payment.status': 'refunded'
      });
    }

    await recordAudit({
      admin: req.user,
      action: `refund_${status}`,
      targetType: 'Refund',
      targetId: refund._id,
      targetName: `Refund for Order #${refund.orderNumber}`,
      reason: adminNotes || `Refund status updated to ${status}`,
      details: {
        orderNumber: refund.orderNumber,
        amount: refund.amount,
        previousStatus: prevStatus,
        newStatus: status,
        providerReference: refund.providerReference
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Refund has been ${status}.`,
      data: refund
    });
  } catch (err) {
    console.error('Error processing refund:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process refund.'
    });
  }
};

// @desc    Get paginated restaurant and rider payouts
// @route   GET /api/v1/admin/finance/payouts
// @access  Private (Admin - Finance/Super)
const getPayouts = async (req, res) => {
  try {
    const { type = 'restaurant', status = 'all', page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    if (type === 'rider') {
      const query = {};
      if (status !== 'all') query.status = status;

      const [total, payouts] = await Promise.all([
        RiderPayout.countDocuments(query),
        RiderPayout.find(query)
          .populate('rider', 'name email phone avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(take)
          .lean()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          type: 'rider',
          payouts,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / take) || 1,
            limit: take
          }
        }
      });
    }

    // Default: Restaurant payouts
    const query = {};
    if (status !== 'all') query.status = status;

    const [total, payouts] = await Promise.all([
      Payout.countDocuments(query),
      Payout.find(query)
        .populate('restaurant', 'name logo contact address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        type: 'restaurant',
        payouts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching payouts:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payouts.'
    });
  }
};

// @desc    Process a restaurant payout
// @route   POST /api/v1/admin/finance/payouts/restaurant
// @access  Private (Admin - Finance/Super)
const processRestaurantPayout = async (req, res) => {
  try {
    const { restaurantId, netPayable, grossRevenue, commission, period, transactionReference } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const payout = await Payout.create({
      restaurant: restaurant._id,
      netPayable: parseInt(netPayable),
      grossRevenue: parseInt(grossRevenue || netPayable),
      commission: parseInt(commission || 0),
      period: period || {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      status: 'completed',
      transactionReference: transactionReference || `PAY-REST-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      processedAt: new Date()
    });

    await recordAudit({
      admin: req.user,
      action: 'process_restaurant_payout',
      targetType: 'Payout',
      targetId: payout._id,
      targetName: `Payout to ${restaurant.name}`,
      reason: `Settled net payout of ₹${(netPayable / 100).toFixed(2)}`,
      details: {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        netPayable,
        transactionReference: payout.transactionReference
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant payout processed successfully.',
      data: payout
    });
  } catch (err) {
    console.error('Error processing restaurant payout:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process restaurant payout.'
    });
  }
};

// @desc    Process a rider payout
// @route   POST /api/v1/admin/finance/payouts/rider
// @access  Private (Admin - Finance/Super)
const processRiderPayout = async (req, res) => {
  try {
    const { riderId, amount, totalDeliveries, payoutMethod = 'bank_transfer', transactionReference } = req.body;

    const riderUser = await User.findById(riderId);
    if (!riderUser || riderUser.role !== 'rider') {
      return res.status(404).json({
        success: false,
        message: 'Rider not found.'
      });
    }

    const payout = await RiderPayout.create({
      rider: riderUser._id,
      amount: parseInt(amount),
      totalDeliveries: totalDeliveries || 0,
      payoutMethod,
      transactionReference: transactionReference || `PAY-RDR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'completed',
      processedAt: new Date()
    });

    await recordAudit({
      admin: req.user,
      action: 'process_rider_payout',
      targetType: 'Payout',
      targetId: payout._id,
      targetName: `Payout to Rider ${riderUser.name}`,
      reason: `Settled rider earnings payout of ₹${(amount / 100).toFixed(2)}`,
      details: {
        riderId: riderUser._id,
        riderName: riderUser.name,
        amount,
        transactionReference: payout.transactionReference
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Rider payout processed successfully.',
      data: payout
    });
  } catch (err) {
    console.error('Error processing rider payout:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process rider payout.'
    });
  }
};

module.exports = {
  getFinanceSummary,
  getPayments,
  getCommissions,
  getRefunds,
  createRefund,
  processRefund,
  getPayouts,
  processRestaurantPayout,
  processRiderPayout
};
