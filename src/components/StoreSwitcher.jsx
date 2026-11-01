import React from 'react';
import { STORE_CONFIG } from '../utils/storeConstants';

const StoreSwitcher = ({ activeStore, onSelectStore }) => {
    return (
        <nav className="store-switcher-nav" aria-label="Store Section Navigation">
            <div className="store-switcher-container">
                <div className="store-switcher-header">
                    <span className="store-switcher-eyebrow">SELECT STORE</span>
                </div>

                <div className="store-switcher-options">
                    {/* Narayani Gallery (Jewellery) Option */}
                    <button
                        type="button"
                        className={`store-card ${activeStore === 'jewels' ? 'active' : ''}`}
                        onClick={() => onSelectStore('jewels')}
                        aria-pressed={activeStore === 'jewels'}
                        aria-label="Switch to Narayani Gallery"
                    >
                        <div className="store-card-active-indicator"></div>
                        <div className="store-card-icon-box">
                            {/* Sparkling Gemstone / Diamond SVG */}
                            <svg viewBox="0 0 24 24" fill="none" className="store-icon" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 3L2 9L12 21L22 9L18 3H6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 21L7.5 9H16.5L12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 9H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                <path d="M6 3L7.5 9M18 3L16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="store-card-text">
                            <span className="store-title">{STORE_CONFIG.jewels.name}</span>
                            <span className="store-badge">{STORE_CONFIG.jewels.subtitle}</span>
                        </div>
                        {activeStore === 'jewels' && (
                            <span className="store-active-check">●</span>
                        )}
                    </button>

                    {/* Signature Sarees Option */}
                    <button
                        type="button"
                        className={`store-card ${activeStore === 'drapes' ? 'active' : ''}`}
                        onClick={() => onSelectStore('drapes')}
                        aria-pressed={activeStore === 'drapes'}
                        aria-label="Switch to Signature Sarees"
                    >
                        <div className="store-card-active-indicator"></div>
                        <div className="store-card-icon-box">
                            {/* Flowing Saree / Pleated Silk Drape SVG */}
                            <svg viewBox="0 0 24 24" fill="none" className="store-icon" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4C7 4 10 5.5 12 7.5C14 5.5 17 4 20 4V19C17 19 14 20.5 12 22.5C10 20.5 7 19 4 19V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 7.5V22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M7 6C8.5 7 10 8.5 10.5 10.5M17 6C15.5 7 14 8.5 13.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                <path d="M7 12C8.5 13 10 14.5 10.5 16.5M17 12C15.5 13 14 14.5 13.5 16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="store-card-text">
                            <span className="store-title">{STORE_CONFIG.drapes.name}</span>
                            <span className="store-badge">{STORE_CONFIG.drapes.subtitle}</span>
                        </div>
                        {activeStore === 'drapes' && (
                            <span className="store-active-check">●</span>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                /* Desktop Left-Side Switcher Inspired by Swiggy Navigation */
                .store-switcher-nav {
                    position: fixed;
                    left: 1.5rem;
                    top: 100px;
                    z-index: 900;
                    width: 240px;
                }

                .store-switcher-container {
                    background: rgba(42, 5, 7, 0.95);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(212, 175, 55, 0.35);
                    border-radius: 16px;
                    padding: 1rem 0.85rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15);
                }

                .store-switcher-header {
                    padding: 0 0.5rem 0.6rem 0.5rem;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                    margin-bottom: 0.6rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .store-switcher-eyebrow {
                    font-family: var(--font-heading, serif);
                    font-size: 0.68rem;
                    letter-spacing: 0.18em;
                    color: var(--color-gold-soft, #E5C978);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .store-switcher-options {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                }

                .store-card {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem 0.85rem;
                    border-radius: 12px;
                    background: rgba(61, 8, 10, 0.4);
                    border: 1.5px solid transparent;
                    color: var(--color-gold-soft, #E5C978);
                    cursor: pointer;
                    transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                    width: 100%;
                    position: relative;
                    min-height: 60px;
                }

                .store-card:hover {
                    background: rgba(76, 11, 13, 0.85);
                    border-color: rgba(212, 175, 55, 0.4);
                    transform: translateX(3px);
                    color: #fff;
                }

                .store-card.active {
                    background: linear-gradient(135deg, #4C0B0D 0%, #2A0507 100%);
                    border-color: var(--color-gold-highlight, #D4AF37);
                    color: #FFF3CD;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.35);
                }

                .store-card-active-indicator {
                    position: absolute;
                    left: 0;
                    top: 15%;
                    bottom: 15%;
                    width: 4px;
                    border-radius: 0 4px 4px 0;
                    background: var(--color-gold-highlight, #D4AF37);
                    box-shadow: 0 0 8px #FFD700;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }

                .store-card.active .store-card-active-indicator {
                    opacity: 1;
                }

                .store-card-icon-box {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: rgba(212, 175, 55, 0.12);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: var(--color-gold-highlight, #D4AF37);
                    transition: all 0.25s ease;
                }

                .store-card.active .store-card-icon-box {
                    background: linear-gradient(135deg, #D4AF37 0%, #B08D1E 100%);
                    color: #240406;
                    box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
                    border-color: #FFD700;
                }

                .store-icon {
                    width: 22px;
                    height: 22px;
                }

                .store-card-text {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                    justify-content: center;
                }

                .store-title {
                    font-family: var(--font-heading, serif);
                    font-size: 0.95rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    line-height: 1.25;
                    white-space: normal;
                    word-break: normal;
                    overflow-wrap: break-word;
                    text-overflow: clip;
                }

                .store-badge {
                    font-size: 0.72rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    opacity: 0.85;
                    margin-top: 2px;
                    color: var(--color-gold-soft, #E5C978);
                }

                .store-card.active .store-badge {
                    color: #FFD700;
                    font-weight: 600;
                }

                .store-active-check {
                    color: var(--color-gold-highlight, #D4AF37);
                    font-size: 0.75rem;
                    text-shadow: 0 0 6px rgba(212, 175, 55, 0.8);
                    flex-shrink: 0;
                }

                /* Responsive Adaptation for Tablets and Mobile */
                @media (max-width: 1023px) {
                    .store-switcher-nav {
                        position: relative;
                        left: auto;
                        top: auto;
                        width: 100%;
                        max-width: 500px;
                        margin: 1rem auto 0 auto;
                        padding: 0 0.75rem;
                    }

                    .store-switcher-container {
                        padding: 0.45rem 0.6rem;
                        border-radius: 999px;
                        background: rgba(42, 5, 7, 0.9);
                    }

                    .store-switcher-header {
                        display: none;
                    }

                    .store-switcher-options {
                        flex-direction: row;
                        gap: 0.4rem;
                    }

                    .store-card {
                        padding: 0.5rem 0.85rem;
                        border-radius: 999px;
                        justify-content: center;
                        min-height: unset;
                        flex: 1;
                    }

                    .store-card:hover {
                        transform: none;
                    }

                    .store-card-active-indicator {
                        display: none;
                    }

                    .store-card-icon-box {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                    }

                    .store-icon {
                        width: 16px;
                        height: 16px;
                    }

                    .store-card-text {
                        flex: unset;
                        min-width: unset;
                    }

                    .store-title {
                        font-size: 0.86rem;
                        white-space: nowrap;
                    }

                    .store-badge {
                        display: none;
                    }

                    .store-active-check {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .store-switcher-nav {
                        padding: 0 0.5rem;
                    }
                    .store-card {
                        padding: 0.45rem 0.65rem;
                        gap: 0.4rem;
                    }
                    .store-card-icon-box {
                        width: 24px;
                        height: 24px;
                    }
                    .store-icon {
                        width: 14px;
                        height: 14px;
                    }
                    .store-title {
                        font-size: 0.78rem;
                        letter-spacing: 0.01em;
                    }
                }

                @media (max-width: 360px) {
                    .store-card {
                        padding: 0.4rem 0.45rem;
                        gap: 0.3rem;
                    }
                    .store-title {
                        font-size: 0.72rem;
                    }
                }
            `}</style>
        </nav>
    );
};

export default StoreSwitcher;
