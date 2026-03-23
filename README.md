# 🎓 College Ticket Generation System

An AI-powered full-stack support ticket management system for colleges, built with React, Node.js, MongoDB, OpenAI, and Google Gemini.

## ✨ Features

- **AI-Powered Ticket Analysis** — OpenAI GPT-4 categorizes issues and suggests solutions
- **Multi-Model AI** — Google Gemini provides alternative solution recommendations
- **Smart Department Routing** — Auto-assigns tickets to the right department
- **Role-Based Access** — Students, Department Staff, and Admin roles
- **Real-time Status Tracking** — Track ticket lifecycle from creation to resolution
- **Email Notifications** — Automated emails on ticket creation and updates
- **Analytics Dashboard** — Charts and insights for admins

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| AI | OpenAI GPT-4, Google Gemini |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, mongo-sanitize |

## 📁 Project Structure

```
college-ticket-system/
├── server/                  # Backend API
│   ├── config/database.js   # MongoDB connection
│   ├── models/              # Mongoose models
│   ├── routes/              # Express routers
│   ├── controllers/         # Business logic
│   ├── services/            # AI & email services
│   ├── middleware/          # Auth, validation, errors
│   ├── utils/logger.js      # Winston logger
│   └── server.js            # Entry point
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable components
│       ├── pages/           # Route pages
│       ├── services/        # API & auth services
│       ├── context/         # React context
│       └── App.js           # Root component
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API key
- Google Gemini API key

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Set REACT_APP_API_URL if needed
npm start
```

The app will be available at `http://localhost:3000`.

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `OPENAI_API_KEY` | OpenAI API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `CLIENT_URL` | Frontend URL (for CORS) |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tickets` | List tickets |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Get ticket |
| PUT | `/api/tickets/:id` | Update ticket |
| DELETE | `/api/tickets/:id` | Delete ticket |
| GET | `/api/tickets/:id/solutions` | Get AI solutions |

### Departments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/departments` | List departments |
| POST | `/api/departments` | Create department (admin) |
| GET | `/api/departments/:id` | Get department |
| GET | `/api/departments/:id/tickets` | Department tickets |
| POST | `/api/departments/:id/response` | Add response |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/analytics` | Analytics data |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id` | Update user |

## 👤 User Roles

- **student** — Submit and track their own tickets
- **department_staff** — View and respond to department tickets
- **admin** — Full system access, analytics, user management

## 📄 License

MIT
