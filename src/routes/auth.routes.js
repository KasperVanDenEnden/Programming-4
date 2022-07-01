const express = require("express");
const router = express.Router()
const authController = require("../controllers/auth.controller")
const userController = require('../controllers/user.controller');

// User End-points
    // login
    router.post("/api/aut/login",userController.checkMail,userController.validateEmail,userController.validatePassword,authController.login);
    
  
  module.exports = router