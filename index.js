const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const userRouter = require('./src/routes/user.routes')

app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Methode ${method} angeroepen`);
  next();
});

app.use(userRouter)

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

// not found End-point
app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
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

module.exports = app
