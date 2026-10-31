import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GalleryGrid from './components/GalleryGrid';
import ImageModal from './components/ImageModal';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import Footer from './components/Footer';
import Contact from './components/Contact';
import CartDrawer from './components/CartDrawer';
import AboutModal from './components/AboutModal';
import { CartProvider, useCart } from './context/CartContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import logo from './assets/Narayani Nila updated complete logo.png';

const CartIcon = () => {
  const { setIsCartOpen, cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button className="cart-icon-btn" onClick={() => setIsCartOpen(true)}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}

      <style>{`
        .cart-icon-btn {
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: rgba(61, 8, 10, 0.8);
          color: var(--color-gold-highlight);
          border: 1.5px solid var(--color-gold-mid);
          padding: 0.75rem;
          border-radius: 50%;
          cursor: pointer;
          z-index: 100;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          width: 50px;
          height: 50px;
        }

        .cart-icon-btn:hover {
          background: var(--color-bg);
          color: #fff;
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
          transform: scale(1.05);
        }

        .cart-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #8B0000;
          color: var(--color-gold-highlight);
          border: 1px solid var(--color-gold-mid);
          font-size: 0.75rem;
          font-weight: bold;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </button>
  );
};

import PromoBar from './components/PromoBar';
import StoreSwitcher from './components/StoreSwitcher';
import BackgroundWatermark from './components/BackgroundWatermark';
import { STORE_CONFIG } from './utils/storeConstants';

function StoreLayout() {
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem('hasSeenIntro') !== 'true';
  });
  const [activeStore, setActiveStore] = useState('jewels');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { products } = useAdmin();

  const handleSelectStore = (store) => {
    setActiveStore(store);
    setActiveCategory('All');
    setSearchTerm('');
  };

  // Scope products strictly to the active store (Nila Jewels or Nila Drapes)
  const storeProducts = useMemo(() => {
    return products.filter((p) => (p.store || 'jewels') === activeStore);
  }, [products, activeStore]);

  // Sort products by newest first within the store
  const sortedProducts = useMemo(() => {
    return [...storeProducts].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (Number(a.id) > 1000000000000 ? Number(a.id) : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (Number(b.id) > 1000000000000 ? Number(b.id) : 0);
      return timeB - timeA;
    });
  }, [storeProducts]);

  // Get top 4 as New Arrivals for the active store
  const newArrivals = useMemo(() => sortedProducts.slice(0, 4), [sortedProducts]);

  const filteredArtworks = useMemo(() => {
    return sortedProducts.filter((artwork) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        artwork.title.toLowerCase().includes(term) ||
        (artwork.artist && artwork.artist.toLowerCase().includes(term)) ||
        (artwork.category && artwork.category.toLowerCase().includes(term)) ||
        (artwork.description && artwork.description.toLowerCase().includes(term));

      let matchesCategory = true;
      if (activeCategory === 'New Arrivals') {
        matchesCategory = artwork.isNewArrival === true;
      } else if (activeCategory !== 'All') {
        matchesCategory = artwork.category === activeCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, sortedProducts]);

  return (
    <div className="app-container">
      {showIntro && <IntroReveal onComplete={() => { setShowIntro(false); sessionStorage.setItem('hasSeenIntro', 'true'); }} />}
      <BackgroundWatermark activeStore={activeStore} />
      <PromoBar />
      <StoreSwitcher activeStore={activeStore} onSelectStore={handleSelectStore} />
      <CartIcon />
      <CartDrawer />

      <div className="content-wrap">
        <header style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="logo-container">
            {/* User Provided Logo Image */}
            <img src={logo} alt="Narayani Nila Gallery Emblem" className="lotus-icon-img" />

            <div className="brand-text">
              <h1 className="brand-name-main">Narayani</h1>
              <h2 className="brand-name-sub">NILA GALLERY</h2>
              <p className="brand-tagline">{STORE_CONFIG[activeStore]?.tagline || 'Curated jewels – Styled for you'}</p>
            </div>
          </div>

          <div className="controls">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeStore={activeStore} />
          </div>
        </header>

        <main style={{ padding: '2rem' }}>
          {/* New Arrivals Section - Only visible on main view */}
          {activeCategory === 'All' && searchTerm === '' && newArrivals.length > 0 && (
            <section className="mb-12">
              <div className="section-header-styled">
                <h2 className="section-title">Fresh Drops</h2>
                <div className="title-underline"></div>
              </div>
              <GalleryGrid
                artworks={newArrivals}
                onArtworkClick={setSelectedArtwork}
              />
              <div className="spacer"></div>
            </section>
          )}

          {/* Manual New Arrivals Banner */}
          {activeCategory === 'New Arrivals' && (
            <div className="new-arrivals-banner">
              <h2 className="new-arrivals-title">NEW ARRIVALS</h2>
              <div className="new-arrivals-underline"></div>
            </div>
          )}

          {/* Main Gallery */}
          <section>
            {(activeCategory !== 'All' && activeCategory !== 'New Arrivals' || searchTerm !== '') && (
              <div className="section-header-styled">
                <h2 className="section-title">
                  {activeCategory !== 'All' && activeCategory !== 'New Arrivals' ? `${activeCategory} Collection` : 'Search Results'}
                </h2>
              </div>
            )}

            {/* Show 'All Collection' header only if we are showing New Arrivals too, to distinguish */}
            {activeCategory === 'All' && searchTerm === '' && newArrivals.length > 0 && (
              <div className="section-header-styled">
                <h2 className="section-title">All Collection</h2>
                <div className="title-underline"></div>
              </div>
            )}

            <GalleryGrid
              artworks={filteredArtworks}
              onArtworkClick={setSelectedArtwork}
            />
            {filteredArtworks.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
                {STORE_CONFIG[activeStore]?.emptyMessage || 'No items found matching your criteria.'}
              </div>
            )}
          </section>
        </main>
      </div>

      <Contact />
      <Footer onAboutClick={() => setIsAboutOpen(true)} />

      <ImageModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .content-wrap {
          flex: 1;
          position: relative;
          z-index: 1;
          transition: padding-left 0.3s ease;
        }

        @media (min-width: 1024px) {
          .content-wrap {
            padding-left: 240px;
          }
        }

        @media (max-width: 1023px) {
          .content-wrap {
            padding-left: 0;
          }
        }

        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem; /* Reduced spacing */
          position: relative;
        }
        
        /* Ambient Glow behind logo */
        .logo-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: -1;
        }

        .lotus-icon-img {
          width: 180px;
          height: auto;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
          animation: pulse-glow 3s ease-in-out infinite alternate;
          /* Soft downward fade */
          mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
        }

        @keyframes pulse-glow {
          from {
            filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5)) brightness(1);
            transform: scale(1);
          }
          to {
            filter: drop-shadow(0 0 25px rgba(212, 175, 55, 0.9)) brightness(1.2);
            transform: scale(1.02);
          }
        }

        .brand-text {
          text-align: center;
          margin-top: 1rem;
        }

        .brand-name-main {
          font-family: var(--font-heading);
          font-size: 3.8rem; /* Slightly larger */
          color: var(--color-gold-highlight);
          margin: 0;
          line-height: 1.1;
          background: linear-gradient(to right, #D4AF37, #F8E79C, #B08D1E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          font-weight: 700;
        }

        .brand-name-sub {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          color: var(--color-gold-highlight);
          letter-spacing: 0.4em; /* Increased spacing */
          margin: 0.5rem 0;
          font-weight: 400;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .brand-tagline {
          font-family: var(--font-main);
          font-size: 1.1rem;
          color: var(--color-gold-soft);
          font-style: italic;
          letter-spacing: 0.08em;
          font-weight: 300;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Section Styling */
        .section-header-styled {
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
        }

        .section-title {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: var(--color-gold-highlight);
            margin-bottom: 0.5rem;
            font-weight: 300;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .title-underline {
            width: 80px;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--color-gold-mid), transparent);
            margin: 0 auto;
        }

        .spacer {
            height: 3rem;
            width: 100%;
        }
        
        .mb-12 {
            margin-bottom: 3rem;
        }

        /* New Arrivals Banner */
        .new-arrivals-banner {
          /* Border and Admin-like box removed as per request */
          padding: 1rem 0;
          margin: 0 auto 2rem auto;
          text-align: center;
          position: relative;
        }

        .new-arrivals-title {
          font-family: 'Times New Roman', serif; /* Or custom serif font */
          font-size: 2.5rem;
          color: var(--color-gold-highlight);
          margin: 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .new-arrivals-underline {
          width: 50px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-gold-mid), transparent);
          margin: 0.5rem auto 0;
        }
        
      `}</style>
    </div>
  );
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

import IntroReveal from './components/IntroReveal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <AdminProvider>
        <CartProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<StoreLayout />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ErrorBoundary>
        </CartProvider>
      </AdminProvider>
    </Router>
  );
}

export default App;
