const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/ownerDashboardController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.get('/stats', protectOwner, attachRestaurant, getDashboardStats);

module.exports = router;

