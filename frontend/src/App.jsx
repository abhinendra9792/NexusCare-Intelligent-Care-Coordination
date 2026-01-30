import { useState, useEffect } from 'react';
import './styles.css';
import LandingPage from './components/LandingPage';
import LoginVault from './components/LoginVault';
import HealthVault from './components/HealthVault';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'dashboard', 'share'
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Use sessionStorage for better security - clears on browser close
    return !!sessionStorage.getItem('auth_token');
  });
  const [shareToken, setShareToken] = useState(null);

  // Check if URL has share token
  useEffect(() => {
    const path = window.location.pathname;
    const shareMatch = path.match(/\/share\/([a-f0-9-]+)/);
    if (shareMatch) {
      const token = shareMatch[1];
      setShareToken(token);
      setView('share');
      // Open PDF directly
      window.location.href = `http://localhost:3000/api/reports/view/${token}`;
    }
  }, []);

  const handleGetStarted = () => {
    setView('login');
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    // Clear all auth data
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setView('landing');
  };

  // If already logged in, show dashboard directly
  if (isLoggedIn) {
    return <HealthVault onLogout={handleLogout} />;
  }

  // Show login or landing based on view
  if (view === 'login') {
    return <LoginVault onLoginSuccess={handleLoginSuccess} onBack={handleBackToLanding} />;
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}

export default App;
