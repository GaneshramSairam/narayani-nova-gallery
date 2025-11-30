import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutForm from './CheckoutForm';
import PaymentSuccess from './PaymentSuccess';

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [view, setView] = useState('cart'); // 'cart', 'checkout', 'success'
  const [lastOrder, setLastOrder] = useState(null);

  // Reset view when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      const timer = setTimeout(() => setView('cart'), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const renderContent = () => {
    if (view === 'success') {
      return <PaymentSuccess onClose={() => setIsCartOpen(false)} order={lastOrder} />;
    }

    if (view === 'checkout') {
      return (
        <CheckoutForm
          onCancel={() => setView('cart')}
          onSuccess={(order) => {
            setLastOrder(order);
            setView('success');
          }}
        />
      );
    }

    return (
      <>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-msg">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.imageUrl} alt={item.title} />
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p className="price">${item.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="total">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button
            className="checkout-btn"
            disabled={cartItems.length === 0}
            onClick={() => setView('checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>

      <style>{`
        .cart-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
        }

        .cart-drawer {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface);
          height: 100%;
          box-shadow: -5px 0 15px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
          border-left: 1px solid var(--color-border);
        }

        .cart-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-header h2 {
          color: var(--color-primary-glow);
          margin: 0;
        }

        .close-btn {
          font-size: 2rem;
          color: var(--color-text-muted);
          line-height: 1;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .empty-msg {
          text-align: center;
          color: var(--color-text-muted);
          margin-top: 2rem;
        }

        .cart-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .cart-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }

        .item-details {
          flex: 1;
        }

        .item-details h3 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .price {
          color: var(--color-primary-glow);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-controls button {
          width: 24px;
          height: 24px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn {
          color: var(--color-text-muted);
          align-self: flex-start;
        }

        .remove-btn:hover {
          color: #ef4444;
        }

        .cart-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-bg);
        }

        .total {
          display: flex;
          justify-content: space-between;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }

        .checkout-btn {
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
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          cursor: pointer;
        }

        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
          background: linear-gradient(to bottom, #F8E79C, #D4AF37);
        }

        .checkout-btn:disabled {
          background: var(--color-surface);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          cursor: not-allowed;
          box-shadow: none;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
