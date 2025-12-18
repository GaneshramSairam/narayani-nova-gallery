import React, { useState, useEffect } from 'react';
import logo from '../assets/Naranis Nova updated complete logo.png';

const IntroReveal = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [showButton, setShowButton] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Loading simulation
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setShowButton(true), 500);
                    return 100;
                }
                // Random increment for realistic "loading" feel
                return prev + Math.floor(Math.random() * 10) + 2;
            });
        }, 150);

        return () => clearInterval(timer);
    }, []);

    const handleEnter = () => {
        setIsExiting(true);
        // Wait for animation to finish before unmounting in parent
        setTimeout(() => {
            onComplete();
        }, 800);
    };

    return (
        <div className={`intro-overlay ${isExiting ? 'exit' : ''}`}>
            {/* Background Texture */}
            <div className="bg-texture"></div>

            <div className={`intro-content ${isExiting ? 'fade-out' : ''}`}>

                {/* Logo / Brand */}
                <div className="logo-wrapper">
                    <div className="pulse-circle"></div>
                    <div className="logo-circle">
                        <img src={logo} alt="Narayani's Nova Logo" className="intro-logo-img" />
                    </div>
                </div>

                <h1 className="intro-title">
                    Narayani's Nova
                </h1>

                <p className="intro-subtitle">
                    Curated Jewels &bull; Styling
                </p>

                {/* Loading / Button Container */}
                <div className="action-container">
                    {!showButton ? (
                        <div className="progress-wrapper">
                            <div className="progress-labels">
                                <span>PREPARING GALLERY</span>
                                <span>{Math.min(progress, 100)}%</span>
                            </div>
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleEnter}
                            className="enter-button group"
                        >
                            <div className="btn-bg"></div>
                            <div className="btn-border-bottom"></div>
                            <div className="btn-border-top"></div>

                            <span className="btn-text">
                                Enter Gallery
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <style>{`
        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #2D0406; /* Darker Wine */
          color: white;
          transition: transform 1s ease-in-out;
        }

        .intro-overlay.exit {
          transform: translateY(-100%);
        }

        .bg-texture {
          position: absolute;
          inset: 0;
          opacity: 0.2;
          pointer-events: none;
          background-image: url("https://www.transparenttextures.com/patterns/stardust.png");
        }

        .intro-content {
          position: relative;
          z-index: 10;
          text-align: center;
          transition: opacity 0.5s ease;
        }

        .intro-content.fade-out {
          opacity: 0;
        }

        .logo-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .pulse-circle {
          position: absolute;
          inset: -1rem;
          background: rgba(212, 175, 55, 0.2);
          filter: blur(20px);
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .logo-circle {
          width: 6rem; /* w-24 */
          height: 6rem;
          margin: 0 auto;
          background-color: #3A080A;
          border: 2px solid #D4AF37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          z-index: 10;
          overflow: hidden;
          padding: 10px;
        }
        
        .intro-logo-img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }

        @media (min-width: 768px) {
          .logo-circle {
            width: 8rem; /* md:w-32 */
            height: 8rem;
          }
        }

        .intro-title {
          font-family: var(--font-heading, 'serif');
          font-size: 2.25rem;
          font-weight: 700;
          color: transparent;
          background: linear-gradient(to right, #F8E79C, #D4AF37, #F8E79C);
          -webkit-background-clip: text;
          background-clip: text;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
        }

        @media (min-width: 768px) {
          .intro-title {
            font-size: 3.75rem;
          }
        }

        .intro-subtitle {
          color: #D2B67F;
          font-size: 0.875rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 3rem;
          font-weight: 300;
        }

        @media (min-width: 768px) {
          .intro-subtitle {
            font-size: 1.125rem;
          }
        }

        .action-container {
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-wrapper {
          width: 16rem;
        }

        @media (min-width: 768px) {
          .progress-wrapper {
            width: 20rem;
          }
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #D4AF37;
          margin-bottom: 0.5rem;
          font-family: monospace;
        }

        .progress-track {
          width: 100%;
          height: 0.25rem;
          background-color: #3A080A;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #D4AF37;
          transition: width 0.2s ease-out;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
        }

        .enter-button {
          position: relative;
          padding: 0.75rem 2rem;
          background: transparent;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-bg {
          position: absolute;
          inset: 0;
          width: 0;
          background-color: #D4AF37;
          opacity: 0.1;
          transition: width 0.25s ease-out;
        }

        .enter-button:hover .btn-bg {
          width: 100%;
        }

        .btn-border-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: rgba(212, 175, 55, 0.5);
        }

        .btn-border-top {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 1px;
          background-color: rgba(212, 175, 55, 0.5);
        }

        .btn-text {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #F8E79C;
          font-family: var(--font-heading, 'serif');
          font-size: 1.25rem;
          letter-spacing: 0.05em;
          transition: gap 0.3s;
        }

        .enter-button:hover .btn-text {
          gap: 1.25rem;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
        </div>
    );
};

export default IntroReveal;
