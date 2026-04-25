<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🏥 HealthCare Vault</h1>

<p align="center">
  <strong>Your Personal AI-Powered Healthcare Records Management System</strong>
</p>

<p align="center">
  <em>Securely store, analyze, and manage your medical records with the power of Google Gemini AI.<br/>
  Built with React, Node.js, Express, and PostgreSQL.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🌟 Overview

**HealthCare Vault** is a comprehensive, full-stack healthcare records management platform that empowers users to take complete control of their medical data. Leveraging **Google Gemini AI**, the platform reads and analyzes medical reports — PDFs, blood tests, scans — and provides instant, actionable health insights in plain language.

Whether you're tracking prescriptions, scheduling appointments, or need to share critical health info in an emergency, HealthCare Vault has you covered — all from a single, beautiful dashboard.

---

## 📸 Demo

### 🏠 Landing Page — AI-Powered Health Assistant
> A clean, modern landing page showcasing the platform's AI capabilities, including automatic report analysis with abnormal value flagging.

![Landing Page - Hero Section](Display/Screenshot%202026-04-25%20053941.png)

![Landing Page - AI Analysis Preview](Display/Screenshot%202026-04-25%20054319.png)

---

### 📊 Dashboard — Overview & Key Features
> The personalized dashboard greets users by name and provides a quick overview of medical records, active medicines, shared doctors, and upcoming appointments.

![Dashboard Overview](Display/Screenshot%202026-04-25%20054404.png)

---

### 📤 Upload Medical Records
> Upload and categorize medical records with support for Lab Reports, Prescriptions, Scans/Imaging, Surgery Reports, Vaccinations, and more. Drag-and-drop with metadata tagging.

![Upload Records](Display/Screenshot%202026-04-25%20054754.png)

---

### 🤖 AI Health Assistant
> Powered by Google Gemini AI — chat with your personal health assistant to understand reports, get medication info, and receive wellness recommendations.

![AI Health Assistant](Display/Screenshot%202026-04-25%20054741.png)

---

### ⌚ Wearables Integration
> Connect your smartwatches and fitness trackers — Apple Watch, Fitbit, Samsung Galaxy Watch, Garmin, and Huawei Watch — to sync health data directly.

![Wearables Integration](Display/Screenshot%202026-04-25%20054541.png)

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="33%">
      <h3>📤 Smart Upload</h3>
      <p>Upload medical records with auto-categorization, tagging, and metadata. Supports PDF, JPG, PNG, and DOC formats (up to 10MB).</p>
    </td>
    <td align="center" width="33%">
      <h3>🤖 AI Analysis</h3>
      <p>Google Gemini AI reads your reports, identifies abnormal values, flags health concerns, and explains findings in simple language.</p>
    </td>
    <td align="center" width="33%">
      <h3>📊 Health Insights</h3>
      <p>Track vital health metrics over time with trend analysis, status indicators, and personalized wellness recommendations.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <h3>💊 Medicine Reminders</h3>
      <p>Never miss a dose — manage active medications, set reminders, and track your medicine schedule with ease.</p>
    </td>
    <td align="center" width="33%">
      <h3>🚨 Emergency Mode</h3>
      <p>One-tap SOS button with critical health info (blood type, allergies, conditions) and emergency contacts accessible instantly.</p>
    </td>
    <td align="center" width="33%">
      <h3>📅 Health Timeline</h3>
      <p>Visualize your complete medical history on a color-coded timeline — surgeries, check-ups, tests, and vaccinations at a glance.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <h3>⌚ Wearables Sync</h3>
      <p>Connect smartwatches and fitness trackers to import real-time health data — steps, heart rate, sleep, and more.</p>
    </td>
    <td align="center" width="33%">
      <h3>🔗 Secure Sharing</h3>
      <p>Share medical reports with doctors via time-limited, secure links. Full control over what gets shared and for how long.</p>
    </td>
    <td align="center" width="33%">
      <h3>👤 User Profile</h3>
      <p>Complete profile management with personal health information, preferences, and account settings.</p>
    </td>
  </tr>
