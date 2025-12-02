import React from 'react';
import { useCart } from '../context/CartContext';

const ArtworkCard = ({ artwork, onClick }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(artwork);
  };

  return (
    <div className="artwork-card" onClick={() => onClick(artwork)}>
      <div className="image-container">
        <img src={artwork.imageUrl} alt={artwork.title} loading="lazy" />
        <div className="overlay">
          <h3 className="artwork-title">{artwork.title}</h3>
          <p className="artwork-artist">by {artwork.artist}</p>
        </div>
      </div>
      <div className="card-info">
        <div className="info-header">
          <p className="artwork-description">{artwork.description}</p>
          <span className="price">₹{artwork.price}</span>
        </div>
        <button className="add-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>

      <style>{`
        .artwork-card {
          background: var(--color-surface);
          border-radius: 16px; /* 14px-18px requested */
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
          border: 1px solid rgba(197, 160, 40, 0.3); /* Subtle gold border */
          height: 100%;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
        }

        .artwork-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 16px;
          box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.1); /* Inner gold highlight */
          pointer-events: none;
          z-index: 2;
        }

        .artwork-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.35), 0 0 15px rgba(212, 175, 55, 0.15);
          border-color: var(--color-gold-mid);
        }

        .image-container {
          position: relative;
          width: 100%;
          padding-top: 75%; /* 4:3 Aspect Ratio */
          overflow: hidden;
        }

        .image-container img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .artwork-card:hover .image-container img {
          transform: scale(1.05);
        }

        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          padding: 1.5rem;
          transform: translateY(100%);
          transition: transform var(--transition-normal);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .artwork-card:hover .overlay {
          transform: translateY(0);
        }

        .artwork-title {
          color: var(--color-text-title);
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          letter-spacing: 0.02em;
        }

        .artwork-artist {
          color: var(--color-text-subtitle);
          font-size: 0.9rem;
          font-weight: 400;
          font-style: italic;
        }

        .card-info {
          padding: 1.25rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-header {
          flex-grow: 1;
        }

        .artwork-description {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 0.75rem;
          font-weight: 300;
        }

        .price {
          color: var(--color-gold-sharp);
          font-weight: 700;
          font-size: 1.25rem;
          display: block;
          letter-spacing: 0.05em;
        }

        .add-btn {
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(to bottom, #4C0B0D, #3A080A);
          border: 1px solid var(--color-gold-mid);
          color: var(--color-gold-highlight);
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }

        .add-btn:hover {
          background: linear-gradient(to bottom, #5E1A1F, #4C0B0D);
          color: #fff;
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }

        .add-btn:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
};

export default ArtworkCard;
