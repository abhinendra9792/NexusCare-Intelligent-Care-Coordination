import { useState } from 'react';

export default function LoginVault({ onLoginSuccess, onBack }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('phone'); // 'phone' or 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });

      const data = await response.json();

      if (response.ok) {
        setStage('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('auth_token', data.token);
        onLoginSuccess();
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-vault-wrapper">
      {/* Animated Vault Background */}
      <div className="vault-bg">
        <div className="vault-orb vault-orb-1"></div>
        <div className="vault-orb vault-orb-2"></div>
        <div className="vault-orb vault-orb-3"></div>
        <div className="vault-scanlines"></div>
        <div className="vault-grid"></div>
      </div>

      {/* Login Card */}
      <div className="login-vault-card">
        {/* Back to Landing Button */}
        {onBack && stage === 'phone' && (
          <button onClick={onBack} className="back-to-landing">
            ← Back to Home
          </button>
        )}

        {/* Brand Header */}
        <div className="vault-brand-header">
          <div className="vault-logo">
            <div className="vault-logo-ring"></div>
            <div className="vault-logo-inner">
              <span className="vault-logo-icon">🏥</span>
            </div>
          </div>
          <h1 className="vault-brand-name">Health Vault</h1>
        </div>

        {/* Hero Headline */}
        <div className="vault-hero">
          <h2 className="vault-headline">
            Your health.
            <br />
            <span className="vault-headline-gradient">Secured for life.</span>
          </h2>
          <p className="vault-tagline">
            Military-grade encryption meets effortless access
          </p>
        </div>

        {/* Login Form */}
        {stage === 'phone' ? (
          <form onSubmit={sendOTP} className="vault-form">
            {onBack && (
              <div className="otp-header">
                <button 
                  type="button"
                  onClick={onBack}
                  className="back-btn-vault"
                >
                  ← Back
                </button>
              </div>
            )}
            
            <div className="form-group-vault">
              <label className="vault-label">Phone Number</label>
              <div className="phone-input-vault">
                <div className="country-prefix">
                  <span className="flag">🇮🇳</span>
                  <span className="code">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="vault-input"
                  maxLength="10"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="vault-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="vault-cta-button"
              disabled={isLoading || phone.length !== 10}
            >
              <span className="cta-text">
                {isLoading ? 'Securing...' : 'Continue Securely'}
              </span>
              <span className="cta-icon">
                {isLoading ? '⏳' : '→'}
              </span>
            </button>

            <button 
              type="button"
              className="resend-btn-vault"
              style={{ opacity: 0, pointerEvents: 'none' }}
            >
              Spacer
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="vault-form">
            <div className="otp-header">
              <button 
                type="button"
                onClick={() => { setStage('phone'); setOtp(''); setError(''); }}
                className="back-btn-vault"
              >
                ← Back
              </button>
              <p className="otp-sent-msg">
                Code sent to <strong>+91 {phone}</strong>
              </p>
            </div>

            <div className="form-group-vault">
              <label className="vault-label">Enter 6-Digit Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="vault-input otp-input-vault"
                maxLength="6"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="vault-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="vault-cta-button"
              disabled={isLoading || otp.length !== 6}
            >
              <span className="cta-text">
                {isLoading ? 'Verifying...' : 'Unlock Vault'}
              </span>
              <span className="cta-icon">
                {isLoading ? '⏳' : '🔓'}
              </span>
            </button>

            <button 
              type="button"
              onClick={sendOTP}
              className="resend-btn-vault"
              disabled={isLoading}
            >
              Resend Code
            </button>
          </form>
        )}

        {/* Security Badge */}
        <div className="vault-security-footer">
          <span className="security-text-simple">ENCRYPTED</span>
          <span className="security-divider">•</span>
          <span className="security-text-simple">PRIVATE</span>
          <span className="security-divider">•</span>
          <span className="security-text-simple">AUDIT-LOGGED</span>
        </div>
      </div>
    </div>
  );
}
