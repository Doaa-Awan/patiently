# Patiently 🩺  
An app that turns daily symptoms into a clear, shareable health timeline so patients and caregivers can communicate more accurately with healthcare providers.

## Why this exists
Patients often forget details, downplay symptoms, or struggle to describe what’s happening (especially with chronic illness, cognitive challenges, or high-stress appointments). **Patiently** helps capture symptoms as they happen and organizes them into a timeline that’s easy to review and share.

---

## Key Features
### 👤 Two modes: Patient & Caregiver
- **Patient mode:** track symptoms for yourself
- **Caregiver mode:** manage symptom tracking for multiple patients (useful for children, seniors, dementia care, etc.)

### 🗓️ Symptom Timeline Builder
- Log symptoms with **date/time, severity, category, and notes**
- View entries grouped by day or as a timeline for quick pattern recognition

### 🤖 AI Summary for Report Generation
Patiently can generate an **AI-written summary** based on logged symptoms to help users prepare for appointments.

**What the AI summary includes (example outputs):**
- Overall symptom trend (improving / worsening / fluctuating)
- Most frequent symptoms + typical severity range
- Notable changes over time (e.g., spikes, recurring patterns)
- A clean “appointment-ready” narrative

> ⚠️ Note: This feature is **not medical advice** and does not diagnose. It’s designed to improve symptom communication.

### 📄 Shareable Report (Optional / Demo-friendly)
- Export a printable or shareable report (e.g., PDF or formatted summary) for a clinic visit or caregiver handoff.

---

## Tech Stack (example)
- **Client:** React + Vite
- **Server:** Node.js + Express
- **Database/Auth:** MongoDB, JWT
- **AI summary:** OpenRouter (gpt-4o-mini)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

## Environment Variables & Local Setup

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:8080

### Server (`server/.env`)
```env
OPENROUTER_API_KEY=your_openrouter_api_key
MONGODB_URI=your_mongodb_connection_string
VITE_API_URL=http://localhost:5173
VITE_PORT=8080

### 1) Clone the repo
### 2) Update the .env files in client and server
### 3) Run 'npm i' from the terminal in the client and server folders
### 4) Run 'npm run dev' in the client and server folders
