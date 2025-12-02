import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const Footer = ({ onAboutClick }) => {
  const { socialLinks } = useAdmin();
  const { whatsapp, instagram } = socialLinks || {};

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Narayani's Nova Gallery. All rights reserved.</p>
        <div className="social-links">
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          <button onClick={onAboutClick} className="about-link">About Us</button>
          <Link to="/admin" className="admin-link">Admin Login</Link>
        </div>
      </div>

      <style>{`
        .footer {
          margin-top: auto;
          padding: 2rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer p {
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .social-links a {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          transition: color var(--transition-fast);
          text-decoration: none;
        }

        .social-links a:hover,
        .about-link:hover {
          color: var(--color-primary);
        }

        .about-link {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.9rem;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          transition: color var(--transition-fast);
        }
        
        .admin-link {
          font-size: 0.8rem !important;
          opacity: 0.5;
        }
        
        .admin-link:hover {
          opacity: 1;
        }

        @media (max-width: 600px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
