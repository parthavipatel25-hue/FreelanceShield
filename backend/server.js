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

const app = express();

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================================================
// STATIC UPLOADS
// ==================================================

const uploadsPath = path.join(__dirname, "uploads");

console.log("=================================");
console.log("SERVER DIRECTORY:", __dirname);
console.log("UPLOADS DIRECTORY:", uploadsPath);
console.log("=================================");

app.use("/uploads", express.static(uploadsPath));

// ==================================================
// API ROUTES
// ==================================================

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use(
  "/api/freelancer-profile",
  freelancerProfileRoutes
);

app.use(
  "/api/client-profile",
  clientProfileRoutes
);

app.use(
  "/api/projects",
  projectRoutes
);

// ==================================================
// TEST ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.status(200).send(
    "🚀 FreelanceShield Backend is Running..."
  );
});

// ==================================================
// UPLOAD TEST ROUTE
// ==================================================

app.get("/uploads", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Uploads directory is available.",
    profileUrl: `http://localhost:${
      process.env.PORT || 5000
    }/uploads/profile`,

    resumesUrl: `http://localhost:${
      process.env.PORT || 5000
    }/uploads/resumes`,
  });
});

// ==================================================
// 404 HANDLER
// ==================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message:
      err.message || "Internal Server Error",
  });
});

// ==================================================
// SERVER
// ==================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log("🚀 FreelanceShield Backend Started");
  console.log("==========================================");

  console.log(
    `🚀 Server: http://localhost:${PORT}`
  );

  console.log(
    `📁 Uploads: http://localhost:${PORT}/uploads`
  );

  console.log(
    `🖼️ Profile: http://localhost:${PORT}/uploads/profile`
  );

  console.log(
    `📄 Resumes: http://localhost:${PORT}/uploads/resumes`
  );

  console.log("==========================================");
  console.log("");
});
