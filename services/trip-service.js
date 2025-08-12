const pool = require("../trip-service/db");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeType = require("../middlewares/authorizeType");
const calculateDistanceKm = require("../trip-service/utils/calculateDistance");

module.exports = function (app) {


// CREATE TRIP ////////////////////////////
app.post("/api/trips", authenticateToken, async (request, response) => { //authorizeRole(["rider"]) بتخلي انه ما حدا يعمل trip الا rider
  const userId = request.user.id;
  const { pick_up,drop_off=null,service_id} = request.body;


 // service
 
 if (  //عشان تكون pick up---required , lon , lat
    !pick_up ||typeof pick_up !== "object" ||
    !("lat" in pick_up) || typeof pick_up.lat !== "number" ||
    !("lon" in pick_up) || typeof pick_up.lon !== "number"
  ) {
    return response.status(400).json({
      message: "Pick-up is required and must be an object with numeric 'lat' and 'lon'"
    });
  }
 if (// عشان تكون ال drop off ----optional , lat , lon
    drop_off !== null && 
    (
      typeof drop_off !== "object" ||
      !("lat" in drop_off) || typeof drop_off.lat !== "number" ||
      !("lon" in drop_off) || typeof drop_off.lon !== "number"
    )
  ) {
    return response.status(400).json({
      message: "Drop-off must be an object with numeric 'lat' and 'lon' if provided"// 400 bad requst
    });
  }



  // التحقق من أن الخدمة موجودة
  if (!service_id) {
    return response.status(400).json({ message: "Service ID is required" });
  }

  try {
    const serviceResult = await pool.query("SELECT * FROM services WHERE id = $1", [service_id]);

    if (serviceResult.rows.length === 0) {
      return response.status(404).json({ message: "Service not found" });
    }

    const pricePerKm = parseFloat(serviceResult.rows[0].price_per_km);


  let distance = 0;

if (drop_off) {
  distance = calculateDistanceKm(
    pick_up.lat, pick_up.lon,
    drop_off.lat, drop_off.lon
  );
}
// حساب السعر
const price = parseFloat((distance * pricePerKm).toFixed(2));

const userType = request.user.type;

   // ادخال trip في DB
    const result = await pool.query(
      "INSERT INTO trips (user_id,pick_up,drop_off,type,service_id,price) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *",
      [userId, pick_up, drop_off,userType,service_id,price]
    );


    response.status(201).json({                         //201 Created
      message: "Trip created successfully",
      trip: result.rows[0]
    });


  } catch (error) {
    console.error("Create Trip Error:", error);
    response.status(500).json({ message: "Failed to create trip" });        //500 Internal Server Error
  }
});
// To Assign To Driver
app.put("/api/trips/assign",authenticateToken, async (request, response) => { // authorizeType(["admin"]) هي عشان بس صاحب التطبيق يعين الرحلات 
  const userId = request.user.id;
  const { trip_id, driver_id } = request.body;

  if (!trip_id || !driver_id) {
    return response.status(400).json({ message: "Trip ID and Driver ID are required" });//400 error Request
  }

  try {
    const tripCheck = await pool.query(
      "SELECT * FROM trips WHERE trip_id = $1",
      [trip_id]
    );

    if (tripCheck.rows.length === 0) {
      return response.status(404).json({ message: "Trip not found or does not belong to user" }); // 404 not found
    }


  const driverCheck = await pool.query("SELECT * FROM users WHERE id = $1 AND type = 'driver'", [driver_id]);

if (driverCheck.rows.length === 0) {
  return response.status(404).json({ message: "Driver not found or is not a driver" }); // 404 not found
}

const driver = driverCheck.rows[0];
 
if (!["available", "completed"].includes(driver.driver_state)){
  return response.status(400).json({ message: "Driver is not available" }); //400 error Request
}

    const result = await pool.query(
      "UPDATE trips SET driver_id = $1, trip_state = 'Accepted' WHERE trip_id = $2 RETURNING *",
      [driver_id, trip_id]
    );
    await pool.query("UPDATE users SET driver_state = 'occupied' WHERE id = $1", [driver_id]); // occupied

    response.json({ message: "Driver assigned successfully", trip: result.rows[0] });

  } catch (error) {
    console.error("Assign Driver Error:", error);
    response.status(500).json({ message: "Failed to assign driver" }); //500 Internal Server Error
  }
});

// GET trips based on type/////////////////////////////
app.get("/api/trips", authenticateToken, async (request, response) => {
  const userId = request.user.id;
  const type = request.user.type;
  //const tripId = request.user.trip_id;
  try {
    let result;

    if (type === "rider") {
      result = await pool.query(
        "SELECT * FROM trips WHERE user_id = $1",
        [userId]
      );
    } else if (type === "driver") {
      result = await pool.query(
        "SELECT * FROM trips WHERE driver_id = $1",
        [userId]
      );
    } else if (type === "admin") {
      result = await pool.query("SELECT * FROM trips ");
    } else {
      return response.status(403).json({ message: "Type not authorized to view trips" }); //403
    }

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Trip not found or access denied" });
    }
 
    response.json(result.rows);
  } catch (error) {
    console.error("Error fetching trips:", error);
    response.status(500).json({ message: "Database error while fetching trips" }); //500 Internal Server Error
  }
});


// Admin Get all trips of rider
app.get("/api/admin/rider-trips/:user_id", authenticateToken, authorizeType(["admin"]), async (request, response) => {
  //const userId = request.user.user_id;
 const userId = request.params.user_id;


  try {
    const result = await pool.query(
      "SELECT * FROM trips WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "No trips found for this rider" });// 404 not found
    }

    response.json(result.rows);
  } catch (error) {
    console.error("Error fetching rider trips:", error);
    response.status(500).json({ message: "Database error while fetching rider trips" }); //500 Internal Server Error 
  }
});

// Admin Get all trips of driver
app.get("/api/admin/driver-trips/:driver_id", authenticateToken, authorizeType(["admin"]), async (request, response) => {
  //const driverId = request.user.driver_id;
 const driver_id = parseInt(request.params.driver_id);
  try {
    const result = await pool.query(
      "SELECT * FROM trips WHERE driver_id = $1",
      [driver_id]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "No trips found for this driver" });
    }

    response.json(result.rows);
  } catch (error) {
    console.error("Error fetching driver trips:", error);
    response.status(500).json({ message: "Database error while fetching driver trips" });
  }
});

// To Complete a Trip and Mark Driver as Available
app.put("/api/trips/complete",authenticateToken, async (request, response) => {
  const { trip_id ,driver_id} = request.body;

  if (!trip_id) {
    return response.status(400).json({ message: "Trip ID is required" });
  }

  try {
    // تحقق أن الرحلة موجودة ومخصصة لهذا السائق
    const tripCheck = await pool.query(
      "SELECT * FROM trips WHERE trip_id = $1 AND driver_id = $2",
      [trip_id, driver_id]
    );

    if (tripCheck.rows.length === 0) {
      return response.status(404).json({ message: "Trip not found or not assigned to this driver" });
    }

    // حدّث الرحلة إلى completed
    await pool.query(
      "UPDATE trips SET trip_state = 'completed' WHERE trip_id = $1",
      [trip_id]
    );

    // رجّع السائق available 
    await pool.query(
      "UPDATE users SET driver_state = 'available' WHERE id = $1",
      [driver_id]
    );

    response.json({ message: "Trip completed and driver is now available" });

  } catch (error) {
    console.error("Complete Trip Error:", error);
    response.status(500).json({ message: "Failed to complete trip" });
  }
});





};