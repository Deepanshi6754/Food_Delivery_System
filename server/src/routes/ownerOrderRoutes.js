const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  startPreparation,
  markReadyForPickup
} = require('../controllers/ownerOrdersController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.use(protectOwner, attachRestaurant);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/accept', acceptOrder);
router.put('/:id/reject', rejectOrder);
router.put('/:id/prepare', startPreparation);
router.put('/:id/ready', markReadyForPickup);

module.exports = router;

