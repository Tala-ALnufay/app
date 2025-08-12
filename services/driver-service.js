
const pool = require("../trip-service/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../trip-service/utils/generateToken");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeType = require("../middlewares/authorizeType");

module.exports = function (app) {

//  تسجيل مستخدم جديد (مع تشفير كلمة المرور)
app.post("/api/register", async (request, response) => {
  

   console.log(" Register endpoint hit");
  const { name, email, password,phone } = request.body;               
  const hashedPassword = await bcrypt.hash(password, 10); // تشفير الباسورد يعني قوي و متوازن 

  try {
    const existing = await pool.query("SELECT * FROM driver WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return response.status(400).json({ message: "Email already exists" });//400 error Request
    }

    await pool.query("INSERT INTO driver (name, email, password,phone) VALUES ($1, $2, $3,$4)", [name, email, hashedPassword,phone]);
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
    const result = await pool.query("SELECT * FROM driver WHERE email = $1", [email]);
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
       phone: user.phone 
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(500).json({ message: "Login failed" });// 500 Internal Server Error
  }
});


// (GET) authorizeRole(["admin"]) ما حد بيقدر يعرض كل ال user الا admin
app.get("/api/driver", authenticateToken,authorizeType(["admin"]),async (request, response) => { 
  try {
const result = await pool.query("SELECT id, name, email FROM driver");
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
  const { name, email,phone} = request.body;

  if (!name || !email||!phone) {
    return response.status(400).json({ message: "Name and Email are required" }); //400 error Request
  }

  try { 
    const checkUser = await pool.query("SELECT * FROM driver WHERE id = $1", [userId]);
    if (checkUser.rows.length === 0) {
      return response.status(404).json({ message: "User not found" }); // 404 Not Found
    }
    const result = await pool.query(
      "UPDATE driver SET name = $1, email = $2,phone = $3 WHERE id = $4",
      [name, email,phone,userId]
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
   const checkUser = await pool.query("SELECT * FROM driver WHERE id = $1", [userId]);
    if (checkUser.rows.length === 0) {
      return response.status(404).json({ message: "User not found" });  //404 Not Found
    }
   const result = await pool.query("DELETE FROM driver WHERE id = $1", [userId]);

    response.json({ message: " User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);                                 
    response.status(500).send("Delete failed");// 500 Internal Server Error
  }
});
};
