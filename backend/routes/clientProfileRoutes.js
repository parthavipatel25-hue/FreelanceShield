const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  createClientProfile,
  getClientProfile,
  updateClientProfile,
} = require("../controllers/clientProfileController");

// ============================================
// CREATE UPLOAD DIRECTORY
// ============================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/client-profile"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ============================================
// MULTER STORAGE
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName =
      `client-${Date.now()}-${Math.round(
        Math.random() * 1000000
      )}${extension}`;

    cb(null, uniqueName);
  },
});

// ============================================
// FILE FILTER
// ============================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

// ============================================
// MULTER
// ============================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ============================================
// CLIENT PROFILE ROUTES
// ============================================

// CREATE
router.post(
  "/",
  upload.single("profile_image"),
  createClientProfile
);

// GET
router.get(
  "/:user_id",
  getClientProfile
);

// UPDATE
router.put(
  "/:user_id",
  upload.single("profile_image"),
  updateClientProfile
);

module.exports = router;