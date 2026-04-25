import { useState, useEffect } from 'react';
import RecordUpload from './RecordUpload';
import HealthInsights from './HealthInsights';
import MedicineReminders from './MedicineReminders';
import EmergencyMode from './EmergencyMode';
import HealthTimeline from './HealthTimeline';
import AIHealthAssistant from './AIHealthAssistant';
import WearablesIntegration from './WearablesIntegration';
import UserProfilePanel from './UserProfilePanel';
import '../components/features-styles.css';
import '../components/comprehensive-dashboard.css';

export default function ComprehensiveDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(user);
  const [greeting, setGreeting] = useState('');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [aiAnalysisReport, setAiAnalysisReport] = useState(null);

  const getToken = () => sessionStorage.getItem('auth_token');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
    else setGreeting('Good Night');
    fetchUserProfile();
    fetchReports();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        setUserData(prev => ({ ...prev, ...result.user }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setReports(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.report_id !== reportId));
        setPreviewReport(null);
        alert('✅ Report deleted successfully!');
        fetchUserProfile();
      } else {
        alert('❌ Failed to delete report.');
      }
    } catch (err) {
      alert('❌ Error deleting report.');
    }
  };

  const handleViewReport = async (report) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/reports/${report.report_id}/view`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { alert('❌ Failed to load report'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      alert('❌ Error loading report');
    }
  };

  const handleAskAI = async (report) => {
    // Use dedicated report analysis API that reads the actual file
    setActiveTab('assistant');
    setAiAnalysisReport({
      ...report,
      _customQuestion: null,
      _isFileAnalysis: true
    });
  };

  const handleAskAIText = (text) => {
    setAiAnalysisReport({ file_name: 'Health Metrics', report_type: 'health-insights', created_at: new Date().toISOString(), _customQuestion: text });
    setActiveTab('assistant');
  };

  const [shareModal, setShareModal] = useState(null);

  const handleShareReport = (report) => {
    setShareModal(report);
  };

  const executeShare = async (report, expiry) => {
    setShareModal(null);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/reports/${report.report_id}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiry })
      });
      if (res.ok) {
        const result = await res.json();
        const shareUrl = `${window.location.origin}/share/${result.data.token}`;
        await navigator.clipboard.writeText(shareUrl).catch(() => {});
        const expiryText = expiry === '1h' ? '1 hour' : expiry === '24h' ? '24 hours' : expiry === '7d' ? '7 days' : '30 days';
        alert(`✅ Share link created (valid ${expiryText})!\n\nLink copied to clipboard:\n${shareUrl}\n\nThe link will automatically expire after ${expiryText}.`);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`❌ ${err.error || 'Failed to create share link'}`);
      }
    } catch (err) {
      alert('❌ Error creating share link');
    }
  };

  const getFileIcon = (name) => {
    if (!name) return '📄';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (['jpg','jpeg','png'].includes(ext)) return '🖼️';
    if (['doc','docx'].includes(ext)) return '📝';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDisplayName = () => {
    if (userData?.first_name) return userData.first_name;
    if (userData?.full_name) return userData.full_name.split(' ')[0];
    if (userData?.email) return userData.email.split('@')[0];
    return 'User';
  };

  const getInitials = () => {
    const f = (userData?.first_name || '').charAt(0).toUpperCase();
    const l = (userData?.last_name || '').charAt(0).toUpperCase();
    return f + l || userData?.email?.charAt(0).toUpperCase() || '?';
  };

  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview', color: '#3b82f6' },
    { id: 'profile', icon: '👤', label: 'My Profile', color: '#8b5cf6' },
    { id: 'records', icon: '📄', label: 'Upload Records', color: '#6366f1' },
    { id: 'insights', icon: '📈', label: 'Health Insights', color: '#ec4899' },
    { id: 'reminders', icon: '💊', label: 'Reminders', color: '#f59e0b' },
    { id: 'emergency', icon: '🚨', label: 'Emergency', color: '#ef4444' },
    { id: 'timeline', icon: '🧬', label: 'Timeline', color: '#06b6d4' },
    { id: 'assistant', icon: '🤖', label: 'AI Assistant', color: '#10b981' },
    { id: 'wearables', icon: '⌚', label: 'Wearables', color: '#6366f1' }
  ];

  return (
    <div className="comprehensive-dashboard">
      {/* Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🏥 HealthCare Vault</h1>
          <div className="header-greeting">
            <p className="greeting-text">
              {greeting}, <span className="greeting-name">{getDisplayName()}</span>! 👋
            </p>
            <p className="greeting-subtitle">Welcome to your personal health dashboard</p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-user-info" onClick={() => setActiveTab('profile')}>
            <div className="header-avatar">
              <span>{getInitials()}</span>
            </div>
            <div className="header-user-details">
              <span className="header-user-name">{getDisplayName()}</span>
              <span className="header-user-email">{userData?.email || ''}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>👋 Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <div className="nav-scroll">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{
                '--tab-color': item.color
              }}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="welcome-card">
              <h2>👋 {greeting}, {getDisplayName()}!</h2>
              <p>Manage all your healthcare records and health metrics in one secure place</p>
            </div>

            <div className="quick-stats">
              <div className="stat-box">
                <span className="stat-icon">📄</span>
                <div className="stat-info">
                  <p className="stat-number">{userData?.report_count || 0}</p>
                  <p className="stat-label">Medical Records</p>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">💊</span>
                <div className="stat-info">
                  <p className="stat-number">{(() => {
                    try { const m = JSON.parse(localStorage.getItem('hv_medicines') || '[]'); return m.length; } catch { return 0; }
                  })()}</p>
                  <p className="stat-label">Active Medicines</p>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">👨‍⚕️</span>
                <div className="stat-info">
                  <p className="stat-number">{userData?.report_count > 0 ? Math.min(userData.report_count, 5) : 0}</p>
                  <p className="stat-label">Shared Doctors</p>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">⏰</span>
                <div className="stat-info">
                  <p className="stat-number">{(() => {
                    try { const a = JSON.parse(localStorage.getItem('hv_appointments') || '[]'); return a.filter(apt => new Date(apt.date) >= new Date()).length; } catch { return 0; }
                  })()}</p>
                  <p className="stat-label">Upcoming Appointments</p>
                </div>
              </div>
            </div>

            <div className="feature-highlights">
              <h3>🌟 Key Features</h3>
              <div className="features-showcase">
                <div className="feature-item" onClick={() => setActiveTab('records')}>
                  <span className="feature-icon">📤</span>
                  <h4>Easy Upload</h4>
                  <p>Upload medical records from anywhere, anytime</p>
                </div>
                <div className="feature-item" onClick={() => setActiveTab('insights')}>
                  <span className="feature-icon">📊</span>
                  <h4>Health Insights</h4>
                  <p>Track vital health metrics and trends</p>
                </div>
                <div className="feature-item" onClick={() => setActiveTab('reminders')}>
                  <span className="feature-icon">🔔</span>
                  <h4>Smart Reminders</h4>
                  <p>Never miss your medicines or appointments</p>
                </div>
                <div className="feature-item" onClick={() => setActiveTab('assistant')}>
                  <span className="feature-icon">🤖</span>
                  <h4>AI Assistant</h4>
                  <p>Get instant answers about your health</p>
                </div>
                <div className="feature-item" onClick={() => setActiveTab('emergency')}>
                  <span className="feature-icon">🚨</span>
                  <h4>Emergency Mode</h4>
                  <p>Critical health info accessible instantly</p>
                </div>
                <div className="feature-item" onClick={() => setActiveTab('wearables')}>
                  <span className="feature-icon">⌚</span>
                  <h4>Wearables Sync</h4>
                  <p>Connect smartwatches and fitness trackers</p>
                </div>
              </div>
            </div>

            <div className="my-reports-section">
              <div className="reports-section-header">
                <h3>📋 My Medical Reports</h3>
                <button className="btn-small" onClick={() => setActiveTab('records')}>
                  ➕ Upload New
                </button>
              </div>

              {reportsLoading ? (
                <div className="reports-loading">
                  <div className="profile-loading-spinner"></div>
                  <p>Loading reports...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="reports-grid">
                  {reports.map(report => (
                    <div key={report.report_id} className="report-card">
                      <div className="report-card-header">
                        <span className="report-file-icon">{getFileIcon(report.file_name)}</span>
                        <div className="report-card-info">
                          <h4>{report.file_name?.replace(/^(lab-report|prescription|scan|surgery|vaccination|other)_/, '') || 'Report'}</h4>
                          <div className="report-meta">
                            <span className="report-type-badge">{report.report_type || 'other'}</span>
                            <span className="report-date">{formatDate(report.created_at)}</span>
                            <span className="report-size">{formatFileSize(report.file_size)}</span>
                          </div>
                          {report.lab_name && report.lab_name !== 'Self Upload' && (
                            <p className="report-lab">🏥 {report.lab_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="report-card-actions">
                        <button className="report-action-btn view" onClick={() => handleViewReport(report)} title="View Report">
                          👁️ View
                        </button>
                        <button className="report-action-btn ai" onClick={() => handleAskAI(report)} title="Ask AI about this report">
                          🤖 Ask AI
                        </button>
                        <button className="report-action-btn share" onClick={() => handleShareReport(report)} title="Share / Transfer Report">
                          🔗 Share
                        </button>
                        <button className="report-action-btn delete" onClick={() => handleDeleteReport(report.report_id)} title="Delete Report">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="reports-empty">
                  <span className="reports-empty-icon">📂</span>
                  <h4>No Reports Yet</h4>
                  <p>Upload your first medical report to get started</p>
                  <button className="btn-small" onClick={() => setActiveTab('records')}>
                    📤 Upload Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && <UserProfilePanel user={userData} onProfileUpdate={fetchUserProfile} />}

        {activeTab === 'records' && <RecordUpload onUploadSuccess={() => { fetchReports(); fetchUserProfile(); }} />}

        {activeTab === 'insights' && <HealthInsights onAskAI={handleAskAIText} />}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && <MedicineReminders />}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && <EmergencyMode />}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && <HealthTimeline />}

        {activeTab === 'assistant' && <AIHealthAssistant user={userData} reportContext={aiAnalysisReport} onReportContextUsed={() => setAiAnalysisReport(null)} />}

        {/* Wearables Tab */}
        {activeTab === 'wearables' && <WearablesIntegration />}
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>🔒 Your data is encrypted and secured | HealthCare Vault © 2026</p>
      </div>

      {/* Share Modal */}
      {shareModal && (
        <div className="share-modal-overlay" onClick={() => setShareModal(null)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <h3>🔗 Share Report</h3>
            <p className="share-modal-filename">{shareModal.file_name}</p>
            <p className="share-modal-desc">Choose how long the link should be active:</p>
            <div className="share-options">
              {[
                { value: '1h', label: '1 Hour', icon: '⏰', desc: 'Quick view' },
                { value: '24h', label: '24 Hours', icon: '📅', desc: '1 day access' },
                { value: '7d', label: '7 Days', icon: '📆', desc: 'Week access' },
                { value: '30d', label: '30 Days', icon: '🗓️', desc: 'Month access' },
              ].map(opt => (
                <button key={opt.value} className="share-option-btn"
                  onClick={() => executeShare(shareModal, opt.value)}>
                  <span className="share-opt-icon">{opt.icon}</span>
                  <span className="share-opt-label">{opt.label}</span>
                  <span className="share-opt-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
            <button className="share-modal-cancel" onClick={() => setShareModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
