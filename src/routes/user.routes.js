const express = require("express");
const router = express.Router()

let users = [];
let userId = 0;
let profile = 0;

// User End-points
// login
router.post("/api/aut/login", (req, res) => {
    // const email = req.params.emailAdress;
    // const password = req.params.password;
    // let user = users.filter(
    //   (item) => item.password == password && item.emailAdress == emailAdress
    // );
    // if (user.length > 0) {
    //   profile = user.id;
    //   res.status(201).json({
    //     status: 201,
    //     result: user,
    //   });
    // } else {
    //   res.status(401).json({
    //     status: 401,
    //     result: "Wrong credentials",
    //   });
    // }
  });
  
  // create user
  router.post("/api/user", (req, res) => {
    let user = req.body;
    let email = req.body.emailAdress;
    let check = users.filter((item) => item.emailAdress == email);
  
    if (check.length == 0) {
      userId++;
      user = {
        userId,
        ...user,
      };
      users.push(user);
      console.log(users.length);
  
      res.status(201).json({
        status: 201,
        result: `User is added!`,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `Email is not unique!`,
      });
      check = true;
    }
  });
  
  // get all users
  router.get("/api/user", (req, res) => {
    if (users.length > 0) {
      res.status(201).json({
        status: 201,
        result: users,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: "No users exists yet",
      });
    }
  });
  
  // get user profile when logged in
  router.get("/api/user/profile", (req, res) => {
    let user = users.filter((item) => item.id == profile);
    if (user.length > 0) {
      res.status(201).json({
        status: 201,
        result: user,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: "This function is not realised yet!",
        // result: `No profile was found! Make sure you are logged in!`,
      });
    }
  });
  
  // get user by id
  router.get("/api/user/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    let user = users.filter((item) => item.userId == id);
    if (user.length > 0) {
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with ID ${id} not found`,
      });
    }
  });
  
  // update user by id
  router.put("/api/user/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body;
    let check = users.filter((item) => item.userId == id);
  
    if (check.length > 0) {
      let index = users.findIndex((item) => item.userId == id);
      users[index] = body;
      res.status(201).json({
        status: 201,
        result: `Updated user with ID ${id}`,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with ID ${id} not found`,
      });
    }
  });
  
  // delete user by id
  router.delete("/api/user/:id", (req, res) => {
    const id = req.params.id;
    let check = users.filter((item) => item.userId == id);
    console.log(check.length);
  
    if (check.length > 0) {
      users = users.filter((item) => item.userId === id);
      res.status(201).json({
        status: 255,
        result: `User with userId ${id} has been deleted`,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `No user with userID ${id} was found`,
      });
    }
  });

  module.exports = router