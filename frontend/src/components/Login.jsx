import { useState } from 'react';

function Login({ onLoginSuccess, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = 'http://localhost:5000/api/auth';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email || !password) {
      setMessage({ type: 'error', text: '❌ Email and password are required' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setMessage({ type: 'success', text: '✅ Login successful! Redirecting...' });
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Login failed'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Make sure backend is running on port 5000' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && email && password && !isLoading) {
      handleLogin(e);
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

        {/* Welcome */}
        <div className="vault-login-hero">
          <h1>Welcome Back!</h1>
          <p>Access your health records securely</p>
        </div>

        {/* Form */}
        <form className="vault-login-form" onSubmit={handleLogin}>
          {/* Email */}
          <div className="vault-form-group">
            <label className="vault-form-label">📧 Email Address</label>
            <input
              type="email"
              className="vault-form-input"
              placeholder="your.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              id="login-email"
            />
          </div>

          {/* Password */}
          <div className="vault-form-group">
            <label className="vault-form-label">🔐 Password</label>
            <div className="vault-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="vault-form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="login-password"
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

          {/* Login Button */}
          <button
            className={`vault-submit-btn ${!isLoading && email && password ? 'active' : ''}`}
            type="submit"
            disabled={isLoading || !email || !password}
            id="login-submit"
          >
            {isLoading ? (
              <>
                <span className="vault-spinner"></span>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <span className="vault-btn-arrow">→</span>
              </>
            )}
          </button>

          {/* Messages */}
          {message.text && (
            <div className={`vault-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>

        {/* Links */}
        <div className="vault-login-links">
          <p>
            Don't have an account?{' '}
            <button onClick={() => onSwitch('register')} className="vault-link-btn">
              Sign up here
            </button>
          </p>
          <p>
            Forgot your password?{' '}
            <button onClick={() => onSwitch('forgot-password')} className="vault-link-btn">
              Reset it
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="vault-login-footer">
          <span>🔒</span>
          <span>ENCRYPTED</span>
          <span className="vault-footer-divider">•</span>
          <span>🛡️</span>
          <span>HIPAA COMPLIANT</span>
          <span className="vault-footer-divider">•</span>
          <span>✅</span>
          <span>SECURE</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
