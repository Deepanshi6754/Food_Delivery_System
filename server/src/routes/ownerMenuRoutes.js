const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability
} = require('../controllers/ownerMenuController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.use(protectOwner, attachRestaurant);

router.get('/', getMenuItems);
router.post('/', createMenuItem);
router.get('/:id', getMenuItemById);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/availability', toggleItemAvailability);

module.exports = router;

