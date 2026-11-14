const express = require('express');
const router = express.Router();
const {
  registerOwner,
  loginOwner,
  getMe,
  updatePassword
} = require('../controllers/ownerAuthController');
const { protectOwner } = require('../middleware/ownerAuth');

router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.get('/me', protectOwner, getMe);
router.put('/password', protectOwner, updatePassword);

module.exports = router;

