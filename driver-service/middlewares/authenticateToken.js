
const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(request, response, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return response.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return response.status(403).json({ message: "Invalid token" });
    }
    request.user = user;
    next();
  });
}

module.exports = authenticateToken;
