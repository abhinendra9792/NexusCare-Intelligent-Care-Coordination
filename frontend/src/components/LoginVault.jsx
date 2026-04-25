import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

export default function LoginVault({ onLoginSuccess, onBack }) {
  const [page, setPage] = useState('login'); // 'login', 'register', 'forgot-password'

  const handleSwitch = (newPage) => {
    setPage(newPage);
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

      {/* Page Container */}
      <div className="login-page-container">
        {page === 'login' && (
          <>
            {onBack && (
              <button onClick={onBack} className="back-to-landing">
                ← Back to Home
              </button>
            )}
            <Login onLoginSuccess={onLoginSuccess} onSwitch={handleSwitch} />
          </>
        )}

        {page === 'register' && (
          <Register onSwitch={handleSwitch} />
        )}

        {page === 'forgot-password' && (
          <ForgotPassword onSwitch={handleSwitch} />
        )}
      </div>
    </div>
  );
}
