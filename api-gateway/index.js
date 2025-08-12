require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createProxyServer } = require("http-proxy");

const proxyRoutes = require("./routes/proxyRoutes"); 
const tripRoutes = require("./routes/tripRoutes");   
const app = express();
const proxy = createProxyServer({});


app.use(cors());
app.use(express.json());


app.use((request, response, next) => {
  console.log(`[Gateway] ${request.method} ${request.originalUrl}`);
  next();
});

app.use(proxyRoutes);


app.use("/api/trips", (request, response) => {
  proxy.web(request, response, {
    target: "http://localhost:3001",
    changeOrigin: true
  }, (error) => {
    console.error("Trip Service Proxy Error:", error);
    response.status(500).send("Trip Service Proxy Error");
  });
});


app.use("/gateway/trips", tripRoutes);


app.get("/", (request, response) => {
  response.send("API Gateway is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
