import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search artworks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <style>{`
        .search-bar {
          position: relative;
          max-width: 400px;
          width: 100%;
        }

        .search-bar input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 3rem;
          background: rgba(61, 8, 10, 0.6);
          border: 1px solid var(--color-gold-mid);
          border-radius: 30px; /* More rounded */
          color: var(--color-text-title);
          font-family: var(--font-main);
          font-size: 1rem;
          font-weight: 300;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
        }

        .search-bar input::placeholder {
          color: rgba(229, 201, 120, 0.5); /* Soft gold placeholder */
          font-weight: 300;
        }

        .search-bar input:focus {
          outline: none;
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2), inset 0 2px 5px rgba(0,0,0,0.2);
          background: rgba(61, 8, 10, 0.8);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: var(--color-gold-mid);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
