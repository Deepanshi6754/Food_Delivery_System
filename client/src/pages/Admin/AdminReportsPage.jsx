import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  Bike
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/reports', {
        params: { reportType, startDate, endDate }
      });
      if (res.data.success) {
        setReportData(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const formatPrice = (paise) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // 1-Click Client-side CSV Download Generator
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'sales') {
      csvContent += 'Date,Total Orders,Gross Sales (INR),Food Subtotal (INR),Delivery Fees (INR),Taxes (INR),Discounts (INR)\n';
      reportData.forEach((row) => {
        csvContent += `"${row._id}",${row.totalOrders},${(row.grossSales / 100).toFixed(2)},${(row.itemSubtotal / 100).toFixed(2)},${(row.deliveryFees / 100).toFixed(2)},${(row.taxes / 100).toFixed(2)},${(row.discounts / 100).toFixed(2)}\n`;
      });
    } else if (reportType === 'restaurants') {
      csvContent += 'Restaurant Name,City,Commission Rate (%),Delivered Orders,Food Sales (INR),Gross Total (INR),Platform Fee (INR)\n';
      reportData.forEach((row) => {
        csvContent += `"${row.restaurantName}","${row.city || 'Delhi'}",${row.commissionRate},${row.totalDeliveredOrders},${(row.totalSales / 100).toFixed(2)},${(row.totalRevenue / 100).toFixed(2)},${(row.platformFeeEarned / 100).toFixed(2)}\n`;
      });
    } else if (reportType === 'riders') {
      csvContent += 'Rider Name,Phone,Deliveries Completed,Delivery Fee Earned (INR)\n';
      reportData.forEach((row) => {
        csvContent += `"${row.riderName}","${row.phone || ''}",${row.deliveriesCompleted},${(row.deliveryFeeEarned / 100).toFixed(2)}\n`;
      });
    } else if (reportType === 'refunds') {
      csvContent += 'Order Number,Customer Name,Customer Email,Amount (INR),Reason,Status,Date\n';
      reportData.forEach((row) => {
        csvContent += `"${row.orderNumber}","${row.customer?.name || ''}","${row.customer?.email || ''}",${(row.amount / 100).toFixed(2)},"${row.reason}","${row.status}","${new Date(row.createdAt).toLocaleDateString()}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fooddelight_${reportType}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Reports & Data Export</h1>
          <p className="admin-page-subtitle">
            Generate verifiable business intelligence audits, vendor performance statements, and downloadable CSVs
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Download CSV Report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="admin-form-label">Report Category</label>
            <select
              className="admin-form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sales">Platform Sales & Revenues</option>
              <option value="restaurants">Restaurant Vendor Performance</option>
              <option value="riders">Delivery Fleet Productivity</option>
              <option value="refunds">Customer Refund Audit Log</option>
            </select>
          </div>

          <div>
            <label className="admin-form-label">Start Date</label>
            <input
              type="date"
              className="admin-form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-form-label">End Date</label>
            <input
              type="date"
              className="admin-form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            style={{ height: '38px' }}
            onClick={fetchReport}
          >
            Apply Range
          </button>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="admin-table-container">
        {reportType === 'sales' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Delivered Orders</th>
                <th>Gross Merchandise Value</th>
                <th>Food Subtotal</th>
                <th>Delivery Fees</th>
                <th>Taxes (GST)</th>
                <th>Discounts Funded</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    Compiling sales report...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No sales recorded for the selected date range.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <strong>{row._id}</strong>
                    </td>
                    <td>{row.totalOrders}</td>
                    <td>
                      <strong style={{ color: '#15803D' }}>{formatPrice(row.grossSales)}</strong>
                    </td>
                    <td>{formatPrice(row.itemSubtotal)}</td>
                    <td>{formatPrice(row.deliveryFees)}</td>
                    <td>{formatPrice(row.taxes)}</td>
                    <td>-{formatPrice(row.discounts)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {reportType === 'restaurants' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Restaurant Name</th>
                <th>Operating City</th>
                <th>Commission Rate</th>
                <th>Orders Delivered</th>
                <th>Net Food Sales</th>
                <th>Total GMV</th>
                <th>Platform Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    Compiling restaurant performance report...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No restaurant activity recorded in range.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <strong>{row.restaurantName}</strong>
                    </td>
                    <td>{row.city || 'Delhi'}</td>
                    <td>
                      <span className="admin-badge admin-badge-info">{row.commissionRate}%</span>
                    </td>
                    <td>{row.totalDeliveredOrders}</td>
                    <td>{formatPrice(row.totalSales)}</td>
                    <td>{formatPrice(row.totalRevenue)}</td>
                    <td>
                      <strong style={{ color: '#15803D' }}>{formatPrice(row.platformFeeEarned)}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {reportType === 'riders' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Delivery Rider</th>
                <th>Phone Number</th>
                <th>Completed Deliveries</th>
                <th>Delivery Fees Disbursed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    Compiling fleet efficiency report...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No rider delivery activity in range.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <strong>{row.riderName}</strong>
                    </td>
                    <td>{row.phone || 'N/A'}</td>
                    <td>
                      <span className="admin-badge admin-badge-success">{row.deliveriesCompleted} orders</span>
                    </td>
                    <td>
                      <strong style={{ color: '#15803D' }}>{formatPrice(row.deliveryFeeEarned)}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {reportType === 'refunds' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer Name</th>
                <th>Refund Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    Compiling refund audit report...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No refund transactions in range.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <strong style={{ color: '#F97316' }}>#{row.orderNumber}</strong>
                    </td>
                    <td>{row.customer?.name}</td>
                    <td>
                      <strong style={{ color: '#DC2626' }}>{formatPrice(row.amount)}</strong>
                    </td>
                    <td>{row.reason}</td>
                    <td>
                      <span className="admin-badge admin-badge-info">{row.status?.toUpperCase()}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
