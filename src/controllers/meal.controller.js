const res = require("express/lib/response");
const dbconnection = require('../../database/dbconnection')
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
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
      
        // Use the connection
        connection.query(
          "SELECT id, name FROM meal",
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();
      
            // Handle error after the release.
            if (error) throw error;
      
            // Don't use the connection here, it has been returned to the pool.
            console.log("#results = ", results.length);
            res.status(200).json({
              status: 200,
              results: results
            })
      
            // pool.end((err) => {
            //   console.log("pool was closed");
            // });
          }
        );
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