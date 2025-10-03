const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Add middleware for http proxying
const apiProxy = createProxyMiddleware({
  target: "https://github.com/login/oauth/access_token",
  changeOrigin: true
});
app.use("/login/oauth/access_token", apiProxy);

//app.use((req, res, next) => {
//  res.set("Access-Control-Allow-Origin", "*");
//  next();
//});

app.use(express.static(__dirname));

const listener = app.listen(8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
