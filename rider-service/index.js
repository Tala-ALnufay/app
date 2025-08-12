// rider-service/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const riderRoutes = require("./routes/riderRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/riders", riderRoutes);

app.get("/", (request, response) => {
  response.send("Rider Service is running");
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Rider Service running on http://localhost:${PORT}`);
});




