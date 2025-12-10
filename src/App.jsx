import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GalleryGrid from './components/GalleryGrid';
import ImageModal from './components/ImageModal';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AboutModal from './components/AboutModal';
import { CartProvider, useCart } from './context/CartContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import logo from './assets/Naranis Nova updated complete logo.png';

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

function StoreLayout() {
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { products } = useAdmin();

  const filteredArtworks = useMemo(() => {
    return products.filter((artwork) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        artwork.title.toLowerCase().includes(term) ||
        artwork.artist.toLowerCase().includes(term) ||
        artwork.category.toLowerCase().includes(term) ||
        artwork.description.toLowerCase().includes(term);
      const matchesCategory = activeCategory === 'All' || artwork.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, products]);

  return (
    <div className="app-container">
      <CartIcon />
      <CartDrawer />

      <div className="content-wrap">
        <header style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="logo-container">
            {/* User Provided Logo Image */}
            <img src={logo} alt="Narayani's Nova Gallery Emblem" className="lotus-icon-img" />

            <div className="brand-text">
              <h1 className="brand-name-main">Narayani’s</h1>
              <h2 className="brand-name-sub">NOVA GALLERY</h2>
              <p className="brand-tagline">Curated jewels – Styled for you</p>
            </div>
          </div>

          <div className="controls">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </div>
        </header>

        <main style={{ padding: '2rem' }}>
          <GalleryGrid
            artworks={filteredArtworks}
            onArtworkClick={setSelectedArtwork}
          />
          {filteredArtworks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
              No artworks found matching your criteria.
            </div>
          )}
        </main>
      </div>

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
          justify-content: center;
          margin-bottom: 1rem;
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
      `}</style>
    </div>
  );
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  console.log("ProtectedRoute: Rendering");
  try {
    const adminParams = useAdmin();
    console.log("ProtectedRoute: useAdmin result", adminParams);
    const { isAuthenticated } = adminParams || {};

    console.log("ProtectedRoute: isAuthenticated", isAuthenticated);

    if (isAuthenticated === undefined) {
      console.error("ProtectedRoute: isAuthenticated is undefined! Context might be missing.");
      return <div style={{ color: 'red', padding: '2rem' }}>Error: Auth Context Missing</div>;
    }

    if (!isAuthenticated) {
      console.log("ProtectedRoute: Not authenticated, redirecting...");
      return <Navigate to="/admin" replace />;
    }
    return children;
  } catch (e) {
    console.error("ProtectedRoute: Crashed", e);
    return <div style={{ color: 'red', padding: '2rem' }}>Critical Error in Route: {e.message}</div>;
  }
};

function App() {
  return (
    <Router>
      <AdminProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<StoreLayout />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
          </Routes>
        </CartProvider>
      </AdminProvider>
    </Router>
  );
}

export default App;
