import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';
import riderApi from '../../services/riderApi';

const formatCurrency = (paise) => `₹${((paise || 0) / 100).toFixed(0)}`;
const STATUS_FILTERS = ['all', 'delivered', 'cancelled'];

export default function RiderHistoryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter !== 'all') params.set('status', filter);
      if (search.trim()) params.set('search', search.trim());
      const { data } = await riderApi.get(`/history?${params}`);
      setDeliveries(data.data || []);
      setTotalPages(data.totalPages || 1);
      setError('');
    } catch (err) {
      setError('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [filter, page]);
  useEffect(() => { const t = setTimeout(fetchHistory, 400); return () => clearTimeout(t); }, [search]);

  const getStatusClass = (status) => {
    if (status === 'delivered') return 'rider-pill-success';
    if (status === 'cancelled') return 'rider-pill-error';
    return 'rider-pill-orange';
  };

  return (
    <div>
      <div className="rider-page-header">
        <div>
          <div className="rider-page-title">Delivery History</div>
          <div className="rider-page-subtitle">All your past deliveries</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--rider-text-secondary)' }} />
          <input
            type="text"
            className="rider-form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`rider-btn rider-btn-sm ${filter === s ? 'rider-btn-primary' : 'rider-btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rider-alert rider-alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rider-card">
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--rider-border)' }}>
              <div className="rider-skeleton" style={{ width: '100%', height: '16px' }} />
            </div>
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <div className="rider-card">
          <div className="rider-empty-state">
            <div className="rider-empty-state-icon"><Filter size={28} /></div>
            <div className="rider-empty-state-title">No deliveries found</div>
            <div className="rider-empty-state-desc">Try adjusting your filter or search.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="rider-card" style={{ padding: 0 }}>
            <div className="rider-table-wrap">
              <table className="rider-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Restaurant</th>
                    <th>Customer</th>
                    <th>Earnings</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d._id}>
                      <td style={{ fontWeight: 700, color: 'var(--rider-primary)' }}>
                        {d.orderNumber || `#${d._id?.slice(-6)}`}
                      </td>
                      <td>{d.restaurant?.name || '—'}</td>
                      <td>{d.customer?.name || '—'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--rider-success)' }}>
                        {formatCurrency(d.riderEarning || d.deliveryFee || 0)}
                      </td>
                      <td>
                        <span className={`rider-pill ${getStatusClass(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--rider-text-secondary)' }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <button
                          className="rider-btn rider-btn-outline rider-btn-sm"
                          onClick={() => setSelected(d)}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <button
                className="rider-btn rider-btn-outline rider-btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '14px', color: 'var(--rider-text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="rider-btn rider-btn-outline rider-btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="rider-modal-overlay">
          <div className="rider-modal">
            <div className="rider-modal-header">
              <div className="rider-modal-title">Delivery #{selected.orderNumber || selected._id?.slice(-6)}</div>
              <button className="rider-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="rider-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Status', value: <span className={`rider-pill ${getStatusClass(selected.status)}`}>{selected.status}</span> },
                  { label: 'Restaurant', value: selected.restaurant?.name || '—' },
                  { label: 'Customer', value: selected.customer?.name || '—' },
                  { label: 'Delivery Address', value: [selected.deliveryAddress?.street, selected.deliveryAddress?.area, selected.deliveryAddress?.city].filter(Boolean).join(', ') || '—' },
                  { label: 'Earnings', value: <span style={{ color: 'var(--rider-success)', fontWeight: 700 }}>{formatCurrency(selected.riderEarning || selected.deliveryFee || 0)}</span> },
                  { label: 'Date', value: selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--rider-border)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: '14px', color: 'var(--rider-text)', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rider-modal-footer">
              <button className="rider-btn rider-btn-primary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

