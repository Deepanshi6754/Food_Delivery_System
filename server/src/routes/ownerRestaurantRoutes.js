const express = require('express');
const router = express.Router();
const {
  getMyRestaurant,
  updateMyRestaurant,
  toggleAvailability
} = require('../controllers/ownerRestaurantController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.get('/profile', protectOwner, attachRestaurant, getMyRestaurant);
router.put('/profile', protectOwner, attachRestaurant, updateMyRestaurant);
router.patch('/status', protectOwner, attachRestaurant, toggleAvailability);

module.exports = router;

