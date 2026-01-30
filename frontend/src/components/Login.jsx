import { useState, useRef } from 'react';

function Login({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showOTPBox, setShowOTPBox] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef([]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
    // Clear message when user types
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (phone.length !== 10) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:3000/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: '+91' + phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '✅ OTP sent! Check terminal for code (SMS not integrated yet)'
        });
        setShowOTPBox(true);
        // Focus first OTP input
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
      } else {
        setMessage({
          type: 'error',
          text: data.error || '❌ Failed to send OTP. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Network error. Please check your connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidPhone = phone.length === 10;

  const handleOTPChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setMessage({ type: 'error', text: '❌ Please enter all 6 digits' });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+91' + phone, otp: otpValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use sessionStorage - clears when browser closes for better privacy
        sessionStorage.setItem('auth_token', data.token);
        setMessage({ type: 'success', text: '✅ Login successful!' });
        setTimeout(() => {
          onLoginSuccess();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Invalid OTP' });
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    setShowOTPBox(false);
    setOtp(['', '', '', '', '', '']);
    setPhone('');
    setMessage({ type: '', text: '' });
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setOtp(['', '', '', '', '', '']);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+91' + phone }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ New OTP sent! Check terminal' });
        otpRefs.current[0]?.focus();
      } else {
        setMessage({ type: 'error', text: '❌ Failed to resend OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Network error' });
    } finally {
      setIsLoading(false);
    }
  };

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

        <h1 className="page-title">Welcome Back!</h1>
        <p className="subtitle">Access your health records securely</p>

        <div className="login-form">
          <div className="input-label">📱 Phone Number</div>
          
          <div className={`phone-input-group ${isFocused ? 'focused' : ''} ${isValidPhone ? 'valid' : ''}`}>
            <div className="country-code">+91</div>
            <input
              type="tel"
              className="phone-input"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={10}
            />
            {isValidPhone && <span className="check-icon">✓</span>}
          </div>

          <button
            className={`send-otp-btn ${
              showOTPBox
                ? otp.join('').length === 6 && !isVerifying
                  ? 'active'
                  : ''
                : isValidPhone && !isLoading
                ? 'active'
                : ''
            }`}
            onClick={showOTPBox ? handleVerifyOTP : handleSendOTP}
            disabled={
              showOTPBox
                ? otp.join('').length !== 6 || isVerifying
                : !isValidPhone || isLoading
            }
            type="button"
          >
            {isLoading || isVerifying ? (
              <>
                <span className="spinner"></span>
                <span>{isLoading ? 'Sending OTP...' : 'Verifying...'}</span>
              </>
            ) : showOTPBox ? (
              <>
                <span>Verify OTP</span>
                <span className="arrow">✓</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>

          {showOTPBox && (
            <div className="otp-box-inline">
              <div className="otp-box-header">
                <span className="otp-instruction">📲 Enter 6-digit OTP</span>
              </div>
              <div className="otp-inputs-inline">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    className={`otp-digit ${digit ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <div className="otp-actions-inline">
                <button onClick={handleChangeNumber} className="otp-action-btn" type="button">
                  ← Change Number
                </button>
                <button onClick={handleResendOTP} className="otp-action-btn" type="button" disabled={isLoading}>
                  🔄 Resend OTP
                </button>
              </div>
              <div className="otp-hint">
                💡 Check backend terminal for OTP code
              </div>
            </div>
          )}

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {!message.text && (
            <p className="helper-text">
              We'll send a one-time password to your phone
            </p>
          )}
        </div>

        <p className="footer-text">🔒 Your data is private & secure</p>
      </div>
    </div>
  );
}

export default Login;
