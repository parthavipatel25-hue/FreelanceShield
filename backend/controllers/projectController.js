const pool = require("../config/db");

// ============================================
// CREATE PROJECT
// ============================================

const createProject = async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      category,
      skills,
      budget,
      budget_type,
      deadline,
    } = req.body;

    console.log("=================================");
    console.log("CREATE PROJECT");
    console.log("BODY:", req.body);
    console.log("=================================");

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !user_id ||
      !title ||
      !description ||
      !category ||
      !budget ||
      !budget_type ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ============================================
    // CHECK CLIENT PROFILE
    // ============================================

    const clientResult = await pool.query(
      `
      SELECT
        cp.id AS client_id,
        u.id AS user_id,
        u.role
      FROM client_profiles cp
      JOIN users u
        ON cp.user_id = u.id
      WHERE cp.user_id = $1
      `,
      [user_id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found. Please create your profile first.",
      });
    }

    // ============================================
    // CHECK ROLE
    // ============================================

    if (clientResult.rows[0].role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create projects.",
      });
    }

    // ============================================
    // CLIENT PROFILE ID
    // ============================================

    const client_id = clientResult.rows[0].client_id;

    // ============================================
    // SKILLS
    // ============================================

    const projectSkills = Array.isArray(skills)
      ? skills.join(", ")
      : skills?.trim() || null;

    // ============================================
    // INSERT PROJECT
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO projects (
        client_id,
        title,
        description,
        category,
        skills,
        budget,
        budget_type,
        deadline
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
      `,
      [
        client_id,
        title.trim(),
        description.trim(),
        category.trim(),
        projectSkills,
        budget,
        budget_type,
        deadline,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

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

// ============================================
// GET CLIENT PROJECTS
// ============================================

const getClientProjects = async (req, res) => {
  try {
    const { user_id } = req.params;

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
    // CHECK CLIENT PROFILE
    // ============================================

    const clientResult = await pool.query(
      `
      SELECT id
      FROM client_profiles
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found.",
      });
    }

    const client_id = clientResult.rows[0].id;

    // ============================================
    // GET PROJECTS
    // ============================================

    const result = await pool.query(
      `
      SELECT *
      FROM projects
      WHERE client_id = $1
      ORDER BY id DESC
      `,
      [client_id]
    );

    return res.status(200).json({
      success: true,
      projects: result.rows,
    });

  } catch (error) {
    console.error("GET CLIENT PROJECTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE PROJECT
// ============================================

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.*,
        cp.user_id
      FROM projects p
      JOIN client_profiles cp
        ON p.client_id = cp.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error("GET PROJECT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE PROJECT
// ============================================

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      skills,
      budget,
      budget_type,
      deadline,
    } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !title ||
      !description ||
      !category ||
      budget === undefined ||
      !budget_type ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ============================================
    // CHECK PROJECT
    // ============================================

    const existingProject = await pool.query(
      `
      SELECT id
      FROM projects
      WHERE id = $1
      `,
      [id]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // ============================================
    // SKILLS
    // ============================================

    const projectSkills = Array.isArray(skills)
      ? skills.join(", ")
      : skills?.trim() || null;

    // ============================================
    // UPDATE PROJECT
    // ============================================

    const result = await pool.query(
      `
      UPDATE projects
      SET
        title = $1,
        description = $2,
        category = $3,
        skills = $4,
        budget = $5,
        budget_type = $6,
        deadline = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        title.trim(),
        description.trim(),
        category.trim(),
        projectSkills,
        budget,
        budget_type,
        deadline,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// DELETE PROJECT
// ============================================

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // ============================================
    // CHECK PROJECT
    // ============================================

    const existingProject = await pool.query(
      `
      SELECT id
      FROM projects
      WHERE id = $1
      `,
      [id]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // ============================================
    // DELETE PROJECT
    // ============================================

    await pool.query(
      `
      DELETE FROM projects
      WHERE id = $1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


module.exports = {
  createProject,
  getClientProjects,
  getProjectById,
  updateProject,
  deleteProject,
};