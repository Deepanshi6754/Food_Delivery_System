const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');
const { emitOrderUpdate, emitUserNotification } = require('../config/socket');

// Generate Unique Order Number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FD-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod = 'cod', specialInstructions } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('restaurant')
      .populate('items.menuItem');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.'
      });
    }

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a delivery address.'
      });
    }

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Delivery address not found.'
      });
    }

    const orderNumber = generateOrderNumber();

    // Snapshot items
    const orderItems = cart.items.map((item) => ({
      menuItemId: item.menuItem ? item.menuItem._id : null,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      addOns: item.addOns,
      specialInstructions: item.specialInstructions,
      itemTotal: item.itemTotal
    }));

    // Create Order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      restaurant: {
        id: cart.restaurant._id,
        name: cart.restaurant.name,
        image: cart.restaurant.image,
        phone: '+91 11 2345 6789',
        address: cart.restaurant.address
      },
      items: orderItems,
      deliveryAddress: {
        label: address.label,
        recipientName: address.recipientName,
        phone: address.phone,
        houseNo: address.houseNo,
        street: address.street,
        area: address.area,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        deliveryInstructions: address.deliveryInstructions
      },
      pricing: {
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        taxes: cart.taxes,
        discount: cart.discount,
        finalAmount: cart.finalAmount
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'completed',
        transactionId: `TXN-${Date.now()}`
      },
      orderStatus: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order successfully placed by customer.'
        }
      ],
      estimatedDeliveryTime: cart.restaurant.deliveryTime || '30-40 mins',
      specialInstructions: specialInstructions || '',
      couponApplied: cart.appliedCoupon ? cart.appliedCoupon.code : null
    });

    // Clear user cart
    cart.items = [];
    cart.restaurant = undefined;
    cart.appliedCoupon = undefined;
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.taxes = 0;
    cart.discount = 0;
    cart.finalAmount = 0;
    await cart.save();

    // Create In-App Notification
    const notif = await Notification.create({
      user: req.user._id,
      title: 'Order Confirmed! 🍕',
      message: `Your order #${order.orderNumber} from ${order.restaurant.name} has been placed successfully.`,
      type: 'order',
      link: `/orders/${order._id}/track`
    });

    // Emit live socket events
    emitOrderUpdate(order);
    emitUserNotification(req.user._id, notif);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders of current user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status === 'active') {
      query.orderStatus = {
        $in: ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery']
      };
    } else if (status === 'delivered') {
      query.orderStatus = 'delivered';
    } else if (status === 'cancelled') {
      query.orderStatus = 'cancelled';
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Cancellation eligibility check: only if placed or confirmed
    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order once food preparation has started or rider is on the way.'
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason
    });

    if (order.payment.status === 'completed') {
      order.payment.status = 'refunded';
    }

    await order.save();

    // Create Notification
    const notif = await Notification.create({
      user: req.user._id,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} was cancelled. Any refund has been initiated.`,
      type: 'order',
      link: `/my-orders`
    });

    emitOrderUpdate(order);
    emitUserNotification(req.user._id, notif);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder previous order items
// @route   POST /api/orders/:id/reorder
// @access  Private
exports.reorder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify current restaurant and menu items availability
    const restaurant = await Restaurant.findById(order.restaurant.id);
    if (!restaurant || !restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'This restaurant is currently closed or unavailable.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    cart.items = [];
    cart.restaurant = restaurant._id;
    cart.appliedCoupon = undefined;

    let totalSubtotal = 0;
    for (const item of order.items) {
      if (item.menuItemId) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (menuItem && menuItem.available) {
          const unitPrice = item.price;
          const itemTotal = unitPrice * item.quantity;
          totalSubtotal += itemTotal;

          cart.items.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            image: menuItem.image,
            isVeg: menuItem.isVeg,
            basePrice: menuItem.price,
            price: unitPrice,
            quantity: item.quantity,
            size: item.size,
            addOns: item.addOns,
            specialInstructions: item.specialInstructions || '',
            itemTotal
          });
        }
      }
    }

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'None of the items from this order are currently available.'
      });
    }

    cart.subtotal = totalSubtotal;
    cart.deliveryFee = totalSubtotal >= 50000 ? 0 : restaurant.deliveryFee || 3900;
    cart.taxes = Math.round(totalSubtotal * 0.05);
    cart.discount = 0;
    cart.finalAmount = cart.subtotal + cart.deliveryFee + cart.taxes;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Items added to cart from your previous order!',
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate advancing order status (for live tracking demo)
// @route   POST /api/orders/:id/simulate-status
// @access  Private
exports.simulateStatusUpdate = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const flow = [
      'placed',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered'
    ];

    const currentIndex = flow.indexOf(order.orderStatus);
    if (currentIndex === -1 || currentIndex >= flow.length - 1) {
      return res.status(400).json({
        success: false,
        message: `Order status is already "${order.orderStatus}" and cannot be advanced further.`
      });
    }

    const nextStatus = flow[currentIndex + 1];
    order.orderStatus = nextStatus;

    const notes = {
      confirmed: 'Restaurant accepted and confirmed your order.',
      preparing: 'Chef is now preparing your delicious food with care.',
      ready_for_pickup: 'Food is packed hot and ready for rider pickup.',
      out_for_delivery: 'Delivery partner has picked up your order and is on the way!',
      delivered: 'Order delivered successfully. Enjoy your meal!'
    };

    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note: notes[nextStatus]
    });

    if (nextStatus === 'delivered' && order.payment.status === 'pending') {
      order.payment.status = 'completed';
    }

    await order.save();

    // Create Notification
    const notif = await Notification.create({
      user: req.user._id,
      title: `Order Update: ${nextStatus.replace(/_/g, ' ').toUpperCase()}`,
      message: notes[nextStatus],
      type: 'order',
      link: `/orders/${order._id}/track`
    });

    emitOrderUpdate(order);
    emitUserNotification(req.user._id, notif);

    res.status(200).json({
      success: true,
      message: `Order status simulated to ${nextStatus}`,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

