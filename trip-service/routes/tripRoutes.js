// routes/tripRoutes.js
const express = require("express");
const router = express.Router();

const tripController = require("../controllers/tripController");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeType = require("../middlewares/authorizeType");

// إنشاء رحلة جديدة
router.post("/", authenticateToken, tripController.createTrip);

// تعيين سائق لرحلة (admin فقط)
router.put("/assign", authenticateToken, authorizeType(["admin"]), tripController.assignTripToDriver);

// إكمال الرحلة (driver فقط)
router.put("/complete", authenticateToken, authorizeType(["driver"]), tripController.completeTrip);

// جلب الرحلات حسب نوع المستخدم (rider, driver, admin)
router.get("/", authenticateToken, tripController.getTripsByUserType);

// جلب رحلات الراكب (admin فقط) ← الآن من التوكن
router.get("/rider-trips", authenticateToken, authorizeType(["admin"]), tripController.getRiderTrips);

// جلب رحلات السائق (admin فقط)
router.get("/driver-trips", authenticateToken, authorizeType(["admin"]), tripController.getDriverTrips);

module.exports = router;
