const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");
const { validateEmail } = require("../controllers/user.controller");

// Meal End-points
// create a meal
router.post("/api/meal", authController.validateToken, mealController.validateMeal,  mealController.addMeal);

// get all meals
router.get("/api/meal", mealController.getAllMeals);

// get meal by id
router.get("/api/meal/:id", mealController.getMealById);

// delete meal by id
router.delete("/api/meal/:id",  authController.validateToken,  mealController.deleteMeal);

// update meal by id
router.put("/api/meal/:id",  authController.validateToken, mealController.validateMeal, mealController.updateMeal);

// participate in a meal
router.get("/api/meal/:id/participate", authController.validateToken, mealController.participate);

module.exports = router;
