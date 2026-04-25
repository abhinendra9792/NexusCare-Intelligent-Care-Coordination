import { useState, useEffect, useRef } from 'react';
import '../landing-styles.css';

export default function LandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [counter, setCounter] = useState({ records: 0, users: 0, uptime: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouse); };
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, entry.target.id]));
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Animated counter
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const targets = { records: 1000000, users: 50000, uptime: 99.9 };
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounter({
        records: Math.floor(targets.records * ease),
        users: Math.floor(targets.users * ease),
        uptime: +(targets.uptime * ease).toFixed(1)
      });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  return (
    <div className="hv-landing">
      {/* Animated Background */}
      <div className="hv-bg">
        <div className="hv-bg-gradient"></div>
        <div className="hv-bg-grid"></div>
        <div className="hv-bg-orb hv-bg-orb-1" style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}></div>
        <div className="hv-bg-orb hv-bg-orb-2" style={{ transform: `translate(${-mousePos.x * 20}px, ${-mousePos.y * 20}px)` }}></div>
        <div className="hv-bg-orb hv-bg-orb-3" style={{ transform: `translate(${mousePos.x * 15}px, ${-mousePos.y * 15}px)` }}></div>
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="hv-particle" style={{ '--i': i, '--x': `${Math.random() * 100}%`, '--y': `${Math.random() * 100}%`, '--d': `${8 + Math.random() * 15}s`, '--s': `${2 + Math.random() * 4}px` }}></div>
        ))}
      </div>

      {/* Navbar */}
      <nav className={`hv-nav ${scrollY > 50 ? 'hv-nav-scrolled' : ''}`}>
        <div className="hv-nav-inner">
          <div className="hv-logo">
            <div className="hv-logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#logoGrad)"/>
                <path d="M8 14h12M14 8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#06b6d4"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs>
              </svg>
            </div>
            <span className="hv-logo-text">HealthVault</span>
          </div>
          <div className="hv-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#ai">AI Analysis</a>
            <a href="#security">Security</a>
          </div>
          <button className="hv-nav-cta" onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hv-hero">
        <div className="hv-hero-content" style={{ transform: `translateY(${scrollY * 0.15}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
          <div className="hv-hero-badge">
            <span className="hv-badge-pulse"></span>
            <span>🧬 AI-Powered Health Intelligence</span>
          </div>
          <h1 className="hv-hero-title">
            Your Medical Records,<br/>
            <span className="hv-hero-gradient">Secure & Intelligent</span>
          </h1>
          <p className="hv-hero-sub">
            Store, analyze, and share your health records with military-grade encryption.
            Our AI reads your reports and gives you instant insights.
          </p>
          <div className="hv-hero-actions">
            <button className="hv-btn-primary" onClick={onGetStarted}>
              <span>Start Free Now</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="hv-btn-glass" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <span>Explore Features</span>
            </button>
          </div>
          <div className="hv-hero-stats">
            <div className="hv-stat"><span className="hv-stat-num">{counter.records >= 1000000 ? '1M+' : `${Math.floor(counter.records / 1000)}K`}</span><span className="hv-stat-label">Records Secured</span></div>
            <div className="hv-stat-divider"></div>
            <div className="hv-stat"><span className="hv-stat-num">{counter.users >= 50000 ? '50K+' : `${Math.floor(counter.users / 1000)}K`}</span><span className="hv-stat-label">Active Users</span></div>
            <div className="hv-stat-divider"></div>
            <div className="hv-stat"><span className="hv-stat-num">{counter.uptime}%</span><span className="hv-stat-label">Uptime</span></div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hv-hero-visual" style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
          <div className="hv-hero-mockup">
            <div className="hv-mockup-glow"></div>
            <div className="hv-mockup-card hv-mc-1"><span className="hv-mc-icon">📋</span><div><strong>Lab Report</strong><small>Blood Test • AI Analyzed ✓</small></div></div>
            <div className="hv-mockup-card hv-mc-2"><span className="hv-mc-icon">🧠</span><div><strong>AI Insight</strong><small>All values normal range</small></div></div>
            <div className="hv-mockup-card hv-mc-3"><span className="hv-mc-icon">💊</span><div><strong>Prescription</strong><small>Dr. Smith • Active</small></div></div>
            <div className="hv-mockup-card hv-mc-4"><span className="hv-mc-icon">🔗</span><div><strong>Shared Securely</strong><small>Expires in 24h</small></div></div>
            <div className="hv-mockup-center">
              <div className="hv-mc-shield">🛡️</div>
              <span>Your Vault</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" data-animate className={`hv-section ${isVisible('features') ? 'hv-visible' : ''}`}>
        <div className="hv-section-header">
          <span className="hv-section-badge">✨ Features</span>
          <h2>Everything You Need for<br/><span className="hv-hero-gradient">Complete Health Management</span></h2>
          <p>Powerful tools designed to give you full control over your medical data</p>
        </div>
        <div className="hv-features-grid">
          {[
            { icon: '🔐', title: 'End-to-End Encryption', desc: 'Military-grade AES-256 encryption. Your data is encrypted at rest and in transit.', color: '#06b6d4' },
            { icon: '🤖', title: 'AI Report Analysis', desc: 'Upload any report — our AI reads PDFs & images, identifies abnormal values, and explains findings.', color: '#8b5cf6' },
            { icon: '📤', title: 'Easy Upload & Storage', desc: 'Drag and drop PDFs, images, or photos of your prescriptions. Organized automatically.', color: '#3b82f6' },
            { icon: '🔗', title: 'Time-Limited Sharing', desc: 'Share reports with doctors via secure links that auto-expire in 1 hour to 30 days.', color: '#f59e0b' },
            { icon: '📊', title: 'Health Insights Dashboard', desc: 'Track blood sugar, BP, weight, and more. AI analyzes trends and flags concerns.', color: '#10b981' },
            { icon: '🚨', title: 'Emergency Access', desc: 'Critical health info accessible instantly. Emergency contacts, allergies, blood group.', color: '#ef4444' },
          ].map((f, i) => (
            <div key={i} className="hv-feature-card" style={{ '--accent': f.color, animationDelay: `${i * 0.1}s` }}>
              <div className="hv-feature-icon-wrap"><span>{f.icon}</span></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="hv-feature-shine"></div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" data-animate className={`hv-section hv-section-dark ${isVisible('how') ? 'hv-visible' : ''}`}>
        <div className="hv-section-header">
          <span className="hv-section-badge">🚀 How It Works</span>
          <h2>Get Started in<br/><span className="hv-hero-gradient">3 Simple Steps</span></h2>
        </div>
        <div className="hv-steps">
          {[
            { num: '01', title: 'Create Your Vault', desc: 'Sign up with email in under 2 minutes. Your encrypted vault is ready instantly.', icon: '🏗️' },
            { num: '02', title: 'Upload & Analyze', desc: 'Upload reports, prescriptions, scans. AI automatically reads and extracts key health data.', icon: '📄' },
            { num: '03', title: 'Share & Control', desc: 'Generate time-limited share links for doctors. Revoke access anytime with one click.', icon: '🔗' },
          ].map((s, i) => (
            <div key={i} className="hv-step" style={{ animationDelay: `${i * 0.2}s` }}>
              <div className="hv-step-num">{s.num}</div>
              <div className="hv-step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < 2 && <div className="hv-step-connector"><svg viewBox="0 0 100 20"><path d="M0 10 Q50 0 100 10" stroke="url(#connGrad)" strokeWidth="2" fill="none" strokeDasharray="5,5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/></path><defs><linearGradient id="connGrad"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs></svg></div>}
            </div>
          ))}
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" data-animate className={`hv-section ${isVisible('ai') ? 'hv-visible' : ''}`}>
        <div className="hv-ai-section">
          <div className="hv-ai-content">
            <span className="hv-section-badge">🧠 AI-Powered</span>
            <h2>Your Personal<br/><span className="hv-hero-gradient">Health AI Assistant</span></h2>
            <p>Our Gemini-powered AI reads your actual medical reports — PDFs, blood tests, scans — and provides instant, comprehensive analysis.</p>
            <ul className="hv-ai-list">
              <li><span className="hv-ai-check">✓</span>Reads PDF & image reports automatically</li>
              <li><span className="hv-ai-check">✓</span>Identifies abnormal values & flags concerns</li>
              <li><span className="hv-ai-check">✓</span>Explains findings in simple language</li>
              <li><span className="hv-ai-check">✓</span>Analyzes health metrics trends over time</li>
              <li><span className="hv-ai-check">✓</span>Provides personalized wellness recommendations</li>
            </ul>
            <button className="hv-btn-primary" onClick={onGetStarted}>
              <span>Try AI Analysis Free</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="hv-ai-visual">
            <div className="hv-ai-chat">
              <div className="hv-ai-msg hv-ai-user">Analyze my blood test report</div>
              <div className="hv-ai-msg hv-ai-bot">
                <strong>📊 Report Analysis Complete</strong><br/>
                ✅ Hemoglobin: 14.2 g/dL — Normal<br/>
                ⚠️ Cholesterol: 245 mg/dL — High<br/>
                ✅ Blood Sugar: 95 mg/dL — Normal<br/>
                <em>Recommendation: Dietary changes for cholesterol management...</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" data-animate className={`hv-section hv-section-dark ${isVisible('security') ? 'hv-visible' : ''}`}>
        <div className="hv-section-header">
          <span className="hv-section-badge">🛡️ Security</span>
          <h2>Bank-Level Security<br/><span className="hv-hero-gradient">For Your Health Data</span></h2>
        </div>
        <div className="hv-security-grid">
          {[
            { icon: '🔒', title: 'AES-256 Encryption', desc: 'Same encryption used by governments and banks' },
            { icon: '📜', title: 'HIPAA Compliant', desc: 'Meets all healthcare privacy regulations' },
            { icon: '📋', title: 'Full Audit Logs', desc: 'Track every access to your records' },
            { icon: '⏰', title: 'Auto-Expiring Links', desc: 'Shared links expire automatically' },
            { icon: '🔑', title: 'JWT Authentication', desc: 'Secure token-based authentication' },
            { icon: '💾', title: 'Encrypted Backups', desc: 'Your data is never lost, always safe' },
          ].map((s, i) => (
            <div key={i} className="hv-security-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="hv-sec-icon">{s.icon}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hv-cta">
        <div className="hv-cta-glow"></div>
        <h2>Ready to Secure Your<br/><span className="hv-hero-gradient">Health Records?</span></h2>
        <p>Join thousands who trust HealthVault with their most important data.</p>
        <button className="hv-btn-primary hv-btn-lg" onClick={onGetStarted}>
          <span>Create Free Account</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <p className="hv-cta-note">No credit card required • Free forever for personal use</p>
      </section>

      {/* Footer */}
      <footer className="hv-footer">
        <div className="hv-footer-inner">
          <div className="hv-footer-brand">
            <div className="hv-logo"><div className="hv-logo-icon"><svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="url(#logoGrad2)"/><path d="M8 14h12M14 8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><defs><linearGradient id="logoGrad2" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#06b6d4"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs></svg></div><span className="hv-logo-text">HealthVault</span></div>
            <p>AI-powered health record management. Secure, intelligent, personal.</p>
          </div>
          <div className="hv-footer-links">
            <div><h4>Product</h4><a href="#features">Features</a><a href="#ai">AI Analysis</a><a href="#security">Security</a></div>
            <div><h4>Company</h4><a href="#about">About</a><a href="#contact">Contact</a><a href="#privacy">Privacy Policy</a></div>
          </div>
        </div>
        <div className="hv-footer-bottom">
          <p>© 2026 HealthVault. All rights reserved. Built with 💙 for your health.</p>
        </div>
      </footer>
    </div>
  );
}
