const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateQuantity);
router.delete('/items/:itemId', removeItem);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

module.exports = router;

