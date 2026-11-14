const RiderProfile = require('../models/RiderProfile');
const RiderLocation = require('../models/RiderLocation');
const { getIO } = require('../config/socket');

// @desc    Update rider current GPS coordinates
// @route   POST /api/v1/rider/location
// @access  Private (Rider + attachRiderProfile)
const updateLocation = async (req, res) => {
  try {
    const {
      lat = req.body.latitude,
      lng = req.body.longitude,
      heading = 0,
      speed = 25,
      address
    } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude coordinates are required.'
      });
    }

    const profile = req.riderProfile;
    profile.currentLocation = {
      lat: Number(lat),
      lng: Number(lng),
      address: address || profile.currentLocation?.address || 'Central Delhi',
      updatedAt: new Date()
    };
    await profile.save();

    // Store in location collection
    await RiderLocation.create({
      rider: req.user._id,
      order: profile.activeDelivery || null,
      coordinates: { lat: Number(lat), lng: Number(lng) },
      heading: Number(heading),
      speed: Number(speed),
      address: address || ''
    });

    // Real-time broadcast if there is an active delivery
    if (profile.activeDelivery) {
      const io = getIO();
      if (io) {
        io.to(`order_${profile.activeDelivery}`).emit('rider_location_changed', {
          orderId: profile.activeDelivery,
          riderId: req.user._id,
          lat: Number(lat),
          lng: Number(lng),
          heading: Number(heading),
          speed: Number(speed),
          updatedAt: new Date()
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: profile.currentLocation,
      location: profile.currentLocation
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update rider location.'
    });
  }
};

// @desc    Get rider's current location
// @route   GET /api/v1/rider/location
// @access  Private (Rider + attachRiderProfile)
const getLocation = async (req, res) => {
  try {
    const loc = req.riderProfile?.currentLocation || { lat: 28.6139, lng: 77.2090 };
    return res.status(200).json({
      success: true,
      data: { location: { coordinates: [loc.lng, loc.lat] }, ...loc },
      location: loc
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve location.'
    });
  }
};

module.exports = {
  updateLocation,
  getLocation
};

