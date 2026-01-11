# Patiently - Health Journal Application

A full-stack health journal application for patients and caregivers to track symptoms and health progress.

## Features

- **JWT Authentication**: Secure user authentication with JWT tokens
- **Role-based Access**: Separate interfaces for patients and caregivers
- **Symptom Tracking**: Record and track symptoms with severity and categories
- **Patient Management**: Caregivers can manage multiple patients
- **Voice & Text Entry**: Multiple input methods for symptom recording

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key-change-in-production
VITE_PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key (optional)
SITE_URL=http://localhost:5173
SITE_TITLE=Patiently
```

4. Seed the database with sample data:
```bash
npm run seed
```

This will create:
- 3 sample patients
- 2 sample caregivers
- 15 symptom entries per patient

**Default login credentials:**
- Patients: `patient1@example.com`, `patient2@example.com`, `patient3@example.com` (password: `password123`)
- Caregivers: `caregiver1@example.com`, `caregiver2@example.com` (password: `password123`)

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

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current authenticated user (protected)

### Users
- `GET /api/users` - Get all users (caregiver only, protected)
- `GET /api/users/:id` - Get user by ID (caregiver only, protected)

### Symptoms
- `POST /api/symptoms/add` - Create symptom entry (protected)
- `GET /api/symptoms/getsymptoms` - Get symptoms for a patient (protected)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are automatically stored in localStorage after login and included in all API requests.

## Database Schema

### User Model
- Email (unique, required)
- Password (hashed with bcrypt)
- Role (patient or caregiver)
- Name, phone, address
- Patient-specific info (date of birth, conditions, medications, emergency contact)
- Timestamps

### Symptom Model
- Patient reference (ObjectId)
- Symptom description
- Category
- Severity (1-10)
- Start time
- Notes
- Timestamps

## Project Structure

```
patiently/
├── server/
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth middleware
│   ├── db/              # Database connection
│   ├── scripts/         # Seed scripts
│   └── server.js        # Main server file
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks (useAuth, etc.)
│   │   ├── utils/       # API utilities
│   │   └── App.jsx      # Main app component
│   └── ...
└── README.md
```

## Security Features

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Protected routes verify authentication
- Role-based authorization (patients can only access their own data)
- Input validation on both client and server

## Development

### Running Seed Script
To reset and seed the database:
```bash
cd server
npm run seed
```

### Environment Variables
Make sure to set a strong `JWT_SECRET` in production. Never commit `.env` files to version control.

## License

ISC
