const res = require("express/lib/response");
const assert = require('assert')

let meals = [];
let id = 0;

let controller = {

    addMeal:(req,res) => {
        let meal = req.body;
    id++;
    meal = {
      id,
      ...meal,
    };
    meals.push(meal);
    console.log(meals);
    res.status(201).json({
      status: 201,
      result: meal,
    });
    },
    getAllMeals:(req,res) => {
        res.status(202).json({
            status: 202,
            result: meals,
          });
    },
    getMealById:(req,res) => {
        const id = req.params.id;
        let meal = meals.filter((item) => item.id == id);
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
    }

}

module.exports = controller