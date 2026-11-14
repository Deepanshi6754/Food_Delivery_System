import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import {
  Bell,
  Send,
  Users,
  Store,
  Bike,
  CheckCircle2,
  AlertCircle,
  Megaphone
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Local record of sent broadcasts
  const [recentBroadcasts, setRecentBroadcasts] = useState([
    {
      id: 1,
      title: 'Platform Maintenance Window Notice',
      message: 'FoodDelight systems will undergo a 15-minute scheduled optimization on Tuesday at 3:00 AM IST.',
      target: 'all',
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
      count: 142
    },
    {
      id: 2,
      title: 'Monsoon Delivery Surge Incentives',
      message: 'Earn ₹30 extra per completed order during evening rain peak hours today!',
      target: 'riders',
      sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleString(),
      count: 28
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    setSuccessResult(null);
    try {
      const res = await adminApi.post('/notifications/broadcast', {
        title,
        message,
        target
      });
      if (res.data.success) {
        setSuccessResult(res.data.data);
        setRecentBroadcasts([
          {
            id: Date.now(),
            title,
            message,
            target,
            sentAt: new Date().toLocaleString(),
            count: res.data.data.recipientCount
          },
          ...recentBroadcasts
        ]);
        setTitle('');
        setMessage('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Announcements & Push Broadcasts</h1>
          <p className="admin-page-subtitle">
            Send real-time alerts and notices to customers, merchant kitchen staff, or delivery rider apps
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Broadcast Composer */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={18} color="#F97316" />
              <h3 className="admin-card-title">Compose Platform Broadcast</h3>
            </div>
          </div>

          {successResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: '#DCFCE7',
                color: '#15803D',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                border: '1px solid #86EFAC'
              }}
            >
              <CheckCircle2 size={18} />
              <span>
                Broadcast sent successfully to <strong>{successResult.recipientCount}</strong> {successResult.target} accounts!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">Target Audience *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    border: target === 'all' ? '2px solid #F97316' : '1px solid #E7E5E4',
                    borderRadius: '8px',
                    background: target === 'all' ? '#FFF8F0' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <input
                    type="radio"
                    name="target"
                    value="all"
                    checked={target === 'all'}
                    onChange={() => setTarget('all')}
                  />
                  <span>All Users</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    border: target === 'customers' ? '2px solid #F97316' : '1px solid #E7E5E4',
                    borderRadius: '8px',
                    background: target === 'customers' ? '#FFF8F0' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <input
                    type="radio"
                    name="target"
                    value="customers"
                    checked={target === 'customers'}
                    onChange={() => setTarget('customers')}
                  />
                  <span>Customers</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    border: target === 'restaurant_owners' ? '2px solid #F97316' : '1px solid #E7E5E4',
                    borderRadius: '8px',
                    background: target === 'restaurant_owners' ? '#FFF8F0' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <input
                    type="radio"
                    name="target"
                    value="restaurant_owners"
                    checked={target === 'restaurant_owners'}
                    onChange={() => setTarget('restaurant_owners')}
                  />
                  <span>Restaurant Partners</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    border: target === 'riders' ? '2px solid #F97316' : '1px solid #E7E5E4',
                    borderRadius: '8px',
                    background: target === 'riders' ? '#FFF8F0' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <input
                    type="radio"
                    name="target"
                    value="riders"
                    checked={target === 'riders'}
                    onChange={() => setTarget('riders')}
                  />
                  <span>Delivery Riders</span>
                </label>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Announcement Title *</label>
              <input
                type="text"
                required
                className="admin-form-control"
                placeholder="e.g. Special Weekend Surge Incentive Announced!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Broadcast Message Content *</label>
              <textarea
                rows="4"
                required
                className="admin-form-control"
                placeholder="Write your platform announcement message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <Send size={16} />
              <span>{loading ? 'Transmitting Broadcast...' : 'Broadcast Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Broadcasts Sent</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentBroadcasts.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '1rem',
                  background: '#FAFAF9',
                  borderRadius: '10px',
                  border: '1px solid #E7E5E4'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#292524' }}>{b.title}</strong>
                  <span className="admin-badge admin-badge-info">
                    {b.target?.toUpperCase()} ({b.count})
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.825rem', color: '#78716C', lineHeight: 1.4 }}>
                  {b.message}
                </p>
                <span style={{ fontSize: '0.7rem', color: '#A8A29E', display: 'block', marginTop: '0.5rem' }}>
                  Sent on: {b.sentAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