</table>

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 18** | Component-based UI with Hooks |
| **Vite 5** | Lightning-fast dev server & build tool |
| **CSS3** | Custom design system with Flexbox/Grid |
| **JavaScript (ES6+)** | Modern syntax with modules |

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Node.js** | Server runtime |
| **Express 5** | RESTful API framework |
| **PostgreSQL** | Relational database for medical records |
| **JWT** | Secure token-based authentication |
| **bcrypt** | Password hashing (10 salt rounds) |
| **Multer** | File upload handling |
| **Nodemailer** | Email notifications |

### AI & Integrations
| Technology | Purpose |
|:-----------|:--------|
| **Google Gemini AI** | Medical report analysis & health assistant |
| **@google/generative-ai** | Gemini SDK integration |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/AshmitThakur23/Healthcare-report-vault.git
cd Healthcare-report-vault
```

### 2. Environment Setup

Create a `.env` file in the root directory using the provided template:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=healthcare_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Database Setup

```bash
# Initialize the database tables
node init-db.js
```

### 5. Launch the Application

#### Option A: Automated (Windows PowerShell)
```powershell
.\start-servers.ps1
```

#### Option B: Manual (Two Terminals)

**Terminal 1 — Backend:**
```bash
node Backend/server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Open in Browser

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## 🏗 Architecture

### High-Level System Design

```
┌───────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                       │
│                  React 18 + Vite + CSS3                    │
└──────────────────────────┬────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌───────────────────────────────────────────────────────────┐
│                   API SERVER (Express 5)                   │
│          JWT Auth │ Multer │ CORS │ Rate Limiting          │
├───────────┬───────┴───────┬───────────────┬───────────────┤
│  Auth     │  Reports      │  AI Service   │  Share Links  │
│  Service  │  Service      │  (Gemini)     │  Service      │
└─────┬─────┴───────┬───────┴───────┬───────┴───────┬───────┘
      │             │               │               │
      ▼             ▼               ▼               ▼
┌──────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐
│PostgreSQL│  │  File     │  │ Google     │  │  Email     │
│ Database │  │  System   │  │ Gemini API │  │  (SMTP)    │
└──────────┘  └──────────┘  └────────────┘  └────────────┘
```

### Project Structure

```
Healthcare-report-vault/
│
├── 📂 Backend/                    # Express.js API Server
│   ├── server.js                  # Server entry point
│   ├── app.js                     # Express app configuration
│   ├── 📂 config/                 # Database & app configuration
│   ├── 📂 controllers/           # Request handlers
│   │   ├── authController.js      # Auth endpoints
│   │   ├── reportController.js    # Report CRUD
│   │   └── userUploadController.js# File uploads
│   ├── 📂 routes/                 # API route definitions
│   ├── 📂 services/              # Business logic
│   │   ├── aiService.js           # Gemini AI integration
│   │   ├── authService.js         # Authentication logic
│   │   └── reportService.js       # Report processing
│   ├── 📂 middlewares/           # JWT auth & validation
│   └── 📂 utils/                 # Helper utilities
│
├── 📂 frontend/                   # React SPA
│   ├── index.html                 # HTML entry point
│   ├── vite.config.js             # Vite configuration
│   └── 📂 src/
│       ├── App.jsx                # Root component with routing
│       ├── main.jsx               # React DOM entry
│       └── 📂 components/
│           ├── LandingPage.jsx          # Public landing page
│           ├── LoginVault.jsx           # Auth container
│           ├── Login.jsx                # Login form
│           ├── Register.jsx             # Registration form
│           ├── ComprehensiveDashboard.jsx # Main dashboard
│           ├── RecordUpload.jsx         # File upload module
│           ├── HealthInsights.jsx       # Health metrics
│           ├── MedicineReminders.jsx    # Medication tracking
│           ├── EmergencyMode.jsx        # Emergency SOS
│           ├── HealthTimeline.jsx       # Medical timeline
│           ├── AIHealthAssistant.jsx    # AI chat interface
│           └── WearablesIntegration.jsx # Device sync
│
├── 📂 Display/                    # Demo screenshots
├── 📂 uploads/                    # Uploaded medical files
├── 📄 .env.example                # Environment template
├── 📄 .gitignore                  # Git exclusions
├── 📄 ARCHITECTURE.md             # Detailed architecture docs
├── 📄 init-db.js                  # Database initialization
├── 📄 start-servers.ps1           # Automated startup script
└── 📄 package.json                # Root dependencies
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `POST` | `/api/auth/forgot-password` | Initiate password recovery |

### Medical Reports
| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/reports/upload` | Upload a medical report |
| `GET` | `/api/reports` | Fetch all user reports |
| `GET` | `/api/reports/:id` | Get a specific report |

