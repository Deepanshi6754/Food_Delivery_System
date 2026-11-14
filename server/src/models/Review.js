const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: { type: String, required: true },
      avatar: { type: String }
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    foodRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true
    },
    photos: [String],
    isVerified: {
      type: Boolean,
      default: true
    },
    reply: {
      message: String,
      repliedAt: {
        type: Date,
        default: Date.now
      }
    },
    isReported: {
      type: Boolean,
      default: false
    },
    reportReason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['visible', 'hidden', 'flagged'],
      default: 'visible',
      index: true
    },
    moderationReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

