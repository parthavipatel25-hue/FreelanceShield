const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const freelancerProfileRoutes = require("./routes/freelancerProfileRoutes");
const clientProfileRoutes = require("./routes/clientProfileRoutes");
const projectRoutes = require("./routes/projectRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const contractRoutes = require("./routes/contractRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const userVerificationRoutes = require("./routes/userVerificationRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const adminMonitoringRoutes = require("./routes/adminMonitoringRoutes");
const securityReportRoutes = require("./routes/securityReportRoutes");
const riskRoutes = require("./routes/riskRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as Thunder Client/Postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS BLOCKED ORIGIN:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ======================================================
// BODY PARSING
// ======================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// UPLOADS
// ======================================================

const uploadsPath = path.join(
  __dirname,
  "uploads"
);

console.log(
  "SERVER DIRECTORY:",
  __dirname
);

console.log(
  "UPLOADS DIRECTORY:",
  uploadsPath
);

app.use(
  "/uploads",
  express.static(uploadsPath)
);

// ======================================================
// ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

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

app.use(
  "/api/proposals",
  proposalRoutes
);

app.use(
  "/api/portfolio",
  portfolioRoutes
);

app.use(
  "/api/contracts",
  contractRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/milestones",
  milestoneRoutes
);

app.use(
  "/api/user-verification",
  userVerificationRoutes
);

app.use(
  "/api/activity-logs",
  activityLogRoutes
);

app.use(
  "/api/admin-monitoring",
  adminMonitoringRoutes
);

app.use(
  "/api/security-reports",
  securityReportRoutes
);

app.use(
  "/api/risks",
  riskRoutes
);

app.use(
  "/api/password-reset",
  passwordResetRoutes
);

app.use(
  "/api/admin", 
  dashboardRoutes
);

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.status(200).send(
    "🚀 FreelanceShield Backend is Running..."
  );
});

// ======================================================
// SIMPLE AUTH TEST
// ======================================================

app.get("/api/auth/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route is working.",
  });
});

// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      "=========================================="
    );

    console.log(
      "🚀 FreelanceShield Backend Started"
    );

    console.log(
      `🚀 Server: http://localhost:${PORT}`
    );

    console.log(
      `📁 Uploads: http://localhost:${PORT}/uploads`
    );

    console.log(
      "🔐 Auth: http://localhost:" +
        `${PORT}/api/auth`
    );

    console.log(
      "=========================================="
    );
  }
);