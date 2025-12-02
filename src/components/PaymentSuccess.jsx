import logo from '../assets/Naranis Nova updated complete logo.png';

const PaymentSuccess = ({ onClose, order }) => {
  return (
    <div className="success-container">
      <div className="success-icon">
        <img src={logo} alt="Narayani's Nova Gallery" className="success-logo" />
      </div>

      <h2>Order Received!</h2>

      <div className="message-box">
        <p className="main-msg">
          Thank you for shopping at Narayani’s Nova Gallery.
        </p>
        <p className="sub-msg">
          Your order has been received. Our team will verify your payment shortly.
          Once verified, we will contact you with confirmation.
        </p>
      </div>

      <div className="order-info">
        <p>Order ID: <strong>{order?.id}</strong></p>
        <p>Total: <strong>₹{order?.total.toFixed(2)}</strong></p>
      </div>

      <button className="close-btn" onClick={onClose}>
        Continue Shopping
      </button>

      <style>{`
        .success-container {
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          animation: fadeIn 0.5s ease;
        }

        .success-icon {
          margin-bottom: 1.5rem;
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .success-logo {
          width: 120px;
          height: auto;
          filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.4));
        }

        h2 {
          color: var(--color-primary-glow);
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }

        .message-box {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid var(--color-gold-mid);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          max-width: 400px;
        }

        .main-msg {
          font-size: 1.1rem;
          color: var(--color-text);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .sub-msg {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .order-info {
          margin-bottom: 2rem;
          color: var(--color-text-muted);
        }

        .order-info p {
          margin: 0.5rem 0;
        }

        .close-btn {
          background: transparent;
          color: var(--color-gold-highlight);
          border: 1px solid var(--color-gold-highlight);
          padding: 0.75rem 2rem;
          border-radius: 30px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .close-btn:hover {
          background: var(--color-gold-highlight);
          color: #1a0b0e;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
