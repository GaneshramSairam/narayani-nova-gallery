import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import upiQrPlaceholder from '../assets/upi-qr-placeholder.png';

const CheckoutForm = ({ onCancel, onSuccess }) => {
  const { cartTotal, clearCart, cartItems } = useCart();
  const { qrCode, addOrder } = useAdmin();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentConfirm = async () => {
    setIsProcessing(true);
    // Simulate payment verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderDetails = {
      customer: { ...formData },
      items: [...cartItems],
      total: cartTotal
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
        <p>Total Amount: <span className="total-price">₹{cartTotal.toFixed(2)}</span></p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleDetailsSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="form-group">
            <label>Shipping Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Gallery St, Art City"
            />
          </div>

          <button type="submit" className="pay-btn">
            Proceed to Payment
          </button>
        </form>
      ) : (
        <div className="payment-step">
          <div className="qr-container">
            <p className="scan-instruction">Scan QR Code to Pay</p>
            <div className="qr-wrapper">
              <img src={qrCode || upiQrPlaceholder} alt="UPI QR Code" />
            </div>
            <p className="upi-id">UPI ID: narayani@upi (Example)</p>
          </div>

          <div className="payment-actions">
            <p className="confirm-text">
              Please scan the QR code above and pay <strong>₹{cartTotal.toFixed(2)}</strong>.
              <br />
              Once completed, click the button below.
            </p>
            <button
              className="pay-btn"
              onClick={handlePaymentConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying...' : 'I have paid'}
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
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .checkout-header h2 {
          color: var(--color-primary-glow);
          margin: 0;
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
          background: var(--color-bg);
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          border: 1px solid var(--color-border);
        }

        .total-price {
          color: var(--color-primary-glow);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text);
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .pay-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(to bottom, #D4AF37, #B08D1E);
          color: #4C0B0D;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 1.1rem;
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
          background: linear-gradient(to bottom, #F8E79C, #D4AF37);
        }

        .pay-btn:disabled {
          background: var(--color-surface);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          cursor: not-allowed;
          box-shadow: none;
        }

        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }

        .scan-instruction {
          color: #1a0b0e;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .qr-wrapper img {
          width: 200px;
          height: 200px;
          object-fit: contain;
        }

        .upi-id {
          color: #555;
          font-size: 0.9rem;
          margin-top: 1rem;
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
