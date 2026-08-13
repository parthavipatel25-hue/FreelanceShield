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
    } = req.body;

    console.log("=================================");
    console.log("CREATE CLIENT PROFILE");
    console.log("BODY:", req.body);
    console.log("=================================");

    // ============================================
    // CHECK USER ID
    // ============================================

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
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
    // INSERT CLIENT PROFILE
    // ALL PROFILE FIELDS ARE OPTIONAL
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
        company_website
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
        $9
      )
      RETURNING *
      `,
      [
        user_id,

        fullname?.trim() || null,

        company_name?.trim() || null,

        industry?.trim() || null,

        city?.trim() || null,

        about?.trim() || null,

        // Profile picture intentionally NULL for now
        null,

        linkedin_url?.trim() || null,

        // Company website is optional
        company_website?.trim() || null,
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
      company_name,
      industry,
      city,
      about,
      linkedin_url,
      company_website,
    } = req.body;

    console.log("=================================");
    console.log("UPDATE CLIENT PROFILE");
    console.log("USER ID:", user_id);
    console.log("BODY:", req.body);
    console.log("=================================");

    // ============================================
    // CHECK USER ID
    // ============================================

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // ============================================
    // CHECK PROFILE EXISTS
    // ============================================

    const existingProfile = await pool.query(
      `
      SELECT id, profile_image, fullname
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
    // UPDATE CLIENT PROFILE
    // ALL PROFILE FIELDS ARE OPTIONAL
    // ============================================

    const result = await pool.query(
      `
      UPDATE client_profiles
      SET
        company_name = $1,
        industry = $2,
        city = $3,
        about = $4,

        -- Keep existing profile image
        profile_image = $5,

        linkedin_url = $6,

        -- Company website is optional
        company_website = $7,

        updated_at = CURRENT_TIMESTAMP

      WHERE user_id = $8

      RETURNING *
      `,
      [
        company_name?.trim() || null,

        industry?.trim() || null,

        city?.trim() || null,

        about?.trim() || null,

        // Keep current profile image
        existingProfile.rows[0].profile_image,

        linkedin_url?.trim() || null,

        // Company website optional
        company_website?.trim() || null,

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