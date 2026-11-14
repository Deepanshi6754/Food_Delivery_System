import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, CheckCircle2 } from 'lucide-react';
import { updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon } from '../../features/cart/cartSlice';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, restaurant, subtotal, deliveryFee, taxes, discount, finalAmount, appliedCoupon } =
    useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={54} className="text-muted" strokeWidth={1.5} style={{ margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 1.5rem' }}>
          Explore restaurants and add fresh delicious food to your cart!
        </p>
        <Link to="/restaurants" className="btn btn-primary">
          Explore Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1 className="page-heading">Your Food Cart</h1>
            <p className="page-sub">Review your selections from {restaurant?.name}</p>
          </div>
          <button className="btn btn-outline btn-sm text-danger" onClick={() => dispatch(clearCart())}>
            <Trash2 size={15} />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="checkout-layout-grid">
          {/* Items List */}
          <div className="checkout-steps-col">
            <div className="checkout-card">
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item._id} className="cart-item-row">
                    <span className={`diet-icon ${item.isVeg ? 'veg' : 'non-veg'}`} />
                    <div className="item-info-col">
                      <h4 className="item-name">{item.name}</h4>
                      {item.size && <span className="item-custom-tag">Size: {item.size.name}</span>}
                      {item.addOns && item.addOns.length > 0 && (
                        <span className="item-custom-tag">
                          + {item.addOns.map((a) => a.name).join(', ')}
                        </span>
                      )}
                      <span className="item-price">₹{Math.round(item.itemTotal / 100)}</span>
                    </div>

                    <div className="item-qty-col">
                      <div className="qty-stepper">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                itemId: item._id,
                                quantity: item.quantity - 1
                              })
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                itemId: item._id,
                                quantity: item.quantity + 1
                              })
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="item-delete-btn"
                        onClick={() => dispatch(removeItem(item._id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="checkout-summary-col">
            <div className="checkout-card">
              <h3 className="bill-title">Order Summary</h3>

              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal / 100)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-success">FREE</strong> : `₹${Math.round(deliveryFee / 100)}`}</span>
              </div>
              <div className="bill-row">
                <span>Taxes (5% GST)</span>
                <span>₹{Math.round(taxes / 100)}</span>
              </div>
              {discount > 0 && (
                <div className="bill-row text-success">
                  <span>Coupon Savings</span>
                  <span>-₹{Math.round(discount / 100)}</span>
                </div>
              )}

              <div className="bill-divider" />

              <div className="bill-row total-row">
                <span className="total-label">Total Amount</span>
                <span className="total-amount">₹{Math.round(finalAmount / 100)}</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1.25rem' }}
                onClick={() => navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout')}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

