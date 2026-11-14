const Order = require('../models/Order');
const RiderProfile = require('../models/RiderProfile');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const RiderEarning = require('../models/RiderEarning');
const { emitOrderUpdate, emitToRestaurant, emitToRider } = require('../config/socket');

// @desc    Get new incoming delivery requests for rider
// @route   GET /api/v1/rider/deliveries/requests
// @access  Private (Rider + attachRiderProfile)
const getAvailableRequests = async (req, res) => {
  try {
    const riderId = req.user._id;
    const profile = req.riderProfile;

    if (!profile.isOnline) {
      return res.status(200).json({
        success: true,
        isOnline: false,
        message: 'You are currently offline. Go online to receive delivery requests.',
        requests: []
      });
    }

    if (profile.activeDelivery) {
      return res.status(200).json({
        success: true,
        hasActiveDelivery: true,
        message: 'You have an active delivery in progress.',
        requests: []
      });
    }

    // 1. Check direct assignments for this rider
    let assignments = await DeliveryAssignment.find({
      rider: riderId,
      status: 'assigned',
      expiresAt: { $gt: new Date() }
    }).populate({
      path: 'order',
      select: 'orderNumber restaurant deliveryAddress pricing payment createdAt specialInstructions items'
    });

    // 2. If no direct assignments, look for ready orders without an assigned rider
    if (assignments.length === 0) {
      const unassignedOrder = await Order.findOne({
        orderStatus: { $in: ['ready_for_pickup', 'confirmed'] },
        $or: [
          { 'rider.id': { $exists: false } },
          { 'rider.id': null }
        ]
      }).sort({ createdAt: -1 });

      if (unassignedOrder) {
        // Create an assignment candidate for this online rider
        const newAssignment = await DeliveryAssignment.create({
          order: unassignedOrder._id,
          rider: riderId,
          status: 'assigned',
          deliveryDistanceKm: 3.2,
          estimatedMinutes: 20,
          deliveryFee: 6500, // ₹65
          customerOtp: unassignedOrder.deliveryOtp || '4589',
          expiresAt: new Date(Date.now() + 60 * 1000)
        });

        assignments = [await newAssignment.populate('order')];
      }
    }

    const formattedRequests = assignments
      .filter((a) => a.order)
      .map((a) => ({
        assignmentId: a._id,
        orderId: a.order._id,
        orderNumber: a.order.orderNumber,
        restaurantName: a.order.restaurant?.name || 'Partner Kitchen',
        restaurantAddress: a.order.restaurant?.address
          ? `${a.order.restaurant.address.street || ''}, ${a.order.restaurant.address.area || ''}`
          : 'Central Food Hub',
        customerArea: a.order.deliveryAddress?.area || 'Delivery Destination',
        customerCity: a.order.deliveryAddress?.city || 'Delhi',
        distanceKm: a.deliveryDistanceKm,
        estimatedMinutes: a.estimatedMinutes,
        earningsPaise: a.deliveryFee, // e.g. 6500 = ₹65
        itemCount: a.order.items?.length || 1,
        orderAmount: a.order.pricing?.finalAmount || 0,
        paymentMethod: a.order.payment?.method || 'cod',
        expiresInSeconds: Math.max(0, Math.round((new Date(a.expiresAt) - new Date()) / 1000))
      }));

    return res.status(200).json({
      success: true,
      data: formattedRequests,
      requests: formattedRequests
    });
  } catch (err) {
    console.error('Get delivery requests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery requests.'
    });
  }
};

