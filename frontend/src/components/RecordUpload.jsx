import { useState } from 'react';

export default function RecordUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [category, setCategory] = useState('lab-report');
  const [doctorName, setDoctorName] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { id: 'lab-report', label: '🧪 Lab Report', icon: '🧪' },
    { id: 'prescription', label: '💊 Prescription', icon: '💊' },
    { id: 'scan', label: '📸 Scan/Imaging', icon: '📸' },
    { id: 'surgery', label: '🏥 Surgery Report', icon: '🏥' },
    { id: 'vaccination', label: '💉 Vaccination', icon: '💉' },
    { id: 'other', label: '📄 Other', icon: '📄' }
  ];

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('category', category);
      formData.append('doctorName', doctorName);
      formData.append('recordDate', recordDate);
      formData.append('tags', JSON.stringify(tags));

      const token = sessionStorage.getItem('auth_token');

      const response = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Record uploaded successfully!' });
        setCategory('lab-report');
        setDoctorName('');
        setTags([]);
        setTimeout(() => {
          if (onUploadSuccess) onUploadSuccess();
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `❌ ${error.error || 'Upload failed'}` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="record-upload">
      <h2>📄 Upload Medical Records</h2>
      
      <div className="upload-form">
        <div className="form-group">
          <label>Record Type</label>
          <div className="category-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <span className="icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📅 Date</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>👨‍⚕️ Doctor Name (Optional)</label>
            <input
              type="text"
              placeholder="Dr. Smith"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>🏷️ Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g., diabetes, checkup, urgent"
            onBlur={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
          />
        </div>

        <div className="file-upload">
          <label htmlFor="file-input" className="upload-btn">
            {uploading ? '⏳ Uploading...' : '📤 Choose File'}
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <p className="file-hint">PDF, JPG, PNG, or DOC (Max 10MB)</p>
        </div>

        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
