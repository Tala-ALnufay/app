const express = require("express");
const app = express();
    var arr = [];
    app.use(express.json());
  app.use(express.static("public"));

app.post("/api",function(request, respone){
console.log(request.body.title);
  respone.json({"method":"post test"});
});
س

app.get("/",function (request, respone) {
     fs.readFile("./data.json", "utf8", function(err, data){
respone.json(JSON.parse(data));
});
});



app.listen(3000, () => {
  console.log("http://localhost:3000");
});


