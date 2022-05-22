const express = require("express");
const router = express.Router()
const authController = require("../controllers/auth.controller")

// User End-points
    // login
    router.post("/api/aut/login", authController.validateLogin ,authController.login);
    
  
  module.exports = router