const SupportTicket = require('../models/SupportTicket');

// FAQ data
const FAQS = [
  {
    q: 'How do I track my food delivery in real-time?',
    a: 'Once your order is confirmed, go to "My Orders" and click "Track Order". You will see live 6-stage status updates from restaurant preparation to rider delivery.'
  },
  {
    q: 'What is the cancellation policy?',
    a: 'You can cancel your order for a 100% full refund at any time before the restaurant starts food preparation. Once food preparation begins, orders cannot be cancelled.'
  },
  {
    q: 'How do coupons and discounts work?',
    a: 'You can explore available promo codes on the Offers page or inside your cart. Click "Apply" to receive instant savings on orders meeting the minimum order amount.'
  },
  {
    q: 'What payment methods do you support?',
    a: 'FoodDelight supports Razorpay (Credit/Debit Cards, UPI, Netbanking, Wallets) and Cash on Delivery (COD) for ultimate customer convenience.'
  },
  {
    q: 'How does the 1-restaurant-per-cart rule work?',
    a: 'To guarantee food is delivered hot and fresh from one kitchen, each cart is dedicated to a single restaurant. You will be prompted to confirm if you choose items from another restaurant.'
  }
];

// @desc    Get FAQ items
// @route   GET /api/support/faqs
// @access  Public
exports.getFaqs = (req, res) => {
  res.status(200).json({
    success: true,
    data: FAQS
  });
};

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    const { orderId, subject, category, description, priority = 'medium' } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and description for your ticket.'
      });
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const ticket = await SupportTicket.create({
      ticketNumber,
      user: req.user._id,
      order: orderId || null,
      subject,
      category,
      description,
      priority,
      status: 'open',
      messages: [
        {
          sender: 'customer',
          senderName: req.user.name,
          message: description,
          timestamp: new Date()
        },
        {
          sender: 'support',
          senderName: 'FoodDelight Support Agent',
          message:
            'Hello! We have received your query. A senior customer support specialist will review your request and resolve it shortly.',
          timestamp: new Date()
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Ticket ID: ' + ticketNumber,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user support tickets
// @route   GET /api/support/tickets
// @access  Private
exports.getUserTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .populate('order', 'orderNumber finalAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add message to existing ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
exports.addTicketMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: 'customer',
      senderName: req.user.name,
      message: message.trim(),
      timestamp: new Date()
    });

    // Auto support response for testing
    setTimeout(async () => {
      try {
        const freshTicket = await SupportTicket.findById(ticket._id);
        if (freshTicket) {
          freshTicket.messages.push({
            sender: 'support',
            senderName: 'FoodDelight Support Agent',
            message: 'Thank you for the update. We are on it!',
            timestamp: new Date()
          });
          await freshTicket.save();
        }
      } catch (e) {}
    }, 1000);

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Message added to ticket',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

