// middlewares/authenticateToken.js
const jwt = require("jsonwebtoken");

function authenticateToken(request, response, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return response.status(403).json({ message: "Invalid token" });
    }
    request.user = user; // ← البيانات المفكوك تشفيرها من التوكن
    next();
  });
}

module.exports = authenticateToken;