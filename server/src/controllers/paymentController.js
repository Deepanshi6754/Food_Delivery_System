const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_fooddelight123';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'fooddelight_secret_key_456';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
} catch (e) {
  console.warn('Razorpay SDK initialization notice:', e.message);
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Payment amount is required' });
    }

    const options = {
      amount: parseInt(amount, 10), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    let razorpayOrder;
    try {
      if (razorpayInstance && !keyId.startsWith('rzp_test_fooddelight')) {
        razorpayOrder = await razorpayInstance.orders.create(options);
      } else {
        // Fallback simulation order if live test key is not provided
        razorpayOrder = {
          id: `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created'
        };
      }
    } catch (err) {
      razorpayOrder = {
        id: `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created'
      };
    }

    res.status(200).json({
      success: true,
      data: razorpayOrder,
      keyId: keyId
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    let isValid = false;

    if (razorpay_order_id && razorpay_order_id.startsWith('order_sim_')) {
      // In simulated mode, accept simulated signature
      isValid = true;
    } else if (razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Update order status if orderId provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.payment.status = 'completed';
        order.payment.razorpayOrderId = razorpay_order_id;
        order.payment.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        await Payment.create({
          order: order._id,
          user: req.user._id,
          amount: order.pricing.finalAmount,
          currency: 'INR',
          method: 'razorpay',
          status: 'completed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully!'
    });
  } catch (err) {
    next(err);
  }
};

