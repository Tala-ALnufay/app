
console.log(" API is loading...");

const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");//عشان ال token
const bcrypt = require("bcrypt");// تشفير ال password
const cors = require("cors"); // تسمح لل fronted ع poort مختلف توصل ع poort ال api
require("dotenv").config();// .env
const app = express();
app.use(express.json());
app.use(cors()); //يسمح لل frontend يتصل بال server

//(Contact the DB)//////////////////////////
const pool = new Pool({
  host: "localhost",
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,  
  port: process.env.DB_PORT
});

//\JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email,type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );
}



// Middleware  للتحقق من التوكن قبل السماح للمستخدم بالوصول 
function authenticateToken(request, response, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return response.status(401).json({ message: "Token required" });//401 unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {                  //jwt.verify().  لفك تشفير التوكن
    if (error) return response.status(403).json({ message: "Invalid token" }); //403 forbiddenمحرم 
    request.user = user;
    next();
  });
}

// Middleware لتحديد من مسموح له الوصول (roles: مثلاً rider أو driver أو admin)
function authorizeType(allowedTypes) {
  return (request, response, next) => {
    if (!allowedTypes.includes(request.user.type)) { // عشان تتحقق هل اله صلاحيه يدخل او لا مثلا اللي مسمحوله ال admin  و هاد rider بحكيله stop
      return response.status(403).json({ message: "Access denied" });//403 forbidden غير مصرح الك
    }
    next();
  };
}
app.get("/test", (request, response) => { // راوت تجريبي
  console.log(" Test route hit");
  response.send("Test route working");
});

app.post("/api/test", (request, response) => {
  console.log("test route hit");
  response.send("test route success");
});

//  تسجيل مستخدم جديد (مع تشفير كلمة المرور)
app.post("/api/register", async (request, response) => {
  

   console.log(" Register endpoint hit");
  const { name, email, password,type = "rider"} = request.body;               
  const hashedPassword = await bcrypt.hash(password, 10); // تشفير الباسورد يعني قوي و متوازن 

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return response.status(400).json({ message: "Email already exists" });//400 error Request
    }

    await pool.query("INSERT INTO users (name, email, password,type) VALUES ($1, $2, $3,$4)", [name, email, hashedPassword,type]);
    response.status(201).json({ message: "User registered successfully" });//201 Created
  } catch (error) {
    console.error("Register error:", error);
    response.status(500).json({ message: "Registration failed" }); // 500 Internal Server Error
  }
});

//  تسجيل الدخول - وإرجاع التوكين
app.post("/api/login", async (request, response) => {
  const { email, password } = request.body;                      

  console.log("Login attempt:", email, password); 
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {return response.status(404).json({ message: "User Not Found" });}//404 Not Found

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return response.status(401).json({ message: "Invalid email or password" });//401 unauthorized

    const token = generateToken(user);
    response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
       type: user.type 
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(500).json({ message: "Login failed" });// 500 Internal Server Error
  }
});

// (GET) authorizeRole(["admin"]) ما حد بيقدر يعرض كل ال user الا admin
app.get("/api/user", authenticateToken,authorizeType(["admin"]),async (request, response) => { 
  try {
const result = await pool.query("SELECT id, name, email FROM users");
    response.json(result.rows);
 } 
    catch (error) {
    console.error(" Error:", error);
    response.status(500).send("Database error"); // 500 Internal Server Error    
    //200 ok
  }
});




// (PUT)////////////////////////////
app.put("/api/user",authenticateToken, async (request, response) => {           
  const userId = request.user.id; //لما فكيت التشفير  للتوكن عن طريق jwt.verify(). فكيناها هيك request.user=user ف ال user هو البيانات اللي فكينا تشفيرها 
  const { name, email } = request.body;

  if (!name || !email) {
    return response.status(400).json({ message: "Name and Email are required" }); //400 error Request
  }

  try {
    const checkUser = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (checkUser.rows.length === 0) {
      return response.status(404).json({ message: "User not found" }); // 404 Not Found
    }
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      [name, email, userId]
    );


    response.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    response.status(500).send("Update failed");// 500 Internal Server Error
  }
});


//(DELETE)////////////////////////
app.delete("/api/user",authenticateToken,authorizeType(["admin"]), async (request, response) => {
  const userId = request.user.id;

  try {
   const checkUser = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (checkUser.rows.length === 0) {
      return response.status(404).json({ message: "User not found" });  //404 Not Found
    }
   const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    response.json({ message: " User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);                                 
    response.status(500).send("Delete failed");// 500 Internal Server Error
  }
});

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = // قانون haversine
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


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



// GET all drivers///////////////////////
app.get("/api/drivers", authenticateToken,authorizeType(["admin"]), async (request, response) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE type = 'driver'");
    response.json(result.rows);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    response.status(500).send("Database error"); 
  }
});
 // تعطيني كل ال drivers  ال available
app.get("/api/available-drivers", authenticateToken, authorizeType(["admin"]), async (request, response) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE type = 'driver' AND driver_state = 'available'");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).send("Database error");
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

app.get("/", (request, response) => {
  response.send("Server is running");
});

 //Server Operation //////////////////////////////
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});