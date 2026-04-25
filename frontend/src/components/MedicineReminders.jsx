import { useState, useEffect } from 'react';

export default function MedicineReminders() {
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('hv_medicines');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: 'Aspirin',
        dosage: '500mg',
        times: ['08:00 AM', '08:00 PM'],
        reason: 'Heart Health',
        nextDue: '08:00 AM',
        completed: false
      },
      {
        id: 2,
        name: 'Metformin',
        dosage: '1000mg',
        times: ['07:00 AM', '01:00 PM', '08:00 PM'],
        reason: 'Diabetes',
        nextDue: '01:00 PM',
        completed: true
      },
      {
        id: 3,
        name: 'Vitamin D3',
        dosage: '1000IU',
        times: ['09:00 AM'],
        reason: 'Bone Health',
        nextDue: 'Tomorrow 09:00 AM',
        completed: false
      }
    ];
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('hv_appointments');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        doctorName: 'Dr. Smith',
        specialty: 'Cardiologist',
        date: '2026-04-28',
        time: '02:00 PM',
        location: 'Heart Care Center',
        status: 'upcoming'
      },
      {
        id: 2,
        doctorName: 'Dr. Johnson',
        specialty: 'Endocrinologist',
        date: '2026-05-05',
        time: '10:00 AM',
        location: 'Diabetes Clinic',
        status: 'scheduled'
      }
    ];
  });

  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', times: '', reason: '' });
  const [newAppointment, setNewAppointment] = useState({ doctorName: '', specialty: '', date: '', time: '', location: '' });

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('hv_medicines', JSON.stringify(medicines)); }, [medicines]);
  useEffect(() => { localStorage.setItem('hv_appointments', JSON.stringify(appointments)); }, [appointments]);

  const handleMarkTaken = (id) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  const handleAddMedicine = () => {
    if (newMedicine.name && newMedicine.dosage) {
      const times = newMedicine.times.split(',').map(t => t.trim());
      setMedicines([...medicines, {
        id: medicines.length + 1,
        ...newMedicine,
        times,
        completed: false,
        nextDue: times[0]
      }]);
      setNewMedicine({ name: '', dosage: '', times: '', reason: '' });
      setShowAddMedicine(false);
    }
  };

  return (
    <div className="medicine-reminders">
      <div className="reminders-header">
        <h2>💊 Medicines & Appointments</h2>
      </div>

      {/* Medicines Section */}
      <div className="section">
        <div className="section-title">
          <h3>💊 My Medicines</h3>
          <button 
            className="btn-small"
            onClick={() => setShowAddMedicine(!showAddMedicine)}
          >
            ➕ Add
          </button>
        </div>

        {showAddMedicine && (
          <div className="add-form">
            <input
              type="text"
              placeholder="Medicine name"
              value={newMedicine.name}
              onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg)"
              value={newMedicine.dosage}
              onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
            />
            <input
              type="text"
              placeholder="Times (e.g., 08:00 AM, 08:00 PM)"
              value={newMedicine.times}
              onChange={(e) => setNewMedicine({...newMedicine, times: e.target.value})}
            />
            <input
              type="text"
              placeholder="Reason (e.g., Diabetes)"
              value={newMedicine.reason}
              onChange={(e) => setNewMedicine({...newMedicine, reason: e.target.value})}
            />
            <button className="btn btn-primary" onClick={handleAddMedicine}>Save</button>
          </div>
        )}

        <div className="medicines-list">
          {medicines.map(med => (
            <div key={med.id} className="medicine-item">
              <div className="medicine-info">
                <h4>{med.name}</h4>
                <p className="dosage">💊 {med.dosage}</p>
                <p className="reason">📋 {med.reason}</p>
                <p className="times">⏰ {med.times.join(', ')}</p>
              </div>
              <button
                className={`mark-btn ${med.completed ? 'completed' : ''}`}
                onClick={() => handleMarkTaken(med.id)}
              >
                {med.completed ? '✅ Taken' : '⭕ Mark Taken'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments Section */}
      <div className="section">
        <div className="section-title">
          <h3>📅 Upcoming Appointments</h3>
          <button className="btn-small" onClick={() => setShowAddAppointment(!showAddAppointment)}>
            {showAddAppointment ? '✕ Close' : '➕ Schedule'}
          </button>
        </div>

        {showAddAppointment && (
          <div className="add-form">
            <input
              type="text"
              placeholder="Doctor name (e.g., Dr. Smith)"
              value={newAppointment.doctorName}
              onChange={(e) => setNewAppointment({...newAppointment, doctorName: e.target.value})}
            />
            <input
              type="text"
              placeholder="Specialty (e.g., Cardiologist)"
              value={newAppointment.specialty}
              onChange={(e) => setNewAppointment({...newAppointment, specialty: e.target.value})}
            />
            <input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
            />
            <input
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
            />
            <input
              type="text"
              placeholder="Location"
              value={newAppointment.location}
              onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                if (newAppointment.doctorName && newAppointment.date) {
                  setAppointments([...appointments, {
                    id: Date.now(),
                    ...newAppointment,
                    time: newAppointment.time || '10:00 AM',
                    status: 'scheduled'
                  }]);
                  setNewAppointment({ doctorName: '', specialty: '', date: '', time: '', location: '' });
                  setShowAddAppointment(false);
                }
              }}
            >
              Save Appointment
            </button>
          </div>
        )}

        <div className="appointments-list">
          {appointments.map(apt => (
            <div key={apt.id} className="appointment-item">
              <div className="appointment-date">
                <div className="date-icon">📅</div>
                <div className="date-text">
                  <span className="day">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="time">{apt.time}</span>
                </div>
              </div>

              <div className="appointment-info">
                <h4>{apt.doctorName}</h4>
                <p className="specialty">🏥 {apt.specialty}</p>
                <p className="location">📍 {apt.location}</p>
              </div>

              <div className="appointment-actions">
                <button
                  className="btn-small danger"
                  onClick={() => {
                    if (window.confirm(`Cancel appointment with ${apt.doctorName}?`)) {
                      setAppointments(appointments.filter(a => a.id !== apt.id));
                    }
                  }}
                >
                  🗑️ Cancel
                </button>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>No upcoming appointments. Click Schedule to add one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
