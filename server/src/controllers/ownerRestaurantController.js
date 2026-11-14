const Restaurant = require('../models/Restaurant');

// @desc    Get owner restaurant profile
// @route   GET /api/v1/owner/restaurant/profile
// @access  Private (Owner + attachRestaurant)
const getMyRestaurant = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      restaurant: req.restaurant
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant details.'
    });
  }
};

// @desc    Update owner restaurant profile
// @route   PUT /api/v1/owner/restaurant/profile
// @access  Private (Owner + attachRestaurant)
const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = req.restaurant;

    const {
      name,
      description,
      cuisine,
      image,
      coverImage,
      contactEmail,
      contactPhone,
      address,
      openingTime,
      closingTime,
      operatingHours,
      preparationTime,
      minOrderValue,
      priceForTwo,
      isPureVeg,
      tags
    } = req.body;

    // Apply allowed updates
    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (Array.isArray(cuisine) && cuisine.length > 0) restaurant.cuisine = cuisine;
    if (image) restaurant.image = image;
    if (coverImage) restaurant.coverImage = coverImage;
    if (contactEmail) restaurant.contactEmail = contactEmail;
    if (contactPhone) restaurant.contactPhone = contactPhone;
    if (address) {
      restaurant.address = {
        street: address.street || restaurant.address?.street,
        area: address.area || restaurant.address?.area,
        city: address.city || restaurant.address?.city,
        pincode: address.pincode || restaurant.address?.pincode
      };
    }
    if (openingTime) restaurant.openingTime = openingTime;
    if (closingTime) restaurant.closingTime = closingTime;
    if (Array.isArray(operatingHours)) restaurant.operatingHours = operatingHours;
    if (preparationTime !== undefined) restaurant.preparationTime = Number(preparationTime);
    if (minOrderValue !== undefined) restaurant.minOrderValue = Number(minOrderValue);
    if (priceForTwo !== undefined) restaurant.priceForTwo = Number(priceForTwo);
    if (isPureVeg !== undefined) restaurant.isPureVeg = Boolean(isPureVeg);
    if (Array.isArray(tags)) restaurant.tags = tags;

    // Note: approvalStatus, rating, reviewCount, platformCommission are strictly preserved and not modified by owner

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Restaurant profile updated successfully.',
      restaurant
    });
  } catch (err) {
    console.error('Update restaurant error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update restaurant profile.'
    });
  }
};

// @desc    Toggle operating status (isOpen or isTemporarilyClosed)
// @route   PATCH /api/v1/owner/restaurant/status
// @access  Private (Owner + attachRestaurant)
const toggleAvailability = async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { isOpen, isTemporarilyClosed } = req.body;

    if (isOpen !== undefined) {
      restaurant.isOpen = Boolean(isOpen);
    }
    if (isTemporarilyClosed !== undefined) {
      restaurant.isTemporarilyClosed = Boolean(isTemporarilyClosed);
      if (restaurant.isTemporarilyClosed) {
        restaurant.isOpen = false;
      }
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: `Restaurant is now ${restaurant.isOpen && !restaurant.isTemporarilyClosed ? 'Open for orders' : 'Closed'}.`,
      isOpen: restaurant.isOpen,
      isTemporarilyClosed: restaurant.isTemporarilyClosed
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update restaurant availability status.'
    });
  }
};

module.exports = {
  getMyRestaurant,
  updateMyRestaurant,
  toggleAvailability
};

