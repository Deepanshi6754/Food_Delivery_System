import React, { useState, useEffect } from 'react';
import {
  IndianRupee, TrendingUp, Calendar, Wallet,
  AlertCircle, ArrowDownCircle, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import riderApi from '../../services/riderApi';

const formatCurrency = (paise) => `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
const PAYOUT_METHODS = ['Bank Transfer', 'UPI'];

export default function RiderEarningsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'Bank Transfer' });
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await riderApi.get('/earnings/summary');
        setSummary(data.data);
      } catch (err) {
        setError('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawForm.amount) * 100; // convert to paise
    if (!amount || amount < 10000) {
      setWithdrawError('Minimum withdrawal is ₹100');
      return;
    }
    if (amount > (summary?.availableBalance || 0)) {
      setWithdrawError('Insufficient available balance');
      return;
    }
    setWithdrawing(true);
    setWithdrawError('');
    try {
      await riderApi.post('/earnings/withdraw', {
        amount,
        payoutMethod: withdrawForm.method.toLowerCase().replace(' ', '_')
      });
      setWithdrawSuccess('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', method: 'Bank Transfer' });
      // refresh
      const { data } = await riderApi.get('/earnings/summary');
      setSummary(data.data);
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="rider-stat-card">
              <div className="rider-skeleton" style={{ width: '44px', height: '44px', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div className="rider-skeleton" style={{ height: '12px', width: '70%', marginBottom: '8px' }} />
                <div className="rider-skeleton" style={{ height: '24px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rider-alert rider-alert-error">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  const statCards = [
    { label: "Today's Earnings", value: formatCurrency(summary?.todayEarnings), icon: IndianRupee, color: 'orange' },
    { label: 'Weekly Earnings', value: formatCurrency(summary?.weeklyEarnings), icon: Calendar, color: 'blue' },
    { label: 'Monthly Earnings', value: formatCurrency(summary?.monthlyEarnings), icon: TrendingUp, color: 'green' },
    { label: 'Total Earnings', value: formatCurrency(summary?.totalEarnings), icon: Wallet, color: 'purple' },
  ];

  return (
    <div>
      <div className="rider-page-header">
        <div>
          <div className="rider-page-title">Earnings</div>
          <div className="rider-page-subtitle">Track your income and payouts</div>
        </div>
      </div>

      {withdrawSuccess && (
        <div className="rider-alert rider-alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} />
          <span>{withdrawSuccess}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="rider-stat-card">
            <div className={`rider-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div className="rider-stat-info">
              <div className="rider-stat-label">{s.label}</div>
              <div className="rider-stat-value" style={{ fontSize: '18px' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Available Balance + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '24px' }}>
        {/* Available Balance */}
        <div className="rider-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)' }}>Available Balance</div>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--rider-success)' }}>
              {formatCurrency(summary?.availableBalance)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)', marginTop: '4px' }}>
              Ready to withdraw
            </div>
          </div>
          <button
            className="rider-btn rider-btn-primary rider-btn-full"
            onClick={() => setShowWithdrawModal(true)}
            disabled={!summary?.availableBalance || summary.availableBalance < 10000}
          >
            <ArrowDownCircle size={16} /> Withdraw Earnings
          </button>
          {(!summary?.availableBalance || summary.availableBalance < 10000) && (
            <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)', textAlign: 'center' }}>
              Minimum withdrawal: ₹100
            </div>
          )}
        </div>

        {/* Weekly Chart */}
        <div className="rider-card">
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Last 7 Days
          </div>
          {summary?.dailyBreakdown && summary.dailyBreakdown.length > 0 ? (
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.dailyBreakdown.map(d => ({
                  day: d.day || d.date,
                  amount: Math.round((d.amount || d.earnings || 0) / 100)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => [`₹${v}`, 'Earned']} />
                  <Bar dataKey="amount" fill="#F97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rider-empty-state" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--rider-text-secondary)', fontSize: '13px' }}>No earnings data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Payout History */}
      {summary?.payouts && summary.payouts.length > 0 && (
        <div className="rider-card" style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Payout History
          </div>
          <div className="rider-table-wrap">
            <table className="rider-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.payouts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--rider-success)' }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {(p.payoutMethod || '').replace('_', ' ')}
                    </td>
                    <td>
                      <span className={`rider-pill ${p.status === 'completed' ? 'rider-pill-success' : p.status === 'pending' ? 'rider-pill-warning' : 'rider-pill-gray'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Earnings Ledger */}
      {summary?.recentEarnings && summary.recentEarnings.length > 0 && (
        <div className="rider-card">
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Recent Earnings
          </div>
          <div className="rider-table-wrap">
            <table className="rider-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Delivery Fee</th>
                  <th>Tip</th>
                  <th>Bonus</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentEarnings.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '12px', color: 'var(--rider-text-secondary)' }}>
                      {e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>{formatCurrency(e.deliveryFee)}</td>
                    <td style={{ color: 'var(--rider-success)' }}>+{formatCurrency(e.tip || 0)}</td>
                    <td style={{ color: 'var(--rider-primary)' }}>+{formatCurrency(e.bonus || 0)}</td>
                    <td style={{ fontWeight: 700 }}>
                      {formatCurrency((e.deliveryFee || 0) + (e.tip || 0) + (e.bonus || 0) - (e.platformFee || 0))}
                    </td>
                    <td>
                      <span className={`rider-pill ${e.status === 'credited' ? 'rider-pill-success' : 'rider-pill-warning'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="rider-modal-overlay">
          <div className="rider-modal">
            <div className="rider-modal-header">
              <div className="rider-modal-title">Withdraw Earnings</div>
              <button className="rider-modal-close" onClick={() => { setShowWithdrawModal(false); setWithdrawError(''); }}>✕</button>
            </div>
            <div className="rider-modal-body">
              <div className="rider-alert rider-alert-info" style={{ marginBottom: '16px', fontSize: '13px' }}>
                Available balance: <strong>{formatCurrency(summary?.availableBalance)}</strong>
              </div>

              {withdrawError && (
                <div className="rider-alert rider-alert-error" style={{ marginBottom: '12px' }}>
                  <AlertCircle size={14} />
                  <span>{withdrawError}</span>
                </div>
              )}

              <div className="rider-form-group">
                <label className="rider-form-label">Amount (₹) <span>*</span></label>
                <input
                  type="number"
                  className="rider-form-input"
                  placeholder="e.g. 500"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  min="100"
                />
              </div>

              <div className="rider-form-group">
                <label className="rider-form-label">Payout Method <span>*</span></label>
                <select
                  className="rider-form-select"
                  value={withdrawForm.method}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, method: e.target.value })}
                >
                  {PAYOUT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="rider-modal-footer">
              <button className="rider-btn rider-btn-outline" onClick={() => { setShowWithdrawModal(false); setWithdrawError(''); }}>
                Cancel
              </button>
              <button
                className="rider-btn rider-btn-primary"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

