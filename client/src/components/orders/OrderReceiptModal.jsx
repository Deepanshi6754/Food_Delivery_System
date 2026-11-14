import React from 'react';
import { X, Printer, CheckCircle2, MapPin, Receipt, UtensilsCrossed } from 'lucide-react';

export default function OrderReceiptModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Receipt Header Actions */}
        <div className="receipt-actions-header">
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="receipt-printable-body">
          <div className="receipt-brand-row">
            <div className="brand-logo">
              <div className="brand-icon">
                <UtensilsCrossed size={18} color="#FFFFFF" />
              </div>
              <div className="brand-text">
                <span>Food</span>
                <span className="text-orange">Delight</span>
              </div>
            </div>
            <div className="receipt-meta-right">
              <span className="invoice-tag">TAX INVOICE</span>
              <span className="receipt-order-no">Order #{order.orderNumber}</span>
              <span className="receipt-date">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Restaurant & Customer Info Grid */}
          <div className="receipt-info-grid">
            <div className="receipt-info-col">
              <span className="info-col-label">RESTAURANT</span>
              <h4 className="info-entity-name">{order.restaurant.name}</h4>
              <p className="info-entity-address">
                {order.restaurant.address?.street}, {order.restaurant.address?.area}, {order.restaurant.address?.city}
              </p>
            </div>

            <div className="receipt-info-col">
              <span className="info-col-label">DELIVERED TO</span>
              <h4 className="info-entity-name">{order.deliveryAddress.recipientName}</h4>
              <p className="info-entity-address">
                {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area},{' '}
                {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </p>
              <p className="info-phone">Phone: {order.deliveryAddress.phone}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="table-item-name">{item.name}</span>
                    {item.size && <span className="table-item-sub">({item.size.name})</span>}
                    {item.addOns && item.addOns.length > 0 && (
                      <span className="table-item-sub"> + {item.addOns.map((a) => a.name).join(', ')}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{Math.round(item.price / 100)}</td>
                  <td style={{ textAlign: 'right' }}>₹{Math.round(item.itemTotal / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="receipt-totals-box">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>₹{Math.round(order.pricing.subtotal / 100)}</span>
            </div>
            <div className="totals-row">
              <span>Delivery Fee</span>
              <span>
                {order.pricing.deliveryFee === 0 ? 'FREE' : `₹${Math.round(order.pricing.deliveryFee / 100)}`}
              </span>
            </div>
            <div className="totals-row">
              <span>Taxes & GST (5%)</span>
              <span>₹{Math.round(order.pricing.taxes / 100)}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="totals-row text-success">
                <span>Discount ({order.couponApplied || 'Coupon'})</span>
                <span>-₹{Math.round(order.pricing.discount / 100)}</span>
              </div>
            )}
            <div className="totals-divider" />
            <div className="totals-row grand-total">
              <span>Total Paid</span>
              <span>₹{Math.round(order.pricing.finalAmount / 100)}</span>
            </div>
            <div className="payment-method-badge">
              <span>Paid via {order.payment.method?.toUpperCase()}</span>
              <CheckCircle2 size={14} className="text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

