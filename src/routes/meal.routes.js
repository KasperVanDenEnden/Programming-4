const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller")

// Meal End-points
// create a meal
router.post("/api/meal", authController.validateToken,   mealController.validateMeal ,mealController.addMeal);

// get all meals
router.get("/api/meal", authController.validateToken, mealController.getAllMeals);

// get meal by id
router.get("/api/meal/:id", authController.validateToken, authController.checkUserOwnership, mealController.getMealById);

// delete meal by id
router.delete("/api/meal/:id",  authController.validateToken, authController.checkUserOwnership, mealController.deleteMeal);

module.exports = router;
