const mongoose = require('mongoose');

const Mongodb = async () => {
  try {
    await mongoose.connect(process.env.DBConnection);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = Mongodb;
