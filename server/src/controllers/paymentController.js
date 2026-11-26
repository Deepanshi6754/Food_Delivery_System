const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

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
    const { orderId, amount, currency = 'INR', receipt } = req.body;

    if (!orderId || !Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid order ID and payment amount in paise are required.'
      });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.payment.method !== 'razorpay' || order.payment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This order is not awaiting Razorpay payment.' });
    }
    if (Number(amount) !== order.pricing.finalAmount) {
      return res.status(400).json({ success: false, message: 'Payment amount does not match the order total.' });
    }

    const options = {
      amount: order.pricing.finalAmount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    if (!keyId || !keySecret || !razorpayInstance) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay credentials are not configured on the server.'
      });
    }

    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.create(options);
    } catch (err) {
      console.error('Razorpay order creation failed:', err.error || err.message);
      return res.status(502).json({
        success: false,
        message: 'Razorpay order creation failed. Verify the configured Razorpay credentials and account.'
      });
    }

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

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

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Razorpay payment verification fields are required.'
      });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.payment.method !== 'razorpay' || order.payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order does not match the pending payment for this order.'
      });
    }

    if (!keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay payment verification is not configured on the server.'
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const expectedSignatureBuffer = Buffer.from(generatedSignature, 'hex');
    const receivedSignatureBuffer = Buffer.from(razorpay_signature, 'hex');

    if (
      expectedSignatureBuffer.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    order.payment.status = 'completed';
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.transactionId = razorpay_payment_id;
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        user: req.user._id,
        amount: order.pricing.finalAmount,
        currency: 'INR',
        method: 'razorpay',
        status: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.restaurant = undefined;
      cart.appliedCoupon = undefined;
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.taxes = 0;
      cart.discount = 0;
      cart.finalAmount = 0;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully!',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

