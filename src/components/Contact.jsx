import React, { useState } from 'react';
import { db } from '../firebase';

import { ref, push } from "firebase/database";
import { useAdmin } from '../context/AdminContext';

const Contact = () => {
    const { contactSettings } = useAdmin();
    const [status, setStatus] = useState('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Send to Firebase
    const sendContactEmail = async (data) => {
        const messagesRef = ref(db, 'messages');
        await push(messagesRef, {
            ...data,
            timestamp: new Date().toISOString(),
            read: false
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;

        setStatus('sending');

        await sendContactEmail(formData);

        setStatus('sent');
        setFormData({ name: '', email: '', message: '' });

        setTimeout(() => setStatus('idle'), 5000);
    };

    return (
        <section id="contact" className="contact-section">
            <div className="contact-container">
                <div className="contact-card">

                    {/* Contact Info */}
                    <div className="contact-info">
                        <div>
                            <h3 className="section-title">Get in Touch</h3>
                            <p className="section-subtitle">
                                {contactSettings?.subtitle || "Book a styling session or ask us about a specific piece."}
                            </p>

                            <div className="info-list">
                                <div className="info-item">
                                    <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <div>
                                        <p className="info-label">Email</p>
                                        <p className="info-value">{contactSettings?.email || "contact@placeholder.com"}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    <div>
                                        <p className="info-label">Phone</p>
                                        <p className="info-value">{contactSettings?.phone || "+91 (Placeholder)"}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <div>
                                        <p className="info-label">Studio</p>
                                        <p className="info-value">{contactSettings?.address || "[Studio Address Placeholder]"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="map-container">
                            <iframe
                                width="100%"
                                height="100%"
                                id="gmap_canvas"
                                src={contactSettings?.mapSrc || "https://maps.google.com/maps?q=Parsn%20Karthik%20Apartments%2C%20Vadapalani%2C%20Chennai&t=&z=15&ie=UTF8&iwloc=&output=embed"}
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                title="Location Map"
                                className="map-iframe"
                            ></iframe>
                            <div className="map-overlay"></div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="contact-form-wrapper">
                        <h3 className="form-title">Let's Get Connected</h3>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell us what you're looking for..."
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending' || status === 'sent'}
                                className={`submit-btn ${status}`}
                            >
                                {status === 'sending' ? (
                                    <span className="btn-content">Sending... <span className="spinner"></span></span>
                                ) : status === 'sent' ? (
                                    <span className="btn-content">Message Sent <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
                                ) : (
                                    <span className="btn-content">Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
        .contact-section {
          padding: 4rem 1.5rem;
          background-color: var(--color-bg-mid);
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .contact-card {
          background-color: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-luxury);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-border);
        }

        @media (min-width: 768px) {
          .contact-card {
            flex-direction: row;
          }
        }

        /* Info Side */
        .contact-info {
          background-color: var(--color-bg);
          padding: 2.5rem;
          color: white;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media (min-width: 768px) {
          .contact-info {
            width: 40%;
          }
        }

        .section-title {
          font-family: var(--font-heading);
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--color-gold-highlight);
        }

        .section-subtitle {
          color: var(--color-text-subtitle);
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .info-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: var(--color-gold-highlight);
          margin-top: 0.25rem;
        }

        .info-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-subtitle);
          opacity: 0.7;
          margin-bottom: 0.25rem;
        }

        .info-value {
          font-weight: 500;
          color: var(--color-text-title);
        }

        .map-container {
          margin-top: 3rem;
          height: 12rem;
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border: 1px solid var(--color-gold-shadow);
          position: relative;
        }

        .map-iframe {
          filter: grayscale(100%) invert(100%) contrast(0.8);
          transition: filter 0.5s;
        }

        .map-container:hover .map-iframe {
          filter: grayscale(0%) invert(0%);
        }

        /* Form Side */
        .contact-form-wrapper {
          padding: 2.5rem;
          width: 100%;
          background-color: var(--color-surface);
        }

        @media (min-width: 768px) {
          .contact-form-wrapper {
            width: 60%;
          }
        }

        .form-title {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          color: var(--color-gold-highlight);
          margin-bottom: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-subtitle);
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: var(--color-bg);
          border: 1px solid var(--color-gold-shadow);
          border-radius: var(--radius-sm);
          color: var(--color-text-title);
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: var(--color-gold-highlight);
          box-shadow: 0 0 5px rgba(212, 175, 55, 0.2);
        }

        .form-group textarea {
          resize: none;
        }

        .submit-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-weight: bold;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-primary);
          color: var(--color-bg);
        }

        .submit-btn:hover {
          background-color: var(--color-primary-dark);
          color: white;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-btn.sent {
          background-color: #2E7D32; /* Success Green */
          color: white;
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </section>
    );
};

export default Contact;
