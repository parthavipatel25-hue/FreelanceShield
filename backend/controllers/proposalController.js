const pool = require("../config/db");

// ============================================
// CREATE PROPOSAL
// ============================================

const createProposal = async (req, res) => {
  try {
    const {
      project_id,
      freelancer_id,
      cover_letter,
      proposed_budget,
      delivery_time,
    } = req.body;

    console.log("=================================");
    console.log("CREATE PROPOSAL");
    console.log("BODY:", req.body);
    console.log("=================================");

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !project_id ||
      !freelancer_id ||
      !cover_letter ||
      proposed_budget === undefined ||
      !delivery_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ============================================
    // CHECK FREELANCER
    // ============================================

    const freelancerResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [freelancer_id]
    );

    if (freelancerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found.",
      });
    }

    if (freelancerResult.rows[0].role !== "freelancer") {
      return res.status(403).json({
        success: false,
        message: "Only freelancers can submit proposals.",
      });
    }

    // ============================================
    // CHECK PROJECT
    // ============================================

    const projectResult = await pool.query(
      `
      SELECT id, status
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
    // CHECK PROJECT STATUS
    // ============================================

    if (
      projectResult.rows[0].status &&
      projectResult.rows[0].status.toLowerCase() !== "open"
    ) {
      return res.status(400).json({
        success: false,
        message: "This project is no longer accepting proposals.",
      });
    }

    // ============================================
    // CHECK DUPLICATE PROPOSAL
    // ============================================

    const existingProposal = await pool.query(
      `
      SELECT id
      FROM proposals
      WHERE project_id = $1
        AND freelancer_id = $2
      `,
      [project_id, freelancer_id]
    );

    if (existingProposal.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a proposal for this project.",
      });
    }

    // ============================================
    // CREATE PROPOSAL
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO proposals (
        project_id,
        freelancer_id,
        cover_letter,
        proposed_budget,
        delivery_time,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
      `,
      [
        project_id,
        freelancer_id,
        cover_letter.trim(),
        proposed_budget,
        delivery_time,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully.",
      proposal: result.rows[0],
    });

  } catch (error) {
    console.error("CREATE PROPOSAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET FREELANCER PROPOSALS
// ============================================

const getFreelancerProposals = async (req, res) => {
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
        p.*,
        pr.title AS project_title,
        pr.category AS project_category
      FROM proposals p
      JOIN projects pr
        ON p.project_id = pr.id
      WHERE p.freelancer_id = $1
      ORDER BY p.id DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      proposals: result.rows,
    });

  } catch (error) {
    console.error("GET FREELANCER PROPOSALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET PROJECT PROPOSALS
// ============================================

const getProjectProposals = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        p.*,
        u.fullname,
        u.email
      FROM proposals p
      JOIN users u
        ON p.freelancer_id = u.id
      WHERE p.project_id = $1
      ORDER BY p.id DESC
      `,
      [project_id]
    );

    return res.status(200).json({
      success: true,
      proposals: result.rows,
    });

  } catch (error) {
    console.error("GET PROJECT PROPOSALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// ACCEPT PROPOSAL
// ============================================

const acceptProposal = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // ============================================
    // GET PROPOSAL + PROJECT DETAILS
    // ============================================

    const proposalResult = await client.query(
      `
      SELECT
        p.id,
        p.project_id,
        p.freelancer_id,
        p.proposed_budget,
        p.delivery_time,
        p.status,
        pr.client_id,
        pr.status AS project_status,
        pr.deadline
      FROM proposals p
      JOIN projects pr
        ON p.project_id = pr.id
      WHERE p.id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (proposalResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    const proposal = proposalResult.rows[0];

    // ============================================
    // CHECK PROPOSAL STATUS
    // ============================================

    if (proposal.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: `This proposal has already been ${proposal.status}.`,
      });
    }

    // ============================================
    // CHECK PROJECT STATUS
    // ============================================

    if (
      !proposal.project_status ||
      proposal.project_status.toLowerCase() !== "open"
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "This project is no longer available for hiring.",
      });
    }

    // ============================================
    // ACCEPT PROPOSAL
    // ============================================

    const acceptedProposal = await client.query(
      `
      UPDATE proposals
      SET
        status = 'accepted',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    // ============================================
    // ASSIGN FREELANCER TO PROJECT
    // ============================================

    const updatedProject = await client.query(
      `
      UPDATE projects
      SET
        freelancer_id = $1,
        status = 'in_progress',
        progress = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [
        proposal.freelancer_id,
        proposal.project_id,
      ]
    );

    // ============================================
    // CREATE CONTRACT
    // ============================================

    const contractResult = await client.query(
      `
      INSERT INTO contracts (
        project_id,
        proposal_id,
        client_id,
        freelancer_id,
        start_date,
        end_date,
        amount,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        CURRENT_DATE,
        $5,
        $6,
        'active'
      )
      RETURNING *
      `,
      [
        proposal.project_id,
        proposal.id,
        proposal.client_id,
        proposal.freelancer_id,
        proposal.deadline,
        proposal.proposed_budget,
      ]
    );

    // ============================================
    // REJECT OTHER PROPOSALS
    // ============================================

    await client.query(
      `
      UPDATE proposals
      SET
        status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE project_id = $1
        AND id != $2
        AND status = 'pending'
      `,
      [
        proposal.project_id,
        proposal.id,
      ]
    );

    // ============================================
    // COMMIT
    // ============================================

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Proposal accepted, freelancer hired, and contract created successfully.",
      proposal: acceptedProposal.rows[0],
      project: updatedProject.rows[0],
      contract: contractResult.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ACCEPT PROPOSAL ERROR:", error);

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
// REJECT PROPOSAL
// ============================================

const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;

    // ============================================
    // CHECK PROPOSAL
    // ============================================

    const proposalCheck = await pool.query(
      `
      SELECT id, status
      FROM proposals
      WHERE id = $1
      `,
      [id]
    );

    if (proposalCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    // ============================================
    // CHECK STATUS
    // ============================================

    if (proposalCheck.rows[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This proposal has already been ${proposalCheck.rows[0].status}.`,
      });
    }

    // ============================================
    // REJECT PROPOSAL
    // ============================================

    const result = await pool.query(
      `
      UPDATE proposals
      SET
        status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Proposal rejected successfully.",
      proposal: result.rows[0],
    });

  } catch (error) {
    console.error("REJECT PROPOSAL ERROR:", error);

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
  createProposal,
  getFreelancerProposals,
  getProjectProposals,
  acceptProposal,
  rejectProposal,
};