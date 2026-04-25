import { useState, useEffect } from 'react';

function HealthVault({ onLogout }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard, reports, family
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const [memberPhone, setMemberPhone] = useState('');
  const [memberName, setMemberName] = useState('');
  const [familyLoading, setFamilyLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingReport, setSharingReport] = useState(null);
  const [shareExpiry, setShareExpiry] = useState('24h');
  const [shareLink, setShareLink] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [accessLogsModalOpen, setAccessLogsModalOpen] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);
  const [logsReport, setLogsReport] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // PDF View Handler - Secure streaming from backend
  const handleViewReport = async (report) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      
      if (!token) {
        alert('Session expired. Please login again.');
        return;
      }

      setViewingReport(report);

      // Fetch PDF from backend with authentication
      const response = await fetch(`http://localhost:5000/api/reports/${report.report_id}/view`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }

      // Get PDF blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Open in new tab (read-only, no download by default)
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        alert('Please allow pop-ups to view reports');
      }

      // Clean up blob URL after opening
      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (err) {
      console.error('Error viewing PDF:', err);
      alert('Failed to open report. Please try again.');
    }
  };

  // Family Access Functions
  const fetchFamilyMembers = async () => {
    try {
      setFamilyLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/family/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setFamilyMembers(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching family members:', err);
    } finally {
      setFamilyLoading(false);
    }
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    
    if (!memberPhone || memberPhone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setFamilyLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:5000/api/family/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          family_phone: `+91${memberPhone}`,
          family_name: memberName || 'Family Member'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Access request sent! Family member will receive an OTP to approve.');
        setMemberPhone('');
        setMemberName('');
        setAddingMember(false);
        fetchFamilyMembers();
      } else {
        alert(result.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error adding family member:', err);
      alert('Failed to add family member');
    } finally {
      setFamilyLoading(false);
    }
  };

  const handleRevokeFamilyAccess = async (linkId) => {
    if (!confirm('Are you sure you want to revoke access?')) return;

    try {
      const token = sessionStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:5000/api/family/revoke/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Access revoked successfully');
        fetchFamilyMembers();
      } else {
        alert('Failed to revoke access');
      }
    } catch (err) {
      console.error('Error revoking access:', err);
      alert('Failed to revoke access');
    }
  };

  useEffect(() => {
    if (view === 'family') {
      fetchFamilyMembers();
    }
  }, [view]);

  // Share Link Functions
  const handleShareReport = (report) => {
    setSharingReport(report);
    setShareModalOpen(true);
    setShareLink(null);
  };

  const generateShareLink = async () => {
    try {
      setShareLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:5000/api/reports/${sharingReport.report_id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expiry: shareExpiry
        })
      });

      const result = await response.json();

      if (result.success) {
        const fullLink = `${window.location.origin}/share/${result.data.token}`;
        setShareLink(fullLink);
      } else {
        alert(result.error || 'Failed to generate share link');
      }
    } catch (err) {
      console.error('Error generating share link:', err);
      alert('Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setSharingReport(null);
    setShareLink(null);
    setShareExpiry('24h');
  };

  // Access Logs & Revoke Functions
  const handleViewAccessLogs = async (report) => {
    setLogsReport(report);
    setAccessLogsModalOpen(true);
    setLogsLoading(true);
    
    try {
      const token = sessionStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:5000/api/reports/${report.report_id}/share-logs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setAccessLogs(result.data);
      } else {
        alert(result.error || 'Failed to fetch access logs');
      }
    } catch (err) {
      console.error('Error fetching access logs:', err);
      alert('Failed to fetch access logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRevokeShareLink = async (shareId) => {
    if (!confirm('⚠️ Are you sure you want to revoke this link?\n\nAnyone with this link will no longer be able to view the report.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:5000/api/reports/share/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Link revoked successfully!\n\nNobody can view this report with that link anymore.');
        handleViewAccessLogs(logsReport); // Refresh logs
      } else {
        alert(result.error || 'Failed to revoke link');
      }
    } catch (err) {
      console.error('Error revoking link:', err);
      alert('Failed to revoke link');
    }
  };

  const closeAccessLogsModal = () => {
    setAccessLogsModalOpen(false);
    setLogsReport(null);
    setAccessLogs([]);
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = sessionStorage.getItem('auth_token');
      
      if (!token) {
        setError('No authentication token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setReports(Array.isArray(result.data) ? result.data : []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReports().finally(() => setIsRefreshing(false));
  };

  // Get latest report date
  const latestReportDate = reports.length > 0 
    ? new Date(Math.max(...reports.map(r => new Date(r.created_at)))).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    : 'No reports yet';

  // Detect test category from report name
  const detectCategory = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('blood') || name.includes('cbc') || name.includes('hemoglobin') || name.includes('glucose') || name.includes('lipid')) {
      return { label: 'Blood Test', icon: '🩸' };
    }
    if (name.includes('x-ray') || name.includes('xray') || name.includes('radiograph')) {
      return { label: 'Imaging', icon: '📸' };
    }
    if (name.includes('mri') || name.includes('ct') || name.includes('scan') || name.includes('ultrasound')) {
      return { label: 'Scan', icon: '🔬' };
    }
    if (name.includes('urine') || name.includes('stool')) {
      return { label: 'Lab Test', icon: '🧪' };
    }
    return { label: 'Report', icon: '📄' };
  };

  // Render Dashboard View (REDESIGNED)
  const renderDashboard = () => (
    <div className="dashboard-content">
      {/* Hero Section */}
      <div className="vault-hero-section">
        <h1 className="hero-main-title">Your Health Vault</h1>
        <p className="hero-main-subtitle">A private record of your medical history</p>
      </div>

      {/* Health Overview - One Strong Card */}
      <div className="health-overview-card">
        <div className="overview-section">
          <div className="overview-label">Medical Reports</div>
          <div className="overview-value">{reports.length}</div>
        </div>
        <div className="overview-divider"></div>
        <div className="overview-section">
          <div className="overview-label">Last Updated</div>
          <div className="overview-value">{reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}</div>
        </div>
        <div className="overview-divider"></div>
        <div className="overview-section">
          <div className="overview-label">Family Connected</div>
          <div className="overview-value">0</div>
        </div>
      </div>

      {/* Recent Medical Events */}
      <div className="medical-events-section">
        <div className="section-header">
          <h2 className="section-title">Recent Medical Events</h2>
          {reports.length > 0 && (
            <button className="view-all-link" onClick={() => setView('reports')}>
              View all →
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="events-empty">
            <div className="empty-state-icon">🏥</div>
            <h3 className="empty-state-title">No medical events yet</h3>
            <p className="empty-state-text">
              Your diagnostic reports will appear here automatically when labs upload them.
            </p>
          </div>
        ) : (
          <div className="events-timeline-preview">
            {reports.slice(0, 3).map((report) => {
              const category = detectCategory(report.file_name);
              return (
                <div key={report.report_id} className="event-preview-item" onClick={() => handleViewReport(report)} style={{ cursor: 'pointer' }}>
                  <div className="event-preview-marker"></div>
                  <div className="event-preview-content">
                    <div className="event-preview-header">
                      <div className="event-preview-left">
                        <span className="event-category-icon">{category.icon}</span>
                        <span className="event-category-label">{category.label}</span>
                      </div>
                      <span className="event-privacy-badge">Private</span>
                    </div>
                    <h3 className="event-preview-title">{report.file_name}</h3>
                    <div className="event-preview-meta">
                      <span className="event-lab">{report.lab_name}</span>
                      <span className="event-meta-sep">·</span>
                      <span className="event-date">
                        {new Date(report.created_at).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Group reports by year for timeline view
  const groupReportsByYear = () => {
    const grouped = {};
    reports.forEach(report => {
      const year = new Date(report.created_at).getFullYear();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(report);
    });
    return Object.keys(grouped)
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        reports: grouped[year].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }));
  };

  // Calculate days ago helper
  const getDaysAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return null;
  };

  // Render Reports List View (Premium Health Vault Timeline)
  const renderReports = () => {
    const timelineData = groupReportsByYear();
    const lastUpdateDays = reports.length > 0 ? getDaysAgo(reports[0]?.created_at) : null;

    return (
      <div className="vault-reports-view">
        {/* Vault Header */}
        <div className="vault-header">
          <div className="vault-header-content">
            <button className="vault-back-btn" onClick={() => setView('dashboard')}>
              ← Back
            </button>
            <div className="vault-header-main">
              <h1 className="vault-title">Medical History Timeline</h1>
              <p className="vault-subtitle">Your complete health records, organized chronologically</p>
            </div>
          </div>
        </div>

        {/* Health Snapshot */}
        <div className="health-snapshot">
          <div className="snapshot-item">
            <span className="snapshot-label">Reports</span>
            <span className="snapshot-value">{reports.length}</span>
          </div>
          <div className="snapshot-divider"></div>
          <div className="snapshot-item">
            <span className="snapshot-label">Last update</span>
            <span className="snapshot-value">{lastUpdateDays || 'No reports'}</span>
          </div>
          <div className="snapshot-spacer"></div>
          <button className="snapshot-refresh" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? '⏳' : '↻'} {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Timeline or Empty State */}
        {reports.length === 0 ? (
          <div className="vault-empty-state">
            <div className="empty-icon">🏥</div>
            <h3 className="empty-title">Your vault is ready</h3>
            <p className="empty-description">
              Your diagnostic reports will appear here automatically when labs upload them.
              <br />
              You don't need to track anything manually.
            </p>
            <div className="empty-features">
              <div className="empty-feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">View-only access</span>
              </div>
              <div className="empty-feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Private & encrypted</span>
              </div>
              <div className="empty-feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Access logged</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="vault-timeline">
            {timelineData.map(({ year, reports: yearReports }) => (
              <div key={year} className="timeline-year-section">
                <div className="timeline-year-header">
                  <div className="year-badge">{year}</div>
                  <div className="year-line"></div>
                </div>

                <div className="timeline-entries">
                  {yearReports.map((report) => {
                    const category = detectCategory(report.file_name);
                    return (
                      <div key={report.report_id} className="vault-entry">
                        <div className="entry-marker"></div>
                        <div className="entry-card">
                          <div className="entry-content">
                            <div className="entry-header-row">
                              <div className="entry-category">
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.label}</span>
                              </div>
                              <span className="entry-privacy">Private</span>
                            </div>
                            <h3 className="entry-title">{report.file_name}</h3>
                            <div className="entry-meta">
                              <span className="entry-lab">{report.lab_name}</span>
                              <span className="entry-separator">·</span>
                              <span className="entry-date">
                                {new Date(report.created_at).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="entry-actions-group">
                            <button className="entry-action" onClick={() => handleViewReport(report)}>View</button>
                            <button className="entry-action-secondary" onClick={() => handleShareReport(report)}>Share</button>
                            <button className="entry-action-secondary" onClick={() => handleViewAccessLogs(report)} style={{background: '#1e293b', color: '#94a3b8'}}>
                              Access & Revoke
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Family Access View
  const renderFamily = () => (
    <div className="family-access-view">
      <div className="vault-header">
        <div className="vault-header-content">
          <button className="vault-back-btn" onClick={() => setView('dashboard')}>
            ← Back
          </button>
          <div className="vault-header-main">
            <h1 className="vault-title">Family Access</h1>
            <p className="vault-subtitle">Share read-only access to your medical reports</p>
          </div>
        </div>
      </div>

      {/* Add Family Member Section */}
      {!addingMember ? (
        <div className="family-add-section">
          <button className="family-add-btn" onClick={() => setAddingMember(true)}>
            + Add Family Member
          </button>
        </div>
      ) : (
        <div className="family-add-form-card">
          <h3 className="form-card-title">Add Family Member</h3>
          <form onSubmit={handleAddFamilyMember} className="family-add-form">
            <div className="form-field">
              <label className="form-label">Name (Optional)</label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g., Mother, Father, Spouse"
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Phone Number *</label>
              <div className="phone-input-group">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="form-input phone-input"
                  required
                />
              </div>
              <p className="form-hint">Family member will receive an OTP to approve access</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="form-submit-btn" disabled={familyLoading}>
                {familyLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button type="button" className="form-cancel-btn" onClick={() => {
                setAddingMember(false);
                setMemberPhone('');
                setMemberName('');
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Family Members List */}
      <div className="family-members-section">
        <h3 className="section-subtitle">Connected Family Members</h3>
        
        {familyLoading ? (
          <div className="family-loading">
            <div className="loading-spinner"></div>
            <p>Loading family members...</p>
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="family-empty">
            <div className="empty-icon">👨‍👩‍👧</div>
            <h4 className="empty-subtitle">No family members connected</h4>
            <p className="empty-text">
              Add family members to give them read-only access to your medical reports.
              They'll need to approve via OTP.
            </p>
          </div>
        ) : (
          <div className="family-members-list">
            {familyMembers.map((member) => (
              <div key={member.link_id} className="family-member-card">
                <div className="member-avatar">
                  <span className="member-icon">👤</span>
                </div>
                <div className="member-info">
                  <h4 className="member-name">{member.family_name || 'Family Member'}</h4>
                  <p className="member-phone">{member.family_phone}</p>
                  <span className={`member-status ${member.status.toLowerCase()}`}>
                    {member.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>
                {member.status === 'approved' && (
                  <button 
                    className="member-revoke-btn"
                    onClick={() => handleRevokeFamilyAccess(member.link_id)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Features */}
      <div className="family-trust-section">
        <h4 className="trust-title">How Family Access Works</h4>
        <div className="trust-features">
          <div className="trust-feature">
            <span className="trust-icon">🔒</span>
            <div className="trust-content">
              <h5 className="trust-feature-title">Read-Only Access</h5>
              <p className="trust-feature-text">Family members can only view reports, not edit or delete</p>
            </div>
          </div>
          <div className="trust-feature">
            <span className="trust-icon">📱</span>
            <div className="trust-content">
              <h5 className="trust-feature-title">OTP Verification</h5>
              <p className="trust-feature-text">Family member must approve via OTP for security</p>
            </div>
          </div>
          <div className="trust-feature">
            <span className="trust-icon">📊</span>
            <div className="trust-content">
              <h5 className="trust-feature-title">Access Logging</h5>
              <p className="trust-feature-text">Every view is logged for your security</p>
            </div>
          </div>
          <div className="trust-feature">
            <span className="trust-icon">⏹️</span>
            <div className="trust-content">
              <h5 className="trust-feature-title">Revoke Anytime</h5>
              <p className="trust-feature-text">You can remove access instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="health-vault-wrapper">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Top Navigation */}
      <div className="vault-topnav">
        <div className="topnav-left">
          <div className="logo-minimal">
            <div className="logo-icon-minimal">🏥</div>
            <span className="logo-text">Health Vault</span>
          </div>
        </div>
        <div className="topnav-right">
          <button className="nav-tab" data-active={view === 'dashboard'} onClick={() => setView('dashboard')}>
            Dashboard
          </button>
          <button className="nav-tab" data-active={view === 'reports'} onClick={() => setView('reports')}>
            Reports
          </button>
          <button className="nav-tab" data-active={view === 'family'} onClick={() => setView('family')}>
            Family
          </button>
          {onLogout && (
            <button onClick={onLogout} className="logout-btn-modern">
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="vault-content-area">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your health data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={handleRefresh}>Try Again</button>
          </div>
        ) : (
          <>
            {view === 'dashboard' && renderDashboard()}
            {view === 'reports' && renderReports()}
            {view === 'family' && renderFamily()}
          </>
        )}
      </div>

      {/* Security Badge */}
      <div className="security-badge">
        <span className="security-icon">🔒</span>
        <span className="security-text">End-to-end encrypted</span>
      </div>

      {/* Share Link Modal */}
      {shareModalOpen && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3 className="share-modal-title">Share Report</h3>
              <button className="share-modal-close" onClick={closeShareModal}>✕</button>
            </div>

            <div className="share-modal-content">
              <div className="share-report-info">
                <span className="share-report-icon">📄</span>
                <div className="share-report-details">
                  <h4 className="share-report-name">{sharingReport?.file_name}</h4>
                  <p className="share-report-lab">{sharingReport?.lab_name}</p>
                </div>
              </div>

              {!shareLink ? (
                <>
                  <div className="share-expiry-section">
                    <label className="share-label">Link expires in:</label>
                    <div className="share-expiry-options">
                      <button 
                        className={`expiry-option ${shareExpiry === '24h' ? 'active' : ''}`}
                        onClick={() => setShareExpiry('24h')}
                      >
                        24 Hours
                      </button>
                      <button 
                        className={`expiry-option ${shareExpiry === '7d' ? 'active' : ''}`}
                        onClick={() => setShareExpiry('7d')}
                      >
                        7 Days
                      </button>
                      <button 
                        className={`expiry-option ${shareExpiry === '30d' ? 'active' : ''}`}
                        onClick={() => setShareExpiry('30d')}
                      >
                        30 Days
                      </button>
                    </div>
                  </div>

                  <div className="share-security-note">
                    <span className="security-note-icon">🔒</span>
                    <div className="security-note-text">
                      <strong>Secure & Private</strong>
                      <p>Link is view-only, time-limited, and can be revoked anytime</p>
                    </div>
                  </div>

                  <button 
                    className="share-generate-btn"
                    onClick={generateShareLink}
                    disabled={shareLoading}
                  >
                    {shareLoading ? 'Generating...' : 'Generate Share Link'}
                  </button>
                </>
              ) : (
                <div className="share-link-generated">
                  <div className="share-link-success">
                    <span className="success-icon">✓</span>
                    <span className="success-text">Link generated successfully!</span>
                  </div>

                  <div className="share-link-box">
                    <input 
                      type="text" 
                      value={shareLink} 
                      readOnly 
                      className="share-link-input"
                    />
                    <button className="share-copy-btn" onClick={copyShareLink}>
                      Copy
                    </button>
                  </div>

                  <div className="share-link-info">
                    <p className="share-info-text">
                      ⏱ Expires in {shareExpiry === '24h' ? '24 hours' : shareExpiry === '7d' ? '7 days' : '30 days'}
                    </p>
                    <p className="share-info-text">
                      👁 View-only access (no download)
                    </p>
                  </div>

                  <button className="share-done-btn" onClick={closeShareModal}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Access Logs & Revoke Modal */}
      {accessLogsModalOpen && (
        <div className="share-modal-overlay" onClick={closeAccessLogsModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <div className="share-modal-header">
              <h3 className="share-modal-title">Share Access & Control</h3>
              <button className="share-modal-close" onClick={closeAccessLogsModal}>✕</button>
            </div>

            <div className="share-modal-content">
              <div className="share-report-info">
                <span className="share-report-icon">📄</span>
                <div className="share-report-details">
                  <h4 className="share-report-name">{logsReport?.file_name}</h4>
                  <p className="share-report-lab">{logsReport?.lab_name}</p>
                </div>
              </div>

              {logsLoading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                  Loading access logs...
                </div>
              ) : accessLogs.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                  <p>No share links created yet for this report.</p>
                  <p style={{fontSize: '13px', marginTop: '8px'}}>Click "Share" button to create a link</p>
                </div>
              ) : (
                <div className="access-logs-container">
                  {accessLogs.map((log) => (
                    <div key={log.share_id} className="access-log-item" style={{
                      background: log.revoked_at ? '#1e1e1e' : '#0f1419',
                      border: '1px solid #262626',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px'}}>
                            <span style={{fontSize: '13px', fontWeight: '500', color: log.revoked_at ? '#ef4444' : '#22c55e'}}>
                              {log.revoked_at ? '🚫 REVOKED' : '✓ ACTIVE'}
                            </span>
                            {!log.revoked_at && new Date(log.expires_at) < new Date() && (
                              <span style={{fontSize: '13px', fontWeight: '500', color: '#f59e0b'}}>⏱ EXPIRED</span>
                            )}
                          </div>
                          <p style={{fontSize: '12px', color: '#64748b', margin: '4px 0'}}>
                            Created: {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString()}
                          </p>
                          <p style={{fontSize: '12px', color: '#64748b', margin: '4px 0'}}>
                            Expires: {new Date(log.expires_at).toLocaleDateString()} at {new Date(log.expires_at).toLocaleTimeString()}
                          </p>
                          {log.revoked_at && (
                            <p style={{fontSize: '12px', color: '#ef4444', margin: '4px 0'}}>
                              Revoked: {new Date(log.revoked_at).toLocaleDateString()} at {new Date(log.revoked_at).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        {!log.revoked_at && new Date(log.expires_at) > new Date() && (
                          <button 
                            onClick={() => handleRevokeShareLink(log.share_id)}
                            style={{
                              background: '#991b1b',
                              color: '#fecaca',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#7f1d1d'}
                            onMouseOut={(e) => e.target.style.background = '#991b1b'}
                          >
                            Revoke Link
                          </button>
                        )}
                      </div>

                      <div style={{borderTop: '1px solid #262626', paddingTop: '12px', marginTop: '12px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                          <span style={{fontSize: '13px', fontWeight: '500', color: '#e2e8f0'}}>
                            👁 Access History
                          </span>
                          <span style={{fontSize: '13px', color: '#3b82f6', fontWeight: '500'}}>
                            {log.access_count} {log.access_count === 1 ? 'view' : 'views'}
                          </span>
                        </div>

                        {log.access_count > 0 ? (
                          <div style={{maxHeight: '150px', overflowY: 'auto'}}>
                            {log.accesses.map((access, idx) => (
                              <div key={idx} style={{
                                background: '#1a1a1a',
                                padding: '8px',
                                borderRadius: '4px',
                                marginBottom: '6px',
                                fontSize: '12px'
                              }}>
                                <div style={{color: '#94a3b8', marginBottom: '4px'}}>
                                  📍 IP: <span style={{color: '#e2e8f0', fontFamily: 'monospace'}}>{access.ip_address}</span>
                                </div>
                                <div style={{color: '#64748b'}}>
                                  🕐 {new Date(access.accessed_at).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: '8px 0'}}>
                            No one has viewed this link yet
                          </p>
                        )}
                      </div>

                      {log.access_count > 0 && log.access_count !== log.accesses.length && (
                        <div style={{fontSize: '11px', color: '#64748b', marginTop: '8px', fontStyle: 'italic'}}>
                          + {log.access_count - log.accesses.length} more {log.access_count - log.accesses.length === 1 ? 'view' : 'views'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button className="share-done-btn" onClick={closeAccessLogsModal} style={{marginTop: '16px'}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthVault;
