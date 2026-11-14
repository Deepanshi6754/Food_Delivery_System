import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  toggleSidebar,
  updateQuantity,
  removeItem,
  applyCoupon,
  removeCoupon
} from '../../features/cart/cartSlice';

export default function CartSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isSidebarOpen,
    items,
    restaurant,
    subtotal,
    deliveryFee,
    taxes,
    discount,
    finalAmount,
    appliedCoupon,
    loading
  } = useSelector((state) => state.cart);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isSidebarOpen) return null;

  const freeDeliveryThreshold = 50000; // ₹500 in paise
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    const result = await dispatch(applyCoupon(couponCode.trim()));
    if (applyCoupon.rejected.match(result)) {
      setCouponError(result.payload || 'Invalid coupon code');
    } else {
      setCouponCode('');
    }
  };

  const handleProceedToCheckout = () => {
    dispatch(toggleSidebar(false));
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => dispatch(toggleSidebar(false))}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={20} className="text-orange" />
            <h3 className="drawer-title">My Cart</h3>
            {items.length > 0 && (
              <span className="cart-items-count">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            )}
          </div>
          <button
            className="btn-close"
            onClick={() => dispatch(toggleSidebar(false))}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="empty-cart-view">
            <div className="empty-cart-icon">
              <ShoppingBag size={48} className="text-muted" strokeWidth={1.5} />
            </div>
            <h4 className="empty-cart-title">Your cart is empty</h4>
            <p className="empty-cart-desc">
              Explore our top-rated restaurants and add delicious food to satisfy your cravings!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                dispatch(toggleSidebar(false));
                navigate('/restaurants');
              }}
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          /* Populated Cart */
          <div className="drawer-body">
            {/* Restaurant Info Header */}
            {restaurant && (
              <div className="cart-restaurant-card">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="cart-rest-img"
                />
                <div className="cart-rest-details">
                  <h4 className="cart-rest-name">{restaurant.name}</h4>
                  <p className="cart-rest-time">Estimated Delivery: {restaurant.deliveryTime || '30 mins'}</p>
                </div>
              </div>
            )}

            {/* Free Delivery Milestone Progress */}
            <div className="free-delivery-milestone">
              <div className="milestone-text-row">
                <Sparkles size={16} className="text-orange" />
                <span className="milestone-text">
                  {subtotal >= freeDeliveryThreshold ? (
                    <strong className="text-success">Woohoo! You have unlocked FREE Delivery!</strong>
                  ) : (
                    <>
                      Add <strong>₹{Math.round(remainingForFreeDelivery / 100)}</strong> more for <strong>FREE Delivery</strong>
                    </>
                  )}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item._id} className="cart-item-row">
                  <div className="item-diet-col">
                    <span className={`diet-icon ${item.isVeg ? 'veg' : 'non-veg'}`} />
                  </div>

                  <div className="item-info-col">
                    <h5 className="item-name">{item.name}</h5>
                    {item.size && (
                      <span className="item-custom-tag">Size: {item.size.name}</span>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <span className="item-custom-tag">
                        + {item.addOns.map((a) => a.name).join(', ')}
                      </span>
                    )}
                    {item.specialInstructions && (
                      <p className="item-note">Note: {item.specialInstructions}</p>
                    )}
                    <span className="item-price">
                      ₹{Math.round(item.itemTotal / 100)}
                    </span>
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
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon / Promo Code Box */}
            <div className="coupon-section">
              {appliedCoupon && appliedCoupon.code ? (
                <div className="applied-coupon-box">
                  <div className="applied-coupon-left">
                    <CheckCircle2 size={18} className="text-success" />
                    <div>
                      <span className="applied-coupon-code">{appliedCoupon.code}</span>
                      <p className="applied-coupon-saving">
                        You saved ₹{Math.round(discount / 100)} on this order!
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-remove-coupon"
                    onClick={() => dispatch(removeCoupon())}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-form" onSubmit={handleApplyCoupon}>
                  <div className="coupon-input-wrapper">
                    <Tag size={16} className="coupon-icon" />
                    <input
                      type="text"
                      placeholder="Enter promo coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="coupon-input"
                    />
                    <button type="submit" className="btn-apply-coupon">
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="coupon-error-msg">
                      <AlertCircle size={13} />
                      <span>{couponError}</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Bill Details Breakdown */}
            <div className="bill-card">
              <h5 className="bill-title">Bill Details</h5>

              <div className="bill-row">
                <span className="bill-label">Item Total</span>
                <span className="bill-val">₹{Math.round(subtotal / 100)}</span>
              </div>

              <div className="bill-row">
                <span className="bill-label">Delivery Fee</span>
                <span className="bill-val">
                  {deliveryFee === 0 ? (
                    <span className="text-success font-bold">FREE</span>
                  ) : (
                    `₹${Math.round(deliveryFee / 100)}`
                  )}
                </span>
              </div>

              <div className="bill-row">
                <span className="bill-label">Taxes & Charges (5% GST)</span>
                <span className="bill-val">₹{Math.round(taxes / 100)}</span>
              </div>

              {discount > 0 && (
                <div className="bill-row discount-row">
                  <span className="bill-label text-success">Coupon Savings</span>
                  <span className="bill-val text-success font-bold">
                    -₹{Math.round(discount / 100)}
                  </span>
                </div>
              )}

              <div className="bill-divider" />

              <div className="bill-row total-row">
                <span className="total-label">To Pay</span>
                <span className="total-amount">₹{Math.round(finalAmount / 100)}</span>
              </div>
            </div>

            {/* Bottom Checkout CTA */}
            <div className="drawer-footer">
              <button
                className="btn btn-primary btn-checkout"
                onClick={handleProceedToCheckout}
              >
                <span>Proceed to Checkout</span>
                <span className="checkout-btn-amount">
                  ₹{Math.round(finalAmount / 100)} <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

