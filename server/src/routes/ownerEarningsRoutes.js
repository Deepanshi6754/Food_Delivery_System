const express = require('express');
const router = express.Router();
const {
  getEarningsSummary,
  exportEarningsCsv
} = require('../controllers/ownerEarningsController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.use(protectOwner, attachRestaurant);

router.get('/summary', getEarningsSummary);
router.get('/export', exportEarningsCsv);

module.exports = router;

