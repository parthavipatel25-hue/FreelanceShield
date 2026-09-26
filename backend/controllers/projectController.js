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
    // CHECK CLIENT VERIFICATION
    // ============================================

    const verificationResult = await pool.query(
      `
      SELECT status
      FROM user_verifications
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (
      verificationResult.rows.length === 0 ||
      verificationResult.rows[0].status !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your profile must be verified before you can create projects.",
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

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

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

    const projectSkills = Array.isArray(skills)
      ? skills.join(", ")
      : skills?.trim() || null;

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
// ============================================

const updateProjectProgress = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { progress, freelancer_id } = req.body;

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

    const progressValue = Number(progress);

    if (
      !Number.isInteger(progressValue) ||
      progressValue < 0 ||
      progressValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Progress must be an integer between 0 and 100.",
      });
    }

    await client.query("BEGIN");

    const projectResult = await client.query(
      `
      SELECT
        p.id,
        p.client_id,
        p.freelancer_id,
        p.title,
        p.status,
        p.progress,
        p.deadline,
        cp.user_id AS client_user_id
      FROM projects p
      JOIN client_profiles cp
        ON p.client_id = cp.id
      WHERE p.id = $1
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

    if (!project.freelancer_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "No freelancer has been assigned to this project.",
      });
    }

    if (
      Number(project.freelancer_id) !==
      Number(freelancer_id)
    ) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this project's progress.",
      });
    }

    if (
      !project.status ||
      project.status.toLowerCase() !== "in_progress"
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Progress can only be updated for projects that are in progress.",
      });
    }

    const milestonesResult = await client.query(
      `
      SELECT
        id,
        progress,
        status
      FROM milestones
      WHERE project_id = $1
      ORDER BY id ASC
      FOR UPDATE
      `,
      [id]
    );

    const milestones = milestonesResult.rows;

    const updatedProject = await client.query(
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

    if (milestones.length > 0) {
      const totalMilestones = milestones.length;

      const baseProgress = Math.floor(
        progressValue / totalMilestones
      );

      let remainder =
        progressValue -
        baseProgress * totalMilestones;

      for (let i = 0; i < totalMilestones; i++) {
        let milestoneProgress = baseProgress;

        if (remainder > 0) {
          milestoneProgress += 1;
          remainder -= 1;
        }

        let milestoneStatus = "in_progress";

        if (milestoneProgress === 0) {
          milestoneStatus = "pending";
        }

        if (milestoneProgress === 100) {
          milestoneStatus = "completed";
        }

        await client.query(
          `
          UPDATE milestones
          SET
            progress = $1,
            status = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          `,
          [
            milestoneProgress,
            milestoneStatus,
            milestones[i].id,
          ]
        );
      }
    }

    await client.query(
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
        project.client_user_id,
        "project_progress_updated",
        "Project Progress Updated",
        `The freelancer updated "${project.title}" progress to ${progressValue}%.`,
        project.id,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Project progress and milestones synchronized successfully.",
      project: updatedProject.rows[0],
      milestones_updated: milestones.length,
      project_progress: progressValue,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError
      );
    }

    console.error(
      "UPDATE PROJECT PROGRESS ERROR:",
      error
    );

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
// COMPLETE PROJECT
// ============================================

const completeProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { freelancer_id } = req.body;

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

    await client.query("BEGIN");

    const projectResult = await client.query(
      `
      SELECT
        p.id,
        p.client_id,
        p.freelancer_id,
        p.title,
        p.status,
        p.progress,
        cp.user_id AS client_user_id
      FROM projects p
      JOIN client_profiles cp
        ON p.client_id = cp.id
      WHERE p.id = $1
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

    if (!project.freelancer_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "No freelancer has been assigned to this project.",
      });
    }

    if (
      Number(project.freelancer_id) !==
      Number(freelancer_id)
    ) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to complete this project.",
      });
    }

    if (project.status !== "in_progress") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Only projects currently in progress can be completed.",
      });
    }

    if (Number(project.progress) < 100) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Project progress must reach 100% before completing the project.",
      });
    }

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

    await client.query(
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
        project.client_user_id,
        "project_completed",
        "Project Completed",
        `The freelancer has completed "${project.title}".`,
        project.id,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Project completed, related contract updated, and client notified.",
      project: updatedProject.rows[0],
      contract:
        updatedContract.rows[0] || null,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError
      );
    }

    console.error(
      "COMPLETE PROJECT ERROR:",
      error
    );

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
// SEARCH & FILTER PROJECTS
// ============================================

const searchProjects = async (req, res) => {
  try {
    const {
      search,
      category,
      skills,
      location,
      budget_type,
    } = req.query;

    let query = `
      SELECT
        p.*,
        cp.user_id AS client_user_id,
        cp.fullname AS client_name,
        u.fullname AS client_user_name,
        u.email AS client_email
      FROM projects p
      JOIN client_profiles cp
        ON p.client_id = cp.id
      JOIN users u
        ON cp.user_id = u.id
      WHERE p.status = 'open'
    `;

    const values = [];
    let parameterIndex = 1;

    if (search && search.trim() !== "") {
      query += `
        AND (
          LOWER(p.title) LIKE LOWER($${parameterIndex})
          OR LOWER(p.description) LIKE LOWER($${parameterIndex})
          OR LOWER(p.category) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(p.skills, '')) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(cp.fullname, '')) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(u.email, '')) LIKE LOWER($${parameterIndex})
        )
      `;

      values.push(`%${search.trim()}%`);
      parameterIndex++;
    }

    if (category && category.trim() !== "") {
      query += `
        AND LOWER(COALESCE(p.category, ''))
          = LOWER($${parameterIndex})
      `;

      values.push(category.trim());
      parameterIndex++;
    }

    if (skills && skills.trim() !== "") {
      query += `
        AND LOWER(COALESCE(p.skills, ''))
          LIKE LOWER($${parameterIndex})
      `;

      values.push(`%${skills.trim()}%`);
      parameterIndex++;
    }

    if (budget_type && budget_type.trim() !== "") {
      query += `
        AND p.budget_type = $${parameterIndex}
      `;

      values.push(budget_type.trim());
      parameterIndex++;
    }

    if (location && location.trim() !== "") {
      query += `
        AND LOWER(COALESCE(cp.city, ''))
          LIKE LOWER($${parameterIndex})
      `;

      values.push(`%${location.trim()}%`);
      parameterIndex++;
    }

    query += `
      ORDER BY p.id DESC
    `;

    const result = await pool.query(
      query,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      projects: result.rows,
    });
  } catch (error) {
    console.error(
      "SEARCH PROJECTS ERROR:",
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
  createProject,
  getClientProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectProgress,
  completeProject,
  searchProjects,
};