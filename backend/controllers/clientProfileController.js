const pool = require("../config/db");

// ============================================
// CREATE CLIENT PROFILE
// ============================================

const createClientProfile = async (req, res) => {
  try {
    const {
      user_id,
      fullname,
      company_name,
      industry,
      city,
      about,
      linkedin_url,
      company_website,
      github_url,
      google_drive_url,
      hiring_requirements,
      preferred_skills,
    } = req.body;

    console.log("=================================");
    console.log("CREATE CLIENT PROFILE");
    console.log("BODY:", req.body);
    console.log("=================================");

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !user_id ||
      !fullname ||
      !industry ||
      !city ||
      !about ||
      !linkedin_url
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ============================================
    // CHECK USER
    // ============================================

    const userResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ============================================
    // CHECK ROLE
    // ============================================

    if (userResult.rows[0].role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create client profiles.",
      });
    }

    // ============================================
    // CHECK EXISTING PROFILE
    // ============================================

    const existingProfile = await pool.query(
      `
      SELECT id
      FROM client_profiles
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Client profile already exists.",
      });
    }

    // ============================================
    // ARRAY DATA
    // ============================================

    const requirements = Array.isArray(
      hiring_requirements
    )
      ? hiring_requirements
      : [];

    const skills = Array.isArray(
      preferred_skills
    )
      ? preferred_skills
      : [];

    // ============================================
    // INSERT
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO client_profiles (
        user_id,
        fullname,
        company_name,
        industry,
        city,
        about,
        profile_image,
        linkedin_url,
        company_website,
        github_url,
        google_drive_url,
        hiring_requirements,
        preferred_skills
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13
      )
      RETURNING *
      `,
      [
        user_id,
        fullname.trim(),
        company_name?.trim() || null,
        industry.trim(),
        city.trim(),
        about.trim(),

        // Profile picture intentionally NULL for now
        null,

        linkedin_url.trim(),
        company_website?.trim() || null,
        github_url?.trim() || null,
        google_drive_url?.trim() || null,

        requirements,
        skills,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Client profile created successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE CLIENT PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET CLIENT PROFILE
// ============================================

const getClientProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        cp.*,
        u.fullname AS user_fullname,
        u.email
      FROM client_profiles cp
      JOIN users u
        ON cp.user_id = u.id
      WHERE cp.user_id = $1
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET CLIENT PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE CLIENT PROFILE
// ============================================

const updateClientProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const {
      fullname,
      company_name,
      industry,
      city,
      about,
      linkedin_url,
      company_website,
      github_url,
      google_drive_url,
      hiring_requirements,
      preferred_skills,
    } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !fullname ||
      !industry ||
      !city ||
      !about ||
      !linkedin_url
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ============================================
    // CHECK PROFILE EXISTS
    // ============================================

    const existingProfile = await pool.query(
      `
      SELECT id, profile_image
      FROM client_profiles
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (existingProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found.",
      });
    }

    // ============================================
    // ARRAY DATA
    // ============================================

    const requirements = Array.isArray(
      hiring_requirements
    )
      ? hiring_requirements
      : [];

    const skills = Array.isArray(
      preferred_skills
    )
      ? preferred_skills
      : [];

    // ============================================
    // UPDATE
    // ============================================

    const result = await pool.query(
      `
      UPDATE client_profiles
      SET
        fullname = $1,
        company_name = $2,
        industry = $3,
        city = $4,
        about = $5,

        -- Keep profile image unchanged
        profile_image = $6,

        linkedin_url = $7,
        company_website = $8,
        github_url = $9,
        google_drive_url = $10,
        hiring_requirements = $11,
        preferred_skills = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $13
      RETURNING *
      `,
      [
        fullname.trim(),
        company_name?.trim() || null,
        industry.trim(),
        city.trim(),
        about.trim(),

        // Keep current profile image
        existingProfile.rows[0].profile_image,

        linkedin_url.trim(),
        company_website?.trim() || null,
        github_url?.trim() || null,
        google_drive_url?.trim() || null,

        requirements,
        skills,
        user_id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Client profile updated successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "UPDATE CLIENT PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
  createClientProfile,
  getClientProfile,
  updateClientProfile,
};
