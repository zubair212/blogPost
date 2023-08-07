const mongoose = require('mongoose');
const {MONGODB_CONNECTION_STRING}=require('../Config/index');


const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with an error code
  }
};

module.exports = connectDB;
