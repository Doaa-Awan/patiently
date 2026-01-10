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

const PORT = process.env.VITE_PORT || 5000;

app.get("/api", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

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

startServer();