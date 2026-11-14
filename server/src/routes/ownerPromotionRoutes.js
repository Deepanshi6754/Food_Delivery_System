const express = require('express');
const router = express.Router();
const {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../controllers/ownerPromotionsController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.use(protectOwner, attachRestaurant);

router.get('/', getPromotions);
router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

module.exports = router;

