const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');

// Helper to calculate cart totals
const recalculateCart = (cart, restaurant) => {
  let subtotal = 0;
  cart.items.forEach((item) => {
    subtotal += item.itemTotal;
  });

  cart.subtotal = subtotal;

  // Delivery fee: ₹39 standard or restaurant specific; FREE if subtotal >= ₹500 (50000 paise)
  const baseDelivery = restaurant && restaurant.deliveryFee !== undefined ? restaurant.deliveryFee : 3900;
  cart.deliveryFee = subtotal >= 50000 || subtotal === 0 ? 0 : baseDelivery;

  // Taxes: 5% GST on food subtotal
  cart.taxes = Math.round(subtotal * 0.05);

  // Discount calculation
  let discount = 0;
  if (cart.appliedCoupon && cart.appliedCoupon.code) {
    if (cart.appliedCoupon.flatDiscount > 0) {
      discount = cart.appliedCoupon.flatDiscount;
    } else if (cart.appliedCoupon.discountPercentage > 0) {
      const percentageDiscount = Math.round(
        (subtotal * cart.appliedCoupon.discountPercentage) / 100
      );
      discount =
        cart.appliedCoupon.maxDiscount > 0
          ? Math.min(percentageDiscount, cart.appliedCoupon.maxDiscount)
          : percentageDiscount;
    }
    cart.appliedCoupon.discountAmount = discount;
  } else {
    cart.appliedCoupon = undefined;
  }

  cart.discount = discount;
  cart.finalAmount = Math.max(0, subtotal + cart.deliveryFee + cart.taxes - discount);
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee minOrderValue isOpen')
      .populate('items.menuItem', 'name image price isVeg available');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        taxes: 0,
        discount: 0,
        finalAmount: 0
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const {
      menuItemId,
      quantity = 1,
      size,
      addOns = [],
      specialInstructions = '',
      clearPrevious = false
    } = req.body;

    const menuItem = await MenuItem.findById(menuItemId).populate('restaurant');
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (!menuItem.available) {
      return res.status(400).json({
        success: false,
        message: 'This item is currently out of stock.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if cart has items from another restaurant
    if (
      cart.restaurant &&
      cart.restaurant.toString() !== menuItem.restaurant._id.toString() &&
      cart.items.length > 0
    ) {
      if (!clearPrevious) {
        return res.status(409).json({
          success: false,
          conflict: true,
          currentRestaurantId: cart.restaurant,
          newRestaurantId: menuItem.restaurant._id,
          message:
            'Your cart contains items from a different restaurant. Would you like to clear your cart and add this item instead?'
        });
      } else {
        cart.items = [];
        cart.appliedCoupon = undefined;
      }
    }

    cart.restaurant = menuItem.restaurant._id;

    // Price calculation with selected size and add-ons
    let unitPrice = menuItem.price;
    if (size && size.priceDelta) {
      unitPrice += size.priceDelta;
    }

    let addOnsTotal = 0;
    if (Array.isArray(addOns)) {
      addOns.forEach((addon) => {
        addOnsTotal += addon.price || 0;
      });
    }

    const calculatedUnitPrice = unitPrice + addOnsTotal;
    const itemTotal = calculatedUnitPrice * quantity;

    // Check if identical item with same size and addons already exists
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.menuItem.toString() === menuItemId &&
        (item.size?.name || '') === (size?.name || '') &&
        JSON.stringify(item.addOns.map((a) => a.name).sort()) ===
          JSON.stringify(addOns.map((a) => a.name).sort())
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].itemTotal =
        cart.items[existingIndex].quantity * calculatedUnitPrice;
      if (specialInstructions) {
        cart.items[existingIndex].specialInstructions = specialInstructions;
      }
    } else {
      cart.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        image: menuItem.image,
        isVeg: menuItem.isVeg,
        basePrice: menuItem.price,
        price: calculatedUnitPrice,
        quantity,
        size: size ? { name: size.name, priceDelta: size.priceDelta || 0 } : undefined,
        addOns: addOns.map((a) => ({ name: a.name, price: a.price })),
        specialInstructions,
        itemTotal
      });
    }

    recalculateCart(cart, menuItem.restaurant);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee minOrderValue isOpen')
      .populate('items.menuItem', 'name image price isVeg available');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: populatedCart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('restaurant');
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].itemTotal = quantity * cart.items[itemIndex].price;
    }

    if (cart.items.length === 0) {
      cart.restaurant = undefined;
      cart.appliedCoupon = undefined;
    }

    recalculateCart(cart, cart.restaurant);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee minOrderValue isOpen')
      .populate('items.menuItem', 'name image price isVeg available');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: populatedCart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id }).populate('restaurant');

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    if (cart.items.length === 0) {
      cart.restaurant = undefined;
      cart.appliedCoupon = undefined;
    }

    recalculateCart(cart, cart.restaurant);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee minOrderValue isOpen')
      .populate('items.menuItem', 'name image price isVeg available');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: populatedCart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
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
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('restaurant');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon code.'
      });
    }

    if (cart.subtotal < coupon.minOrderValue) {
      const minRs = Math.round(coupon.minOrderValue / 100);
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of ₹${minRs}.`
      });
    }

    // Check restaurant specific
    if (
      coupon.restaurantSpecific &&
      coupon.restaurantSpecific.length > 0 &&
      !coupon.restaurantSpecific.includes(cart.restaurant._id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not valid for this restaurant.'
      });
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount,
      flatDiscount: coupon.flatDiscount
    };

    recalculateCart(cart, cart.restaurant);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee minOrderValue isOpen')
      .populate('items.menuItem', 'name image price isVeg available');

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${Math.round(cart.discount / 100)}.`,
      data: populatedCart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('restaurant');
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.appliedCoupon = undefined;
    recalculateCart(cart, cart.restaurant);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee minOrderValue isOpen')
      .populate('items.menuItem', 'name image price isVeg available');

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      data: populatedCart
    });
  } catch (err) {
    next(err);
  }
};

