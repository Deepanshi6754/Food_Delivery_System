const Order = require('../models/Order');
const User = require('../models/User');
const RiderProfile = require('../models/RiderProfile');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated platform orders with comprehensive filters
// @route   GET /api/v1/admin/orders
// @access  Private (Admin - Operations/Finance/Super)
const getOrders = async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      paymentStatus = 'all',
      paymentMethod = 'all',
      startDate,
      endDate,
      restaurantId,
      riderId,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (paymentStatus !== 'all') {
      query['payment.status'] = paymentStatus;
    }

    if (paymentMethod !== 'all') {
      query['payment.method'] = paymentMethod;
    }

    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    if (riderId) {
      query.rider = riderId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ orderNumber: reg }, { 'deliveryAddress.recipientName': reg }, { 'deliveryAddress.phone': reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('user', 'name email phone avatar')
        .populate('restaurant', 'name logo address')
        .populate('rider', 'name phone avatar')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.'
    });
  }
};

// @desc    Get complete order details
// @route   GET /api/v1/admin/orders/:id
// @access  Private (Admin)
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('restaurant', 'name logo address contact rating')
      .populate('rider', 'name phone avatar')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    let riderProfile = null;
    if (order.rider) {
      riderProfile = await RiderProfile.findOne({ user: order.rider._id }).lean();
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
        riderProfile
      }
    });
  } catch (err) {
    console.error('Error getting order details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.'
    });
  }
};

// @desc    Admin manual override order status
// @route   PATCH /api/v1/admin/orders/:id/override-status
// @access  Private (Admin - Operations/Super)
const overrideOrderStatus = async (req, res) => {
  try {
    const { status, reason, note = '' } = req.body;

    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory reason is required for administrative status override.'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const prevStatus = order.status;
    order.status = status;

    if (order.statusHistory) {
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: `Admin override by ${req.user.name}: ${reason} ${note ? `(${note})` : ''}`
      });
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancellationReason = `Admin override: ${reason}`;
    }

    await order.save();

    await recordAudit({
      admin: req.user,
      action: 'override_order_status',
      targetType: 'Order',
      targetId: order._id,
      targetName: `Order #${order.orderNumber}`,
      reason,
      details: {
        orderNumber: order.orderNumber,
        previousStatus: prevStatus,
        newStatus: status,
        note
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} status updated to '${status}'.`,
      data: order
    });
  } catch (err) {
    console.error('Error overriding order status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to override order status.'
    });
  }
};

// @desc    Manually assign or reassign rider to an order
// @route   PATCH /api/v1/admin/orders/:id/assign-rider
// @access  Private (Admin - Operations/Super)
const assignRider = async (req, res) => {
  try {
    const { riderId, reason = '' } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const riderUser = await User.findById(riderId);
    if (!riderUser || riderUser.role !== 'rider') {
      return res.status(404).json({
        success: false,
        message: 'Rider not found.'
      });
    }

    const prevRider = order.rider;
    order.rider = riderUser._id;
    await order.save();

    // Create or update delivery assignment
    await DeliveryAssignment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        rider: riderUser._id,
        status: 'assigned',
        assignedAt: new Date()
      },
      { upsert: true, new: true }
    );

    await recordAudit({
      admin: req.user,
      action: 'admin_assign_rider',
      targetType: 'Order',
      targetId: order._id,
      targetName: `Order #${order.orderNumber}`,
      reason: reason || `Assigned to rider ${riderUser.name}`,
      details: {
        orderNumber: order.orderNumber,
        previousRider: prevRider,
        newRider: riderUser._id,
        riderName: riderUser.name
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Rider ${riderUser.name} assigned to Order #${order.orderNumber}.`,
      data: order
    });
  } catch (err) {
    console.error('Error assigning rider:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign rider.'
    });
  }
};

module.exports = {
  getOrders,
  getOrderDetails,
  overrideOrderStatus,
  assignRider
};
