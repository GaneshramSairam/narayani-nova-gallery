import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/Naranis Nova updated complete logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-wrapper">
          <img src={logo} alt="Narayani's Nova Gallery" className="login-logo" />
        </div>
        <h1>Admin Login</h1>
        <p className="subtitle">Secure Access Only</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a0b0e;
          color: #fff;
        }

        .login-card {
          background: #2a1215;
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid #D4AF37;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .logo-wrapper {
          text-align: center;
          margin-bottom: 1rem;
        }

        .login-logo {
          width: 100px;
          height: auto;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
        }

        h1 {
          color: #D4AF37;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          text-align: center;
          color: #aaa;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #D4AF37;
          font-size: 0.9rem;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          background: #1a0b0e;
          border: 1px solid #555;
          border-radius: 4px;
          color: #fff;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #D4AF37;
        }

        .login-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(to bottom, #D4AF37, #B08D1E);
          color: #1a0b0e;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
          transition: transform 0.2s;
        }

        .login-btn:hover {
          transform: scale(1.02);
        }

        .error-msg {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #ff4444;
          color: #ff4444;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
