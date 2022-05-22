const express = require("express");
const router = express.Router()
const authController = require("../controllers/auth.controller")

// User End-points
    // login
    router.post("/api/aut/login", authController.validateLogin, authController.loginRegex ,authController.login);
    
  
  module.exports = router