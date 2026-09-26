const pool = require("../config/db");

// ============================================
// SUBMIT / RESUBMIT VERIFICATION REQUEST
// ============================================

const submitVerificationRequest = async (req, res) => {
  try {
    const { user_id } = req.body;

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

    const user = userResult.rows[0];

    // ============================================
    // ONLY CLIENTS AND FREELANCERS
    // ============================================

    if (!["client", "freelancer"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Only clients and freelancers can submit verification requests.",
      });
    }

    // ============================================
    // CHECK EXISTING VERIFICATION
    // ============================================

    const existingResult = await pool.query(
      `
      SELECT *
      FROM user_verifications
      WHERE user_id = $1
      `,
      [user_id]
    );

    // ============================================
    // ALREADY APPROVED
    // ============================================

    if (
      existingResult.rows.length > 0 &&
      existingResult.rows[0].status === "approved"
    ) {
      return res.status(400).json({
        success: false,
        message: "Your profile is already verified.",
        verification: existingResult.rows[0],
      });
    }

    // ============================================
    // ALREADY PENDING
    // ============================================

    if (
      existingResult.rows.length > 0 &&
      existingResult.rows[0].status === "pending"
    ) {
      return res.status(409).json({
        success: false,
        message: "Your verification request is already pending.",
        verification: existingResult.rows[0],
      });
    }

    // ============================================
    // RESUBMIT AFTER REJECTION
    // ============================================

    if (
      existingResult.rows.length > 0 &&
      existingResult.rows[0].status === "rejected"
    ) {
      const updatedResult = await pool.query(
        `
        UPDATE user_verifications
        SET
          status = 'pending',
          rejection_reason = NULL,
          submitted_at = CURRENT_TIMESTAMP,
          reviewed_at = NULL,
          reviewed_by = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
        `,
        [user_id]
      );

      return res.status(200).json({
        success: true,
        message: "Verification request resubmitted successfully.",
        verification: updatedResult.rows[0],
      });
    }

    // ============================================
    // CREATE NEW REQUEST
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO user_verifications (
        user_id,
        status
      )
      VALUES ($1, 'pending')
      RETURNING *
      `,
      [user_id]
    );

    return res.status(201).json({
      success: true,
      message: "Verification request submitted successfully.",
      verification: result.rows[0],
    });
  } catch (error) {
    console.error("SUBMIT VERIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET VERIFICATION STATUS
// ============================================

const getVerificationStatus = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
        status,
        rejection_reason,
        submitted_at,
        reviewed_at,
        reviewed_by,
        created_at,
        updated_at
      FROM user_verifications
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: "not_submitted",
        verification: null,
      });
    }

    const verification = result.rows[0];

    return res.status(200).json({
      success: true,
      verified: verification.status === "approved",
      status: verification.status,
      verification,
    });
  } catch (error) {
    console.error("GET VERIFICATION STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET PENDING VERIFICATION REQUESTS
// WITH FULL PROFILE DETAILS
// ============================================

const getPendingVerificationRequests = async (req, res) => {
  try {
    const { admin_id } = req.query;

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required.",
      });
    }

    // ============================================
    // CHECK ADMIN
    // ============================================

    const adminResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [admin_id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    if (adminResult.rows[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can review verification requests.",
      });
    }

    // ============================================
    // GET PENDING REQUESTS
    // WITH FULL USER + PROFILE DETAILS
    // ============================================

    const result = await pool.query(
      `
      SELECT
        uv.id,
        uv.user_id,
        uv.status,
        uv.rejection_reason,
        uv.submitted_at,
        uv.reviewed_at,
        uv.reviewed_by,

        -- ========================================
        -- BASIC USER INFORMATION
        -- ========================================

        u.fullname,
        u.email,
        u.role,

        -- ========================================
        -- FREELANCER PROFILE
        -- ========================================

        fp.id AS freelancer_profile_id,
        fp.profile_picture AS freelancer_profile_picture,
        fp.professional_title,
        fp.category,
        fp.city AS freelancer_city,
        fp.skills,
        fp.about AS freelancer_about,
        fp.linkedin_url AS freelancer_linkedin_url,
        fp.github_url,
        fp.google_drive_url,
        fp.resume_url,

        -- ========================================
        -- CLIENT PROFILE
        -- ========================================

        cp.id AS client_profile_id,
        cp.fullname AS client_full_name,
        cp.company_name,
        cp.industry,
        cp.city AS client_city,
        cp.about AS client_about,
        cp.hiring_requirements,
        cp.preferred_skills,
        cp.company_website,
        cp.profile_image AS client_profile_image,
        cp.linkedin_url AS client_linkedin_url,
        cp.github_url AS client_github_url,
        cp.google_drive_url AS client_google_drive_url

      FROM user_verifications uv

      INNER JOIN users u
        ON uv.user_id = u.id

      LEFT JOIN freelancer_profiles fp
        ON fp.user_id = u.id
        AND u.role = 'freelancer'

      LEFT JOIN client_profiles cp
        ON cp.user_id = u.id
        AND u.role = 'client'

      WHERE uv.status = 'pending'

      ORDER BY
        uv.submitted_at ASC,
        uv.id ASC
      `
    );

    // ============================================
    // FORMAT RESPONSE
    // ============================================

    const requests = result.rows.map((request) => {
      const isFreelancer =
        request.role === "freelancer";

      const isClient =
        request.role === "client";

      return {
        // ========================================
        // VERIFICATION INFORMATION
        // ========================================

        id: request.id,

        user_id: request.user_id,

        status: request.status,

        rejection_reason:
          request.rejection_reason,

        submitted_at:
          request.submitted_at,

        reviewed_at:
          request.reviewed_at,

        reviewed_by:
          request.reviewed_by,

        // ========================================
        // USER INFORMATION
        // ========================================

        user: {
          fullname: request.fullname,
          email: request.email,
          role: request.role,
        },

        // ========================================
        // PROFILE TYPE
        // ========================================

        profile_type: request.role,

        // ========================================
        // FREELANCER PROFILE
        // ========================================

        freelancer_profile:
          isFreelancer
            ? {
                id:
                  request.freelancer_profile_id,

                profile_picture:
                  request.freelancer_profile_picture,

                professional_title:
                  request.professional_title,

                category:
                  request.category,

                city:
                  request.freelancer_city,

                skills:
                  request.skills,

                about:
                  request.freelancer_about,

                linkedin_url:
                  request.freelancer_linkedin_url,

                github_url:
                  request.github_url,

                google_drive_url:
                  request.google_drive_url,

                resume_url:
                  request.resume_url,
              }
            : null,

        // ========================================
        // CLIENT PROFILE
        // ========================================

        client_profile:
          isClient
            ? {
                id:
                  request.client_profile_id,

                full_name:
                  request.client_full_name,

                company_name:
                  request.company_name,

                industry:
                  request.industry,

                city:
                  request.client_city,

                about:
                  request.client_about,

                requirements:
                  request.hiring_requirements,

                preferred_skills:
                  request.preferred_skills,

                company_website:
                  request.company_website,

                profile_image:
                  request.client_profile_image,

                linkedin_url:
                  request.client_linkedin_url,

                github_url:
                  request.client_github_url,

                google_drive_url:
                  request.client_google_drive_url,
              }
            : null,
      };
    });

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "GET PENDING VERIFICATION REQUESTS ERROR:",
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
// APPROVE VERIFICATION REQUEST
// ============================================

const approveVerificationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;

    if (!id || !admin_id) {
      return res.status(400).json({
        success: false,
        message: "Verification ID and Admin ID are required.",
      });
    }

    // ============================================
    // CHECK ADMIN
    // ============================================

    const adminResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [admin_id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    if (adminResult.rows[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve verification requests.",
      });
    }

    // ============================================
    // CHECK VERIFICATION REQUEST
    // ============================================

    const verificationResult = await pool.query(
      `
      SELECT *
      FROM user_verifications
      WHERE id = $1
      `,
      [id]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found.",
      });
    }

    const verification = verificationResult.rows[0];

    if (verification.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `This verification request has already been ${verification.status}.`,
        verification,
      });
    }

    // ============================================
    // APPROVE
    // ============================================

    const result = await pool.query(
      `
      UPDATE user_verifications
      SET
        status = 'approved',
        rejection_reason = NULL,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [admin_id, id]
    );

    // ============================================
    // CREATE APPROVAL NOTIFICATION
    // ============================================

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
        verification.user_id,
        "verification_approved",
        "User Verification Approved",
        "Your profile verification request has been approved. You can now use verified user features.",
        verification.id,
      ]
    );

    console.log(
      `VERIFICATION APPROVED NOTIFICATION CREATED FOR USER ${verification.user_id}`
    );

    return res.status(200).json({
      success: true,
      message: "User verification approved successfully.",
      verification: result.rows[0],
    });
  } catch (error) {
    console.error("APPROVE VERIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// REJECT VERIFICATION REQUEST
// ============================================

const rejectVerificationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, rejection_reason } = req.body;

    if (!id || !admin_id) {
      return res.status(400).json({
        success: false,
        message: "Verification ID and Admin ID are required.",
      });
    }

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    // ============================================
    // CHECK ADMIN
    // ============================================

    const adminResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [admin_id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    if (adminResult.rows[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject verification requests.",
      });
    }

    // ============================================
    // CHECK VERIFICATION REQUEST
    // ============================================

    const verificationResult = await pool.query(
      `
      SELECT *
      FROM user_verifications
      WHERE id = $1
      `,
      [id]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found.",
      });
    }

    const verification = verificationResult.rows[0];

    if (verification.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `This verification request has already been ${verification.status}.`,
        verification,
      });
    }

    // ============================================
    // REJECT
    // ============================================

    const result = await pool.query(
      `
      UPDATE user_verifications
      SET
        status = 'rejected',
        rejection_reason = $1,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [
        rejection_reason.trim(),
        admin_id,
        id,
      ]
    );

    // ============================================
    // CREATE REJECTION NOTIFICATION
    // ============================================

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
        verification.user_id,
        "verification_rejected",
        "User Verification Rejected",
        `Your profile verification request was rejected. Reason: ${rejection_reason.trim()}`,
        verification.id,
      ]
    );

    console.log(
      `VERIFICATION REJECTED NOTIFICATION CREATED FOR USER ${verification.user_id}`
    );

    return res.status(200).json({
      success: true,
      message: "User verification rejected successfully.",
      verification: result.rows[0],
    });
  } catch (error) {
    console.error("REJECT VERIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  submitVerificationRequest,
  getVerificationStatus,
  getPendingVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
};