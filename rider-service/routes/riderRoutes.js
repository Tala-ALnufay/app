
// routes/riderRoutes.js
const express = require("express");
const router = express.Router();

const riderController = require("../controllers/riderController");

// تسجيل مستخدم جديد
router.post("/register", riderController.registerRider);

// تسجيل الدخول
router.post("/login", riderController.loginRider);

module.exports = router;
