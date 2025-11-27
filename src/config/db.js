const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  try {
    // Connect using Mongoose default behavior for current versions.
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit so nodemon doesn't keep restarting on the same error
    process.exit(1);
  }
};

module.exports = connectDB;
