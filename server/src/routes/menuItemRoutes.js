const express = require('express');
const router = express.Router();
const {
  searchMenuItems,
  getTrendingDishes,
  getMenuItemById
} = require('../controllers/menuItemController');

router.get('/search', searchMenuItems);
router.get('/trending', getTrendingDishes);
router.get('/:id', getMenuItemById);

module.exports = router;

