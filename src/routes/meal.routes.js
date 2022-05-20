const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");

// Meal End-points
// create a meal
router.post("/api/meal", mealController.validateMeal ,mealController.addMeal);

// get all meals
router.get("/api/meal", mealController.getAllMeals);

// get meal by id
router.get("/api/meal/:id", mealController.getMealById);

module.exports = router;
