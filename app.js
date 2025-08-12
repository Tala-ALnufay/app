/* 
//server http
const http = require("http");
const fs = require("fs");


http.createServer(function (request, response) {
  console.log(request.url);
  

  fs.readFile("./index.html", "utf-8", function (error, data) {
    response.end(data);
  });

}).listen(3000,() => {
  console.log("http://localhost:3000");});

switch (request.url){
  case "/":
    route ="./view/index.html"
    break;
  case "/contact":
    route="./view/index.html" 
  default:
    route ="./view/404.html"
    break;
}*/

