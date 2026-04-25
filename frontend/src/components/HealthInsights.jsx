import { useState, useEffect } from 'react';

export default function HealthInsights({ onAskAI }) {
  const [insights, setInsights] = useState(() => {
    const saved = localStorage.getItem('hv_health_insights');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Blood Sugar', value: '120', unit: 'mg/dL', status: 'normal', trend: 'up', lastUpdated: 'Just added' },
      { id: 2, title: 'Blood Pressure', value: '130/85', unit: 'mmHg', status: 'warning', trend: 'stable', lastUpdated: 'Just added' },
      { id: 3, title: 'Weight', value: '72.5', unit: 'kg', status: 'normal', trend: 'down', lastUpdated: 'Just added' },
      { id: 4, title: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', trend: 'stable', lastUpdated: 'Just added' }
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState({ title: '', value: '', unit: '', status: 'normal' });

  useEffect(() => {
    localStorage.setItem('hv_health_insights', JSON.stringify(insights));
  }, [insights]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const handleAddMetric = () => {
    if (newMetric.title && newMetric.value) {
      setInsights([...insights, { id: Date.now(), ...newMetric, trend: 'stable', lastUpdated: 'Just added' }]);
      setNewMetric({ title: '', value: '', unit: '', status: 'normal' });
      setShowAddForm(false);
    }
  };

  const handleDeleteMetric = (id) => {
    if (window.confirm('Remove this metric?')) {
      setInsights(insights.filter(i => i.id !== id));
    }
  };

  const handleUpdateValue = (id, newValue) => {
    setInsights(insights.map(i =>
      i.id === id ? { ...i, value: newValue, lastUpdated: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } : i
    ));
  };

  const handleAnalyzeAll = () => {
    if (!onAskAI) return;
    const metricsText = insights.map(i => `${i.title}: ${i.value} ${i.unit} (Status: ${i.status}, Trend: ${i.trend})`).join(', ');
    onAskAI(`Please analyze my current health metrics and give me personalized advice: ${metricsText}. Are any of these values concerning? What lifestyle changes would you recommend?`);
  };

  const handleAnalyzeSingle = (insight) => {
    if (!onAskAI) return;
    onAskAI(`My ${insight.title} reading is ${insight.value} ${insight.unit} (status: ${insight.status}, trend: ${insight.trend}). Is this normal? What should I know? Any recommendations?`);
  };

  return (
    <div className="health-insights">
      <div className="insights-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📊 Health Insights</h2>
          <p>Track your vital health metrics</p>
        </div>
        {onAskAI && (
          <button
            onClick={handleAnalyzeAll}
            style={{
              padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
          >
            🤖 Analyze All with AI
          </button>
        )}
      </div>

      <div className="insights-grid">
        {insights.map(insight => (
          <div key={insight.id} className="insight-card" style={{ borderLeftColor: getStatusColor(insight.status) }}>
            <div className="insight-header">
              <h3>{insight.title}</h3>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(insight.status) }}>
                {insight.status.toUpperCase()}
              </span>
            </div>

            <div className="insight-value">
              <span className="value">{insight.value}</span>
              <span className="unit">{insight.unit}</span>
            </div>

            <div className="insight-footer">
              <span className="trend">{getTrendIcon(insight.trend)}</span>
              <span className="last-updated">{insight.lastUpdated}</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
              <button className="btn-small" style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => { const v = prompt(`Update ${insight.title} value:`, insight.value); if (v !== null) handleUpdateValue(insight.id, v); }}>
                ✏️ Update
              </button>
              {onAskAI && (
                <button className="btn-small" style={{ fontSize: '11px', padding: '4px 8px', background: '#d1fae5', color: '#065f46' }}
                  onClick={() => handleAnalyzeSingle(insight)}>
                  🤖 AI
                </button>
              )}
              <button className="btn-small danger" style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => handleDeleteMetric(insight.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="add-form" style={{ marginTop: '16px' }}>
          <input type="text" placeholder="Metric name (e.g., Cholesterol)" value={newMetric.title} onChange={(e) => setNewMetric({...newMetric, title: e.target.value})} />
          <input type="text" placeholder="Value (e.g., 200)" value={newMetric.value} onChange={(e) => setNewMetric({...newMetric, value: e.target.value})} />
          <input type="text" placeholder="Unit (e.g., mg/dL)" value={newMetric.unit} onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})} />
          <select value={newMetric.status} onChange={(e) => setNewMetric({...newMetric, status: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}>
            <option value="normal">✅ Normal</option>
            <option value="warning">⚠️ Warning</option>
            <option value="critical">🚨 Critical</option>
          </select>
          <button className="btn btn-primary" onClick={handleAddMetric}>Save Metric</button>
          <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      <div className="insights-actions">
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Close' : '➕ Add New Metric'}
        </button>
      </div>
    </div>
  );
}
