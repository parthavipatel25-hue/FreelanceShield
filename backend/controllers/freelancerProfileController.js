const pool = require("../config/db");

// ==================================================
// CREATE FREELANCER PROFILE
// ==================================================

const createFreelancerProfile = async (req, res) => {
  try {
    const {
      user_id,
      professional_title,
      category,
      city,
      skills,
      about,
      linkedin_url,
      github_url,
      google_drive_url,
    } = req.body;

    console.log("=================================");
    console.log("CREATE FREELANCER PROFILE");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("=================================");

    // ==================================================
    // NO REQUIRED FIELD VALIDATION
    // ==================================================
    // All profile fields are optional.
    // Only user_id is needed to identify the user.

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // ==================================================
    // GET FILES
    // IMPORTANT:
    // upload.fields() => req.files
    // ==================================================

    const resumeFile =
      req.files?.resume?.[0] || null;

    const profilePictureFile =
      req.files?.profile_picture?.[0] || null;

    // ==================================================
    // CHECK RESUME
    // ==================================================
    // Resume is still required during profile creation.
    // Remove this block too if you want resume to be optional.

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume.",
      });
    }

    console.log(
      "RESUME FILE:",
      resumeFile
    );

    // ==================================================
    // SAVE FILE URL
    // ==================================================

    const resume_url =
      `/uploads/resumes/${resumeFile.filename}`;

    const profile_picture =
      profilePictureFile
        ? `/uploads/profile/${profilePictureFile.filename}`
        : null;

    console.log(
      "RESUME URL:",
      resume_url
    );

    console.log(
      "PROFILE PICTURE URL:",
      profile_picture
    );

    // ==================================================
    // CHECK USER
    // ==================================================

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

    // ==================================================
    // CHECK ROLE
    // ==================================================

    if (
      userResult.rows[0].role !==
      "freelancer"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only freelancers can create freelancer profiles.",
      });
    }

    // ==================================================
    // CHECK EXISTING PROFILE
    // ==================================================

    const existingProfile =
      await pool.query(
        `
        SELECT id
        FROM freelancer_profiles
        WHERE user_id = $1
        `,
        [user_id]
      );

    if (existingProfile.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Freelancer profile already exists.",
      });
    }

    // ==================================================
    // INSERT
    // ==================================================

    const result = await pool.query(
      `
      INSERT INTO freelancer_profiles (
        user_id,
        profile_picture,
        professional_title,
        category,
        city,
        skills,
        about,
        linkedin_url,
        github_url,
        google_drive_url,
        resume_url
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
        $11
      )
      RETURNING *
      `,
      [
        user_id,

        profile_picture,

        professional_title?.trim() || null,

        category?.trim() || null,

        city?.trim() || null,

        skills?.trim() || null,

        about?.trim() || null,

        linkedin_url?.trim() || null,

        github_url?.trim() || null,

        google_drive_url?.trim() || null,

        resume_url,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Freelancer profile created successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE FREELANCER PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ==================================================
// GET FREELANCER PROFILE
// ==================================================

const getFreelancerProfile = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        fp.*,
        u.fullname,
        u.email
      FROM freelancer_profiles fp
      JOIN users u
        ON fp.user_id = u.id
      WHERE fp.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Freelancer profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET FREELANCER PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ==================================================
// UPDATE FREELANCER PROFILE
// ==================================================

const updateFreelancerProfile = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const {
      professional_title,
      category,
      city,
      skills,
      about,
      linkedin_url,
      github_url,
      google_drive_url,
    } = req.body;

    // ==================================================
    // NO REQUIRED FIELD VALIDATION
    // ==================================================
    // All profile fields are optional.

    // ==================================================
    // CHECK PROFILE EXISTS
    // ==================================================

    const existingProfile =
      await pool.query(
        `
        SELECT
          id,
          resume_url,
          profile_picture
        FROM freelancer_profiles
        WHERE user_id = $1
        `,
        [userId]
      );

    if (existingProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Freelancer profile not found.",
      });
    }

    const existing =
      existingProfile.rows[0];

    // ==================================================
    // NEW FILES
    // ==================================================

    const resumeFile =
      req.files?.resume?.[0] || null;

    const profilePictureFile =
      req.files?.profile_picture?.[0] ||
      null;

    // ==================================================
    // KEEP OLD FILE IF NO NEW FILE
    // ==================================================

    const resume_url = resumeFile
      ? `/uploads/resumes/${resumeFile.filename}`
      : existing.resume_url;

    const profile_picture =
      profilePictureFile
        ? `/uploads/profile/${profilePictureFile.filename}`
        : existing.profile_picture;

    // ==================================================
    // UPDATE
    // ==================================================

    const result = await pool.query(
      `
      UPDATE freelancer_profiles
      SET
        profile_picture = $1,
        professional_title = $2,
        category = $3,
        city = $4,
        skills = $5,
        about = $6,
        linkedin_url = $7,
        github_url = $8,
        google_drive_url = $9,
        resume_url = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $11
      RETURNING *
      `,
      [
        profile_picture,

        professional_title?.trim() || null,

        category?.trim() || null,

        city?.trim() || null,

        skills?.trim() || null,

        about?.trim() || null,

        linkedin_url?.trim() || null,

        github_url?.trim() || null,

        google_drive_url?.trim() || null,

        resume_url,

        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Freelancer profile updated successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error(
      "UPDATE FREELANCER PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ==================================================
// PROFILE COMPLETION
// ==================================================

const getFreelancerProfileCompletion =
  async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
        SELECT
          profile_picture,
          professional_title,
          category,
          city,
          skills,
          about,
          linkedin_url,
          github_url,
          google_drive_url,
          resume_url
        FROM freelancer_profiles
        WHERE user_id = $1
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          progress: 0,
        });
      }

      const profile = result.rows[0];

      const fields = [
        profile.profile_picture,
        profile.professional_title,
        profile.category,
        profile.city,
        profile.skills,
        profile.about,
        profile.linkedin_url,
        profile.github_url,
        profile.google_drive_url,
        profile.resume_url,
      ];

      const completedFields =
        fields.filter(
          (field) =>
            field !== null &&
            field !== undefined &&
            String(field).trim() !== ""
        ).length;

      const progress = Math.round(
        (completedFields / fields.length) *
          100
      );

      return res.status(200).json({
        success: true,
        progress,
      });
    } catch (error) {
      console.error(
        "PROFILE COMPLETION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  createFreelancerProfile,
  getFreelancerProfile,
  updateFreelancerProfile,
  getFreelancerProfileCompletion,
};