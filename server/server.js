//.env config
require('dotenv').config();
const express = require('express');
const app = express();
const { connectDB } = require("./db/db");

//cors to connect to frontend
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:5173'], 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
//   allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json());

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const PORT = process.env.VITE_PORT || 5000;

const userRoutes = require('./routes/userRoutes');

const symptomRoutes = require('./routes/symptomRoutes');

app.use('/api/users', userRoutes);
app.use('/api/symptoms', symptomRoutes);

async function startServer() {
  try {
    const db = await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

if (!OPENROUTER_KEY) {
  console.warn('Warning: OPENROUTER_API_KEY is not set. The /api/openrouter endpoint will return 500 responses until it is configured.');
}

// Basic health endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Proxy endpoint to OpenRouter (using official SDK)
const { OpenRouter } = require('@openrouter/sdk');
const openRouter = new OpenRouter({
  apiKey: OPENROUTER_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
    'X-Title': process.env.SITE_TITLE || 'HealthJournal',
  },
});

app.post('/api/openrouter', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing OPENROUTER_API_KEY' });
  }

  const { model = 'gpt-4o-mini', input, messages } = req.body || {};
  if (!input && !messages) {
    return res.status(400).json({ error: 'Missing "input" or "messages" in request body' });
  }

  const finalMessages = messages || [{ role: 'user', content: input }];

  try {
    const completion = await openRouter.chat.send({
      model,
      messages: finalMessages,
      stream: false,
    });

    // Return full SDK response so the client has access to choices and metadata
    return res.json(completion);
  } catch (err) {
    console.error('OpenRouter SDK request failed:', err?.message || err);
    return res.status(502).json({ error: 'OpenRouter request failed', details: err?.message || String(err) });
  }
});

startServer();
