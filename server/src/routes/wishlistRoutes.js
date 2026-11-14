const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleRestaurant,
  toggleMenuItem
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWishlist);
router.post('/restaurants/:restaurantId', toggleRestaurant);
router.post('/menu-items/:itemId', toggleMenuItem);

module.exports = router;

