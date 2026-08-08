const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createFreelancerProfile,
  getFreelancerProfile,
  updateFreelancerProfile,
  getFreelancerProfileCompletion,
} = require("../controllers/freelancerProfileController");

// ==================================================
// UPLOAD DIRECTORIES
// ==================================================

const profileUploadDir = path.join(
  __dirname,
  "../uploads/profile"
);

const resumeUploadDir = path.join(
  __dirname,
  "../uploads/resumes"
);

// ==================================================
// CREATE FOLDERS
// ==================================================

if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, {
    recursive: true,
  });
}

if (!fs.existsSync(resumeUploadDir)) {
  fs.mkdirSync(resumeUploadDir, {
    recursive: true,
  });
}

// ==================================================
// MULTER STORAGE
// ==================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profile_picture") {
      cb(null, profileUploadDir);
      return;
    }

    if (file.fieldname === "resume") {
      cb(null, resumeUploadDir);
      return;
    }

    cb(
      new Error(
        `Unexpected file field: ${file.fieldname}`
      )
    );
  },

  filename: function (req, file, cb) {
    const extension = path.extname(
      file.originalname
    );

    const filename =
      file.fieldname +
      "-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, filename);
  },
});

// ==================================================
// FILE FILTER
// ==================================================

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profile_picture") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed for profile picture."
        )
      );
    }

    return;
  }

  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF files are allowed for resume."
        )
      );
    }

    return;
  }

  cb(
    new Error(
      `Unexpected file field: ${file.fieldname}`
    )
  );
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
// CREATE PROFILE
// ==================================================

router.post(
  "/",
  upload.fields([
    {
      name: "profile_picture",
      maxCount: 1,
    },
    {
      name: "resume",
      maxCount: 1,
    },
  ]),
  createFreelancerProfile
);

// ==================================================
// GET PROFILE
// ==================================================

router.get(
  "/:userId",
  getFreelancerProfile
);

// ==================================================
// UPDATE PROFILE
// ==================================================

router.put(
  "/:userId",
  upload.fields([
    {
      name: "profile_picture",
      maxCount: 1,
    },
    {
      name: "resume",
      maxCount: 1,
    },
  ]),
  updateFreelancerProfile
);

// ==================================================
// PROFILE COMPLETION
// ==================================================

router.get(
  "/:userId/completion",
  getFreelancerProfileCompletion
);

module.exports = router;
