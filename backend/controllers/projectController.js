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
        message:
          "Client profile not found. Please create your profile first.",
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

    // ============================================
    // GET PROJECT
    // ============================================

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
// UPDATE PROJECT PROGRESS
// Week 8 - Project Tracking
// ============================================

const updateProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, freelancer_id } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    if (progress === undefined || progress === null) {
      return res.status(400).json({
        success: false,
        message: "Progress is required.",
      });
    }

    if (!freelancer_id) {
      return res.status(400).json({
        success: false,
        message: "Freelancer ID is required.",
      });
    }

    // ============================================
    // VALIDATE PROGRESS
    // ============================================

    const progressValue = Number(progress);

    if (
      !Number.isInteger(progressValue) ||
      progressValue < 0 ||
      progressValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Progress must be an integer between 0 and 100.",
      });
    }

    // ============================================
    // GET PROJECT
    // ============================================

    const projectResult = await pool.query(
      `
      SELECT
        id,
        client_id,
        freelancer_id,
        title,
        status,
        progress,
        deadline
      FROM projects
      WHERE id = $1
      `,
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projectResult.rows[0];

    // ============================================
    // CHECK ASSIGNED FREELANCER
    // ============================================

    if (!project.freelancer_id) {
      return res.status(400).json({
        success: false,
        message: "No freelancer has been assigned to this project.",
      });
    }

    // ============================================
    // CHECK FREELANCER AUTHORIZATION
    // ============================================

    if (Number(project.freelancer_id) !== Number(freelancer_id)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this project's progress.",
      });
    }

    // ============================================
    // CHECK PROJECT STATUS
    // ============================================

    if (
      !project.status ||
      project.status.toLowerCase() !== "in_progress"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Progress can only be updated for projects that are in progress.",
      });
    }

    // ============================================
    // UPDATE PROJECT PROGRESS
    // ============================================

    const updatedProject = await pool.query(
      `
      UPDATE projects
      SET
        progress = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [progressValue, id]
    );

    return res.status(200).json({
      success: true,
      message: "Project progress updated successfully.",
      project: updatedProject.rows[0],
    });
  } catch (error) {
    console.error("UPDATE PROJECT PROGRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// COMPLETE PROJECT
// Week 8 - Project Completion
// ============================================

const completeProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { freelancer_id } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    if (!freelancer_id) {
      return res.status(400).json({
        success: false,
        message: "Freelancer ID is required.",
      });
    }

    // ============================================
    // START TRANSACTION
    // ============================================

    await client.query("BEGIN");

    // ============================================
    // GET PROJECT
    // ============================================

    const projectResult = await client.query(
      `
      SELECT
        id,
        client_id,
        freelancer_id,
        status,
        progress
      FROM projects
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (projectResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projectResult.rows[0];

    // ============================================
    // CHECK ASSIGNED FREELANCER
    // ============================================

    if (!project.freelancer_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "No freelancer has been assigned to this project.",
      });
    }

    // ============================================
    // CHECK FREELANCER AUTHORIZATION
    // ============================================

    if (Number(project.freelancer_id) !== Number(freelancer_id)) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to complete this project.",
      });
    }

    // ============================================
    // CHECK PROJECT STATUS
    // ============================================

    if (project.status !== "in_progress") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Only projects currently in progress can be completed.",
      });
    }

    // ============================================
    // CHECK PROJECT PROGRESS
    // ============================================

    if (Number(project.progress) < 100) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Project progress must reach 100% before completing the project.",
      });
    }

    // ============================================
    // UPDATE PROJECT
    // ============================================

    const updatedProject = await client.query(
      `
      UPDATE projects
      SET
        status = 'completed',
        progress = 100,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    // ============================================
    // COMPLETE RELATED CONTRACT
    // ============================================

    const updatedContract = await client.query(
      `
      UPDATE contracts
      SET
        status = 'completed',
        updated_at = CURRENT_TIMESTAMP
      WHERE project_id = $1
        AND status = 'active'
      RETURNING *
      `,
      [id]
    );

    // ============================================
    // COMMIT TRANSACTION
    // ============================================

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Project completed and related contract updated successfully.",
      project: updatedProject.rows[0],
      contract: updatedContract.rows[0] || null,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("ROLLBACK ERROR:", rollbackError);
    }

    console.error("COMPLETE PROJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  } finally {
    client.release();
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

// ============================================
// GET ALL AVAILABLE PROJECTS
// ============================================

const getAllProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.*,
        cp.user_id AS client_user_id
      FROM projects p
      JOIN client_profiles cp
        ON p.client_id = cp.id
      ORDER BY p.id DESC
      `
    );

    return res.status(200).json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("GET ALL PROJECTS ERROR:", error);

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
  createProject,
  getClientProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,

  // Week 8 - Project Tracking
  updateProjectProgress,
  completeProject,
};