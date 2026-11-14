const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['customer', 'support'],
    default: 'customer'
  },
  senderName: String,
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['order_issue', 'delivery_delay', 'payment_issue', 'food_quality', 'other'],
      default: 'order_issue'
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

