const express = require('express');
const router = express.Router();
const {
  getFaqs,
  createTicket,
  getUserTickets,
  addTicketMessage
} = require('../controllers/supportController');
const { protect } = require('../middleware/auth');

router.get('/faqs', getFaqs);
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getUserTickets);
router.post('/tickets/:id/messages', protect, addTicketMessage);

module.exports = router;

