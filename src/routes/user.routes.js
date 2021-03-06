const express = require("express");
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require("../controllers/auth.controller")

// User End-points

    // authController.validateToken,

    // create user
    router.post("/api/user", userController.validateUser, userController.validateEmail, userController.validatePassword, userController.addUser);
    
    // get all users
    router.get("/api/user", authController.validateToken, userController.getAllUsers);
    
    // get user by id
    router.get("/api/user/:id", authController.validateToken, userController.getUserById);
    
    // update user by id
    router.put("/api/user/:id", authController.validateToken, userController.validatePhoneNumber, userController.validatePassword, userController.validateUserUpdate, userController.updateUser);
    
    // delete user by id
    router.delete("/api/user/:id", authController.validateToken, userController.deleteUser);

    // get user profile when logged in
    router.get("/api/user/profile",  authController.validateToken, userController.getProfile);


  module.exports = router