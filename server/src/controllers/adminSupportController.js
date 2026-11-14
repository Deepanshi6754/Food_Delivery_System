const SupportTicket = require('../models/SupportTicket');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated support tickets
// @route   GET /api/v1/admin/support/tickets
// @access  Private (Admin - Support/Operations/Super)
const getTickets = async (req, res) => {
  try {
    const {
      status = 'all',
      priority = 'all',
      category = 'all',
      search = '',
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (priority !== 'all') {
      query.priority = priority;
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ ticketNumber: reg }, { subject: reg }, { description: reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, tickets] = await Promise.all([
      SupportTicket.countDocuments(query),
      SupportTicket.find(query)
        .populate('user', 'name email phone avatar')
        .populate('order', 'orderNumber status pricing')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve support tickets.'
    });
  }
};

// @desc    Get ticket details with thread
// @route   GET /api/v1/admin/support/tickets/:id
// @access  Private (Admin)
const getTicketDetails = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('order', 'orderNumber status pricing restaurant rider createdAt')
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error('Error fetching ticket details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket details.'
    });
  }
};

// @desc    Admin reply to ticket
// @route   POST /api/v1/admin/support/tickets/:id/reply
// @access  Private (Admin - Support/Operations/Super)
const replyTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message cannot be empty.'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found.'
      });
    }

    ticket.messages.push({
      sender: 'support',
      senderName: `${req.user.name} (Support)`,
      message: message.trim(),
      timestamp: new Date()
    });

    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    await recordAudit({
      admin: req.user,
      action: 'reply_support_ticket',
      targetType: 'SupportTicket',
      targetId: ticket._id,
      targetName: `Ticket #${ticket.ticketNumber}`,
      reason: 'Admin replied to support ticket',
      details: { replyLength: message.length },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      data: ticket
    });
  } catch (err) {
    console.error('Error replying to ticket:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reply.'
    });
  }
};

// @desc    Update ticket status and priority
// @route   PATCH /api/v1/admin/support/tickets/:id/status
// @access  Private (Admin - Support/Operations/Super)
const updateTicketStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found.'
      });
    }

    const prevStatus = ticket.status;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;

    await ticket.save();

    await recordAudit({
      admin: req.user,
      action: 'update_ticket_status',
      targetType: 'SupportTicket',
      targetId: ticket._id,
      targetName: `Ticket #${ticket.ticketNumber}`,
      reason: `Status changed from ${prevStatus} to ${status || prevStatus}`,
      details: { previousStatus: prevStatus, newStatus: ticket.status, priority: ticket.priority },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket status updated.',
      data: ticket
    });
  } catch (err) {
    console.error('Error updating ticket status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ticket.'
    });
  }
};

module.exports = {
  getTickets,
  getTicketDetails,
  replyTicket,
  updateTicketStatus
};
