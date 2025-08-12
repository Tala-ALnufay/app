
const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );
}

module.exports = generateToken;
