const pool = require("../config/db");
const bcrypt = require("bcrypt");

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    // Prevent admin registration
if (role === "admin") {
  return res.status(403).json({
    success: false,
    message: "Admin registration is not allowed.",
  });
}

if (email === "support@freelanceshield.com") {
  return res.status(403).json({
    success: false,
    message: "This email is reserved.",
  });
}

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const result = await pool.query(
      `INSERT INTO users (fullname, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, fullname, email, role, created_at`,
      [fullname, email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful!",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    // Get email and password from frontend
    const { email, password } = req.body;

    // Check if email exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // If email not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Get user details
    const user = result.rows[0];
    // Compare entered password with hashed password
const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(401).json({
    success: false,
    message: "Invalid Password",
  });
}

    console.log("User Found:");
    console.log(user);

    res.status(200).json({
      success: true,
      message: "User Found!",
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
};