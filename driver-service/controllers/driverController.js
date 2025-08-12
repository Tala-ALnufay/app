const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const {
  createDriver,
  findDriverByEmail,
  updateDriverState,
} = require("../models/driverModel");

// تسجيل سائق جديد
async function registerDriver(request, response) {
  const { name, email, password, phone } = request.body;

  try {
    const existing = await findDriverByEmail(email);
    if (existing) {
      return response.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = await createDriver(name, email, hashedPassword, phone);

    response.status(201).json({
      message: "Driver registered successfully",
      driver,
    });
  } catch (error) {
    console.error("Register Error:", error);
    response.status(500).json({ message: "Registration failed" });
  }
}

// تسجيل الدخول
async function loginDriver(request, response) {
  const { email, password } = request.body;

  try {
    const driver = await findDriverByEmail(email);
    if (!driver) {
      return response.status(404).json({ message: "Driver not found" });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(driver);
    response.json({
      token,
      driver: {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        type: driver.type,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    response.status(500).json({ message: "Login failed" });
  }
}

module.exports = {
  registerDriver,
  loginDriver,
};
