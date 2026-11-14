const Order = require('../models/Order');
const { emitOrderUpdate, emitToRestaurant } = require('../config/socket');

// @desc    Get orders for owner's restaurant with filtering & pagination
// @route   GET /api/v1/owner/orders
// @access  Private (Owner + attachRestaurant)
const getOrders = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const {
      status, // placed, confirmed, preparing, ready_for_pickup, delivered, cancelled, active
      search,
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = req.query;

    const query = { 'restaurant.id': restaurantId };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.orderStatus = { $in: ['placed', 'confirmed', 'preparing', 'ready_for_pickup'] };
      } else {
        query.orderStatus = status;
      }
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.recipientName': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    if (sortBy === 'newest') sortOptions.createdAt = -1;
    if (sortBy === 'oldest') sortOptions.createdAt = 1;
    if (sortBy === 'amount_high') sortOptions['pricing.finalAmount'] = -1;
    if (sortBy === 'amount_low') sortOptions['pricing.finalAmount'] = 1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email phone avatar');

    // Counts by status for tabs
    const placedCount = await Order.countDocuments({ 'restaurant.id': restaurantId, orderStatus: 'placed' });
    const confirmedCount = await Order.countDocuments({ 'restaurant.id': restaurantId, orderStatus: 'confirmed' });
    const preparingCount = await Order.countDocuments({ 'restaurant.id': restaurantId, orderStatus: 'preparing' });
    const readyCount = await Order.countDocuments({ 'restaurant.id': restaurantId, orderStatus: 'ready_for_pickup' });
    const deliveredCount = await Order.countDocuments({ 'restaurant.id': restaurantId, orderStatus: 'delivered' });
    const cancelledCount = await Order.countDocuments({ 'restaurant.id': restaurantId, orderStatus: 'cancelled' });

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      counts: {
        all: total,
        placed: placedCount,
        confirmed: confirmedCount,
        preparing: preparingCount,
        ready_for_pickup: readyCount,
        delivered: deliveredCount,
        cancelled: cancelledCount
      },
      orders
    });
  } catch (err) {
    console.error('Get owner orders error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant orders.'
    });
  }
};

// @desc    Get single order details
// @route   GET /api/v1/owner/orders/:id
// @access  Private (Owner + attachRestaurant)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      'restaurant.id': req.restaurant._id
    }).populate('user', 'name email phone avatar');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to your restaurant.'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.'
    });
  }
};

// @desc    Accept order (placed -> confirmed)
// @route   PUT /api/v1/owner/orders/:id/accept
// @access  Private (Owner + attachRestaurant)
const acceptOrder = async (req, res) => {
  try {
    const { prepTimeMinutes, note } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      'restaurant.id': req.restaurant._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.orderStatus !== 'placed') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept an order with status "${order.orderStatus}". Order must be in "placed" status.`
      });
    }

    order.orderStatus = 'confirmed';
    if (prepTimeMinutes) {
      order.estimatedDeliveryTime = `${Number(prepTimeMinutes) + 15} mins`;
    }

    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: note || `Order accepted by restaurant kitchen. Prep time: ~${prepTimeMinutes || req.restaurant.preparationTime || 25} mins.`
    });

    await order.save();

    // Real-time broadcasts
    emitOrderUpdate(order);
    emitToRestaurant(req.restaurant._id.toString(), 'order_updated', order);

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} confirmed successfully.`,
      order
    });
  } catch (err) {
    console.error('Accept order error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept order.'
    });
  }
};

// @desc    Reject order (placed -> cancelled)
// @route   PUT /api/v1/owner/orders/:id/reject
// @access  Private (Owner + attachRestaurant)
const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid reason for rejecting this order.'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      'restaurant.id': req.restaurant._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.orderStatus !== 'placed') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject order in "${order.orderStatus}" state. Only freshly placed orders can be rejected.`
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Rejected by restaurant: ${reason}`
    });

    await order.save();

    emitOrderUpdate(order);
    emitToRestaurant(req.restaurant._id.toString(), 'order_updated', order);

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} rejected. Reason recorded.`,
      order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject order.'
    });
  }
};

// @desc    Start preparing order (confirmed -> preparing)
// @route   PUT /api/v1/owner/orders/:id/prepare
// @access  Private (Owner + attachRestaurant)
const startPreparation = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      'restaurant.id': req.restaurant._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.orderStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot start preparation. Order is currently "${order.orderStatus}". Must be "confirmed" first.`
      });
    }

    order.orderStatus = 'preparing';
    order.statusHistory.push({
      status: 'preparing',
      timestamp: new Date(),
      note: 'Kitchen team has started preparing the food fresh.'
    });

    await order.save();

    emitOrderUpdate(order);
    emitToRestaurant(req.restaurant._id.toString(), 'order_updated', order);

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} is now marked as Preparing.`,
      order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status to preparing.'
    });
  }
};

// @desc    Mark order ready for pickup (preparing -> ready_for_pickup)
// @route   PUT /api/v1/owner/orders/:id/ready
// @access  Private (Owner + attachRestaurant)
const markReadyForPickup = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      'restaurant.id': req.restaurant._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.orderStatus !== 'preparing') {
      return res.status(400).json({
        success: false,
        message: `Order must be in "preparing" status before marking ready for pickup.`
      });
    }

    order.orderStatus = 'ready_for_pickup';
    order.statusHistory.push({
      status: 'ready_for_pickup',
      timestamp: new Date(),
      note: 'Food is prepared, packed hot, and waiting at restaurant pickup counter.'
    });

    await order.save();

    emitOrderUpdate(order);
    emitToRestaurant(req.restaurant._id.toString(), 'order_updated', order);

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} is now ready for pickup. Delivery rider notified.`,
      order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark order ready for pickup.'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  startPreparation,
  markReadyForPickup
};

