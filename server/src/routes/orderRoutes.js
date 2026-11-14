const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reorder,
  simulateStatusUpdate
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/reorder', reorder);
router.post('/:id/simulate-status', simulateStatusUpdate);

module.exports = router;

