const express = require("express");
const router = express.Router()
const userController = require('../controllers/user.controller')



// User End-points
    // login
    router.post("/api/aut/login", userController.login);
    
    // create user
    router.post("/api/user", userController.validateUser, userController.regexpEmail, userController.regexpPhoneNumber, userController.addUser);
    
    // get all users
    router.get("/api/user", userController.getAllUsers);
    
    // get user by id
    router.get("/api/user/:id", userController.validateIdInput, userController.getUserById);
    
    // update user by id
    router.put("/api/user/:id", userController.validateIdInput, userController.updateUser);
    
    // delete user by id
    router.delete("/api/user/:id", userController.validateIdInput, userController.deleteUser);

    // get user profile when logged in
    router.get("/api/user/profile", isAuthorized, userController.getProfile);


    function isAuthorized(req, res, next) {
      if (typeof req.headers.authorization !== "undefined") {
          // retrieve the authorization header and parse out the
          // JWT using the split function
          let token = req.headers.authorization.split(" ")[1];
          let privateKey = fs.readFileSync('../../private.pem', 'utf8');
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

  module.exports = router