const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected");
  } catch (error) {
    console.error("MongoDB Atlas connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;