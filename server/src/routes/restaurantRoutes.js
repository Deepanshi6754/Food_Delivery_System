const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getCuratedHome
} = require('../controllers/restaurantController');

router.get('/curated/home', getCuratedHome);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

module.exports = router;

