
const express = require("express");
const router = express.Router();

// هنا يمكنك إضافة أي مسارات خاصة بخدمة الرحلات
router.get("/test", (request, response) => {
  response.send("Trip route is working!");
});

module.exports = router;
