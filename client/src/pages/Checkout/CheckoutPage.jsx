import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Plus,
  ShoppingBag,
  CreditCard,
  Banknote,
  CheckCircle2,
  Tag,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { clearCart, fetchCart } from '../../features/cart/cartSlice';
import AddressSelectorModal from '../../components/checkout/AddressSelectorModal';

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = resolve;
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout. Please try again.'));
  document.body.appendChild(script);
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, restaurant, subtotal, deliveryFee, taxes, discount, finalAmount, appliedCoupon } =
    useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (res.data.data.length > 0) {
          setSelectedAddressId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };

    fetchAddresses();
    dispatch(fetchCart());
  }, [dispatch]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please choose or add a delivery address.');
      setIsAddressModalOpen(true);
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add food before placing an order.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Create Order on Server
      const orderRes = await api.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod,
        specialInstructions
      });

      const order = orderRes.data.data;

      // Handle Online Payment (Razorpay)
      if (paymentMethod === 'razorpay') {
        await loadRazorpayCheckout();

        const razorOrderRes = await api.post('/payments/create-order', {
          orderId: order._id,
          amount: order.pricing.finalAmount,
          receipt: `rcpt_${order.orderNumber}`
        });

        const rzpData = razorOrderRes.data.data;
        const paymentResponse = await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({
            key: razorOrderRes.data.keyId,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: 'FoodDelight',
            description: `Order ${order.orderNumber}`,
            order_id: rzpData.id,
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone
            },
            handler: resolve,
            modal: {
              ondismiss: () => reject(new Error('Payment was cancelled.'))
            }
          });

          checkout.on('payment.failed', (response) => {
            reject(new Error(response.error?.description || 'Razorpay payment failed.'));
          });
          checkout.open();
        });

        await api.post('/payments/verify', {
          orderId: order._id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        });
      }

      // Fire festive celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Clear Redux Cart
      dispatch(clearCart());

      // Navigate directly to Live Order Tracking!
      navigate(`/orders/${order._id}/track?placed=true`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={54} className="text-muted" strokeWidth={1.5} style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 1.5rem' }}>
          Explore our top restaurants and add delicious dishes before checking out!
        </p>
        <Link to="/restaurants" className="btn btn-primary">
          Explore Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="container">
        <div className="checkout-header">
          <h1 className="checkout-page-title">Secure Checkout</h1>
          <p className="checkout-page-sub">Review your order and select delivery options</p>
        </div>

        <div className="checkout-layout-grid">
          {/* Left Column: Steps */}
          <div className="checkout-steps-col">
            {/* Step 1: Delivery Address */}
            <div className="checkout-card">
              <div className="step-title-row">
                <div className="step-number">1</div>
                <div>
                  <h3 className="step-heading">Delivery Address</h3>
                  <p className="step-sub">Select where you want your hot food delivered</p>
                </div>
              </div>

              {selectedAddress ? (
                <div className="selected-address-card">
                  <div className="addr-badge">
                    <MapPin size={16} className="text-orange" />
                    <span>Deliver to {selectedAddress.label}</span>
                  </div>
                  <h4 className="addr-recip-name">
                    {selectedAddress.recipientName} • {selectedAddress.phone}
                  </h4>
                  <p className="addr-street-line">
                    {selectedAddress.houseNo}, {selectedAddress.street}, {selectedAddress.area}, {selectedAddress.city} - {selectedAddress.pincode}
                  </p>
                  {selectedAddress.deliveryInstructions && (
                    <p className="addr-note-line">
                      Instructions: {selectedAddress.deliveryInstructions}
                    </p>
                  )}
                  <button
                    className="btn-change-addr"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    Change or Add Address
                  </button>
                </div>
              ) : (
                <div className="no-address-box">
                  <p>No delivery address selected.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    <Plus size={16} />
                    <span>Add Delivery Address</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="checkout-card">
              <div className="step-title-row">
                <div className="step-number">2</div>
                <div>
                  <h3 className="step-heading">Payment Method</h3>
                  <p className="step-sub">Choose your preferred payment option</p>
                </div>
              </div>

              <div className="payment-options-grid">
                {/* Razorpay Online */}
                <label
                  className={`payment-option-card ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <div className="pay-radio">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                  </div>
                  <div className="pay-icon-box">
                    <CreditCard size={22} className="text-orange" />
                  </div>
                  <div className="pay-details">
                    <div className="pay-title-row">
                      <span className="pay-title">Razorpay Online Payment</span>
                      <span className="secure-badge">Recommended</span>
                    </div>
                    <p className="pay-sub">
                      UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Netbanking
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="pay-radio">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                  </div>
                  <div className="pay-icon-box">
                    <Banknote size={22} className="text-success" />
                  </div>
                  <div className="pay-details">
                    <span className="pay-title">Cash on Delivery (COD)</span>
                    <p className="pay-sub">Pay in cash or UPI when your delivery partner arrives</p>
                  </div>
                </label>
              </div>

              {/* Security Assurance */}
              <div className="security-assurance-bar">
                <ShieldCheck size={18} className="text-success" />
                <span>256-bit Bank Grade SSL Encryption • 100% Buyer Protection</span>
              </div>
            </div>

            {/* Step 3: Cooking / Delivery Notes */}
            <div className="checkout-card">
              <div className="step-title-row">
                <div className="step-number">3</div>
                <div>
                  <h3 className="step-heading">Special Delivery Notes</h3>
                  <p className="step-sub">Optional instructions for the rider</p>
                </div>
              </div>

              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g. Ring the doorbell twice, please do not call if sleeping baby..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="checkout-summary-col">
            <div className="checkout-card order-summary-card">
              {/* Restaurant Header */}
              {restaurant && (
                <div className="summary-restaurant-header">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="summary-rest-img"
                  />
                  <div>
                    <h4 className="summary-rest-name">{restaurant.name}</h4>
                    <p className="summary-rest-time">Estimated Delivery: {restaurant.deliveryTime || '30 mins'}</p>
                  </div>
                </div>
              )}

              <div className="summary-divider" />

              {/* Items List */}
              <div className="summary-items-list">
                {items.map((item) => (
                  <div key={item._id} className="summary-item-row">
                    <div className="item-title-col">
                      <div className="item-main-row">
                        <span className={`diet-icon ${item.isVeg ? 'veg' : 'non-veg'}`} />
                        <span className="summary-item-name">{item.name}</span>
                        <span className="summary-item-qty">x {item.quantity}</span>
                      </div>
                      {item.size && (
                        <span className="summary-custom-text">Size: {item.size.name}</span>
                      )}
                      {item.addOns && item.addOns.length > 0 && (
                        <span className="summary-custom-text">
                          + {item.addOns.map((a) => a.name).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="summary-item-price">
                      ₹{Math.round(item.itemTotal / 100)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              {/* Bill Details */}
              <div className="summary-bill">
                <div className="summary-bill-row">
                  <span>Item Subtotal</span>
                  <span>₹{Math.round(subtotal / 100)}</span>
                </div>

                <div className="summary-bill-row">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong className="text-success">FREE</strong>
                    ) : (
                      `₹${Math.round(deliveryFee / 100)}`
                    )}
                  </span>
                </div>

                <div className="summary-bill-row">
                  <span>Taxes (5% GST)</span>
                  <span>₹{Math.round(taxes / 100)}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-bill-row text-success">
                    <span>Discount ({appliedCoupon?.code || 'Promo'})</span>
                    <strong>-₹{Math.round(discount / 100)}</strong>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-bill-row final-total-row">
                  <span>Total Payable</span>
                  <span className="final-total-amount">₹{Math.round(finalAmount / 100)}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="checkout-error-box">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Place Order CTA */}
              <button
                className="btn btn-primary btn-lg btn-place-order"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Confirming Order...' : 'Confirm & Place Order'}</span>
                <span className="btn-amount-badge">₹{Math.round(finalAmount / 100)}</span>
              </button>

              <p className="checkout-terms-note">
                By clicking Confirm, you agree to FoodDelight's Terms of Service & Cancellation Policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selector / Creator Modal */}
      <AddressSelectorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(id) => setSelectedAddressId(id)}
        onAddressAdded={(newAddr) => {
          setAddresses([newAddr, ...addresses]);
          setSelectedAddressId(newAddr._id);
        }}
      />
    </div>
  );
}

