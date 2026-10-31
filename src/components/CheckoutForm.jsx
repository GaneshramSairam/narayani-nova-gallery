import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { INDIAN_STATES_AND_UTS, calculateDeliveryCharge } from '../utils/deliveryUtils';
import upiQrPlaceholder from '../assets/upi-qr-placeholder.png';

const CheckoutForm = ({ onCancel, onSuccess }) => {
  const { cartTotal, clearCart, cartItems } = useCart();
  const { qrCode, addOrder, deliverySettings } = useAdmin();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu', // Initial default state
    pincode: ''
  });

  // Calculate delivery charge dynamically from Super Admin deliverySettings
  const deliveryInfo = useMemo(() => {
    return calculateDeliveryCharge(formData.state, cartTotal, deliverySettings, cartItems);
  }, [formData.state, cartTotal, deliverySettings]);

  const deliveryCharge = deliveryInfo.charge;
  const grandTotal = cartTotal + deliveryCharge;

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.state) {
      alert('Please fill in all required fields (Name, Phone, Street Address, and State)');
      return;
    }
    setStep(2);
  };

  const handlePaymentConfirm = async () => {
    setIsProcessing(true);
    // Simulate payment verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fullAddress = `${formData.address.trim()}${formData.city ? ', ' + formData.city.trim() : ''}, ${formData.state}${formData.pincode ? ' - ' + formData.pincode.trim() : ''}`;

    const orderDetails = {
      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: fullAddress,
        streetAddress: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        pincode: formData.pincode.trim()
      },
      items: [...cartItems],
      subtotal: cartTotal,
      deliveryCharge: deliveryCharge,
      shippingState: formData.state,
      total: grandTotal
    };

    // Save order to Admin Context
    const newOrder = addOrder(orderDetails);

    setIsProcessing(false);
    clearCart();
    onSuccess(newOrder);
  };

  return (
    <div className="checkout-form">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <button className="back-btn" onClick={step === 1 ? onCancel : () => setStep(1)}>
          {step === 1 ? 'Back to Cart' : 'Back to Details'}
        </button>
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span>Items Subtotal:</span>
          <span>₹{cartTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row delivery-row">
          <span>Delivery Charges:</span>
          <span className={deliveryCharge === 0 ? 'free-tag' : ''}>
            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
          </span>
        </div>
        {deliveryInfo.reason && (
          <div className="delivery-reason">✨ {deliveryInfo.reason}</div>
        )}
        {!deliveryInfo.isFree && deliveryInfo.tipMessage && (
          <div className="delivery-tip-banner">
            ✨ {deliveryInfo.tipMessage}
          </div>
        )}
        {!deliveryInfo.isFree && (
          <div className="delivery-notice-sub">
            🚚 Free delivery on orders above ₹5,000 for Narayani Gallery & above ₹10,000 for Signature Sarees.
          </div>
        )}
        <div className="summary-divider"></div>
        <div className="summary-row total-row">
          <span>Total Amount:</span>
          <span className="total-price">₹{grandTotal.toFixed(2)}</span>
        </div>
        {cartItems.reduce((acc, item) => acc + ((item.basePrice || item.price) - item.price) * item.quantity, 0) > 0 && (
          <p className="savings-text">
            You are saving <span className="savings-amount">₹{cartItems.reduce((acc, item) => acc + ((item.basePrice || item.price) - item.price) * item.quantity, 0).toFixed(2)}</span> on this order!
          </p>
        )}
      </div>

      {step === 1 ? (
        <form onSubmit={handleDetailsSubmit} noValidate>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ananya Sundaram"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="form-group">
            <label>Email Address (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ananya@example.com"
            />
          </div>

          <div className="form-group">
            <label>Street Address *</label>
            <textarea
              required
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Flat / Door No, Apartment or House Name, Street"
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>City / Town</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Chennai"
              />
            </div>

            <div className="form-group">
              <label>PIN Code</label>
              <input
                type="text"
                maxLength="6"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="600028"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Shipping State / UT *</label>
            <select
              className="state-select"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            >
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <span className="form-hint">Delivery charges applicable. Free delivery on orders above ₹5,000 for Narayani Gallery and above ₹10,000 for Signature Sarees.</span>
          </div>

          <button type="submit" className="pay-btn">
            Proceed to Payment (₹{grandTotal.toFixed(2)})
          </button>
        </form>
      ) : (
        <div className="payment-step">
          <div className="qr-container">
            <p className="scan-instruction">Scan QR Code to Pay</p>
            <div className="qr-wrapper">
              <img src={qrCode || upiQrPlaceholder} alt="UPI QR Code" />
            </div>
            <p className="upi-id">UPI ID: narayani@upi (Verified)</p>
          </div>

          <div className="payment-actions">
            <div className="payment-breakdown-box">
              <div className="pay-row"><span>Items:</span> <span>₹{cartTotal.toFixed(2)}</span></div>
              <div className="pay-row"><span>Delivery Charges:</span> <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span></div>
              <div className="pay-row pay-row-total"><span>Total Payable:</span> <span>₹{grandTotal.toFixed(2)}</span></div>
            </div>

            <p className="confirm-text">
              Please scan the QR code above and pay <strong>₹{grandTotal.toFixed(2)}</strong>.
              <br />
              Once completed, click the button below.
            </p>
            <button
              className="pay-btn"
              onClick={handlePaymentConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying...' : `I have paid ₹${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .checkout-form {
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .checkout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .checkout-header h2 {
          color: var(--color-primary-glow);
          margin: 0;
          font-family: var(--font-heading, serif);
        }

        .back-btn {
          background: transparent;
          color: var(--color-gold-mid);
          border: 1px solid var(--color-gold-mid);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          color: var(--color-gold-highlight);
          border-color: var(--color-gold-highlight);
        }

        .order-summary {
          background: rgba(42, 5, 7, 0.6);
          padding: 1.2rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(212, 175, 55, 0.25);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
          color: var(--color-gold-soft);
          margin-bottom: 0.4rem;
        }

        .delivery-row {
          font-size: 0.9rem;
        }

        .free-tag {
          color: #4cd964;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .delivery-reason {
          font-size: 0.82rem;
          color: #4cd964;
          font-weight: 600;
          margin-top: 0.3rem;
          margin-bottom: 0.3rem;
          background: rgba(76, 217, 100, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .delivery-tip-banner {
          font-size: 0.8rem;
          color: #f8e79c;
          background: rgba(212, 175, 55, 0.15);
          border: 1px dashed rgba(212, 175, 55, 0.4);
          padding: 5px 8px;
          border-radius: 4px;
          margin-top: 0.3rem;
          margin-bottom: 0.3rem;
        }

        .delivery-notice-sub {
          font-size: 0.78rem;
          color: var(--color-gold-soft);
          opacity: 0.85;
          margin-top: 0.2rem;
          margin-bottom: 0.3rem;
        }

        .summary-divider {
          height: 1px;
          background: rgba(212, 175, 55, 0.2);
          margin: 0.6rem 0;
        }

        .total-row {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-gold-highlight);
          margin-bottom: 0;
        }

        .total-price {
          color: var(--color-gold-highlight);
          font-weight: 700;
          font-size: 1.3rem;
        }

        .savings-text {
          margin-top: 0.6rem;
          font-size: 0.85rem;
          color: #4cd964;
          text-align: right;
        }

        .savings-amount {
          font-weight: 700;
        }

        .form-row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.4rem;
          color: var(--color-gold-soft);
          font-size: 0.88rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .state-select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(30, 4, 6, 0.7);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: var(--radius-sm);
          color: #fff;
          font-family: inherit;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
        }

        .state-select {
          cursor: pointer;
        }

        .state-select option {
          background: #2a0507;
          color: #fff;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .state-select:focus {
          outline: none;
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .form-hint {
          display: block;
          font-size: 0.78rem;
          color: var(--color-text-muted);
          margin-top: 0.3rem;
        }

        .pay-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #D4AF37 0%, #B08D1E 100%);
          color: #2a0507;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 1.05rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
          background: linear-gradient(135deg, #F8E79C 0%, #D4AF37 100%);
        }

        .pay-btn:disabled {
          background: var(--color-surface);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          cursor: not-allowed;
          box-shadow: none;
        }

        .payment-step {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .payment-breakdown-box {
          background: rgba(42, 5, 7, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 8px;
          padding: 0.8rem 1rem;
          margin-bottom: 1rem;
          width: 100%;
        }

        .pay-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--color-gold-soft);
          margin-bottom: 0.3rem;
        }

        .pay-row-total {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-gold-highlight);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          padding-top: 0.4rem;
          margin-top: 0.4rem;
        }

        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          background: #fff;
          padding: 1.5rem;
          border-radius: var(--radius-md);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .scan-instruction {
          color: #1a0b0e;
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .qr-wrapper img {
          width: 200px;
          height: 200px;
          object-fit: contain;
        }

        .upi-id {
          color: #444;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 1rem;
        }

        .payment-actions {
          width: 100%;
        }

        .confirm-text {
          color: var(--color-text-muted);
          text-align: center;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default CheckoutForm;
