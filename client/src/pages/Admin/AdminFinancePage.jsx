import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  DollarSign,
  CreditCard,
  Percent,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Overview data
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Payments data
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Commissions data
  const [commissions, setCommissions] = useState([]);
  const [commissionTotals, setCommissionTotals] = useState({});
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  // Refunds data
  const [refunds, setRefunds] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [processRefundModal, setProcessRefundModal] = useState({ open: false, refund: null, status: 'processed', notes: '', ref: '' });

  // Payouts data
  const [payouts, setPayouts] = useState([]);
  const [payoutType, setPayoutType] = useState('restaurant');
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Load Overview
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await adminApi.get('/finance/summary');
        if (res.data.success) {
          setSummary(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load finance summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  // Tab switch logic
  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'commissions') {
      fetchCommissions();
    } else if (activeTab === 'refunds') {
      fetchRefunds();
    } else if (activeTab === 'payouts') {
      fetchPayouts();
    }
  }, [activeTab, payoutType]);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await adminApi.get('/finance/payments', { params: { limit: 20 } });
      if (res.data.success) {
        setPayments(res.data.data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchCommissions = async () => {
    setLoadingCommissions(true);
    try {
      const res = await adminApi.get('/finance/commissions', { params: { limit: 20 } });
      if (res.data.success) {
        setCommissions(res.data.data.commissions || []);
        setCommissionTotals(res.data.data.totals || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCommissions(false);
    }
  };

  const fetchRefunds = async () => {
    setLoadingRefunds(true);
    try {
      const res = await adminApi.get('/finance/refunds', { params: { limit: 20 } });
      if (res.data.success) {
        setRefunds(res.data.data.refunds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRefunds(false);
    }
  };

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const res = await adminApi.get('/finance/payouts', { params: { type: payoutType, limit: 20 } });
      if (res.data.success) {
        setPayouts(res.data.data.payouts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleProcessRefundSubmit = async () => {
    if (!processRefundModal.refund) return;
    try {
      await adminApi.patch(`/finance/refunds/${processRefundModal.refund._id}/process`, {
        status: processRefundModal.status,
        adminNotes: processRefundModal.notes,
        providerReference: processRefundModal.ref
      });
      setProcessRefundModal({ open: false, refund: null, status: 'processed', notes: '', ref: '' });
      fetchRefunds();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund.');
    }
  };

  const formatPrice = (paise) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Finance, Revenues & Payouts</h1>
          <p className="admin-page-subtitle">
            Gross merchandise volumes, vendor commissions, merchant settlement payouts, and customer refunds
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Financial Overview
        </button>
        <button
          className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Ledger
        </button>
        <button
          className={`admin-tab ${activeTab === 'commissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          Vendor Commissions
        </button>
        <button
          className={`admin-tab ${activeTab === 'refunds' ? 'active' : ''}`}
          onClick={() => setActiveTab('refunds')}
        >
          Refund Queue
        </button>
        <button
          className={`admin-tab ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          Merchant & Rider Payouts
        </button>
      </div>

      {/* Tab 1: Financial Overview */}
      {activeTab === 'overview' && (
        <div>
          {loadingSummary ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
              Computing financial totals...
            </div>
          ) : (
            <>
              {/* Financial KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Gross Platform Volume (GMV)</span>
                    <div className="admin-kpi-icon-wrap" style={{ background: '#DCFCE7', color: '#15803D' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{formatPrice(summary?.totalGmv)}</div>
                  <div className="admin-kpi-trend" style={{ color: '#15803D' }}>
                    <span>All-time settled food volume</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Platform Net Commission</span>
                    <div className="admin-kpi-icon-wrap" style={{ background: '#FFEDD5', color: '#F97316' }}>
                      <Percent size={20} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{formatPrice(summary?.platformCommission)}</div>
                  <div className="admin-kpi-trend" style={{ color: '#F97316' }}>
                    <span>Net earned platform revenue</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Delivery Fees Collected</span>
                    <div className="admin-kpi-icon-wrap" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{formatPrice(summary?.deliveryFees)}</div>
                  <div className="admin-kpi-trend" style={{ color: '#0284C7' }}>
                    <span>Customer delivery charges</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Settled Merchant Payouts</span>
                    <div className="admin-kpi-icon-wrap" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{formatPrice(summary?.completedRestaurantPayouts)}</div>
                  <div className="admin-kpi-trend" style={{ color: '#78716C' }}>
                    <span>Disbursed to restaurants</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Settled Rider Earnings</span>
                    <div className="admin-kpi-icon-wrap" style={{ background: '#CCFBF1', color: '#0F766E' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{formatPrice(summary?.completedRiderPayouts)}</div>
                  <div className="admin-kpi-trend" style={{ color: '#0F766E' }}>
                    <span>Disbursed to rider fleet</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Processed Customer Refunds</span>
                    <div className="admin-kpi-icon-wrap" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      <RotateCcw size={20} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#DC2626' }}>
                    {formatPrice(summary?.totalRefunded)}
                  </div>
                  <div className="admin-kpi-trend" style={{ color: '#D97706' }}>
                    <span>Pending: {formatPrice(summary?.pendingRefundAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Payment Method Volume Breakdown</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {summary?.paymentMethodBreakdown?.map((pm) => (
                    <div
                      key={pm._id || 'unknown'}
                      style={{
                        padding: '1rem',
                        background: '#FAFAF9',
                        borderRadius: '10px',
                        border: '1px solid #E7E5E4'
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.9rem', textTransform: 'uppercase', color: '#F97316' }}>
                        {pm._id || 'COD'}
                      </strong>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#292524', display: 'block', margin: '0.25rem 0' }}>
                        {formatPrice(pm.totalVolume)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                        {pm.orderCount} total orders processed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingPayments ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No payment records available.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong style={{ color: '#F97316' }}>#{p.orderNumber}</strong>
                    </td>
                    <td>{p.customer?.name || 'Customer'}</td>
                    <td>{p.restaurant?.name || 'Restaurant'}</td>
                    <td>
                      <span className="admin-badge admin-badge-neutral">{p.method?.toUpperCase()}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.transactionId}</td>
                    <td>
                      <strong>{formatPrice(p.amount)}</strong>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          p.status === 'completed'
                            ? 'admin-badge-success'
                            : p.status === 'refunded'
                            ? 'admin-badge-info'
                            : 'admin-badge-warning'
                        }`}
                      >
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Vendor Commissions */}
      {activeTab === 'commissions' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="admin-card" style={{ flex: 1, marginBottom: 0, padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>
                Platform Delivered Sales
              </span>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#292524' }}>
                {formatPrice(commissionTotals.overallSales)}
              </strong>
            </div>
            <div className="admin-card" style={{ flex: 1, marginBottom: 0, padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>
                Aggregate Platform Fee
              </span>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#F97316' }}>
                {formatPrice(commissionTotals.overallEstimatedCommission)}
              </strong>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Commission Rate</th>
                  <th>Delivered Orders</th>
                  <th>Food Sales Volume</th>
                  <th>Gross Volume</th>
                  <th>Platform Fee Earned</th>
                </tr>
              </thead>
              <tbody>
                {loadingCommissions ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                      Loading vendor commissions...
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                      No commission records generated yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c) => (
                    <tr key={c.restaurantId}>
                      <td>
                        <strong>{c.restaurantName}</strong>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-info">{c.platformCommissionRate}%</span>
                      </td>
                      <td>{c.totalOrders}</td>
                      <td>{formatPrice(c.totalSales)}</td>
                      <td>{formatPrice(c.grossTotal)}</td>
                      <td>
                        <strong style={{ color: '#15803D' }}>{formatPrice(c.earnedCommission)}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Refund Queue */}
      {activeTab === 'refunds' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Requested At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRefunds ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    Loading refund queue...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No pending customer refunds in queue!
                  </td>
                </tr>
              ) : (
                refunds.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong style={{ color: '#F97316' }}>#{r.orderNumber}</strong>
                    </td>
                    <td>{r.customer?.name || 'Customer'}</td>
                    <td>
                      <strong>{formatPrice(r.amount)}</strong>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: '#78716C' }}>{r.reason}</td>
                    <td>
                      <span className="admin-badge admin-badge-neutral">{r.refundMethod}</span>
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {r.providerReference || 'Pending'}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          ['approved', 'processed'].includes(r.status)
                            ? 'admin-badge-success'
                            : r.status === 'rejected'
                            ? 'admin-badge-danger'
                            : 'admin-badge-warning'
                        }`}
                      >
                        {r.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#78716C' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status === 'pending' && (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            title="Approve / Process Refund"
                            onClick={() =>
                              setProcessRefundModal({
                                open: true,
                                refund: r,
                                status: 'processed',
                                notes: '',
                                ref: `REF-${Date.now()}`
                              })
                            }
                          >
                            <CheckCircle2 size={14} />
                            <span>Process</span>
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title="Reject Refund"
                            onClick={() =>
                              setProcessRefundModal({
                                open: true,
                                refund: r,
                                status: 'rejected',
                                notes: 'Insufficient evidence',
                                ref: ''
                              })
                            }
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Merchant & Rider Payouts */}
      {activeTab === 'payouts' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              className={`admin-btn ${payoutType === 'restaurant' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              onClick={() => setPayoutType('restaurant')}
            >
              Restaurant Merchant Payouts
            </button>
            <button
              className={`admin-btn ${payoutType === 'rider' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              onClick={() => setPayoutType('rider')}
            >
              Rider Delivery Earnings Payouts
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Payout Amount</th>
                  <th>Reference ID</th>
                  <th>Status</th>
                  <th>Processed Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingPayouts ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                      Loading disbursement records...
                    </td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                      No {payoutType} payouts recorded.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>{payoutType === 'restaurant' ? p.restaurant?.name : p.rider?.name}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#15803D' }}>
                          {formatPrice(payoutType === 'restaurant' ? p.netPayable : p.amount)}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {p.transactionReference}
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-success">{p.status?.toUpperCase()}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                        {new Date(p.processedAt || p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {processRefundModal.open && processRefundModal.refund && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {processRefundModal.status === 'processed' ? 'Process Refund' : 'Reject Refund Request'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setProcessRefundModal({ open: false, refund: null, status: 'processed', notes: '', ref: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Order #{processRefundModal.refund.orderNumber} - Amount:{' '}
                <strong>{formatPrice(processRefundModal.refund.amount)}</strong>
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Gateway / Bank Reference ID</label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="e.g. RZ_REF_98124801"
                  value={processRefundModal.ref}
                  onChange={(e) => setProcessRefundModal({ ...processRefundModal, ref: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Notes for Audit Log</label>
                <textarea
                  rows="2"
                  className="admin-form-control"
                  placeholder="e.g. Refund approved via original payment method..."
                  value={processRefundModal.notes}
                  onChange={(e) => setProcessRefundModal({ ...processRefundModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setProcessRefundModal({ open: false, refund: null, status: 'processed', notes: '', ref: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${processRefundModal.status === 'processed' ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                onClick={handleProcessRefundSubmit}
              >
                Confirm {processRefundModal.status}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
