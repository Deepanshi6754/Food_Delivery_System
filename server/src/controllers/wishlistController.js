const Wishlist = require('../models/Wishlist');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('restaurants', 'name slug image rating deliveryTime deliveryFee cuisine isPureVeg isOpen priceForTwo')
      .populate({
        path: 'menuItems',
        populate: { path: 'restaurant', select: 'name slug isOpen' }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        restaurants: [],
        menuItems: []
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle restaurant in wishlist
// @route   POST /api/wishlist/restaurants/:restaurantId
// @access  Private
exports.toggleRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, restaurants: [], menuItems: [] });
    }

    const index = wishlist.restaurants.findIndex((id) => id.toString() === restaurantId);
    let isAdded = false;

    if (index > -1) {
      wishlist.restaurants.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.restaurants.push(restaurantId);
      isAdded = true;
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      isAdded,
      message: isAdded
        ? 'Restaurant added to your favourites!'
        : 'Restaurant removed from favourites'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle menu item in wishlist
// @route   POST /api/wishlist/menu-items/:itemId
// @access  Private
exports.toggleMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, restaurants: [], menuItems: [] });
    }

    const index = wishlist.menuItems.findIndex((id) => id.toString() === itemId);
    let isAdded = false;

    if (index > -1) {
      wishlist.menuItems.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.menuItems.push(itemId);
      isAdded = true;
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      isAdded,
      message: isAdded
        ? 'Dish added to your favourites!'
        : 'Dish removed from favourites'
    });
  } catch (err) {
    next(err);
  }
};

