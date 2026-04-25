import { useState, useEffect } from 'react';

export default function EmergencyMode() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  const [emergencyInfo, setEmergencyInfo] = useState(() => {
    const saved = localStorage.getItem('hv_emergency_info');
    return saved ? JSON.parse(saved) : {
      bloodGroup: 'O+',
      allergies: 'Penicillin, Peanuts',
      emergencyContacts: [
        { name: 'Mom', phone: '+91 98765 43210', relation: 'Mother' },
        { name: 'Dad', phone: '+91 87654 32109', relation: 'Father' }
      ],
      medicalConditions: 'Diabetes, Hypertension',
      medications: 'Aspirin 500mg, Metformin 1000mg'
    };
  });

  const [editMode, setEditMode] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('hv_emergency_info', JSON.stringify(emergencyInfo));
  }, [emergencyInfo]);

  const handleSOS = () => {
    if (!sosActive) {
      setSosActive(true);
      let count = 3;
      setCountdown(count);

      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          alert('🚨 Emergency alert sent to emergency contacts and services!');
          setSosActive(false);
        }
      }, 1000);
    }
  };

  const handleCallAmbulance = () => {
    window.open('tel:102', '_self');
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          navigator.clipboard.writeText(mapsUrl).then(() => {
            alert(`📍 Location copied to clipboard!\n\nLat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}\n\nGoogle Maps link copied!`);
          }).catch(() => {
            alert(`📍 Your location:\nLat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}\n\nLink: ${mapsUrl}`);
          });
        },
        (err) => {
          alert('❌ Could not get your location. Please enable location services.');
        }
      );
    } else {
      alert('❌ Geolocation is not supported by your browser.');
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setEmergencyInfo({
        ...emergencyInfo,
        emergencyContacts: [...emergencyInfo.emergencyContacts, { ...newContact }]
      });
      setNewContact({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = (idx) => {
    if (window.confirm(`Remove ${emergencyInfo.emergencyContacts[idx].name}?`)) {
      const updated = [...emergencyInfo.emergencyContacts];
      updated.splice(idx, 1);
      setEmergencyInfo({ ...emergencyInfo, emergencyContacts: updated });
    }
  };

  return (
    <div className="emergency-mode">
      {/* SOS Button */}
      <div className="sos-section">
        <div className={`sos-button ${sosActive ? 'active' : ''}`}>
          <button 
            className="sos-btn"
            onClick={handleSOS}
            disabled={sosActive}
          >
            {countdown ? (
              <>
                <span className="sos-icon">🚨</span>
                <span className="countdown">{countdown}</span>
              </>
            ) : (
              <>
                <span className="sos-icon">🚨</span>
                <span>EMERGENCY SOS</span>
              </>
            )}
          </button>
          {sosActive && <p className="sos-warning">Sending emergency alert...</p>}
        </div>
      </div>

      {/* Critical Health Information */}
      <div className="critical-info-section">
        <div className="section-header">
          <h3>🚑 Critical Medical Information</h3>
          <button 
            className="btn-small"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '✅ Done' : '✏️ Edit'}
          </button>
        </div>

        <div className="info-grid">
          {/* Blood Group */}
          <div className="info-card">
            <div className="info-label">🩸 Blood Group</div>
            {editMode ? (
              <input 
                type="text" 
                value={emergencyInfo.bloodGroup}
                onChange={(e) => setEmergencyInfo({...emergencyInfo, bloodGroup: e.target.value})}
              />
            ) : (
              <div className="info-value">{emergencyInfo.bloodGroup}</div>
            )}
          </div>

          {/* Allergies */}
          <div className="info-card">
            <div className="info-label">⚠️ Allergies</div>
            {editMode ? (
              <textarea 
                value={emergencyInfo.allergies}
                onChange={(e) => setEmergencyInfo({...emergencyInfo, allergies: e.target.value})}
              />
            ) : (
              <div className="info-value">{emergencyInfo.allergies}</div>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="info-card">
            <div className="info-label">🏥 Medical Conditions</div>
            {editMode ? (
              <textarea 
                value={emergencyInfo.medicalConditions}
                onChange={(e) => setEmergencyInfo({...emergencyInfo, medicalConditions: e.target.value})}
              />
            ) : (
              <div className="info-value">{emergencyInfo.medicalConditions}</div>
            )}
          </div>

          {/* Current Medications */}
          <div className="info-card">
            <div className="info-label">💊 Current Medications</div>
            {editMode ? (
              <textarea 
                value={emergencyInfo.medications}
                onChange={(e) => setEmergencyInfo({...emergencyInfo, medications: e.target.value})}
              />
            ) : (
              <div className="info-value">{emergencyInfo.medications}</div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="emergency-contacts-section">
        <h3>📞 Emergency Contacts</h3>
        <div className="contacts-list">
          {emergencyInfo.emergencyContacts.map((contact, idx) => (
            <div key={idx} className="contact-card">
              <div className="contact-avatar">👤</div>
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p className="relation">{contact.relation}</p>
                <p className="phone">{contact.phone}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="call-btn" onClick={() => window.open(`tel:${contact.phone}`, '_self')}>📞 Call</button>
                <button
                  className="btn-small danger"
                  onClick={() => handleRemoveContact(idx)}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>

        {showAddContact ? (
          <div className="add-form" style={{ marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({...newContact, name: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={newContact.phone}
              onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            />
            <input
              type="text"
              placeholder="Relation (e.g., Brother)"
              value={newContact.relation}
              onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
            />
            <button className="btn btn-primary" onClick={handleAddContact}>Save Contact</button>
            <button className="btn btn-secondary" onClick={() => setShowAddContact(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setShowAddContact(true)}>➕ Add Contact</button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={handleCallAmbulance}>🚑 Call Ambulance (102)</button>
        <button className="quick-action-btn" onClick={() => {
          emergencyInfo.emergencyContacts.forEach(c => {
            alert(`📱 Alert sent to ${c.name} (${c.phone})`);
          });
        }}>🚨 Alert Contacts</button>
        <button className="quick-action-btn" onClick={handleShareLocation}>📱 Share Location</button>
      </div>
    </div>
  );
}
