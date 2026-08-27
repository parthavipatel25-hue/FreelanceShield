const pool = require("../config/db");

const fs = require("fs");
const path = require("path");

// ==================================================
// DELETE IMAGE FILE
// ==================================================

const deleteImageFile = (imagePath) => {
  try {
    if (!imagePath) {
      return;
    }

    // Remove leading /
    const cleanPath = imagePath.replace(/^\/+/, "");

    const fullPath = path.join(
      __dirname,
      "..",
      cleanPath
    );

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(
      "DELETE IMAGE FILE ERROR:",
      error
    );
  }
};

// ==================================================
// GET FREELANCER PORTFOLIO
// ==================================================

const getFreelancerPortfolio = async (
  req,
  res
) => {
  try {
    const { freelancerId } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        freelancer_id,
        title,
        description,
        technologies,
        project_link,
        image,
        created_at,
        updated_at
      FROM portfolio
      WHERE freelancer_id = $1
      ORDER BY created_at DESC
      `,
      [freelancerId]
    );

    res.status(200).json({
      success: true,
      portfolios: result.rows,
    });

  } catch (error) {
    console.error(
      "GET FREELANCER PORTFOLIO ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load portfolio.",
    });
  }
};

// ==================================================
// CREATE PORTFOLIO
// ==================================================

const createPortfolio = async (
  req,
  res
) => {
  try {
    const {
      freelancer_id,
      title,
      description,
      technologies,
      project_link,
    } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!freelancer_id) {
      return res.status(400).json({
        success: false,
        message: "Freelancer ID is required.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required.",
      });
    }

    if (
      !description ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Project description is required.",
      });
    }

    // ----------------------------------------------
    // IMAGE
    // ----------------------------------------------

    let imagePath = null;

    if (req.file) {
      imagePath =
        `/uploads/portfolio/${req.file.filename}`;
    }

    // ----------------------------------------------
    // INSERT
    // ----------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO portfolio
      (
        freelancer_id,
        title,
        description,
        technologies,
        project_link,
        image
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        freelancer_id,
        title,
        description,
        technologies,
        project_link,
        image,
        created_at,
        updated_at
      `,
      [
        freelancer_id,
        title.trim(),
        description.trim(),
        technologies &&
        technologies.trim()
          ? technologies.trim()
          : null,
        project_link &&
        project_link.trim()
          ? project_link.trim()
          : null,
        imagePath,
      ]
    );

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    res.status(201).json({
      success: true,
      message:
        "Portfolio project added successfully.",
      portfolio: result.rows[0],
    });

  } catch (error) {
    console.error(
      "CREATE PORTFOLIO ERROR:",
      error
    );

    // Delete uploaded image if database insertion
    // failed
    if (req.file) {
      try {
        const uploadedFile = path.join(
          __dirname,
          "..",
          "uploads",
          "portfolio",
          req.file.filename
        );

        if (fs.existsSync(uploadedFile)) {
          fs.unlinkSync(uploadedFile);
        }
      } catch (fileError) {
        console.error(
          "FAILED TO DELETE UPLOADED FILE:",
          fileError
        );
      }
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to add portfolio project.",
    });
  }
};

// ==================================================
// UPDATE PORTFOLIO
// ==================================================

const updatePortfolio = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      technologies,
      project_link,
      remove_image,
    } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required.",
      });
    }

    if (
      !description ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Project description is required.",
      });
    }

    // ----------------------------------------------
    // GET EXISTING PROJECT
    // ----------------------------------------------

    const existingResult =
      await pool.query(
        `
        SELECT
          id,
          freelancer_id,
          image
        FROM portfolio
        WHERE id = $1
        `,
        [id]
      );

    if (
      existingResult.rows.length === 0
    ) {
      // If an image was uploaded but project
      // doesn't exist, remove it.
      if (req.file) {
        const uploadedFile =
          path.join(
            __dirname,
            "..",
            "uploads",
            "portfolio",
            req.file.filename
          );

        if (
          fs.existsSync(uploadedFile)
        ) {
          fs.unlinkSync(
            uploadedFile
          );
        }
      }

      return res.status(404).json({
        success: false,
        message:
          "Portfolio project not found.",
      });
    }

    const existingProject =
      existingResult.rows[0];

    let imagePath =
      existingProject.image;

    // ----------------------------------------------
    // REMOVE EXISTING IMAGE
    // ----------------------------------------------

    if (
      remove_image === "true"
    ) {
      if (existingProject.image) {
        deleteImageFile(
          existingProject.image
        );
      }

      imagePath = null;
    }

    // ----------------------------------------------
    // NEW IMAGE
    // ----------------------------------------------

    if (req.file) {
      // Delete old image
      if (existingProject.image) {
        deleteImageFile(
          existingProject.image
        );
      }

      imagePath =
        `/uploads/portfolio/${req.file.filename}`;
    }

    // ----------------------------------------------
    // UPDATE DATABASE
    // ----------------------------------------------

    const result = await pool.query(
      `
      UPDATE portfolio
      SET
        title = $1,
        description = $2,
        technologies = $3,
        project_link = $4,
        image = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING
        id,
        freelancer_id,
        title,
        description,
        technologies,
        project_link,
        image,
        created_at,
        updated_at
      `,
      [
        title.trim(),
        description.trim(),

        technologies &&
        technologies.trim()
          ? technologies.trim()
          : null,

        project_link &&
        project_link.trim()
          ? project_link.trim()
          : null,

        imagePath,

        id,
      ]
    );

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    res.status(200).json({
      success: true,
      message:
        "Portfolio project updated successfully.",
      portfolio: result.rows[0],
    });

  } catch (error) {
    console.error(
      "UPDATE PORTFOLIO ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update portfolio project.",
    });
  }
};

// ==================================================
// DELETE PORTFOLIO
// ==================================================

const deletePortfolio = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // ----------------------------------------------
    // GET PROJECT IMAGE
    // ----------------------------------------------

    const existingResult =
      await pool.query(
        `
        SELECT
          id,
          image
        FROM portfolio
        WHERE id = $1
        `,
        [id]
      );

    if (
      existingResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Portfolio project not found.",
      });
    }

    const existingProject =
      existingResult.rows[0];

    // ----------------------------------------------
    // DELETE DATABASE RECORD
    // ----------------------------------------------

    await pool.query(
      `
      DELETE FROM portfolio
      WHERE id = $1
      `,
      [id]
    );

    // ----------------------------------------------
    // DELETE IMAGE
    // ----------------------------------------------

    if (existingProject.image) {
      deleteImageFile(
        existingProject.image
      );
    }

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    res.status(200).json({
      success: true,
      message:
        "Portfolio project deleted successfully.",
    });

  } catch (error) {
    console.error(
      "DELETE PORTFOLIO ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete portfolio project.",
    });
  }
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  getFreelancerPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};