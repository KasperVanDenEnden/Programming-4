const express = require("express");
const router = express.Router()
const userController = require('../controllers/user.controller')

// User End-points
  

    // create user
    router.post("/api/user", userController.validateUser, userController.addUser);
    
    // get all users
    router.get("/api/user", userController.getAllUsers);
    
    // get user by id
    router.get("/api/user/:id", userController.getUserById);
    
    // update user by id
    router.put("/api/user/:id", userController.validateUserUpdate, userController.updateUser);
    
    // delete user by id
    router.delete("/api/user/:id",  userController.deleteUser);

    // get user profile when logged in
    router.get("/api/user/profile",  userController.getProfile);


  module.exports = router