const RiderProfile = require('../models/RiderProfile');
const User = require('../models/User');

// @desc    Get rider profile details
// @route   GET /api/v1/rider/profile
// @access  Private (Rider + attachRiderProfile)
const getProfile = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ user: req.user._id }).populate('activeDelivery');
    return res.status(200).json({
      success: true,
      data: profile,
      profile,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar,
        role: req.user.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile details.'
    });
  }
};

// @desc    Update rider profile details
// @route   PUT /api/v1/rider/profile
// @access  Private (Rider + attachRiderProfile)
const updateProfile = async (req, res) => {
  try {
    const profile = req.riderProfile;
    const {
      name,
      phone,
      avatar,
      vehicleType,
      vehicleNumber,
      drivingLicenceNumber,
      preferredArea
    } = req.body;

    // Update user info
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (avatar) req.user.avatar = avatar;
    await req.user.save();

    // Update profile info
    if (vehicleType) profile.vehicleType = vehicleType;
    if (vehicleNumber) profile.vehicleNumber = vehicleNumber;
    if (drivingLicenceNumber) {
      profile.drivingLicence.number = drivingLicenceNumber;
    }
    if (preferredArea) profile.preferredArea = preferredArea;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Rider profile updated successfully.',
      data: profile,
      profile,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
};

// @desc    Update bank / payout details
// @route   PUT /api/v1/rider/profile/bank
// @access  Private (Rider + attachRiderProfile)
const updateBankDetails = async (req, res) => {
  try {
    const profile = req.riderProfile;
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;

    profile.bankDetails = {
      accountHolderName: accountHolderName || profile.bankDetails?.accountHolderName,
      accountNumber: accountNumber || profile.bankDetails?.accountNumber,
      ifscCode: ifscCode || profile.bankDetails?.ifscCode,
      bankName: bankName || profile.bankDetails?.bankName,
      upiId: upiId || profile.bankDetails?.upiId
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Bank payout details updated successfully.',
      bankDetails: profile.bankDetails
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update bank details.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateBankDetails
};

