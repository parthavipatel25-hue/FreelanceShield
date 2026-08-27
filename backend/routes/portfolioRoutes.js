const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  getFreelancerPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../controllers/portfolioController");

// ==================================================
// CREATE UPLOAD DIRECTORY
// ==================================================

const uploadDir = path.join(
  __dirname,
  "../uploads/portfolio"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ==================================================
// MULTER STORAGE
// ==================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ==================================================
// FILE FILTER
// ==================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

// ==================================================
// MULTER
// ==================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ==================================================
// GET FREELANCER PORTFOLIO
// GET /api/portfolio/freelancer/:freelancerId
// ==================================================

router.get(
  "/freelancer/:freelancerId",
  getFreelancerPortfolio
);

// ==================================================
// ADD PORTFOLIO
// POST /api/portfolio
// ==================================================

router.post(
  "/",
  upload.single("image"),
  createPortfolio
);

// ==================================================
// UPDATE PORTFOLIO
// PUT /api/portfolio/:id
// ==================================================

router.put(
  "/:id",
  upload.single("image"),
  updatePortfolio
);

// ==================================================
// DELETE PORTFOLIO
// DELETE /api/portfolio/:id
// ==================================================

router.delete(
  "/:id",
  deletePortfolio
);

module.exports = router;