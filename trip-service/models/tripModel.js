// models/tripModel.js

const pool = require('../db');  // استيراد الـ pool من ملف db.js

// إنشاء رحلة جديدة
async function createTrip(riderId, driverId, pick_up, drop_off, price, tripState, service_id) {
  const query = `
    INSERT INTO trips (rider_id, driver_id, pick_up, drop_off, price, trip_state, service_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [riderId, driverId, pick_up, drop_off, price, tripState, service_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // إعادة الرحلة المضافة
  } catch (error) {
    console.error("Error in createTrip:", error);
    throw new Error("Error creating trip");
  }
}

// استرجاع جميع الرحلات (على أساس نوع المستخدم)
async function getTrips(userId, type) {
  let query = "";
  const values = [userId];

  if (type === "rider") {
    query = "SELECT * FROM trips WHERE rider_id = $1";
  } else if (type === "driver") {
    query = "SELECT * FROM trips WHERE driver_id = $1";
  } else if (type === "admin") {
    query = "SELECT * FROM trips";
  } else {
    throw new Error("Invalid user type");
  }

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Error in getTrips:", error);
    throw new Error("Error retrieving trips");
  }
}

module.exports = { createTrip, getTrips };
