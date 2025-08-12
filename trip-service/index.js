
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const tripRoutes = require("./routes/tripRoutes");


const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/trips", tripRoutes); //  يبدأ ب api/trips 


app.get("/", (request, respone) => respone.send("Trip Service is running")); 
//لو حطيت كبست ع ال URL يعطيني بالمتصفح trip service is running + قبل ما احط ال api/trips لازم احط هي /


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Trip Service running on port ${PORT}`);
});

