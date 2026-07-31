const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");              // PostgreSQL connection
const authRoutes = require("./routes/authRoutes"); // Authentication routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 FreelanceShield Backend is Running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});