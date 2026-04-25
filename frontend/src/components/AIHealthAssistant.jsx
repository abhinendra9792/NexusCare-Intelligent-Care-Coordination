import { useState, useRef, useEffect } from 'react';

// Simple markdown to HTML renderer for AI responses
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Headers: ### text
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Unordered lists: * item or - item
    .replace(/^[*\-]\s+(.+)$/gm, '<li>$1</li>')
    // Numbered lists: 1. item
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  return `<p>${html}</p>`;
}

export default function AIHealthAssistant({ user, reportContext, onReportContextUsed }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getToken = () => sessionStorage.getItem('auth_token');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Fetch user profile and initialize greeting
  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  // Load chat history when history tab is selected
  useEffect(() => {
    if (activeTab === 'history') {
      fetchChatHistory();
    }
  }, [activeTab]);

  // Handle report context from overview or health insights
  useEffect(() => {
    if (reportContext && !loading && messages.length > 0) {
      if (reportContext._isFileAnalysis && reportContext.report_id) {
        // Call the dedicated report analysis API that reads the actual file
        analyzeReportFile(reportContext);
      } else if (reportContext._customQuestion) {
        sendMessageDirect(reportContext._customQuestion);
      } else {
        const question = `Please analyze my medical report: "${reportContext.file_name}". It is a ${reportContext.report_type || 'medical'} report. What should I know about this type of report?`;
        sendMessageDirect(question);
      }
      if (onReportContextUsed) onReportContextUsed();
    }
  }, [reportContext, messages.length]);

  const analyzeReportFile = async (report) => {
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: `📄 Analyze my report: "${report.file_name}" — Please read the actual file content and give me a detailed analysis.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/reports/${report.report_id}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: '' })
      });
      if (res.ok) {
        const result = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1, type: 'bot',
          text: result.data.analysis,
          timestamp: new Date().toISOString()
        }]);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Analysis failed');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'bot',
        text: `❌ Could not analyze report: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/ai/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.data.user);

        // Initialize with personalized time-aware greeting
        const timeGreeting = getTimeGreeting();
        const greeting = {
          id: 1,
          type: 'bot',
          text: `${timeGreeting}, ${result.data.user.firstName}! 👋 I'm your AI Health Assistant powered by Google Gemini. I can help you understand your health reports, answer general health questions, and provide personalized wellness suggestions.\n\nHow can I assist you today?`,
          timestamp: new Date().toISOString()
        };
        setMessages([greeting]);
      } else {
        // Fallback greeting
        const fallbackName = user?.first_name || 'there';
        const timeGreeting = getTimeGreeting();
        const greeting = {
          id: 1,
          type: 'bot',
          text: `${timeGreeting}, ${fallbackName}! 👋 I'm your AI Health Assistant. I can help you understand your health reports, answer general health questions, and provide wellness suggestions.\n\nHow can I help you today?`,
          timestamp: new Date().toISOString()
        };
        setMessages([greeting]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const timeGreeting = getTimeGreeting();
      const greeting = {
        id: 1,
        type: 'bot',
        text: `${timeGreeting}! 👋 I'm your AI Health Assistant. I can help you understand your health reports, answer general health questions, and provide wellness suggestions.\n\nHow can I help you today?`,
        timestamp: new Date().toISOString()
      };
      setMessages([greeting]);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/ai/history?limit=100', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setHistoryMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    const currentInput = input;
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = getToken();
      
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: currentInput })
      });

      if (response.ok) {
        const result = await response.json();
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: result.data.response,
          timestamp: result.data.timestamp
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: `❌ Sorry, I encountered an error: ${error.message}. Please check if the backend server is running and try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessageDirect = async (text) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: result.data.response, timestamp: result.data.timestamp }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: `❌ Error: ${error.message}`, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/ai/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `healthcare-vault-chat-${timestamp}.json`;
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('No conversation data to export yet.');
      }
    } catch (error) {
      console.error('Error exporting conversation:', error);
      alert('Failed to export conversation. Please try again.');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/ai/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Reset to greeting message
        const timeGreeting = getTimeGreeting();
        const greeting = {
          id: 1,
          type: 'bot',
          text: `${timeGreeting}, ${userProfile?.firstName || 'there'}! 👋 Chat history has been cleared successfully. How can I help you today?`,
          timestamp: new Date().toISOString()
        };
        setMessages([greeting]);
        setHistoryMessages([]);
        alert(`✅ ${result.data.message || 'Chat history cleared successfully!'}`);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear chat history. Please try again.');
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const suggestedQuestions = [
    '📊 Explain my blood sugar readings',
    '💊 What does this medication do?',
    '🏃 Tips for improving heart health',
    '🩺 When should I see a doctor?',
    '🥗 Diet tips for diabetes management'
  ];

  const quickFeatures = [
    {
      icon: '📄',
      title: 'Report Explanation',
      description: 'Get AI-powered insights from your medical reports',
      prompt: 'Can you help me understand my latest medical report?'
    },
    {
      icon: '💊',
      title: 'Medication Info',
      description: 'Learn about your medicines, dosages, and side effects',
      prompt: 'Tell me about common medications for high blood pressure'
    },
    {
      icon: '🏥',
      title: 'Symptom Guide',
      description: 'Understand common symptoms and when to seek help',
      prompt: 'What symptoms should I watch for regarding heart health?'
    },
    {
      icon: '🧘',
      title: 'Wellness Tips',
      description: 'Personalized daily health recommendations',
      prompt: 'Give me some daily wellness tips for a healthy lifestyle'
    }
  ];

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <div className="assistant-header-top">
          <div className="assistant-header-info">
            <h2>🤖 AI Health Assistant</h2>
            <p>Your personal health guide powered by Google Gemini AI</p>
          </div>
          {userProfile && (
            <div className="assistant-user-badge">
              <span className="assistant-user-icon">👤</span>
              <span>{userProfile.firstName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="assistant-tabs">
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          ✨ Features
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className="chat-container">
          <div className="messages-list">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  {msg.type === 'bot' ? (
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  ) : (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  )}
                  {msg.timestamp && (
                    <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="typing-text">Analyzing your query...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="suggested-questions">
            <p>💡 Quick questions:</p>
            <div className="questions-grid">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="suggestion-btn"
                  onClick={() => {
                    const cleanQ = q.replace(/^[^\s]+ /, '');
                    setInput(cleanQ);
                    // Auto-send the suggestion after a short delay
                    setTimeout(() => {
                      const fakeMsg = {
                        id: messages.length + 1,
                        type: 'user',
                        text: cleanQ,
                        timestamp: new Date().toISOString()
                      };
                      setMessages(prev => [...prev, fakeMsg]);
                      setInput('');
                      setLoading(true);
                      const token = getToken();
                      fetch('http://localhost:5000/api/ai/chat', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: cleanQ })
                      }).then(r => r.json()).then(result => {
                        if (result.success) {
                          setMessages(prev => [...prev, { id: prev.length + 1, type: 'bot', text: result.data.response, timestamp: result.data.timestamp }]);
                        }
                      }).catch(err => {
                        setMessages(prev => [...prev, { id: prev.length + 1, type: 'bot', text: '❌ Error: ' + err.message, timestamp: new Date().toISOString() }]);
                      }).finally(() => setLoading(false));
                    }, 50);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-input-area">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ask me anything about your health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                disabled={loading}
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
              >
                {loading ? '⏳' : '🚀'}
              </button>
            </div>
            <p className="disclaimer">⚠️ AI responses are for informational purposes only. Always consult your doctor for medical advice.</p>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="features-container">
          <div className="features-grid">
            {quickFeatures.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <button 
                  className="btn-small"
                  onClick={() => {
                    setInput(feature.prompt);
                    setActiveTab('chat');
                  }}
                >
                  Try Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-container">
          <div className="history-actions">
            <button className="btn btn-secondary" onClick={handleExport}>
              📥 Export Conversation
            </button>
            <button className="btn btn-danger" onClick={handleClearHistory}>
              🗑️ Clear History
            </button>
          </div>

          {historyLoading ? (
            <div className="history-loading">
              <div className="profile-loading-spinner"></div>
              <p>Loading chat history...</p>
            </div>
          ) : historyMessages.length > 0 ? (
            <div className="history-messages">
              {historyMessages.map((msg, idx) => (
                <div key={idx} className={`history-message ${msg.sender}`}>
                  <div className="history-message-header">
                    <span className="history-sender">
                      {msg.sender === 'user' ? '👤 You' : '🤖 AI Assistant'}
                    </span>
                    <span className="history-time">{formatTimestamp(msg.created_at)}</span>
                  </div>
                  <p className="history-text">{msg.message_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="history-empty">
              <span className="history-empty-icon">💬</span>
              <h4>No Chat History</h4>
              <p>Start chatting with the AI Assistant to build your conversation history</p>
              <button 
                className="btn-small" 
                onClick={() => setActiveTab('chat')}
              >
                Start Chatting →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
