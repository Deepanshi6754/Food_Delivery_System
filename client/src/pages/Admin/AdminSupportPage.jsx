import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Selected Ticket for Chat Thread View
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/support/tickets', {
        params: { status: statusFilter, priority: priorityFilter, search, page, limit: 10 }
      });
      if (res.data.success) {
        setTickets(res.data.data.tickets || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 10 });
        if (selectedTicket) {
          const updated = (res.data.data.tickets || []).find((t) => t._id === selectedTicket._id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, priorityFilter]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setReplyLoading(true);
    try {
      const res = await adminApi.post(`/support/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        setReplyMessage('');
        fetchTickets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const res = await adminApi.patch(`/support/tickets/${selectedTicket._id}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        fetchTickets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Support Helpdesk</h1>
          <p className="admin-page-subtitle">
            Resolve delivery escalations, payment grievances, food quality reports, and inquiry tickets
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Left: Tickets Table */}
        <div>
          <div className="admin-toolbar">
            <div className="admin-toolbar-left" style={{ flex: 1 }}>
              <div className="admin-search-input" style={{ width: '100%' }}>
                <Search size={16} color="#78716C" />
                <input
                  type="text"
                  placeholder="Search by ticket # or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                />
              </div>
            </div>

            <div className="admin-toolbar-right">
              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                className="admin-select"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Customer</th>
                  <th>Subject & Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                      Loading support tickets...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                      No support tickets found!
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t._id}
                      style={{
                        cursor: 'pointer',
                        background: selectedTicket?._id === t._id ? '#FFEDD5' : 'transparent'
                      }}
                      onClick={() => setSelectedTicket(t)}
                    >
                      <td>
                        <strong style={{ color: '#F97316' }}>#{t.ticketNumber}</strong>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>{t.user?.name || 'Customer'}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{t.user?.phone || ''}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>{t.subject}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#78716C', textTransform: 'capitalize' }}>
                          {t.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            t.priority === 'high'
                              ? 'admin-badge-danger'
                              : t.priority === 'medium'
                              ? 'admin-badge-warning'
                              : 'admin-badge-neutral'
                          }`}
                        >
                          {t.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            t.status === 'open'
                              ? 'admin-badge-danger'
                              : t.status === 'in_progress'
                              ? 'admin-badge-warning'
                              : 'admin-badge-success'
                          }`}
                        >
                          {t.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#78716C' }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="admin-pagination">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="admin-pagination-buttons">
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Ticket Detail & Chat Thread */}
        {selectedTicket && (
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '680px' }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">
                  #{selectedTicket.ticketNumber} – {selectedTicket.subject}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                  Customer: {selectedTicket.user?.name} ({selectedTicket.user?.email})
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedTicket(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Status resolver bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E7E5E4', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#78716C' }}>Status:</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className={`admin-btn admin-btn-sm ${selectedTicket.status === 'in_progress' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  onClick={() => handleUpdateStatus('in_progress')}
                >
                  In Progress
                </button>
                <button
                  className={`admin-btn admin-btn-sm ${selectedTicket.status === 'resolved' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  onClick={() => handleUpdateStatus('resolved')}
                >
                  Resolve
                </button>
                <button
                  className={`admin-btn admin-btn-sm ${selectedTicket.status === 'closed' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  onClick={() => handleUpdateStatus('closed')}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Thread messages container */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
              {/* Initial description */}
              <div style={{ background: '#FFF8F0', padding: '0.85rem', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                <strong style={{ fontSize: '0.8rem', color: '#F97316', display: 'block', marginBottom: '0.25rem' }}>
                  Original Issue Description
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#292524' }}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Thread history */}
              {selectedTicket.messages?.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'support' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'support' ? '#DCFCE7' : '#F5F5F4',
                    border: msg.sender === 'support' ? '1px solid #86EFAC' : '1px solid #E7E5E4',
                    borderRadius: '10px',
                    padding: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.25rem', fontSize: '0.7rem', color: '#78716C' }}>
                    <strong>{msg.senderName || (msg.sender === 'support' ? 'Support Agent' : 'Customer')}</strong>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#292524', lineHeight: 1.4 }}>
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply composer */}
            <form onSubmit={handleSendReply} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                required
                className="admin-form-control"
                placeholder="Type your official support response..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={replyLoading}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
