
require("dotenv").config();
const jwt = require("jsonwebtoken");
function authenticateToken(request, respone, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return respone.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return respone.status(403).json({ message: "Invalid token" });
    request.user = user;
    next();
  });
}

module.exports = authenticateToken;
