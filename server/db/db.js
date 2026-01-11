const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {

  try {
    if (isConnected) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

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
}

module.exports = { connectDB };
