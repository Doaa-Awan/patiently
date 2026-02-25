# Patiently — Symptom Tracker for Patients & Caregivers

Managing health symptoms across multiple patients is harder than it should be. Caregivers often rely on memory, scattered notes, or generic note-taking apps that weren't built for medical context. Patiently gives caregivers a single place to log, review, and summarize patient symptoms — and gives patients a way to track their own health over time using voice or text.

> **[Live Demo](#)** | **[Screenshots](#screenshots)**

---

## What It Does

- Caregivers can manage multiple patient profiles from a single account
- Patients and caregivers log symptoms via text or speech-to-text input
- AI-generated summaries (via OpenRouter) surface patterns and changes in condition over time
- Role-based access ensures patients only see their own data; caregivers see all assigned patients
- Severity tracking (1–10 scale) with categories and timestamps for each entry

---

## Screenshots

*[Add screenshots here — patient dashboard, symptom log view, AI summary output]*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| AI | OpenRouter API (symptom summarization) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB connection string (local or Atlas)
- OpenRouter API key (optional — AI summaries will be disabled without it)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
VITE_PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key
SITE_URL=http://localhost:5173
SITE_TITLE=Patiently
```

4. Seed the database with sample data:
```bash
npm run seed
```

> **Note:** The seed script creates demo accounts for local testing only. Default credentials use `password123` — never use these in production.

This creates:
- 3 sample patients
- 2 sample caregivers
- 15 symptom entries per patient

**Demo credentials:**
- Patients: `patient1@example.com`, `patient2@example.com`, `patient3@example.com`
- Caregivers: `caregiver1@example.com`, `caregiver2@example.com`

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login and receive JWT |
| GET | `/api/users/me` | Get current authenticated user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (caregiver only) |
| GET | `/api/users/:id` | Get user by ID (caregiver only) |

### Symptoms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/symptoms/add` | Create a symptom entry |
| GET | `/api/symptoms/getsymptoms` | Get symptoms for a patient |

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Security
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Role-based authorization — patients can only access their own data
- Protected routes verify authentication on every request

---

## Project Structure

```
patiently/
├── server/
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/       # Auth middleware
│   ├── db/              # Database connection
│   ├── scripts/         # Seed scripts
│   └── server.js        # Entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks (useAuth, etc.)
│   │   ├── utils/       # API utilities
│   │   └── App.jsx      # Root component
│   └── ...
└── README.md
```

---
