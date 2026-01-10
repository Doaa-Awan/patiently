const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require('mongoose');

let isConnected = false;

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {

  try {
    if (isConnected) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }
    // For MongoDB Atlas v7+, use this simplified connection
    await mongoose.connect(process.env.MONGODB_URI);
    
    isConnected = true;
    console.log("✅ MongoDB connected via Mongoose");
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
      isConnected = false;
    });
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  if (!db) {
    await client.connect();
    db = client.db("patientlydb");
    console.log("MongoDB connected");
  }
  return db;
}

module.exports = { connectDB };
