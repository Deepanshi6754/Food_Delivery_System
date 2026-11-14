const User = require('../models/User');
const Order = require('../models/Order');
const Address = require('../models/Address');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated customers list
// @route   GET /api/v1/admin/customers
// @access  Private (Admin - Operations/Super)
const getCustomers = async (req, res) => {
  try {
    const { search = '', status = 'all', page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { role: 'customer' };

    if (status === 'active') {
      query.isSuspended = { $ne: true };
    } else if (status === 'suspended') {
      query.isSuspended = true;
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { phone: reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, customers] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(take)
        .select('-password')
        .lean()
    ]);

    // Attach order summary for each customer
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$pricing.total', 0]
            }
          },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[String(s._id)] = s;
    });

    const enrichedCustomers = customers.map((c) => {
      const stats = statsMap[String(c._id)] || { orderCount: 0, totalSpent: 0, lastOrderDate: null };
      return {
        ...c,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        customers: enrichedCustomers,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers.'
    });
  }
};

// @desc    Get single customer details
// @route   GET /api/v1/admin/customers/:id
// @access  Private (Admin)
const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password').lean();
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    const [addresses, orders] = await Promise.all([
      Address.find({ user: customer._id }).lean(),
      Order.find({ user: customer._id })
        .populate('restaurant', 'name logo')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ]);

    const totalSpent = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        customer,
        addresses,
        orders,
        stats: {
          totalOrders: orders.length,
          deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
          cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
          totalSpent
        }
      }
    });
  } catch (err) {
    console.error('Error getting customer details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer details.'
    });
  }
};

// @desc    Toggle customer suspension
// @route   PATCH /api/v1/admin/customers/:id/suspend
// @access  Private (Admin - Operations/Super)
const toggleCustomerSuspension = async (req, res) => {
  try {
    const { isSuspended, reason = '' } = req.body;
    const customer = await User.findById(req.params.id);

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    const previousStatus = customer.isSuspended || false;
    customer.isSuspended = isSuspended !== undefined ? Boolean(isSuspended) : !previousStatus;
    customer.suspensionReason = customer.isSuspended ? reason || 'Violated terms of service' : '';
    await customer.save();

    await recordAudit({
      admin: req.user,
      action: customer.isSuspended ? 'suspend_customer' : 'reactivate_customer',
      targetType: 'Customer',
      targetId: customer._id,
      targetName: customer.name,
      reason: reason || (customer.isSuspended ? 'Account suspended by admin' : 'Account reactivated by admin'),
      details: {
        previousStatus,
        newStatus: customer.isSuspended,
        reason: customer.suspensionReason
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: customer.isSuspended ? 'Customer has been suspended.' : 'Customer has been reactivated.',
      data: {
        id: customer._id,
        isSuspended: customer.isSuspended,
        suspensionReason: customer.suspensionReason
      }
    });
  } catch (err) {
    console.error('Error toggling customer suspension:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update customer status.'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerDetails,
  toggleCustomerSuspension
};
