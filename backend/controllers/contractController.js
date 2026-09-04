const pool = require("../config/db");

// ============================================
// GET CONTRACT BY ID
// ============================================

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Contract ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.project_id,
        c.proposal_id,
        c.client_id,
        c.freelancer_id,
        c.start_date,
        c.end_date,
        c.amount,
        c.status,
        c.created_at,
        c.updated_at,

        -- Project details
        p.title AS project_title,
        p.description AS project_description,
        p.category AS project_category,
        p.status AS project_status,
        p.progress AS project_progress,

        -- Freelancer details
        u.fullname AS freelancer_name,
        u.email AS freelancer_email,

        -- Client profile details
        cp.fullname AS client_name,
        cp.company_name,
        cp.user_id AS client_user_id

      FROM contracts c

      JOIN projects p
        ON c.project_id = p.id

      JOIN users u
        ON c.freelancer_id = u.id

      JOIN client_profiles cp
        ON c.client_id = cp.id

      WHERE c.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    return res.status(200).json({
      success: true,
      contract: result.rows[0],
    });

  } catch (error) {
    console.error("GET CONTRACT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET FREELANCER CONTRACTS
// ============================================

const getFreelancerContracts = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Freelancer ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.project_id,
        c.proposal_id,
        c.client_id,
        c.freelancer_id,
        c.start_date,
        c.end_date,
        c.amount,
        c.status,
        c.created_at,
        c.updated_at,

        -- Project
        p.title AS project_title,
        p.description AS project_description,
        p.category AS project_category,
        p.status AS project_status,
        p.progress AS project_progress,

        -- Client
        cp.fullname AS client_name,
        cp.company_name,
        cp.city AS client_city

      FROM contracts c

      JOIN projects p
        ON c.project_id = p.id

      JOIN client_profiles cp
        ON c.client_id = cp.id

      WHERE c.freelancer_id = $1

      ORDER BY c.id DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      contracts: result.rows,
    });

  } catch (error) {
    console.error("GET FREELANCER CONTRACTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET CLIENT CONTRACTS
// ============================================

const getClientContracts = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.project_id,
        c.proposal_id,
        c.client_id,
        c.freelancer_id,
        c.start_date,
        c.end_date,
        c.amount,
        c.status,
        c.created_at,
        c.updated_at,

        -- Project
        p.title AS project_title,
        p.description AS project_description,
        p.category AS project_category,
        p.status AS project_status,
        p.progress AS project_progress,

        -- Freelancer
        u.fullname AS freelancer_name,
        u.email AS freelancer_email

      FROM contracts c

      JOIN projects p
        ON c.project_id = p.id

      JOIN users u
        ON c.freelancer_id = u.id

      JOIN client_profiles cp
        ON c.client_id = cp.id

      WHERE cp.user_id = $1

      ORDER BY c.id DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      contracts: result.rows,
    });

  } catch (error) {
    console.error("GET CLIENT CONTRACTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE CONTRACT STATUS
// ============================================

const updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Contract ID is required.",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Contract status is required.",
      });
    }

    const allowedStatuses = [
      "active",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid contract status. Allowed values: active, completed, cancelled.",
      });
    }

    const result = await pool.query(
      `
      UPDATE contracts
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status.toLowerCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contract status updated successfully.",
      contract: result.rows[0],
    });

  } catch (error) {
    console.error("UPDATE CONTRACT STATUS ERROR:", error);

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
  getContractById,
  getFreelancerContracts,
  getClientContracts,
  updateContractStatus,
};