// @desc    Accept a delivery request
// @route   POST /api/v1/rider/deliveries/:assignmentId/accept
// @access  Private (Rider + attachRiderProfile)
const acceptDelivery = async (req, res) => {
  try {
    const riderId = req.user._id;
    const profile = req.riderProfile;
    const { assignmentId } = req.params;

    if (profile.activeDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept request. You already have an active delivery in progress.'
      });
    }

    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      rider: riderId,
      status: 'assigned'
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request expired or already reassigned to another partner.'
      });
    }

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found.'
      });
    }

    // Atomic update
    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();
    await assignment.save();

    // Assign rider on Order
    order.rider = {
      id: riderId,
      name: req.user.name,
      phone: req.user.phone,
      vehicleNumber: profile.vehicleNumber,
      vehicleType: profile.vehicleType,
      avatar: req.user.avatar,
      stage: 'accepted',
      location: profile.currentLocation || { lat: 28.6139, lng: 77.2090 }
    };
    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Delivery partner ${req.user.name} assigned and en route to restaurant.`
    });
    await order.save();

    // Set active delivery on rider profile
    profile.activeDelivery = order._id;
    profile.isAvailable = false;
    await profile.save();

    // Broadcasts
    emitOrderUpdate(order);
    emitToRestaurant(order.restaurant?.id?.toString(), 'order_updated', order);
    emitToRider(riderId.toString(), 'delivery_accepted', { orderId: order._id });

    return res.status(200).json({
      success: true,
      message: `Delivery for Order #${order.orderNumber} accepted! Navigate to kitchen for pickup.`,
      data: order,
      order
    });
  } catch (err) {
    console.error('Accept delivery error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept delivery.'
    });
  }
};

// @desc    Reject a delivery request
// @route   POST /api/v1/rider/deliveries/:assignmentId/reject
// @access  Private (Rider + attachRiderProfile)
const rejectDelivery = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      rider: req.user._id,
      status: 'assigned'
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request not found.'
      });
    }

    assignment.status = 'rejected';
    assignment.rejectedAt = new Date();
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery request rejected.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject request.'
    });
  }
};

// @desc    Get currently active delivery details
// @route   GET /api/v1/rider/deliveries/active
// @access  Private (Rider + attachRiderProfile)
const getActiveDelivery = async (req, res) => {
  try {
    const riderId = req.user._id;

    const assignment = await DeliveryAssignment.findOne({
      rider: riderId,
      status: {
        $in: [
          'accepted',
          'reached_restaurant',
          'picked_up',
          'reached_customer'
        ]
      }
    }).populate('order');

    if (!assignment || !assignment.order) {
      return res.status(200).json({
        success: true,
        hasActive: false,
        data: null,
        order: null
      });
    }

    const order = assignment.order;
    const activeOrderData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      stage: assignment.status,
      rider: { stage: assignment.status },
      restaurant: order.restaurant,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      pricing: order.pricing,
      payment: order.payment,
      deliveryOtp: order.deliveryOtp,
      deliveryFee: assignment.deliveryFee,
      deliveryDistanceKm: assignment.deliveryDistanceKm,
      specialInstructions: order.deliveryAddress?.deliveryInstructions || ''
    };

    return res.status(200).json({
      success: true,
      hasActive: true,
      data: activeOrderData,
      assignmentId: assignment._id,
      stage: assignment.status,
      order: activeOrderData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active delivery.'
    });
  }
};

