import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ownerApi from '../../services/ownerApi';

export default function OwnerEarningsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setIsLoading(true);
        const res = await ownerApi.get('/earnings/summary');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching earnings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const handleDownloadCsv = () => {
    window.open('http://localhost:5000/api/v1/owner/earnings/export', '_blank');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#F97316', fontWeight: 700 }}>
        Loading financial summaries...
      </div>
    );
  }

  const { summary, payouts, monthlyBreakdown } = data || {};

  return (
    <div>
      {/* Header */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Revenue, Commission & Bank Payouts</h1>
          <p>Transparent accounting, platform fee breakdown, and settlement history.</p>
        </div>
        <button onClick={handleDownloadCsv} className="owner-btn-primary">
          <Download size={18} />
          <span>Export Financial Report (CSV)</span>
        </button>
      </div>

      {/* 4 Top Financial Cards */}
      <div className="owner-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon green">
              <DollarSign size={22} />
            </div>
            <span className="owner-stat-pill positive">Gross</span>
          </div>
          <div className="owner-stat-label">Total Store Sales</div>
          <div className="owner-stat-value">
            ₹{(((summary?.grossRevenue || 0) / 100)).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon orange">
              <CreditCard size={22} />
            </div>
            <span className="owner-stat-pill" style={{ background: '#FFEDD5', color: '#EA580C' }}>
              {summary?.commissionPercentage || 15}% Fee
            </span>
          </div>
          <div className="owner-stat-label">Platform Commission</div>
          <div className="owner-stat-value" style={{ color: '#EA580C' }}>
            -₹{(((summary?.platformCommission || 0) / 100)).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon green">
              <Wallet size={22} />
            </div>
            <span className="owner-stat-pill positive">Net</span>
          </div>
          <div className="owner-stat-label">Net Kitchen Earnings</div>
          <div className="owner-stat-value" style={{ color: '#15803D' }}>
            ₹{(((summary?.netEarnings || 0) / 100)).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon blue">
              <CheckCircle2 size={22} />
            </div>
            <span className="owner-stat-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              Transferred
            </span>
          </div>
          <div className="owner-stat-label">Settled Payouts</div>
          <div className="owner-stat-value">
            ₹{(((summary?.totalPaidOut || 0) / 100)).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="owner-card" style={{ marginBottom: '2rem' }}>
        <div className="owner-card-header">
          <div>
            <h2 className="owner-card-title">Monthly Revenue vs Net Earnings</h2>
            <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
              Monthly comparison showing gross billing vs actual net profit in ₹
            </span>
          </div>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="month" stroke="#78716C" />
              <YAxis stroke="#78716C" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'gross' ? 'Gross Sales' : name === 'commission' ? 'Platform Fee' : 'Net Takehome']}
                contentStyle={{ background: '#ffffff', border: '1px solid #E7E5E4', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="gross" name="Gross Sales" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" name="Platform Commission" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net Kitchen Profit" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Settlement / Payout History Table */}
      <div className="owner-card">
        <div className="owner-card-header">
          <h2 className="owner-card-title">Settlement & Bank Payout Records</h2>
        </div>

        <div className="owner-table-container">
          <table className="owner-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Settlement Cycle</th>
                <th>Orders</th>
                <th>Gross (₹)</th>
                <th>Commission (15%)</th>
                <th>Net Payable (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts && payouts.length > 0 ? (
                payouts.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 700, color: '#292524' }}>
                      {p.transactionReference}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#78716C' }}>
                      {new Date(p.period?.startDate).toLocaleDateString()} -{' '}
                      {new Date(p.period?.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.totalOrders}</td>
                    <td>₹{(p.grossRevenue / 100).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#DC2626' }}>
                      -₹{(p.commission / 100).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 800, color: '#15803D', fontSize: '1rem' }}>
                      ₹{(p.netPayable / 100).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`order-status-pill ${
                          p.status === 'completed' ? 'delivered' : 'preparing'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#78716C', padding: '2rem' }}>
                    No payout settlements processed yet. Settlements run weekly.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

