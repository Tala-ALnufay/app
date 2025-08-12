
// controllers/riderController.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// تسجيل مستخدم جديد
exports.registerRider = async (request, response) => {
  const { name, email, password, phone } = request.body;
  try {
    const existing = await pool.query("SELECT * FROM riders WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return response.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO riders (name, email, password, phone) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, phone]
    );

    response.status(201).json({ message: "Rider registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    response.status(500).json({ message: "Registration failed" });
  }
};

// تسجيل الدخول
exports.loginRider = async (request, response) => {
  const { email, password } = request.body;
  try {
    const result = await pool.query("SELECT * FROM riders WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Rider not found" });
    }

    const rider = result.rows[0];
    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) {
      return response.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: rider.id, email: rider.email, type: "rider" });
    response.json({
      token,
      rider: {
        id: rider.id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(500).json({ message: "Login failed" });
  }
};
