const express = require("express");
const cors = require("cors");
const Route = require("./routes/route.js");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database Configuration
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "Pet Health Records API is running" });
});

// Routes
app.use("/api", Route);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});