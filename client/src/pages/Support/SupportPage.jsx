import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';
import api from '../../services/api';

export default function SupportPage() {
  const [faqs, setFaqs] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [tickets, setTickets] = useState([]);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'order_issue',
    description: '',
    priority: 'medium'
  });
  const [ticketMessageInput, setTicketMessageInput] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchFaqsAndTickets = async () => {
      try {
        const [faqsRes, ticketsRes] = await Promise.all([
          api.get('/support/faqs'),
          api.get('/support/tickets').catch(() => ({ data: { data: [] } }))
        ]);
        setFaqs(faqsRes.data.data);
        if (ticketsRes.data.data) {
          setTickets(ticketsRes.data.data);
          if (ticketsRes.data.data.length > 0) {
            setSelectedTicketId(ticketsRes.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load support data:', err);
      }
    };

    fetchFaqsAndTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/support/tickets', ticketForm);
      setTickets([res.data.data, ...tickets]);
      setSelectedTicketId(res.data.data._id);
      setIsCreatingTicket(false);
      setSuccessMsg('Your support ticket has been submitted. Our team will assist you shortly.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setTicketForm({
        subject: '',
        category: 'order_issue',
        description: '',
        priority: 'medium'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (ticketId) => {
    if (!ticketMessageInput.trim()) return;
    try {
      const res = await api.post(`/support/tickets/${ticketId}/messages`, {
        message: ticketMessageInput.trim()
      });
      setTickets(
        tickets.map((t) => (t._id === ticketId ? res.data.data : t))
      );
      setTicketMessageInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const selectedTicket = tickets.find((t) => t._id === selectedTicketId);

  return (
    <div className="support-page-wrapper">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1 className="page-heading">Help & Customer Support</h1>
            <p className="page-sub">Get answers to questions or raise an issue with our support team</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsCreatingTicket(!isCreatingTicket)}
          >
            <Plus size={16} />
            <span>{isCreatingTicket ? 'Cancel Ticket' : 'Raise Support Ticket'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="alert-success-banner">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Create Ticket Modal / Inline Form */}
        {isCreatingTicket && (
          <div className="checkout-card" style={{ marginBottom: '2rem' }}>
            <h3 className="card-title">Submit a Support Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ marginTop: '1rem' }}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select
                    className="form-input"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  >
                    <option value="order_issue">Order Issue / Missing Item</option>
                    <option value="delivery_delay">Delivery Delay</option>
                    <option value="food_quality">Food Quality or Packaging</option>
                    <option value="payment_issue">Payment / Refund Query</option>
                    <option value="other">General Feedback / Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief description of the problem"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Describe your issue in detail</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Please provide details about what went wrong so we can resolve it immediately..."
                  required
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
              </div>

              {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCreatingTicket(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Support Tickets History (if any) */}
        {tickets.length > 0 && (
          <div className="ticket-system-grid" style={{ marginBottom: '3rem' }}>
            {/* Tickets Sidebar */}
            <div className="ticket-sidebar">
              <h3 className="ticket-section-title">My Support Tickets</h3>
              <div className="ticket-items-stack">
                {tickets.map((t) => (
                  <div
                    key={t._id}
                    className={`ticket-summary-item ${t._id === selectedTicketId ? 'active' : ''}`}
                    onClick={() => setSelectedTicketId(t._id)}
                  >
                    <div className="ticket-top">
                      <span className="ticket-badge-num">{t.ticketNumber}</span>
                      <span className={`status-pill ${t.status}`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h5 className="ticket-item-subject">{t.subject}</h5>
                    <span className="ticket-item-time">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Thread */}
            {selectedTicket && (
              <div className="ticket-chat-area checkout-card">
                <div className="chat-header">
                  <div>
                    <span className="ticket-number-tag">{selectedTicket.ticketNumber}</span>
                    <h4 className="chat-subject">{selectedTicket.subject}</h4>
                  </div>
                  <span className={`status-pill ${selectedTicket.status}`}>
                    {selectedTicket.status.toUpperCase()}
                  </span>
                </div>

                <div className="chat-messages-container">
                  {selectedTicket.messages?.map((m, idx) => {
                    const isMe = m.sender === 'customer';
                    return (
                      <div key={idx} className={`chat-bubble-row ${isMe ? 'me' : 'agent'}`}>
                        <div className="chat-bubble">
                          <span className="chat-sender-name">{m.senderName || (isMe ? 'You' : 'Support')}</span>
                          <p className="chat-msg-text">{m.message}</p>
                          <span className="chat-msg-time">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply box */}
                <div className="chat-reply-bar">
                  <input
                    type="text"
                    className="chat-reply-input"
                    placeholder="Type your response to support..."
                    value={ticketMessageInput}
                    onChange={(e) => setTicketMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage(selectedTicket._id);
                    }}
                  />
                  <button
                    className="btn btn-primary btn-icon"
                    onClick={() => handleSendMessage(selectedTicket._id)}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQs Accordion */}
        <div className="faq-section">
          <h2 className="faq-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <span className="faq-q-text">{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && <p className="faq-a-text">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

