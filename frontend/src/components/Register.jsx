import { useState } from 'react';

export default function Register({ onRegisterSuccess, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = 'http://localhost:5000/api/auth';

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email || !password || !confirmPassword) {
      setMessage({ type: 'error', text: '❌ Email, password and confirm password are required' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: '❌ Password must be at least 6 characters' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: '❌ Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Registration successful! Redirecting to login...' });
        setTimeout(() => {
          onSwitch('login');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Registration failed'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && email && password && confirmPassword && !isLoading) {
      handleRegister(e);
    }
  };

  return (
    <div className="vault-login-container">
      <div className="vault-login-card">
        {/* Logo */}
        <div className="vault-login-logo">
          <div className="vault-login-logo-ring">
            <div className="vault-login-logo-inner">🏥</div>
          </div>
          <h2 className="vault-login-brand">Health Vault</h2>
        </div>

        {/* Hero */}
        <div className="vault-login-hero">
          <h1>Create Account</h1>
          <p>Join Health Vault to secure your health records</p>
        </div>

        {/* Form */}
        <form className="vault-login-form" onSubmit={handleRegister}>
          <div className="vault-form-group">
            <label className="vault-form-label">📧 Email Address *</label>
            <input
              type="email"
              className="vault-form-input"
              placeholder="your.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              id="register-email"
            />
          </div>

          <div className="vault-form-row">
            <div className="vault-form-group">
              <label className="vault-form-label">👤 First Name</label>
              <input
                type="text"
                className="vault-form-input"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="register-firstname"
              />
            </div>
            <div className="vault-form-group">
              <label className="vault-form-label">👤 Last Name</label>
              <input
                type="text"
                className="vault-form-input"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="register-lastname"
              />
            </div>
          </div>

          <div className="vault-form-group">
            <label className="vault-form-label">🔐 Password *</label>
            <div className="vault-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="vault-form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="register-password"
              />
              <button
                type="button"
                className="vault-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="vault-form-group">
            <label className="vault-form-label">🔐 Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="vault-form-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              id="register-confirm"
            />
          </div>

          <button
            className={`vault-submit-btn ${!isLoading && email && password && confirmPassword ? 'active' : ''}`}
            type="submit"
            disabled={isLoading || !email || !password || !confirmPassword}
            id="register-submit"
          >
            {isLoading ? (
              <>
                <span className="vault-spinner"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="vault-btn-arrow">→</span>
              </>
            )}
          </button>

          {message.text && (
            <div className={`vault-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>

        {/* Links */}
        <div className="vault-login-links">
          <p>
            Already have an account?{' '}
            <button onClick={() => onSwitch('login')} className="vault-link-btn">
              Login here
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="vault-login-footer">
          <span>🔒</span>
          <span>ENCRYPTED</span>
          <span className="vault-footer-divider">•</span>
          <span>🛡️</span>
          <span>SECURE</span>
        </div>
      </div>
    </div>
  );
}
