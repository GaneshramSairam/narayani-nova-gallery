import React from 'react';

const categories = ["All", "Cyberpunk", "Abstract", "Nature"];

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}

      <style>{`
        .category-filter {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 25px;
          background: var(--color-surface);
          color: var(--color-gold-soft);
          border: 1px solid var(--color-gold-mid);
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .filter-btn:hover {
          background: var(--color-bg-mid);
          color: var(--color-gold-highlight);
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          transform: translateY(-1px);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #4C0B0D 0%, #3A080A 100%);
          color: #fff;
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;
