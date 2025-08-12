require("dotenv").config();
const express = require("express");
const app = express();
const driverRoutes = require("./routes/driverRoutes");  



//onst setupProxies = require("./routes/proxyRoutes");

app.use(express.json());

app.post('/register', (request, response) => {
  console.log(request.body);  // تأكد أن البيانات توصل
  response.status(201).json({ message: 'Driver registered successfully' });
});


app.use("/api/drivers", driverRoutes);

app.get("/", (request, respone) => {
  respone.send("Driver Service is running");
});



const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Driver Service running on http://localhost:${PORT}`);
});


