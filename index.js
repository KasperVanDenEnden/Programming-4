const express = require("express");
const jwt = require('jsonwebtoken')
const fs = require('fs')
const app = express();
require('dotenv').config()
const port = process.env.PORT
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const userRouter = require('./src/routes/user.routes')
const mealRouter = require('./src/routes/meal.routes')

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method} angeroepen`);
  next();
});

// user routes
app.use(userRouter)

// meal routes
app.use(mealRouter)

app.get("/jwt", (req,res)=>{
  let privateKey = fs.readFileSync('./private.pem', 'utf8')
  let token = jwt.sign({"body" : "stuff"}, privateKey, {algorithm: 'HS256'})
  res.send(token)
})

function isAuthorized(req, res, next) {
  if (typeof req.headers.authorization !== "undefined") {
      // retrieve the authorization header and parse out the
      // JWT using the split function
      let token = req.headers.authorization.split(" ")[1];
      let privateKey = fs.readFileSync('./private.pem', 'utf8');
      // Here we validate that the JSON Web Token is valid and has been 
      // created using the same private pass phrase
      jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
          
          // if there has been an error...
          if (err) {  
              // shut them out!
              res.status(500).json({ error: "Not Authorized" });
              throw new Error("Not Authorized");
          }
          // if the JWT is valid, allow them to hit
          // the intended endpoint
          return next();
      });
  } else {
      // No authorization header exists on the incoming
      // request, return not authorized and throw a new error 
      res.status(500).json({ error: "Not Authorized" });
      throw new Error("Not Authorized");
  }
}


// not found End-point
app.all("*", (req, res) => {
  res.status(404).json({
    status: 401,
    result: "End-point not found",
  });
});


// Error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
