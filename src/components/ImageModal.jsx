import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

const ImageModal = ({ artwork, onClose }) => {
  const { addToCart } = useCart();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!artwork) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>

        <div className="modal-image-container">
          <img src={artwork.imageUrl} alt={artwork.title} />
        </div>

        <div className="modal-info">
          <h2>{artwork.title}</h2>
          <p className="artist">by {artwork.artist}</p>
          <p className="description">{artwork.description}</p>

          <div className="modal-actions">
            <span className="price">₹{artwork.price}</span>
            <button className="add-btn-large" onClick={() => addToCart(artwork)}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          padding: 2rem;
        }

        .modal-content {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          border: 1px solid var(--color-border);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
          overflow-y: auto;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: white;
          font-size: 2rem;
          line-height: 1;
          z-index: 10;
          background: rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: var(--color-primary);
        }

        .modal-image-container {
          flex-grow: 1;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          min-height: 300px;
        }

        .modal-image-container img {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
        }

        .modal-info {
          padding: 2rem;
          background: var(--color-surface);
        }

        .modal-info h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .modal-info .artist {
          color: var(--color-primary-glow);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .modal-info .description {
          color: var(--color-text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-top: auto;
        }

        .price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary-glow);
        }

        .add-btn-large {
          flex: 1;
          padding: 1rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-btn-large:hover {
          background: #5a252c;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .modal-content {
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }
          
          .modal-image-container img {
            max-height: 50vh;
          }

          .modal-actions {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .price {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageModal;
