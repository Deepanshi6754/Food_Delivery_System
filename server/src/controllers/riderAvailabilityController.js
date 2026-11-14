const RiderProfile = require('../models/RiderProfile');
const DeliveryAssignment = require('../models/DeliveryAssignment');

// @desc    Toggle rider online/offline availability
// @route   PATCH /api/v1/rider/availability/toggle
// @access  Private (Rider + attachRiderProfile)
const toggleAvailability = async (req, res) => {
  try {
    let profile = req.riderProfile;
    if (!profile) {
      profile = await RiderProfile.findOne({ user: req.user._id });
    }
    if (!profile) {
      profile = await RiderProfile.create({
        user: req.user._id,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'DL-01-FD-5678',
        verificationStatus: 'approved',
        isOnline: true,
        isAvailable: true
      });
    }

    const { isOnline } = req.body || {};
    const targetOnline = isOnline !== undefined ? Boolean(isOnline) : !profile.isOnline;

    // Check if rider has an active delivery in progress before allowing to go offline
    if (!targetOnline) {
      const activeAssignment = await DeliveryAssignment.findOne({
        rider: req.user._id,
        status: { $in: ['accepted', 'reached_restaurant', 'picked_up', 'reached_customer'] }
      });

      if (activeAssignment || profile.activeDelivery) {
        return res.status(400).json({
          success: false,
          message: 'Cannot go offline while an active delivery is in progress. Please fulfill or reassign your active delivery first.'
        });
      }
    }

    profile.isOnline = targetOnline;
    profile.isAvailable = targetOnline;
    await profile.save();

    const responsePayload = {
      isOnline: profile.isOnline,
      isAvailable: profile.isAvailable
    };

    return res.status(200).json({
      success: true,
      message: `You are now ${profile.isOnline ? 'ONLINE and eligible for delivery requests' : 'OFFLINE'}.`,
      data: responsePayload,
      ...responsePayload
    });
  } catch (err) {
    console.error('Toggle availability error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update availability status.'
    });
  }
};

module.exports = {
  toggleAvailability
};


