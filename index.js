const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const res = require("express/lib/response");

app.use(bodyParser.json());

let users = [];
let database = [];
let id = 0;
let userId = 0;
let profile = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method} angeroepen`);
  next();
});

// Meal End-points
// create a meal
app.post("/api/meal", (req, res) => {
  let meal = req.body;
  id++;
  meal = {
    id,
    ...meal,
  };
  database.push(meal);
  console.log(database);
  res.status(201).json({
    status: 201,
    result: meal,
  });
});

// get all meals
app.get("/api/meal", (req, res) => {
  res.status(202).json({
    status: 202,
    result: database,
  });
});

// get meal by id
app.get("/api/meal/:id", (req, res) => {
  const id = req.params.id;
  let meal = database.filter((item) => item.id == id);
  if (meal.length > 0) {
    console.log(meal);
    res.status(200).json({
      status: 200,
      result: meal,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `Meal with ID ${id} not found`,
    });
  }
});

// User End-points
// login
app.post("/api/aut/login", (req, res) => {
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
app.post("/api/user", (req, res) => {
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
app.get("/api/user", (req, res) => {
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
app.get("/api/user/profile", (req, res) => {
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
app.get("/api/user/:id", (req, res) => {
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
app.put("/api/user/:id", (req, res) => {
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
app.delete("/api/user/:id", (req, res) => {
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

// not found End-point
app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
