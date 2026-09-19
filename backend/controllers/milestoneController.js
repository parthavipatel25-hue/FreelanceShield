const pool = require("../config/db");

// ============================================
// CREATE MILESTONE
// ============================================

const createMilestone = async (req, res) => {
  try {
    const {
      project_id,
      title,
      description,
      amount,
      due_date,
    } = req.body;

    console.log("=================================");
    console.log("CREATE MILESTONE");
    console.log("BODY:", req.body);
    console.log("=================================");

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (!project_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Project ID and milestone title are required.",
      });
    }

    // ============================================
    // CHECK PROJECT
    // ============================================

    const projectResult = await pool.query(
      `
      SELECT
        id,
        client_id,
        freelancer_id,
        status
      FROM projects
      WHERE id = $1
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

    // ============================================
    // CHECK PROJECT STATUS
    // ============================================

    if (
      project.status !== "in_progress" &&
      project.status !== "open"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Milestones can only be created for open or in-progress projects.",
      });
    }

    // ============================================
    // VALIDATE AMOUNT
    // ============================================

    if (
      amount !== undefined &&
      amount !== null &&
      Number(amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Milestone amount cannot be negative.",
      });
    }

    // ============================================
    // CREATE MILESTONE
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO milestones (
        project_id,
        title,
        description,
        amount,
        due_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        project_id,
        title.trim(),
        description?.trim() || null,
        amount ?? null,
        due_date || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully.",
      milestone: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE MILESTONE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET MILESTONES FOR PROJECT
// ============================================

const getProjectMilestones = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    // ============================================
    // CHECK PROJECT
    // ============================================

    const projectResult = await pool.query(
      `
      SELECT
        id,
        progress,
        status
      FROM projects
      WHERE id = $1
      `,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // ============================================
    // GET MILESTONES
    // ============================================

    const result = await pool.query(
      `
      SELECT *
      FROM milestones
      WHERE project_id = $1
      ORDER BY id ASC
      `,
      [project_id]
    );

    return res.status(200).json({
      success: true,
      milestones: result.rows,
      project_progress: projectResult.rows[0].progress,
      project_status: projectResult.rows[0].status,
    });
  } catch (error) {
    console.error("GET PROJECT MILESTONES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE MILESTONE
// ============================================

const getMilestoneById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        m.*,
        p.title AS project_title,
        p.status AS project_status,
        p.progress AS project_progress,
        p.client_id,
        p.freelancer_id
      FROM milestones m
      JOIN projects p
        ON m.project_id = p.id
      WHERE m.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    return res.status(200).json({
      success: true,
      milestone: result.rows[0],
    });
  } catch (error) {
    console.error("GET MILESTONE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE MILESTONE
// ============================================

const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      amount,
      due_date,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required.",
      });
    }

    // ============================================
    // CHECK MILESTONE + PROJECT
    // ============================================

    const existingMilestone = await pool.query(
      `
      SELECT
        m.id,
        m.project_id,
        m.title AS old_title,
        p.title AS project_title,
        p.freelancer_id,
        p.client_id
      FROM milestones m
      JOIN projects p
        ON m.project_id = p.id
      WHERE m.id = $1
      `,
      [id]
    );

    if (existingMilestone.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const milestoneInfo = existingMilestone.rows[0];

    // ============================================
    // REQUIRED TITLE
    // ============================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Milestone title is required.",
      });
    }

    // ============================================
    // VALIDATE AMOUNT
    // ============================================

    if (
      amount !== undefined &&
      amount !== null &&
      Number(amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Milestone amount cannot be negative.",
      });
    }

    // ============================================
    // UPDATE MILESTONE
    // ============================================

    const result = await pool.query(
      `
      UPDATE milestones
      SET
        title = $1,
        description = $2,
        amount = $3,
        due_date = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        title.trim(),
        description?.trim() || null,
        amount ?? null,
        due_date || null,
        id,
      ]
    );

    const updatedMilestone = result.rows[0];

    // ============================================
    // NOTIFY FREELANCER
    // ============================================

    if (milestoneInfo.freelancer_id) {
      try {
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
            milestoneInfo.freelancer_id,
            "milestone_updated",
            "Milestone Updated",
            `The client updated the milestone "${updatedMilestone.title}" in your project "${milestoneInfo.project_title}".`,
            updatedMilestone.id,
          ]
        );
      } catch (notificationError) {
        console.error(
          "CREATE MILESTONE NOTIFICATION ERROR:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully.",
      milestone: updatedMilestone,
    });
  } catch (error) {
    console.error("UPDATE MILESTONE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE MILESTONE PROGRESS
// ============================================
//
// IMPORTANT:
// Milestone progress is now the SOURCE OF TRUTH
// for overall project progress.
//
// Example:
//
// Milestone 1 = 100
// Milestone 2 = 50
// Milestone 3 = 0
//
// Project progress =
// (100 + 50 + 0) / 3
// = 50%
//
// ============================================

const updateMilestoneProgress = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      progress,
      freelancer_id,
    } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required.",
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
        message:
          "Progress must be an integer between 0 and 100.",
      });
    }

    // ============================================
    // START TRANSACTION
    // ============================================

    await client.query("BEGIN");

    // ============================================
    // GET MILESTONE + PROJECT
    // ============================================

    const milestoneResult = await client.query(
      `
      SELECT
        m.id,
        m.project_id,
        m.progress,
        m.status,

        p.freelancer_id,
        p.client_id,
        p.title AS project_title,
        p.status AS project_status,
        p.progress AS project_progress,

        cp.user_id AS client_user_id

      FROM milestones m

      JOIN projects p
        ON m.project_id = p.id

      JOIN client_profiles cp
        ON p.client_id = cp.id

      WHERE m.id = $1

      FOR UPDATE
      `,
      [id]
    );

    if (milestoneResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const milestone = milestoneResult.rows[0];

    // ============================================
    // CHECK ASSIGNED FREELANCER
    // ============================================

    if (!milestone.freelancer_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "No freelancer has been assigned to this project.",
      });
    }

    // ============================================
    // CHECK FREELANCER AUTHORIZATION
    // ============================================

    if (
      Number(milestone.freelancer_id) !==
      Number(freelancer_id)
    ) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this milestone.",
      });
    }

    // ============================================
    // DO NOT ALLOW COMPLETED PROJECT
    // ============================================

    if (milestone.project_status === "completed") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Milestone progress cannot be changed after the project is completed.",
      });
    }

    // ============================================
    // DO NOT ALLOW CANCELLED PROJECT
    // ============================================

    if (milestone.project_status === "cancelled") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Milestone progress cannot be updated for a cancelled project.",
      });
    }

    // ============================================
    // IF PROJECT IS OPEN
    // BUT FREELANCER IS ASSIGNED
    //
    // AUTOMATICALLY MOVE IT TO IN_PROGRESS
    // ============================================

    if (milestone.project_status === "open") {
      await client.query(
        `
        UPDATE projects
        SET
          status = 'in_progress',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [milestone.project_id]
      );

      console.log(
        `Project ${milestone.project_id} automatically changed from open to in_progress.`
      );
    }

    // ============================================
    // DETERMINE MILESTONE STATUS
    // ============================================

    let milestoneStatus = "in_progress";

    if (progressValue === 0) {
      milestoneStatus = "pending";
    }

    if (progressValue === 100) {
      milestoneStatus = "completed";
    }

    // ============================================
    // UPDATE MILESTONE
    // ============================================

    const milestoneUpdate = await client.query(
      `
      UPDATE milestones
      SET
        progress = $1,
        status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [
        progressValue,
        milestoneStatus,
        id,
      ]
    );

    const updatedMilestone =
      milestoneUpdate.rows[0];

    // ============================================
    // CALCULATE OVERALL PROJECT PROGRESS
    // ============================================
    //
    // Average of all milestone progress values.
    //
    // Example:
    //
    // 100 + 50 + 0
    // ---------------
    //       3
    //
    // = 50
    //
    // ============================================

    const projectProgressResult =
      await client.query(
        `
        SELECT
          COUNT(*) AS total_milestones,
          COALESCE(
            ROUND(AVG(progress)),
            0
          ) AS overall_progress
        FROM milestones
        WHERE project_id = $1
        `,
        [milestone.project_id]
      );

    const totalMilestones = Number(
      projectProgressResult.rows[0].total_milestones
    );

    const overallProgress = Number(
      projectProgressResult.rows[0].overall_progress
    );

    // ============================================
    // UPDATE PROJECT PROGRESS
    // ============================================

    await client.query(
      `
      UPDATE projects
      SET
        progress = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [
        overallProgress,
        milestone.project_id,
      ]
    );

    // ============================================
    // NOTIFY CLIENT
    // ============================================

    if (milestone.client_user_id) {
      try {
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
            milestone.client_user_id,
            "milestone_progress_updated",
            "Milestone Progress Updated",
            `The freelancer updated "${updatedMilestone.title}" to ${progressValue}% in "${milestone.project_title}". Overall project progress is now ${overallProgress}%.`,
            milestone.project_id,
          ]
        );
      } catch (notificationError) {
        console.error(
          "CREATE MILESTONE PROGRESS NOTIFICATION ERROR:",
          notificationError
        );
      }
    }

    // ============================================
    // COMMIT TRANSACTION
    // ============================================

    await client.query("COMMIT");

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,
      message:
        "Milestone progress updated and project progress synchronized successfully.",

      milestone: updatedMilestone,

      project_progress: overallProgress,

      total_milestones: totalMilestones,
    });
  } catch (error) {
    // ============================================
    // ROLLBACK
    // ============================================

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError
      );
    }

    console.error(
      "UPDATE MILESTONE PROGRESS ERROR:",
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
// DELETE MILESTONE
// ============================================

const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required.",
      });
    }

    // ============================================
    // CHECK MILESTONE
    // ============================================

    const existingMilestone = await pool.query(
      `
      SELECT
        id,
        project_id
      FROM milestones
      WHERE id = $1
      `,
      [id]
    );

    if (existingMilestone.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    // ============================================
    // DELETE
    // ============================================

    await pool.query(
      `
      DELETE FROM milestones
      WHERE id = $1
      `,
      [id]
    );

    // ============================================
    // RECALCULATE PROJECT PROGRESS
    // ============================================

    const progressResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_milestones,
        COALESCE(
          ROUND(AVG(progress)),
          0
        ) AS overall_progress
      FROM milestones
      WHERE project_id = $1
      `,
      [existingMilestone.rows[0].project_id]
    );

    const overallProgress = Number(
      progressResult.rows[0].overall_progress
    );

    // ============================================
    // UPDATE PROJECT PROGRESS
    // ============================================

    await pool.query(
      `
      UPDATE projects
      SET
        progress = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [
        overallProgress,
        existingMilestone.rows[0].project_id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Milestone deleted successfully.",
      project_progress: overallProgress,
    });
  } catch (error) {
    console.error("DELETE MILESTONE ERROR:", error);

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
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  updateMilestoneProgress,
  deleteMilestone,
};