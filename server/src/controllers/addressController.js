const Address = require('../models/Address');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const {
      label = 'Home',
      recipientName,
      phone,
      houseNo,
      street,
      area,
      landmark,
      city,
      state = 'Delhi',
      pincode,
      deliveryInstructions,
      isDefault = false
    } = req.body;

    if (!recipientName || !phone || !houseNo || !street || !area || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address details.'
      });
    }

    // If setting default, unset existing default
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // If first address, make it default automatically
    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || existingCount === 0;

    const address = await Address.create({
      user: req.user._id,
      label,
      recipientName,
      phone,
      houseNo,
      street,
      area,
      landmark,
      city,
      state,
      pincode,
      deliveryInstructions,
      isDefault: shouldBeDefault
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If deleted was default, make another address default if available
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: address
    });
  } catch (err) {
    next(err);
  }
};