### AI Assistant
| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/ai/chat` | Send a message to AI assistant |
| `GET` | `/api/ai/history` | Retrieve chat history |

### Report Sharing
| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/share/create` | Create a time-limited share link |
| `GET` | `/api/share/:token` | Access a shared report |

### Wearables
| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/wearables/connect` | Connect a wearable device |
| `GET` | `/api/wearables/devices` | List connected devices |

---

## 🔐 Security

HealthCare Vault takes your data security seriously:

- **🔒 Encrypted Passwords** — All passwords are hashed using `bcrypt` with 10 salt rounds
- **🎫 JWT Authentication** — Stateless, token-based auth with configurable expiry
- **🛡️ Session Storage** — Tokens stored in `sessionStorage` (cleared when browser closes)
- **🌐 CORS Protection** — Strict origin whitelisting for API access
- **📁 Secure File Storage** — Uploaded files are stored server-side with access control
- **⏰ Time-Limited Sharing** — Shared report links expire automatically
- **🔐 HTTPS Ready** — Full SSL/TLS support for production deployment

---

## 🧪 Development

### Available Scripts

```bash
# Root level
node init-db.js          # Initialize database tables
node reset-db.js         # Reset database (CAUTION: deletes all data)
node test-db.js          # Test database connection
node test-gemini.js      # Test Gemini AI integration

# Frontend
cd frontend
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
node Backend/server.js   # Start API server (port 5000)
```

### Environment Variables

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `DB_HOST` | ✅ | PostgreSQL host |
| `DB_PORT` | ✅ | PostgreSQL port (default: 5432) |
| `DB_USER` | ✅ | Database username |
| `DB_PASSWORD` | ✅ | Database password |
| `DB_NAME` | ✅ | Database name |
| `PORT` | ✅ | Backend server port |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `GEMINI_API_KEY` | ✅ | Google Gemini AI API key |
| `EMAIL_HOST` | ❌ | SMTP server host |
| `EMAIL_PORT` | ❌ | SMTP server port |
| `EMAIL_USER` | ❌ | Email sender address |
| `EMAIL_PASSWORD` | ❌ | Email app password |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |

---

## 🗺️ Roadmap

- [x] 🏠 Landing page with AI showcase
- [x] 🔐 User authentication (Login/Register/Forgot Password)
- [x] 📊 Comprehensive dashboard with 8 feature modules
- [x] 📤 Medical record upload with categorization
- [x] 🤖 AI Health Assistant powered by Gemini
- [x] 💊 Medicine reminders & appointment tracking
- [x] 🚨 Emergency mode with SOS
- [x] 📅 Health timeline visualization
- [x] ⌚ Wearables integration UI
- [x] 🔗 Secure report sharing with time-limited links
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 📊 Advanced analytics dashboard
- [ ] 🔔 Push notifications for reminders
- [ ] 🌍 Multi-language support
- [ ] 📱 Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Update documentation for new features
- Test your changes before submitting

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abhinendra Singh**
**Ashmit Thakur**
<p>
  <a href="https://github.com/abhinendra9792">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>
<p>
  <a href="https://github.com/AshmitThakur23">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---

## 🙏 Acknowledgements

- [Google Gemini AI](https://ai.google.dev/) — AI-powered medical report analysis
- [React](https://react.dev/) — Frontend UI library
- [Vite](https://vitejs.dev/) — Next-generation build tool
- [Express.js](https://expressjs.com/) — Node.js web framework
- [PostgreSQL](https://www.postgresql.org/) — Open-source relational database

---

<p align="center">
  <strong>⭐ If you found this project useful, please give it a star!</strong>
</p>

<p align="center">
  Made with ❤️ for better healthcare management
</p>
