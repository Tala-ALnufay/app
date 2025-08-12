const express = require("express");
const { createProxyServer } = require("http-proxy");

const router = express.Router();
const proxy = createProxyServer();

// توجيه الطلبات الخاصة بالسائقين إلى سيرفر السائقين
router.use("/api/drivers", (request, response) => {
  proxy.web(request, response, {
   target: "http://127.0.0.1:3002"
, // تأكد من أن هذا هو البورت الصحيح لسيرفر السائقين
    changeOrigin: true
  }, (error) => {
    console.error("Driver Service Proxy Error:", error);
    response.status(500).send("Driver Service Proxy Error");
  });
});

// توجيه الطلبات الخاصة بالركاب إلى سيرفر الركاب
router.use("/api/riders", (request, response) => {
  proxy.web(request, response, {
    target: "http://localhost:3003", // تأكد من أن هذا هو البورت الصحيح لسيرفر الركاب
    changeOrigin: true
  }, (error) => {
    console.error("Rider Service Proxy Error:", error);
    response.status(500).send("Rider Service Proxy Error");
  });
});

// توجيه الطلبات الخاصة بالرحلات إلى سيرفر الرحلات
router.use("/api/trips", (request, response) => {
  proxy.web(request, response, {
    target: "http://localhost:3001", // تأكد من أن هذا هو البورت الصحيح لسيرفر الرحلات
    changeOrigin: true
  }, (error) => {
    console.error("Trip Service Proxy Error:", error);
    response.status(500).send("Trip Service Proxy Error");
  });
});

module.exports = router;