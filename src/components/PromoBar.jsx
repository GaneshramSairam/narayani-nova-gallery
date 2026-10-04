import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

const PromoBar = () => {
    const { promotions, promoSettings } = useAdmin();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev'

    // Filter only active promotions
    const activePromos = (promotions || []).filter(p => p.isActive !== false);
    const isEnabled = promoSettings?.isEnabled !== false;
    const speed = promoSettings?.speed || 3200; // Snappy, visible 3.2s auto-swipe

    // Keep currentIndex within bounds if activePromos length changes
    useEffect(() => {
        if (currentIndex >= activePromos.length && activePromos.length > 0) {
            setCurrentIndex(0);
        }
    }, [activePromos.length, currentIndex]);

    // Automatic continuous auto-swipe (does not pause on mouse hover, automatically cycles itself)
    useEffect(() => {
        if (!isEnabled || activePromos.length <= 1) return;

        const timer = setInterval(() => {
            setSlideDirection('next');
            setCurrentIndex((prev) => (prev + 1) % activePromos.length);
        }, speed);

        return () => clearInterval(timer);
    }, [isEnabled, activePromos.length, speed, currentIndex]);

    const handleNext = () => {
        setSlideDirection('next');
        setCurrentIndex((prev) => (prev + 1) % activePromos.length);
    };

    const handlePrev = () => {
        setSlideDirection('prev');
        setCurrentIndex((prev) => (prev - 1 + activePromos.length) % activePromos.length);
    };

    if (!isEnabled || activePromos.length === 0) {
        return null;
    }

    const currentPromo = activePromos[currentIndex] || activePromos[0];

    return (
        <aside className="promo-bar" aria-label="Promotions and Announcements">
            <div className="promo-shimmer-layer"></div>

            <div className="promo-inner-container">
                {activePromos.length > 1 && (
                    <button
                        className="promo-nav-btn prev-btn"
                        onClick={handlePrev}
                        aria-label="Previous promotion"
                        title="Previous offer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}

                {/* Animated Auto-Swiping Content Track */}
                <div className="promo-track-wrapper">
                    <div
                        key={currentIndex}
                        className={`promo-slide-item ${slideDirection === 'prev' ? 'prev-dir' : 'next-dir'}`}
                    >
                        {currentPromo?.badge && (
                            <span className="promo-flash-badge">
                                <span className="pulse-dot"></span>
                                {currentPromo.badge}
                            </span>
                        )}

                        {currentPromo?.link ? (
                            <a href={currentPromo.link} className="promo-text-link">
                                <span className="promo-text">{currentPromo.text}</span>
                                <span className="promo-cta">Explore &rarr;</span>
                            </a>
                        ) : (
                            <span className="promo-text">{currentPromo?.text}</span>
                        )}
                    </div>
                </div>

                {activePromos.length > 1 && (
                    <div className="promo-controls-right">
                        <div className="promo-dots-indicator">
                            {activePromos.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSlideDirection(i > currentIndex ? 'next' : 'prev');
                                        setCurrentIndex(i);
                                    }}
                                    className={`promo-dot ${i === currentIndex ? 'active' : ''}`}
                                    aria-label={`Go to promotion ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            className="promo-nav-btn next-btn"
                            onClick={handleNext}
                            aria-label="Next promotion"
                            title="Next offer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .promo-bar {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: linear-gradient(90deg, #240406 0%, #3D080A 35%, #4C0B0D 50%, #3D080A 65%, #240406 100%);
                    border-bottom: 1px solid rgba(212, 175, 55, 0.45);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                    padding: 8px 16px;
                    overflow: hidden;
                    font-family: var(--font-main, 'Lato', sans-serif);
                }

                .promo-shimmer-layer {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.08), transparent);
                    animation: promoShimmer 5s infinite ease-in-out;
                    pointer-events: none;
                }

                @keyframes promoShimmer {
                    0% { left: -60%; }
                    40%, 100% { left: 140%; }
                }

                .promo-inner-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    min-height: 28px;
                }

                .promo-track-wrapper {
                    overflow: hidden;
                    width: 100%;
                    max-width: 900px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0 35px;
                }

                /* Automatic Swipe Animations */
                .promo-slide-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    text-align: center;
                }

                .promo-slide-item.next-dir {
                    animation: promoAutoSwipeRight 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .promo-slide-item.prev-dir {
                    animation: promoAutoSwipeLeft 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes promoAutoSwipeRight {
                    0% {
                        opacity: 0;
                        transform: translateX(45px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes promoAutoSwipeLeft {
                    0% {
                        opacity: 0;
                        transform: translateX(-45px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                /* Flashing Deal Badge */
                .promo-flash-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: linear-gradient(135deg, #D4AF37 0%, #B08D1E 100%);
                    color: #240406;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 3px 9px;
                    border-radius: 999px;
                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
                    animation: flashGlow 2s infinite ease-in-out;
                    flex-shrink: 0;
                }

                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #240406;
                    border-radius: 50%;
                    display: inline-block;
                    animation: dotBlink 1s infinite alternate ease-in-out;
                }

                @keyframes dotBlink {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.3); opacity: 1; }
                }

                @keyframes flashGlow {
                    0%, 100% {
                        box-shadow: 0 0 6px rgba(212, 175, 55, 0.5), inset 0 0 4px rgba(255, 255, 255, 0.4);
                        filter: brightness(1);
                    }
                    50% {
                        box-shadow: 0 0 16px rgba(255, 215, 0, 0.95), 0 0 6px rgba(255, 255, 255, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.7);
                        filter: brightness(1.2);
                    }
                }

                .promo-text {
                    color: #FFF3CD;
                    font-size: 0.88rem;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    line-height: 1.3;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
                }

                .promo-text-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: inherit;
                    text-decoration: none;
                    transition: transform 0.2s ease;
                }

                .promo-text-link:hover {
                    transform: scale(1.01);
                }

                .promo-cta {
                    font-size: 0.75rem;
                    color: #FFD700;
                    text-decoration: underline;
                    font-weight: 700;
                    margin-left: 4px;
                }

                .promo-nav-btn {
                    background: rgba(212, 175, 55, 0.15);
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    color: #FFD700;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .promo-nav-btn:hover {
                    background: rgba(212, 175, 55, 0.35);
                    border-color: #FFD700;
                    color: #FFF;
                    transform: scale(1.1);
                }

                .prev-btn {
                    position: absolute;
                    left: 0;
                }

                .promo-controls-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: absolute;
                    right: 0;
                }

                /* Dots Indicator */
                .promo-dots-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .promo-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(212, 175, 55, 0.3);
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .promo-dot.active {
                    background: #FFD700;
                    width: 14px;
                    border-radius: 999px;
                    box-shadow: 0 0 6px rgba(255, 215, 0, 0.8);
                }

                @media (max-width: 768px) {
                    .promo-bar {
                        padding: 7px 10px;
                    }
                    .promo-track-wrapper {
                        padding: 0 24px;
                    }
                    .promo-slide-item {
                        gap: 6px;
                    }
                    .promo-text {
                        font-size: 0.78rem;
                    }
                    .promo-flash-badge {
                        font-size: 0.65rem;
                        padding: 2px 7px;
                    }
                    .promo-dots-indicator {
                        display: none;
                    }
                    .promo-nav-btn {
                        width: 20px;
                        height: 20px;
                    }
                }
            `}</style>
        </aside>
    );
};

export default PromoBar;
