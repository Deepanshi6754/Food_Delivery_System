const Order = require('../models/Order');
const Payout = require('../models/Payout');

// @desc    Get financial earnings summary & payout records
// @route   GET /api/v1/owner/earnings/summary
// @access  Private (Owner + attachRestaurant)
const getEarningsSummary = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const commissionRate = (req.restaurant.platformCommission || 15) / 100;

    // Get all valid non-cancelled orders
    const orders = await Order.find({
      'restaurant.id': restaurantId,
      orderStatus: { $ne: 'cancelled' }
    });

    const totalOrdersCount = orders.length;
    const grossRevenue = orders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);
    const platformCommission = Math.round(grossRevenue * commissionRate);
    const totalTaxes = orders.reduce((sum, o) => sum + (o.pricing?.taxes || 0), 0);
    const totalDiscounts = orders.reduce((sum, o) => sum + (o.pricing?.discount || 0), 0);
    const netEarnings = grossRevenue - platformCommission;

    // Payout records
    const payouts = await Payout.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

    const totalPaidOut = payouts
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.netPayable, 0);

    const pendingPayout = payouts
      .filter((p) => p.status === 'processing' || p.status === 'pending')
      .reduce((sum, p) => sum + p.netPayable, 0);

    // Monthly breakdown for bar chart
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = start.toLocaleDateString('en-US', { month: 'short' });

      const mOrders = orders.filter((o) => new Date(o.createdAt) >= start && new Date(o.createdAt) < end);
      const mGross = mOrders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);
      const mComm = Math.round(mGross * commissionRate);
      const mNet = mGross - mComm;

      monthlyData.push({
        month: monthLabel,
        gross: Math.round(mGross / 100),
        commission: Math.round(mComm / 100),
        net: Math.round(mNet / 100),
        orders: mOrders.length
      });
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalOrdersCount,
        grossRevenue, // in paise
        platformCommission,
        commissionPercentage: req.restaurant.platformCommission || 15,
        totalTaxes,
        totalDiscounts,
        netEarnings,
        totalPaidOut,
        pendingPayout,
        averageOrderValue: totalOrdersCount > 0 ? Math.round(grossRevenue / totalOrdersCount) : 0
      },
      payouts,
      monthlyBreakdown: monthlyData
    });
  } catch (err) {
    console.error('Get earnings summary error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve earnings summary.'
    });
  }
};

// @desc    Export earnings & orders data as CSV
// @route   GET /api/v1/owner/earnings/export
// @access  Private (Owner + attachRestaurant)
const exportEarningsCsv = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const orders = await Order.find({
      'restaurant.id': restaurantId
    }).sort({ createdAt: -1 });

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Items',
      'Status',
      'Payment Method',
      'Subtotal (INR)',
      'Delivery Fee (INR)',
      'Taxes (INR)',
      'Discount (INR)',
      'Total (INR)',
      'Commission (15%) (INR)',
      'Net Payable (INR)'
    ];

    const rows = orders.map((o) => {
      const subtotal = (o.pricing?.subtotal || 0) / 100;
      const delivery = (o.pricing?.deliveryFee || 0) / 100;
      const taxes = (o.pricing?.taxes || 0) / 100;
      const discount = (o.pricing?.discount || 0) / 100;
      const total = (o.pricing?.finalAmount || 0) / 100;
      const commission = (total * 0.15).toFixed(2);
      const net = (total - commission).toFixed(2);
      const itemsStr = (o.items || []).map((i) => `${i.name} (x${i.quantity})`).join('; ');

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toISOString().split('T')[0]}"`,
        `"${o.deliveryAddress?.recipientName || 'Customer'}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        `"${o.orderStatus}"`,
        `"${o.payment?.method || 'cod'}"`,
        subtotal.toFixed(2),
        delivery.toFixed(2),
        taxes.toFixed(2),
        discount.toFixed(2),
        total.toFixed(2),
        commission,
        net
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=FoodDelight-Earnings-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate earnings CSV export.'
    });
  }
};

module.exports = {
  getEarningsSummary,
  exportEarningsCsv
};

