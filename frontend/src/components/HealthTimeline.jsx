export default function HealthTimeline() {
  const timelineEvents = [
    {
      id: 1,
      date: '2026-04-20',
      type: 'diagnosis',
      icon: '🏥',
      title: 'Type 2 Diabetes Diagnosed',
      description: 'Blood sugar level 280 mg/dL. Started Metformin treatment.',
      doctor: 'Dr. Sharma',
      color: '#f59e0b'
    },
    {
      id: 2,
      date: '2026-04-15',
      type: 'appointment',
      icon: '📅',
      title: 'General Checkup',
      description: 'Annual health screening completed. All vitals normal.',
      doctor: 'Dr. Patel',
      color: '#3b82f6'
    },
    {
      id: 3,
      date: '2026-04-10',
      type: 'test',
      icon: '🧪',
      title: 'Blood Work',
      description: 'CBC, Lipid Profile, Liver Function Tests completed.',
      results: 'See attached report',
      color: '#8b5cf6'
    },
    {
      id: 4,
      date: '2026-03-28',
      type: 'surgery',
      icon: '🏨',
      title: 'Wisdom Tooth Extraction',
      description: 'Successful removal under local anesthesia.',
      doctor: 'Dr. Kumar (Dentist)',
      color: '#ec4899'
    },
    {
      id: 5,
      date: '2026-03-15',
      type: 'vaccination',
      icon: '💉',
      title: 'Influenza Vaccine',
      description: 'Seasonal flu shot administered.',
      doctor: 'Dr. Singh',
      color: '#10b981'
    },
    {
      id: 6,
      date: '2026-02-20',
      type: 'appointment',
      icon: '📅',
      title: 'Cardiology Consultation',
      description: 'Heart health review. ECG and stress test results normal.',
      doctor: 'Dr. Desai (Cardiologist)',
      color: '#3b82f6'
    }
  ];

  const getYearGroups = () => {
    const grouped = {};
    timelineEvents.forEach(event => {
      const year = new Date(event.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(event);
    });
    return grouped;
  };

  const yearGroups = getYearGroups();

  return (
    <div className="health-timeline">
      <div className="timeline-header">
        <h2>🧬 Health History Timeline</h2>
        <p>Your complete medical journey</p>
      </div>

      <div className="timeline-container">
        {Object.keys(yearGroups).reverse().map(year => (
          <div key={year} className="year-section">
            <div className="year-label">{year}</div>

            {yearGroups[year].map((event, idx) => (
              <div key={event.id} className="timeline-item">
                <div className="timeline-marker" style={{ backgroundColor: event.color }}>
                  {event.icon}
                </div>

                <div className="timeline-content">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className="event-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="event-description">{event.description}</p>

                  {event.doctor && (
                    <p className="event-doctor">
                      👨‍⚕️ {event.doctor}
                    </p>
                  )}

                  {event.results && (
                    <p className="event-results">
                      📎 {event.results}
                    </p>
                  )}

                  <div className="event-actions">
                    <button className="event-btn">📄 View Report</button>
                    {event.doctor && <button className="event-btn">👨‍⚕️ Contact Doctor</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="timeline-summary">
        <div className="summary-stat">
          <span className="stat-number">{timelineEvents.length}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{[...new Set(timelineEvents.map(e => e.doctor))].length}</span>
          <span className="stat-label">Healthcare Providers</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">100%</span>
          <span className="stat-label">Data Encrypted</span>
        </div>
      </div>
    </div>
  );
}
