# Healthcare Management System

A comprehensive healthcare management system built with Node.js, Express, PostgreSQL, and React.

## Features

- 👥 User Authentication & Authorization
- 🏥 Health Vault for Medical Records
- 👨‍👩‍👧‍👦 Family Member Management
- 🔬 Lab Report Management
- 📄 Medical Report Sharing
- 🔐 Secure Data Storage with JWT

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL Database
- JWT Authentication
- Nodemailer for Email OTP
- Multer for File Uploads

### Frontend
- React
- Vite
- CSS3
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/AshmitThakur23/healthcare.git
cd healthcare
```

2. Install backend dependencies
```bash
npm install
```

3. Create PostgreSQL database
```sql
CREATE DATABASE healthcare_db;
```

4. Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env` with your database credentials and other configurations.

5. Start the backend server
```bash
npm start
```
The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend
```

2. Install frontend dependencies
```bash
npm install
```

3. Start the frontend development server
```bash
npm run dev
```
The application will open at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=healthcare_db
PORT=5000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
healthcare/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Authentication middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Helper utilities
├── frontend/
│   └── src/
│       ├── components/  # React components
│       ├── App.jsx      # Main app component
│       └── main.jsx     # Entry point
├── uploads/             # File uploads directory
├── .env.example         # Example environment variables
├── .gitignore          # Git ignore file
└── package.json        # Backend dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP

### Family Management
- `GET /api/family` - Get family members
- `POST /api/family` - Add family member
- `PUT /api/family/:id` - Update family member
- `DELETE /api/family/:id` - Remove family member

### Reports
- `GET /api/reports` - Get user reports
- `POST /api/reports` - Upload new report
- `GET /api/reports/:id` - Get specific report
- `DELETE /api/reports/:id` - Delete report

### Lab Reports
- `POST /api/lab/login` - Lab login
- `POST /api/lab/reports` - Upload lab report
- `GET /api/lab/reports/:patientId` - Get patient reports

### Share Links
- `POST /api/share` - Generate share link
- `GET /api/share/:token` - Access shared report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Ashmit Thakur - [@AshmitThakur23](https://github.com/AshmitThakur23)

Project Link: [https://github.com/AshmitThakur23/healthcare](https://github.com/AshmitThakur23/healthcare)

## Security

- Never commit `.env` file
- Keep database credentials secure
- Use strong JWT secrets
- Regularly update dependencies

## Support

For support, email ashmitthakur23@example.com or open an issue in the repository.
