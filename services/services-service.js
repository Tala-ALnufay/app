const { response, request } = require("express");
const pool = require("../trip-service/db");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeType = require("../middlewares/authorizeType");

module.exports = function (app) {

    
  // عرض جميع أنواع الخدمات (متاح للجميع بعد المصادقة)
  app.get("/api/services", authenticateToken, async (request, response) => {
    try {
      const result = await pool.query("SELECT * FROM services");
      response.json(result.rows);
    } catch (error) {
      console.error("Error fetching services:", error);
      response.status(500).send("Database error");
    }
  });

  // إضافة نوع خدمة جديدة (admin فقط)
  app.post("/api/services", authenticateToken, authorizeType(["admin"]), async (request, response) => {
    const { name, price_per_km } = request.body;

    if (!name || !price_per_km) {
      return response.status(400).json({ message: "Name and price_per_km are required" });
    }

    try {
      const result = await pool.query(
        "INSERT INTO services (name, price_per_km) VALUES ($1, $2) RETURNING *",
        [name, price_per_km]
      );

      response.status(201).json({ message: "Service created", service: result.rows[0] });
    } catch (error) {
      console.error("Error creating service:", error);
      response.status(500).send("Failed to create service");
    }
  });

  // تعديل خدمة (admin فقط)
  app.put("/api/services/:id", authenticateToken, authorizeType(["admin"]), async (request, response) => {
    const { id } = request.params;
    const { name, price_per_km } = request.body;

    if (!name || !price_per_km) {
      return response.status(400).json({ message: "Name and price_per_km are required" });
    }

    try {
      const result = await pool.query(
        "UPDATE services SET name = $1, price_per_km = $2 WHERE id = $3 RETURNING *",
        [name, price_per_km, id]
      );

      if (result.rows.length === 0) {
        return response.status(404).json({ message: "Service not found" });
      }

      response.json({ message: "Service updated", service: result.rows[0] });
    } catch (error) {
      console.error("Error updating service:", error);
      response.status(500).send("Failed to update service");
    }
  });

  //حذف خدمة (admin فقط)
  app.delete("/api/services/:id", authenticateToken, authorizeType(["admin"]), async (request, response) => {
    const { id } = request.params;

    try {
      const result = await pool.query("DELETE FROM services WHERE id = $1 RETURNING *", [id]);

      if (result.rows.length === 0) {
        return response.status(404).json({ message: "Service not found" });
      }

      response.json({ message: "Service deleted", service: result.rows[0] });
    } catch (error) {
      console.error("Error deleting service:", error);
      response.status(500).send("Failed to delete service");
    }
  });
};
