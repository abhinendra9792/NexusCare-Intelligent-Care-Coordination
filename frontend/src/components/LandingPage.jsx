import { useState } from 'react';

export default function LandingPage({ onGetStarted }) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const scrollToFeatures = () => {
    document.querySelector('.features-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const openDemo = () => {
    setShowVideo(true);
  };

  const closeDemo = () => {
    setShowVideo(false);
  };

  const features = [
    {
      icon: '�',
      title: 'JWT Authentication',
      desc: 'Stateless token-based auth with 7-day expiry and auto-logout.'
    },
    {
      icon: '📱',
      title: 'OTP Login System',
      desc: 'No passwords. 6-digit OTP using Node.js crypto.randomInt().'
    },
    {
      icon: '👨‍👩‍👧',
      title: 'Family Access Control',
      desc: 'Database-backed family connections with approval workflow.'
    },
    {
      icon: '🏥',
      title: 'Lab Portal',
      desc: 'Separate bcrypt-authenticated portal for diagnostic centers.'
    }
  ];

  return (
    <div className="landing-wrapper">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="landing-orb orb-1"></div>
        <div className="landing-orb orb-2"></div>
        <div className="landing-orb orb-3"></div>
        <div className="landing-grid"></div>
      </div>

      {/* Top Bar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="brand-icon">🏥</div>
          <span className="brand-name">Health Vault</span>
        </div>
        
        <div className="feature-ticker">
          <div className="ticker-content">
            <div className="ticker-item">
              <span className="ticker-icon">🔐</span>
              JWT AUTHENTICATION
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">🔒</span>
              BCRYPT HASHING
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">🎲</span>
              CRYPTO.RANDOMINT OTP
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">🗄️</span>
              POSTGRESQL DATABASE
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">⚡</span>
              NODE.JS + EXPRESS
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">⚛️</span>
              REACT 18 + VITE
            </div>
            {/* Duplicate for seamless loop */}
            <div className="ticker-item">
              <span className="ticker-icon">🔐</span>
              JWT AUTHENTICATION
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">🔒</span>
              BCRYPT HASHING
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">🎲</span>
              CRYPTO.RANDOMINT OTP
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">🗄️</span>
              POSTGRESQL DATABASE
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">⚡</span>
              NODE.JS + EXPRESS
            </div>
            <div className="ticker-item">
              <span className="ticker-icon">⚛️</span>
              REACT 18 + VITE
            </div>
          </div>
        </div>
        
        <button className="nav-login-btn" onClick={onGetStarted}>
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Open Source • Self-Hostable
        </div>
        
        <h1 className="hero-title">
          Your Health Records.
          <br />
          <span className="hero-title-gradient">Actually Encrypted.</span>
        </h1>
        
        <p className="hero-subtitle">
          Built with Node.js, PostgreSQL, and React. JWT authentication, bcrypt hashing, and crypto.randomInt OTP.
          <br />
          No marketing BS. Just real code you can inspect.
        </p>

        <div className="hero-cta-group">
          <button className="hero-cta-primary" onClick={onGetStarted}>
            <span className="cta-text">Try Demo</span>
            <span className="cta-arrow">→</span>
          </button>
          <button className="hero-cta-secondary" onClick={scrollToFeatures}>
            <span className="play-icon">⚙️</span>
            View Tech Stack
          </button>
        </div>

        <div className="hero-trust">
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span className="trust-text">JWT Tokens</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span className="trust-text">Bcrypt Hashing</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span className="trust-text">PostgreSQL</span>
          </div>
        </div>
      </section>

      {/* Tech Stack - Real Implementation */}
      <section className="tech-stack-section">
        <div className="tech-header">
          <h2 className="tech-title">Built with Production-Grade Security</h2>
          <p className="tech-subtitle">Real encryption, not marketing buzzwords</p>
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon">🔐</div>
            <div className="tech-name">JWT Authentication</div>
            <div className="tech-desc">Industry-standard JSON Web Tokens with 7-day expiry</div>
            <div className="tech-badge">jsonwebtoken</div>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🔒</div>
            <div className="tech-name">Bcrypt Password Hashing</div>
            <div className="tech-desc">Adaptive hashing with salt rounds for lab credentials</div>
            <div className="tech-badge">bcrypt</div>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🎲</div>
            <div className="tech-name">Crypto.randomInt OTP</div>
            <div className="tech-desc">Cryptographically secure random 6-digit OTP generation</div>
            <div className="tech-badge">Node.js crypto</div>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🗄️</div>
            <div className="tech-name">PostgreSQL Database</div>
            <div className="tech-desc">ACID-compliant relational database with connection pooling</div>
            <div className="tech-badge">pg</div>
          </div>

          <div className="tech-card">
            <div className="tech-icon">⚡</div>
            <div className="tech-name">Node.js + Express</div>
            <div className="tech-desc">High-performance REST API with middleware architecture</div>
            <div className="tech-badge">Express 4.x</div>
          </div>

          <div className="tech-card">
            <div className="tech-icon">⚛️</div>
            <div className="tech-name">React 18 Frontend</div>
            <div className="tech-desc">Modern UI with Vite build system for instant HMR</div>
            <div className="tech-badge">React + Vite</div>
          </div>
        </div>
      </section>

      {/* Why Choose Health Vault */}
      <section className="why-choose-section">
        <div className="why-header">
          <h2 className="why-title">Why Families Love Health Vault</h2>
          <p className="why-subtitle">More than just storage - it's peace of mind</p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-number">01</div>
            <div className="why-icon">🏥</div>
            <h3 className="why-card-title">Never Lose a Report</h3>
            <p className="why-card-desc">
              Remember searching everywhere for that one important blood test? 
              Those days are over. Every report, safely stored, instantly accessible.
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">02</div>
            <div className="why-icon">👨‍👩‍👧‍👦</div>
            <h3 className="why-card-title">Family at Your Fingertips</h3>
            <p className="why-card-desc">
              Managing parents' diabetes reports? Kids' vaccination records? 
              Share securely with family without WhatsApp screenshots.
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">03</div>
            <div className="why-icon">⚡</div>
            <h3 className="why-card-title">Emergency? No Problem</h3>
            <p className="why-card-desc">
              Doctor needs your ECG report urgently? Access everything 
              from your phone in seconds, anywhere, anytime.
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">04</div>
            <div className="why-icon">🔒</div>
            <h3 className="why-card-title">Your Data, Your Control</h3>
            <p className="why-card-desc">
              Your reports are encrypted and private. Only you decide 
              who sees them. No cloud company has access.
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">05</div>
            <div className="why-icon">💰</div>
            <h3 className="why-card-title">Actually Free Forever</h3>
            <p className="why-card-desc">
              No hidden fees, no premium plans, no credit card required. 
              Healthcare access shouldn't come with a price tag.
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">06</div>
            <div className="why-icon">📊</div>
            <h3 className="why-card-title">Track Your Health Journey</h3>
            <p className="why-card-desc">
              See your health data over time. Compare reports, spot trends, 
              and share insights during consultations.
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="testimonial-highlight">
          <div className="testimonial-quote">"</div>
          <p className="testimonial-text">
            Finally, a place where I can keep all my family's medical reports 
            without worrying about privacy or paying monthly fees. Game changer.
          </p>
          <div className="testimonial-author">
            <div className="author-avatar">👤</div>
            <div className="author-info">
              <div className="author-name">Priya M.</div>
              <div className="author-role">Mother of 2, Mumbai</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Core Features</h2>
          <p className="section-subtitle">
            Production-ready authentication and data management
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">Authentication Flow</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Request OTP</h3>
            <p className="step-desc">Enter phone number. Backend generates 6-digit OTP using crypto.randomInt().</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Verify OTP</h3>
            <p className="step-desc">Enter OTP. Backend validates and generates JWT token with 7-day expiry.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Access Dashboard</h3>
            <p className="step-desc">Token stored in sessionStorage. All API calls include Authorization header.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Want to try the demo?</h2>
          <p className="cta-subtitle">This is a development project showcasing modern full-stack architecture</p>
          <button className="cta-button-large" onClick={onGetStarted}>
            Launch Demo
            <span className="cta-sparkle">→</span>
          </button>
          <p className="cta-note">Local development environment • Not production-ready</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-icon">🏥</div>
            <span className="brand-name">Health Vault</span>
          </div>
          <div className="footer-tech-stack">
            <span className="footer-tech">Node.js</span>
            <span className="footer-tech">PostgreSQL</span>
            <span className="footer-tech">React</span>
            <span className="footer-tech">JWT</span>
            <span className="footer-tech">Bcrypt</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Health Vault • Demo Project • Not for Production Use</p>
        </div>
      </footer>
    </div>
  );
}
