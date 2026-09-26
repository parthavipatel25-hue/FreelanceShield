const pool = require("./config/db");

async function createTestUser() {
  try {
    const result = await pool.query(
      `
      INSERT INTO users (fullname, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, fullname, email, role
      `,
      [
        "Verification Test",
        "verificationtest@gmail.com",
        "TestPassword123",
        "freelancer",
      ]
    );

    console.log("TEST USER CREATED:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();