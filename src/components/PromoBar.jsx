import React from 'react';

const PromoBar = () => {
    return (
        <div className="promo-bar">
            <div className="promo-content">
                <span className="promo-text">✨ New Arrivals Have Landed! Explore the Latest Collection Now ✨</span>
            </div>
            <style>{`
        .promo-bar {
          background: linear-gradient(90deg, #3D080A 0%, #8B0000 50%, #3D080A 100%);
          color: #FFD700;
          padding: 10px 0;
          text-align: center;
          font-family: 'Poppins', sans-serif; /* Assuming this font is available or similar */
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
          overflow: hidden;
        }

        .promo-content {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: slideInDown 0.5s ease-out;
        }

        .promo-text {
             display: inline-block;
             /* Optional: Add a subtle pulse or shimmer if desired */
        }
        
        /* Optional Marquee Effect for Mobile if needed, but static is cleaner for "New Arrivals" */
        @media (max-width: 600px) {
            .promo-bar {
                font-size: 0.8rem;
                padding: 8px 0;
            }
        }

        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default PromoBar;
