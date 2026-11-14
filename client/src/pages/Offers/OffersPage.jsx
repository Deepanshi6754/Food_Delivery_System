import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Copy, Check, Sparkles, Percent, Calendar } from 'lucide-react';
import api from '../../services/api';
import { applyCoupon } from '../../features/cart/cartSlice';

export default function OffersPage() {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await api.get('/coupons');
        setCoupons(res.data.data);
      } catch (err) {
        console.error('Failed to load coupons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleApplyToCart = async (code) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      handleCopy(code);
      window.dispatchEvent(
        new CustomEvent('show_toast', {
          detail: `Coupon "${code}" copied! Add delicious food to your cart to apply.`
        })
      );
      return;
    }

    const res = await dispatch(applyCoupon(code));
    if (applyCoupon.fulfilled.match(res)) {
      setAppliedCode(code);
      window.dispatchEvent(
        new CustomEvent('show_toast', {
          detail: `Success! Coupon "${code}" applied to your cart!`
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent('show_toast', {
          detail: res.payload || 'Coupon could not be applied'
        })
      );
    }
  };

  return (
    <div className="offers-page-wrapper">
      <div className="container">
        {/* Header Banner */}
        <div className="offers-hero-banner">
          <div className="offers-badge">
            <Sparkles size={16} className="text-orange" />
            <span>Exclusive Savings</span>
          </div>
          <h1 className="offers-title">FoodDelight Coupons & Offers</h1>
          <p className="offers-subtitle">
            Save big on your favourite meals with verified promotional deals and discounts.
          </p>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="coupons-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : (
          <div className="coupons-grid">
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              const isApplied = cart?.appliedCoupon?.code === coupon.code;

              return (
                <div key={coupon._id} className="coupon-ticket-card">
                  <div className="ticket-left">
                    <div className="ticket-discount-tag">
                      {coupon.flatDiscount > 0 ? (
                        <>₹{Math.round(coupon.flatDiscount / 100)} OFF</>
                      ) : (
                        <>{coupon.discountPercentage}% OFF</>
                      )}
                    </div>
                    <span className="ticket-code">{coupon.code}</span>
                  </div>

                  <div className="ticket-body">
                    <p className="ticket-desc">{coupon.description}</p>
                    <div className="ticket-meta">
                      <span>Min Order: ₹{Math.round(coupon.minOrderValue / 100)}</span>
                      {coupon.maxDiscount > 0 && (
                        <span> • Max Discount: ₹{Math.round(coupon.maxDiscount / 100)}</span>
                      )}
                    </div>
                  </div>

                  <div className="ticket-actions">
                    <button
                      className={`btn btn-sm ${isCopied ? 'btn-secondary' : 'btn-outline'}`}
                      onClick={() => handleCopy(coupon.code)}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApplyToCart(coupon.code)}
                      disabled={isApplied}
                    >
                      {isApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

