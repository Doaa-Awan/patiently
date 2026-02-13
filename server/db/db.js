const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  try {
    if (isConnected) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Missing MONGODB_URI. Ensure server/.env is loaded before connecting.');
    }

    await mongoose.connect(mongoUri);

    isConnected = true;
    console.log('MongoDB connected via Mongoose');

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (error?.code === 'ECONNREFUSED' && error?.hostname?.startsWith('_mongodb._tcp.')) {
      console.error('Atlas SRV DNS lookup failed. Use Atlas "Standard connection string" or fix local DNS/VPN/firewall settings.');
    }
    process.exit(1);
  }
}

module.exports = { connectDB };
