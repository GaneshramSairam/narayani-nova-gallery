import React from 'react';
import ArtworkCard from './ArtworkCard';

const GalleryGrid = ({ artworks, onArtworkClick }) => {
  return (
    <div className="gallery-grid">
      {artworks.map((artwork) => (
        <div key={artwork.id} className="gallery-item">
          <ArtworkCard artwork={artwork} onClick={onArtworkClick} />
        </div>
      ))}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
          max-width: 1400px;
          margin: 0 auto;
        }

        .gallery-item {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Stagger animations */
        .gallery-item:nth-child(1) { animation-delay: 0.1s; }
        .gallery-item:nth-child(2) { animation-delay: 0.2s; }
        .gallery-item:nth-child(3) { animation-delay: 0.3s; }
        .gallery-item:nth-child(4) { animation-delay: 0.4s; }
        .gallery-item:nth-child(5) { animation-delay: 0.5s; }
        .gallery-item:nth-child(6) { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default GalleryGrid;
