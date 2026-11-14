const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
      }
    ],
    menuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);