// @desc    Progress active delivery stage
// @route   PUT /api/v1/rider/deliveries/active/stage
// @access  Private (Rider + attachRiderProfile)
const updateDeliveryStage = async (req, res) => {
  try {
    const riderId = req.user._id;
    const profile = req.riderProfile;
    const { stage, otp } = req.body;

    const assignment = await DeliveryAssignment.findOne({
      rider: riderId,
      status: {
        $in: [
          'accepted',
          'reached_restaurant',
          'picked_up',
          'reached_customer'
        ]
      }
    }).populate('order');

    if (!assignment || !assignment.order) {
      return res.status(404).json({
        success: false,
        message: 'No active delivery found.'
      });
    }

    const order = assignment.order;

    // Transition 1: Reached Restaurant
    if (stage === 'reached_restaurant') {
      assignment.status = 'reached_restaurant';
      assignment.reachedRestaurantAt = new Date();
      order.rider.stage = 'reached_restaurant';
      order.statusHistory.push({
        status: order.orderStatus,
        timestamp: new Date(),
        note: 'Rider reached restaurant kitchen pickup counter.'
      });
      await assignment.save();
      await order.save();
      emitOrderUpdate(order);
    }
    // Transition 2: Picked Up (order moves to out_for_delivery)
    else if (stage === 'picked_up') {
      assignment.status = 'picked_up';
      assignment.pickedUpAt = new Date();
      order.orderStatus = 'out_for_delivery';
      order.rider.stage = 'picked_up';
      order.statusHistory.push({
        status: 'out_for_delivery',
        timestamp: new Date(),
        note: 'Order picked up and is out for delivery with partner.'
      });
      await assignment.save();
      await order.save();
      emitOrderUpdate(order);
    }
    // Transition 3: Reached Customer Doorstep
    else if (stage === 'reached_customer') {
      assignment.status = 'reached_customer';
      assignment.reachedCustomerAt = new Date();
      order.rider.stage = 'reached_customer';
      order.statusHistory.push({
        status: 'out_for_delivery',
        timestamp: new Date(),
        note: 'Rider reached customer delivery address.'
      });
      await assignment.save();
      await order.save();
      emitOrderUpdate(order);
    }
    // Transition 4: Complete Delivery (Verify Customer OTP)
    else if (stage === 'delivered') {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'Customer 4-digit verification OTP is required to confirm delivery.'
        });
      }

      // Validate OTP
      const expectedOtp = order.deliveryOtp || assignment.customerOtp || '4589';
      if (otp.toString().trim() !== expectedOtp.toString().trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP entered. Please ask customer for the correct 4-digit delivery PIN.'
        });
      }

      assignment.status = 'delivered';
      assignment.deliveredAt = new Date();
      assignment.proofOfDelivery = {
        otpVerified: true,
        notes: 'Verified successfully with customer OTP.'
      };
      await assignment.save();

      // Update Order Status to delivered
      order.orderStatus = 'delivered';
      order.rider.stage = 'delivered';
      if (order.payment?.method === 'cod') {
        order.payment.status = 'completed';
      }
      order.statusHistory.push({
        status: 'delivered',
        timestamp: new Date(),
        note: 'Delivered securely to customer with OTP verification.'
      });
      await order.save();

      // Credit Rider Earning
      const totalPayable = assignment.deliveryFee || 6500;
      await RiderEarning.create({
        rider: riderId,
        order: order._id,
        deliveryAssignment: assignment._id,
        baseFee: 4000, // ₹40
        distanceFee: 1500, // ₹15
        incentives: 1000, // ₹10
        totalAmount: totalPayable,
        status: 'credited'
      });

      // Free Rider Profile for next orders
      profile.activeDelivery = null;
      profile.isAvailable = true;
      profile.completedDeliveries = (profile.completedDeliveries || 0) + 1;
      profile.totalDeliveries = (profile.totalDeliveries || 0) + 1;
      await profile.save();

      emitOrderUpdate(order);
      emitToRider(riderId.toString(), 'delivery_completed', {
        orderId: order._id,
        earningsPaise: totalPayable
      });

      return res.status(200).json({
        success: true,
        message: `Order #${order.orderNumber} successfully delivered! ₹${(totalPayable / 100).toFixed(0)} credited to earnings.`,
        data: order,
        order,
        earningsPaise: totalPayable
      });
    }

    return res.status(200).json({
      success: true,
      message: `Stage updated to ${stage.replace(/_/g, ' ')}.`,
      data: order,
      stage: assignment.status,
      order
    });
  } catch (err) {
    console.error('Update delivery stage error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update delivery progress.'
    });
  }
};

module.exports = {
  getAvailableRequests,
  acceptDelivery,
  rejectDelivery,
  getActiveDelivery,
  updateDeliveryStage
};

