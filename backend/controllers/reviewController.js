const pool = require("../config/db");

// =====================================================
// CREATE REVIEW
// Client can review a freelancer after project completion
// =====================================================
const createReview = async (req, res) => {
  try {
    const {
      project_id,
      client_id,
      rating,
      review,
    } = req.body;

    // =====================================================
    // CHECK REQUIRED FIELDS
    // =====================================================

    if (!project_id || !client_id || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID, Client ID and rating are required.",
      });
    }

    // =====================================================
    // CHECK RATING
    // =====================================================

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5.",
      });
    }

    // =====================================================
    // GET PROJECT INFORMATION
    // =====================================================

    const projectResult = await pool.query(
      `
      SELECT
        p.id,
        p.client_id,
        p.freelancer_id,
        p.title,
        p.status
      FROM projects p
      WHERE p.id = $1
      `,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projectResult.rows[0];

    // =====================================================
    // PROJECT MUST BE COMPLETED
    // =====================================================

    if (project.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "You can review the freelancer only after project completion.",
      });
    }

    // =====================================================
    // CHECK THAT CLIENT BELONGS TO THIS PROJECT
    // =====================================================

    const clientResult = await pool.query(
      `
      SELECT
        cp.id,
        cp.user_id,
        cp.fullname
      FROM client_profiles cp
      WHERE cp.id = $1
        AND cp.user_id = $2
      `,
      [
        project.client_id,
        client_id,
      ]
    );

    if (clientResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to review this project.",
      });
    }

    const client = clientResult.rows[0];

    // =====================================================
    // MAKE SURE PROJECT HAS A FREELANCER
    // =====================================================

    if (!project.freelancer_id) {
      return res.status(400).json({
        success: false,
        message:
          "No freelancer is assigned to this project.",
      });
    }

    // =====================================================
    // CHECK IF REVIEW ALREADY EXISTS
    // =====================================================

    const existingReview = await pool.query(
      `
      SELECT id
      FROM reviews
      WHERE project_id = $1
      `,
      [project_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This project has already been reviewed.",
      });
    }

    // =====================================================
    // CREATE REVIEW
    // =====================================================

    const result = await pool.query(
      `
      INSERT INTO reviews (
        project_id,
        client_id,
        freelancer_id,
        rating,
        review
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        project_id,
        project.client_id,
        project.freelancer_id,
        rating,
        review || null,
      ]
    );

    // =====================================================
    // CREATE NOTIFICATION FOR FREELANCER
    // =====================================================

    await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        reference_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        project.freelancer_id,
        "review_received",
        "New Review Received",
        `${client.fullname || "A client"} reviewed your work on "${project.title}" with ${rating} star${rating == 1 ? "" : "s"}.`,
        project.id,
      ]
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully and freelancer notified.",
      review: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE REVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// GET REVIEW FOR A PROJECT
// =====================================================
const getProjectReview = async (req, res) => {
  try {
    const { project_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.*,
        cp.fullname AS client_name,
        u.fullname AS freelancer_name
      FROM reviews r
      JOIN client_profiles cp
        ON r.client_id = cp.id
      JOIN users u
        ON r.freelancer_id = u.id
      WHERE r.project_id = $1
      `,
      [project_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No review found for this project.",
      });
    }

    return res.status(200).json({
      success: true,
      review: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET PROJECT REVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL REVIEWS FOR A FREELANCER
// =====================================================
const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancer_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.id,
        r.project_id,
        r.rating,
        r.review,
        r.created_at,
        cp.fullname AS client_name,
        p.title AS project_title
      FROM reviews r
      JOIN client_profiles cp
        ON r.client_id = cp.id
      JOIN projects p
        ON r.project_id = p.id
      WHERE r.freelancer_id = $1
      ORDER BY r.created_at DESC
      `,
      [freelancer_id]
    );

    return res.status(200).json({
      success: true,
      reviews: result.rows,
    });
  } catch (error) {
    console.error(
      "GET FREELANCER REVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// GET FREELANCER AVERAGE RATING
// =====================================================
const getFreelancerRating = async (req, res) => {
  try {
    const { freelancer_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        COUNT(*) AS total_reviews,
        COALESCE(
          ROUND(AVG(rating), 1),
          0
        ) AS average_rating
      FROM reviews
      WHERE freelancer_id = $1
      `,
      [freelancer_id]
    );

    return res.status(200).json({
      success: true,
      rating: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET FREELANCER RATING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createReview,
  getProjectReview,
  getFreelancerReviews,
  getFreelancerRating,
};