//.env config
require('dotenv').config();
const express = require('express');
const app = express();

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
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello from the server!" });
});