import React from 'react';
import logo from '../assets/Naranis Nova updated complete logo.png';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="about-header">
          <img src={logo} alt="Narayani's Nova Gallery" className="about-logo" />
          <h2>Our Story</h2>
        </div>

        <div className="about-body">
          <p className="intro">
            Welcome to <strong>Narayani’s Nova Gallery</strong> — where every piece is curated with care, crafted with passion, and styled especially for you.
          </p>

          <p>
            Our journey began with a simple belief: jewellery should feel personal.
            Not mass-produced. Not rushed. Not just another accessory — but something that makes you pause and say, <em>“This feels like me.”</em>
          </p>

          <p>
            At Narayani’s Nova Gallery, we hand-select every piece with an eye for beauty, detail, and individuality.
            Our collections are inspired by elegance, everyday charm, and the quiet luxury that never goes out of style.
          </p>

          <p>
            Whether you're dressing up for a celebration or adding a spark to your day, our pieces are meant to make you feel confident, radiant, and uniquely yourself.
          </p>

          <p className="signature">
            Curated with love. Styled for you.
          </p>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          backdrop-filter: blur(5px);
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: linear-gradient(145deg, #4C0B0D, #260506);
          padding: 3rem;
          border-radius: var(--radius-lg);
          max-width: 700px;
          width: 90%;
          max-height: 90vh; /* Limit height */
          overflow-y: auto; /* Enable scrolling */
          position: relative;
          border: 1px solid var(--color-gold-mid);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(212, 175, 55, 0.1);
          animation: slideUp 0.4s ease;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: var(--color-gold-mid);
          font-size: 2.5rem;
          cursor: pointer;
          line-height: 1;
          transition: color 0.2s;
          z-index: 10; /* Ensure it stays on top */
        }

        .close-btn:hover {
          color: var(--color-gold-highlight);
        }

        .about-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 1.5rem;
        }

        .about-logo {
          width: 80px;
          height: auto;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
        }

        .about-header h2 {
          font-family: var(--font-heading);
          color: var(--color-gold-highlight);
          font-size: 2.5rem;
          margin: 0;
          font-weight: 400;
          letter-spacing: 0.05em;
        }

        .about-body {
          color: #F8E6D4;
          font-family: var(--font-main);
          line-height: 1.8;
          font-size: 1.1rem;
          text-align: center;
        }

        .about-body p {
          margin-bottom: 1.5rem;
        }

        .intro {
          font-size: 1.25rem;
          color: var(--color-gold-soft);
          margin-bottom: 2rem;
        }

        .signature {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--color-gold-highlight);
          margin-top: 3rem;
          font-style: italic;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AboutModal;
