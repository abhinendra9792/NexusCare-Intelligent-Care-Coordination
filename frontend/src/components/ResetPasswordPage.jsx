import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function ResetPasswordPage({ onResetSuccess }) {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = 'http://localhost:5000/api/auth';

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setMessage({ type: 'error', text: '❌ Invalid reset link. Please request a new one.' });
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: '❌ All fields are required' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '❌ Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Password reset successful! Redirecting to login...' });
        setTimeout(() => {
          if (onResetSuccess) {
            onResetSuccess();
          } else {
            window.location.href = '/';
          }
        }, 2000);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Failed to reset password'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="login-card">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <h2>Health Vault</h2>
          </div>

          <h1 className="page-title">Invalid Link</h1>

          <div className="login-form">
            <div className="message error">
              ❌ This password reset link is invalid or has expired.
            </div>

            <a href="/" style={{ textDecoration: 'none', display: 'block', marginTop: '20px' }}>
              <button className="send-otp-btn active" type="button" style={{ width: '100%' }}>
                Back to Login
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">🏥</div>
          <h2>Health Vault</h2>
        </div>

        <h1 className="page-title">Reset Your Password</h1>
        <p className="subtitle">Enter a new secure password</p>

        <div className="login-form">
          <div className="input-label">🔐 New Password</div>
          <input
            type="password"
            className="phone-input"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            autoFocus
          />

          <div className="input-label" style={{ marginTop: '15px' }}>🔐 Confirm Password</div>
          <input
            type="password"
            className="phone-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleResetPassword(e)}
          />

          <button
            className={`send-otp-btn ${!isLoading && newPassword && confirmPassword ? 'active' : ''}`}
            onClick={handleResetPassword}
            disabled={isLoading || !newPassword || !confirmPassword}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>

        <p className="footer-text">🔒 Your data is private & secure</p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
