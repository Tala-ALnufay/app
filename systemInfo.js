const os = require("os");

console.log("System Info:");
console.log("Hostname:", os.hostname());
console.log("OS Type:", os.type());
console.log("Platform:", os.platform());
console.log("Total Memory:", os.totalmem() / 1024 / 1024, "MB");
console.log("Free Memory:", os.freemem() / 1024 / 1024, "MB");
console.log("User Info:", os.userInfo());
