import { useState } from 'react';

export default function ForgotPassword({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const API_URL = 'http://localhost:5000/api/auth';

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email) {
      setMessage({ type: 'error', text: '❌ Please enter your email' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ ' + data.message });
        setEmailSent(true);
        setTimeout(() => {
          setEmail('');
          setEmailSent(false);
        }, 5000);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && email && !isLoading && !emailSent) {
      handleForgotPassword(e);
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
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {/* Form */}
        <form className="vault-login-form" onSubmit={handleForgotPassword}>
          <div className="vault-form-group">
            <label className="vault-form-label">📧 Email Address</label>
            <input
              type="email"
              className="vault-form-input"
              placeholder="your.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || emailSent}
              autoFocus
              id="forgot-email"
            />
          </div>

          <button
            className={`vault-submit-btn ${!isLoading && email && !emailSent ? 'active' : ''}`}
            type="submit"
            disabled={isLoading || emailSent || !email}
            id="forgot-submit"
          >
            {isLoading ? (
              <>
                <span className="vault-spinner"></span>
                <span>Sending...</span>
              </>
            ) : emailSent ? (
              <span>✓ Email Sent</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <span className="vault-btn-arrow">→</span>
              </>
            )}
          </button>

          {message.text && (
            <div className={`vault-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {emailSent && (
            <div className="vault-info-box">
              <p>📧 Check your email for a password reset link. The link expires in 1 hour.</p>
            </div>
          )}
        </form>

        {/* Links */}
        <div className="vault-login-links">
          <p>
            Remember your password?{' '}
            <button onClick={() => onSwitch('login')} className="vault-link-btn">
              Login here
            </button>
          </p>
          <p>
            Don't have an account?{' '}
            <button onClick={() => onSwitch('register')} className="vault-link-btn">
              Sign up
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="vault-login-footer">
          <span>🔒</span>
          <span>SECURE</span>
        </div>
      </div>
    </div>
  );
}
