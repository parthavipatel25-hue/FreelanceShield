const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Render PostgreSQL connections require SSL.
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

pool.query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => {
    console.error("❌ Database Connection Error:", err.message);
  });

module.exports = pool;
