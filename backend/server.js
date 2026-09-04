const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const freelancerProfileRoutes = require("./routes/freelancerProfileRoutes");
const clientProfileRoutes = require("./routes/clientProfileRoutes");
const projectRoutes = require("./routes/projectRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const contractRoutes = require("./routes/contractRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
const uploadsPath = path.join(__dirname, "uploads");

console.log("SERVER DIRECTORY:", __dirname);
console.log("UPLOADS DIRECTORY:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/freelancer-profile", freelancerProfileRoutes);
app.use("/api/client-profile", clientProfileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/contracts", contractRoutes);

// Test
app.get("/", (req, res) => {
  res.status(200).send("🚀 FreelanceShield Backend is Running...");
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("==========================================");
  console.log("🚀 FreelanceShield Backend Started");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log("==========================================");
});