import { useState, useEffect } from 'react';

export default function UserProfilePanel({ user, onProfileUpdate }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({});
  const [activeSection, setActiveSection] = useState('overview');

  const getToken = () => sessionStorage.getItem('auth_token');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const res = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const result = await res.json();
        setProfileData(result.user);
        setForm(result.user);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const token = getToken();
      const res = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender,
          blood_group: form.blood_group,
          allergies: form.allergies,
          medical_conditions: form.medical_conditions,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone
        })
      });
      if (res.ok) {
        const result = await res.json();
        setProfileData(prev => ({ ...prev, ...result.user }));
        setEditing(false);
        setSaveMsg('✅ Profile updated successfully!');
        if (onProfileUpdate) onProfileUpdate();
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('❌ Failed to update profile');
      }
    } catch (e) {
      setSaveMsg('❌ Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const f = (profileData?.first_name || '').charAt(0).toUpperCase();
    const l = (profileData?.last_name || '').charAt(0).toUpperCase();
    return f + l || '?';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set';
  const formatDateInput = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

  const getMemberDuration = (d) => {
    if (!d) return 'N/A';
    const days = Math.floor((new Date() - new Date(d)) / 86400000);
    if (days < 1) return 'Today';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { text: 'Good Morning', emoji: '🌅', period: 'morning' };
    if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '☀️', period: 'afternoon' };
    if (h >= 17 && h < 21) return { text: 'Good Evening', emoji: '🌇', period: 'evening' };
    return { text: 'Good Night', emoji: '🌙', period: 'night' };
  };

  const greeting = getTimeGreeting();
  const fullName = `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || 'User';

  if (loading) {
    return (
      <div className="profile-panel">
        <div className="profile-loading"><div className="profile-loading-spinner"></div><p>Loading your profile...</p></div>
      </div>
    );
  }

  return (
    <div className="profile-panel">
      {/* Hero */}
      <div className={`profile-hero profile-hero-${greeting.period}`}>
        <div className="profile-hero-bg">
          <div className="profile-hero-orb profile-hero-orb-1"></div>
          <div className="profile-hero-orb profile-hero-orb-2"></div>
        </div>
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            <span className="profile-initials">{getInitials()}</span>
            <div className="profile-avatar-ring"></div>
            <div className="profile-status-dot"></div>
          </div>
          <div className="profile-greeting-section">
            <p className="profile-time-greeting">{greeting.emoji} {greeting.text}</p>
            <h2 className="profile-name-large">{fullName}</h2>
            <p className="profile-email-display">{profileData?.email || ''}</p>
            <div className="profile-badge"><span className="badge-icon">✨</span><span>Active Member</span></div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="profile-nav">
        {['overview', 'edit', 'health', 'security'].map(s => (
          <button key={s} className={`profile-nav-btn ${activeSection === s ? 'active' : ''}`}
            onClick={() => setActiveSection(s)}>
            {s === 'overview' ? '📋 Overview' : s === 'edit' ? '✏️ Edit Profile' : s === 'health' ? '💚 Health Info' : '🔒 Security'}
          </button>
        ))}
      </div>

      {saveMsg && <div style={{ padding: '10px 20px', margin: '0 20px', borderRadius: '8px', background: saveMsg.includes('✅') ? '#d1fae5' : '#fee2e2', color: saveMsg.includes('✅') ? '#065f46' : '#991b1b', fontWeight: 600, fontSize: '14px' }}>{saveMsg}</div>}

      {/* Overview */}
      {activeSection === 'overview' && (
        <div className="profile-section">
          <div className="profile-info-grid">
            {[
              { icon: '👤', label: 'Full Name', value: fullName },
              { icon: '📧', label: 'Email', value: profileData?.email },
              { icon: '📱', label: 'Phone', value: profileData?.phone || 'Not set' },
              { icon: '🎂', label: 'Date of Birth', value: formatDate(profileData?.date_of_birth) },
              { icon: '⚧️', label: 'Gender', value: profileData?.gender || 'Not set' },
              { icon: '🩸', label: 'Blood Group', value: profileData?.blood_group || 'Not set' },
              { icon: '📅', label: 'Member Since', value: formatDate(profileData?.created_at) },
              { icon: '⏳', label: 'Duration', value: getMemberDuration(profileData?.created_at) },
              { icon: '📄', label: 'Reports', value: profileData?.report_count || 0 },
              { icon: '✅', label: 'Status', value: 'Active' },
            ].map((item, i) => (
              <div key={i} className="profile-info-card">
                <div className="info-card-icon">{item.icon}</div>
                <div className="info-card-body">
                  <span className="info-card-label">{item.label}</span>
                  <span className="info-card-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={() => setActiveSection('edit')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✏️ Edit My Profile
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile */}
      {activeSection === 'edit' && (
        <div className="profile-section">
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1f2937' }}>✏️ Edit Your Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { key: 'first_name', label: 'First Name', type: 'text', icon: '👤' },
              { key: 'last_name', label: 'Last Name', type: 'text', icon: '👤' },
              { key: 'phone', label: 'Phone Number', type: 'tel', icon: '📱' },
              { key: 'date_of_birth', label: 'Date of Birth', type: 'date', icon: '🎂' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{f.icon} {f.label}</label>
                <input type={f.type} value={f.type === 'date' ? formatDateInput(form[f.key]) : (form[f.key] || '')}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border 0.2s' }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>⚧️ Gender</label>
              <select value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>🩸 Blood Group</label>
              <select value={form.blood_group || ''} onChange={e => setForm({ ...form, blood_group: e.target.value })}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <h4 style={{ margin: '24px 0 12px', fontSize: '15px', color: '#374151' }}>🚨 Emergency Contact</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Contact Name</label>
              <input type="text" value={form.emergency_contact_name || ''} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Contact Phone</label>
              <input type="tel" value={form.emergency_contact_phone || ''} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
            </div>
          </div>

          <h4 style={{ margin: '24px 0 12px', fontSize: '15px', color: '#374151' }}>🏥 Medical Information</h4>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>⚠️ Allergies</label>
              <textarea value={form.allergies || ''} onChange={e => setForm({ ...form, allergies: e.target.value })}
                placeholder="e.g., Penicillin, Peanuts, Latex..."
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', minHeight: '60px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>💊 Medical Conditions</label>
              <textarea value={form.medical_conditions || ''} onChange={e => setForm({ ...form, medical_conditions: e.target.value })}
                placeholder="e.g., Diabetes, Hypertension, Asthma..."
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', minHeight: '60px', resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '12px 32px', background: saving ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            <button onClick={() => { setForm(profileData); setActiveSection('overview'); }}
              style={{ padding: '12px 32px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Health Info */}
      {activeSection === 'health' && (
        <div className="profile-section">
          <div className="profile-info-grid">
            {[
              { icon: '🩸', label: 'Blood Group', value: profileData?.blood_group || 'Not set' },
              { icon: '⚠️', label: 'Allergies', value: profileData?.allergies || 'None recorded' },
              { icon: '💊', label: 'Medical Conditions', value: profileData?.medical_conditions || 'None recorded' },
              { icon: '🚨', label: 'Emergency Contact', value: profileData?.emergency_contact_name ? `${profileData.emergency_contact_name} (${profileData.emergency_contact_phone || 'No phone'})` : 'Not set' },
              { icon: '📊', label: 'Reports Uploaded', value: profileData?.report_count || 0 },
              { icon: '🤖', label: 'AI Assistant', value: 'Active' },
            ].map((item, i) => (
              <div key={i} className="profile-info-card">
                <div className="info-card-icon">{item.icon}</div>
                <div className="info-card-body">
                  <span className="info-card-label">{item.label}</span>
                  <span className="info-card-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="health-tip-card">
            <div className="health-tip-icon">💡</div>
            <div className="health-tip-content">
              <h4>Health Tip</h4>
              <p>Keep your medical info updated! It helps doctors in emergencies and lets the AI give better personalized advice.</p>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {activeSection === 'security' && (
        <div className="profile-section">
          <div className="security-grid">
            {[
              { icon: '🔒', title: 'Password Protection', desc: 'Account is password protected', status: 'Active', good: true },
              { icon: '🛡️', title: 'Data Encryption', desc: 'All records encrypted at rest', status: 'Enabled', good: true },
              { icon: '🔑', title: 'Session Security', desc: 'Auto logout on browser close', status: 'Active', good: true },
              { icon: '📱', title: 'Two-Factor Auth', desc: 'Extra security layer', status: 'Coming Soon', good: false },
            ].map((s, i) => (
              <div key={i} className={`security-item ${s.good ? 'security-good' : 'security-info-item'}`}>
                <div className="security-icon">{s.icon}</div>
                <div className="security-info">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
                <span className={`security-status ${s.good ? 'good' : 'pending'}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
